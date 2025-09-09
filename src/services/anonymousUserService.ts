import { supabase } from '@/integrations/supabase/client';

export interface AnonymousSession {
  id: string;
  session_id: string;
  user_agent?: string;
  ip_address?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  timezone?: string;
  language?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  created_at: string;
  last_activity: string;
  expires_at: string;
  is_active: boolean;
}

export interface AnonymousPost {
  id: string;
  session_id: string;
  post_id?: string;
  anonymous_username: string;
  content: string;
  post_type: 'discussion' | 'question' | 'announcement' | 'event' | 'poll' | 'news_comment';
  is_moderated: boolean;
  moderation_reason?: string;
  upvotes: number;
  downvotes: number;
  score: number;
  comment_count: number;
  view_count: number;
  latitude?: number;
  longitude?: number;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  created_at: string;
  updated_at: string;
}

export interface AnonymousComment {
  id: string;
  session_id: string;
  post_id?: string;
  anonymous_post_id?: string;
  parent_id?: string;
  anonymous_username: string;
  content: string;
  is_moderated: boolean;
  moderation_reason?: string;
  upvotes: number;
  downvotes: number;
  score: number;
  depth: number;
  created_at: string;
  updated_at: string;
}

export interface GovernmentAuthority {
  id: string;
  name: string;
  type: 'municipal' | 'state' | 'central' | 'local_body' | 'department';
  level: 'local' | 'district' | 'state' | 'national';
  jurisdiction: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  social_media: Record<string, string>;
  response_time_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GovernmentTag {
  id: string;
  post_id?: string;
  anonymous_post_id?: string;
  authority_id: string;
  tag_type: 'issue' | 'complaint' | 'suggestion' | 'request' | 'feedback';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  response_text?: string;
  response_date?: string;
  created_at: string;
  updated_at: string;
  authority?: GovernmentAuthority;
}

export interface PrivacySettings {
  id: string;
  user_id?: string;
  session_id?: string;
  setting_name: string;
  setting_value: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class AnonymousUserService {
  private static instance: AnonymousUserService;
  private currentSessionId: string | null = null;

  public static getInstance(): AnonymousUserService {
    if (!AnonymousUserService.instance) {
      AnonymousUserService.instance = new AnonymousUserService();
    }
    return AnonymousUserService.instance;
  }

  /**
   * Get or create anonymous session
   */
  async getOrCreateAnonymousSession(
    sessionId?: string,
    userInfo?: {
      userAgent?: string;
      ipAddress?: string;
      location?: {
        city?: string;
        state?: string;
        country?: string;
      };
      timezone?: string;
      language?: string;
      device?: {
        type?: string;
        browser?: string;
        os?: string;
      };
    }
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('get_or_create_anonymous_session', {
        p_session_id: sessionId,
        p_user_agent: userInfo?.userAgent,
        p_ip_address: userInfo?.ipAddress,
        p_location_city: userInfo?.location?.city,
        p_location_state: userInfo?.location?.state,
        p_location_country: userInfo?.location?.country,
        p_timezone: userInfo?.timezone,
        p_language: userInfo?.language,
        p_device_type: userInfo?.device?.type,
        p_browser: userInfo?.device?.browser,
        p_os: userInfo?.device?.os,
      });

      if (error) throw error;

      this.currentSessionId = data;
      return data;
    } catch (error) {
      console.error('Error getting/creating anonymous session:', error);
      throw error;
    }
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Set current session ID
   */
  setCurrentSessionId(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  /**
   * Generate anonymous username
   */
  async generateAnonymousUsername(): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('generate_anonymous_username');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating anonymous username:', error);
      // Fallback to client-side generation
      const adjectives = ['Silent', 'Mysterious', 'Curious', 'Wise', 'Bold', 'Gentle', 'Bright', 'Swift', 'Calm', 'Brave'];
      const nouns = ['Observer', 'Thinker', 'Explorer', 'Dreamer', 'Builder', 'Helper', 'Creator', 'Solver', 'Guide', 'Friend'];
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const number = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      return `${adjective}${noun}${number}`;
    }
  }

