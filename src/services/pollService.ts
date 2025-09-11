import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage?: number;
}

export interface Poll {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  options: PollOption[];
  total_votes: number;
  expires_at?: string;
  is_active: boolean;
  is_anonymous: boolean;
  location_city?: string;
  location_state?: string;
  category?: string;
  tags?: string[];
  created_at: string;
  author_name?: string;
  author_avatar?: string;
  user_vote?: number;
  time_remaining?: string;
  has_voted?: boolean;
}

export interface PollWithProfile extends Poll {
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface CreatePollData {
  title: string;
  description?: string;
  options: { id: string; text: string; votes: number }[];
  expires_at?: string;
  is_anonymous?: boolean;
  location_city?: string;
  location_state?: string;
  category?: string;
  tags?: string[];
}

export interface GovernmentAuthority {
  id: string;
  name: string;
  department: string;
  level: 'local' | 'state' | 'national';
  contact_email?: string;
  contact_phone?: string;
  jurisdiction: string;
  is_active: boolean;
}

export interface GovernmentPoll {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location?: string;
  category?: string;
  expires_at: string;
  is_active: boolean;
  is_anonymous: boolean;
  tagged_authorities: string[];
  total_votes: number;
  created_at: string;
  updated_at: string;
  options: PollOption[];
}

export class PollService {
  /**
   * Fetch all active polls with pagination and filters
   */
  static async fetchPolls(params: {
    limit?: number;
    offset?: number;
    location_city?: string;
    category?: string;
  } = {}): Promise<{ polls: Poll[]; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_polls_with_votes', {
        p_limit: params.limit || 20,
        p_offset: params.offset || 0,
        p_location_city: params.location_city || null,
        p_category: params.category || null
      });

      if (error) throw error;

      const polls: Poll[] = (data || []).map((poll: PollWithProfile) => ({
        id: poll.id,
        user_id: poll.user_id,
        title: poll.title,
        description: poll.description,
        options: poll.options || [],
        total_votes: poll.total_votes || 0,
        expires_at: poll.expires_at,
        is_active: poll.is_active,
        is_anonymous: poll.is_anonymous,
        location_city: poll.location_city,
        location_state: poll.location_state,
        category: poll.category,
        tags: poll.tags,
        created_at: poll.created_at,
        author_name: poll.author_name,
        author_avatar: poll.author_avatar,
        user_vote: poll.user_vote,
        time_remaining: poll.time_remaining,
        has_voted: poll.user_vote !== null
      }));

