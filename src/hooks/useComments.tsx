import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

    const fetchComments = useCallback(async () => {
    if (!user || !postId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          user_id,
          post_id,
          created_at,
          updated_at
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profile data separately for each comment
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username, avatar_url')
            .eq('user_id', comment.user_id)
        .single();

          return {
            ...comment,
            profiles: profile
          };
        })
      );

      setComments(commentsWithProfiles);
    } catch (error: unknown) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error loading comments",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, postId, toast]);

  const addComment = async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: content.trim(),
          user_id: user.id,
          post_id: postId
        })
        .select('*')
        .single();

      if (error) throw error;

      // Fetch profile data for the new comment
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, username, avatar_url')
        .eq('user_id', user.id)
        .single();

      const commentWithProfile = {
        ...data,
        profiles: profile
      };

      setComments(prev => [...prev, commentWithProfile]);
      toast({
        title: "Comment added",
        description: "Your comment has been added to the post."
      });

      return { data, error: null };
    } catch (error: unknown) {
      toast({
        title: "Error adding comment",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
      return { error };
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed."
      });
    } catch (error: unknown) {
      toast({
        title: "Error deleting comment",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (postId && user) {
      fetchComments();
    }
  }, [postId, user, fetchComments]);

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    refetch: fetchComments
  };
};