  /**
   * Create anonymous post
   */
  async createAnonymousPost(
    content: string,
    postType: AnonymousPost['post_type'],
    options?: {
      postId?: string;
      location?: {
        latitude?: number;
        longitude?: number;
        city?: string;
        state?: string;
        country?: string;
      };
    }
  ): Promise<AnonymousPost> {
    try {
      if (!this.currentSessionId) {
        throw new Error('No active anonymous session');
      }

      const username = await this.generateAnonymousUsername();

      const { data, error } = await supabase
        .from('anonymous_posts')
        .insert({
          session_id: this.currentSessionId,
          post_id: options?.postId,
          anonymous_username: username,
          content,
          post_type: postType,
          latitude: options?.location?.latitude,
          longitude: options?.location?.longitude,
          location_city: options?.location?.city,
          location_state: options?.location?.state,
          location_country: options?.location?.country,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating anonymous post:', error);
      throw error;
    }
  }

  /**
   * Create anonymous comment
   */
  async createAnonymousComment(
    content: string,
    options: {
      postId?: string;
      anonymousPostId?: string;
      parentId?: string;
    }
  ): Promise<AnonymousComment> {
    try {
      if (!this.currentSessionId) {
        throw new Error('No active anonymous session');
      }

      const username = await this.generateAnonymousUsername();

      const { data, error } = await supabase
        .from('anonymous_comments')
        .insert({
          session_id: this.currentSessionId,
          post_id: options.postId,
          anonymous_post_id: options.anonymousPostId,
          parent_id: options.parentId,
          anonymous_username: username,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating anonymous comment:', error);
      throw error;
    }
  }

  /**
   * Vote on anonymous post
   */
  async voteOnAnonymousPost(
    postId: string,
    voteType: 1 | -1 | 0
  ): Promise<void> {
    try {
      if (!this.currentSessionId) {
        throw new Error('No active anonymous session');
      }

      const { error } = await supabase
        .from('anonymous_votes')
        .upsert({
          session_id: this.currentSessionId,
          post_id: postId,
          vote_type: voteType,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error voting on anonymous post:', error);
      throw error;
    }
  }

  /**
   * Get government authorities by location
   */
  async getGovernmentAuthorities(
    location?: {
      city?: string;
      state?: string;
      country?: string;
    }
  ): Promise<GovernmentAuthority[]> {
    try {
      let query = supabase
        .from('government_authorities')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: true });

      if (location?.city) {
        query = query.or(`jurisdiction.ilike.%${location.city}%,level.eq.national`);
      } else if (location?.state) {
        query = query.or(`jurisdiction.ilike.%${location.state}%,level.eq.national`);
      } else if (location?.country) {
        query = query.or(`jurisdiction.ilike.%${location.country}%,level.eq.national`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching government authorities:', error);
      return [];
    }
  }

  /**
   * Tag government authority
   */
  async tagGovernmentAuthority(
    authorityId: string,
    options: {
      postId?: string;
      anonymousPostId?: string;
      tagType?: GovernmentTag['tag_type'];
      priority?: GovernmentTag['priority'];
    }
  ): Promise<GovernmentTag> {
    try {
      const { data, error } = await supabase
        .from('government_tags')
        .insert({
          post_id: options.postId,
          anonymous_post_id: options.anonymousPostId,
          authority_id: authorityId,
          tag_type: options.tagType || 'issue',
          priority: options.priority || 'medium',
        })
        .select(`
          *,
          authority:government_authorities(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error tagging government authority:', error);
      throw error;
    }
  }

  /**
   * Get privacy settings
   */
  async getPrivacySettings(userId?: string, sessionId?: string): Promise<PrivacySettings[]> {
    try {
      let query = supabase.from('privacy_settings').select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else if (this.currentSessionId) {
        query = query.eq('session_id', this.currentSessionId);
      } else {
        return [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      return [];
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    settingName: string,
    settingValue: Record<string, any>,
    userId?: string,
    sessionId?: string
  ): Promise<PrivacySettings> {
    try {
      const targetId = userId || sessionId || this.currentSessionId;
      if (!targetId) {
        throw new Error('No user ID or session ID provided');
      }

      const { data, error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: userId,
          session_id: sessionId || this.currentSessionId,
          setting_name: settingName,
          setting_value: settingValue,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  /**
   * Get anonymous posts
   */
  async getAnonymousPosts(
    filters?: {
      postType?: AnonymousPost['post_type'];
      location?: {
        city?: string;
        state?: string;
        country?: string;
      };
      limit?: number;
      offset?: number;
    }
  ): Promise<AnonymousPost[]> {
    try {
      let query = supabase
        .from('anonymous_posts')
        .select('*')
        .eq('is_moderated', false)
        .order('created_at', { ascending: false });

      if (filters?.postType) {
        query = query.eq('post_type', filters.postType);
      }

      if (filters?.location?.city) {
        query = query.ilike('location_city', `%${filters.location.city}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching anonymous posts:', error);
      return [];
    }
  }

  /**
   * Get anonymous comments for a post
   */
  async getAnonymousComments(
    postId?: string,
    anonymousPostId?: string
  ): Promise<AnonymousComment[]> {
    try {
      let query = supabase
        .from('anonymous_comments')
        .select('*')
        .eq('is_moderated', false)
        .order('created_at', { ascending: true });

      if (postId) {
        query = query.eq('post_id', postId);
      } else if (anonymousPostId) {
        query = query.eq('anonymous_post_id', anonymousPostId);
      } else {
        return [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching anonymous comments:', error);
      return [];
    }
  }

  /**
   * Check if user can post anonymously
   */
  async canPostAnonymously(): Promise<boolean> {
    try {
      // Check if user has pro subscription
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check subscription status for authenticated users
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium, plan_type')
          .eq('user_id', user.id)
          .single();

        if (profile?.is_premium || profile?.plan_type !== 'free') {
          return true;
        }
      }

      // Allow anonymous posting for everyone (as per your vision)
      return true;
    } catch (error) {
      console.error('Error checking anonymous posting permission:', error);
      return true; // Default to allowing anonymous posting
    }
  }

  /**
   * Get user's privacy level
   */
  async getUserPrivacyLevel(userId?: string): Promise<'public' | 'friends' | 'private' | 'anonymous'> {
    try {
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('privacy_level')
          .eq('user_id', userId)
          .single();

        return profile?.privacy_level || 'public';
      }

      return 'anonymous';
    } catch (error) {
      console.error('Error getting user privacy level:', error);
      return 'public';
    }
  }
}

// Export singleton instance
export const anonymousUserService = AnonymousUserService.getInstance();
