/**
 * Unified Privacy Service
 * Consolidates all privacy-related functionality into a single service
 */

import { resilientSupabase } from '@/integrations/supabase/client';

export interface PrivacySettings {
  id: string;
  user_id: string;
  profile_visibility: 'public' | 'friends' | 'private';
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  show_website: boolean;
  show_bio: boolean;
  show_avatar: boolean;
  activity_visibility: 'public' | 'friends' | 'private';
  show_posts: boolean;
  show_events: boolean;
  show_services: boolean;
  show_followers: boolean;
  show_following: boolean;
  allow_messages_from: 'all' | 'followers' | 'none';
  allow_follow_requests: boolean;
  allow_event_invites: boolean;
  allow_service_requests: boolean;
  searchable: boolean;
  show_in_suggestions: boolean;
  show_in_leaderboard: boolean;
  analytics_enabled: boolean;
  personalization_enabled: boolean;
  marketing_emails: boolean;
  anonymous_mode: boolean;
  anonymous_posts: boolean;
  anonymous_comments: boolean;
  anonymous_votes: boolean;
  location_sharing: boolean;
  precise_location: boolean;
  location_history: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnonymousPreferences {
  id: string;
  user_id: string;
  auto_anonymous_mode: boolean;
  default_privacy_level: 'anonymous' | 'pseudonymous' | 'public';
  default_location_sharing: 'none' | 'city' | 'precise';
  allow_identity_reveal: boolean;
  anonymous_notifications: boolean;
  anonymous_analytics: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnonymousHandle {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
}

export class UnifiedPrivacyService {
  /**
   * Get user's privacy settings
   */
  static async getPrivacySettings(userId: string): Promise<{ settings: PrivacySettings | null; error?: string }> {
    try {
      const { data, error } = await resilientSupabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching privacy settings:', error);
        return { settings: null, error: error.message };
      }

      return { settings: data };
    } catch (error) {
      console.error('Error in getPrivacySettings:', error);
      return { settings: null, error: 'Failed to fetch privacy settings' };
    }
  }

  /**
   * Update user's privacy settings
   */
  static async updatePrivacySettings(
    userId: string, 
    settings: Partial<PrivacySettings>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await resilientSupabase
        .from('privacy_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating privacy settings:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updatePrivacySettings:', error);
      return { success: false, error: 'Failed to update privacy settings' };
    }
  }

