import { useState, useCallback, useEffect } from 'react';
import { discoveryService } from '@/services/discoveryService';
import { TrendingContent } from '@/types/search';

export const useTrendingContent = () => {
  const [trendingContent, setTrendingContent] = useState<TrendingContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [limit, setLimit] = useState(20);

  const fetchTrendingContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const content = await discoveryService.getTrendingContent(period, limit);
      setTrendingContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trending content');
      console.error('Error fetching trending content:', err);
    } finally {
      setLoading(false);
    }
  }, [period, limit]);

  const refreshTrendingContent = useCallback(() => {
    fetchTrendingContent();
  }, [fetchTrendingContent]);

  const changePeriod = useCallback((newPeriod: 'hour' | 'day' | 'week' | 'month') => {
    setPeriod(newPeriod);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
  }, []);

  // Fetch trending content on mount and when period/limit changes
  useEffect(() => {
    fetchTrendingContent();
  }, [fetchTrendingContent]);

  return {
    trendingContent,
    loading,
    error,
    period,
    limit,
    fetchTrendingContent,
    refreshTrendingContent,
    changePeriod,
    changeLimit
  };
};
