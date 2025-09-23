import { supabase } from '@/integrations/supabase/client';

export interface PrivacySettings {
  id?: string;
  user_id: string;
  
  // Profile visibility settings
  profile_visibility: 'public' | 'friends' | 'private';
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  show_website: boolean;
  show_bio: boolean;
  show_avatar: boolean;
  
  // Activity visibility
  activity_visibility: 'public' | 'friends' | 'private';
  show_posts: boolean;
  show_events: boolean;
  show_services: boolean;
  show_followers: boolean;
  show_following: boolean;
  
  // Message and interaction settings
  allow_messages_from: 'all' | 'followers' | 'none';
  allow_follow_requests: boolean;
  allow_event_invites: boolean;
  allow_service_requests: boolean;
  
  // Search and discovery
  searchable: boolean;
  show_in_suggestions: boolean;
  show_in_leaderboard: boolean;
  
  // Data sharing preferences
  analytics_enabled: boolean;
  personalization_enabled: boolean;
  marketing_emails: boolean;
  
  // Anonymous mode settings
  anonymous_mode: boolean;
  anonymous_posts: boolean;
  anonymous_comments: boolean;
  anonymous_votes: boolean;
  
  // Location privacy
  location_sharing: boolean;
  precise_location: boolean;
  location_history: boolean;
  
  created_at?: string;
  updated_at?: string;
}

export interface AnonymousUser {
  id: string;
  session_id: string;
  user_id?: string;
  display_name: string;
  avatar_url?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  created_at: string;
  last_active_at: string;
}

export interface AnonymousPost {
  id: string;
  anonymous_user_id: string;
  post_type: 'post' | 'event' | 'service' | 'discussion' | 'news' | 'poll';
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  image_urls?: string[];
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  is_featured: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface AnonymousComment {
  id: string;
  anonymous_user_id: string;
  post_id: string;
  post_type: 'post' | 'event' | 'service' | 'discussion' | 'news' | 'poll' | 'anonymous_post';
  content: string;
  parent_id?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface AnonymousVote {
  id: string;
  anonymous_user_id: string;
  post_id: string;
  post_type: 'post' | 'event' | 'service' | 'discussion' | 'news' | 'poll' | 'anonymous_post';
  vote_type: 'like' | 'dislike' | 'upvote' | 'downvote';
  created_at: string;
}

export class PrivacyService {
  // Privacy Settings Management
  static async getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No privacy settings found, return default settings
          return this.getDefaultPrivacySettings(userId);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      return this.getDefaultPrivacySettings(userId);
    }
  }

