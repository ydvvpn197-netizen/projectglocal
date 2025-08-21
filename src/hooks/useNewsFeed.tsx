import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useLocation } from './useLocation';
import { NewsArticle, NewsFeedFilters, NewsSearchParams } from '@/types/news';
import { supabase } from '@/integrations/supabase/client';

interface NewsPreferences {
  categories: string[];
  location_enabled: boolean;
  radius: number;
}

export const useNewsFeed = () => {
  const { user } = useAuth();
  const { currentLocation } = useLocation();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [preferences, setPreferences] = useState<NewsPreferences>({
    categories: ['general'],
    location_enabled: true,
    radius: 50
  });
  const [filters, setFilters] = useState<NewsFeedFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch news from Supabase Edge Function
      let locationParam = 'Your Area';
      if (currentLocation) {
        locationParam = `${currentLocation.latitude},${currentLocation.longitude}`;
      }

      const { data, error: fetchError } = await supabase.functions.invoke('fetch-local-news', {
        body: { location: locationParam }
      });

      if (fetchError) throw fetchError;

      // Transform the news data to match NewsArticle interface
      const transformedArticles: NewsArticle[] = (data?.news || []).map((item: any, index: number) => ({
        id: `news-${index}`,
        source_id: 'local-news',
        title: item.title,
        description: item.description,
        url: item.url,
        image_url: item.imageUrl,
        published_at: item.publishedAt,
        category: item.category,
        tags: [item.category],
        location_name: locationParam,
        relevance_score: 0.8,
        engagement_score: 0,
        is_verified: true,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      setArticles(transformedArticles);
      setHasMore(transformedArticles.length > 0);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const searchArticles = async (searchParams: NewsSearchParams) => {
    try {
      setLoading(true);
      setError(null);

      // For now, filter existing articles based on search params
      // In a real implementation, this would call a search API
      const filteredArticles = articles.filter(article => {
        if (searchParams.query) {
          const query = searchParams.query.toLowerCase();
          if (!article.title.toLowerCase().includes(query) && 
              !article.description?.toLowerCase().includes(query)) {
            return false;
          }
        }
        
        if (searchParams.category && article.category !== searchParams.category) {
          return false;
        }

        return true;
      });

      setArticles(filteredArticles);
    } catch (err) {
      console.error('Error searching articles:', err);
      setError(err instanceof Error ? err.message : 'Failed to search articles');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NewsPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    
    // Refetch news with new preferences
    await fetchArticles();
  };

  const recordInteraction = async (articleId: string, interactionType: 'like' | 'share' | 'bookmark' | 'view') => {
    try {
      // Record interaction in database
      await supabase.from('news_article_interactions').insert({
        user_id: user?.id,
        article_id: articleId,
        interaction_type: interactionType
      });
    } catch (err) {
      console.error('Error recording interaction:', err);
    }
  };

  const toggleBookmark = async (articleId: string) => {
    try {
      // Toggle bookmark in database
      const { data: existingBookmark } = await supabase
        .from('news_article_bookmarks')
        .select('id')
        .eq('user_id', user?.id)
        .eq('article_id', articleId)
        .maybeSingle();

      if (existingBookmark) {
        await supabase
          .from('news_article_bookmarks')
          .delete()
          .eq('id', existingBookmark.id);
      } else {
        await supabase
          .from('news_article_bookmarks')
          .insert({
            user_id: user?.id,
            article_id: articleId
          });
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const refresh = async () => {
    await fetchArticles();
  };

  const loadMore = async () => {
    // For now, just refresh the feed
    // In a real implementation, this would load more articles
    await fetchArticles();
  };

  useEffect(() => {
    if (user) {
      fetchArticles();
    }
  }, [user, currentLocation]);

  return {
    articles,
    loading,
    error,
    preferences,
    filters,
    hasMore,
    fetchArticles,
    searchArticles,
    updatePreferences,
    setFilters,
    recordInteraction,
    toggleBookmark,
    refresh,
    loadMore
  };
};