import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useLocation } from './useLocation';

interface NewsPreferences {
  categories: string[];
  location_enabled: boolean;
  radius: number;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  published_at: string;
  category: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export const useNewsFeed = () => {
  const { user } = useAuth();
  const { currentLocation } = useLocation();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [preferences, setPreferences] = useState<NewsPreferences>({
    categories: ['general'],
    location_enabled: true,
    radius: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Placeholder implementation - replace with actual news fetching
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'Local News Update',
          content: 'Latest updates from your area',
          source: 'Local News',
          published_at: new Date().toISOString(),
          category: 'general',
          location: {
            city: 'Unknown City',
            state: 'Unknown State', 
            country: 'Unknown Country'
          }
        }
      ];

      setNewsItems(mockNews);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NewsPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    
    // Refetch news with new preferences
    await fetchNews();
  };

  useEffect(() => {
    if (user) {
      fetchNews();
    }
  }, [user, currentLocation]);

  return {
    newsItems,
    preferences,
    loading,
    error,
    fetchNews,
    updatePreferences
  };
};