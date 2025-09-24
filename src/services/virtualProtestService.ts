import { supabase } from '@/integrations/supabase/client';

export interface VirtualProtest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  cause: string;
  target_authority?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  end_date: string;
  is_virtual: boolean;
  is_physical: boolean;
  virtual_platform?: string;
  virtual_link?: string;
  physical_address?: string;
  expected_participants: number;
  current_participants: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'invite_only';
  tags: string[];
  media_urls: string[];
  created_at: string;
  updated_at: string;
  organizer?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  participants?: ProtestParticipant[];
  updates?: ProtestUpdate[];
  impact_metrics?: ProtestImpactMetrics;
}

export interface ProtestParticipant {
  id: string;
  protest_id: string;
  user_id: string;
  participation_type: 'virtual' | 'physical' | 'both';
  commitment_level: 'low' | 'medium' | 'high';
  joined_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface ProtestUpdate {
  id: string;
  protest_id: string;
  user_id: string;
  title: string;
  content: string;
  update_type: 'announcement' | 'milestone' | 'call_to_action' | 'result';
  media_urls: string[];
  created_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface ProtestImpactMetrics {
  protest_id: string;
  total_participants: number;
  virtual_participants: number;
  physical_participants: number;
  social_media_shares: number;
  media_mentions: number;
  authority_responses: number;
  policy_changes: number;
  awareness_score: number;
  engagement_score: number;
  impact_score: number;
  last_updated: string;
}

export interface ProtestMobilization {
  id: string;
  protest_id: string;
  mobilization_type: 'email' | 'social_media' | 'sms' | 'push_notification';
  target_audience: 'participants' | 'supporters' | 'general_public';
  message: string;
  scheduled_at?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  created_at: string;
}

export interface ProtestAnalytics {
  total_protests: number;
  active_protests: number;
  total_participants: number;
  average_participation: number;
  top_causes: Array<{ cause: string; count: number }>;
  participation_by_type: {
    virtual: number;
    physical: number;
    both: number;
  };
  success_rate: number;
  average_impact_score: number;
  recent_activity: Array<{
    type: 'protest_created' | 'participant_joined' | 'update_posted' | 'protest_completed';
    description: string;
    timestamp: string;
  }>;
}

export class VirtualProtestService {
  /**
   * Create a new virtual protest
   */
  async createProtest(protestData: {
    title: string;
    description: string;
    cause: string;
    target_authority?: string;
    location_city?: string;
    location_state?: string;
    location_country?: string;
    latitude?: number;
    longitude?: number;
    start_date: string;
    end_date: string;
    is_virtual: boolean;
    is_physical: boolean;
    virtual_platform?: string;
    virtual_link?: string;
    physical_address?: string;
    expected_participants: number;
    visibility: 'public' | 'private' | 'invite_only';
    tags: string[];
  }): Promise<VirtualProtest> {
    try {
      const { data, error } = await supabase
        .from('virtual_protests')
        .insert({
          ...protestData,
          status: 'planning',
          current_participants: 0,
          media_urls: []
        })
        .select(`
          *,
          organizer:profiles!virtual_protests_user_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        throw new Error(`Failed to create protest: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating protest:', error);
      throw error;
    }
  }

  /**
   * Get protests with filtering
   */
  async getProtests(filters: {
    status?: 'planning' | 'active' | 'completed' | 'cancelled';
    cause?: string;
    location?: string;
    is_virtual?: boolean;
    is_physical?: boolean;
    visibility?: 'public' | 'private' | 'invite_only';
    limit?: number;
    offset?: number;
  } = {}): Promise<VirtualProtest[]> {
    try {
      let query = supabase
        .from('virtual_protests')
        .select(`
          *,
          organizer:profiles!virtual_protests_user_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          ),
          participants:protest_participants(
            id,
            participation_type,
            commitment_level,
            joined_at,
            user:profiles!protest_participants_user_id_fkey(
              id,
              username,
              display_name,
              avatar_url
            )
          ),
          updates:protest_updates(
            id,
            title,
            content,
            update_type,
            media_urls,
            created_at,
            user:profiles!protest_updates_user_id_fkey(
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.cause) {
        query = query.eq('cause', filters.cause);
      }

      if (filters.location) {
        query = query.or(`location_city.ilike.%${filters.location}%,location_state.ilike.%${filters.location}%`);
      }

      if (filters.is_virtual !== undefined) {
        query = query.eq('is_virtual', filters.is_virtual);
      }

      if (filters.is_physical !== undefined) {
        query = query.eq('is_physical', filters.is_physical);
      }

      if (filters.visibility) {
        query = query.eq('visibility', filters.visibility);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch protests: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching protests:', error);
      throw error;
    }
  }

  /**
   * Get protest by ID
   */
  async getProtestById(protestId: string): Promise<VirtualProtest> {
    try {
      const { data, error } = await supabase
        .from('virtual_protests')
        .select(`
          *,
          organizer:profiles!virtual_protests_user_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          ),
          participants:protest_participants(
            id,
            participation_type,
            commitment_level,
            joined_at,
            user:profiles!protest_participants_user_id_fkey(
              id,
              username,
              display_name,
              avatar_url
            )
          ),
          updates:protest_updates(
            id,
            title,
            content,
            update_type,
            media_urls,
            created_at,
            user:profiles!protest_updates_user_id_fkey(
              id,
              username,
              display_name,
              avatar_url
            )
          ),
          impact_metrics:protest_impact_metrics(*)
        `)
        .eq('id', protestId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch protest: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching protest:', error);
      throw error;
    }
  }

  /**
   * Join a protest
   */
  async joinProtest(protestId: string, participationType: 'virtual' | 'physical' | 'both', commitmentLevel: 'low' | 'medium' | 'high'): Promise<ProtestParticipant> {
    try {
      // Check if user already joined
      const { data: existingParticipant } = await supabase
        .from('protest_participants')
        .select('*')
        .eq('protest_id', protestId)
        .single();

      if (existingParticipant) {
        throw new Error('You have already joined this protest');
      }

      // Create participant record
      const { data: participant, error: participantError } = await supabase
        .from('protest_participants')
        .insert({
          protest_id: protestId,
          participation_type: participationType,
          commitment_level: commitmentLevel
        })
        .select(`
          *,
          user:profiles!protest_participants_user_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (participantError) {
        throw new Error(`Failed to join protest: ${participantError.message}`);
      }

      // Update protest participant count
      await supabase
        .from('virtual_protests')
        .update({ current_participants: supabase.sql`current_participants + 1` })
        .eq('id', protestId);

      return participant;
    } catch (error) {
      console.error('Error joining protest:', error);
      throw error;
    }
  }

  /**
   * Leave a protest
   */
  async leaveProtest(protestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('protest_participants')
        .delete()
        .eq('protest_id', protestId);

      if (error) {
        throw new Error(`Failed to leave protest: ${error.message}`);
      }

      // Update protest participant count
      await supabase
        .from('virtual_protests')
        .update({ current_participants: supabase.sql`current_participants - 1` })
        .eq('id', protestId);
    } catch (error) {
      console.error('Error leaving protest:', error);
      throw error;
    }
  }

  /**
   * Add protest update
   */
  async addProtestUpdate(protestId: string, updateData: {
    title: string;
    content: string;
    update_type: 'announcement' | 'milestone' | 'call_to_action' | 'result';
    media_urls?: string[];
  }): Promise<ProtestUpdate> {
    try {
      const { data, error } = await supabase
        .from('protest_updates')
        .insert({
          protest_id: protestId,
          ...updateData,
          media_urls: updateData.media_urls || []
        })
        .select(`
          *,
          user:profiles!protest_updates_user_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        throw new Error(`Failed to add update: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error adding protest update:', error);
      throw error;
    }
  }

  /**
   * Create mobilization campaign
   */
  async createMobilization(protestId: string, mobilizationData: {
    mobilization_type: 'email' | 'social_media' | 'sms' | 'push_notification';
    target_audience: 'participants' | 'supporters' | 'general_public';
    message: string;
    scheduled_at?: string;
  }): Promise<ProtestMobilization> {
    try {
      const { data, error } = await supabase
        .from('protest_mobilizations')
        .insert({
          protest_id: protestId,
          ...mobilizationData,
          status: mobilizationData.scheduled_at ? 'scheduled' : 'draft',
          metrics: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            converted: 0
          }
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create mobilization: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating mobilization:', error);
      throw error;
    }
  }

  /**
   * Get protest analytics
   */
  async getProtestAnalytics(): Promise<ProtestAnalytics> {
    try {
      // Get basic protest statistics
      const { data: protestStats } = await supabase
        .from('virtual_protests')
        .select('status, cause, is_virtual, is_physical, current_participants, created_at');

      // Get participant statistics
      const { data: participantStats } = await supabase
        .from('protest_participants')
        .select('participation_type, protest_id');

      // Calculate analytics
      const totalProtests = protestStats?.length || 0;
      const activeProtests = protestStats?.filter(p => p.status === 'active').length || 0;
      const totalParticipants = protestStats?.reduce((sum, p) => sum + (p.current_participants || 0), 0) || 0;
      const averageParticipation = totalProtests > 0 ? totalParticipants / totalProtests : 0;

      // Cause breakdown
      const causeCounts = protestStats?.reduce((acc, protest) => {
        if (protest.cause) {
          acc[protest.cause] = (acc[protest.cause] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const topCauses = Object.entries(causeCounts)
        .map(([cause, count]) => ({ cause, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Participation type breakdown
      const participationByType = {
        virtual: participantStats?.filter(p => p.participation_type === 'virtual').length || 0,
        physical: participantStats?.filter(p => p.participation_type === 'physical').length || 0,
        both: participantStats?.filter(p => p.participation_type === 'both').length || 0
      };

      // Success rate (completed protests / total protests)
      const completedProtests = protestStats?.filter(p => p.status === 'completed').length || 0;
      const successRate = totalProtests > 0 ? (completedProtests / totalProtests) * 100 : 0;

      // Recent activity (simplified)
      const recentActivity = [
        {
          type: 'protest_created' as const,
          description: `${totalProtests} protests created`,
          timestamp: new Date().toISOString()
        },
        {
          type: 'participant_joined' as const,
          description: `${totalParticipants} participants joined`,
          timestamp: new Date().toISOString()
        },
        {
          type: 'protest_completed' as const,
          description: `${completedProtests} protests completed`,
          timestamp: new Date().toISOString()
        }
      ];

      return {
        total_protests: totalProtests,
        active_protests: activeProtests,
        total_participants: totalParticipants,
        average_participation: Math.round(averageParticipation * 100) / 100,
        top_causes: topCauses,
        participation_by_type: participationByType,
        success_rate: Math.round(successRate * 100) / 100,
        average_impact_score: 0, // This would be calculated from impact metrics
        recent_activity: recentActivity
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Search protests
   */
  async searchProtests(searchTerm: string, filters: {
    cause?: string;
    location?: string;
    status?: 'planning' | 'active' | 'completed' | 'cancelled';
  } = {}): Promise<VirtualProtest[]> {
    try {
      let query = supabase
        .from('virtual_protests')
        .select(`
          *,
          organizer:profiles!virtual_protests_user_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,cause.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (filters.cause) {
        query = query.eq('cause', filters.cause);
      }

      if (filters.location) {
        query = query.or(`location_city.ilike.%${filters.location}%,location_state.ilike.%${filters.location}%`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to search protests: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error searching protests:', error);
      throw error;
    }
  }
}

export const virtualProtestService = new VirtualProtestService();
