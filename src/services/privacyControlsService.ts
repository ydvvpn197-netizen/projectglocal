import { supabase } from '@/integrations/supabase/client';
import { PrivacyAuditService } from './privacyAuditService';

export interface PrivacyControlsConfig {
  // Identity controls
  is_anonymous: boolean;
  display_name: string | null;
  real_name: string | null;
  first_name: string | null;
  last_name: string | null;
  
  // Privacy levels
  privacy_level: 'public' | 'friends' | 'private' | 'anonymous';
  
  // Location sharing
  location_sharing: boolean;
  precise_location: boolean;
  location_history: boolean;
  
  // Activity controls
  anonymous_posts: boolean;
  anonymous_comments: boolean;
  anonymous_votes: boolean;
  
  // Data controls
  analytics_enabled: boolean;
  personalization_enabled: boolean;
  marketing_emails: boolean;
  
  // Visibility controls
  profile_visibility: 'public' | 'friends' | 'private';
  activity_visibility: 'public' | 'friends' | 'private';
  show_posts: boolean;
  show_events: boolean;
  show_services: boolean;
  show_followers: boolean;
  show_following: boolean;
}

export interface AnonymousUserConfig {
  session_id: string;
  display_name: string;
  avatar_url?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
}

export interface IdentityRevealRequest {
  resource_type: 'profile' | 'post' | 'comment' | 'event' | 'service' | 'message';
  resource_id: string;
  reveal: boolean;
  metadata?: Record<string, string | number | boolean>;
}

