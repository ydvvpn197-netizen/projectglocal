import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Post {
  id: string;
  type: 'post' | 'event' | 'service' | 'discussion';
  title?: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  event_date?: string;
  event_location?: string;
  price_range?: string;
  contact_info?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  likes_count?: number;
  comments_count?: number;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  profiles?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping fetchPosts');
      setLoading(false);
      return;
    }

    console.log('Fetching posts for user:', user.id);
    console.log('User session:', user);

    try {
      // Try the direct query approach first since RPC might have authentication issues
      console.log('Attempting direct query to posts table...');
      const { data: directData, error: directError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            display_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (directError) {
        console.error('Direct query failed:', directError);
        throw directError;
      }
      
      console.log('Direct query successful, posts found:', directData?.length || 0);
      
      // Filter out contact_info for non-owners
      const filteredData = directData?.map(post => ({
        ...post,
        contact_info: post.user_id === user?.id ? post.contact_info : null
      })) || [];
      
      setPosts(filteredData as Post[]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load posts';
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createPost = async (postData: {
    type: 'post' | 'event' | 'service' | 'discussion';
    title?: string;
    content: string;
    event_date?: string;
    event_location?: string;
    price_range?: string;
    tags?: string[];
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          user_id: user.id,
          type: postData.type // Cast to match database enum
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Post created",
        description: "Your post has been shared with the community."
      });

      // Refresh posts
      fetchPosts();

      return { data, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      toast({
        title: "Error creating post",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      // Check if user already liked this post
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      // Refresh posts to get updated counts
      fetchPosts();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update like';
      toast({
        title: "Error updating like",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully."
      });

      // Refresh posts
      fetchPosts();

      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
      toast({
        title: "Error deleting post",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  return {
    posts,
    loading,
    createPost,
    toggleLike,
    deletePost,
    refetch: fetchPosts
  };
};
