// Custom hooks for news functionality
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { newsService } from '@/services/newsService';
import type { 
  NewsArticle, 
  NewsTab, 
  LocationData, 
  NewsApiResponse,
  NewsComment,
  NewsPoll,
  NewsError
} from '@/types/news';

// Hook for managing news articles
export const useNews = (tab: NewsTab, location: LocationData) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['news', tab, location.city, location.country, page],
    queryFn: () => newsService.getNews(tab, location, page, 20),
    enabled: !!location.city,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setArticles(data.articles);
      } else {
        setArticles(prev => [...prev, ...data.articles]);
      }
      setHasMore(data.has_more);
    }
  }, [data, page]);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  const refresh = useCallback(() => {
    setPage(1);
    setArticles([]);
    setHasMore(true);
    refetch();
  }, [refetch]);

  return {
    articles,
    loading: isLoading,
    error: error as NewsError | null,
    hasMore,
    loadMore,
    refresh,
    isFetching
  };
};

// Hook for managing news interactions (likes, shares, etc.)
export const useNewsInteractions = () => {
  const queryClient = useQueryClient();
  const [interactions, setInteractions] = useState<Map<string, any>>(new Map());

  // Like article mutation
  const likeMutation = useMutation({
    mutationFn: (articleId: string) => newsService.likeArticle(articleId),
    onSuccess: (_, articleId) => {
      // Update local state
      setInteractions(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(articleId) || { likesCount: 0, isLiked: false };
        newMap.set(articleId, {
          ...current,
          likesCount: current.likesCount + 1,
          isLiked: true
        });
        return newMap;
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['news-interactions', articleId] });
    },
    onError: (error) => {
      console.error('Error liking article:', error);
    }
  });

  // Unlike article mutation
  const unlikeMutation = useMutation({
    mutationFn: (articleId: string) => newsService.unlikeArticle(articleId),
    onSuccess: (_, articleId) => {
      // Update local state
      setInteractions(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(articleId) || { likesCount: 0, isLiked: false };
        newMap.set(articleId, {
          ...current,
          likesCount: Math.max(0, current.likesCount - 1),
          isLiked: false
        });
        return newMap;
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['news-interactions', articleId] });
    },
    onError: (error) => {
      console.error('Error unliking article:', error);
    }
  });

  // Share article mutation
  const shareMutation = useMutation({
    mutationFn: ({ articleId, platform }: { articleId: string; platform?: string }) => 
      newsService.shareArticle(articleId, platform),
    onSuccess: (_, { articleId }) => {
      // Update local state
      setInteractions(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(articleId) || { sharesCount: 0 };
        newMap.set(articleId, {
          ...current,
          sharesCount: current.sharesCount + 1
        });
        return newMap;
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['news-interactions', articleId] });
    },
    onError: (error) => {
      console.error('Error sharing article:', error);
    }
  });

  // Get article interactions
  const getArticleInteractions = useCallback(async (articleId: string) => {
    try {
      const interactions = await newsService.getArticleInteractions(articleId);
      setInteractions(prev => {
        const newMap = new Map(prev);
        newMap.set(articleId, interactions);
        return newMap;
      });
      return interactions;
    } catch (error) {
      console.error('Error getting article interactions:', error);
      return null;
    }
  }, []);

  // Like/unlike article
  const toggleLike = useCallback((articleId: string) => {
    const current = interactions.get(articleId);
    if (current?.isLiked) {
      unlikeMutation.mutate(articleId);
    } else {
      likeMutation.mutate(articleId);
    }
  }, [interactions, likeMutation, unlikeMutation]);

  // Share article
  const shareArticle = useCallback((articleId: string, platform?: string) => {
    shareMutation.mutate({ articleId, platform });
  }, [shareMutation]);

  // Get interaction data for article
  const getInteractionData = useCallback((articleId: string) => {
    return interactions.get(articleId) || {
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      pollsCount: 0,
      isLiked: false
    };
  }, [interactions]);

  return {
    toggleLike,
    shareArticle,
    getArticleInteractions,
    getInteractionData,
    isLoading: likeMutation.isPending || unlikeMutation.isPending || shareMutation.isPending
  };
};

// Hook for managing news comments
export const useNewsComments = (articleId: string) => {
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!articleId) return;

    setLoading(true);
    setError(null);

    try {
      const commentsData = await newsService.getArticleComments(articleId);
      setComments(commentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  const addComment = useCallback(async (content: string, parentId?: string) => {
    if (!articleId) return;

    try {
      const newComment = await newsService.addComment(articleId, content, parentId);
      setComments(prev => [newComment, ...prev]);
      return newComment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      throw err;
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    addComment,
    refetch: fetchComments
  };
};

// Hook for real-time news updates
export const useNewsRealtime = (articleIds: string[]) => {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (articleIds.length === 0) return;

    const channels = articleIds.map(articleId => {
      const channel = supabase
        .channel(`news-${articleId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'news_likes',
            filter: `article_id=eq.${articleId}`
          },
          (payload) => {
            setUpdates(prev => [...prev, {
              type: 'like',
              articleId,
              data: payload,
              timestamp: new Date().toISOString()
            }]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'news_comments',
            filter: `article_id=eq.${articleId}`
          },
          (payload) => {
            setUpdates(prev => [...prev, {
              type: 'comment',
              articleId,
              data: payload,
              timestamp: new Date().toISOString()
            }]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'news_shares',
            filter: `article_id=eq.${articleId}`
          },
          (payload) => {
            setUpdates(prev => [...prev, {
              type: 'share',
              articleId,
              data: payload,
              timestamp: new Date().toISOString()
            }]);
          }
        )
        .subscribe();

      return channel;
    });

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [articleIds]);

  return updates;
};

// Hook for location management
export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentLocation = await newsService.getCurrentLocation();
      setLocation(currentLocation);
      return currentLocation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      
      // Fallback to Delhi, India
      const fallbackLocation: LocationData = {
        city: 'Delhi',
        country: 'India',
        latitude: 28.6139,
        longitude: 77.2090
      };
      setLocation(fallbackLocation);
      return fallbackLocation;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocation = useCallback((newLocation: LocationData) => {
    setLocation(newLocation);
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    updateLocation
  };
};

// Hook for news polls
export const useNewsPolls = (articleId: string) => {
  const [polls, setPolls] = useState<NewsPoll[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPolls = useCallback(async () => {
    if (!articleId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_polls')
        .select(`
          *,
          profiles!news_polls_user_id_fkey(display_name, avatar_url),
          news_poll_votes(count)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolls(data || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  const createPoll = useCallback(async (question: string, options: string[]) => {
    if (!articleId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('news_polls')
        .insert({
          article_id: articleId,
          user_id: user.id,
          question,
          options
        })
        .select(`
          *,
          profiles!news_polls_user_id_fkey(display_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      
      setPolls(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }, [articleId]);

  const votePoll = useCallback(async (pollId: string, optionIndex: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('news_poll_votes')
        .upsert({
          poll_id: pollId,
          user_id: user.id,
          option_index: optionIndex
        }, { onConflict: 'poll_id,user_id' });

      if (error) throw error;

      // Refresh polls to get updated vote counts
      fetchPolls();
    } catch (error) {
      console.error('Error voting in poll:', error);
      throw error;
    }
  }, [fetchPolls]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  return {
    polls,
    loading,
    createPoll,
    votePoll,
    refetch: fetchPolls
  };
};
