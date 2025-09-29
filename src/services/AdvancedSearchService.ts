/**
 * Advanced Search Service
 * Provides full-text search, filtering, sorting, and analytics
 */

import { supabase } from '@/integrations/supabase/client';

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  tags?: string[];
  author?: string;
  status?: string;
  visibility?: 'public' | 'private' | 'all';
}

export interface SearchSortOptions {
  field: 'relevance' | 'date' | 'rating' | 'popularity' | 'price' | 'title';
  order: 'asc' | 'desc';
}

export interface SearchAnalytics {
  totalResults: number;
  searchTime: number;
  filtersApplied: number;
  popularSearches: string[];
  searchSuggestions: string[];
}

export interface SearchResult<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  analytics: SearchAnalytics;
  filters: SearchFilters;
  sort: SearchSortOptions;
}

export class AdvancedSearchService {
  private static instance: AdvancedSearchService;
  private searchHistory: string[] = [];
  private searchAnalytics: Map<string, number> = new Map();

  static getInstance(): AdvancedSearchService {
    if (!AdvancedSearchService.instance) {
      AdvancedSearchService.instance = new AdvancedSearchService();
    }
    return AdvancedSearchService.instance;
  }

  /**
   * Universal search across all content types
   */
  async universalSearch(
    query: string,
    filters: SearchFilters = {},
    sort: SearchSortOptions = { field: 'relevance', order: 'desc' },
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      // Track search analytics
      this.trackSearch(query);
      
      // Search across multiple tables
      const [posts, businesses, events, services, news] = await Promise.all([
        this.searchPosts(query, filters, sort, pagination),
        this.searchBusinesses(query, filters, sort, pagination),
        this.searchEvents(query, filters, sort, pagination),
        this.searchServices(query, filters, sort, pagination),
        this.searchNews(query, filters, sort, pagination),
      ]);

      // Combine and rank results
      const combinedResults = this.combineSearchResults([
        ...posts.data,
        ...businesses.data,
        ...events.data,
        ...services.data,
        ...news.data,
      ]);

      const searchTime = Date.now() - startTime;

      return {
        data: combinedResults,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: combinedResults.length,
          totalPages: Math.ceil(combinedResults.length / pagination.limit),
        },
        analytics: {
          totalResults: combinedResults.length,
          searchTime,
          filtersApplied: Object.keys(filters).length,
          popularSearches: this.getPopularSearches(),
          searchSuggestions: this.getSearchSuggestions(query),
        },
        filters,
        sort,
      };
    } catch (error) {
      console.error('Universal search error:', error);
      throw new Error('Search failed');
    }
  }

  /**
   * Search posts with advanced filtering
   */
  async searchPosts(
    query: string,
    filters: SearchFilters,
    sort: SearchSortOptions,
    pagination: { page: number; limit: number }
  ): Promise<SearchResult> {
    let searchQuery = supabase
      .from('community_posts')
      .select(`
        *,
        profiles:user_id (display_name, avatar_url),
        community_groups (name)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`);

    // Apply filters
    if (filters.category) {
      searchQuery = searchQuery.eq('category', filters.category);
    }
    if (filters.location) {
      searchQuery = searchQuery.ilike('location', `%${filters.location}%`);
    }
    if (filters.dateRange) {
      searchQuery = searchQuery
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }
    if (filters.visibility && filters.visibility !== 'all') {
      searchQuery = searchQuery.eq('visibility', filters.visibility);
    }
    if (filters.tags && filters.tags.length > 0) {
      searchQuery = searchQuery.overlaps('tags', filters.tags);
    }

    // Apply sorting
    const sortField = this.getSortField(sort.field, 'posts');
    searchQuery = searchQuery.order(sortField, { ascending: sort.order === 'asc' });

    // Apply pagination
    const offset = (pagination.page - 1) * pagination.limit;
    searchQuery = searchQuery.range(offset, offset + pagination.limit - 1);

    const { data, error } = await searchQuery;
    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: data?.length || 0,
        totalPages: Math.ceil((data?.length || 0) / pagination.limit),
      },
      analytics: {
        totalResults: data?.length || 0,
        searchTime: 0,
        filtersApplied: 0,
        popularSearches: [],
        searchSuggestions: [],
      },
      filters,
      sort,
    };
  }

  /**
   * Search businesses with advanced filtering
   */
  async searchBusinesses(
    query: string,
    filters: SearchFilters,
    sort: SearchSortOptions,
    pagination: { page: number; limit: number }
  ): Promise<SearchResult> {
    let searchQuery = supabase
      .from('local_businesses')
      .select(`
        *,
        profiles:owner_id (display_name, avatar_url)
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);

    // Apply filters
    if (filters.category) {
      searchQuery = searchQuery.eq('category', filters.category);
    }
    if (filters.subcategory) {
      searchQuery = searchQuery.eq('subcategory', filters.subcategory);
    }
    if (filters.location) {
      searchQuery = searchQuery.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%`);
    }
    if (filters.priceRange) {
      searchQuery = searchQuery
        .gte('price_range_min', filters.priceRange.min)
        .lte('price_range_max', filters.priceRange.max);
    }
    if (filters.rating) {
      searchQuery = searchQuery.gte('rating', filters.rating);
    }

    // Apply sorting
    const sortField = this.getSortField(sort.field, 'businesses');
    searchQuery = searchQuery.order(sortField, { ascending: sort.order === 'asc' });

    // Apply pagination
    const offset = (pagination.page - 1) * pagination.limit;
    searchQuery = searchQuery.range(offset, offset + pagination.limit - 1);

    const { data, error } = await searchQuery;
    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: data?.length || 0,
        totalPages: Math.ceil((data?.length || 0) / pagination.limit),
      },
      analytics: {
        totalResults: data?.length || 0,
        searchTime: 0,
        filtersApplied: 0,
        popularSearches: [],
        searchSuggestions: [],
      },
      filters,
      sort,
    };
  }

  /**
   * Search events with advanced filtering
   */
  async searchEvents(
    query: string,
    filters: SearchFilters,
    sort: SearchSortOptions,
    pagination: { page: number; limit: number }
  ): Promise<SearchResult> {
    let searchQuery = supabase
      .from('community_events')
      .select(`
        *,
        profiles:organizer_id (display_name, avatar_url)
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);

    // Apply filters
    if (filters.category) {
      searchQuery = searchQuery.eq('category', filters.category);
    }
    if (filters.location) {
      searchQuery = searchQuery.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%`);
    }
    if (filters.dateRange) {
      searchQuery = searchQuery
        .gte('start_date', filters.dateRange.start)
        .lte('end_date', filters.dateRange.end);
    }
    if (filters.status) {
      searchQuery = searchQuery.eq('status', filters.status);
    }

    // Apply sorting
    const sortField = this.getSortField(sort.field, 'events');
    searchQuery = searchQuery.order(sortField, { ascending: sort.order === 'asc' });

    // Apply pagination
    const offset = (pagination.page - 1) * pagination.limit;
    searchQuery = searchQuery.range(offset, offset + pagination.limit - 1);

    const { data, error } = await searchQuery;
    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: data?.length || 0,
        totalPages: Math.ceil((data?.length || 0) / pagination.limit),
      },
      analytics: {
        totalResults: data?.length || 0,
        searchTime: 0,
        filtersApplied: 0,
        popularSearches: [],
        searchSuggestions: [],
      },
      filters,
      sort,
    };
  }

  /**
   * Search services with advanced filtering
   */
  async searchServices(
    query: string,
    filters: SearchFilters,
    sort: SearchSortOptions,
    pagination: { page: number; limit: number }
  ): Promise<SearchResult> {
    let searchQuery = supabase
      .from('artist_services')
      .select(`
        *,
        profiles:provider_id (display_name, avatar_url)
      `)
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);

    // Apply filters
    if (filters.category) {
      searchQuery = searchQuery.eq('category', filters.category);
    }
    if (filters.subcategory) {
      searchQuery = searchQuery.eq('subcategory', filters.subcategory);
    }
    if (filters.location) {
      searchQuery = searchQuery.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%`);
    }
    if (filters.priceRange) {
      searchQuery = searchQuery
        .gte('price', filters.priceRange.min)
        .lte('price', filters.priceRange.max);
    }
    if (filters.rating) {
      searchQuery = searchQuery.gte('rating', filters.rating);
    }

    // Apply sorting
    const sortField = this.getSortField(sort.field, 'services');
    searchQuery = searchQuery.order(sortField, { ascending: sort.order === 'asc' });

    // Apply pagination
    const offset = (pagination.page - 1) * pagination.limit;
    searchQuery = searchQuery.range(offset, offset + pagination.limit - 1);

    const { data, error } = await searchQuery;
    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: data?.length || 0,
        totalPages: Math.ceil((data?.length || 0) / pagination.limit),
      },
      analytics: {
        totalResults: data?.length || 0,
        searchTime: 0,
        filtersApplied: 0,
        popularSearches: [],
        searchSuggestions: [],
      },
      filters,
      sort,
    };
  }

  /**
   * Search news with advanced filtering
   */
  async searchNews(
    query: string,
    filters: SearchFilters,
    sort: SearchSortOptions,
    pagination: { page: number; limit: number }
  ): Promise<SearchResult> {
    let searchQuery = supabase
      .from('news_articles')
      .select(`
        *,
        profiles:author_id (display_name, avatar_url)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`);

    // Apply filters
    if (filters.category) {
      searchQuery = searchQuery.eq('category', filters.category);
    }
    if (filters.location) {
      searchQuery = searchQuery.ilike('location', `%${filters.location}%`);
    }
    if (filters.dateRange) {
      searchQuery = searchQuery
        .gte('published_at', filters.dateRange.start)
        .lte('published_at', filters.dateRange.end);
    }
    if (filters.status) {
      searchQuery = searchQuery.eq('status', filters.status);
    }

    // Apply sorting
    const sortField = this.getSortField(sort.field, 'news');
    searchQuery = searchQuery.order(sortField, { ascending: sort.order === 'asc' });

    // Apply pagination
    const offset = (pagination.page - 1) * pagination.limit;
    searchQuery = searchQuery.range(offset, offset + pagination.limit - 1);

    const { data, error } = await searchQuery;
    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: data?.length || 0,
        totalPages: Math.ceil((data?.length || 0) / pagination.limit),
      },
      analytics: {
        totalResults: data?.length || 0,
        searchTime: 0,
        filtersApplied: 0,
        popularSearches: [],
        searchSuggestions: [],
      },
      filters,
      sort,
    };
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return [];

    try {
      // Get suggestions from search history
      const historySuggestions = this.searchHistory
        .filter(term => term.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);

      // Get suggestions from popular searches
      const popularSuggestions = this.getPopularSearches()
        .filter(term => term.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3);

      return [...new Set([...historySuggestions, ...popularSuggestions])];
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(): Promise<{
    totalSearches: number;
    popularSearches: Array<{ term: string; count: number }>;
    searchTrends: Array<{ date: string; searches: number }>;
  }> {
    const popularSearches = Array.from(this.searchAnalytics.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));

    return {
      totalSearches: this.searchHistory.length,
      popularSearches,
      searchTrends: [], // TODO: Implement trend tracking
    };
  }

  /**
   * Clear search history
   */
  clearSearchHistory(): void {
    this.searchHistory = [];
    this.searchAnalytics.clear();
  }

  // Private helper methods
  private trackSearch(query: string): void {
    this.searchHistory.push(query);
    const count = this.searchAnalytics.get(query) || 0;
    this.searchAnalytics.set(query, count + 1);
  }

  private getPopularSearches(): string[] {
    return Array.from(this.searchAnalytics.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([term]) => term);
  }

  private getSearchSuggestions(query: string): string[] {
    return this.searchHistory
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }

  private getSortField(field: string, table: string): string {
    const fieldMap: Record<string, Record<string, string>> = {
      posts: {
        relevance: 'score',
        date: 'created_at',
        rating: 'score',
        popularity: 'view_count',
        title: 'title',
      },
      businesses: {
        relevance: 'rating',
        date: 'created_at',
        rating: 'rating',
        popularity: 'view_count',
        price: 'price_range_min',
        title: 'name',
      },
      events: {
        relevance: 'score',
        date: 'start_date',
        rating: 'score',
        popularity: 'attendee_count',
        title: 'title',
      },
      services: {
        relevance: 'rating',
        date: 'created_at',
        rating: 'rating',
        popularity: 'view_count',
        price: 'price',
        title: 'title',
      },
      news: {
        relevance: 'score',
        date: 'published_at',
        rating: 'score',
        popularity: 'view_count',
        title: 'title',
      },
    };

    return fieldMap[table]?.[field] || 'created_at';
  }

  private combineSearchResults(results: any[]): any[] {
    // Implement result ranking and combination logic
    return results.sort((a, b) => {
      // Simple relevance scoring
      const scoreA = (a.score || 0) + (a.rating || 0) + (a.view_count || 0);
      const scoreB = (b.score || 0) + (b.rating || 0) + (b.view_count || 0);
      return scoreB - scoreA;
    });
  }
}

export const advancedSearchService = AdvancedSearchService.getInstance();
