import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  NewsArticle, 
  NewsPreferences, 
  NewsFeedFilters,
  NewsSearchParams 
} from '@/types/news';
import { NewsAggregationService } from '@/services/newsAggregationService';

export const useNewsFeed = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NewsPreferences | null>(null);
  const [filters, setFilters] = useState<NewsFeedFilters>({});
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const newsService = new NewsAggregationService();

  // Get user preferences
  const fetchPreferences = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_news_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences
        const defaultPreferences: NewsPreferences = {
          id: '',
          user_id: user.id,
          preferred_categories: ['general', 'local'],
          excluded_categories: [],
          preferred_sources: [],
          excluded_sources: [],
          location_radius_km: 50,
          max_articles_per_day: 20,
          notification_enabled: true,
          digest_frequency: 'daily',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newPrefs, error: createError } = await supabase
          .from('user_news_preferences')
          .insert(defaultPreferences)
          .select()
          .single();

        if (createError) {
          console.error('Error creating preferences:', createError);
          return;
        }

        setPreferences(newPrefs);
      }
    } catch (error) {
      console.error('Error in fetchPreferences:', error);
    }
  }, []);

  // Get user location
  const fetchUserLocation = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('location_lat, location_lng, latitude, longitude')
        .eq('id', user.id)
        .single();

      if (profile) {
        const lat = profile.location_lat || profile.latitude;
        const lng = profile.location_lng || profile.longitude;
        
        if (lat && lng) {
          setUserLocation({ lat, lng });
        }
      }
    } catch (error) {
      console.error('Error fetching user location:', error);
    }
  }, []);

  // Fetch news articles
  const fetchArticles = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const currentPage = reset ? 0 : page;
      const limit = 20;
      const offset = currentPage * limit;

      let articlesData: NewsArticle[] = [];

      // If user has location and wants local news, get nearby articles
      if (userLocation && (preferences?.preferred_categories.includes('local') || filters.categories?.includes('local'))) {
        articlesData = await newsService.getNearbyNewsArticles(
          userLocation.lat,
          userLocation.lng,
          preferences?.location_radius_km || 50,
          filters.categories?.[0],
          limit
        );
      } else {
        // Get personalized feed
        articlesData = await newsService.getUserNewsFeed(user.id, limit);
      }

      // Apply filters
      if (filters.categories && filters.categories.length > 0) {
        articlesData = articlesData.filter(article => 
          article.category && filters.categories!.includes(article.category)
        );
      }

      if (filters.sources && filters.sources.length > 0) {
        articlesData = articlesData.filter(article => 
          filters.sources!.includes(article.source_id)
        );
      }

      if (filters.date_range) {
        const now = new Date();
        let cutoffDate: Date;
        
        switch (filters.date_range) {
          case 'today':
            cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'week':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        articlesData = articlesData.filter(article => 
          article.published_at && new Date(article.published_at) >= cutoffDate
        );
      }

      if (reset) {
        setArticles(articlesData);
        setPage(1);
      } else {
        setArticles(prev => [...prev, ...articlesData]);
        setPage(prev => prev + 1);
      }

      setHasMore(articlesData.length === limit);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, [page, preferences, filters, userLocation, newsService]);

  // Search articles
  const searchArticles = useCallback(async (searchParams: NewsSearchParams) => {
    try {
      setLoading(true);
      setError(null);

      const articlesData = await newsService.searchNewsArticles(
        searchParams.query,
        {
          category: searchParams.category,
          source: searchParams.source,
          dateFrom: searchParams.date_from,
          dateTo: searchParams.date_to,
          location: searchParams.location
        }
      );

      setArticles(articlesData);
      setPage(1);
      setHasMore(false); // Search results don't support pagination for now
    } catch (error) {
      console.error('Error searching articles:', error);
      setError('Failed to search articles');
    } finally {
      setLoading(false);
    }
  }, [newsService]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NewsPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !preferences) return;

      const updatedPrefs = { ...preferences, ...newPreferences, updated_at: new Date().toISOString() };

      const { data, error } = await supabase
        .from('user_news_preferences')
        .update(updatedPrefs)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError('Failed to update preferences');
    }
  }, [preferences]);

  // Record article interaction
  const recordInteraction = useCallback(async (
    articleId: string, 
    interactionType: 'view' | 'like' | 'share' | 'bookmark' | 'comment',
    interactionData?: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('news_article_interactions')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          interaction_type: interactionType,
          interaction_data: interactionData
        });

      if (error) throw error;

      // Update article engagement score
      await supabase.rpc('update_article_engagement_score', { article_uuid: articleId });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  }, []);

  // Bookmark/unbookmark article
  const toggleBookmark = useCallback(async (articleId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already bookmarked
      const { data: existing } = await supabase
        .from('news_article_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .single();

      if (existing) {
        // Remove bookmark
        await supabase
          .from('news_article_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);
      } else {
        // Add bookmark
        await supabase
          .from('news_article_bookmarks')
          .insert({
            user_id: user.id,
            article_id: articleId
          });
      }

      // Record interaction
      await recordInteraction(articleId, existing ? 'bookmark' : 'bookmark', { action: existing ? 'removed' : 'added' });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  }, [recordInteraction]);

  // Get bookmarked articles
  const getBookmarkedArticles = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('news_article_bookmarks')
        .select(`
          article_id,
          news_articles (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(item => item.news_articles).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching bookmarked articles:', error);
      return [];
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchPreferences();
    fetchUserLocation();
  }, [fetchPreferences, fetchUserLocation]);

  // Fetch articles when dependencies change
  useEffect(() => {
    if (preferences) {
      fetchArticles(true);
    }
  }, [preferences, filters, userLocation]);

  return {
    articles,
    loading,
    error,
    preferences,
    filters,
    hasMore,
    userLocation,
    fetchArticles,
    searchArticles,
    updatePreferences,
    setFilters,
    recordInteraction,
    toggleBookmark,
    getBookmarkedArticles,
    refresh: () => fetchArticles(true),
    loadMore: () => fetchArticles(false)
  };
};
