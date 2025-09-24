
import { supabase } from '@/integrations/supabase/client';
import { 
  NewsSource, 
  NewsArticle, 
  NewsApiResponse, 
  NewsApiArticle,
  NewsAggregationConfig,
  NewsAggregationResult,
  NewsProcessingResult
} from '@/types/news';
import { NewsApiManager } from './newsApis/newsApiManager';
import { NewsProcessor } from './newsProcessor';
import { NewsLocationExtractor } from './newsLocationExtractor';
import { NewsCategorizer } from './newsCategorizer';

export class NewsAggregationService {
  private apiManager: NewsApiManager;
  private processor: NewsProcessor;
  private locationExtractor: NewsLocationExtractor;
  private categorizer: NewsCategorizer;

  constructor() {
    this.apiManager = new NewsApiManager();
    this.processor = new NewsProcessor();
    this.locationExtractor = new NewsLocationExtractor();
    this.categorizer = new NewsCategorizer();
  }

  /**
   * Fetch news from all active sources
   */
  async fetchNewsFromAllSources(): Promise<NewsAggregationResult> {
    const startTime = Date.now();
    let totalArticlesFetched = 0;
    let totalArticlesProcessed = 0;
    let totalArticlesStored = 0;
    const duplicatesRemoved = 0;
    let processingErrors = 0;
    const sourcesProcessed: string[] = [];

    try {
      // Get all active news sources
      const { data: sources, error: sourcesError } = await supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true);

      if (sourcesError) throw sourcesError;

      for (const source of sources || []) {
        try {
          console.log(`Fetching news from source: ${source.name}`);
          
          // Check rate limiting
          if (this.isRateLimited(source)) {
            console.log(`Rate limited for source: ${source.name}`);
            continue;
          }

          // Fetch articles from this source
          const articles = await this.fetchNewsFromSource(source);
          totalArticlesFetched += articles.length;
          sourcesProcessed.push(source.name);

          // Process and store articles
          const processedArticles = await this.processArticles(articles, source);
          totalArticlesProcessed += processedArticles.length;

          // Store articles in database
          const storedCount = await this.storeArticles(processedArticles);
          totalArticlesStored += storedCount;

          // Update source last fetch time
          await this.updateSourceFetchTime(source.id);

        } catch (error) {
          console.error(`Error processing source ${source.name}:`, error);
          processingErrors++;
        }
      }

      return {
        total_articles_fetched: totalArticlesFetched,
        total_articles_processed: totalArticlesProcessed,
        total_articles_stored: totalArticlesStored,
        duplicates_removed: duplicatesRemoved,
        processing_errors: processingErrors,
        sources_processed: sourcesProcessed,
        processing_time_ms: Date.now() - startTime
      };

    } catch (error) {
      console.error('Error in news aggregation:', error);
      throw error;
    }
  }

  /**
   * Fetch news from a specific source
   */
  private async fetchNewsFromSource(source: NewsSource): Promise<NewsApiArticle[]> {
    try {
      switch (source.source_type) {
        case 'external':
          return await this.apiManager.fetchFromExternalSource(source);
        case 'local':
          return await this.apiManager.fetchFromLocalSource(source);
        case 'rss':
          return await this.apiManager.fetchFromRssSource(source);
        default:
          throw new Error(`Unsupported source type: ${source.source_type}`);
      }
    } catch (error) {
      console.error(`Error fetching from source ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Process articles from a source
   */
  private async processArticles(
    articles: NewsApiArticle[], 
    source: NewsSource
  ): Promise<NewsArticle[]> {
    const processedArticles: NewsArticle[] = [];

    for (const article of articles) {
      try {
        // Check for duplicates
        const isDuplicate = await this.isDuplicateArticle(article, source.id);
        if (isDuplicate) continue;

        // Process the article
        const processedArticle = await this.processSingleArticle(article, source);
        if (processedArticle) {
          processedArticles.push(processedArticle);
        }
      } catch (error) {
        console.error('Error processing article:', error);
      }
    }

    return processedArticles;
  }

  /**
   * Process a single article
   */
  private async processSingleArticle(
    article: NewsApiArticle, 
    source: NewsSource
  ): Promise<NewsArticle | null> {
    try {
      // Basic processing
      const processedArticle = this.processor.processArticle(article, source);

      // Extract location information
      const locationInfo = await this.locationExtractor.extractLocation(processedArticle);
      if (locationInfo) {
        processedArticle.location_lat = locationInfo.lat;
        processedArticle.location_lng = locationInfo.lng;
        processedArticle.location_name = locationInfo.name;
      }

      // Categorize the article
      const categoryInfo = await this.categorizer.categorizeArticle(processedArticle);
      if (categoryInfo) {
        processedArticle.category = categoryInfo.category;
        processedArticle.relevance_score = categoryInfo.confidence;
      }

      // Calculate relevance score
      processedArticle.relevance_score = this.calculateRelevanceScore(
        processedArticle, 
        source, 
        categoryInfo?.confidence || 0.5
      );

      return processedArticle;
    } catch (error) {
      console.error('Error processing single article:', error);
      return null;
    }
  }

  /**
   * Store articles in the database
   */
  private async storeArticles(articles: NewsArticle[]): Promise<number> {
    if (articles.length === 0) return 0;

    try {
      const { data, error } = await supabase
        .from('news_articles')
        .insert(articles)
        .select('id');

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error storing articles:', error);
      return 0;
    }
  }

  /**
   * Check if an article is a duplicate
   */
  private async isDuplicateArticle(article: NewsApiArticle, sourceId: string): Promise<boolean> {
    try {
      // Check by URL first
      if (article.url) {
        const { data: existingByUrl } = await supabase
          .from('news_articles')
          .select('id')
          .eq('url', article.url)
          .single();

        if (existingByUrl) return true;
      }

      // Check by title and source (fuzzy matching)
      const { data: existingByTitle } = await supabase
        .from('news_articles')
        .select('id')
        .eq('source_id', sourceId)
        .eq('title', article.title)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .single();

      return !!existingByTitle;
    } catch (error) {
      // If error, assume not duplicate
      return false;
    }
  }

  /**
   * Calculate relevance score for an article
   */
  private calculateRelevanceScore(
    article: NewsArticle, 
    source: NewsSource, 
    categoryConfidence: number
  ): number {
    let score = 0.5; // Base score

    // Category confidence
    score += categoryConfidence * 0.3;

    // Source reliability (based on source type and history)
    const sourceScore = source.source_type === 'local' ? 0.2 : 0.1;
    score += sourceScore;

    // Content quality indicators
    if (article.description && article.description.length > 100) score += 0.1;
    if (article.image_url) score += 0.05;
    if (article.author) score += 0.05;

    // Location relevance (if user location is available)
    if (article.location_lat && article.location_lng) {
      score += 0.1; // Bonus for location-tagged content
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Check if a source is rate limited
   */
  private async isRateLimited(source: NewsSource): Promise<boolean> {
    if (!source.last_fetch_at) return false;

    const lastFetch = new Date(source.last_fetch_at);
    const now = new Date();
    const hoursSinceLastFetch = (now.getTime() - lastFetch.getTime()) / (1000 * 60 * 60);

    // Check if enough time has passed since last fetch
    const minIntervalHours = 24 / source.rate_limit_per_hour; // Convert rate limit to hours
    return hoursSinceLastFetch < minIntervalHours;
  }

  /**
   * Update source last fetch time
   */
  private async updateSourceFetchTime(sourceId: string): Promise<void> {
    try {
      await supabase
        .from('news_sources')
        .update({ last_fetch_at: new Date().toISOString() })
        .eq('id', sourceId);
    } catch (error) {
      console.error('Error updating source fetch time:', error);
    }
  }

  /**
   * Get news feed for a user
   */
  async getUserNewsFeed(userId: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase.rpc('get_personalized_news_feed', {
        user_uuid: userId,
        limit_count: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user news feed:', error);
      return [];
    }
  }

  /**
   * Get nearby news articles
   */
  async getNearbyNewsArticles(
    lat: number, 
    lng: number, 
    radiusKm: number = 50,
    category?: string,
    limit: number = 20
  ): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_news_articles', {
        user_lat: lat,
        user_lng: lng,
        radius_km: radiusKm,
        category_filter: category || null,
        limit_count: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting nearby news articles:', error);
      return [];
    }
  }

  /**
   * Search news articles
   */
  async searchNewsArticles(
    query: string,
    filters: {
      category?: string;
      source?: string;
      dateFrom?: string;
      dateTo?: string;
      location?: { lat: number; lng: number; radius: number };
    } = {},
    limit: number = 20
  ): Promise<NewsArticle[]> {
    try {
      let queryBuilder = supabase
        .from('news_articles')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (filters.category) {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }

      if (filters.source) {
        queryBuilder = queryBuilder.eq('source_id', filters.source);
      }

      if (filters.dateFrom) {
        queryBuilder = queryBuilder.gte('published_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        queryBuilder = queryBuilder.lte('published_at', filters.dateTo);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      // Apply location filter if specified
      if (filters.location) {
        return data?.filter(article => {
          if (!article.location_lat || !article.location_lng) return false;
          
          const distance = this.calculateDistance(
            filters.location!.lat,
            filters.location!.lng,
            article.location_lat,
            article.location_lng
          );
          
          return distance <= filters.location!.radius;
        }) || [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching news articles:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get news statistics
   */
  async getNewsStatistics(): Promise<{
    total_articles: number;
    total_sources: number;
    total_categories: number;
    recent_articles: number;
  }> {
    try {
      const [
        { count: totalArticles },
        { count: totalSources },
        { count: totalCategories },
        { count: recentArticles }
      ] = await Promise.all([
        supabase.from('news_articles').select('*', { count: 'exact', head: true }),
        supabase.from('news_sources').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('news_categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('news_articles').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        total_articles: totalArticles || 0,
        total_sources: totalSources || 0,
        total_categories: totalCategories || 0,
        recent_articles: recentArticles || 0
      };
    } catch (error) {
      console.error('Error getting news statistics:', error);
      return {
        total_articles: 0,
        total_sources: 0,
        total_categories: 0,
        recent_articles: 0
      };
    }
  }
}
