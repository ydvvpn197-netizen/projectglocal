// News context for TheGlocal project
import React, { createContext, useContext, ReactNode } from 'react';
import type { NewsArticle, NewsTab, LocationData } from '@/types/news';
import { NewsContextType } from './NewsContextTypes';

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const useNews = (): NewsContextType => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

// Export types separately to avoid Fast Refresh issues
export type { NewsContextType };
export { NewsContext };
