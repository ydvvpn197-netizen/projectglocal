// News context for TheGlocal project
import React, { createContext, useContext, ReactNode } from 'react';
import type { NewsArticle, NewsTab, LocationData } from '@/types/news';

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

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const useNews = (): NewsContextType => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

export { NewsContext };