  /**
   * Get user's anonymous preferences
   */
  static async getAnonymousPreferences(userId: string): Promise<{ preferences: AnonymousPreferences | null; error?: string }> {
    try {
      const { data, error } = await resilientSupabase
        .from('anonymous_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching anonymous preferences:', error);
        return { preferences: null, error: error.message };
      }

      return { preferences: data };
    } catch (error) {
      console.error('Error in getAnonymousPreferences:', error);
      return { preferences: null, error: 'Failed to fetch anonymous preferences' };
    }
  }

  /**
   * Update user's anonymous preferences
   */
  static async updateAnonymousPreferences(
    userId: string, 
    preferences: Partial<AnonymousPreferences>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await resilientSupabase
        .from('anonymous_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating anonymous preferences:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateAnonymousPreferences:', error);
      return { success: false, error: 'Failed to update anonymous preferences' };
    }
  }

  /**
   * Get user's anonymous handles
   */
  static async getAnonymousHandles(userId: string): Promise<{ handles: AnonymousHandle[]; error?: string }> {
    try {
      const { data, error } = await resilientSupabase
        .from('anonymous_handles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching anonymous handles:', error);
        return { handles: [], error: error.message };
      }

      return { handles: data || [] };
    } catch (error) {
      console.error('Error in getAnonymousHandles:', error);
      return { handles: [], error: 'Failed to fetch anonymous handles' };
    }
  }

  /**
   * Create a new anonymous handle
   */
  static async createAnonymousHandle(
    userId: string,
    handle: string,
    displayName?: string
  ): Promise<{ success: boolean; handle?: AnonymousHandle; error?: string }> {
    try {
      const { data, error } = await resilientSupabase
        .from('anonymous_handles')
        .insert({
          user_id: userId,
          handle,
          display_name: displayName || handle,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating anonymous handle:', error);
        return { success: false, error: error.message };
      }

      return { success: true, handle: data };
    } catch (error) {
      console.error('Error in createAnonymousHandle:', error);
      return { success: false, error: 'Failed to create anonymous handle' };
    }
  }

  /**
   * Deactivate an anonymous handle
   */
  static async deactivateAnonymousHandle(
    userId: string,
    handleId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await resilientSupabase
        .from('anonymous_handles')
        .update({ is_active: false })
        .eq('id', handleId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deactivating anonymous handle:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deactivateAnonymousHandle:', error);
      return { success: false, error: 'Failed to deactivate anonymous handle' };
    }
  }

  /**
   * Reveal user's real identity
   */
  static async revealIdentity(
    userId: string,
    realName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update profile to show real name
      const { error: profileError } = await resilientSupabase
        .from('profiles')
        .update({
          real_name: realName,
          real_name_visibility: true,
          is_anonymous: false
        })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error revealing identity in profile:', profileError);
        return { success: false, error: profileError.message };
      }

      // Update privacy settings
      const { error: privacyError } = await resilientSupabase
        .from('privacy_settings')
        .update({
          anonymous_mode: false,
          profile_visibility: 'public'
        })
        .eq('user_id', userId);

      if (privacyError) {
        console.error('Error updating privacy settings:', privacyError);
        return { success: false, error: privacyError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in revealIdentity:', error);
      return { success: false, error: 'Failed to reveal identity' };
    }
  }

  /**
   * Hide user's real identity (go back to anonymous)
   */
  static async hideIdentity(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Update profile to hide real name
      const { error: profileError } = await resilientSupabase
        .from('profiles')
        .update({
          real_name_visibility: false,
          is_anonymous: true
        })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error hiding identity in profile:', profileError);
        return { success: false, error: profileError.message };
      }

      // Update privacy settings
      const { error: privacyError } = await resilientSupabase
        .from('privacy_settings')
        .update({
          anonymous_mode: true,
          profile_visibility: 'private'
        })
        .eq('user_id', userId);

      if (privacyError) {
        console.error('Error updating privacy settings:', privacyError);
        return { success: false, error: privacyError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in hideIdentity:', error);
      return { success: false, error: 'Failed to hide identity' };
    }
  }

  /**
   * Check if user is in anonymous mode
   */
  static async isAnonymousMode(userId: string): Promise<{ isAnonymous: boolean; error?: string }> {
    try {
      const { data, error } = await resilientSupabase
        .from('profiles')
        .select('is_anonymous, real_name_visibility')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error checking anonymous mode:', error);
        return { isAnonymous: false, error: error.message };
      }

      return { isAnonymous: data?.is_anonymous && !data?.real_name_visibility };
    } catch (error) {
      console.error('Error in isAnonymousMode:', error);
      return { isAnonymous: false, error: 'Failed to check anonymous mode' };
    }
  }

  /**
   * Get privacy recommendations for user
   */
  static async getPrivacyRecommendations(userId: string): Promise<{ recommendations: string[]; error?: string }> {
    try {
      const { settings } = await this.getPrivacySettings(userId);
      const { preferences } = await this.getAnonymousPreferences(userId);
      
      const recommendations: string[] = [];

      if (settings?.show_email) {
        recommendations.push('Consider hiding your email for better privacy');
      }

      if (settings?.show_location) {
        recommendations.push('Location sharing may compromise your privacy');
      }

      if (settings?.profile_visibility === 'public') {
        recommendations.push('Your profile is public - consider making it private');
      }

      if (!preferences?.anonymous_mode) {
        recommendations.push('Enable anonymous mode for maximum privacy');
      }

      if (settings?.marketing_emails) {
        recommendations.push('Disable marketing emails to reduce data collection');
      }

      return { recommendations };
    } catch (error) {
      console.error('Error in getPrivacyRecommendations:', error);
      return { recommendations: [], error: 'Failed to get privacy recommendations' };
    }
  }

  /**
   * Reset privacy settings to anonymous defaults
   */
  static async resetToAnonymousDefaults(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const defaultSettings = {
        profile_visibility: 'private' as const,
        show_email: false,
        show_phone: false,
        show_location: false,
        show_website: false,
        show_bio: false,
        show_avatar: false,
        activity_visibility: 'private' as const,
        show_posts: false,
        show_events: false,
        show_services: false,
        show_followers: false,
        show_following: false,
        allow_messages_from: 'none' as const,
        allow_follow_requests: false,
        allow_event_invites: false,
        allow_service_requests: false,
        searchable: false,
        show_in_suggestions: false,
        show_in_leaderboard: false,
        analytics_enabled: false,
        personalization_enabled: false,
        marketing_emails: false,
        anonymous_mode: true,
        anonymous_posts: true,
        anonymous_comments: true,
        anonymous_votes: true,
        location_sharing: false,
        precise_location: false,
        location_history: false
      };

      const { error } = await resilientSupabase
        .from('privacy_settings')
        .upsert({
          user_id: userId,
          ...defaultSettings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error resetting privacy settings:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in resetToAnonymousDefaults:', error);
      return { success: false, error: 'Failed to reset privacy settings' };
    }
  }
}

export const unifiedPrivacyService = new UnifiedPrivacyService();
