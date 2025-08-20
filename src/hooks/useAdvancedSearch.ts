import { useState, useCallback, useEffect } from 'react';
import { searchService } from '@/services/searchService';
import { SearchQuery, SearchResult, SearchFilter } from '@/types/search';
import { useAuth } from './useAuth';
import { useLocation } from './useLocation';

export const useAdvancedSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilter>({
    type: 'all',
    category: 'all',
    location: {
      enabled: false,
      radius: 50
    },
    dateRange: {
      enabled: false,
      start: '',
      end: ''
    },
    priceRange: {
      enabled: false,
      min: 0,
      max: 1000
    },
    tags: [],
    rating: 0,
    sortBy: 'relevance'
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const { user } = useAuth();
  const { currentLocation } = useLocation();

  const search = useCallback(async (searchQuery?: string, searchFilters?: SearchFilter, pageNum?: number) => {
    const queryToUse = searchQuery || query;
    const filtersToUse = searchFilters || filters;
    const pageToUse = pageNum || 0;

    if (!queryToUse.trim()) {
      setResults([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchQuery: SearchQuery = {
        query: queryToUse,
        type: filtersToUse.type === 'all' ? undefined : filtersToUse.type as any,
        category: filtersToUse.category === 'all' ? undefined : filtersToUse.category,
        location: filtersToUse.location.enabled && currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          radius: filtersToUse.location.radius
        } : undefined,
        dateRange: filtersToUse.dateRange.enabled ? {
          start: filtersToUse.dateRange.start,
          end: filtersToUse.dateRange.end
        } : undefined,
        priceRange: filtersToUse.priceRange.enabled ? {
          min: filtersToUse.priceRange.min,
          max: filtersToUse.priceRange.max
        } : undefined,
        tags: filtersToUse.tags.length > 0 ? filtersToUse.tags : undefined,
        sortBy: filtersToUse.sortBy as any,
        page: pageToUse,
        limit: 20
      };

      const searchResults = await searchService.search(searchQuery);

      if (pageToUse === 0) {
        setResults(searchResults);
      } else {
        setResults(prev => [...prev, ...searchResults]);
      }

      setHasMore(searchResults.length === 20);
      setPage(pageToUse);

      // Save search history if user is logged in
      if (user) {
        await searchService.saveSearchHistory(
          user.id,
          queryToUse,
          filtersToUse,
          searchResults.length
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, filters, currentLocation, user]);

  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestions = await searchService.getSearchSuggestions(searchQuery);
      setSuggestions(suggestions);
    } catch (err) {
      console.error('Error getting suggestions:', err);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      type: 'all',
      category: 'all',
      location: {
        enabled: false,
        radius: 50
      },
      dateRange: {
        enabled: false,
        start: '',
        end: ''
      },
      priceRange: {
        enabled: false,
        min: 0,
        max: 1000
      },
      tags: [],
      rating: 0,
      sortBy: 'relevance'
    });
    setPage(0);
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      search(query, filters, page + 1);
    }
  }, [loading, hasMore, search, query, filters, page]);

  const clearResults = useCallback(() => {
    setResults([]);
    setPage(0);
    setHasMore(true);
    setError(null);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        search();
        getSuggestions(query);
      } else {
        clearResults();
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, search, getSuggestions, clearResults]);

  // Search when filters change
  useEffect(() => {
    if (query.trim()) {
      search();
    }
  }, [filters, search]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    suggestions,
    hasMore,
    loadMore,
    clearResults,
    search: () => search()
  };
};
