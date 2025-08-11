import { useState, useEffect } from 'react';
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

  const fetchPosts = async () => {
    if (!user) return;

    try {
      // Use the secure function instead of the view
      const { data, error } = await supabase
        .rpc('get_posts_with_restricted_contact');

      if (error) {
        throw error;
      }
      
      setPosts(data as Post[] || []);
    } catch (error: any) {
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
          type: postData.type as any // Cast to match database enum
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
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
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
        .single();

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
    } catch (error: any) {
      toast({
        title: "Error updating like",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  return {
    posts,
    loading,
    createPost,
    toggleLike,
    refetch: fetchPosts
  };
};