  static async updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return false;
    }
  }

  static getDefaultPrivacySettings(userId: string): PrivacySettings {
    return {
      user_id: userId,
      profile_visibility: 'public',
      show_email: false,
      show_phone: false,
      show_location: true,
      show_website: true,
      show_bio: true,
      show_avatar: true,
      activity_visibility: 'public',
      show_posts: true,
      show_events: true,
      show_services: true,
      show_followers: true,
      show_following: true,
      allow_messages_from: 'all',
      allow_follow_requests: true,
      allow_event_invites: true,
      allow_service_requests: true,
      searchable: true,
      show_in_suggestions: true,
      show_in_leaderboard: true,
      analytics_enabled: true,
      personalization_enabled: true,
      marketing_emails: false,
      anonymous_mode: false,
      anonymous_posts: false,
      anonymous_comments: false,
      anonymous_votes: false,
      location_sharing: true,
      precise_location: false,
      location_history: false
    };
  }

  // Anonymous User Management
  static async getOrCreateAnonymousUser(sessionId: string): Promise<AnonymousUser | null> {
    try {
      const { data, error } = await supabase.rpc('get_or_create_anonymous_user', {
        session_id_param: sessionId
      });

      if (error) throw error;

      // Fetch the anonymous user details
      const { data: anonymousUser, error: fetchError } = await supabase
        .from('anonymous_users')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) throw fetchError;
      return anonymousUser;
    } catch (error) {
      console.error('Error getting/creating anonymous user:', error);
      return null;
    }
  }

  static async updateAnonymousUser(anonymousUserId: string, updates: Partial<AnonymousUser>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('anonymous_users')
        .update({
          ...updates,
          last_active_at: new Date().toISOString()
        })
        .eq('id', anonymousUserId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating anonymous user:', error);
      return false;
    }
  }

  // Anonymous Content Management
  static async createAnonymousPost(postData: Omit<AnonymousPost, 'id' | 'created_at' | 'updated_at'>): Promise<AnonymousPost | null> {
    try {
      const { data, error } = await supabase
        .from('anonymous_posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating anonymous post:', error);
      return null;
    }
  }

  static async getAnonymousPosts(postType?: string, limit: number = 20, offset: number = 0): Promise<AnonymousPost[]> {
    try {
      let query = supabase
        .from('anonymous_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (postType) {
        query = query.eq('post_type', postType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching anonymous posts:', error);
      return [];
    }
  }

  static async createAnonymousComment(commentData: Omit<AnonymousComment, 'id' | 'created_at' | 'updated_at'>): Promise<AnonymousComment | null> {
    try {
      const { data, error } = await supabase
        .from('anonymous_comments')
        .insert(commentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating anonymous comment:', error);
      return null;
    }
  }

  static async getAnonymousComments(postId: string, postType: string): Promise<AnonymousComment[]> {
    try {
      const { data, error } = await supabase
        .from('anonymous_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('post_type', postType)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching anonymous comments:', error);
      return [];
    }
  }

  static async createAnonymousVote(voteData: Omit<AnonymousVote, 'id' | 'created_at'>): Promise<AnonymousVote | null> {
    try {
      const { data, error } = await supabase
        .from('anonymous_votes')
        .insert(voteData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating anonymous vote:', error);
      return null;
    }
  }

  static async getAnonymousVotes(postId: string, postType: string): Promise<AnonymousVote[]> {
    try {
      const { data, error } = await supabase
        .from('anonymous_votes')
        .select('*')
        .eq('post_id', postId)
        .eq('post_type', postType);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching anonymous votes:', error);
      return [];
    }
  }

  // Privacy Check Functions
  static async canViewProfile(viewerId: string, profileOwnerId: string): Promise<boolean> {
    try {
      const privacySettings = await this.getPrivacySettings(profileOwnerId);
      if (!privacySettings) return true; // Default to public if no settings

      // If viewing own profile, always allow
      if (viewerId === profileOwnerId) return true;

      // Check profile visibility
      switch (privacySettings.profile_visibility) {
        case 'public':
          return true;
        case 'friends': {
          // Check if the viewer is following the user (friend relationship)
          const { data: followData } = await supabase
            .from('user_follows')
            .select('id')
            .eq('follower_id', viewerId)
            .eq('following_id', profileOwnerId)
            .single();
          return !!followData;
        }
        case 'private':
          return false;
        default:
          return true;
      }
    } catch (error) {
      console.error('Error checking profile visibility:', error);
      return true; // Default to public on error
    }
  }

  static async canSendMessage(senderId: string, recipientId: string): Promise<boolean> {
    try {
      const privacySettings = await this.getPrivacySettings(recipientId);
      if (!privacySettings) return true; // Default to allowing messages

      switch (privacySettings.allow_messages_from) {
        case 'all':
          return true;
        case 'followers': {
          // Check if the viewer is following the user
          const { data: followerData } = await supabase
            .from('user_follows')
            .select('id')
            .eq('follower_id', senderId)
            .eq('following_id', recipientId)
            .single();
          return !!followerData;
        }
        case 'none':
          return false;
        default:
          return true;
      }
    } catch (error) {
      console.error('Error checking message permissions:', error);
      return true; // Default to allowing messages on error
    }
  }

  static async canViewActivity(viewerId: string, activityOwnerId: string): Promise<boolean> {
    try {
      const privacySettings = await this.getPrivacySettings(activityOwnerId);
      if (!privacySettings) return true; // Default to public if no settings

      // If viewing own activity, always allow
      if (viewerId === activityOwnerId) return true;

      // Check activity visibility
      switch (privacySettings.activity_visibility) {
        case 'public':
          return true;
        case 'friends': {
          // Check if the viewer is following the user (friend relationship)
          const { data: activityFollowData } = await supabase
            .from('user_follows')
            .select('id')
            .eq('follower_id', viewerId)
            .eq('following_id', activityOwnerId)
            .single();
          return !!activityFollowData;
        }
        case 'private':
          return false;
        default:
          return true;
      }
    } catch (error) {
      console.error('Error checking activity visibility:', error);
      return true; // Default to public on error
    }
  }

  // Session Management for Anonymous Users
  static generateSessionId(): string {
    return 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }

  static getSessionId(): string {
    let sessionId = localStorage.getItem('anonymous_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('anonymous_session_id', sessionId);
    }
    return sessionId;
  }

  // Privacy-aware content filtering
  static async filterContentByPrivacy<T extends { user_id: string }>(
    content: T[],
    viewerId: string
  ): Promise<T[]> {
    const filteredContent: T[] = [];

    for (const item of content) {
      const canView = await this.canViewActivity(viewerId, item.user_id);
      if (canView) {
        filteredContent.push(item);
      }
    }

    return filteredContent;
  }

  // Bulk privacy settings update
  static async updateBulkPrivacySettings(
    userId: string,
    category: 'profile' | 'activity' | 'messages' | 'discovery' | 'data' | 'anonymous' | 'location',
    settings: Record<string, boolean | string>
  ): Promise<boolean> {
    try {
      const currentSettings = await this.getPrivacySettings(userId);
      if (!currentSettings) return false;

      const updatedSettings = { ...currentSettings, ...settings };
      return await this.updatePrivacySettings(userId, updatedSettings);
    } catch (error) {
      console.error('Error updating bulk privacy settings:', error);
      return false;
    }
  }
}
