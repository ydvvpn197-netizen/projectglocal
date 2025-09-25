/**
 * News Types
 * Type definitions for news functionality
 */

export interface NewsArticle {
  id: string;
  title: string;
  description?: string;
  content?: string;
  source?: string;
  author?: string;
  published_at: string;
  category: string;
  location?: LocationData;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  image_url?: string;
  url?: string;
}

export interface LocationData {
  city: string;
  state?: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type NewsTab = 'latest' | 'trending' | 'local' | 'category';

export interface NewsApiResponse {
  articles: NewsArticle[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface NewsComment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes: number;
  replies?: NewsComment[];
}

export interface NewsPoll {
  id: string;
  article_id: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  expires_at: string;
}

export interface NewsError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}