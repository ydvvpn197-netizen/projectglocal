/**
 * Consolidated News Service
 * 
 * This service consolidates all news-related functionality into a single, comprehensive service.
 * It replaces multiple duplicate services: NewsAggregationService, EnhancedNewsAggregationService,
 * EnhancedNewsSummarizationService, and UnifiedNewsService.
 * 
 * PRIVACY-FIRST: All news operations respect user privacy settings and anonymous mode.
 */

import { supabase } from '@/integrations/supabase/client';
import { NewsApiManager } from './newsApis/newsApiManager';
import { NewsProcessor } from './newsProcessor';
import { NewsLocationExtractor } from './newsLocationExtractor';
import { NewsCategorizer } from './newsCategorizer';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  api_key?: string;
  rate_limit: number;
  last_fetch?: string;
  is_active: boolean;
  category: string;
  location_bias?: string;
}

export interface NewsArticle {
  id?: string;
  article_id: string; // SHA-256 hash of URL
  title: string;
  content: string;
  summary?: string;
  source: string;
  url: string;
  image_url?: string;
  published_at: string;
  cached_at: string;
  expires_at: string;
  city?: string;
  country?: string;
  category?: string;
  tags: string[];
  ai_generated?: boolean;
  metadata: Record<string, unknown>;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  views_count?: number;
}

export interface NewsSummary {
  article_id: string;
  summary: string;
  key_points: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  generated_at: string;
}

export interface NewsAggregationResult {
  total_articles_fetched: number;
  total_articles_processed: number;
  total_articles_stored: number;
  duplicates_removed: number;
  processing_errors: number;
  sources_processed: string[];
  processing_time_ms: number;
  success: boolean;
  error?: string;
}

export interface NewsFetchOptions {
  sources?: string[];
  categories?: string[];
  locations?: string[];
  timeRange?: 'hour' | 'day' | 'week' | 'month';
  limit?: number;
  includeSummaries?: boolean;
  includePersonalization?: boolean;
}

export interface NewsPersonalizationData {
  user_interests: string[];
  location_bias: {
    city?: string;
    country?: string;
    radius_km?: number;
  };
  reading_history: string[];
  interaction_preferences: {
    preferred_sources: string[];
    preferred_categories: string[];
    avoid_categories: string[];
  };
}

// ============================================================================
// CONSOLIDATED NEWS SERVICE
// ============================================================================

export class ConsolidatedNewsService {
  private static instance: ConsolidatedNewsService;
  private apiManager: NewsApiManager;
  private processor: NewsProcessor;
  private locationExtractor: NewsLocationExtractor;
  private categorizer: NewsCategorizer;
  private rateLimitCache: Map<string, number> = new Map();

  private constructor() {
    this.apiManager = new NewsApiManager();
    this.processor = new NewsProcessor();
    this.locationExtractor = new NewsLocationExtractor();
    this.categorizer = new NewsCategorizer();
  }

  public static getInstance(): ConsolidatedNewsService {
    if (!ConsolidatedNewsService.instance) {
      ConsolidatedNewsService.instance = new ConsolidatedNewsService();
    }
    return ConsolidatedNewsService.instance;
  }

  // ============================================================================
  // NEWS AGGREGATION
  // ============================================================================

