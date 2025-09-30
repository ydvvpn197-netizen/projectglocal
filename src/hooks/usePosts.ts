import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name?: string;
  author_avatar?: string;
  community_id?: string;
  community_name?: string;
  category?: string;
  tags?: string[];
  image_url?: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  is_liked?: boolean;
  is_shared?: boolean;
  is_anonymous?: boolean;
  anonymous_handle?: string;
  created_at: string;
  updated_at: string;
}

export const usePosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts
  const fetchPosts = useCallback(async (communityId?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(username, avatar_url),
          community:communities(name),
          likes:post_likes(count),
          comments:post_comments(count),
          shares:post_shares(count)
        `)
        .order('created_at', { ascending: false });

      if (communityId) {
        query = query.eq('community_id', communityId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to include counts and user interactions
      const transformedPosts = data?.map(post => ({
        ...post,
        author_name: post.author?.username || 'Anonymous',
        author_avatar: post.author?.avatar_url,
        community_name: post.community?.name,
        likes_count: post.likes?.[0]?.count || 0,
        comments_count: post.comments?.[0]?.count || 0,
        shares_count: post.shares?.[0]?.count || 0,
        is_liked: false, // Will be updated based on user's likes
        is_shared: false, // Will be updated based on user's shares
      })) || [];

      setPosts(transformedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      
      // Fallback to sample data
      const samplePosts: Post[] = [
        {
          id: '1',
          title: 'Amazing sunset at the beach today!',
          content: 'Just witnessed the most beautiful sunset at Ocean Beach. The colors were absolutely incredible! 🌅',
          author_id: 'sample-user',
          author_name: 'BeachLover',
          author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
          community_id: '1',
          community_name: 'San Francisco',
          category: 'Nature',
          tags: ['sunset', 'beach', 'nature'],
          image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
          likes_count: 42,
          comments_count: 8,
          shares_count: 3,
          is_liked: false,
          is_shared: false,
          is_anonymous: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'New coffee shop opened downtown',
          content: 'Just tried the new coffee shop on Market Street. Their oat milk latte is incredible! ☕',
          author_id: 'sample-user-2',
          author_name: 'CoffeeEnthusiast',
          author_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
          community_id: '1',
          community_name: 'San Francisco',
          category: 'Food',
          tags: ['coffee', 'downtown', 'new'],
          image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=400&fit=crop',
          likes_count: 28,
          comments_count: 12,
          shares_count: 5,
          is_liked: false,
          is_shared: false,
          is_anonymous: false,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setPosts(samplePosts);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create post
  const createPost = useCallback(async (postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'shares_count' | 'is_liked' | 'is_shared'>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create posts.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error: createError } = await supabase
        .from('posts')
        .insert({
          ...postData,
          author_id: user.id
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Add to local state
      const newPost: Post = {
        ...data,
        author_name: user.user_metadata?.username || 'Anonymous',
        author_avatar: user.user_metadata?.avatar_url,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        is_liked: false,
        is_shared: false
      };

      setPosts(prev => [newPost, ...prev]);

      toast({
        title: "Post Created",
        description: "Your post has been created successfully!",
      });

      return newPost;
    } catch (err) {
      console.error('Error creating post:', err);
      toast({
        title: "Creation Failed",
        description: "Unable to create post. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Like post
  const likePost = useCallback(async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like posts.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (likeError) {
        throw likeError;
      }

      // Update local state
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes_count: (post.likes_count || 0) + 1,
                is_liked: true
              }
            : post
        )
      );

      toast({
        title: "Post Liked!",
        description: "You liked this post.",
      });
    } catch (err) {
      console.error('Error liking post:', err);
      toast({
        title: "Like Failed",
        description: "Unable to like post. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Share post
  const sharePost = useCallback(async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to share posts.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error: shareError } = await supabase
        .from('post_shares')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (shareError) {
        throw shareError;
      }

      // Update local state
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                shares_count: (post.shares_count || 0) + 1,
                is_shared: true
              }
            : post
        )
      );

      toast({
        title: "Post Shared!",
        description: "You shared this post.",
      });
    } catch (err) {
      console.error('Error sharing post:', err);
      toast({
        title: "Share Failed",
        description: "Unable to share post. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    likePost,
    sharePost
  };
};
