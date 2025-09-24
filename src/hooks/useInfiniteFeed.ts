import { useState, useEffect, useCallback, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface FeedPost {
  id: string;
  type: 'post' | 'event' | 'service' | 'discussion';
  title?: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  post_type?: string;
  event_date?: string;
  event_location?: string;
  price_range?: string;
  tags?: string[];
  image_urls?: string[];
  is_anonymous?: boolean;
  author?: {
    display_name?: string;
    avatar_url?: string;
    username?: string;
  };
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
}

interface UseInfiniteFeedOptions {
  feedType?: 'trending' | 'latest' | 'following' | 'local';
  limit?: number;
  enabled?: boolean;
}

export const useInfiniteFeed = (options: UseInfiniteFeedOptions = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    feedType = 'trending',
    limit = 10,
    enabled = true
  } = options;

  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Cache for posts to avoid refetching
  const postsCache = useRef<Map<string, FeedPost[]>>(new Map());
  const lastFetchTime = useRef<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchPosts = useCallback(async ({ pageParam = 0 }) => {
    if (!user) return { posts: [], nextCursor: null };

    const cacheKey = `${feedType}-${pageParam}`;
    const now = Date.now();
    
    // Check cache first
    if (postsCache.current.has(cacheKey) && (now - lastFetchTime.current) < CACHE_DURATION) {
      const cachedData = postsCache.current.get(cacheKey);
      if (cachedData) {
        return { posts: cachedData, nextCursor: pageParam + limit };
      }
    }

    try {
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          profiles!community_posts_user_id_fkey (
            display_name,
            avatar_url,
            username
          )
        `)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + limit - 1);

      // Apply filters based on feed type
      switch (feedType) {
        case 'trending':
          query = query.gte('likes_count', 5);
          break;
        case 'following':
          // Get posts from users the current user follows
          const { data: following } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);
          
          if (following && following.length > 0) {
            query = query.in('user_id', following.map(f => f.following_id));
          } else {
            // If not following anyone, return empty
            return { posts: [], nextCursor: null };
          }
          break;
        case 'local':
          // Get posts from users in the same area (simplified)
          query = query.not('location_city', 'is', null);
          break;
        default:
          // 'latest' - no additional filters
          break;
      }

      const { data: postsData, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      const posts = (postsData || []).map((post) => ({
        ...post,
        author: post.profiles || { display_name: 'Anonymous', avatar_url: null }
      }));

      // Cache the results
      postsCache.current.set(cacheKey, posts);
      lastFetchTime.current = now;

      // Determine if there are more pages
      const hasMore = posts.length === limit;
      const nextCursor = hasMore ? pageParam + limit : null;

      return { posts, nextCursor };
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      toast({
        title: "Error loading posts",
        description: "Failed to load posts. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }, [user, feedType, limit, toast]);

  const {
    data,
    fetchNextPage,
    hasNextPage: queryHasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['feed', feedType, user?.id],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Flatten all pages into a single array
  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  // Load more posts
  const loadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      await fetchNextPage();
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasNextPage, isFetchingNextPage, isLoadingMore, fetchNextPage]);

  // Clear cache when user changes
  useEffect(() => {
    postsCache.current.clear();
    lastFetchTime.current = 0;
  }, [user?.id]);

  // Update hasNextPage state
  useEffect(() => {
    setHasNextPage(!!queryHasNextPage);
  }, [queryHasNextPage]);

  return {
    posts: allPosts,
    loadMore,
    hasNextPage,
    isLoading,
    isLoadingMore: isLoadingMore || isFetchingNextPage,
    isError,
    error,
    refetch,
    // Cache management
    clearCache: () => {
      postsCache.current.clear();
      lastFetchTime.current = 0;
    }
  };
};

// Hook for intersection observer to trigger loading more
export const useInfiniteScroll = (loadMore: () => void, hasNextPage: boolean) => {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasNextPage]);

  return observerRef;
};

// Hook for smart prefetching
export const useSmartPrefetch = () => {
  const prefetchQueue = useRef<Set<string>>(new Set());
  const prefetchTimeout = useRef<NodeJS.Timeout>();

  const prefetchPost = useCallback((postId: string) => {
    if (prefetchQueue.current.has(postId)) return;
    
    prefetchQueue.current.add(postId);
    
    // Debounce prefetching
    if (prefetchTimeout.current) {
      clearTimeout(prefetchTimeout.current);
    }
    
    prefetchTimeout.current = setTimeout(() => {
      // Prefetch post details
      supabase
        .from('community_posts')
        .select('*')
        .eq('id', postId)
        .single()
        .then(() => {
          prefetchQueue.current.delete(postId);
        })
        .catch(() => {
          prefetchQueue.current.delete(postId);
        });
    }, 500);
  }, []);

  return { prefetchPost };
};

export default useInfiniteFeed;
