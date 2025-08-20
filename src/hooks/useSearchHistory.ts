import { useState, useEffect, useCallback } from 'react';
import { SearchHistory, SearchFilter } from '@/types/search';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSearchHistory = () => {
  const { user } = useAuth();
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load search history
  const loadSearchHistory = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      setSearchHistory(data || []);
    } catch (err) {
      console.error('Error loading search history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load search history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add search to history
  const addSearchToHistory = useCallback(async (
    query: string, 
    filters: SearchFilter, 
    resultsCount: number
  ) => {
    if (!user) return;

    try {
      const newSearch: Omit<SearchHistory, 'id' | 'createdAt'> = {
        userId: user.id,
        query,
        filters,
        resultsCount,
        createdAt: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('search_history')
        .insert(newSearch)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Update local state
      setSearchHistory(prev => [data, ...prev.slice(0, 49)]); // Keep only 50 items
    } catch (err) {
      console.error('Error adding search to history:', err);
      // Don't set error for history addition failures
    }
  }, [user]);

  // Remove search from history
  const removeSearchFromHistory = useCallback(async (searchId: string) => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('search_history')
        .delete()
        .eq('id', searchId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state
      setSearchHistory(prev => prev.filter(search => search.id !== searchId));
    } catch (err) {
      console.error('Error removing search from history:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove search from history');
    }
  }, [user]);

  // Clear all search history
  const clearSearchHistory = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setSearchHistory([]);
    } catch (err) {
      console.error('Error clearing search history:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear search history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get search suggestions based on history
  const getSearchSuggestions = useCallback(() => {
    if (searchHistory.length === 0) return [];

    // Group searches by query and count frequency
    const queryCounts = new Map<string, number>();
    const queryFilters = new Map<string, SearchFilter>();

    searchHistory.forEach(search => {
      const count = queryCounts.get(search.query) || 0;
      queryCounts.set(search.query, count + 1);
      
      // Store the most recent filters for this query
      if (!queryFilters.has(search.query)) {
        queryFilters.set(search.query, search.filters);
      }
    });

    // Convert to suggestions array
    const suggestions = Array.from(queryCounts.entries())
      .map(([query, count]) => ({
        query,
        count,
        filters: queryFilters.get(query)!,
        lastUsed: searchHistory.find(s => s.query === query)?.createdAt || ''
      }))
      .sort((a, b) => b.count - a.count) // Sort by frequency
      .slice(0, 10); // Top 10

    return suggestions;
  }, [searchHistory]);

  // Get popular searches (searches with most results)
  const getPopularSearches = useCallback(() => {
    return searchHistory
      .filter(search => search.resultsCount > 0)
      .sort((a, b) => b.resultsCount - a.resultsCount)
      .slice(0, 10);
  }, [searchHistory]);

  // Get recent searches
  const getRecentSearches = useCallback((limit: number = 10) => {
    return searchHistory.slice(0, limit);
  }, [searchHistory]);

  // Search history by date range
  const getSearchHistoryByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return searchHistory.filter(search => {
      const searchDate = new Date(search.createdAt);
      return searchDate >= startDate && searchDate <= endDate;
    });
  }, [searchHistory]);

  // Get search statistics
  const getSearchStats = useCallback(() => {
    if (searchHistory.length === 0) {
      return {
        totalSearches: 0,
        averageResults: 0,
        mostSearchedQuery: '',
        totalResults: 0,
        searchFrequency: 0
      };
    }

    const totalSearches = searchHistory.length;
    const totalResults = searchHistory.reduce((sum, search) => sum + search.resultsCount, 0);
    const averageResults = totalResults / totalSearches;

    // Find most searched query
    const queryCounts = new Map<string, number>();
    searchHistory.forEach(search => {
      const count = queryCounts.get(search.query) || 0;
      queryCounts.set(search.query, count + 1);
    });

    const mostSearchedQuery = Array.from(queryCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Calculate search frequency (searches per day)
    const firstSearch = new Date(searchHistory[searchHistory.length - 1].createdAt);
    const lastSearch = new Date(searchHistory[0].createdAt);
    const daysDiff = (lastSearch.getTime() - firstSearch.getTime()) / (1000 * 60 * 60 * 24);
    const searchFrequency = daysDiff > 0 ? totalSearches / daysDiff : totalSearches;

    return {
      totalSearches,
      averageResults: Math.round(averageResults),
      mostSearchedQuery,
      totalResults,
      searchFrequency: Math.round(searchFrequency * 100) / 100
    };
  }, [searchHistory]);

  // Load search history on mount and when user changes
  useEffect(() => {
    loadSearchHistory();
  }, [loadSearchHistory]);

  return {
    searchHistory,
    loading,
    error,
    addSearchToHistory,
    removeSearchFromHistory,
    clearSearchHistory,
    getSearchSuggestions,
    getPopularSearches,
    getRecentSearches,
    getSearchHistoryByDateRange,
    getSearchStats,
    refreshHistory: loadSearchHistory
  };
};
