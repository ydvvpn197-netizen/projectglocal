import { supabase } from '@/integrations/supabase/client';

export interface GovernmentAuthority {
  id: string;
  name: string;
  department: string;
  level: 'local' | 'state' | 'national';
  contact_email?: string;
  contact_phone?: string;
  jurisdiction: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GovernmentPoll {
  id: string;
  user_id?: string;
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
  options?: PollOption[];
  authorities?: GovernmentAuthority[];
  user_vote?: PollVote;
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  option_index: number;
  votes: number;
  created_at: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id?: string;
  option_index: number;
  is_anonymous: boolean;
  created_at: string;
}

export interface GovernmentResponse {
  id: string;
  poll_id: string;
  authority_id: string;
  response_text: string;
  response_type: 'acknowledgment' | 'detailed_response' | 'action_plan' | 'rejection';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  authority?: GovernmentAuthority;
}

export interface CivicEngagementAnalytics {
  total_polls: number;
  active_polls: number;
  total_votes: number;
  average_participation: number;
  authority_responses: number;
  response_rate: number;
  top_categories: Array<{ category: string; count: number }>;
  participation_by_level: Array<{ level: string; count: number }>;
  recent_activity: Array<{
    type: 'poll_created' | 'vote_cast' | 'authority_response';
    description: string;
    timestamp: string;
  }>;
}

export class GovernmentPollsService {
  /**
   * Get all government authorities
   */
  async getAuthorities(level?: 'local' | 'state' | 'national'): Promise<GovernmentAuthority[]> {
    try {
      let query = supabase
        .from('government_authorities')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('name', { ascending: true });

      if (level) {
        query = query.eq('level', level);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch authorities: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching authorities:', error);
      throw error;
    }
  }

  /**
   * Create a new government poll
   */
  async createPoll(pollData: {
    title: string;
    description: string;
    location?: string;
    category?: string;
    expires_at: string;
    is_anonymous?: boolean;
    tagged_authorities: string[];
    options: string[];
  }): Promise<GovernmentPoll> {
    try {
      // Create the poll
      const { data: poll, error: pollError } = await supabase
        .from('government_polls')
        .insert({
          title: pollData.title,
          description: pollData.description,
          location: pollData.location,
          category: pollData.category,
          expires_at: pollData.expires_at,
          is_anonymous: pollData.is_anonymous || false,
          tagged_authorities: pollData.tagged_authorities,
          is_active: true
        })
        .select()
        .single();

      if (pollError) {
        throw new Error(`Failed to create poll: ${pollError.message}`);
      }

      // Create poll options
      const optionsData = pollData.options.map((text, index) => ({
        poll_id: poll.id,
        text,
        option_index: index,
        votes: 0
      }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsData);

      if (optionsError) {
        throw new Error(`Failed to create poll options: ${optionsError.message}`);
      }

      // Fetch the complete poll with options
      return await this.getPollById(poll.id);
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }

  /**
   * Get poll by ID with options and authorities
   */
  async getPollById(pollId: string): Promise<GovernmentPoll> {
    try {
      // Get poll
      const { data: poll, error: pollError } = await supabase
        .from('government_polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (pollError) {
        throw new Error(`Failed to fetch poll: ${pollError.message}`);
      }

      // Get poll options
      const { data: options, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollId)
        .order('option_index', { ascending: true });

      if (optionsError) {
        throw new Error(`Failed to fetch poll options: ${optionsError.message}`);
      }

      // Get tagged authorities
      const { data: authorities, error: authoritiesError } = await supabase
        .from('government_authorities')
        .select('*')
        .in('id', poll.tagged_authorities);

      if (authoritiesError) {
        console.warn('Failed to fetch authorities:', authoritiesError);
      }

      return {
        ...poll,
        options: options || [],
        authorities: authorities || []
      };
    } catch (error) {
      console.error('Error fetching poll:', error);
      throw error;
    }
  }

  /**
   * Get all government polls with filtering
   */
  async getPolls(filters: {
    category?: string;
    location?: string;
    level?: 'local' | 'state' | 'national';
    is_active?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<GovernmentPoll[]> {
    try {
      let query = supabase
        .from('government_polls')
        .select(`
          *,
          options:poll_options(*),
          authorities:government_authorities(*)
        `)
        .order('created_at', { ascending: false });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.location) {
        query = query.eq('location', filters.location);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch polls: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching polls:', error);
      throw error;
    }
  }

  /**
   * Vote on a government poll
   */
  async voteOnPoll(pollId: string, optionIndex: number, isAnonymous: boolean = false): Promise<PollVote> {
    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollId)
        .single();

      if (existingVote) {
        throw new Error('You have already voted on this poll');
      }

      // Create vote
      const { data: vote, error: voteError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          option_index: optionIndex,
          is_anonymous: isAnonymous
        })
        .select()
        .single();

      if (voteError) {
        throw new Error(`Failed to cast vote: ${voteError.message}`);
      }

      // Update poll vote count
      await supabase
        .from('government_polls')
        .update({ total_votes: supabase.sql`total_votes + 1` })
        .eq('id', pollId);

      // Update option vote count
      await supabase
        .from('poll_options')
        .update({ votes: supabase.sql`votes + 1` })
        .eq('poll_id', pollId)
        .eq('option_index', optionIndex);

      return vote;
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw error;
    }
  }

  /**
   * Get user's vote for a poll
   */
  async getUserVote(pollId: string): Promise<PollVote | null> {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch user vote: ${error.message}`);
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching user vote:', error);
      throw error;
    }
  }

  /**
   * Submit government response to a poll
   */
  async submitGovernmentResponse(responseData: {
    poll_id: string;
    authority_id: string;
    response_text: string;
    response_type: 'acknowledgment' | 'detailed_response' | 'action_plan' | 'rejection';
  }): Promise<GovernmentResponse> {
    try {
      const { data, error } = await supabase
        .from('government_responses')
        .insert({
          poll_id: responseData.poll_id,
          authority_id: responseData.authority_id,
          response_text: responseData.response_text,
          response_type: responseData.response_type,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit response: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error submitting government response:', error);
      throw error;
    }
  }

  /**
   * Get government responses for a poll
   */
  async getPollResponses(pollId: string): Promise<GovernmentResponse[]> {
    try {
      const { data, error } = await supabase
        .from('government_responses')
        .select(`
          *,
          authority:government_authorities(*)
        `)
        .eq('poll_id', pollId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch responses: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching poll responses:', error);
      throw error;
    }
  }

  /**
   * Get civic engagement analytics
   */
  async getCivicEngagementAnalytics(): Promise<CivicEngagementAnalytics> {
    try {
      // Get basic poll statistics
      const { data: pollStats } = await supabase
        .from('government_polls')
        .select('is_active, category, level, created_at, total_votes');

      // Get authority response statistics
      const { data: responseStats } = await supabase
        .from('government_responses')
        .select('poll_id, status, created_at');

      // Calculate analytics
      const totalPolls = pollStats?.length || 0;
      const activePolls = pollStats?.filter(p => p.is_active).length || 0;
      const totalVotes = pollStats?.reduce((sum, p) => sum + (p.total_votes || 0), 0) || 0;
      const averageParticipation = totalPolls > 0 ? totalVotes / totalPolls : 0;

      // Category breakdown
      const categoryCounts = pollStats?.reduce((acc, poll) => {
        if (poll.category) {
          acc[poll.category] = (acc[poll.category] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Level breakdown
      const levelCounts = pollStats?.reduce((acc, poll) => {
        if (poll.level) {
          acc[poll.level] = (acc[poll.level] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const participationByLevel = Object.entries(levelCounts)
        .map(([level, count]) => ({ level, count }));

      // Authority responses
      const authorityResponses = responseStats?.length || 0;
      const responseRate = totalPolls > 0 ? (authorityResponses / totalPolls) * 100 : 0;

      // Recent activity (simplified)
      const recentActivity = [
        {
          type: 'poll_created' as const,
          description: `${totalPolls} polls created`,
          timestamp: new Date().toISOString()
        },
        {
          type: 'vote_cast' as const,
          description: `${totalVotes} votes cast`,
          timestamp: new Date().toISOString()
        },
        {
          type: 'authority_response' as const,
          description: `${authorityResponses} authority responses`,
          timestamp: new Date().toISOString()
        }
      ];

      return {
        total_polls: totalPolls,
        active_polls: activePolls,
        total_votes: totalVotes,
        average_participation: Math.round(averageParticipation * 100) / 100,
        authority_responses: authorityResponses,
        response_rate: Math.round(responseRate * 100) / 100,
        top_categories: topCategories,
        participation_by_level: participationByLevel,
        recent_activity: recentActivity
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Search polls by text
   */
  async searchPolls(searchTerm: string, filters: {
    category?: string;
    location?: string;
    level?: 'local' | 'state' | 'national';
  } = {}): Promise<GovernmentPoll[]> {
    try {
      let query = supabase
        .from('government_polls')
        .select(`
          *,
          options:poll_options(*),
          authorities:government_authorities(*)
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.location) {
        query = query.eq('location', filters.location);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to search polls: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error searching polls:', error);
      throw error;
    }
  }
}

export const governmentPollsService = new GovernmentPollsService();