      return { polls, error: null };
    } catch (error: unknown) {
      console.error('Error fetching polls:', error);
      return { polls: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Create a new poll
   */
  static async createPoll(pollData: CreatePollData): Promise<{ success: boolean; pollId?: string; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('create_poll', {
        p_title: pollData.title,
        p_description: pollData.description || '',
        p_options: pollData.options,
        p_expires_at: pollData.expires_at || null,
        p_is_anonymous: pollData.is_anonymous || false,
        p_location_city: pollData.location_city || null,
        p_location_state: pollData.location_state || null,
        p_category: pollData.category || null,
        p_tags: pollData.tags || null
      });

      if (error) throw error;

      return { success: true, pollId: data };
    } catch (error: unknown) {
      console.error('Error creating poll:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Vote on a poll
   */
  static async voteOnPoll(pollId: string, optionIndex: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('vote_on_poll', {
        p_poll_id: pollId,
        p_option_index: optionIndex
      });

      if (error) throw error;

      if (!data) {
        return { success: false, error: 'Failed to record vote. You may have already voted or the poll is inactive.' };
      }

      return { success: true };
    } catch (error: unknown) {
      console.error('Error voting on poll:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Delete a poll (only by creator)
   */
  static async deletePoll(pollId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      console.error('Error deleting poll:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Fetch government authorities
   */
  static async fetchGovernmentAuthorities(): Promise<{ authorities: GovernmentAuthority[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('government_authorities')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      return { authorities: data || [], error: null };
    } catch (error: unknown) {
      console.error('Error fetching government authorities:', error);
      return { authorities: [], error: error.message };
    }
  }

  /**
   * Create a government poll
   */
  static async createGovernmentPoll(pollData: {
    title: string;
    description: string;
    location?: string;
    category?: string;
    expires_at: string;
    is_anonymous?: boolean;
    tagged_authorities: string[];
    options: { text: string }[];
  }): Promise<{ success: boolean; pollId?: string; error?: string }> {
    try {
      // Create the government poll
      const { data: poll, error: pollError } = await supabase
        .from('government_polls')
        .insert({
          title: pollData.title,
          description: pollData.description,
          location: pollData.location,
          category: pollData.category,
          expires_at: pollData.expires_at,
          is_anonymous: pollData.is_anonymous || false,
          tagged_authorities: pollData.tagged_authorities
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Create poll options
      const optionsData = pollData.options.map((option, index) => ({
        poll_id: poll.id,
        text: option.text,
        option_index: index,
        votes: 0
      }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsData);

      if (optionsError) throw optionsError;

      return { success: true, pollId: poll.id };
    } catch (error: unknown) {
      console.error('Error creating government poll:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Vote on a government poll
   */
  static async voteOnGovernmentPoll(pollId: string, optionIndex: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (existingVote) {
        return { success: false, error: 'You have already voted on this poll' };
      }

      // Get poll details for anonymity setting
      const { data: poll } = await supabase
        .from('government_polls')
        .select('is_anonymous')
        .eq('id', pollId)
        .single();

      // Record the vote
      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          option_index: optionIndex,
          is_anonymous: poll?.is_anonymous || false
        });

      if (voteError) throw voteError;

      // Update poll options vote count
      const { error: updateError } = await supabase
        .from('poll_options')
        .update({ votes: supabase.raw('votes + 1') })
        .eq('poll_id', pollId)
        .eq('option_index', optionIndex);

      if (updateError) throw updateError;

      // Update total votes
      const { error: totalError } = await supabase
        .from('government_polls')
        .update({ total_votes: supabase.raw('total_votes + 1') })
        .eq('id', pollId);

      if (totalError) throw totalError;

      return { success: true };
    } catch (error: unknown) {
      console.error('Error voting on government poll:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Fetch government polls
   */
  static async fetchGovernmentPolls(params: {
    limit?: number;
    offset?: number;
    location?: string;
    category?: string;
  } = {}): Promise<{ polls: GovernmentPoll[]; error: string | null }> {
    try {
      let query = supabase
        .from('government_polls')
        .select(`
          *,
          poll_options(*),
          poll_votes(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (params.location) {
        query = query.eq('location', params.location);
      }

      if (params.category) {
        query = query.eq('category', params.category);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      const polls: GovernmentPoll[] = (data || []).map((poll: PollWithProfile) => ({
        id: poll.id,
        user_id: poll.user_id,
        title: poll.title,
        description: poll.description,
        location: poll.location,
        category: poll.category,
        expires_at: poll.expires_at,
        is_active: poll.is_active,
        is_anonymous: poll.is_anonymous,
        tagged_authorities: poll.tagged_authorities || [],
        total_votes: poll.total_votes || 0,
        created_at: poll.created_at,
        updated_at: poll.updated_at,
        options: (poll.poll_options || []).map((option: PollOption) => ({
          id: option.id,
          text: option.text,
          votes: option.votes || 0,
          percentage: poll.total_votes > 0 ? Math.round((option.votes / poll.total_votes) * 100) : 0
        }))
      }));

      return { polls, error: null };
    } catch (error: unknown) {
      console.error('Error fetching government polls:', error);
      return { polls: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Share a poll
   */
  static async sharePoll(pollId: string, platform: string = 'web'): Promise<{ success: boolean; error?: string }> {
    try {
      // Get poll details
      const { data: poll, error } = await supabase
        .from('polls')
        .select('title, description')
        .eq('id', pollId)
        .single();

      if (error) throw error;

      const shareUrl = `${window.location.origin}/polls/${pollId}`;
      const shareText = `Check out this poll: ${poll.title}`;

      if (navigator.share) {
        await navigator.share({
          title: poll.title,
          text: shareText,
          url: shareUrl
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareText} - ${shareUrl}`);
      }

      return { success: true };
    } catch (error: unknown) {
      console.error('Error sharing poll:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get poll statistics
   */
  static async getPollStats(pollId: string): Promise<{ stats: { total_votes: number; options: PollOption[]; vote_distribution: Record<number, number> } | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          poll_votes(*)
        `)
        .eq('id', pollId)
        .single();

      if (error) throw error;

      const stats = {
        total_votes: data.total_votes,
        options: data.options,
        vote_distribution: data.poll_votes?.reduce((acc: Record<number, number>, vote: { option_index: number }) => {
          acc[vote.option_index] = (acc[vote.option_index] || 0) + 1;
          return acc;
        }, {}) || {},
        created_at: data.created_at,
        expires_at: data.expires_at,
        is_active: data.is_active
      };

      return { stats, error: null };
    } catch (error: unknown) {
      console.error('Error getting poll stats:', error);
      return { stats: null, error: error.message };
    }
  }
}