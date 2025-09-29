import { supabase } from '@/integrations/supabase/client';
import { anonymousUserService } from './anonymousUserService';
import { governmentAuthorityService } from './governmentAuthorityService';

export interface VirtualProtest {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  organizer_anonymous_id?: string;
  cause: string;
  target_authority_id?: string;
  target_authority?: Record<string, unknown>;
  protest_type: 'petition' | 'boycott' | 'awareness' | 'digital_assembly' | 'symbolic_action';
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  participation_goal: number;
  current_participants: number;
  location_type: 'virtual' | 'hybrid' | 'local';
  location_details?: {
    virtual_platform?: string;
    meeting_link?: string;
    physical_address?: string;
    city?: string;
    state?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  requirements?: {
    age_minimum?: number;
    verification_required: boolean;
    anonymous_participation: boolean;
    commitment_level: 'low' | 'medium' | 'high';
  };
  is_anonymous: boolean;
  is_public: boolean;
  visibility: 'public' | 'private' | 'invite_only';
  tags: string[];
  media_urls: string[];
  created_at: string;
  updated_at: string;
  actions?: VirtualProtestAction[];
  supporters?: VirtualProtestSupporter[];
  updates?: VirtualProtestUpdate[];
}

export interface VirtualProtestAction {
  id: string;
  protest_id: string;
  action_type: 'sign_petition' | 'share_content' | 'join_meeting' | 'donate' | 'contact_authority' | 'other';
  title: string;
  description?: string;
  action_data?: Record<string, unknown>;
  is_required: boolean;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface VirtualProtestSupporter {
  id: string;
  protest_id: string;
  user_id?: string;
  anonymous_id?: string;
  support_level: 'interested' | 'participating' | 'committed';
  joined_at: string;
  last_active_at: string;
  actions_completed: string[];
  is_anonymous: boolean;
}

export interface VirtualProtestUpdate {
  id: string;
  protest_id: string;
  author_id?: string;
  author_anonymous_id?: string;
  title: string;
  content: string;
  update_type: 'progress' | 'milestone' | 'call_to_action' | 'general';
  is_public: boolean;
  is_anonymous: boolean;
  created_at: string;
}

export interface CreateProtestOptions {
  title: string;
  description: string;
  cause: string;
  targetAuthorityId?: string;
  protestType: VirtualProtest['protest_type'];
  startDate: string;
  endDate?: string;
  participationGoal?: number;
  locationType: VirtualProtest['location_type'];
  locationDetails?: VirtualProtest['location_details'];
  requirements?: VirtualProtest['requirements'];
  isAnonymous?: boolean;
  isPublic?: boolean;
  visibility?: VirtualProtest['visibility'];
  tags?: string[];
  mediaUrls?: string[];
  actions?: Partial<VirtualProtestAction>[];
}

export interface ProtestFilterOptions {
  status?: VirtualProtest['status'];
  protestType?: VirtualProtest['protest_type'];
  cause?: string;
  locationType?: VirtualProtest['location_type'];
  isPublic?: boolean;
  isActive?: boolean;
  searchQuery?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export class VirtualProtestServiceEnhanced {
  private static instance: VirtualProtestServiceEnhanced;
  private protests: VirtualProtest[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  public static getInstance(): VirtualProtestServiceEnhanced {
    if (!VirtualProtestServiceEnhanced.instance) {
      VirtualProtestServiceEnhanced.instance = new VirtualProtestServiceEnhanced();
    }
    return VirtualProtestServiceEnhanced.instance;
  }

  /**
   * Create a new virtual protest
   */
  async createProtest(options: CreateProtestOptions): Promise<VirtualProtest> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = options.isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      const protestData = {
        title: options.title,
        description: options.description,
        organizer_id: user?.id || '',
        organizer_anonymous_id: options.isAnonymous ? sessionId : undefined,
        cause: options.cause,
        target_authority_id: options.targetAuthorityId,
        protest_type: options.protestType,
        start_date: options.startDate,
        end_date: options.endDate,
        participation_goal: options.participationGoal || 100,
        current_participants: 0,
        location_type: options.locationType,
        location_details: options.locationDetails,
        requirements: options.requirements || {
          verification_required: false,
          anonymous_participation: true,
          commitment_level: 'low'
        },
        is_anonymous: options.isAnonymous || false,
        is_public: options.isPublic !== false,
        visibility: options.visibility || 'public',
        tags: options.tags || [],
        media_urls: options.mediaUrls || []
      };

      const { data, error } = await supabase
        .from('virtual_protests')
        .insert(protestData)
        .select(`
          *,
          target_authority:government_authorities(*)
        `)
        .single();

      if (error) throw error;

      // Create actions if provided
      if (options.actions && options.actions.length > 0) {
        const actionData = options.actions.map((action, index) => ({
          protest_id: data.id,
          action_type: action.action_type || 'other',
          title: action.title || `Action ${index + 1}`,
          description: action.description,
          action_data: action.action_data,
          is_required: action.is_required || false,
          order_index: action.order_index || index,
          is_active: action.is_active !== false
        }));

        await supabase
          .from('virtual_protest_actions')
          .insert(actionData);
      }

      // Log creation for anonymous protests
      if (options.isAnonymous && sessionId) {
        await this.logAnonymousProtestCreation(sessionId, data.id);
      }

      // Clear cache
      this.clearCache();

      return data;
    } catch (error) {
      console.error('Error creating virtual protest:', error);
      throw error;
    }
  }

