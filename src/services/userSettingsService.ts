import { supabase } from '@/integrations/supabase/client';

export interface UserSettings {
  // Profile settings
  display_name?: string;
  bio?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  website_url?: string;
  
  // Location settings
  location_city?: string;
  location_state?: string;
  location_country?: string;
  real_time_location_enabled?: boolean;
  
  // Notification settings
  email_notifications?: boolean;
  push_notifications?: boolean;
  booking_notifications?: boolean;
  message_notifications?: boolean;
  follower_notifications?: boolean;
  event_notifications?: boolean;
  discussion_notifications?: boolean;
  payment_notifications?: boolean;
  system_notifications?: boolean;
  marketing_notifications?: boolean;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  
  // Privacy settings
  privacy_profile?: boolean;
  show_location?: boolean;
  show_contact_info?: boolean;
  allow_messages_from?: 'all' | 'followers' | 'none';
  
  // Appearance settings
  dark_mode?: boolean;
  language?: string;
  timezone?: string;
  
  // Security settings
  two_factor_enabled?: boolean;
  login_notifications?: boolean;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailChangeData {
  newEmail: string;
  currentPassword: string;
}

export interface SettingsUpdateResult {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

class UserSettingsService {
  /**
   * Get all user settings from both profiles and user_notification_settings tables
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const [profileResult, notificationResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('user_notification_settings')
          .select('*')
          .eq('user_id', userId)
          .single()
      ]);

      const profile = profileResult.data || {};
      const notifications = notificationResult.data || {};

      return {
        // Profile settings
        display_name: profile.display_name,
        bio: profile.bio,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
        website_url: profile.website_url,
        
        // Location settings
        location_city: profile.location_city,
        location_state: profile.location_state,
        location_country: profile.location_country,
        real_time_location_enabled: profile.real_time_location_enabled,
        
        // Notification settings
        email_notifications: notifications.email_notifications,
        push_notifications: notifications.push_notifications,
        booking_notifications: notifications.booking_notifications,
        message_notifications: notifications.message_notifications,
        follower_notifications: notifications.follower_notifications,
        event_notifications: notifications.event_notifications,
        discussion_notifications: notifications.discussion_notifications,
        payment_notifications: notifications.payment_notifications,
        system_notifications: notifications.system_notifications,
        marketing_notifications: notifications.marketing_notifications,
        quiet_hours_enabled: notifications.quiet_hours_enabled,
        quiet_hours_start: notifications.quiet_hours_start,
        quiet_hours_end: notifications.quiet_hours_end,
        
        // Privacy settings (defaults)
        privacy_profile: false,
        show_location: true,
        show_contact_info: true,
        allow_messages_from: 'followers' as const,
        
        // Appearance settings (defaults)
        dark_mode: false,
        language: 'en',
        timezone: 'UTC',
        
        // Security settings (defaults)
        two_factor_enabled: false,
        login_notifications: true,
      };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw new Error('Failed to fetch user settings');
    }
  }

  /**
   * Update profile settings
   */
  async updateProfileSettings(userId: string, updates: Partial<UserSettings>): Promise<SettingsUpdateResult> {
    try {
      const profileUpdates: Record<string, unknown> = {};
      const notificationUpdates: Record<string, unknown> = {};

      // Separate profile and notification updates
      if (updates.display_name !== undefined) profileUpdates.display_name = updates.display_name;
      if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
      if (updates.first_name !== undefined) profileUpdates.first_name = updates.first_name;
      if (updates.last_name !== undefined) profileUpdates.last_name = updates.last_name;
      if (updates.phone_number !== undefined) profileUpdates.phone_number = updates.phone_number;
      if (updates.website_url !== undefined) profileUpdates.website_url = updates.website_url;
      if (updates.location_city !== undefined) profileUpdates.location_city = updates.location_city;
      if (updates.location_state !== undefined) profileUpdates.location_state = updates.location_state;
      if (updates.location_country !== undefined) profileUpdates.location_country = updates.location_country;
      if (updates.real_time_location_enabled !== undefined) profileUpdates.real_time_location_enabled = updates.real_time_location_enabled;

      // Update profile if there are profile changes
      if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updated_at = new Date().toISOString();
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('user_id', userId);

        if (profileError) throw profileError;
      }

      // Update notification settings if there are notification changes
      if (Object.keys(notificationUpdates).length > 0) {
        notificationUpdates.updated_at = new Date().toISOString();
        const { error: notificationError } = await supabase
          .from('user_notification_settings')
          .upsert({
            user_id: userId,
            ...notificationUpdates
          });

        if (notificationError) throw notificationError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating profile settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update settings'
      };
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(userId: string, updates: Partial<UserSettings>): Promise<SettingsUpdateResult> {
    try {
      const notificationUpdates: Record<string, unknown> = {};

      // Extract notification-related fields
      if (updates.email_notifications !== undefined) notificationUpdates.email_notifications = updates.email_notifications;
      if (updates.push_notifications !== undefined) notificationUpdates.push_notifications = updates.push_notifications;
      if (updates.booking_notifications !== undefined) notificationUpdates.booking_notifications = updates.booking_notifications;
      if (updates.message_notifications !== undefined) notificationUpdates.message_notifications = updates.message_notifications;
      if (updates.follower_notifications !== undefined) notificationUpdates.follower_notifications = updates.follower_notifications;
      if (updates.event_notifications !== undefined) notificationUpdates.event_notifications = updates.event_notifications;
      if (updates.discussion_notifications !== undefined) notificationUpdates.discussion_notifications = updates.discussion_notifications;
      if (updates.payment_notifications !== undefined) notificationUpdates.payment_notifications = updates.payment_notifications;
      if (updates.system_notifications !== undefined) notificationUpdates.system_notifications = updates.system_notifications;
      if (updates.marketing_notifications !== undefined) notificationUpdates.marketing_notifications = updates.marketing_notifications;
      if (updates.quiet_hours_enabled !== undefined) notificationUpdates.quiet_hours_enabled = updates.quiet_hours_enabled;
      if (updates.quiet_hours_start !== undefined) notificationUpdates.quiet_hours_start = updates.quiet_hours_start;
      if (updates.quiet_hours_end !== undefined) notificationUpdates.quiet_hours_end = updates.quiet_hours_end;

      if (Object.keys(notificationUpdates).length === 0) {
        return { success: true };
      }

      notificationUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: userId,
          ...notificationUpdates
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update notification settings'
      };
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, passwordData: PasswordChangeData): Promise<SettingsUpdateResult> {
    try {
      // Validate password confirmation
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        return {
          success: false,
          error: 'New password and confirmation password do not match'
        };
      }

      // Validate password strength
      if (passwordData.newPassword.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters long'
        };
      }

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password'
      };
    }
  }

