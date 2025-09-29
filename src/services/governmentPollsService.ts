/**
 * Government Polls Service
 * Handles government authority tagging and poll management
 */

import { resilientSupabase } from '@/integrations/supabase/client';

export interface GovernmentPoll {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  expires_at: string;
  is_active: boolean;
  is_anonymous: boolean;
  tagged_authorities: string[];
  total_votes: number;
  created_at: string;
  updated_at: string;
}

export interface GovernmentAuthority {
  id: string;
  name: string;
  department: string;
  level: 'local' | 'state' | 'national';
  contact_email: string;
  contact_phone: string;
  jurisdiction: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  user_id: string;
  option_index: number;
  is_anonymous: boolean;
  created_at: string;
}

export class GovernmentPollsService {
  /**
   * Create a new government poll with authority tagging
   */
  static async createPoll(
    userId: string,
    pollData: {
      title: string;
      description: string;
      location: string;
      category: string;
      expiresAt: string;
      isAnonymous: boolean;
      authorityIds: string[];
      options: string[];
    }
  ): Promise<{ success: boolean; poll?: GovernmentPoll; error?: string }> {
    try {
      // Create the poll
      const { data: poll, error: pollError } = await resilientSupabase
        .from('government_polls')
        .insert({
          user_id: userId,
          title: pollData.title,
          description: pollData.description,
          location: pollData.location,
          category: pollData.category,
          expires_at: pollData.expiresAt,
          is_anonymous: pollData.isAnonymous,
          tagged_authorities: pollData.authorityIds
        })
        .select()
        .single();

      if (pollError) {
        console.error('Error creating poll:', pollError);
        return { success: false, error: pollError.message };
      }

      // Create poll options
      const optionsData = pollData.options.map((option, index) => ({
        poll_id: poll.id,
        text: option,
        option_index: index,
        votes: 0
      }));

      const { error: optionsError } = await resilientSupabase
        .from('poll_options')
        .insert(optionsData);

      if (optionsError) {
        console.error('Error creating poll options:', optionsError);
        return { success: false, error: optionsError.message };
      }

      // Create authority tags
      if (pollData.authorityIds.length > 0) {
        const authorityTags = pollData.authorityIds.map(authorityId => ({
          poll_id: poll.id,
          authority_id: authorityId
        }));

        const { error: tagsError } = await resilientSupabase
          .from('poll_authority_tags')
          .insert(authorityTags);

        if (tagsError) {
          console.error('Error creating authority tags:', tagsError);
          return { success: false, error: tagsError.message };
        }
      }

      return { success: true, poll };
    } catch (error) {
      console.error('Error in createPoll:', error);
      return { success: false, error: 'Failed to create poll' };
    }
  }

