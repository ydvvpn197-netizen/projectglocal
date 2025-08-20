import { supabase } from '@/integrations/supabase/client';
import { CommunityPoll, CreatePollRequest, PollVoteRequest } from '@/types/community';

export class PollService {
  // Poll Management
  static async createPoll(pollData: CreatePollRequest): Promise<CommunityPoll | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create options array with IDs
      const options = pollData.options.map((text, index) => ({
        id: `option_${Date.now()}_${index}`,
        text,
        votes: 0
      }));

      const { data, error } = await supabase
        .from('community_polls')
        .insert({
          post_id: pollData.post_id,
          question: pollData.question,
          options,
          is_multiple_choice: pollData.is_multiple_choice || false,
          is_anonymous: pollData.is_anonymous || false,
          expires_at: pollData.expires_at || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating poll:', error);
      return null;
    }
  }

  static async getPollByPostId(postId: string): Promise<CommunityPoll | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('community_polls')
        .select('*')
        .eq('post_id', postId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      // Get user's vote if any
      const { data: userVote, error: voteError } = await supabase
        .from('poll_votes')
        .select('selected_options')
        .eq('poll_id', data.id)
        .eq('user_id', user.id)
        .single();

      if (voteError && voteError.code !== 'PGRST116') throw voteError;

      return {
        ...data,
        user_vote: userVote?.selected_options || [],
        has_voted: !!userVote
      };
    } catch (error) {
      console.error('Error fetching poll:', error);
      return null;
    }
  }

  static async getPollById(pollId: string): Promise<CommunityPoll | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('community_polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (error) throw error;

      // Get user's vote if any
      const { data: userVote, error: voteError } = await supabase
        .from('poll_votes')
        .select('selected_options')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .single();

      if (voteError && voteError.code !== 'PGRST116') throw voteError;

      return {
        ...data,
        user_vote: userVote?.selected_options || [],
        has_voted: !!userVote
      };
    } catch (error) {
      console.error('Error fetching poll:', error);
      return null;
    }
  }

  static async updatePoll(pollId: string, updates: Partial<CommunityPoll>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('community_polls')
        .update(updates)
        .eq('id', pollId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating poll:', error);
      return false;
    }
  }

  static async deletePoll(pollId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('community_polls')
        .delete()
        .eq('id', pollId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting poll:', error);
      return false;
    }
  }

  // Poll Voting
  static async voteOnPoll(pollId: string, voteData: PollVoteRequest): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get poll details
      const poll = await this.getPollById(pollId);
      if (!poll) throw new Error('Poll not found');

      // Check if poll is active
      if (!poll.is_active) throw new Error('Poll is not active');

      // Check if poll has expired
      if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
        throw new Error('Poll has expired');
      }

      // Validate vote
      const validation = this.validatePollVote(poll, voteData.selected_options);
      if (!validation.isValid) {
        throw new Error(validation.reason);
      }

      // Check for existing vote
      const { data: existingVote, error: fetchError } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error: updateError } = await supabase
          .from('poll_votes')
          .update({ selected_options: voteData.selected_options })
          .eq('poll_id', pollId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        // Create new vote
        const { error: insertError } = await supabase
          .from('poll_votes')
          .insert({
            poll_id: pollId,
            user_id: user.id,
            selected_options: voteData.selected_options
          });

        if (insertError) throw insertError;
      }

      // Update poll results
      await this.updatePollResults(pollId);

      return true;
    } catch (error) {
      console.error('Error voting on poll:', error);
      return false;
    }
  }

  // Get poll results
  static async getPollResults(pollId: string): Promise<{
    total_votes: number;
    options: Array<{
      id: string;
      text: string;
      votes: number;
      percentage: number;
    }>;
    user_vote?: string[];
  } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const poll = await this.getPollById(pollId);
      if (!poll) return null;

      // Get user's vote
      const { data: userVote, error: voteError } = await supabase
        .from('poll_votes')
        .select('selected_options')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .single();

      if (voteError && voteError.code !== 'PGRST116') throw voteError;

      // Calculate percentages
      const totalVotes = poll.total_votes || 0;
      const optionsWithPercentages = poll.options.map(option => ({
        ...option,
        percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
      }));

      return {
        total_votes: totalVotes,
        options: optionsWithPercentages,
        user_vote: userVote?.selected_options || []
      };
    } catch (error) {
      console.error('Error getting poll results:', error);
      return null;
    }
  }

  // Get user's poll votes
  static async getUserPollVotes(userId: string, limit: number = 50): Promise<{
    poll_id: string;
    selected_options: string[];
    created_at: string;
    poll: CommunityPoll;
  }[]> {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select(`
          poll_id,
          selected_options,
          created_at,
          community_polls (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(vote => ({
        poll_id: vote.poll_id,
        selected_options: vote.selected_options,
        created_at: vote.created_at,
        poll: vote.community_polls
      }));
    } catch (error) {
      console.error('Error getting user poll votes:', error);
      return [];
    }
  }

  // Search polls
  static async searchPolls(query: string, filters?: {
    is_active?: boolean;
    is_anonymous?: boolean;
  }): Promise<CommunityPoll[]> {
    try {
      let searchQuery = supabase
        .from('community_polls')
        .select('*')
        .or(`question.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (filters?.is_active !== undefined) {
        searchQuery = searchQuery.eq('is_active', filters.is_active);
      }
      if (filters?.is_anonymous !== undefined) {
        searchQuery = searchQuery.eq('is_anonymous', filters.is_anonymous);
      }

      const { data, error } = await searchQuery;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching polls:', error);
      return [];
    }
  }

  // Get active polls
  static async getActivePolls(limit: number = 20): Promise<CommunityPoll[]> {
    try {
      const { data, error } = await supabase
        .from('community_polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active polls:', error);
      return [];
    }
  }

  // Get expired polls
  static async getExpiredPolls(limit: number = 20): Promise<CommunityPoll[]> {
    try {
      const { data, error } = await supabase
        .from('community_polls')
        .select('*')
        .not('expires_at', 'is', null)
        .lt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expired polls:', error);
      return [];
    }
  }

  // Helper methods
  private static validatePollVote(poll: CommunityPoll, selectedOptions: string[]): {
    isValid: boolean;
    reason?: string;
  } {
    // Check if user has already voted
    if (poll.has_voted) {
      return {
        isValid: false,
        reason: 'You have already voted on this poll'
      };
    }

    // Check if poll is active
    if (!poll.is_active) {
      return {
        isValid: false,
        reason: 'Poll is not active'
      };
    }

    // Check if poll has expired
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return {
        isValid: false,
        reason: 'Poll has expired'
      };
    }

    // Validate selected options
    if (!selectedOptions || selectedOptions.length === 0) {
      return {
        isValid: false,
        reason: 'Please select at least one option'
      };
    }

    // Check if multiple choice is allowed
    if (!poll.is_multiple_choice && selectedOptions.length > 1) {
      return {
        isValid: false,
        reason: 'This poll only allows single choice'
      };
    }

    // Validate that all selected options exist in the poll
    const validOptionIds = poll.options.map(option => option.id);
    const invalidOptions = selectedOptions.filter(optionId => !validOptionIds.includes(optionId));
    
    if (invalidOptions.length > 0) {
      return {
        isValid: false,
        reason: 'Invalid option selected'
      };
    }

    return { isValid: true };
  }

  private static async updatePollResults(pollId: string): Promise<void> {
    try {
      // Get all votes for this poll
      const { data: votes, error: votesError } = await supabase
        .from('poll_votes')
        .select('selected_options')
        .eq('poll_id', pollId);

      if (votesError) throw votesError;

      // Get poll options
      const { data: poll, error: pollError } = await supabase
        .from('community_polls')
        .select('options')
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;

      // Count votes for each option
      const voteCounts: Record<string, number> = {};
      poll.options.forEach((option: any) => {
        voteCounts[option.id] = 0;
      });

      votes?.forEach(vote => {
        vote.selected_options.forEach((optionId: string) => {
          if (voteCounts[optionId] !== undefined) {
            voteCounts[optionId]++;
          }
        });
      });

      // Update options with vote counts
      const updatedOptions = poll.options.map((option: any) => ({
        ...option,
        votes: voteCounts[option.id] || 0
      }));

      // Update poll
      await supabase
        .from('community_polls')
        .update({
          options: updatedOptions,
          total_votes: votes?.length || 0
        })
        .eq('id', pollId);
    } catch (error) {
      console.error('Error updating poll results:', error);
    }
  }

  // Check if poll is expired
  static isPollExpired(poll: CommunityPoll): boolean {
    if (!poll.expires_at) return false;
    return new Date(poll.expires_at) < new Date();
  }

  // Get time remaining until poll expires
  static getTimeRemaining(poll: CommunityPoll): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null {
    if (!poll.expires_at) return null;

    const now = new Date();
    const expiresAt = new Date(poll.expires_at);
    const timeRemaining = expiresAt.getTime() - now.getTime();

    if (timeRemaining <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true
      };
    }

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false
    };
  }
}
