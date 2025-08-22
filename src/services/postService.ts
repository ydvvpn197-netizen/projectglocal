// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { 
  CommunityPost, 
  CreatePostRequest,
  PostFilters,
  PostSortOptions
} from '@/types/community';

export class PostService {
  // Post Management
  static async createPost(postData: CreatePostRequest): Promise<CommunityPost | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          ...postData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Update post count for the group
      await this.updateGroupPostCount(postData.group_id);

      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  static async getPosts(filters?: PostFilters, sortOptions?: PostSortOptions): Promise<CommunityPost[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          ),
          community_groups (
            name
          ),
          post_votes!inner (
            vote_type
          )
        `)
        .eq('post_votes.user_id', user.id);

      // Apply filters
      if (filters?.group_id) {
        query = query.eq('group_id', filters.group_id);
      }
      if (filters?.post_type) {
        query = query.eq('post_type', filters.post_type);
      }
      if (filters?.author_id) {
        query = query.eq('user_id', filters.author_id);
      }
      if (filters?.is_anonymous !== undefined) {
        query = query.eq('is_anonymous', filters.is_anonymous);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Apply sorting
      const sortBy = sortOptions?.sort_by || 'hot';
      const limit = sortOptions?.limit || 50;
      const offset = sortOptions?.offset || 0;

      if (sortBy === 'hot') {
        query = query.order('score', { ascending: false });
      } else if (sortBy === 'top') {
        query = query.order('score', { ascending: false });
      } else if (sortBy === 'new') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'rising') {
        // For rising, we'll use a combination of score and recent activity
        query = query.order('score', { ascending: false });
      }

      query = query.order('is_pinned', { ascending: false });
      query = query.limit(limit).offset(offset);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(post => ({
        ...post,
        author_name: post.is_anonymous ? 'Anonymous' : post.profiles?.display_name,
        author_avatar: post.is_anonymous ? undefined : post.profiles?.avatar_url,
        group_name: post.community_groups?.name,
        user_vote: post.post_votes?.[0]?.vote_type || 0,
        has_voted: !!post.post_votes?.[0]
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  static async getRankedPosts(groupId?: string, sortBy: 'hot' | 'top' | 'new' | 'rising' = 'hot', limit: number = 50, offset: number = 0): Promise<CommunityPost[]> {
    try {
      const { data, error } = await supabase.rpc('get_ranked_posts', {
        p_group_id: groupId,
        p_sort_by: sortBy,
        p_limit: limit,
        p_offset: offset
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching ranked posts:', error);
      return [];
    }
  }

  static async getPostById(postId: string): Promise<CommunityPost | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          ),
          community_groups (
            name
          ),
          post_votes!inner (
            vote_type
          )
        `)
        .eq('id', postId)
        .eq('post_votes.user_id', user.id)
        .single();

      if (error) throw error;

      return {
        ...data,
        author_name: data.is_anonymous ? 'Anonymous' : data.profiles?.display_name,
        author_avatar: data.is_anonymous ? undefined : data.profiles?.avatar_url,
        group_name: data.community_groups?.name,
        user_vote: data.post_votes?.[0]?.vote_type || 0,
        has_voted: !!data.post_votes?.[0]
      };
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }

  static async updatePost(postId: string, updates: Partial<CommunityPost>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update(updates)
        .eq('id', postId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      return false;
    }
  }

  static async deletePost(postId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }

  // Post Actions
  static async pinPost(postId: string, isPinned: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ is_pinned: isPinned })
        .eq('id', postId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error pinning/unpinning post:', error);
      return false;
    }
  }

  static async lockPost(postId: string, isLocked: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ is_locked: isLocked })
        .eq('id', postId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error locking/unlocking post:', error);
      return false;
    }
  }

  // View Tracking
  static async trackPostView(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Insert view record
      const { error: viewError } = await supabase
        .from('post_views')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (viewError && viewError.code !== '23505') throw viewError; // Ignore duplicate key errors

      // Update view count
      const { error: updateError } = await supabase.rpc('increment_post_view_count', {
        post_id: postId
      });

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error tracking post view:', error);
      return false;
    }
  }

  // Search
  static async searchPosts(query: string, filters?: {
    group_id?: string;
    post_type?: string;
    author_id?: string;
  }): Promise<CommunityPost[]> {
    try {
      let searchQuery = supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          ),
          community_groups (
            name
          )
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('score', { ascending: false });

      if (filters?.group_id) {
        searchQuery = searchQuery.eq('group_id', filters.group_id);
      }
      if (filters?.post_type) {
        searchQuery = searchQuery.eq('post_type', filters.post_type);
      }
      if (filters?.author_id) {
        searchQuery = searchQuery.eq('user_id', filters.author_id);
      }

      const { data, error } = await searchQuery;
      if (error) throw error;

      return (data || []).map(post => ({
        ...post,
        author_name: post.is_anonymous ? 'Anonymous' : post.profiles?.display_name,
        author_avatar: post.is_anonymous ? undefined : post.profiles?.avatar_url,
        group_name: post.community_groups?.name
      }));
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }

  // Analytics
  static async getPostAnalytics(postId: string): Promise<{
    view_count: number;
    unique_viewers: number;
    vote_distribution: { upvotes: number; downvotes: number; score: number };
    comment_count: number;
    engagement_rate: number;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          view_count,
          upvotes,
          downvotes,
          score,
          comment_count
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      // Get unique viewers count
      const { count: uniqueViewers, error: viewError } = await supabase
        .from('post_views')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (viewError) throw viewError;

      const totalViews = data.view_count || 0;
      const engagementRate = totalViews > 0 ? ((data.upvotes + data.downvotes + data.comment_count) / totalViews) * 100 : 0;

      return {
        view_count: totalViews,
        unique_viewers: uniqueViewers || 0,
        vote_distribution: {
          upvotes: data.upvotes || 0,
          downvotes: data.downvotes || 0,
          score: data.score || 0
        },
        comment_count: data.comment_count || 0,
        engagement_rate: engagementRate
      };
    } catch (error) {
      console.error('Error getting post analytics:', error);
      return null;
    }
  }

  // Helper methods
  private static async updateGroupPostCount(groupId: string): Promise<void> {
    try {
      const { count, error } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      if (error) throw error;

      await supabase
        .from('community_groups')
        .update({ post_count: count || 0 })
        .eq('id', groupId);
    } catch (error) {
      console.error('Error updating post count:', error);
    }
  }
}
