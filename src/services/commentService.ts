// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { checkTableExists, getCommentsTableName, createUserPreferencesFallback } from '@/utils/databaseUtils';
import { PostComment, CreateCommentRequest } from '@/types/community';

export class CommentService {
  private static commentsTableName: string | null = null;

  /**
   * Get the correct comments table name
   */
  private static async getCommentsTable(): Promise<string | null> {
    if (this.commentsTableName !== null) {
      return this.commentsTableName;
    }

    try {
      // Check if comments table exists
      const commentsTable = await checkTableExists('comments');

      if (commentsTable.exists) {
        this.commentsTableName = 'comments';
      } else {
        this.commentsTableName = null;
        console.warn('No comments table found. Comments functionality will be disabled.');
      }

      return this.commentsTableName;
    } catch (error) {
      console.error('Error checking comments tables:', error);
      this.commentsTableName = null;
      return null;
    }
  }

  // Comment Management
  static async createComment(commentData: CreateCommentRequest): Promise<PostComment | null> {
    try {
      const tableName = await this.getCommentsTable();
      if (!tableName) {
        console.warn('Comments table not available. Comment creation skipped.');
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Use any to bypass strict typing for dynamic table names
      const { data, error } = await (supabase as any)
        .from(tableName)
        .insert({
          ...commentData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Update comment count for the post
      await this.updatePostCommentCount(commentData.post_id);

      return data as PostComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  }

  static async getComments(postId: string, sortBy: 'best' | 'top' | 'new' = 'best'): Promise<PostComment[]> {
    try {
      const tableName = await this.getCommentsTable();
      if (!tableName) {
        console.warn('Comments table not available. Returning empty comments list.');
        return [];
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Simplified query without foreign key joins to avoid PGRST200 errors
      let query = (supabase as any)
        .from(tableName)
        .select('*')
        .eq('post_id', postId);

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

      // Get user profiles separately to avoid foreign key issues
      const userIds = [...new Set((data || []).map((comment: any) => comment.user_id))] as string[];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const comments = (data || []).map((comment: any) => ({
        ...comment,
        author_name: comment.is_anonymous ? 'Anonymous' : profileMap.get(comment.user_id)?.display_name || 'Unknown',
        author_avatar: comment.is_anonymous ? undefined : profileMap.get(comment.user_id)?.avatar_url,
        user_vote: 0, // Will be fetched separately if needed
        has_voted: false
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
      const tableName = await this.getCommentsTable();
      if (!tableName) {
        console.warn('Comments table not available. Comment not found.');
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await (supabase as any)
        .from(tableName)
        .select('*')
        .eq('id', commentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) return null;

      // Get user profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', data.user_id)
        .single();

      return {
        ...data,
        author_name: data.is_anonymous ? 'Anonymous' : profile?.display_name || 'Unknown',
        author_avatar: data.is_anonymous ? undefined : profile?.avatar_url,
        user_vote: 0,
        has_voted: false
      } as PostComment;
    } catch (error) {
      console.error('Error fetching comment:', error);
      return null;
    }
  }

  static async updateComment(commentId: string, updates: Partial<PostComment>): Promise<PostComment | null> {
    try {
      const tableName = await this.getCommentsTable();
      if (!tableName) {
        console.warn('Comments table not available. Comment update skipped.');
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as any)
        .from(tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return data as PostComment;
    } catch (error) {
      console.error('Error updating comment:', error);
      return null;
    }
  }

  static async deleteComment(commentId: string): Promise<boolean> {
    try {
      const tableName = await this.getCommentsTable();
      if (!tableName) {
        console.warn('Comments table not available. Comment deletion skipped.');
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await (supabase as any)
        .from(tableName)
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  static async voteComment(commentId: string, voteType: -1 | 0 | 1): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if comment_votes table exists
      const votesTableExists = await checkTableExists('comment_votes');
      if (!votesTableExists.exists) {
        console.warn('Comment votes table not available. Voting skipped.');
        return false;
      }

      // Check if vote already exists
      const { data: existingVote } = await (supabase as any)
        .from('comment_votes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await (supabase as any)
          .from('comment_votes')
          .update({ vote_type: voteType })
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await (supabase as any)
          .from('comment_votes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            vote_type: voteType
          });

        if (error) throw error;
      }

      // Update comment score
      await this.updateCommentScore(commentId);

      return true;
    } catch (error) {
      console.error('Error voting on comment:', error);
      return false;
    }
  }

  private static async updateCommentScore(commentId: string): Promise<void> {
    try {
      const votesTableExists = await checkTableExists('comment_votes');
      if (!votesTableExists.exists) return;

      const { data: votes } = await (supabase as any)
        .from('comment_votes')
        .select('vote_type')
        .eq('comment_id', commentId);

      if (!votes) return;

      const score = votes.reduce((sum: number, vote: any) => sum + vote.vote_type, 0);

      const tableName = await this.getCommentsTable();
      if (!tableName) return;

      await (supabase as any)
        .from(tableName)
        .update({ score })
        .eq('id', commentId);
    } catch (error) {
      console.error('Error updating comment score:', error);
    }
  }

  private static async updatePostCommentCount(postId: string): Promise<void> {
    try {
      const tableName = await this.getCommentsTable();
      if (!tableName) return;

      const { count } = await (supabase as any)
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (count !== null) {
        // Check if community_posts table exists
        const postsTableExists = await checkTableExists('community_posts');
        if (postsTableExists.exists) {
          await (supabase as any)
            .from('community_posts')
            .update({ comment_count: count })
            .eq('id', postId);
        }
      }
    } catch (error) {
      console.error('Error updating post comment count:', error);
    }
  }

  private static buildCommentThread(comments: PostComment[]): PostComment[] {
    const commentMap = new Map<string, PostComment>();
    const rootComments: PostComment[] = [];

    // Create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Build the thread structure
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

  static async getCommentReplies(commentId: string, limit: number = 10): Promise<PostComment[]> {
    try {
      const tableName = await this.getCommentsTable();
      if (!tableName) {
        console.warn('Comments table not available. Returning empty replies list.');
        return [];
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await (supabase as any)
        .from(tableName)
        .select('*')
        .eq('parent_id', commentId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return (data || []) as PostComment[];
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      return [];
    }
  }

  static async getCommentCount(postId: string): Promise<number> {
    try {
      const tableName = await this.getCommentsTable();
      if (!tableName) {
        console.warn('Comments table not available. Returning 0 for comment count.');
        return 0;
      }

      const { count, error } = await (supabase as any)
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }
  }

  static async getUserComments(userId: string, limit: number = 50): Promise<PostComment[]> {
    try {
      const tableName = await this.getCommentsTable();
      if (!tableName) {
        console.warn('Comments table not available. Returning empty user comments list.');
        return [];
      }

      const { data, error } = await (supabase as any)
        .from(tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []) as PostComment[];
    } catch (error) {
      console.error('Error fetching user comments:', error);
      return [];
    }
  }

  static async searchComments(searchParams: {
    query?: string;
    postId?: string;
    userId?: string;
    limit?: number;
  }): Promise<PostComment[]> {
    try {
      const tableName = await this.getCommentsTable();
      if (!tableName) {
        console.warn('Comments table not available. Returning empty search results.');
        return [];
      }

      let searchQuery = (supabase as any)
        .from(tableName)
        .select('*');

      if (searchParams.query) {
        searchQuery = searchQuery.ilike('content', `%${searchParams.query}%`);
      }
      if (searchParams.postId) {
        searchQuery = searchQuery.eq('post_id', searchParams.postId);
      }
      if (searchParams.userId) {
        searchQuery = searchQuery.eq('user_id', searchParams.userId);
      }

      const { data, error } = await searchQuery
        .order('created_at', { ascending: false })
        .limit(searchParams.limit || 50);

      if (error) throw error;

      return (data || []) as PostComment[];
    } catch (error) {
      console.error('Error searching comments:', error);
      return [];
    }
  }

  // Helper methods
  // Get comment depth (for UI rendering)
  static getCommentDepth(comment: PostComment): number {
    let depth = 0;
    let currentComment = comment;
    
    while (currentComment.parent_id) {
      depth++;
      // In a real implementation, you'd need to traverse up the tree
      // For now, we'll just return the depth based on parent_id existence
      break;
    }
    
    return depth;
  }

  // Format comment for display
  static formatComment(comment: PostComment): PostComment {
    return {
      ...comment,
      author_name: comment.author_name || 'Anonymous',
      author_avatar: comment.author_avatar || undefined,
      user_vote: comment.user_vote || 0,
      has_voted: comment.has_voted || false,
      replies: comment.replies || []
    };
  }
}
