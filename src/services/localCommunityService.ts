import { supabase } from '@/integrations/supabase/client';

export interface LocalCommunity {
  id: string;
  name: string;
  description?: string;
  location_city: string;
  location_state: string;
  location_country: string;
  latitude?: number;
  longitude?: number;
  member_count: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  creator_avatar?: string;
  user_is_member?: boolean;
  user_role?: 'admin' | 'moderator' | 'member';
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  member_name?: string;
  member_avatar?: string;
}

export interface LocalCommunityWithProfile extends LocalCommunity {
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface CommunityMemberWithProfile extends CommunityMember {
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface CommunityPost {
  id: string;
  community_id: string;
  user_id: string;
  title: string;
  content: string;
  type: 'announcement' | 'discussion' | 'event' | 'poll';
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  likes_count: number;
  comments_count: number;
  user_liked?: boolean;
}

export class LocalCommunityService {
  /**
   * Get nearby communities
   */
  static async getNearbyCommunities(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 50,
    limit: number = 20
  ): Promise<{ communities: LocalCommunity[]; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_communities', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_radius_km: radiusKm,
        p_limit: limit
      });

      if (error) throw error;

      return { communities: data || [], error: null };
    } catch (error: unknown) {
      console.error('Error getting nearby communities:', error);
      return { communities: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get communities by city
   */
  static async getCommunitiesByCity(
    city: string, 
    state?: string, 
    limit: number = 20
  ): Promise<{ communities: LocalCommunity[]; error: string | null }> {
    try {
      let query = supabase
        .from('local_communities')
        .select(`
          *,
          profiles!local_communities_created_by_fkey(display_name, avatar_url),
          community_members!left(user_id)
        `)
        .eq('is_active', true)
        .ilike('location_city', `%${city}%`);

      if (state) {
        query = query.ilike('location_state', `%${state}%`);
      }

      const { data, error } = await query
        .order('member_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const communities: LocalCommunity[] = (data || []).map((community: LocalCommunityWithProfile) => ({
        id: community.id,
        name: community.name,
        description: community.description,
        location_city: community.location_city,
        location_state: community.location_state,
        location_country: community.location_country,
        latitude: community.latitude,
        longitude: community.longitude,
        member_count: community.member_count,
        is_active: community.is_active,
        created_by: community.created_by,
        created_at: community.created_at,
        updated_at: community.updated_at,
        creator_name: community.profiles?.display_name,
        creator_avatar: community.profiles?.avatar_url,
        user_is_member: community.community_members?.length > 0
      }));

      return { communities, error: null };
    } catch (error: unknown) {
      console.error('Error getting communities by city:', error);
      return { communities: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Create a new community
   */
  static async createCommunity(communityData: {
    name: string;
    description?: string;
    location_city: string;
    location_state: string;
    location_country: string;
    latitude?: number;
    longitude?: number;
  }): Promise<{ success: boolean; communityId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('local_communities')
        .insert({
          ...communityData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      await supabase
        .from('community_members')
        .insert({
          community_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      return { success: true, communityId: data.id };
    } catch (error: unknown) {
      console.error('Error creating community:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Join a community
   */
  static async joinCommunity(communityId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        return { success: false, error: 'Already a member of this community' };
      }

      // Add member
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      // Update member count
      await supabase.rpc('increment_community_member_count', {
        community_id: communityId
      });

      return { success: true };
    } catch (error: unknown) {
      console.error('Error joining community:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Leave a community
   */
  static async leaveCommunity(communityId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update member count
      await supabase.rpc('decrement_community_member_count', {
        community_id: communityId
      });

      return { success: true };
    } catch (error: unknown) {
      console.error('Error leaving community:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get community members
   */
  static async getCommunityMembers(
    communityId: string, 
    limit: number = 50
  ): Promise<{ members: CommunityMember[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          *,
          profiles!community_members_user_id_fkey(display_name, avatar_url)
        `)
        .eq('community_id', communityId)
        .order('joined_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const members: CommunityMember[] = (data || []).map((member: CommunityMemberWithProfile) => ({
        id: member.id,
        community_id: member.community_id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        member_name: member.profiles?.display_name,
        member_avatar: member.profiles?.avatar_url
      }));

      return { members, error: null };
    } catch (error: unknown) {
      console.error('Error getting community members:', error);
      return { members: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get community posts
   */
  static async getCommunityPosts(
    communityId: string, 
    limit: number = 20
  ): Promise<{ posts: CommunityPost[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles!community_posts_user_id_fkey(display_name, avatar_url),
          community_post_likes!left(user_id)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const posts: CommunityPost[] = (data || []).map((post: CommunityPost) => ({
        id: post.id,
        community_id: post.community_id,
        user_id: post.user_id,
        title: post.title,
        content: post.content,
        type: post.type,
        created_at: post.created_at,
        updated_at: post.updated_at,
        author_name: post.profiles?.display_name,
        author_avatar: post.profiles?.avatar_url,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        user_liked: post.community_post_likes?.length > 0
      }));

      return { posts, error: null };
    } catch (error: unknown) {
      console.error('Error getting community posts:', error);
      return { posts: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Create a community post
   */
  static async createCommunityPost(postData: {
    community_id: string;
    title: string;
    content: string;
    type: 'announcement' | 'discussion' | 'event' | 'poll';
  }): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          ...postData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, postId: data.id };
    } catch (error: unknown) {
      console.error('Error creating community post:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get trending communities
   */
  static async getTrendingCommunities(limit: number = 10): Promise<{ communities: LocalCommunity[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('local_communities')
        .select(`
          *,
          profiles!local_communities_created_by_fkey(display_name, avatar_url)
        `)
        .eq('is_active', true)
        .order('member_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const communities: LocalCommunity[] = (data || []).map((community: LocalCommunityWithProfile) => ({
        id: community.id,
        name: community.name,
        description: community.description,
        location_city: community.location_city,
        location_state: community.location_state,
        location_country: community.location_country,
        latitude: community.latitude,
        longitude: community.longitude,
        member_count: community.member_count,
        is_active: community.is_active,
        created_by: community.created_by,
        created_at: community.created_at,
        updated_at: community.updated_at,
        creator_name: community.profiles?.display_name,
        creator_avatar: community.profiles?.avatar_url
      }));

      return { communities, error: null };
    } catch (error: unknown) {
      console.error('Error getting trending communities:', error);
      return { communities: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Search communities
   */
  static async searchCommunities(
    query: string, 
    limit: number = 20
  ): Promise<{ communities: LocalCommunity[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('local_communities')
        .select(`
          *,
          profiles!local_communities_created_by_fkey(display_name, avatar_url)
        `)
        .or(`name.ilike.%${query}%, description.ilike.%${query}%, location_city.ilike.%${query}%`)
        .eq('is_active', true)
        .order('member_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const communities: LocalCommunity[] = (data || []).map((community: LocalCommunityWithProfile) => ({
        id: community.id,
        name: community.name,
        description: community.description,
        location_city: community.location_city,
        location_state: community.location_state,
        location_country: community.location_country,
        latitude: community.latitude,
        longitude: community.longitude,
        member_count: community.member_count,
        is_active: community.is_active,
        created_by: community.created_by,
        created_at: community.created_at,
        updated_at: community.updated_at,
        creator_name: community.profiles?.display_name,
        creator_avatar: community.profiles?.avatar_url
      }));

      return { communities, error: null };
    } catch (error: unknown) {
      console.error('Error searching communities:', error);
      return { communities: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
