import { createContext } from 'react';
import type { NewsArticle } from '@/hooks/useNewsData';

export interface NewsContextType {
  // Current view state
  currentView: 'feed' | 'article';
  currentArticle: NewsArticle | null;
  
  // Navigation history
  articleHistory: NewsArticle[];
  currentArticleIndex: number;
  
  // Navigation functions
  showArticle: (article: NewsArticle) => void;
  showFeed: () => void;
  goToNextArticle: () => void;
  goToPreviousArticle: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  
  // Article management
  addToHistory: (article: NewsArticle) => void;
  clearHistory: () => void;
}

export const NewsContext = createContext<NewsContextType | undefined>(undefined);
