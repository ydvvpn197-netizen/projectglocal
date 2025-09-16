import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  is_verified: boolean;
  user_type: 'user' | 'artist';
  created_at: string;
  updated_at: string;
}

export interface ArtistProfile {
  id: string;
  user_id: string;
  specialty: string[];
  experience_years: number;
  portfolio_urls: string[];
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  bio?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

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
  
  // Privacy settings
  privacy_profile?: boolean;
  show_location?: boolean;
  show_contact_info?: boolean;
  allow_messages_from?: 'all' | 'followers' | 'none';
  
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
  
  // Appearance settings
  dark_mode?: boolean;
  language?: string;
  timezone?: string;
  
  // Security settings
  two_factor_enabled?: boolean;
  login_notifications?: boolean;
}

export interface CreateUserProfileData {
  user_id: string;
  user_type: 'user' | 'artist';
  display_name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
}

export interface CreateArtistProfileData {
  user_id: string;
  specialty: string[];
  experience_years: number;
  portfolio_urls: string[];
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  bio?: string;
  is_available?: boolean;
}

export class UserService {
  /**
   * Create a user profile after signup
   */
  static async createUserProfile(data: CreateUserProfileData): Promise<{ success: boolean; error?: string }> {
    try {
      // Create the main profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user_id,
          user_type: data.user_type,
          display_name: data.display_name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          bio: data.bio,
          location_city: data.location_city,
          location_state: data.location_state,
          location_country: data.location_country,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return { success: false, error: profileError.message };
      }

      // If user is an artist, create artist profile
      if (data.user_type === 'artist') {
        const { error: artistError } = await supabase
          .from('artists')
          .insert({
            user_id: data.user_id,
            specialty: [],
            experience_years: 0,
            portfolio_urls: [],
            is_available: true,
          });

        if (artistError) {
          console.error('Error creating artist profile:', artistError);
          return { success: false, error: artistError.message };
        }
      }

      // Create default notification settings
      const { error: notificationError } = await supabase
        .from('user_notification_settings')
        .insert({
          user_id: data.user_id,
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
        });

      if (notificationError) {
        console.error('Error creating notification settings:', notificationError);
        // Don't fail the entire operation for notification settings
      }

      return { success: true };
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get user profile with role information
   */
  static async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; artistProfile?: ArtistProfile | null; error?: string }> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return { profile: null, error: profileError.message };
      }

      let artistProfile: ArtistProfile | null = null;
      
      // If user is an artist, fetch artist profile
      if (profile.user_type === 'artist') {
        const { data: artist, error: artistError } = await supabase
          .from('artists')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (artistError) {
          console.error('Error fetching artist profile:', artistError);
        } else {
          artistProfile = artist;
        }
      }

      return { profile, artistProfile };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return { profile: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update artist profile
   */
  static async updateArtistProfile(userId: string, updates: Partial<ArtistProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('artists')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating artist profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateArtistProfile:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get user settings
   */
  static async getUserSettings(userId: string): Promise<{ settings: UserSettings | null; error?: string }> {
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

      const profile = profileResult.data;
      const notifications = notificationResult.data;

      if (profileResult.error) {
        console.error('Error fetching profile:', profileResult.error);
        return { settings: null, error: profileResult.error.message };
      }

      if (notificationResult.error) {
        console.error('Error fetching notification settings:', notificationResult.error);
        return { settings: null, error: notificationResult.error.message };
      }

      const settings: UserSettings = {
        // Profile settings
        display_name: profile?.display_name,
        bio: profile?.bio,
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        phone_number: profile?.phone_number,
        website_url: profile?.website_url,
        
        // Location settings
        location_city: profile?.location_city,
        location_state: profile?.location_state,
        location_country: profile?.location_country,
        real_time_location_enabled: profile?.real_time_location_enabled,
        
        // Privacy settings
        privacy_profile: profile?.privacy_profile,
        show_location: profile?.show_location,
        show_contact_info: profile?.show_contact_info,
        allow_messages_from: profile?.allow_messages_from,
        
        // Notification settings
        email_notifications: notifications?.email_notifications,
        push_notifications: notifications?.push_notifications,
        booking_notifications: notifications?.booking_notifications,
        message_notifications: notifications?.message_notifications,
        follower_notifications: notifications?.follower_notifications,
        event_notifications: notifications?.event_notifications,
        discussion_notifications: notifications?.discussion_notifications,
        payment_notifications: notifications?.payment_notifications,
        system_notifications: notifications?.system_notifications,
        marketing_notifications: notifications?.marketing_notifications,
        quiet_hours_enabled: notifications?.quiet_hours_enabled,
        quiet_hours_start: notifications?.quiet_hours_start,
        quiet_hours_end: notifications?.quiet_hours_end,
        
        // Appearance settings
        dark_mode: profile?.dark_mode,
        language: profile?.language,
        timezone: profile?.timezone,
        
        // Security settings
        two_factor_enabled: profile?.two_factor_enabled,
        login_notifications: profile?.login_notifications,
      };

      return { settings };
    } catch (error) {
      console.error('Error in getUserSettings:', error);
      return { settings: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update user settings
   */
  static async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<{ success: boolean; error?: string }> {
    try {
      const profileUpdates: Record<string, unknown> = {};
      const notificationUpdates: Record<string, unknown> = {};

      // Separate profile and notification updates
      if (settings.display_name !== undefined) profileUpdates.display_name = settings.display_name;
      if (settings.bio !== undefined) profileUpdates.bio = settings.bio;
      if (settings.first_name !== undefined) profileUpdates.first_name = settings.first_name;
      if (settings.last_name !== undefined) profileUpdates.last_name = settings.last_name;
      if (settings.phone_number !== undefined) profileUpdates.phone_number = settings.phone_number;
      if (settings.website_url !== undefined) profileUpdates.website_url = settings.website_url;
      if (settings.location_city !== undefined) profileUpdates.location_city = settings.location_city;
      if (settings.location_state !== undefined) profileUpdates.location_state = settings.location_state;
      if (settings.location_country !== undefined) profileUpdates.location_country = settings.location_country;
      if (settings.real_time_location_enabled !== undefined) profileUpdates.real_time_location_enabled = settings.real_time_location_enabled;
      if (settings.privacy_profile !== undefined) profileUpdates.privacy_profile = settings.privacy_profile;
      if (settings.show_location !== undefined) profileUpdates.show_location = settings.show_location;
      if (settings.show_contact_info !== undefined) profileUpdates.show_contact_info = settings.show_contact_info;
      if (settings.allow_messages_from !== undefined) profileUpdates.allow_messages_from = settings.allow_messages_from;
      if (settings.dark_mode !== undefined) profileUpdates.dark_mode = settings.dark_mode;
      if (settings.language !== undefined) profileUpdates.language = settings.language;
      if (settings.timezone !== undefined) profileUpdates.timezone = settings.timezone;
      if (settings.two_factor_enabled !== undefined) profileUpdates.two_factor_enabled = settings.two_factor_enabled;
      if (settings.login_notifications !== undefined) profileUpdates.login_notifications = settings.login_notifications;

      // Extract notification-related fields
      if (settings.email_notifications !== undefined) notificationUpdates.email_notifications = settings.email_notifications;
      if (settings.push_notifications !== undefined) notificationUpdates.push_notifications = settings.push_notifications;
      if (settings.booking_notifications !== undefined) notificationUpdates.booking_notifications = settings.booking_notifications;
      if (settings.message_notifications !== undefined) notificationUpdates.message_notifications = settings.message_notifications;
      if (settings.follower_notifications !== undefined) notificationUpdates.follower_notifications = settings.follower_notifications;
      if (settings.event_notifications !== undefined) notificationUpdates.event_notifications = settings.event_notifications;
      if (settings.discussion_notifications !== undefined) notificationUpdates.discussion_notifications = settings.discussion_notifications;
      if (settings.payment_notifications !== undefined) notificationUpdates.payment_notifications = settings.payment_notifications;
      if (settings.system_notifications !== undefined) notificationUpdates.system_notifications = settings.system_notifications;
      if (settings.marketing_notifications !== undefined) notificationUpdates.marketing_notifications = settings.marketing_notifications;
      if (settings.quiet_hours_enabled !== undefined) notificationUpdates.quiet_hours_enabled = settings.quiet_hours_enabled;
      if (settings.quiet_hours_start !== undefined) notificationUpdates.quiet_hours_start = settings.quiet_hours_start;
      if (settings.quiet_hours_end !== undefined) notificationUpdates.quiet_hours_end = settings.quiet_hours_end;

      // Update profile if there are profile updates
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('user_id', userId);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          return { success: false, error: profileError.message };
        }
      }

      // Update notification settings if there are notification updates
      if (Object.keys(notificationUpdates).length > 0) {
        const { error: notificationError } = await supabase
          .from('user_notification_settings')
          .update(notificationUpdates)
          .eq('user_id', userId);

        if (notificationError) {
          console.error('Error updating notification settings:', notificationError);
          return { success: false, error: notificationError.message };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateUserSettings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Check if user has specific role
   */
  static async hasRole(userId: string, role: 'user' | 'artist'): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error checking user role:', error);
        return false;
      }

      return data?.user_type === role;
    } catch (error) {
      console.error('Error in hasRole:', error);
      return false;
    }
  }

  /**
   * Get user's role
   */
  static async getUserRole(userId: string): Promise<'user' | 'artist' | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting user role:', error);
        return null;
      }

      return data?.user_type || null;
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return null;
    }
  }
}
