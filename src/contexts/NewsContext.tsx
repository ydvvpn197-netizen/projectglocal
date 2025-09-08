import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { NewsArticle } from '@/hooks/useNewsData';

interface NewsContextType {
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

const NewsContext = createContext<NewsContextType | undefined>(undefined);

interface NewsProviderProps {
  children: ReactNode;
}

export const NewsProvider: React.FC<NewsProviderProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'feed' | 'article'>('feed');
  const [currentArticle, setCurrentArticle] = useState<NewsArticle | null>(null);
  const [articleHistory, setArticleHistory] = useState<NewsArticle[]>([]);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(-1);

  const showArticle = useCallback((article: NewsArticle) => {
    setCurrentArticle(article);
    setCurrentView('article');
    
    // Add to history if not already present
    setArticleHistory(prev => {
      const existingIndex = prev.findIndex(a => a.id === article.id);
      if (existingIndex === -1) {
        const newHistory = [...prev, article];
        setCurrentArticleIndex(newHistory.length - 1);
        return newHistory;
      } else {
        setCurrentArticleIndex(existingIndex);
        return prev;
      }
    });
  }, []);

  const showFeed = useCallback(() => {
    setCurrentView('feed');
    // Keep current article and history for potential return
  }, []);

  const addToHistory = useCallback((article: NewsArticle) => {
    setArticleHistory(prev => {
      const existingIndex = prev.findIndex(a => a.id === article.id);
      if (existingIndex === -1) {
        return [...prev, article];
      }
      return prev;
    });
  }, []);

  const goToNextArticle = useCallback(() => {
    if (currentArticleIndex < articleHistory.length - 1) {
      const nextIndex = currentArticleIndex + 1;
      const nextArticle = articleHistory[nextIndex];
      setCurrentArticle(nextArticle);
      setCurrentArticleIndex(nextIndex);
    }
  }, [currentArticleIndex, articleHistory]);

  const goToPreviousArticle = useCallback(() => {
    if (currentArticleIndex > 0) {
      const prevIndex = currentArticleIndex - 1;
      const prevArticle = articleHistory[prevIndex];
      setCurrentArticle(prevArticle);
      setCurrentArticleIndex(prevIndex);
    }
  }, [currentArticleIndex, articleHistory]);

  const clearHistory = useCallback(() => {
    setArticleHistory([]);
    setCurrentArticleIndex(-1);
    setCurrentArticle(null);
    setCurrentView('feed');
  }, []);

  const canGoNext = currentArticleIndex < articleHistory.length - 1;
  const canGoPrevious = currentArticleIndex > 0;

  const value: NewsContextType = {
    currentView,
    currentArticle,
    articleHistory,
    currentArticleIndex,
    showArticle,
    showFeed,
    goToNextArticle,
    goToPreviousArticle,
    canGoNext,
    canGoPrevious,
    addToHistory,
    clearHistory,
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = (): NewsContextType => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
