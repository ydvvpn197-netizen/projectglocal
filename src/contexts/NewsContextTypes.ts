import type { NewsArticle, NewsTab, LocationData } from '../types/news';

export interface NewsContextType {
  // News data
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  
  // Location
  location: LocationData | null;
  
  // Active tab
  activeTab: NewsTab;
  setActiveTab: (tab: NewsTab) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Actions
  refresh: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

export interface NewsPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
