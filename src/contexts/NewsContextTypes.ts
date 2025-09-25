/**
 * News Context Types
 * Type definitions for news context
 */

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  source: string;
}

export interface NewsContextType {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}