import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image_url?: string;
  source: string;
  category: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  published_at: string;
  created_at: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}

export const useNewsFeed = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  const fetchNews = useCallback(async (category?: string, location?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Mock news data since the actual tables may not exist
      const mockArticles: NewsArticle[] = [
        {
          id: '1',
          title: 'Local Community Event Planning',
          description: 'Community members organize upcoming events for the neighborhood.',
          content: 'Full article content here...',
          url: 'https://example.com/article1',
          image_url: undefined,
          source: 'Local News',
          category: category || 'community',
          location: {
            city: location || 'Local',
            state: 'State',
            country: 'Country'
          },
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          engagement: {
            likes: 25,
            comments: 8,
            shares: 3,
            views: 150
          }
        }
      ];

      setArticles(mockArticles);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to fetch news articles');
    } finally {
      setLoading(false);
    }
  }, []);

  const likeArticle = useCallback(async (articleId: string) => {
    try {
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, engagement: { ...article.engagement, likes: article.engagement.likes + 1 } }
          : article
      ));
    } catch (error) {
      console.error('Error liking article:', error);
    }
  }, []);

  const shareArticle = useCallback(async (articleId: string) => {
    try {
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, engagement: { ...article.engagement, shares: article.engagement.shares + 1 } }
          : article
      ));
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  }, []);

  const trackInteraction = useCallback(async (articleId: string, type: 'like' | 'comment' | 'share' | 'bookmark') => {
    if (!user) return;

    try {
      console.log(`Tracking ${type} interaction for article ${articleId}`);
      
      if (type === 'bookmark') {
        console.log(`Bookmarking article ${articleId}`);
      }
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [user]);

  return {
    articles,
    loading,
    error,
    fetchNews,
    likeArticle,
    shareArticle,
    trackInteraction
  };
};