import { useState, useEffect, useCallback } from 'react';
import { PostService } from '@/services/postService';
import { CommunityPost, CreatePostRequest, PostFilters, PostSortOptions } from '@/types/community';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useCommunityPosts = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [currentPost, setCurrentPost] = useState<CommunityPost | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch posts
  const fetchPosts = useCallback(async (filters?: PostFilters, sortOptions?: PostSortOptions) => {
    try {
      setLoading(true);
      const data = await PostService.getPosts(filters, sortOptions);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch ranked posts (Reddit-like algorithm)
  const fetchRankedPosts = useCallback(async (
    groupId?: string, 
    sortBy: 'hot' | 'top' | 'new' | 'rising' = 'hot', 
    limit: number = 50, 
    offset: number = 0
  ) => {
    try {
      setLoading(true);
      const data = await PostService.getRankedPosts(groupId, sortBy, limit, offset);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching ranked posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch user's posts
  const fetchUserPosts = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      const data = await PostService.getPosts({ author_id: targetUserId });
      setUserPosts(data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your posts",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Create a new post
  const createPost = useCallback(async (postData: CreatePostRequest): Promise<CommunityPost | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create posts",
        variant: "destructive",
      });
      return null;
    }

    try {
      setCreating(true);
      const newPost = await PostService.createPost(postData);
      
      if (newPost) {
        toast({
          title: "Success",
          description: "Post created successfully!",
        });
        
        // Refresh posts
        await fetchPosts();
        await fetchUserPosts();
        
        return newPost;
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      return null;
    } finally {
      setCreating(false);
    }
  }, [user, toast, fetchPosts, fetchUserPosts]);

  // Get a specific post
  const getPost = useCallback(async (postId: string): Promise<CommunityPost | null> => {
    try {
      const post = await PostService.getPostById(postId);
      setCurrentPost(post);
      return post;
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: "Error",
        description: "Failed to fetch post",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // Update a post
  const updatePost = useCallback(async (postId: string, updates: Partial<CommunityPost>): Promise<boolean> => {
    try {
      const success = await PostService.updatePost(postId, updates);
      
      if (success) {
        toast({
          title: "Success",
          description: "Post updated successfully!",
        });
        
        // Refresh posts
        await fetchPosts();
        await fetchUserPosts();
        
        // Update current post if it's the one being updated
        if (currentPost?.id === postId) {
          const updatedPost = await PostService.getPostById(postId);
          setCurrentPost(updatedPost);
        }
        
        return true;
      } else {
        throw new Error('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchPosts, fetchUserPosts, currentPost]);

  // Delete a post
  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    try {
      const success = await PostService.deletePost(postId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Post deleted successfully!",
        });
        
        // Refresh posts
        await fetchPosts();
        await fetchUserPosts();
        
        // Clear current post if it's the one being deleted
        if (currentPost?.id === postId) {
          setCurrentPost(null);
        }
        
        return true;
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchPosts, fetchUserPosts, currentPost]);

  // Pin/unpin a post
  const pinPost = useCallback(async (postId: string, isPinned: boolean): Promise<boolean> => {
    try {
      const success = await PostService.pinPost(postId, isPinned);
      
      if (success) {
        toast({
          title: "Success",
          description: isPinned ? "Post pinned successfully!" : "Post unpinned successfully!",
        });
        
        // Refresh posts
        await fetchPosts();
        
        return true;
      } else {
        throw new Error('Failed to pin/unpin post');
      }
    } catch (error) {
      console.error('Error pinning/unpinning post:', error);
      toast({
        title: "Error",
        description: "Failed to pin/unpin post",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchPosts]);

  // Lock/unlock a post
  const lockPost = useCallback(async (postId: string, isLocked: boolean): Promise<boolean> => {
    try {
      const success = await PostService.lockPost(postId, isLocked);
      
      if (success) {
        toast({
          title: "Success",
          description: isLocked ? "Post locked successfully!" : "Post unlocked successfully!",
        });
        
        // Refresh posts
        await fetchPosts();
        
        return true;
      } else {
        throw new Error('Failed to lock/unlock post');
      }
    } catch (error) {
      console.error('Error locking/unlocking post:', error);
      toast({
        title: "Error",
        description: "Failed to lock/unlock post",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchPosts]);

  // Track post view
  const trackPostView = useCallback(async (postId: string): Promise<void> => {
    try {
      await PostService.trackPostView(postId);
    } catch (error) {
      console.error('Error tracking post view:', error);
    }
  }, []);

  // Search posts
  const searchPosts = useCallback(async (query: string, filters?: {
    group_id?: string;
    post_type?: string;
    author_id?: string;
  }): Promise<CommunityPost[]> => {
    try {
      return await PostService.searchPosts(query, filters);
    } catch (error) {
      console.error('Error searching posts:', error);
      toast({
        title: "Error",
        description: "Failed to search posts",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  // Get post analytics
  const getPostAnalytics = useCallback(async (postId: string) => {
    try {
      return await PostService.getPostAnalytics(postId);
    } catch (error) {
      console.error('Error getting post analytics:', error);
      return null;
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [fetchUserPosts, user]);

  return {
    // State
    posts,
    userPosts,
    currentPost,
    loading,
    creating,
    
    // Actions
    fetchPosts,
    fetchRankedPosts,
    fetchUserPosts,
    createPost,
    getPost,
    updatePost,
    deletePost,
    pinPost,
    lockPost,
    trackPostView,
    searchPosts,
    getPostAnalytics,
  };
};
