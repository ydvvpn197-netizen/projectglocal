/**
 * Real-time News Service
 * Mock implementation for real-time news functionality
 */

import type { NewsArticle } from '@/types/news';

export const realTimeNewsService = {
  startRealTimeUpdates: (callback: (articles: NewsArticle[]) => void) => {
    // Mock implementation
    console.log('Real-time updates started');
  },

  stopRealTimeUpdates: () => {
    // Mock implementation
    console.log('Real-time updates stopped');
  },

  getLatestArticles: async (limit: number = 50, page: number = 1): Promise<NewsArticle[]> => {
    // Mock implementation
    return [];
  },

  getTrendingArticles: async (limit: number = 50): Promise<NewsArticle[]> => {
    // Mock implementation
    return [];
  },

  getArticlesByLocation: async (city: string, radiusKm: number = 50): Promise<NewsArticle[]> => {
    // Mock implementation
    return [];
  }
};
