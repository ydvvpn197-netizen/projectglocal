
import { supabase } from '@/integrations/supabase/client';
import { FollowRelationship, FollowStats, FollowSuggestion } from '@/types/following';
import { FollowingAlgorithms } from '@/utils/followingAlgorithms';

export class FollowingService {
  private static instance: FollowingService;

  static getInstance(): FollowingService {
    if (!FollowingService.instance) {
      FollowingService.instance = new FollowingService();
    }
    return FollowingService.instance;
  }

  async followUser(followerId: string, followingId: string): Promise<FollowRelationship> {
    const { data, error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to follow user: ${error.message}`);
    }

    return data;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      throw new Error(`Failed to unfollow user: ${error.message}`);
    }
  }

  async getFollowStatus(followerId: string, followingId: string): Promise<'following' | 'not_following' | 'pending'> {
    const { data } = await supabase
      .from('user_follows')
      .select('status')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (!data) return 'not_following';
    return data.status as 'following' | 'not_following' | 'pending';
  }

  async getFollowers(userId: string, limit: number = 20): Promise<FollowRelationship[]> {
    const { data } = await supabase
      .from('user_follows')
      .select(`
        *,
        follower:profiles!user_follows_follower_id_fkey(
          user_id,
          display_name,
          avatar_url,
          bio
        )
      `)
      .eq('following_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  }

  async getFollowing(userId: string, limit: number = 20): Promise<FollowRelationship[]> {
    const { data } = await supabase
      .from('user_follows')
      .select(`
        *,
        following:profiles!user_follows_following_id_fkey(
          user_id,
          display_name,
          avatar_url,
          bio
        )
      `)
      .eq('follower_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  }

  async getFollowStats(userId: string): Promise<FollowStats> {
    // Get followers count
    const { count: followersCount } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)
      .eq('status', 'active');

    // Get following count
    const { count: followingCount } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)
      .eq('status', 'active');

    // Get followers and following data for algorithm processing
    const { data: followers } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('following_id', userId)
      .eq('status', 'active');

    const { data: following } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId)
      .eq('status', 'active');

    // Use algorithms to calculate stats
    return FollowingAlgorithms.calculateFollowStats(
      userId,
      followers || [],
      following || []
    );
  }

  async getFollowSuggestions(userId: string, limit: number = 10): Promise<FollowSuggestion[]> {
    try {
      // Get user's interests and location
      const userProfile = await this.getUserProfile(userId);
      
      // Get all users (excluding the current user and already followed)
      const allUsers = await this.getAllUsers(userId);
      
      // Generate follow suggestions using algorithms
      const suggestions = FollowingAlgorithms.generateFollowSuggestions(
        userId,
        userProfile.interests,
        userProfile.location,
        this.getExistingFollows(userId),
        allUsers,
        limit
      );
      
      return suggestions;
    } catch (error) {
      console.error('Error getting follow suggestions:', error);
      return [];
    }
  }

  async getPopularUsers(limit: number = 10): Promise<FollowSuggestion[]> {
    try {
      // Get users with most followers
      const { data: popularUsers } = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          avatar_url,
          bio,
          location_city,
          location_state
        `)
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Get more to filter

      if (!popularUsers) return [];

      const suggestions: FollowSuggestion[] = [];

      for (const user of popularUsers) {
        // Get follower count
        const { count: followersCount } = await supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.user_id)
          .eq('status', 'active');

        if (followersCount && followersCount > 5) { // Only suggest users with some followers
          suggestions.push({
            userId: user.user_id,
            displayName: user.display_name || 'Anonymous',
            avatarUrl: user.avatar_url,
            bio: user.bio,
            mutualFollowers: 0,
            commonInterests: [],
            location: user.location_city ? {
              city: user.location_city,
              state: user.location_state || ''
            } : undefined,
            score: followersCount,
            reason: 'Popular in your area'
          });
        }
      }

      return suggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting popular users:', error);
      return [];
    }
  }

  async getUsersByInterest(interest: string, limit: number = 10): Promise<FollowSuggestion[]> {
    try {
      // Find users who post about this interest
      const { data: posts } = await supabase
        .from('posts')
        .select('user_id')
        .or(`content.ilike.%${interest}%,title.ilike.%${interest}%`)
        .eq('status', 'active')
        .limit(100);

      if (!posts) return [];

      const userIds = [...new Set(posts.map(p => p.user_id))];
      
      if (userIds.length === 0) return [];

      // Get user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          avatar_url,
          bio,
          location_city,
          location_state
        `)
        .in('user_id', userIds)
        .limit(limit);

      if (!profiles) return [];

      return profiles.map(profile => ({
        userId: profile.user_id,
        displayName: profile.display_name || 'Anonymous',
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        mutualFollowers: 0,
        commonInterests: [interest],
        location: profile.location_city ? {
          city: profile.location_city,
          state: profile.location_state || ''
        } : undefined,
        score: 1,
        reason: `Interested in ${interest}`
      }));
    } catch (error) {
      console.error('Error getting users by interest:', error);
      return [];
    }
  }

  // Helper methods for algorithm integration
  private async getUserProfile(userId: string): Promise<any> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      return {
        id: userId,
        interests: preferences?.interests || [],
        location: profile?.location || null,
        skills: profile?.skills || [],
        bio: profile?.bio || ''
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { id: userId, interests: [], location: null, skills: [], bio: '' };
    }
  }

  private async getAllUsers(userId: string): Promise<any[]> {
    try {
      // Get users that the current user is already following
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', userId)
        .eq('status', 'active');

      const followingIds = following?.map(f => f.following_id) || [];

      // Get all users except current user and already followed
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .not('id', 'in', `(${followingIds.join(',')})`);

      return users || [];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  private getExistingFollows(userId: string): string[] {
    // This would typically come from a database query
    // For now, return empty array - the actual implementation would query user_follows table
    return [];
  }
}

export const followingService = FollowingService.getInstance();
