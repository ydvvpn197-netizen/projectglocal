import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  is_verified: boolean;
  is_premium: boolean;
  plan_type: 'free' | 'pro' | 'premium';
  followers_count: number;
  following_count: number;
  posts_count: number;
  events_count: number;
  created_at: string;
  updated_at: string;
}

export interface FollowData {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface SubscriptionStatus {
  is_pro: boolean;
  plan?: {
    id: string;
    name: string;
    plan_type: string;
    features: any;
  };
  subscription?: {
    id: string;
    status: string;
    current_period_end: string;
  };
  expires_at?: string;
}

export class ProfileService {
  /**
   * Get user profile by user ID
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          followers_count:follows!following_id(count),
          following_count:follows!follower_id(count),
          posts_count:posts(count),
          events_count:posts!type(count)
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Get actual counts
      const [followersResult, followingResult, postsResult, eventsResult] = await Promise.all([
        supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
        supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId),
        supabase.from('posts').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('posts').select('id', { count: 'exact' }).eq('user_id', userId).eq('type', 'event')
      ]);

      return {
        ...data,
        followers_count: followersResult.count || 0,
        following_count: followingResult.count || 0,
        posts_count: postsResult.count || 0,
        events_count: eventsResult.count || 0,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  /**
   * Follow a user
   */
  static async followUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: followingId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  }

  /**
   * Unfollow a user
   */
  static async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  }

  /**
   * Check if user is following another user
   */
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  /**
   * Get user's subscription status
   */
  static async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const isPro = subscription && 
        subscription.status === 'active' && 
        (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date());

      return {
        is_pro: isPro,
        plan: subscription?.plan,
        subscription: subscription,
        expires_at: subscription?.current_period_end,
      };
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return { is_pro: false };
    }
  }

  /**
   * Get user's followers
   */
  static async getFollowers(userId: string, limit: number = 20, offset: number = 0): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower:profiles!follower_id(*)
        `)
        .eq('following_id', userId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(item => item.follower).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching followers:', error);
      return [];
    }
  }

  /**
   * Get user's following
   */
  static async getFollowing(userId: string, limit: number = 20, offset: number = 0): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following:profiles!following_id(*)
        `)
        .eq('follower_id', userId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(item => item.following).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  }

  /**
   * Search users
   */
  static async searchUsers(query: string, limit: number = 20): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`display_name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
}
