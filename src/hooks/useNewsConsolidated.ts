/**
 * Consolidated News Hook - Combines useNews, useNewsData, and useRealTimeNews
 * Provides comprehensive news functionality with real-time updates, filtering, and caching
 */

import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Note: These services would need to be implemented
// For now, we'll create mock implementations
import type { 
  NewsArticle, 
  NewsTab, 
  LocationData, 
  NewsApiResponse,
  NewsComment,
  NewsPoll,
  NewsError
} from '@/types/news';
import type { NewsSummary } from '@/services/newsSummarizationService';

export interface NewsFilters {
  category?: string;
  location?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  timeRange?: '1h' | '6h' | '24h' | '7d';
  searchQuery?: string;
  tab?: NewsTab;
}

export interface NewsState {
  articles: NewsArticle[];
  summaries: Map<string, NewsSummary>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isConnected: boolean;
  hasMore: boolean;
  page: number;
}

/**
 * Consolidated news hook that combines all news functionality
 */
export const useNewsConsolidated = (filters: NewsFilters = {}) => {
  const [state, setState] = useState<NewsState>({
    articles: [],
    summaries: new Map(),
    loading: true,
    error: null,
    lastUpdated: null,
    isConnected: false,
    hasMore: true,
    page: 1
  });

  const queryClient = useQueryClient();
  const filtersRef = useRef(filters);

  // Update filters ref when filters change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Filter articles based on current filters
  const filterArticles = useCallback((articles: NewsArticle[]): NewsArticle[] => {
    let filtered = [...articles];

    if (filtersRef.current.category && filtersRef.current.category !== 'all') {
      filtered = filtered.filter(article => 
        article.category === filtersRef.current.category
      );
    }

    if (filtersRef.current.location && filtersRef.current.location !== 'all') {
      filtered = filtered.filter(article => 
        article.location?.city?.toLowerCase() === filtersRef.current.location?.toLowerCase()
      );
    }

    if (filtersRef.current.timeRange) {
      const now = new Date();
      const timeRanges = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
      };
      
      const timeLimit = timeRanges[filtersRef.current.timeRange];
      filtered = filtered.filter(article => 
        now.getTime() - new Date(article.published_at).getTime() <= timeLimit
      );
    }

    if (filtersRef.current.searchQuery) {
      const query = filtersRef.current.searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.description?.toLowerCase().includes(query) ||
        article.source?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, []);

  // Load summaries for articles
  const loadSummaries = useCallback(async (articles: NewsArticle[]) => {
    const summaryPromises = articles.map(async (article) => {
      try {
        const summary = await newsSummarizationService.getSummary(article.id);
        if (summary) {
          return { articleId: article.id, summary };
        }
        
        // Generate new summary if not found
        const newSummary = await newsSummarizationService.generateSummary({
          id: article.id,
          title: article.title,
          content: article.content || article.description,
          description: article.description
        });
        
        return { articleId: article.id, summary: newSummary };
      } catch (error) {
        console.error(`Error loading summary for article ${article.id}:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(summaryPromises);
    const summaries = new Map<string, NewsSummary>();

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        summaries.set(result.value.articleId, result.value.summary);
      }
    });

    return summaries;
  }, []);

  // Handle new articles from real-time service
  const handleNewArticles = useCallback(async (newArticles: NewsArticle[]) => {
    setState(prev => {
      // Merge new articles with existing ones, avoiding duplicates
      const existingIds = new Set(prev.articles.map(a => a.id));
      const uniqueNewArticles = newArticles.filter(a => !existingIds.has(a.id));
      
      if (uniqueNewArticles.length === 0) {
        return prev;
      }

      const allArticles = [...uniqueNewArticles, ...prev.articles];
      const filteredArticles = filterArticles(allArticles);

      return {
        ...prev,
        articles: filteredArticles,
        lastUpdated: new Date(),
        isConnected: true
      };
    });

    // Load summaries for new articles
    const newSummaries = await loadSummaries(newArticles);
    setState(prev => ({
      ...prev,
      summaries: new Map([...prev.summaries, ...newSummaries])
    }));
  }, [filterArticles, loadSummaries]);

  // Initialize news service
  const initializeService = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Start real-time updates with callback
      realTimeNewsService.startRealTimeUpdates(handleNewArticles);

      // Load initial articles based on tab
      let initialArticles: NewsArticle[] = [];
      
      if (filtersRef.current.tab === 'trending') {
        initialArticles = await realTimeNewsService.getTrendingArticles(50);
      } else if (filtersRef.current.tab === 'local') {
        initialArticles = await realTimeNewsService.getArticlesByLocation(
          filtersRef.current.location || 'Delhi', 
          50
        );
      } else {
        initialArticles = await realTimeNewsService.getLatestArticles(50);
      }

      const filteredArticles = filterArticles(initialArticles);
      const summaries = await loadSummaries(filteredArticles);

      setState(prev => ({
        ...prev,
        articles: filteredArticles,
        summaries,
        loading: false,
        lastUpdated: new Date(),
        isConnected: true
      }));

    } catch (error) {
      console.error('Error initializing news service:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load news',
        isConnected: false
      }));
    }
  }, [handleNewArticles, filterArticles, loadSummaries]);

  // Load more articles (pagination)
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const nextPage = state.page + 1;
      const newArticles = await realTimeNewsService.getLatestArticles(50, nextPage);
      const filteredArticles = filterArticles(newArticles);
      const summaries = await loadSummaries(filteredArticles);

      setState(prev => ({
        ...prev,
        articles: [...prev.articles, ...filteredArticles],
        summaries: new Map([...prev.summaries, ...summaries]),
        page: nextPage,
        hasMore: newArticles.length === 50,
        loading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error loading more articles:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load more articles'
      }));
    }
  }, [state.hasMore, state.loading, state.page, filterArticles, loadSummaries]);

  // Refresh articles manually
  const refreshArticles = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, page: 1 }));
      
      const articles = await realTimeNewsService.getLatestArticles(50);
      const filteredArticles = filterArticles(articles);
      const summaries = await loadSummaries(filteredArticles);

      setState(prev => ({
        ...prev,
        articles: filteredArticles,
        summaries,
        loading: false,
        lastUpdated: new Date(),
        hasMore: articles.length === 50
      }));
    } catch (error) {
      console.error('Error refreshing articles:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh news'
      }));
    }
  }, [filterArticles, loadSummaries]);

  // Get articles by location
  const getArticlesByLocation = useCallback(async (city: string, radiusKm: number = 50) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const articles = await realTimeNewsService.getArticlesByLocation(city, radiusKm);
      const filteredArticles = filterArticles(articles);
      const summaries = await loadSummaries(filteredArticles);

      setState(prev => ({
        ...prev,
        articles: filteredArticles,
        summaries,
        loading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error fetching articles by location:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch location-based news'
      }));
    }
  }, [filterArticles, loadSummaries]);

  // Get summary for a specific article
  const getArticleSummary = useCallback((articleId: string): NewsSummary | null => {
    return state.summaries.get(articleId) || null;
  }, [state.summaries]);

  // Get trending articles
  const getTrendingArticles = useCallback((): NewsArticle[] => {
    return [...state.articles].sort((a, b) => {
      const aEngagement = a.engagement.likes + a.engagement.comments + a.engagement.shares;
      const bEngagement = b.engagement.likes + b.engagement.comments + b.engagement.shares;
      return bEngagement - aEngagement;
    });
  }, [state.articles]);

  // Get latest articles
  const getLatestArticles = useCallback((): NewsArticle[] => {
    return [...state.articles].sort((a, b) => 
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }, [state.articles]);

  // Get articles by category
  const getArticlesByCategory = useCallback((category: string): NewsArticle[] => {
    if (category === 'all') return state.articles;
    return state.articles.filter(article => article.category === category);
  }, [state.articles]);

  // Search articles
  const searchArticles = useCallback((query: string): NewsArticle[] => {
    if (!query.trim()) return state.articles;
    
    const lowercaseQuery = query.toLowerCase();
    return state.articles.filter(article =>
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.description?.toLowerCase().includes(lowercaseQuery) ||
      article.source?.toLowerCase().includes(lowercaseQuery)
    );
  }, [state.articles]);

  // Get article by ID
  const getArticleById = useCallback((id: string): NewsArticle | undefined => {
    return state.articles.find(article => article.id === id);
  }, [state.articles]);

  // Initialize on mount
  useEffect(() => {
    initializeService();

    return () => {
      // Stop real-time updates
      realTimeNewsService.stopRealTimeUpdates();
    };
  }, [initializeService]);

  // Re-filter articles when filters change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      articles: filterArticles(prev.articles)
    }));
  }, [filters, filterArticles]);

  return {
    // State
    articles: state.articles,
    summaries: state.summaries,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    isConnected: state.isConnected,
    hasMore: state.hasMore,
    totalArticles: state.articles.length,

    // Actions
    loadMore,
    refreshArticles,
    getArticlesByLocation,
    getArticleSummary,
    getTrendingArticles,
    getLatestArticles,
    getArticlesByCategory,
    searchArticles,
    getArticleById,

    // Utilities
    isOnline: navigator.onLine,
    canLoadMore: state.hasMore && !state.loading
  };
};

/**
 * Context hook for news (backward compatibility)
 */
export const useNews = (): NewsContextType => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