  /**
   * Fetch news from all active sources with enhanced processing
   */
  async fetchNewsFromAllSources(options: NewsFetchOptions = {}): Promise<NewsAggregationResult> {
    const startTime = Date.now();
    let totalArticlesFetched = 0;
    let totalArticlesProcessed = 0;
    let totalArticlesStored = 0;
    let duplicatesRemoved = 0;
    let processingErrors = 0;
    const sourcesProcessed: string[] = [];

    try {
      // Get active news sources
      const { data: sources, error: sourcesError } = await supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true);

      if (sourcesError) throw sourcesError;

      console.log(`Found ${sources?.length || 0} active news sources`);

      for (const source of sources || []) {
        try {
          // Check rate limiting
          if (this.isSourceRateLimited(source)) {
            console.log(`Source ${source.name} is rate limited, skipping`);
            continue;
          }

          // Fetch articles from this source
          const articles = await this.fetchNewsFromSource(source, options);
          totalArticlesFetched += articles.length;
          sourcesProcessed.push(source.name);

          if (articles.length === 0) {
            console.log(`No new articles from ${source.name}`);
            continue;
          }

          // Process articles
          const processedArticles = await this.processArticles(articles, source, options);
          totalArticlesProcessed += processedArticles.length;

          // Remove duplicates
          const uniqueArticles = await this.removeDuplicates(processedArticles);
          duplicatesRemoved += processedArticles.length - uniqueArticles.length;

          // Store articles
          const storedCount = await this.storeArticles(uniqueArticles);
          totalArticlesStored += storedCount;

          // Update source last fetch time
          await this.updateSourceFetchTime(source.id);

          console.log(`Processed ${articles.length} articles from ${source.name}, stored ${storedCount}`);

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
        processing_time_ms: Date.now() - startTime,
        success: processingErrors === 0
      };

    } catch (error) {
      console.error('Error in fetchNewsFromAllSources:', error);
      return {
        total_articles_fetched: 0,
        total_articles_processed: 0,
        total_articles_stored: 0,
        duplicates_removed: 0,
        processing_errors: 1,
        sources_processed: [],
        processing_time_ms: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ============================================================================
  // NEWS FETCHING AND PROCESSING
  // ============================================================================

  /**
   * Fetch news from a specific source
   */
  private async fetchNewsFromSource(source: NewsSource, options: NewsFetchOptions): Promise<NewsArticle[]> {
    try {
      // Use the API manager to fetch articles
      const articles = await this.apiManager.fetchArticles(source, {
        limit: options.limit || 50,
        categories: options.categories,
        locations: options.locations
      });

      // Convert to our format
      return articles.map(article => ({
        article_id: this.generateArticleId(article.url),
        title: article.title,
        content: article.content,
        source: source.name,
        url: article.url,
        image_url: article.image_url,
        published_at: article.published_at,
        cached_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        tags: article.tags || [],
        ai_generated: false,
        metadata: {
          source_id: source.id,
          api_version: 'v1',
          fetch_options: options
        }
      }));

    } catch (error) {
      console.error(`Error fetching from source ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Process articles with location extraction, categorization, and summarization
   */
  private async processArticles(
    articles: NewsArticle[], 
    source: NewsSource, 
    options: NewsFetchOptions
  ): Promise<NewsArticle[]> {
    const processedArticles: NewsArticle[] = [];

    for (const article of articles) {
      try {
        // Extract location information
        const location = await this.locationExtractor.extractLocation(article);
        if (location) {
          article.city = location.city;
          article.country = location.country;
        }

        // Categorize the article
        const category = await this.categorizer.categorizeArticle(article);
        article.category = category;

        // Generate summary if requested
        if (options.includeSummaries) {
          const summary = await this.generateSummary(article);
          article.summary = summary;
        }

        processedArticles.push(article);

      } catch (error) {
        console.error(`Error processing article ${article.article_id}:`, error);
        // Still add the article without processing
        processedArticles.push(article);
      }
    }

    return processedArticles;
  }

  /**
   * Generate AI summary for an article
   */
  private async generateSummary(article: NewsArticle): Promise<string> {
    try {
      // Call the news summarization edge function
      const { data, error } = await supabase.functions.invoke('generate-ai-summary', {
        body: {
          article_id: article.article_id,
          title: article.title,
          content: article.content
        }
      });

      if (error) throw error;
      return data.summary || '';

    } catch (error) {
      console.error('Error generating summary:', error);
      // Fallback to simple truncation
      return article.content.length > 200 
        ? article.content.substring(0, 200) + '...' 
        : article.content;
    }
  }

  // ============================================================================
  // NEWS RETRIEVAL AND PERSONALIZATION
  // ============================================================================

  /**
   * Get news articles with personalization
   */
  async getPersonalizedNews(
    userId: string, 
    options: NewsFetchOptions = {}
  ): Promise<NewsArticle[]> {
    try {
      // Get user personalization data
      const personalizationData = await this.getUserPersonalizationData(userId);
      
      // Build query with personalization
      let query = supabase
        .from('news_summaries')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('published_at', { ascending: false });

      // Apply location bias
      if (personalizationData.location_bias.city) {
        query = query.eq('city', personalizationData.location_bias.city);
      }

      // Apply category preferences
      if (personalizationData.interaction_preferences.preferred_categories.length > 0) {
        query = query.in('category', personalizationData.interaction_preferences.preferred_categories);
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data: articles, error } = await query;

      if (error) throw error;

      // Sort by personalization score
      const personalizedArticles = this.scoreAndSortArticles(
        articles || [], 
        personalizationData
      );

      return personalizedArticles;

    } catch (error) {
      console.error('Error getting personalized news:', error);
      return [];
    }
  }

  /**
   * Get trending news articles
   */
  async getTrendingNews(options: NewsFetchOptions = {}): Promise<NewsArticle[]> {
    try {
      let query = supabase
        .from('news_summaries')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('published_at', { ascending: false });

      // Apply time range filter
      if (options.timeRange) {
        const timeRangeHours = this.getTimeRangeHours(options.timeRange);
        const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
        query = query.gte('published_at', cutoffTime.toISOString());
      }

      // Apply category filter
      if (options.categories && options.categories.length > 0) {
        query = query.in('category', options.categories);
      }

      // Apply location filter
      if (options.locations && options.locations.length > 0) {
        query = query.in('city', options.locations);
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data: articles, error } = await query;

      if (error) throw error;

      // Calculate trending scores and sort
      const trendingArticles = this.calculateTrendingScores(articles || []);
      
      return trendingArticles.sort((a, b) => 
        (b.metadata?.trending_score || 0) - (a.metadata?.trending_score || 0)
      );

    } catch (error) {
      console.error('Error getting trending news:', error);
      return [];
    }
  }

  // ============================================================================
  // NEWS INTERACTIONS
  // ============================================================================

  /**
   * Like a news article
   */
  async likeArticle(userId: string, articleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('news_likes')
        .insert({
          user_id: userId,
          article_id: articleId
        });

      if (error) throw error;

      // Update like count
      await this.updateArticleLikeCount(articleId);
      
      return true;

    } catch (error) {
      console.error('Error liking article:', error);
      return false;
    }
  }

  /**
   * Unlike a news article
   */
  async unlikeArticle(userId: string, articleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('news_likes')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', articleId);

      if (error) throw error;

      // Update like count
      await this.updateArticleLikeCount(articleId);
      
      return true;

    } catch (error) {
      console.error('Error unliking article:', error);
      return false;
    }
  }

  /**
   * Share a news article
   */
  async shareArticle(userId: string, articleId: string, platform?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('news_shares')
        .insert({
          user_id: userId,
          article_id: articleId,
          platform: platform
        });

      if (error) throw error;

      // Update share count
      await this.updateArticleShareCount(articleId);
      
      return true;

    } catch (error) {
      console.error('Error sharing article:', error);
      return false;
    }
  }

  /**
   * Comment on a news article
   */
  async commentOnArticle(
    userId: string, 
    articleId: string, 
    content: string,
    parentId?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('news_discussions')
        .insert({
          user_id: userId,
          article_id: articleId,
          content,
          parent_id: parentId,
          is_anonymous: true // Default to anonymous
        })
        .select('id')
        .single();

      if (error) throw error;

      // Update comment count
      await this.updateArticleCommentCount(articleId);
      
      return data.id;

    } catch (error) {
      console.error('Error commenting on article:', error);
      return null;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate unique article ID from URL
   */
  private generateArticleId(url: string): string {
    // Simple hash function for article ID
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if source is rate limited
   */
  private isSourceRateLimited(source: NewsSource): boolean {
    const lastFetch = this.rateLimitCache.get(source.id);
    const now = Date.now();
    
    if (!lastFetch) {
      this.rateLimitCache.set(source.id, now);
      return false;
    }
    
    const timeSinceLastFetch = now - lastFetch;
    const rateLimitMs = source.rate_limit * 1000; // Convert seconds to milliseconds
    
    return timeSinceLastFetch < rateLimitMs;
  }

  /**
   * Remove duplicate articles
   */
  private async removeDuplicates(articles: NewsArticle[]): Promise<NewsArticle[]> {
    const seen = new Set<string>();
    const unique: NewsArticle[] = [];
    
    for (const article of articles) {
      if (!seen.has(article.article_id)) {
        seen.add(article.article_id);
        unique.push(article);
      }
    }
    
    return unique;
  }

  /**
   * Store articles in database
   */
  private async storeArticles(articles: NewsArticle[]): Promise<number> {
    if (articles.length === 0) return 0;
    
    try {
      const { error } = await supabase
        .from('news_summaries')
        .upsert(articles, { onConflict: 'article_id' });
      
      if (error) throw error;
      return articles.length;
      
    } catch (error) {
      console.error('Error storing articles:', error);
      return 0;
    }
  }

  /**
   * Update source last fetch time
   */
  private async updateSourceFetchTime(sourceId: string): Promise<void> {
    try {
      await supabase
        .from('news_sources')
        .update({ last_fetch: new Date().toISOString() })
        .eq('id', sourceId);
    } catch (error) {
      console.error('Error updating source fetch time:', error);
    }
  }

  /**
   * Get user personalization data
   */
  private async getUserPersonalizationData(userId: string): Promise<NewsPersonalizationData> {
    try {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('location_city, location_country')
        .eq('user_id', userId)
        .single();
      
      return {
        user_interests: preferences?.map(p => p.category) || [],
        location_bias: {
          city: profile?.location_city,
          country: profile?.location_country,
          radius_km: 50
        },
        reading_history: [],
        interaction_preferences: {
          preferred_sources: [],
          preferred_categories: [],
          avoid_categories: []
        }
      };
    } catch (error) {
      console.error('Error getting personalization data:', error);
      return {
        user_interests: [],
        location_bias: {},
        reading_history: [],
        interaction_preferences: {
          preferred_sources: [],
          preferred_categories: [],
          avoid_categories: []
        }
      };
    }
  }

  /**
   * Score and sort articles by personalization
   */
  private scoreAndSortArticles(
    articles: NewsArticle[], 
    personalizationData: NewsPersonalizationData
  ): NewsArticle[] {
    return articles.map(article => {
      let score = 1;
      
      // Location bias
      if (personalizationData.location_bias.city === article.city) {
        score += 0.2;
      }
      
      // Category preference
      if (personalizationData.interaction_preferences.preferred_categories.includes(article.category || '')) {
        score += 0.3;
      }
      
      // Interest matching
      const matchingInterests = personalizationData.user_interests.filter(interest =>
        article.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
      );
      score += matchingInterests.length * 0.1;
      
      return {
        ...article,
        metadata: {
          ...article.metadata,
          personalization_score: score
        }
      };
    }).sort((a, b) => 
      (b.metadata?.personalization_score || 0) - (a.metadata?.personalization_score || 0)
    );
  }

  /**
   * Calculate trending scores for articles
   */
  private calculateTrendingScores(articles: NewsArticle[]): NewsArticle[] {
    const now = Date.now();
    
    return articles.map(article => {
      const publishedTime = new Date(article.published_at).getTime();
      const ageHours = (now - publishedTime) / (1000 * 60 * 60);
      
      // Time decay factor (λ ≈ 0.08)
      const timeDecay = Math.exp(-0.08 * ageHours);
      
      // Engagement score
      const likes = article.likes_count || 0;
      const comments = article.comments_count || 0;
      const shares = article.shares_count || 0;
      const engagementScore = likes + (comments * 2) + (shares * 3);
      
      // Trending score
      const trendingScore = engagementScore * timeDecay;
      
      return {
        ...article,
        metadata: {
          ...article.metadata,
          trending_score: trendingScore
        }
      };
    });
  }

  /**
   * Get time range in hours
   */
  private getTimeRangeHours(timeRange: string): number {
    switch (timeRange) {
      case 'hour': return 1;
      case 'day': return 24;
      case 'week': return 168;
      case 'month': return 720;
      default: return 24;
    }
  }

  /**
   * Update article like count
   */
  private async updateArticleLikeCount(articleId: string): Promise<void> {
    try {
      const { count } = await supabase
        .from('news_likes')
        .select('*', { count: 'exact' })
        .eq('article_id', articleId);
      
      await supabase
        .from('news_summaries')
        .update({ likes_count: count || 0 })
        .eq('article_id', articleId);
    } catch (error) {
      console.error('Error updating like count:', error);
    }
  }

  /**
   * Update article share count
   */
  private async updateArticleShareCount(articleId: string): Promise<void> {
    try {
      const { count } = await supabase
        .from('news_shares')
        .select('*', { count: 'exact' })
        .eq('article_id', articleId);
      
      await supabase
        .from('news_summaries')
        .update({ shares_count: count || 0 })
        .eq('article_id', articleId);
    } catch (error) {
      console.error('Error updating share count:', error);
    }
  }

  /**
   * Update article comment count
   */
  private async updateArticleCommentCount(articleId: string): Promise<void> {
    try {
      const { count } = await supabase
        .from('news_discussions')
        .select('*', { count: 'exact' })
        .eq('article_id', articleId);
      
      await supabase
        .from('news_summaries')
        .update({ comments_count: count || 0 })
        .eq('article_id', articleId);
    } catch (error) {
      console.error('Error updating comment count:', error);
    }
  }
}

// Export singleton instance
export const consolidatedNewsService = ConsolidatedNewsService.getInstance();
