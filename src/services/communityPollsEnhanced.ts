import { supabase } from '@/integrations/supabase/client';
import { anonymousUserService } from './anonymousUserService';

export interface CommunityPoll {
  id: string;
  post_id?: string;
  anonymous_post_id?: string;
  user_id?: string;
  session_id?: string;
  question: string;
  description?: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
    color?: string;
  }>;
  total_votes: number;
  is_multiple_choice: boolean;
  is_anonymous: boolean;
  is_public: boolean;
  expires_at?: string;
  is_active: boolean;
  allow_comments: boolean;
  show_results_before_voting: boolean;
  created_at: string;
  updated_at: string;
  user_vote?: string[];
  has_voted?: boolean;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id?: string;
  session_id?: string;
  option_ids: string[];
  is_anonymous: boolean;
  created_at: string;
}

export interface CreatePollOptions {
  question: string;
  description?: string;
  options: Array<{ text: string; color?: string }>;
  isMultipleChoice?: boolean;
  isAnonymous?: boolean;
  isPublic?: boolean;
  expiresAt?: string;
  allowComments?: boolean;
  showResultsBeforeVoting?: boolean;
  postId?: string;
  anonymousPostId?: string;
}

export interface PollFilterOptions {
  postId?: string;
  anonymousPostId?: string;
  isActive?: boolean;
  isPublic?: boolean;
  isAnonymous?: boolean;
  searchQuery?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export class CommunityPollsEnhanced {
  private static instance: CommunityPollsEnhanced;
  private polls: CommunityPoll[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

  public static getInstance(): CommunityPollsEnhanced {
    if (!CommunityPollsEnhanced.instance) {
      CommunityPollsEnhanced.instance = new CommunityPollsEnhanced();
    }
    return CommunityPollsEnhanced.instance;
  }

  /**
   * Create a new community poll
   */
  async createPoll(options: CreatePollOptions): Promise<CommunityPoll> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = options.isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      const pollOptions = options.options.map((option, index) => ({
        id: `option_${index + 1}`,
        text: option.text,
        votes: 0,
        color: option.color || `hsl(${index * 60}, 70%, 50%)`
      }));

      const pollData = {
        user_id: user?.id,
        session_id: sessionId,
        question: options.question,
        description: options.description,
        options: pollOptions,
        total_votes: 0,
        is_multiple_choice: options.isMultipleChoice || false,
        is_anonymous: options.isAnonymous || false,
        is_public: options.isPublic !== false,
        expires_at: options.expiresAt,
        is_active: true,
        allow_comments: options.allowComments !== false,
        show_results_before_voting: options.showResultsBeforeVoting || false,
        post_id: options.postId,
        anonymous_post_id: options.anonymousPostId
      };

      const { data, error } = await supabase
        .from('polls')
        .insert(pollData)
        .select()
        .single();

      if (error) throw error;

      // Log creation for anonymous polls
      if (options.isAnonymous && sessionId) {
        await this.logAnonymousPollCreation(sessionId, data.id);
      }

      // Clear cache
      this.clearCache();

      return data;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }

  /**
   * Get polls with filtering
   */
  async getPolls(options: PollFilterOptions = {}): Promise<CommunityPoll[]> {
    try {
      let query = supabase
        .from('polls')
        .select(`
          *,
          user_votes:poll_votes!poll_votes_poll_id_fkey(
            option_ids,
            is_anonymous
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.postId) {
        query = query.eq('post_id', options.postId);
      }

      if (options.anonymousPostId) {
        query = query.eq('anonymous_post_id', options.anonymousPostId);
      }

      if (options.isActive !== undefined) {
        query = query.eq('is_active', options.isActive);
      }

      if (options.isPublic !== undefined) {
        query = query.eq('is_public', options.isPublic);
      }

      if (options.isAnonymous !== undefined) {
        query = query.eq('is_anonymous', options.isAnonymous);
      }

      if (options.searchQuery) {
        query = query.or(`question.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`);
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process polls to add user vote information
      const processedPolls = await Promise.all(
        (data || []).map(async (poll) => {
          const userVote = await this.getUserVote(poll.id);
          return {
            ...poll,
            user_vote: userVote?.option_ids,
            has_voted: !!userVote
          };
        })
      );

      return processedPolls;
    } catch (error) {
      console.error('Error fetching polls:', error);
      return [];
    }
  }

  /**
   * Get poll by ID
   */
  async getPollById(id: string): Promise<CommunityPoll | null> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          user_votes:poll_votes!poll_votes_poll_id_fkey(
            option_ids,
            is_anonymous
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Add user vote information
      const userVote = await this.getUserVote(id);
      const processedPoll = {
        ...data,
        user_vote: userVote?.option_ids,
        has_voted: !!userVote
      };

      return processedPoll;
    } catch (error) {
      console.error('Error fetching poll by ID:', error);
      return null;
    }
  }

  /**
   * Vote on a poll (supports both authenticated and anonymous voting)
   */
  async voteOnPoll(
    pollId: string,
    optionIds: string[],
    isAnonymous: boolean = true
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      // Validate poll exists and is active
      const poll = await this.getPollById(pollId);
      if (!poll) {
        throw new Error('Poll not found');
      }

      if (!poll.is_active) {
        throw new Error('Poll is not active');
      }

      if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
        throw new Error('Poll has expired');
      }

      // Validate options exist in poll
      const pollOptionIds = poll.options.map(option => option.id);
      const validOptions = optionIds.every(id => pollOptionIds.includes(id));
      if (!validOptions) {
        throw new Error('Invalid option selected');
      }

      // Check if user already voted
      const existingVote = await this.getUserVote(pollId);
      if (existingVote) {
        throw new Error('You have already voted on this poll');
      }

      // Create the vote
      const voteData = {
        poll_id: pollId,
        user_id: user?.id,
        session_id: sessionId,
        option_ids: optionIds,
        is_anonymous: isAnonymous
      };

      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert(voteData);

      if (voteError) throw voteError;

      // Update poll option vote counts
      const updatePromises = optionIds.map(optionId => {
        const option = poll.options.find(opt => opt.id === optionId);
        if (option) {
          return supabase
            .from('polls')
            .update({
              options: poll.options.map(opt => 
                opt.id === optionId 
                  ? { ...opt, votes: opt.votes + 1 }
                  : opt
              ),
              total_votes: poll.total_votes + 1
            })
            .eq('id', pollId);
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      // Log anonymous voting
      if (isAnonymous && sessionId) {
        await this.logAnonymousPollVote(sessionId, pollId, optionIds);
      }

      // Clear cache
      this.clearCache();

      return true;
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw error;
    }
  }

  /**
   * Get user's vote on a poll
   */
  async getUserVote(pollId: string): Promise<PollVote | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = await anonymousUserService.getCurrentSessionId();

      let query = supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollId);

      if (user?.id) {
        query = query.eq('user_id', user.id);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else {
        return null;
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user vote:', error);
      return null;
    }
  }

  /**
   * Get poll results (with privacy considerations)
   */
  async getPollResults(pollId: string, showDetailedResults: boolean = false): Promise<{
    totalVotes: number;
    options: Array<{
      id: string;
      text: string;
      votes: number;
      percentage: number;
      color?: string;
    }>;
    isAnonymous: boolean;
    userVoted: boolean;
  }> {
    try {
      const poll = await this.getPollById(pollId);
      if (!poll) {
        throw new Error('Poll not found');
      }

      const userVote = await this.getUserVote(pollId);
      const totalVotes = poll.total_votes;

      const results = {
        totalVotes,
        options: poll.options.map(option => ({
          id: option.id,
          text: option.text,
          votes: option.votes,
          percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
          color: option.color
        })),
        isAnonymous: poll.is_anonymous,
        userVoted: !!userVote
      };

      // If poll is anonymous and user hasn't voted, hide detailed results
      if (poll.is_anonymous && !userVote && !showDetailedResults) {
        results.options = results.options.map(option => ({
          ...option,
          votes: 0,
          percentage: 0
        }));
        results.totalVotes = 0;
      }

      return results;
    } catch (error) {
      console.error('Error fetching poll results:', error);
      throw error;
    }
  }

  /**
   * Update poll status
   */
  async updatePollStatus(
    pollId: string,
    status: 'active' | 'closed' | 'draft'
  ): Promise<CommunityPoll> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .update({ 
          is_active: status === 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', pollId)
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      this.clearCache();

      return data;
    } catch (error) {
      console.error('Error updating poll status:', error);
      throw error;
    }
  }

  /**
   * Get user's polls (created or voted on)
   */
  async getUserPolls(
    userId?: string,
    sessionId?: string,
    options: {
      asCreator?: boolean;
      asVoter?: boolean;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<CommunityPoll[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = userId || user?.id;
      const currentSessionId = sessionId || (await anonymousUserService.getCurrentSessionId());

      let polls: CommunityPoll[] = [];

      // Get polls as creator
      if (options.asCreator !== false) {
        const { data: createdPolls, error: creatorError } = await supabase
          .from('polls')
          .select(`
            *,
            user_votes:poll_votes!poll_votes_poll_id_fkey(
              option_ids,
              is_anonymous
            )
          `)
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false });

        if (!creatorError && createdPolls) {
          polls = [...polls, ...createdPolls];
        }
      }

      // Get polls as voter
      if (options.asVoter !== false) {
        const { data: votedPolls, error: voterError } = await supabase
          .from('polls')
          .select(`
            *,
            user_votes:poll_votes!poll_votes_poll_id_fkey(
              option_ids,
              is_anonymous
            )
          `)
          .eq('poll_votes.user_id', currentUserId)
          .order('created_at', { ascending: false });

        if (!voterError && votedPolls) {
          polls = [...polls, ...votedPolls];
        }
      }

      // Filter by active status
      if (options.isActive !== undefined) {
        polls = polls.filter(p => p.is_active === options.isActive);
      }

      // Apply pagination
      if (options.limit) {
        polls = polls.slice(options.offset || 0, (options.offset || 0) + options.limit);
      }

      // Process polls to add user vote information
      const processedPolls = await Promise.all(
        polls.map(async (poll) => {
          const userVote = await this.getUserVote(poll.id);
          return {
            ...poll,
            user_vote: userVote?.option_ids,
            has_voted: !!userVote
          };
        })
      );

      return processedPolls;
    } catch (error) {
      console.error('Error fetching user polls:', error);
      return [];
    }
  }

  /**
   * Get poll analytics
   */
  async getPollAnalytics(pollId: string): Promise<{
    totalVotes: number;
    uniqueVoters: number;
    anonymousVotes: number;
    authenticatedVotes: number;
    voteDistribution: Array<{
      optionId: string;
      optionText: string;
      votes: number;
      percentage: number;
    }>;
    participationRate: number;
  }> {
    try {
      const poll = await this.getPollById(pollId);
      if (!poll) {
        throw new Error('Poll not found');
      }

      const { data: votes, error: votesError } = await supabase
        .from('poll_votes')
        .select('is_anonymous, option_ids')
        .eq('poll_id', pollId);

      if (votesError) throw votesError;

      const analytics = {
        totalVotes: poll.total_votes,
        uniqueVoters: votes.length,
        anonymousVotes: votes.filter(v => v.is_anonymous).length,
        authenticatedVotes: votes.filter(v => !v.is_anonymous).length,
        voteDistribution: poll.options.map(option => ({
          optionId: option.id,
          optionText: option.text,
          votes: option.votes,
          percentage: poll.total_votes > 0 ? Math.round((option.votes / poll.total_votes) * 100) : 0
        })),
        participationRate: 0 // This would need to be calculated based on eligible voters
      };

      return analytics;
    } catch (error) {
      console.error('Error fetching poll analytics:', error);
      throw error;
    }
  }

  /**
   * Delete poll (only by creator)
   */
  async deletePoll(pollId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = await anonymousUserService.getCurrentSessionId();

      // Check if user is the creator
      const poll = await this.getPollById(pollId);
      if (!poll) {
        throw new Error('Poll not found');
      }

      const isCreator = (user?.id && poll.user_id === user.id) || 
                       (sessionId && poll.session_id === sessionId);

      if (!isCreator) {
        throw new Error('Only the poll creator can delete the poll');
      }

      // Delete poll (cascade will delete votes)
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (error) throw error;

      // Clear cache
      this.clearCache();

      return true;
    } catch (error) {
      console.error('Error deleting poll:', error);
      throw error;
    }
  }

  /**
   * Log anonymous poll creation
   */
  private async logAnonymousPollCreation(
    sessionId: string,
    pollId: string
  ): Promise<void> {
    try {
      await supabase
        .from('privacy_audit_log')
        .insert({
          user_id: null,
          session_id: sessionId,
          action: 'poll_created',
          details: {
            poll_id: pollId,
            privacy_level: 'anonymous'
          }
        });
    } catch (error) {
      console.error('Error logging anonymous poll creation:', error);
    }
  }

  /**
   * Log anonymous poll vote
   */
  private async logAnonymousPollVote(
    sessionId: string,
    pollId: string,
    optionIds: string[]
  ): Promise<void> {
    try {
      await supabase
        .from('privacy_audit_log')
        .insert({
          user_id: null,
          session_id: sessionId,
          action: 'poll_vote_cast',
          details: {
            poll_id: pollId,
            option_ids: optionIds,
            privacy_level: 'anonymous'
          }
        });
    } catch (error) {
      console.error('Error logging anonymous poll vote:', error);
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.polls = [];
    this.lastFetch = 0;
  }
}

export const communityPollsEnhanced = CommunityPollsEnhanced.getInstance();
