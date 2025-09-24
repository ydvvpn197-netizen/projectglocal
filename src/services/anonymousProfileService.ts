import { supabase } from '@/integrations/supabase/client';
import type { 
  AnonymousProfile, 
  AnonymousUser, 
  CreateAnonymousProfileData, 
  UpdateAnonymousProfileData,
  AnonymousPreferences,
  AnonymousActivity,
  AnonymousProfileStats
} from '@/types/anonymous';

export interface AnonymousProfileServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export class AnonymousProfileService {
  /**
   * Generate a unique anonymous username
   */
  private generateAnonymousUsername(): string {
    const prefix = 'User_';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Create an anonymous profile for a user
   */
  async createAnonymousProfile(data: CreateAnonymousProfileData): Promise<AnonymousProfileServiceResult<AnonymousProfile>> {
    try {
      // Generate unique anonymous ID and username
      const anonymousId = crypto.randomUUID();
      const displayName = data.custom_display_name || this.generateAnonymousUsername();

      // Create anonymous profile
      const { data: profile, error: profileError } = await supabase
        .from('anonymous_profiles')
        .insert({
          user_id: data.user_id,
          anonymous_id: anonymousId,
          display_name: displayName,
          reveal_identity: data.reveal_identity || false,
          privacy_level: data.privacy_level,
          location_sharing: data.location_sharing
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create anonymous user record
      const { error: userError } = await supabase
        .from('anonymous_users')
        .insert({
          user_id: data.user_id,
          anonymous_profile_id: profile.id,
          is_anonymous_mode: data.privacy_level === 'anonymous'
        });

      if (userError) throw userError;

      // Create default anonymous preferences
      const { error: prefsError } = await supabase
        .from('anonymous_preferences')
        .insert({
          user_id: data.user_id,
          default_privacy_level: data.privacy_level,
          default_location_sharing: data.location_sharing
        });

      if (prefsError) throw prefsError;

      return {
        success: true,
        data: {
          display_name: profile.display_name,
          reveal_identity: profile.reveal_identity,
          privacy_level: profile.privacy_level,
          location_sharing: profile.location_sharing,
          anonymous_id: profile.anonymous_id,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }
      };
    } catch (error) {
      console.error('Error creating anonymous profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create anonymous profile'
      };
    }
  }

  /**
   * Get anonymous profile for a user
   */
  async getAnonymousProfile(userId: string): Promise<AnonymousProfileServiceResult<AnonymousProfile>> {
    try {
      const { data, error } = await supabase
        .from('anonymous_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          display_name: data.display_name,
          reveal_identity: data.reveal_identity,
          privacy_level: data.privacy_level,
          location_sharing: data.location_sharing,
          anonymous_id: data.anonymous_id,
          created_at: data.created_at,
          updated_at: data.updated_at
        }
      };
    } catch (error) {
      console.error('Error fetching anonymous profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch anonymous profile'
      };
    }
  }

  /**
   * Update anonymous profile
   */
  async updateAnonymousProfile(
    userId: string, 
    updates: UpdateAnonymousProfileData
  ): Promise<AnonymousProfileServiceResult<AnonymousProfile>> {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString()
      };

      if (updates.privacy_level) updateData.privacy_level = updates.privacy_level;
      if (updates.location_sharing) updateData.location_sharing = updates.location_sharing;
      if (updates.reveal_identity !== undefined) updateData.reveal_identity = updates.reveal_identity;
      if (updates.display_name) updateData.display_name = updates.display_name;

      const { data, error } = await supabase
        .from('anonymous_profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          display_name: data.display_name,
          reveal_identity: data.reveal_identity,
          privacy_level: data.privacy_level,
          location_sharing: data.location_sharing,
          anonymous_id: data.anonymous_id,
          created_at: data.created_at,
          updated_at: data.updated_at
        }
      };
    } catch (error) {
      console.error('Error updating anonymous profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update anonymous profile'
      };
    }
  }

  /**
   * Get anonymous user data
   */
  async getAnonymousUser(userId: string): Promise<AnonymousProfileServiceResult<AnonymousUser>> {
    try {
      const { data, error } = await supabase
        .from('anonymous_users')
        .select(`
          *,
          anonymous_profiles (*)
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          user_id: data.user_id,
          anonymous_profile: data.anonymous_profiles,
          is_anonymous_mode: data.is_anonymous_mode,
          last_anonymous_activity: data.last_anonymous_activity
        }
      };
    } catch (error) {
      console.error('Error fetching anonymous user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch anonymous user'
      };
    }
  }

  /**
   * Toggle anonymous mode
   */
  async toggleAnonymousMode(userId: string, enabled: boolean): Promise<AnonymousProfileServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from('anonymous_users')
        .update({ 
          is_anonymous_mode: enabled,
          last_anonymous_activity: enabled ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      return {
        success: true,
        data: enabled
      };
    } catch (error) {
      console.error('Error toggling anonymous mode:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle anonymous mode'
      };
    }
  }

  /**
   * Get anonymous preferences
   */
  async getAnonymousPreferences(userId: string): Promise<AnonymousProfileServiceResult<AnonymousPreferences>> {
    try {
      const { data, error } = await supabase
        .from('anonymous_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          auto_anonymous_mode: data.auto_anonymous_mode,
          default_privacy_level: data.default_privacy_level,
          default_location_sharing: data.default_location_sharing,
          allow_identity_reveal: data.allow_identity_reveal,
          anonymous_notifications: data.anonymous_notifications,
          anonymous_analytics: data.anonymous_analytics
        }
      };
    } catch (error) {
      console.error('Error fetching anonymous preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch anonymous preferences'
      };
    }
  }

  /**
   * Update anonymous preferences
   */
  async updateAnonymousPreferences(
    userId: string, 
    preferences: Partial<AnonymousPreferences>
  ): Promise<AnonymousProfileServiceResult<AnonymousPreferences>> {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString()
      };

      Object.keys(preferences).forEach(key => {
        if (preferences[key as keyof AnonymousPreferences] !== undefined) {
          updateData[key] = preferences[key as keyof AnonymousPreferences];
        }
      });

      const { data, error } = await supabase
        .from('anonymous_preferences')
        .upsert({
          user_id: userId,
          ...updateData
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          auto_anonymous_mode: data.auto_anonymous_mode,
          default_privacy_level: data.default_privacy_level,
          default_location_sharing: data.default_location_sharing,
          allow_identity_reveal: data.allow_identity_reveal,
          anonymous_notifications: data.anonymous_notifications,
          anonymous_analytics: data.anonymous_analytics
        }
      };
    } catch (error) {
      console.error('Error updating anonymous preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update anonymous preferences'
      };
    }
  }

  /**
   * Record anonymous activity
   */
  async recordAnonymousActivity(activity: Omit<AnonymousActivity, 'id' | 'created_at'>): Promise<AnonymousProfileServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('anonymous_activities')
        .insert(activity);

      if (error) throw error;

      // Update last anonymous activity
      await supabase
        .from('anonymous_users')
        .update({ 
          last_anonymous_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', activity.user_id);

      return { success: true };
    } catch (error) {
      console.error('Error recording anonymous activity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record anonymous activity'
      };
    }
  }

  /**
   * Get anonymous profile statistics
   */
  async getAnonymousProfileStats(anonymousId: string): Promise<AnonymousProfileServiceResult<AnonymousProfileStats>> {
    try {
      // Get activity counts
      const { data: activities, error: activitiesError } = await supabase
        .from('anonymous_activities')
        .select('activity_type')
        .eq('anonymous_id', anonymousId);

      if (activitiesError) throw activitiesError;

      const stats = {
        total_posts: 0,
        total_comments: 0,
        total_votes: 0,
        total_protests: 0
      };

      activities?.forEach(activity => {
        switch (activity.activity_type) {
          case 'post':
            stats.total_posts++;
            break;
          case 'comment':
            stats.total_comments++;
            break;
          case 'vote':
            stats.total_votes++;
            break;
          case 'protest':
            stats.total_protests++;
            break;
        }
      });

      // Calculate reputation score (simplified)
      const reputationScore = (stats.total_posts * 5) + 
                            (stats.total_comments * 2) + 
                            (stats.total_votes * 1) + 
                            (stats.total_protests * 10);

      // Calculate anonymity level (higher privacy level = higher anonymity)
      const { data: profile } = await supabase
        .from('anonymous_profiles')
        .select('privacy_level, reveal_identity')
        .eq('anonymous_id', anonymousId)
        .single();

      let anonymityLevel = 0;
      if (profile) {
        switch (profile.privacy_level) {
          case 'anonymous':
            anonymityLevel = profile.reveal_identity ? 70 : 100;
            break;
          case 'pseudonymous':
            anonymityLevel = profile.reveal_identity ? 40 : 80;
            break;
          case 'public':
            anonymityLevel = profile.reveal_identity ? 0 : 20;
            break;
        }
      }

      // Get last activity
      const lastActivity = activities?.length > 0 
        ? activities[activities.length - 1] 
        : null;

      return {
        success: true,
        data: {
          anonymous_id: anonymousId,
          ...stats,
          reputation_score: reputationScore,
          anonymity_level: anonymityLevel,
          last_activity: lastActivity ? new Date().toISOString() : new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error fetching anonymous profile stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch anonymous profile stats'
      };
    }
  }

  /**
   * Delete anonymous profile
   */
  async deleteAnonymousProfile(userId: string): Promise<AnonymousProfileServiceResult<void>> {
    try {
      // Delete in order to respect foreign key constraints
      await supabase
        .from('anonymous_activities')
        .delete()
        .eq('user_id', userId);

      await supabase
        .from('anonymous_preferences')
        .delete()
        .eq('user_id', userId);

      await supabase
        .from('anonymous_users')
        .delete()
        .eq('user_id', userId);

      await supabase
        .from('anonymous_profiles')
        .delete()
        .eq('user_id', userId);

      return { success: true };
    } catch (error) {
      console.error('Error deleting anonymous profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete anonymous profile'
      };
    }
  }

  /**
   * Check if user has anonymous profile
   */
  async hasAnonymousProfile(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('anonymous_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get anonymous profile by anonymous ID
   */
  async getAnonymousProfileById(anonymousId: string): Promise<AnonymousProfileServiceResult<AnonymousProfile>> {
    try {
      const { data, error } = await supabase
        .from('anonymous_profiles')
        .select('*')
        .eq('anonymous_id', anonymousId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          display_name: data.display_name,
          reveal_identity: data.reveal_identity,
          privacy_level: data.privacy_level,
          location_sharing: data.location_sharing,
          anonymous_id: data.anonymous_id,
          created_at: data.created_at,
          updated_at: data.updated_at
        }
      };
    } catch (error) {
      console.error('Error fetching anonymous profile by ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch anonymous profile'
      };
    }
  }
}

export const anonymousProfileService = new AnonymousProfileService();
