import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface NewsComment {
  id: string;
  article_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar?: string;
  upvotes: number;
  downvotes: number;
  score: number;
  user_vote?: -1 | 0 | 1;
  replies?: NewsComment[];
  reply_count: number;
}

export interface CreateCommentRequest {
  article_id: string;
  content: string;
  parent_comment_id?: string;
}

export const useNewsComments = (articleId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments for an article
  const fetchComments = useCallback(async () => {
    if (!articleId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('news_article_comments')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform the data to include author information
      const transformedComments = (data || []).map(comment => ({
        id: comment.id,
        article_id: comment.article_id,
        user_id: comment.user_id,
        parent_comment_id: comment.parent_comment_id,
        content: comment.content,
        is_edited: comment.is_edited,
        edited_at: comment.edited_at,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        author_name: comment.profiles?.display_name || 'Anonymous',
        author_avatar: comment.profiles?.avatar_url,
        upvotes: 0, // Will be fetched separately
        downvotes: 0, // Will be fetched separately
        score: 0, // Will be calculated
        reply_count: 0 // Will be calculated
      }));

      // Build threaded structure
      const threadedComments = buildCommentThread(transformedComments);
      setComments(threadedComments);

      // Fetch vote counts and user votes
      await fetchVoteData(threadedComments);

    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [articleId, user, fetchVoteData]);

  // Build threaded comment structure
  const buildCommentThread = (comments: NewsComment[]): NewsComment[] => {
    const commentMap = new Map<string, NewsComment>();
    const rootComments: NewsComment[] = [];

    // First pass: create map and calculate reply counts
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree structure
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
          parent.reply_count = (parent.reply_count || 0) + 1;
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  // Fetch vote data for comments
  const fetchVoteData = useCallback(async (comments: NewsComment[]) => {
    if (!user) return;

    try {
      const commentIds = getAllCommentIds(comments);
      
      // Fetch vote counts
      const { data: voteCounts } = await supabase
        .from('news_comment_votes')
        .select('comment_id, vote_type')
        .in('comment_id', commentIds);

      // Fetch user votes
      const { data: userVotes } = await supabase
        .from('news_comment_votes')
        .select('comment_id, vote_type')
        .in('comment_id', commentIds)
        .eq('user_id', user.id);

      // Calculate vote counts
      const voteMap = new Map<string, { upvotes: number; downvotes: number; user_vote: -1 | 0 | 1 }>();
      
      (voteCounts || []).forEach(vote => {
        const key = vote.comment_id;
        if (!voteMap.has(key)) {
          voteMap.set(key, { upvotes: 0, downvotes: 0, user_vote: 0 });
        }
        const data = voteMap.get(key)!;
        if (vote.vote_type === 1) data.upvotes++;
        if (vote.vote_type === -1) data.downvotes++;
      });

      // Set user votes
      (userVotes || []).forEach(vote => {
        const key = vote.comment_id;
        if (voteMap.has(key)) {
          voteMap.get(key)!.user_vote = vote.vote_type as -1 | 0 | 1;
        }
      });

      // Update comments with vote data
      const updateCommentsWithVotes = (comments: NewsComment[]): NewsComment[] => {
        return comments.map(comment => {
          const voteData = voteMap.get(comment.id) || { upvotes: 0, downvotes: 0, user_vote: 0 };
          const updatedComment = {
            ...comment,
            upvotes: voteData.upvotes,
            downvotes: voteData.downvotes,
            score: voteData.upvotes - voteData.downvotes,
            user_vote: voteData.user_vote
          };

          if (comment.replies) {
            updatedComment.replies = updateCommentsWithVotes(comment.replies);
          }

          return updatedComment;
        });
      };

      setComments(updateCommentsWithVotes(comments));

    } catch (error) {
      console.error('Error fetching vote data:', error);
    }
  }, [user]);

  // Get all comment IDs recursively
  const getAllCommentIds = (comments: NewsComment[]): string[] => {
    const ids: string[] = [];
    
    const traverse = (commentList: NewsComment[]) => {
      commentList.forEach(comment => {
        ids.push(comment.id);
        if (comment.replies) {
          traverse(comment.replies);
        }
      });
    };

    traverse(comments);
    return ids;
  };

  // Add a new comment
  const addComment = useCallback(async (commentData: CreateCommentRequest): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to comment' };
    }

    setSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('news_article_comments')
        .insert({
          article_id: commentData.article_id,
          user_id: user.id,
          parent_comment_id: commentData.parent_comment_id,
          content: commentData.content.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh comments to show the new one
      await fetchComments();

      return { success: true };
    } catch (err) {
      console.error('Error adding comment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  }, [user, fetchComments]);

  // Edit a comment
  const editComment = useCallback(async (commentId: string, newContent: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to edit comments' };
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('news_article_comments')
        .update({
          content: newContent.trim(),
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure user can only edit their own comments

      if (error) throw error;

      // Refresh comments
      await fetchComments();

      return { success: true };
    } catch (err) {
      console.error('Error editing comment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit comment';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  }, [user, fetchComments]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to delete comments' };
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('news_article_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure user can only delete their own comments

      if (error) throw error;

      // Refresh comments
      await fetchComments();

      return { success: true };
    } catch (err) {
      console.error('Error deleting comment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  }, [user, fetchComments]);

  // Vote on a comment
  const voteComment = useCallback(async (commentId: string, voteType: -1 | 0 | 1): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to vote' };
    }

    try {
      if (voteType === 0) {
        // Remove vote
        const { error } = await supabase
          .from('news_comment_votes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add or update vote
        const { error } = await supabase
          .from('news_comment_votes')
          .upsert({
            comment_id: commentId,
            user_id: user.id,
            vote_type: voteType
          }, { onConflict: 'comment_id,user_id' });

        if (error) throw error;
      }

      // Refresh vote data
      await fetchComments();

      return { success: true };
    } catch (err) {
      console.error('Error voting on comment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote';
      return { success: false, error: errorMessage };
    }
  }, [user, fetchComments]);

  // Set up real-time subscription
  useEffect(() => {
    if (!articleId) return;

    const channel = supabase
      .channel('news_comments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_article_comments',
          filter: `article_id=eq.${articleId}`
        },
        () => {
          fetchComments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_comment_votes'
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [articleId, fetchComments]);

  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    submitting,
    error,
    addComment,
    editComment,
    deleteComment,
    voteComment,
    refetch: fetchComments
  };
};