export class PrivacyControlsService {
  /**
   * Get current user's privacy controls configuration
   */
  static async getPrivacyControls(): Promise<PrivacyControlsConfig | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: privacySettings } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) return null;

      return {
        is_anonymous: profile.is_anonymous || false,
        display_name: profile.display_name,
        real_name: profile.real_name,
        first_name: profile.first_name,
        last_name: profile.last_name,
        privacy_level: profile.privacy_level || 'public',
        location_sharing: profile.real_time_location_enabled || false,
        precise_location: privacySettings?.precise_location || false,
        location_history: privacySettings?.location_history || false,
        anonymous_posts: privacySettings?.anonymous_posts || false,
        anonymous_comments: privacySettings?.anonymous_comments || false,
        anonymous_votes: privacySettings?.anonymous_votes || false,
        analytics_enabled: privacySettings?.analytics_enabled !== false,
        personalization_enabled: privacySettings?.personalization_enabled !== false,
        marketing_emails: privacySettings?.marketing_emails || false,
        profile_visibility: privacySettings?.profile_visibility || 'public',
        activity_visibility: privacySettings?.activity_visibility || 'public',
        show_posts: privacySettings?.show_posts !== false,
        show_events: privacySettings?.show_events !== false,
        show_services: privacySettings?.show_services !== false,
        show_followers: privacySettings?.show_followers !== false,
        show_following: privacySettings?.show_following !== false,
      };
    } catch (error) {
      console.error('Error fetching privacy controls:', error);
      return null;
    }
  }

  /**
   * Update privacy controls configuration
   */
  static async updatePrivacyControls(
    updates: Partial<PrivacyControlsConfig>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Update profile fields
      const profileUpdates: Record<string, unknown> = {};
      const privacyUpdates: Record<string, unknown> = {};

      if (updates.is_anonymous !== undefined) profileUpdates.is_anonymous = updates.is_anonymous;
      if (updates.display_name !== undefined) profileUpdates.display_name = updates.display_name;
      if (updates.real_name !== undefined) profileUpdates.real_name = updates.real_name;
      if (updates.first_name !== undefined) profileUpdates.first_name = updates.first_name;
      if (updates.last_name !== undefined) profileUpdates.last_name = updates.last_name;
      if (updates.privacy_level !== undefined) profileUpdates.privacy_level = updates.privacy_level;
      if (updates.location_sharing !== undefined) profileUpdates.real_time_location_enabled = updates.location_sharing;

      if (updates.precise_location !== undefined) privacyUpdates.precise_location = updates.precise_location;
      if (updates.location_history !== undefined) privacyUpdates.location_history = updates.location_history;
      if (updates.anonymous_posts !== undefined) privacyUpdates.anonymous_posts = updates.anonymous_posts;
      if (updates.anonymous_comments !== undefined) privacyUpdates.anonymous_comments = updates.anonymous_comments;
      if (updates.anonymous_votes !== undefined) privacyUpdates.anonymous_votes = updates.anonymous_votes;
      if (updates.analytics_enabled !== undefined) privacyUpdates.analytics_enabled = updates.analytics_enabled;
      if (updates.personalization_enabled !== undefined) privacyUpdates.personalization_enabled = updates.personalization_enabled;
      if (updates.marketing_emails !== undefined) privacyUpdates.marketing_emails = updates.marketing_emails;
      if (updates.profile_visibility !== undefined) privacyUpdates.profile_visibility = updates.profile_visibility;
      if (updates.activity_visibility !== undefined) privacyUpdates.activity_visibility = updates.activity_visibility;
      if (updates.show_posts !== undefined) privacyUpdates.show_posts = updates.show_posts;
      if (updates.show_events !== undefined) privacyUpdates.show_events = updates.show_events;
      if (updates.show_services !== undefined) privacyUpdates.show_services = updates.show_services;
      if (updates.show_followers !== undefined) privacyUpdates.show_followers = updates.show_followers;
      if (updates.show_following !== undefined) privacyUpdates.show_following = updates.show_following;

      // Update profile table
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('user_id', user.id);

        if (profileError) throw profileError;
      }

      // Update privacy settings table
      if (Object.keys(privacyUpdates).length > 0) {
        const { error: privacyError } = await supabase
          .from('privacy_settings')
          .upsert({
            user_id: user.id,
            ...privacyUpdates,
            updated_at: new Date().toISOString()
          });

        if (privacyError) throw privacyError;
      }

      // Log privacy setting changes
      for (const [key, value] of Object.entries(updates)) {
        await PrivacyAuditService.logPrivacySettingChange(
          key as keyof PrivacyControlsConfig,
          null, // We don't have old value here
          value,
          { timestamp: new Date().toISOString() }
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating privacy controls:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update privacy controls' 
      };
    }
  }

  /**
   * Toggle anonymous mode
   */
  static async toggleAnonymousMode(enabled: boolean): Promise<{ success: boolean; error?: string }> {
    return this.updatePrivacyControls({ is_anonymous: enabled });
  }

  /**
   * Create or update anonymous user session
   */
  static async createAnonymousUser(config: AnonymousUserConfig): Promise<{ success: boolean; error?: string; anonymousUserId?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if anonymous user already exists for this session
      const { data: existing } = await supabase
        .from('anonymous_users')
        .select('id')
        .eq('session_id', config.session_id)
        .single();

      if (existing) {
        return { success: true, anonymousUserId: existing.id };
      }

      // Create new anonymous user
      const { data, error } = await supabase
        .from('anonymous_users')
        .insert({
          session_id: config.session_id,
          user_id: user.id,
          display_name: config.display_name,
          avatar_url: config.avatar_url,
          location_city: config.location_city,
          location_state: config.location_state,
          location_country: config.location_country,
        })
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, anonymousUserId: data.id };
    } catch (error) {
      console.error('Error creating anonymous user:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create anonymous user' 
      };
    }
  }

  /**
   * Handle identity reveal/hide for specific resources
   */
  static async toggleIdentityReveal(request: IdentityRevealRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Log the identity change
      await PrivacyAuditService.logIdentityReveal(
        request.resource_type,
        request.resource_id,
        request.reveal,
        {
          user_id: user.id,
          timestamp: new Date().toISOString(),
          ...request.metadata
        }
      );

      // Update the specific resource based on type
      const updateData: Record<string, unknown> = { is_anonymous: !request.reveal };
      
      if (request.reveal) {
        // When revealing, we might want to set the user_id or remove anonymous_user_id
        updateData.user_id = user.id;
        updateData.anonymous_user_id = null;
      } else {
        // When hiding, set anonymous_user_id and clear user_id
        updateData.user_id = null;
        // We'd need to get or create an anonymous user ID here
      }

      const { error } = await supabase
        .from(this.getTableName(request.resource_type))
        .update(updateData)
        .eq('id', request.resource_id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error toggling identity reveal:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to toggle identity reveal' 
      };
    }
  }

  /**
   * Get anonymous interaction statistics
   */
  static async getAnonymousInteractionStats(): Promise<{
    total_anonymous_posts: number;
    total_anonymous_comments: number;
    total_anonymous_votes: number;
    identity_reveals: number;
    identity_hides: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          total_anonymous_posts: 0,
          total_anonymous_comments: 0,
          total_anonymous_votes: 0,
          identity_reveals: 0,
          identity_hides: 0,
        };
      }

      // Get anonymous post count
      const { count: anonymousPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_anonymous', true);

      // Get anonymous comment count
      const { count: anonymousComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_anonymous', true);

      // Get anonymous vote count
      const { count: anonymousVotes } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_anonymous', true);

      // Get identity reveal/hide counts from audit logs
      const auditSummary = await PrivacyAuditService.getPrivacyAuditSummary();

      return {
        total_anonymous_posts: anonymousPosts || 0,
        total_anonymous_comments: anonymousComments || 0,
        total_anonymous_votes: anonymousVotes || 0,
        identity_reveals: auditSummary.identity_reveals,
        identity_hides: auditSummary.total_actions - auditSummary.identity_reveals,
      };
    } catch (error) {
      console.error('Error getting anonymous interaction stats:', error);
      return {
        total_anonymous_posts: 0,
        total_anonymous_comments: 0,
        total_anonymous_votes: 0,
        identity_reveals: 0,
        identity_hides: 0,
      };
    }
  }

  /**
   * Check if user can reveal identity for a specific resource
   */
  static async canRevealIdentity(resourceType: string, resourceId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if user owns the resource
      const { data } = await supabase
        .from(this.getTableName(resourceType))
        .select('user_id, anonymous_user_id')
        .eq('id', resourceId)
        .single();

      if (!data) return false;

      // User can reveal if they own the resource (either as real user or anonymous user)
      return data.user_id === user.id || data.anonymous_user_id === user.id;
    } catch (error) {
      console.error('Error checking identity reveal permission:', error);
      return false;
    }
  }

  /**
   * Get the table name for a resource type
   */
  private static getTableName(resourceType: string): string {
    switch (resourceType) {
      case 'post': return 'posts';
      case 'comment': return 'comments';
      case 'event': return 'posts'; // Events are stored in posts table with type 'event'
      case 'service': return 'posts'; // Services are stored in posts table with type 'service'
      case 'message': return 'chat_messages';
      default: return 'posts';
    }
  }

  /**
   * Export all privacy-related data for the user
   */
  static async exportPrivacyData(): Promise<{
    privacy_controls: PrivacyControlsConfig | null;
    anonymous_stats: {
      total_anonymous_posts: number;
      total_anonymous_comments: number;
      total_anonymous_votes: number;
      identity_reveals: number;
      identity_hides: number;
    };
    audit_logs: Array<{
      id: string;
      action: string;
      timestamp: string;
      metadata: Record<string, unknown>;
    }>;
    export_timestamp: string;
  }> {
    try {
      const privacyControls = await this.getPrivacyControls();
      const anonymousStats = await this.getAnonymousInteractionStats();
      const auditData = await PrivacyAuditService.exportPrivacyData();

      return {
        privacy_controls: privacyControls,
        anonymous_stats: anonymousStats,
        audit_logs: auditData.audit_logs,
        export_timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exporting privacy data:', error);
      throw error;
    }
  }
}
