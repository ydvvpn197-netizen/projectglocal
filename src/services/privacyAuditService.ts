import { supabase } from '@/integrations/supabase/client';

export interface PrivacyAuditLog {
  id: string;
  user_id: string;
  action_type: 'identity_reveal' | 'identity_hide' | 'privacy_setting_change' | 'anonymous_post' | 'data_access' | 'data_deletion';
  resource_type: 'profile' | 'post' | 'comment' | 'event' | 'service' | 'message';
  resource_id?: string;
  old_value?: unknown;
  new_value?: unknown;
  ip_address?: string;
  user_agent?: string;
  location?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface PrivacySettings {
  anonymous_posting_enabled: boolean;
  location_sharing_level: 'none' | 'city' | 'precise';
  profile_visibility: 'public' | 'friends' | 'private';
  data_collection_consent: boolean;
  marketing_emails: boolean;
  analytics_tracking: boolean;
}

export class PrivacyAuditService {
  /**
   * Log a privacy-related action
   */
  static async logAction(
    actionType: PrivacyAuditLog['action_type'],
    resourceType: PrivacyAuditLog['resource_type'],
    resourceId?: string,
    oldValue?: unknown,
    newValue?: unknown,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's IP and location (if available)
      const ipAddress = await this.getClientIP();
      const location = await this.getUserLocation();

      const auditLog: Omit<PrivacyAuditLog, 'id' | 'timestamp'> = {
        user_id: user.id,
        action_type: actionType,
        resource_type: resourceType,
        resource_id: resourceId,
        old_value: oldValue,
        new_value: newValue,
        ip_address: ipAddress,
        user_agent: navigator.userAgent,
        location: location,
        metadata: metadata
      };

      const { error } = await supabase
        .from('privacy_audit_logs')
        .insert(auditLog);

      if (error) {
        console.error('Error logging privacy action:', error);
      }
    } catch (error) {
      console.error('Error in privacy audit logging:', error);
    }
  }

  /**
   * Log identity reveal/hide actions
   */
  static async logIdentityReveal(
    resourceType: PrivacyAuditLog['resource_type'],
    resourceId: string,
    isRevealed: boolean,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logAction(
      isRevealed ? 'identity_reveal' : 'identity_hide',
      resourceType,
      resourceId,
      { anonymous: !isRevealed },
      { anonymous: isRevealed },
      metadata
    );
  }

  /**
   * Log privacy setting changes
   */
  static async logPrivacySettingChange(
    setting: keyof PrivacySettings,
    oldValue: unknown,
    newValue: unknown,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logAction(
      'privacy_setting_change',
      'profile',
      undefined,
      { [setting]: oldValue },
      { [setting]: newValue },
      { setting, ...metadata }
    );
  }

  /**
   * Log anonymous posting
   */
  static async logAnonymousPost(
    resourceType: PrivacyAuditLog['resource_type'],
    resourceId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logAction(
      'anonymous_post',
      resourceType,
      resourceId,
      undefined,
      { anonymous: true },
      metadata
    );
  }

  /**
   * Log data access
   */
  static async logDataAccess(
    resourceType: PrivacyAuditLog['resource_type'],
    resourceId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logAction(
      'data_access',
      resourceType,
      resourceId,
      undefined,
      { accessed: true },
      metadata
    );
  }

  /**
   * Log data deletion
   */
  static async logDataDeletion(
    resourceType: PrivacyAuditLog['resource_type'],
    resourceId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logAction(
      'data_deletion',
      resourceType,
      resourceId,
      undefined,
      { deleted: true },
      metadata
    );
  }

  /**
   * Get user's privacy audit logs
   */
  static async getUserAuditLogs(
    limit: number = 50,
    offset: number = 0
  ): Promise<PrivacyAuditLog[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('privacy_audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching privacy audit logs:', error);
      return [];
    }
  }

  /**
   * Get privacy audit summary
   */
  static async getPrivacyAuditSummary(): Promise<{
    total_actions: number;
    identity_reveals: number;
    privacy_changes: number;
    anonymous_posts: number;
    data_accesses: number;
    recent_actions: PrivacyAuditLog[];
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {
        total_actions: 0,
        identity_reveals: 0,
        privacy_changes: 0,
        anonymous_posts: 0,
        data_accesses: 0,
        recent_actions: []
      };

      const { data, error } = await supabase
        .from('privacy_audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      const logs = data || [];
      const summary = {
        total_actions: logs.length,
        identity_reveals: logs.filter(log => log.action_type === 'identity_reveal').length,
        privacy_changes: logs.filter(log => log.action_type === 'privacy_setting_change').length,
        anonymous_posts: logs.filter(log => log.action_type === 'anonymous_post').length,
        data_accesses: logs.filter(log => log.action_type === 'data_access').length,
        recent_actions: logs.slice(0, 10)
      };

      return summary;
    } catch (error) {
      console.error('Error fetching privacy audit summary:', error);
      return {
        total_actions: 0,
        identity_reveals: 0,
        privacy_changes: 0,
        anonymous_posts: 0,
        data_accesses: 0,
        recent_actions: []
      };
    }
  }

  /**
   * Export user's privacy data
   */
  static async exportPrivacyData(): Promise<{
    audit_logs: PrivacyAuditLog[];
    privacy_settings: PrivacySettings;
    anonymous_usernames: unknown[];
    export_timestamp: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all audit logs
      const { data: auditLogs } = await supabase
        .from('privacy_audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true });

      // Get privacy settings
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get anonymous usernames
      const { data: anonymousUsernames } = await supabase
        .from('anonymous_usernames')
        .select('*')
        .eq('user_id', user.id);

      return {
        audit_logs: auditLogs || [],
        privacy_settings: {
          anonymous_posting_enabled: profile?.anonymous_posting_enabled || false,
          location_sharing_level: profile?.location_sharing_level || 'city',
          profile_visibility: profile?.profile_visibility || 'public',
          data_collection_consent: profile?.data_collection_consent || false,
          marketing_emails: profile?.marketing_emails || false,
          analytics_tracking: profile?.analytics_tracking || false
        },
        anonymous_usernames: anonymousUsernames || [],
        export_timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting privacy data:', error);
      throw error;
    }
  }

  /**
   * Delete user's privacy data
   */
  static async deletePrivacyData(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete audit logs
      await supabase
        .from('privacy_audit_logs')
        .delete()
        .eq('user_id', user.id);

      // Delete anonymous usernames
      await supabase
        .from('anonymous_usernames')
        .delete()
        .eq('user_id', user.id);

      // Reset privacy settings to defaults
      await supabase
        .from('profiles')
        .update({
          anonymous_posting_enabled: false,
          location_sharing_level: 'city',
          profile_visibility: 'public',
          data_collection_consent: false,
          marketing_emails: false,
          analytics_tracking: false
        })
        .eq('user_id', user.id);

      // Log the deletion
      await this.logDataDeletion('profile', user.id, { 
        action: 'complete_privacy_data_deletion' 
      });
    } catch (error) {
      console.error('Error deleting privacy data:', error);
      throw error;
    }
  }

  /**
   * Get client IP address (simplified)
   */
  private static async getClientIP(): Promise<string | undefined> {
    try {
      // This is a simplified implementation
      // In production, you'd get this from your backend
      return '127.0.0.1';
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Get user location (simplified)
   */
  private static async getUserLocation(): Promise<string | undefined> {
    try {
      // This is a simplified implementation
      // In production, you'd get this from geolocation or IP
      return 'Unknown';
    } catch (error) {
      return undefined;
    }
  }
}
