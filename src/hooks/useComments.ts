import { useState, useEffect, useCallback } from 'react';
import { CommentService } from '@/services/commentService';
import { PostComment, CreateCommentRequest } from '@/types/community';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Export Comment type for compatibility
export type Comment = PostComment;

export const useComments = () => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [userComments, setUserComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [currentComment, setCurrentComment] = useState<PostComment | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch comments for a post
  const fetchComments = useCallback(async (postId: string, sortBy: 'best' | 'top' | 'new' = 'best') => {
    try {
      setLoading(true);
      const data = await CommentService.getComments(postId, sortBy);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch user's comments
  const fetchUserComments = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      const data = await CommentService.getUserComments(targetUserId);
      setUserComments(data);
    } catch (error) {
      console.error('Error fetching user comments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your comments",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Create a new comment
  const createComment = useCallback(async (commentData: CreateCommentRequest): Promise<PostComment | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return null;
    }

    try {
      setCreating(true);
      const newComment = await CommentService.createComment(commentData);
      
      if (newComment) {
        toast({
          title: "Success",
          description: "Comment posted successfully!",
        });
        
        // Refresh comments for the post
        await fetchComments(commentData.post_id);
        await fetchUserComments();
        
        return newComment;
      } else {
        throw new Error('Failed to create comment');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
      return null;
    } finally {
      setCreating(false);
    }
  }, [user, toast, fetchComments, fetchUserComments]);

  // Get a specific comment
  const getComment = useCallback(async (commentId: string): Promise<PostComment | null> => {
    try {
      const comment = await CommentService.getCommentById(commentId);
      setCurrentComment(comment);
      return comment;
    } catch (error) {
      console.error('Error fetching comment:', error);
      toast({
        title: "Error",
        description: "Failed to fetch comment",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // Update a comment
  const updateComment = useCallback(async (commentId: string, content: string): Promise<boolean> => {
    try {
      const success = await CommentService.updateComment(commentId, content);
      
      if (success) {
        toast({
          title: "Success",
          description: "Comment updated successfully!",
        });
        
        // Refresh comments
        if (currentComment) {
          await fetchComments(currentComment.post_id);
        }
        await fetchUserComments();
        
        // Update current comment if it's the one being updated
        if (currentComment?.id === commentId) {
          const updatedComment = await CommentService.getCommentById(commentId);
          setCurrentComment(updatedComment);
        }
        
        return true;
      } else {
        throw new Error('Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchComments, fetchUserComments, currentComment]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      const success = await CommentService.deleteComment(commentId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Comment deleted successfully!",
        });
        
        // Refresh comments
        if (currentComment) {
          await fetchComments(currentComment.post_id);
        }
        await fetchUserComments();
        
        // Clear current comment if it's the one being deleted
        if (currentComment?.id === commentId) {
          setCurrentComment(null);
        }
        
        return true;
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchComments, fetchUserComments, currentComment]);

  // Get comment replies
  const getCommentReplies = useCallback(async (commentId: string, limit: number = 10): Promise<PostComment[]> => {
    try {
      return await CommentService.getCommentReplies(commentId, limit);
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      return [];
    }
  }, []);

  // Get comment count for a post
  const getCommentCount = useCallback(async (postId: string): Promise<number> => {
    try {
      return await CommentService.getCommentCount(postId);
    } catch (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }
  }, []);

  // Search comments
  const searchComments = useCallback(async (query: string, filters?: {
    post_id?: string;
    user_id?: string;
  }): Promise<PostComment[]> => {
    try {
      return await CommentService.searchComments(query, filters);
    } catch (error) {
      console.error('Error searching comments:', error);
      toast({
        title: "Error",
        description: "Failed to search comments",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  // Get comment path (for breadcrumb navigation)
  const getCommentPath = useCallback(async (commentId: string): Promise<PostComment[]> => {
    try {
      return await CommentService.getCommentPath(commentId);
    } catch (error) {
      console.error('Error getting comment path:', error);
      return [];
    }
  }, []);

  // Check if comment can be replied to
  const canReplyToComment = useCallback((comment: PostComment, maxDepth: number = 5): boolean => {
    return CommentService.canReplyToComment(comment, maxDepth);
  }, []);

  // Get comment depth
  const getCommentDepth = useCallback((comment: PostComment): number => {
    return CommentService.getCommentDepth(comment);
  }, []);

  // Initialize user comments
  useEffect(() => {
    if (user) {
      fetchUserComments();
    }
  }, [fetchUserComments, user]);

  return {
    // State
    comments,
    userComments,
    currentComment,
    loading,
    creating,
    
    // Actions
    fetchComments,
    fetchUserComments,
    createComment,
    addComment: createComment, // Add alias for compatibility
    getComment,
    updateComment,
    deleteComment,
    getCommentReplies,
    getCommentCount,
    searchComments,
    getCommentPath,
    canReplyToComment,
    getCommentDepth,
  };
};