  /**
   * Get all government authorities
   */
  static async getGovernmentAuthorities(): Promise<{ authorities: GovernmentAuthority[]; error?: string }> {
    try {
      const { data, error } = await resilientSupabase
        .from('government_authorities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching government authorities:', error);
        return { authorities: [], error: error.message };
      }

      return { authorities: data || [] };
    } catch (error) {
      console.error('Error in getGovernmentAuthorities:', error);
      return { authorities: [], error: 'Failed to fetch government authorities' };
    }
  }

  /**
   * Get polls by authority
   */
  static async getPollsByAuthority(authorityId: string): Promise<{ polls: GovernmentPoll[]; error?: string }> {
    try {
      const { data, error } = await resilientSupabase
        .from('poll_authority_tags')
        .select(`
          poll_id,
          government_polls (
            id,
            user_id,
            title,
            description,
            location,
            category,
            expires_at,
            is_active,
            is_anonymous,
            tagged_authorities,
            total_votes,
            created_at,
            updated_at
          )
        `)
        .eq('authority_id', authorityId);

      if (error) {
        console.error('Error fetching polls by authority:', error);
        return { polls: [], error: error.message };
      }

      const polls = data?.map(item => item.government_polls).filter(Boolean) || [];
      return { polls };
    } catch (error) {
      console.error('Error in getPollsByAuthority:', error);
      return { polls: [], error: 'Failed to fetch polls by authority' };
    }
  }

  /**
   * Vote on a poll
   */
  static async voteOnPoll(
    userId: string,
    pollId: string,
    optionIndex: number,
    isAnonymous: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user already voted
      const { data: existingVote, error: checkError } = await resilientSupabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing vote:', checkError);
        return { success: false, error: checkError.message };
      }

      if (existingVote) {
        return { success: false, error: 'You have already voted on this poll' };
      }

      // Create the vote
      const { error: voteError } = await resilientSupabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: userId,
          option_index: optionIndex,
          is_anonymous: isAnonymous
        });

      if (voteError) {
        console.error('Error creating vote:', voteError);
        return { success: false, error: voteError.message };
      }

      // Update poll option vote count
      const { error: updateError } = await resilientSupabase
        .from('poll_options')
        .update({ votes: resilientSupabase.raw('votes + 1') })
        .eq('poll_id', pollId)
        .eq('option_index', optionIndex);

      if (updateError) {
        console.error('Error updating poll option votes:', updateError);
        return { success: false, error: updateError.message };
      }

      // Update total votes on poll
      const { error: pollUpdateError } = await resilientSupabase
        .from('government_polls')
        .update({ total_votes: resilientSupabase.raw('total_votes + 1') })
        .eq('id', pollId);

      if (pollUpdateError) {
        console.error('Error updating poll total votes:', pollUpdateError);
        return { success: false, error: pollUpdateError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in voteOnPoll:', error);
      return { success: false, error: 'Failed to vote on poll' };
    }
  }

  /**
   * Get poll results
   */
  static async getPollResults(pollId: string): Promise<{ results: PollOption[]; error?: string }> {
    try {
      const { data, error } = await resilientSupabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollId)
        .order('option_index');

      if (error) {
        console.error('Error fetching poll results:', error);
        return { results: [], error: error.message };
      }

      return { results: data || [] };
    } catch (error) {
      console.error('Error in getPollResults:', error);
      return { results: [], error: 'Failed to fetch poll results' };
    }
  }

  /**
   * Get active polls
   */
  static async getActivePolls(): Promise<{ polls: GovernmentPoll[]; error?: string }> {
    try {
      const { data, error } = await resilientSupabase
        .from('government_polls')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active polls:', error);
        return { polls: [], error: error.message };
      }

      return { polls: data || [] };
    } catch (error) {
      console.error('Error in getActivePolls:', error);
      return { polls: [], error: 'Failed to fetch active polls' };
    }
  }

  /**
   * Notify authorities about new poll
   */
  static async notifyAuthorities(pollId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get poll details
      const { data: poll, error: pollError } = await resilientSupabase
        .from('government_polls')
        .select('title, description, tagged_authorities')
        .eq('id', pollId)
        .single();

      if (pollError) {
        console.error('Error fetching poll details:', pollError);
        return { success: false, error: pollError.message };
      }

      // Get authority details
      const { data: authorities, error: authoritiesError } = await resilientSupabase
        .from('government_authorities')
        .select('id, name, contact_email')
        .in('id', poll.tagged_authorities);

      if (authoritiesError) {
        console.error('Error fetching authority details:', authoritiesError);
        return { success: false, error: authoritiesError.message };
      }

      // Here you would implement the actual notification logic
      // For now, we'll just log the notification
      console.log('Notifying authorities about poll:', {
        pollId,
        pollTitle: poll.title,
        authorities: authorities?.map(a => ({ id: a.id, name: a.name, email: a.contact_email }))
      });

      return { success: true };
    } catch (error) {
      console.error('Error in notifyAuthorities:', error);
      return { success: false, error: 'Failed to notify authorities' };
    }
  }

  /**
   * Close a poll
   */
  static async closePoll(pollId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await resilientSupabase
        .from('government_polls')
        .update({ is_active: false })
        .eq('id', pollId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error closing poll:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in closePoll:', error);
      return { success: false, error: 'Failed to close poll' };
    }
  }
}

export const governmentPollsService = new GovernmentPollsService();