import { useState, useEffect, useCallback, useRef } from 'react';
import { realTimeNewsService } from '@/services/realTimeNewsService';
import { newsSummarizationService } from '@/services/newsSummarizationService';
import { NewsArticle } from '@/types/news';
import { NewsSummary } from '@/services/newsSummarizationService';

export interface RealTimeNewsState {
  articles: NewsArticle[];
  summaries: Map<string, NewsSummary>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isConnected: boolean;
}

export interface NewsFilters {
  category?: string;
  location?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  timeRange?: '1h' | '6h' | '24h' | '7d';
  searchQuery?: string;
}

export const useRealTimeNews = (filters: NewsFilters = {}) => {
  const [state, setState] = useState<RealTimeNewsState>({
    articles: [],
    summaries: new Map(),
    loading: true,
    error: null,
    lastUpdated: null,
    isConnected: false
  });

  const subscriptionRef = useRef<string | null>(null);
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
        article.location.city.toLowerCase() === filtersRef.current.location?.toLowerCase()
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
        article.description.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query)
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

  // Initialize real-time news service
  const initializeService = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Start real-time fetching
      await realTimeNewsService.startRealTimeFetching();

      // Subscribe to new articles
      const subscriptionId = realTimeNewsService.subscribeToNews(handleNewArticles);
      subscriptionRef.current = subscriptionId;

      // Load initial articles
      const initialArticles = await realTimeNewsService.getLatestArticles(50);
      const filteredArticles = filterArticles(initialArticles);
      
      // Load summaries for initial articles
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
      console.error('Error initializing real-time news service:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load news',
        isConnected: false
      }));
    }
  }, [handleNewArticles, filterArticles, loadSummaries]);

  // Refresh articles manually
  const refreshArticles = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const articles = await realTimeNewsService.getLatestArticles(50);
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
      article.description.toLowerCase().includes(lowercaseQuery) ||
      article.source.toLowerCase().includes(lowercaseQuery) ||
      article.location.city.toLowerCase().includes(lowercaseQuery)
    );
  }, [state.articles]);

  // Initialize on mount
  useEffect(() => {
    initializeService();

    return () => {
      // Cleanup subscription
      if (subscriptionRef.current) {
        realTimeNewsService.unsubscribeFromNews(subscriptionRef.current);
      }
      
      // Stop real-time fetching
      realTimeNewsService.stopRealTimeFetching();
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

    // Actions
    refreshArticles,
    getArticlesByLocation,
    getArticleSummary,
    getTrendingArticles,
    getLatestArticles,
    getArticlesByCategory,
    searchArticles,

    // Utilities
    totalArticles: state.articles.length,
    hasMore: state.articles.length >= 50, // Assuming pagination at 50
  };
};