  /**
   * Get protests with filtering
   */
  async getProtests(options: ProtestFilterOptions = {}): Promise<VirtualProtest[]> {
    try {
      let query = supabase
        .from('virtual_protests')
        .select(`
          *,
          target_authority:government_authorities(*),
          actions:virtual_protest_actions(*),
          supporters:virtual_protest_supporters(*),
          updates:virtual_protest_updates(*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.protestType) {
        query = query.eq('protest_type', options.protestType);
      }

      if (options.cause) {
        query = query.ilike('cause', `%${options.cause}%`);
      }

      if (options.locationType) {
        query = query.eq('location_type', options.locationType);
      }

      if (options.isPublic !== undefined) {
        query = query.eq('is_public', options.isPublic);
      }

      if (options.isActive !== undefined) {
        if (options.isActive) {
          query = query.in('status', ['planning', 'active']);
        } else {
          query = query.in('status', ['completed', 'cancelled']);
        }
      }

      if (options.searchQuery) {
        query = query.or(`title.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%,cause.ilike.%${options.searchQuery}%`);
      }

      if (options.tags && options.tags.length > 0) {
        query = query.overlaps('tags', options.tags);
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
      return data || [];
    } catch (error) {
      console.error('Error fetching protests:', error);
      return [];
    }
  }

  /**
   * Get protest by ID
   */
  async getProtestById(id: string): Promise<VirtualProtest | null> {
    try {
      const { data, error } = await supabase
        .from('virtual_protests')
        .select(`
          *,
          target_authority:government_authorities(*),
          actions:virtual_protest_actions(*),
          supporters:virtual_protest_supporters(*),
          updates:virtual_protest_updates(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching protest by ID:', error);
      return null;
    }
  }

  /**
   * Join a protest
   */
  async joinProtest(
    protestId: string,
    supportLevel: VirtualProtestSupporter['support_level'] = 'interested',
    isAnonymous: boolean = true
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      const supporterData = {
        protest_id: protestId,
        user_id: user?.id,
        anonymous_id: isAnonymous ? sessionId : undefined,
        support_level: supportLevel,
        actions_completed: [],
        is_anonymous: isAnonymous
      };

      const { error } = await supabase
        .from('virtual_protest_supporters')
        .insert(supporterData);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('You have already joined this protest');
        }
        throw error;
      }

      // Update last activity
      await this.updateSupporterActivity(protestId, user?.id, sessionId);

      return true;
    } catch (error) {
      console.error('Error joining protest:', error);
      throw error;
    }
  }

