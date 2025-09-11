import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeCounts {
  likes: number;
  shares: number;
  comments: number;
  pollVotes: number;
}

interface NewsRealtimeData {
  articleId: string;
  counts: RealtimeCounts;
  lastUpdated: string;
}

interface UseNewsRealtimeOptions {
  articleIds: string[];
  enabled?: boolean;
}

interface UseNewsRealtimeReturn {
  data: Map<string, RealtimeCounts>;
  loading: boolean;
  error: string | null;
  subscribe: (articleId: string) => void;
  unsubscribe: (articleId: string) => void;
  refresh: () => Promise<void>;
}

export function useNewsRealtime({
  articleIds,
  enabled = true
}: UseNewsRealtimeOptions): UseNewsRealtimeReturn {
  const { user } = useAuth();
  const [data, setData] = useState<Map<string, RealtimeCounts>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Map<string, {
    likes: RealtimeChannel;
    shares: RealtimeChannel;
    comments: RealtimeChannel;
    pollVotes: RealtimeChannel;
  }>>(new Map());

  // Fetch initial counts
  const fetchCounts = useCallback(async (ids: string[]) => {
    if (!ids.length) return;

    setLoading(true);
    setError(null);

    try {
      const countsMap = new Map<string, RealtimeCounts>();

      // Fetch likes count
      const { data: likesData, error: likesError } = await supabase
        .from('news_likes')
        .select('article_id')
        .in('article_id', ids);

      if (likesError) throw likesError;

      // Count likes per article
      const likesCount = new Map<string, number>();
      likesData?.forEach(like => {
        likesCount.set(like.article_id, (likesCount.get(like.article_id) || 0) + 1);
      });

      // Fetch shares count
      const { data: sharesData, error: sharesError } = await supabase
        .from('news_shares')
        .select('article_id')
        .in('article_id', ids);

      if (sharesError) throw sharesError;

      const sharesCount = new Map<string, number>();
      sharesData?.forEach(share => {
        sharesCount.set(share.article_id, (sharesCount.get(share.article_id) || 0) + 1);
      });

      // Fetch comments count
      const { data: commentsData, error: commentsError } = await supabase
        .from('news_article_comments')
        .select('article_id')
        .in('article_id', ids);

      if (commentsError) throw commentsError;

      const commentsCount = new Map<string, number>();
      commentsData?.forEach(comment => {
        commentsCount.set(comment.article_id, (commentsCount.get(comment.article_id) || 0) + 1);
      });

      // Fetch poll votes count
      const { data: pollVotesData, error: pollVotesError } = await supabase
        .from('news_poll_votes')
        .select('article_id')
        .in('article_id', ids);

      if (pollVotesError) throw pollVotesError;

      const pollVotesCount = new Map<string, number>();
      pollVotesData?.forEach(vote => {
        pollVotesCount.set(vote.article_id, (pollVotesCount.get(vote.article_id) || 0) + 1);
      });

      // Combine all counts
      ids.forEach(articleId => {
        countsMap.set(articleId, {
          likes: likesCount.get(articleId) || 0,
          shares: sharesCount.get(articleId) || 0,
          comments: commentsCount.get(articleId) || 0,
          pollVotes: pollVotesCount.get(articleId) || 0
        });
      });

      setData(countsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch counts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to real-time updates for an article
  const subscribe = useCallback((articleId: string) => {
    if (!enabled || subscriptions.has(articleId)) return;

    // Subscribe to likes changes
    const likesSubscription = supabase
      .channel(`news_likes_${articleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_likes',
          filter: `article_id=eq.${articleId}`
        },
        () => {
          // Refetch counts for this article
          fetchCounts([articleId]);
        }
      )
      .subscribe();

    // Subscribe to shares changes
    const sharesSubscription = supabase
      .channel(`news_shares_${articleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_shares',
          filter: `article_id=eq.${articleId}`
        },
        () => {
          fetchCounts([articleId]);
        }
      )
      .subscribe();

    // Subscribe to comments changes
    const commentsSubscription = supabase
      .channel(`news_comments_${articleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_article_comments',
          filter: `article_id=eq.${articleId}`
        },
        () => {
          fetchCounts([articleId]);
        }
      )
      .subscribe();

    // Subscribe to poll votes changes
    const pollVotesSubscription = supabase
      .channel(`news_poll_votes_${articleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_poll_votes',
          filter: `article_id=eq.${articleId}`
        },
        () => {
          fetchCounts([articleId]);
        }
      )
      .subscribe();

    setSubscriptions(prev => new Map(prev).set(articleId, {
      likes: likesSubscription,
      shares: sharesSubscription,
      comments: commentsSubscription,
      pollVotes: pollVotesSubscription
    }));
  }, [enabled, subscriptions, fetchCounts]);

  // Unsubscribe from real-time updates for an article
  const unsubscribe = useCallback((articleId: string) => {
    const subscription = subscriptions.get(articleId);
    if (subscription) {
      subscription.likes.unsubscribe();
      subscription.shares.unsubscribe();
      subscription.comments.unsubscribe();
      subscription.pollVotes.unsubscribe();
      
      setSubscriptions(prev => {
        const newSubs = new Map(prev);
        newSubs.delete(articleId);
        return newSubs;
      });
    }
  }, [subscriptions]);

  // Refresh all counts
  const refresh = useCallback(async () => {
    await fetchCounts(articleIds);
  }, [fetchCounts, articleIds]);

  // Initial fetch and subscription setup
  useEffect(() => {
    if (!enabled || !articleIds.length) return;

    fetchCounts(articleIds);

    // Subscribe to all articles
    articleIds.forEach(articleId => {
      subscribe(articleId);
    });

    // Cleanup subscriptions on unmount or when articleIds change
    return () => {
      articleIds.forEach(articleId => {
        unsubscribe(articleId);
      });
    };
  }, [enabled, articleIds, fetchCounts, subscribe, unsubscribe]);

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptions.forEach((_, articleId) => {
        unsubscribe(articleId);
      });
    };
  }, [subscriptions, unsubscribe]);

  return {
    data,
    loading,
    error,
    subscribe,
    unsubscribe,
    refresh
  };
}

// Hook for single article real-time updates
export function useArticleRealtime(articleId: string, enabled = true) {
  const { data, loading, error, refresh } = useNewsRealtime({
    articleIds: [articleId],
    enabled
  });

  return {
    counts: data.get(articleId) || { likes: 0, shares: 0, comments: 0, pollVotes: 0 },
    loading,
    error,
    refresh
  };
}

// Hook for poll real-time updates
export function usePollRealtime(pollId: string, enabled = true) {
  const [pollData, setPollData] = useState<{ id: string; votes: Record<string, number>; totalVotes: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPollData = useCallback(async () => {
    if (!pollId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: pollError } = await supabase
        .from('community_polls')
        .select(`
          *,
          poll_votes(vote_type, created_at)
        `)
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;
      setPollData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch poll data');
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    if (!enabled || !pollId) return;

    fetchPollData();

    // Subscribe to poll votes changes
    const subscription = supabase
      .channel(`poll_votes_${pollId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_votes',
          filter: `poll_id=eq.${pollId}`
        },
        () => {
          fetchPollData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [enabled, pollId, fetchPollData]);

  return {
    pollData,
    loading,
    error,
    refresh: fetchPollData
  };
}
