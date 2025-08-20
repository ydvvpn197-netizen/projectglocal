import { supabase } from '@/integrations/supabase/client';
import { PostComment, CreateCommentRequest } from '@/types/community';

export class CommentService {
  // Comment Management
  static async createComment(commentData: CreateCommentRequest): Promise<PostComment | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          ...commentData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Update comment count for the post
      await this.updatePostCommentCount(commentData.post_id);

      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  }

  static async getComments(postId: string, sortBy: 'best' | 'top' | 'new' = 'best'): Promise<PostComment[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('post_comments')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          ),
          comment_votes!inner (
            vote_type
          )
        `)
        .eq('post_id', postId)
        .eq('comment_votes.user_id', user.id);

      // Apply sorting
      if (sortBy === 'best') {
        query = query.order('score', { ascending: false });
      } else if (sortBy === 'top') {
        query = query.order('score', { ascending: false });
      } else if (sortBy === 'new') {
        query = query.order('created_at', { ascending: false });
      }

      query = query.order('created_at', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;

      const comments = (data || []).map(comment => ({
        ...comment,
        author_name: comment.is_anonymous ? 'Anonymous' : comment.profiles?.display_name,
        author_avatar: comment.is_anonymous ? undefined : comment.profiles?.avatar_url,
        user_vote: comment.comment_votes?.[0]?.vote_type || 0,
        has_voted: !!comment.comment_votes?.[0]
      }));

      // Build threaded structure
      return this.buildCommentThread(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  static async getCommentById(commentId: string): Promise<PostComment | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          ),
          comment_votes!inner (
            vote_type
          )
        `)
        .eq('id', commentId)
        .eq('comment_votes.user_id', user.id)
        .single();

      if (error) throw error;

      return {
        ...data,
        author_name: data.is_anonymous ? 'Anonymous' : data.profiles?.display_name,
        author_avatar: data.is_anonymous ? undefined : data.profiles?.avatar_url,
        user_vote: data.comment_votes?.[0]?.vote_type || 0,
        has_voted: !!data.comment_votes?.[0]
      };
    } catch (error) {
      console.error('Error fetching comment:', error);
      return null;
    }
  }

  static async updateComment(commentId: string, content: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('post_comments')
        .update({ content })
        .eq('id', commentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating comment:', error);
      return false;
    }
  }

  static async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  // Threaded Comments
  private static buildCommentThread(comments: PostComment[]): PostComment[] {
    const commentMap = new Map<string, PostComment>();
    const rootComments: PostComment[] = [];

    // Create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Build the threaded structure
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  }

  // Get replies for a specific comment
  static async getCommentReplies(commentId: string, limit: number = 10): Promise<PostComment[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          ),
          comment_votes!inner (
            vote_type
          )
        `)
        .eq('parent_id', commentId)
        .eq('comment_votes.user_id', user.id)
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(comment => ({
        ...comment,
        author_name: comment.is_anonymous ? 'Anonymous' : comment.profiles?.display_name,
        author_avatar: comment.is_anonymous ? undefined : comment.profiles?.avatar_url,
        user_vote: comment.comment_votes?.[0]?.vote_type || 0,
        has_voted: !!comment.comment_votes?.[0]
      }));
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      return [];
    }
  }

  // Get comment count for a post
  static async getCommentCount(postId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }
  }

  // Get user's comments
  static async getUserComments(userId: string, limit: number = 50): Promise<PostComment[]> {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          ),
          community_posts (
            title,
            group_id
          ),
          community_groups (
            name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(comment => ({
        ...comment,
        author_name: comment.is_anonymous ? 'Anonymous' : comment.profiles?.display_name,
        author_avatar: comment.is_anonymous ? undefined : comment.profiles?.avatar_url
      }));
    } catch (error) {
      console.error('Error fetching user comments:', error);
      return [];
    }
  }

  // Search comments
  static async searchComments(query: string, filters?: {
    post_id?: string;
    user_id?: string;
  }): Promise<PostComment[]> {
    try {
      let searchQuery = supabase
        .from('post_comments')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          ),
          community_posts (
            title,
            group_id
          ),
          community_groups (
            name
          )
        `)
        .or(`content.ilike.%${query}%`)
        .order('score', { ascending: false });

      if (filters?.post_id) {
        searchQuery = searchQuery.eq('post_id', filters.post_id);
      }
      if (filters?.user_id) {
        searchQuery = searchQuery.eq('user_id', filters.user_id);
      }

      const { data, error } = await searchQuery;
      if (error) throw error;

      return (data || []).map(comment => ({
        ...comment,
        author_name: comment.is_anonymous ? 'Anonymous' : comment.profiles?.display_name,
        author_avatar: comment.is_anonymous ? undefined : comment.profiles?.avatar_url
      }));
    } catch (error) {
      console.error('Error searching comments:', error);
      return [];
    }
  }

  // Helper methods
  private static async updatePostCommentCount(postId: string): Promise<void> {
    try {
      const { count, error } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;

      await supabase
        .from('community_posts')
        .update({ comment_count: count || 0 })
        .eq('id', postId);
    } catch (error) {
      console.error('Error updating comment count:', error);
    }
  }

  // Get comment depth (for UI rendering)
  static getCommentDepth(comment: PostComment): number {
    return comment.depth || 0;
  }

  // Check if comment can be replied to (depth limit)
  static canReplyToComment(comment: PostComment, maxDepth: number = 5): boolean {
    return (comment.depth || 0) < maxDepth;
  }

  // Get comment path (for breadcrumb navigation)
  static async getCommentPath(commentId: string): Promise<PostComment[]> {
    try {
      const path: PostComment[] = [];
      let currentCommentId = commentId;

      while (currentCommentId) {
        const comment = await this.getCommentById(currentCommentId);
        if (!comment) break;

        path.unshift(comment);
        currentCommentId = comment.parent_id || '';
      }

      return path;
    } catch (error) {
      console.error('Error getting comment path:', error);
      return [];
    }
  }
}