  /**
   * Leave a protest
   */
  async leaveProtest(protestId: string, isAnonymous: boolean = true): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      let query = supabase
        .from('virtual_protest_supporters')
        .delete()
        .eq('protest_id', protestId);

      if (user?.id) {
        query = query.eq('user_id', user.id);
      } else if (sessionId) {
        query = query.eq('anonymous_id', sessionId);
      } else {
        throw new Error('Unable to identify user for leaving protest');
      }

      const { error } = await query;

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error leaving protest:', error);
      throw error;
    }
  }

  /**
   * Complete a protest action
   */
  async completeAction(
    protestId: string,
    actionId: string,
    isAnonymous: boolean = true
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      // Get current supporter record
      let supporterQuery = supabase
        .from('virtual_protest_supporters')
        .select('actions_completed')
        .eq('protest_id', protestId);

      if (user?.id) {
        supporterQuery = supporterQuery.eq('user_id', user.id);
      } else if (sessionId) {
        supporterQuery = supporterQuery.eq('anonymous_id', sessionId);
      } else {
        throw new Error('Unable to identify user for completing action');
      }

      const { data: supporter, error: supporterError } = await supporterQuery.single();

      if (supporterError) throw supporterError;

      const actionsCompleted = supporter.actions_completed || [];
      
      if (!actionsCompleted.includes(actionId)) {
        actionsCompleted.push(actionId);

        // Update supporter record
        const { error: updateError } = await supabase
          .from('virtual_protest_supporters')
          .update({
            actions_completed: actionsCompleted,
            last_active_at: new Date().toISOString()
          })
          .eq('protest_id', protestId)
          .eq(user?.id ? 'user_id' : 'anonymous_id', user?.id || sessionId);

        if (updateError) throw updateError;
      }

      return true;
    } catch (error) {
      console.error('Error completing action:', error);
      throw error;
    }
  }

  /**
   * Add protest update
   */
  async addUpdate(
    protestId: string,
    title: string,
    content: string,
    updateType: VirtualProtestUpdate['update_type'] = 'general',
    isAnonymous: boolean = true
  ): Promise<VirtualProtestUpdate> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      const updateData = {
        protest_id: protestId,
        author_id: user?.id,
        author_anonymous_id: isAnonymous ? sessionId : undefined,
        title,
        content,
        update_type: updateType,
        is_public: true,
        is_anonymous: isAnonymous
      };

      const { data, error } = await supabase
        .from('virtual_protest_updates')
        .insert(updateData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding protest update:', error);
      throw error;
    }
  }

  /**
   * Update protest status
   */
  async updateProtestStatus(
    protestId: string,
    status: VirtualProtest['status']
  ): Promise<VirtualProtest> {
    try {
      const { data, error } = await supabase
        .from('virtual_protests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', protestId)
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      this.clearCache();

      return data;
    } catch (error) {
      console.error('Error updating protest status:', error);
      throw error;
    }
  }

  /**
   * Get user's protests (organized or supported)
   */
  async getUserProtests(
    userId?: string,
    sessionId?: string,
    options: {
      asOrganizer?: boolean;
      asSupporter?: boolean;
      status?: VirtualProtest['status'];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<VirtualProtest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = userId || user?.id;
      const currentSessionId = sessionId || (await anonymousUserService.getCurrentSessionId());

      let protests: VirtualProtest[] = [];

      // Get protests as organizer
      if (options.asOrganizer !== false) {
        const { data: organizedProtests, error: organizerError } = await supabase
          .from('virtual_protests')
          .select(`
            *,
            target_authority:government_authorities(*),
            actions:virtual_protest_actions(*),
            supporters:virtual_protest_supporters(*),
            updates:virtual_protest_updates(*)
          `)
          .eq('organizer_id', currentUserId)
          .order('created_at', { ascending: false });

        if (!organizerError && organizedProtests) {
          protests = [...protests, ...organizedProtests];
        }
      }

      // Get protests as supporter
      if (options.asSupporter !== false) {
        const { data: supportedProtests, error: supporterError } = await supabase
          .from('virtual_protests')
          .select(`
            *,
            target_authority:government_authorities(*),
            actions:virtual_protest_actions(*),
            supporters:virtual_protest_supporters(*),
            updates:virtual_protest_updates(*)
          `)
          .eq('supporters.user_id', currentUserId)
          .order('created_at', { ascending: false });

        if (!supporterError && supportedProtests) {
          protests = [...protests, ...supportedProtests];
        }
      }

      // Filter by status if specified
      if (options.status) {
        protests = protests.filter(p => p.status === options.status);
      }

      // Apply pagination
      if (options.limit) {
        protests = protests.slice(options.offset || 0, (options.offset || 0) + options.limit);
      }

      return protests;
    } catch (error) {
      console.error('Error fetching user protests:', error);
      return [];
    }
  }

  /**
   * Get protest analytics
   */
  async getProtestAnalytics(protestId: string): Promise<{
    totalSupporters: number;
    supportersByLevel: Record<VirtualProtestSupporter['support_level'], number>;
    actionsCompleted: Record<string, number>;
    recentActivity: number;
    engagementRate: number;
  }> {
    try {
      const { data: supporters, error: supportersError } = await supabase
        .from('virtual_protest_supporters')
        .select('support_level, actions_completed, last_active_at')
        .eq('protest_id', protestId);

      if (supportersError) throw supportersError;

      const analytics = {
        totalSupporters: supporters.length,
        supportersByLevel: {
          interested: 0,
          participating: 0,
          committed: 0
        } as Record<VirtualProtestSupporter['support_level'], number>,
        actionsCompleted: {} as Record<string, number>,
        recentActivity: 0,
        engagementRate: 0
      };

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      supporters.forEach(supporter => {
        // Count by support level
        analytics.supportersByLevel[supporter.support_level]++;

        // Count actions completed
        supporter.actions_completed?.forEach(actionId => {
          analytics.actionsCompleted[actionId] = (analytics.actionsCompleted[actionId] || 0) + 1;
        });

        // Count recent activity
        if (new Date(supporter.last_active_at) > oneDayAgo) {
          analytics.recentActivity++;
        }
      });

      // Calculate engagement rate (supporters with completed actions / total supporters)
      const supportersWithActions = supporters.filter(s => 
        s.actions_completed && s.actions_completed.length > 0
      ).length;
      
      analytics.engagementRate = supporters.length > 0 ? 
        (supportersWithActions / supporters.length) * 100 : 0;

      return analytics;
    } catch (error) {
      console.error('Error fetching protest analytics:', error);
      return {
        totalSupporters: 0,
        supportersByLevel: { interested: 0, participating: 0, committed: 0 },
        actionsCompleted: {},
        recentActivity: 0,
        engagementRate: 0
      };
    }
  }

  /**
   * Update supporter activity
   */
  private async updateSupporterActivity(
    protestId: string,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    try {
      let query = supabase
        .from('virtual_protest_supporters')
        .update({ last_active_at: new Date().toISOString() })
        .eq('protest_id', protestId);

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (sessionId) {
        query = query.eq('anonymous_id', sessionId);
      } else {
        return;
      }

      await query;
    } catch (error) {
      console.error('Error updating supporter activity:', error);
    }
  }

  /**
   * Log anonymous protest creation
   */
  private async logAnonymousProtestCreation(
    sessionId: string,
    protestId: string
  ): Promise<void> {
    try {
      await supabase
        .from('privacy_audit_log')
        .insert({
          user_id: null,
          session_id: sessionId,
          action: 'virtual_protest_created',
          details: {
            protest_id: protestId,
            privacy_level: 'anonymous'
          }
        });
    } catch (error) {
      console.error('Error logging anonymous protest creation:', error);
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.protests = [];
    this.lastFetch = 0;
  }
}

export const virtualProtestServiceEnhanced = VirtualProtestServiceEnhanced.getInstance();
