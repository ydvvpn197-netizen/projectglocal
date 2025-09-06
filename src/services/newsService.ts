// News service for TheGlocal project
import { supabase } from '@/integrations/supabase/client';
import { geocodingService } from './geocodingService';
import { offlineService } from './offlineService';
import type { 
  NewsArticle, 
  NewsLike, 
  NewsComment, 
  NewsPoll, 
  NewsPollVote, 
  NewsShare, 
  NewsEvent,
  NewsApiResponse,
  TrendingNewsResponse,
  ForYouNewsResponse,
  LocationData,
  NewsFilters,
  NewsTab,
  GNewsArticle,
  GNewsResponse,
  OpenAISummaryRequest,
  OpenAISummaryResponse,
  TrendingScore,
  UserPreferences,
  NewsError
} from '@/types/news';

// Utility function to generate SHA-256 hash
const generateArticleId = async (url: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(url);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// News API Service
export class NewsService {
  private static instance: NewsService;
  private cache = new Map<string, NewsArticle[]>();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  // Get user's current location with reverse geocoding
  async getCurrentLocation(): Promise<LocationData> {
    return await geocodingService.getCurrentLocationWithGeocoding();
  }

  // Fetch news from GNews API
  async fetchNewsFromAPI(location: LocationData, page = 1, limit = 20): Promise<GNewsResponse> {
    const apiKey = import.meta.env.VITE_GNEWS_API_KEY;
    if (!apiKey) {
      throw new Error('GNews API key not configured');
    }

    const query = `${location.city} ${location.country}`;
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=${location.country.toLowerCase()}&max=${limit}&page=${page}&apikey=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`GNews API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        articles: data.articles || [],
        totalArticles: data.totalArticles || 0
      };
    } catch (error) {
      console.error('Error fetching news from GNews API:', error);
      throw error;
    }
  }

  // Generate AI summary using OpenAI
  async generateAISummary(content: string): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      return content.substring(0, 200) + '...'; // Fallback to truncated content
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates concise, engaging summaries of news articles in 2-3 sentences.'
            },
            {
              role: 'user',
              content: `Please summarize this news article in 2-3 sentences: ${content}`
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || content.substring(0, 200) + '...';
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return content.substring(0, 200) + '...';
    }
  }

  // Cache news articles in Supabase
  async cacheNewsArticles(articles: GNewsArticle[], location: LocationData): Promise<NewsArticle[]> {
    const cachedArticles: NewsArticle[] = [];

    for (const article of articles) {
      try {
        const articleId = await generateArticleId(article.url);
        
        // Check if article already exists in cache
        const { data: existing } = await supabase
          .from('news_cache')
          .select('*')
          .eq('article_id', articleId)
          .single();

        if (existing && new Date(existing.expires_at) > new Date()) {
          cachedArticles.push(existing);
          continue;
        }

        // Generate AI summary
        const aiSummary = await this.generateAISummary(article.content);

        // Insert or update article in cache
        const newsArticle: Omit<NewsArticle, 'id' | 'created_at' | 'updated_at'> = {
          article_id: articleId,
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          image_url: article.image,
          source_name: article.source.name,
          source_url: article.source.url,
          published_at: article.publishedAt,
          city: location.city,
          country: location.country,
          language: 'en',
          ai_summary: aiSummary,
          expires_at: new Date(Date.now() + this.CACHE_DURATION).toISOString()
        };

        const { data, error } = await supabase
          .from('news_cache')
          .upsert(newsArticle, { onConflict: 'article_id' })
          .select()
          .single();

        if (error) {
          console.error('Error caching article:', error);
          continue;
        }

        cachedArticles.push(data);
      } catch (error) {
        console.error('Error processing article:', error);
        continue;
      }
    }

    return cachedArticles;
  }

  // Get news articles
  async getNews(tab: NewsTab, location: LocationData, page = 1, limit = 20): Promise<NewsApiResponse> {
    const cacheKey = `news_${tab}_${location.city}_${page}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
    }

    try {
      let articles: NewsArticle[] = [];

      switch (tab) {
        case 'latest':
          articles = await this.getLatestNews(location, page, limit);
          break;
        case 'trending':
          articles = await this.getTrendingNews(location, page, limit);
          break;
        case 'for-you':
          articles = await this.getForYouNews(location, page, limit);
          break;
      }

      const response: NewsApiResponse = {
        articles,
        total: articles.length,
        page,
        has_more: articles.length === limit
      };

      // Cache the response
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      return response;
    } catch (error) {
      console.error('Error fetching news:', error);
      
      // Return empty response instead of throwing to prevent React errors
      return {
        articles: [],
        total: 0,
        page,
        has_more: false
      };
    }
  }

  // Get latest news
  private async getLatestNews(location: LocationData, page: number, limit: number): Promise<NewsArticle[]> {
    // First, try to get from cache
    const { data: cachedArticles } = await supabase
      .from('news_cache')
      .select('*')
      .eq('city', location.city)
      .eq('country', location.country)
      .gte('expires_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (cachedArticles && cachedArticles.length > 0) {
      // Cache articles offline
      await offlineService.cacheArticles(cachedArticles);
      return cachedArticles;
    }

    // If no cached articles, fetch from API
    const gnewsResponse = await this.fetchNewsFromAPI(location, page, limit);
    const processedArticles = await this.cacheNewsArticles(gnewsResponse.articles, location);
    
    // Cache articles offline
    await offlineService.cacheArticles(processedArticles);
    
    return processedArticles;
  }

  // Get trending news
  private async getTrendingNews(location: LocationData, page: number, limit: number): Promise<NewsArticle[]> {
    // This would typically call the trending endpoint
    // For now, we'll use a simple implementation
    const { data: articles } = await supabase
      .from('news_cache')
      .select(`
        *,
        news_likes(count),
        news_comments(count),
        news_shares(count),
        news_polls(count)
      `)
      .eq('city', location.city)
      .eq('country', location.country)
      .gte('expires_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    return articles || [];
  }

  // Get personalized news
  private async getForYouNews(location: LocationData, page: number, limit: number): Promise<NewsArticle[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return this.getLatestNews(location, page, limit);
    }

    // Get user preferences from news events
    const { data: preferences } = await supabase
      .from('news_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()) // Last 14 days
      .order('created_at', { ascending: false });

    // Simple personalization logic
    const { data: articles } = await supabase
      .from('news_cache')
      .select('*')
      .eq('city', location.city)
      .eq('country', location.country)
      .gte('expires_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    return articles || [];
  }

  // Like an article
  async likeArticle(articleId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('news_likes')
      .insert({
        article_id: articleId,
        user_id: user.id
      });

    if (error) {
      throw error;
    }

    // Track event
    await this.trackEvent(articleId, 'like');
  }

  // Unlike an article
  async unlikeArticle(articleId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('news_likes')
      .delete()
      .eq('article_id', articleId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }
  }

  // Share an article
  async shareArticle(articleId: string, platform?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('news_shares')
      .insert({
        article_id: articleId,
        user_id: user.id,
        platform
      });

    if (error) {
      throw error;
    }

    // Track event
    await this.trackEvent(articleId, 'share', { platform });
  }

  // Track user event
  async trackEvent(articleId: string, eventType: NewsEvent['event_type'], eventData?: Record<string, unknown>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return; // Don't track events for anonymous users
    }

    await supabase
      .from('news_events')
      .insert({
        article_id: articleId,
        user_id: user.id,
        event_type: eventType,
        event_data: eventData
      });
  }

  // Get article interactions
  async getArticleInteractions(articleId: string): Promise<{
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    pollsCount: number;
    isLiked: boolean;
  }> {
    const { data: { user } } = await supabase.auth.getUser();

    const [likesResult, commentsResult, sharesResult, pollsResult, userLikeResult] = await Promise.all([
      supabase.from('news_likes').select('count', { count: 'exact' }).eq('article_id', articleId),
      supabase.from('news_comments').select('count', { count: 'exact' }).eq('article_id', articleId).eq('is_deleted', false),
      supabase.from('news_shares').select('count', { count: 'exact' }).eq('article_id', articleId),
      supabase.from('news_polls').select('count', { count: 'exact' }).eq('article_id', articleId),
      user ? supabase.from('news_likes').select('id').eq('article_id', articleId).eq('user_id', user.id).single() : Promise.resolve({ data: null })
    ]);

    return {
      likesCount: likesResult.count || 0,
      commentsCount: commentsResult.count || 0,
      sharesCount: sharesResult.count || 0,
      pollsCount: pollsResult.count || 0,
      isLiked: !!userLikeResult.data
    };
  }

  // Get article comments
  async getArticleComments(articleId: string): Promise<NewsComment[]> {
    const { data, error } = await supabase
      .from('news_comments')
      .select(`
        *,
        profiles!news_comments_user_id_fkey(display_name, avatar_url)
      `)
      .eq('article_id', articleId)
      .eq('is_deleted', false)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  // Add comment
  async addComment(articleId: string, content: string, parentId?: string): Promise<NewsComment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('news_comments')
      .insert({
        article_id: articleId,
        user_id: user.id,
        content,
        parent_id: parentId
      })
      .select(`
        *,
        profiles!news_comments_user_id_fkey(display_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Track event
    await this.trackEvent(articleId, 'comment', { commentId: data.id });

    return data;
  }

  // Clear user's news history
  async clearNewsHistory(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('news_events')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const newsService = NewsService.getInstance();
