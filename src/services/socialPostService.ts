import { supabase } from '@/integrations/supabase/client';
import { SocialPost } from '@/components/SocialMediaPost';

export interface CreatePostRequest {
  title?: string;
  content: string;
  post_type?: 'post' | 'event' | 'service' | 'discussion' | 'poll' | 'announcement';
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  event_date?: string;
  event_location?: string;
  price_range?: string;
  contact_info?: string;
  tags?: string[];
  image_urls?: string[];
  is_anonymous?: boolean;
}

export interface PostFilters {
  post_type?: string;
  author_id?: string;
  is_trending?: boolean;
  is_pinned?: boolean;
  location_city?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sort_by?: 'new' | 'hot' | 'top' | 'trending';
}

export interface CommentRequest {
  content: string;
  parent_id?: string;
  is_anonymous?: boolean;
}

export class SocialPostService {
  // Fetch posts with filters
  static async getPosts(filters: PostFilters = {}): Promise<SocialPost[]> {
    try {
      let query = supabase
        .from('social_posts')
        .select(`
          *,
          profiles!social_posts_user_id_fkey(
            display_name,
            avatar_url,
            username
          ),
          post_votes!post_votes_post_id_fkey(
            vote_type
          ),
          post_saves!post_saves_post_id_fkey(
            user_id
          ),
          post_views!post_views_post_id_fkey(
            user_id
          )
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters.post_type) {
        query = query.eq('post_type', filters.post_type);
      }
      if (filters.author_id) {
        query = query.eq('user_id', filters.author_id);
      }
      if (filters.is_trending) {
        query = query.eq('is_trending', true);
      }
      if (filters.is_pinned) {
        query = query.eq('is_pinned', true);
      }
      if (filters.location_city) {
        query = query.eq('location_city', filters.location_city);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply sorting
      switch (filters.sort_by) {
        case 'hot':
          query = query.order('score', { ascending: false });
          break;
        case 'top':
          query = query.order('upvotes', { ascending: false });
          break;
        case 'trending':
          query = query.order('view_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform the data to match SocialPost interface
      return data.map(post => ({
        ...post,
        author_name: post.profiles?.display_name,
        author_avatar: post.profiles?.avatar_url,
        author_username: post.profiles?.username,
        user_vote: post.post_votes?.[0]?.vote_type || 0,
        is_saved: post.post_saves?.length > 0,
        has_viewed: post.post_views?.length > 0
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  // Get a single post by ID
  static async getPost(postId: string): Promise<SocialPost | null> {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          profiles!social_posts_user_id_fkey(
            display_name,
            avatar_url,
            username
          ),
          post_votes!post_votes_post_id_fkey(
            vote_type
          ),
          post_saves!post_saves_post_id_fkey(
            user_id
          ),
          post_views!post_views_post_id_fkey(
            user_id
          )
        `)
        .eq('id', postId)
        .eq('status', 'active')
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        ...data,
        author_name: data.profiles?.display_name,
        author_avatar: data.profiles?.avatar_url,
        author_username: data.profiles?.username,
        user_vote: data.post_votes?.[0]?.vote_type || 0,
        is_saved: data.post_saves?.length > 0,
        has_viewed: data.post_views?.length > 0
      };
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  // Create a new post
  static async createPost(postData: CreatePostRequest): Promise<SocialPost> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          title: postData.title || null,
          content: postData.content,
          post_type: postData.post_type || 'post',
          location_city: postData.location_city || null,
          location_state: postData.location_state || null,
          location_country: postData.location_country || null,
          latitude: postData.latitude || null,
          longitude: postData.longitude || null,
          event_date: postData.event_date || null,
          event_location: postData.event_location || null,
          price_range: postData.price_range || null,
          contact_info: postData.contact_info || null,
          tags: postData.tags || null,
          image_urls: postData.image_urls || null,
          is_anonymous: postData.is_anonymous || false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // Vote on a post
  static async votePost(postId: string, voteType: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('post_votes')
        .upsert({
          post_id: postId,
          user_id: user.id,
          vote_type: voteType
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error voting on post:', error);
      throw error;
    }
  }

  // Save/unsave a post
  static async savePost(postId: string, isSaved: boolean): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (isSaved) {
        const { error } = await supabase
          .from('post_saves')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('post_saves')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }
      }

      return true;
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  }

  // Share a post
  static async sharePost(postId: string, shareType: 'internal' | 'external' | 'social' = 'internal'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('post_shares')
        .insert({
          post_id: postId,
          user_id: user.id,
          share_type: shareType
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  }

  // Record a view on a post
  static async recordView(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('post_views')
        .upsert({
          post_id: postId,
          user_id: user.id
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error recording view:', error);
      throw error;
    }
  }

  // Get saved posts for a user
  static async getSavedPosts(userId?: string): Promise<SocialPost[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('post_saves')
        .select(`
          social_posts!post_saves_post_id_fkey(
            *,
            profiles!social_posts_user_id_fkey(
              display_name,
              avatar_url,
              username
            ),
            post_votes!post_votes_post_id_fkey(
              vote_type
            ),
            post_saves!post_saves_post_id_fkey(
              user_id
            ),
            post_views!post_views_post_id_fkey(
              user_id
            )
          )
        `)
        .eq('user_id', targetUserId)
        .eq('social_posts.status', 'active')
        .order('saved_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(item => ({
        ...item.social_posts,
        author_name: item.social_posts.profiles?.display_name,
        author_avatar: item.social_posts.profiles?.avatar_url,
        author_username: item.social_posts.profiles?.username,
        user_vote: item.social_posts.post_votes?.[0]?.vote_type || 0,
        is_saved: true,
        has_viewed: item.social_posts.post_views?.length > 0
      }));
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      throw error;
    }
  }

  // Get trending posts
  static async getTrendingPosts(limit: number = 10): Promise<SocialPost[]> {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          profiles!social_posts_user_id_fkey(
            display_name,
            avatar_url,
            username
          ),
          post_votes!post_votes_post_id_fkey(
            vote_type
          ),
          post_saves!post_saves_post_id_fkey(
            user_id
          ),
          post_views!post_views_post_id_fkey(
            user_id
          )
        `)
        .eq('status', 'active')
        .eq('is_trending', true)
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data.map(post => ({
        ...post,
        author_name: post.profiles?.display_name,
        author_avatar: post.profiles?.avatar_url,
        author_username: post.profiles?.username,
        user_vote: post.post_votes?.[0]?.vote_type || 0,
        is_saved: post.post_saves?.length > 0,
        has_viewed: post.post_views?.length > 0
      }));
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      throw error;
    }
  }

  // Update post (for post owner)
  static async updatePost(postId: string, updates: Partial<CreatePostRequest>): Promise<SocialPost> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('social_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  // Delete post (for post owner)
  static async deletePost(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('social_posts')
        .update({ status: 'deleted' })
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Pin/unpin post (for post owner)
  static async pinPost(postId: string, isPinned: boolean): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('social_posts')
        .update({ is_pinned: isPinned })
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error pinning post:', error);
      throw error;
    }
  }

  // Lock/unlock post (for post owner)
  static async lockPost(postId: string, isLocked: boolean): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('social_posts')
        .update({ is_locked: isLocked })
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error locking post:', error);
      throw error;
    }
  }
}
