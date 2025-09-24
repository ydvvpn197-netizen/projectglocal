/**
 * News Service
 * Mock implementation for news functionality
 */

import type { NewsArticle } from '@/types/news';

export const newsService = {
  async getArticles(limit: number = 50, page: number = 1): Promise<NewsArticle[]> {
    // Mock implementation
    return [];
  },

  async getArticleById(id: string): Promise<NewsArticle | null> {
    // Mock implementation
    return null;
  },

  async searchArticles(query: string): Promise<NewsArticle[]> {
    // Mock implementation
    return [];
  }
};