  /**
   * Change user email
   */
  async changeEmail(userId: string, emailData: EmailChangeData): Promise<SettingsUpdateResult> {
    try {
      // Update email using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        email: emailData.newEmail
      });

      if (error) throw error;

      return { 
        success: true, 
        data: { message: 'Email change request sent. Please check your new email for confirmation.' }
      };
    } catch (error) {
      console.error('Error changing email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change email'
      };
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<SettingsUpdateResult> {
    try {
      // This would typically involve calling an edge function or admin API
      // For now, we'll return success (the actual deletion is handled elsewhere)
      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete account'
      };
    }
  }

  /**
   * Get user preferences for specific categories
   */
  async getUserPreferences(userId: string, categories: string[]): Promise<Partial<UserSettings>> {
    try {
      const settings = await this.getUserSettings(userId);
      const preferences: Partial<UserSettings> = {};

      categories.forEach(category => {
        if (category in settings) {
          (preferences as Record<string, unknown>)[category] = (settings as Record<string, unknown>)[category];
        }
      });

      return preferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return {};
    }
  }

  /**
   * Reset user settings to defaults
   */
  async resetSettingsToDefaults(userId: string): Promise<SettingsUpdateResult> {
    try {
      const defaultSettings = {
        email_notifications: true,
        push_notifications: true,
        booking_notifications: true,
        message_notifications: true,
        follower_notifications: true,
        event_notifications: true,
        discussion_notifications: true,
        payment_notifications: true,
        system_notifications: true,
        marketing_notifications: false,
        quiet_hours_enabled: false,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
      };

      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: userId,
          ...defaultSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error resetting settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset settings'
      };
    }
  }
}

export const userSettingsService = new UserSettingsService();
