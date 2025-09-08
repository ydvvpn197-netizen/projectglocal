import { supabase } from '@/integrations/supabase/client';
import { RSSFeedParser } from './rssFeedParser';
import { NewsAPIService } from './newsApiService';
import { NewsSummarizationService } from './newsSummarizationService';
import { NewsApiArticle } from '@/types/news';

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  rss_url?: string;
  api_endpoint?: string;
  api_key?: string;
  is_active: boolean;
  fetch_interval_minutes: number;
  last_fetched_at?: string;
  source_type: 'rss' | 'api' | 'external';
  category?: string;
  location?: {
    city: string;
    state: string;
    country: string;
    lat?: number;
    lng?: number;
  };
}

export interface NewsAggregationResult {
  total_articles_fetched: number;
  total_articles_processed: number;
  total_articles_stored: number;
  duplicates_removed: number;
  processing_errors: number;
  sources_processed: string[];
  processing_time_ms: number;
}

export class EnhancedNewsAggregationService {
  private static instance: EnhancedNewsAggregationService;
  private rssParser: RSSFeedParser;
  private newsApiService: NewsAPIService;
  private summarizationService: NewsSummarizationService;

  private constructor() {
    this.rssParser = RSSFeedParser.getInstance();
    this.newsApiService = NewsAPIService.getInstance();
    this.summarizationService = NewsSummarizationService.getInstance();
  }

  public static getInstance(): EnhancedNewsAggregationService {
    if (!EnhancedNewsAggregationService.instance) {
      EnhancedNewsAggregationService.instance = new EnhancedNewsAggregationService();
    }
    return EnhancedNewsAggregationService.instance;
  }

  /**
   * Fetch news from all active sources
   */
  async fetchNewsFromAllSources(): Promise<NewsAggregationResult> {
    const startTime = Date.now();
    let totalArticlesFetched = 0;
    let totalArticlesProcessed = 0;
    let totalArticlesStored = 0;
    let duplicatesRemoved = 0;
    let processingErrors = 0;
    const sourcesProcessed: string[] = [];

    try {
      // Get all active news sources
      const { data: sources, error: sourcesError } = await supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true);

      if (sourcesError) throw sourcesError;

      console.log(`Found ${sources?.length || 0} active news sources`);

      for (const source of sources || []) {
        try {
          console.log(`Fetching news from source: ${source.name}`);
          
          // Check if source should be fetched based on interval
          if (this.isSourceRateLimited(source)) {
            console.log(`Source ${source.name} is rate limited, skipping`);
            continue;
          }

          // Fetch articles from this source
          const articles = await this.fetchNewsFromSource(source);
          totalArticlesFetched += articles.length;
          sourcesProcessed.push(source.name);

          if (articles.length === 0) {
            console.log(`No new articles from ${source.name}`);
            continue;
          }

          // Process and store articles
          const processedArticles = await this.processArticles(articles, source);
          totalArticlesProcessed += processedArticles.length;

          // Store articles in database
          const storedCount = await this.storeArticles(processedArticles);
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
        case 'rss':
          return await this.fetchFromRSSSource(source);
        case 'api':
          return await this.fetchFromAPISource(source);
        case 'external':
          return await this.fetchFromExternalSource(source);
        default:
          console.warn(`Unsupported source type: ${source.source_type} for source: ${source.name}`);
          return [];
      }
    } catch (error) {
      console.error(`Error fetching from source ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Fetch from RSS source
   */
  private async fetchFromRSSSource(source: NewsSource): Promise<NewsApiArticle[]> {
    if (!source.rss_url) {
      console.warn(`No RSS URL configured for source: ${source.name}`);
      return [];
    }

    try {
      const feed = await this.rssParser.parseRSSFeed(source.rss_url);
      const articles = this.rssParser.convertToNewsArticles(feed, source.name);
      
      // Add source metadata
      return articles.map(article => ({
        ...article,
        source: {
          id: source.id,
          name: source.name
        }
      }));
    } catch (error) {
      console.error(`Error parsing RSS feed for ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Fetch from API source
   */
  private async fetchFromAPISource(source: NewsSource): Promise<NewsApiArticle[]> {
    if (!source.api_endpoint) {
      console.warn(`No API endpoint configured for source: ${source.name}`);
      return [];
    }

    try {
      // For NewsAPI.org
      if (source.api_endpoint.includes('newsapi.org')) {
        const articles = await this.newsApiService.getTopHeadlines({
          sources: source.name,
          pageSize: 50
        });
        return articles.map(article => this.newsApiService.convertToNewsArticle(article));
      }

      // For other APIs, implement custom logic
      const response = await fetch(source.api_endpoint, {
        headers: {
          'Authorization': source.api_key ? `Bearer ${source.api_key}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseAPIResponse(data, source);
    } catch (error) {
      console.error(`Error fetching from API source ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Fetch from external source (web scraping, etc.)
   */
  private async fetchFromExternalSource(source: NewsSource): Promise<NewsApiArticle[]> {
    // This would implement web scraping or other external data sources
    // For now, return empty array
    console.log(`External source fetching not implemented for: ${source.name}`);
    return [];
  }

  /**
   * Parse API response
   */
  private parseAPIResponse(data: any, source: NewsSource): NewsApiArticle[] {
    // Generic API response parser
    // This would need to be customized based on the specific API format
    if (Array.isArray(data)) {
      return data.map(item => ({
        title: item.title || '',
        description: item.description || item.summary || '',
        url: item.url || item.link || '',
        urlToImage: item.urlToImage || item.image || item.thumbnail || null,
        publishedAt: item.publishedAt || item.pubDate || item.created_at || new Date().toISOString(),
        source: {
          id: source.id,
          name: source.name
        },
        author: item.author || undefined,
        content: item.content || undefined
      }));
    }

    if (data.articles && Array.isArray(data.articles)) {
      return this.parseAPIResponse(data.articles, source);
    }

    return [];
  }

  /**
   * Process articles from a source
   */
  private async processArticles(
    articles: NewsApiArticle[], 
    source: NewsSource
  ): Promise<NewsApiArticle[]> {
    const processedArticles: NewsApiArticle[] = [];

    for (const article of articles) {
      try {
        // Check for duplicates
        const isDuplicate = await this.isDuplicateArticle(article);
        if (isDuplicate) continue;

        // Clean and validate article
        const cleanedArticle = this.cleanArticle(article);
        if (!cleanedArticle) continue;

        // Add source metadata
        cleanedArticle.source = {
          id: source.id,
          name: source.name
        };

        processedArticles.push(cleanedArticle);
      } catch (error) {
        console.error('Error processing article:', error);
      }
    }

    return processedArticles;
  }

  /**
   * Clean and validate article
   */
  private cleanArticle(article: NewsApiArticle): NewsApiArticle | null {
    // Basic validation
    if (!article.title || !article.url) {
      return null;
    }

    // Clean title
    article.title = article.title.trim();

    // Clean description
    if (article.description) {
      article.description = article.description.trim();
      // Remove HTML tags
      article.description = article.description.replace(/<[^>]*>/g, '');
    }

    // Validate URL
    try {
      new URL(article.url);
    } catch {
      return null;
    }

    // Validate image URL if present
    if (article.urlToImage) {
      try {
        new URL(article.urlToImage);
      } catch {
        article.urlToImage = null;
      }
    }

    return article;
  }

  /**
   * Store articles in the database
   */
  private async storeArticles(articles: NewsApiArticle[]): Promise<number> {
    if (articles.length === 0) return 0;

    try {
      // Convert to database format
      const dbArticles = articles.map(article => ({
        source_id: article.source.id,
        title: article.title,
        content: article.description || '',
        url: article.url,
        image_url: article.urlToImage,
        published_at: article.publishedAt,
        author: article.author || null,
        category: this.categorizeArticle(article),
        location_name: this.extractLocation(article),
        relevance_score: this.calculateRelevanceScore(article),
        engagement_score: 0.0
      }));

      const { data, error } = await supabase
        .from('news_articles')
        .insert(dbArticles)
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
  private async isDuplicateArticle(article: NewsApiArticle): Promise<boolean> {
    try {
      const { data: existing } = await supabase
        .from('news_articles')
        .select('id')
        .eq('url', article.url)
        .single();

      return !!existing;
    } catch (error) {
      return false;
    }
  }

  /**
   * Categorize article based on content
   */
  private categorizeArticle(article: NewsApiArticle): string {
    const title = article.title.toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = title + ' ' + description;

    // Simple keyword-based categorization
    if (content.includes('tech') || content.includes('technology') || content.includes('ai') || content.includes('software')) {
      return 'Technology';
    }
    if (content.includes('business') || content.includes('economy') || content.includes('finance') || content.includes('market')) {
      return 'Business';
    }
    if (content.includes('health') || content.includes('medical') || content.includes('covid') || content.includes('vaccine')) {
      return 'Health';
    }
    if (content.includes('sport') || content.includes('football') || content.includes('basketball') || content.includes('soccer')) {
      return 'Sports';
    }
    if (content.includes('entertainment') || content.includes('movie') || content.includes('music') || content.includes('celebrity')) {
      return 'Entertainment';
    }
    if (content.includes('politics') || content.includes('election') || content.includes('government') || content.includes('president')) {
      return 'Politics';
    }
    if (content.includes('science') || content.includes('research') || content.includes('study') || content.includes('discovery')) {
      return 'Science';
    }

    return 'General';
  }

  /**
   * Extract location from article
   */
  private extractLocation(article: NewsApiArticle): string | null {
    const content = (article.title + ' ' + (article.description || '')).toLowerCase();
    
    // Simple location extraction (could be enhanced with NLP)
    const locations = [
      'new york', 'london', 'paris', 'tokyo', 'berlin', 'moscow', 'beijing',
      'california', 'texas', 'florida', 'washington', 'chicago', 'los angeles'
    ];

    for (const location of locations) {
      if (content.includes(location)) {
        return location;
      }
    }

    return null;
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevanceScore(article: NewsApiArticle): number {
    let score = 0.5; // Base score

    // Title quality
    if (article.title.length > 20) score += 0.1;
    if (article.title.length > 50) score += 0.1;

    // Description quality
    if (article.description && article.description.length > 100) score += 0.1;
    if (article.description && article.description.length > 200) score += 0.1;

    // Has image
    if (article.urlToImage) score += 0.1;

    // Has author
    if (article.author) score += 0.05;

    return Math.min(score, 1.0);
  }

  /**
   * Check if source is rate limited
   */
  private isSourceRateLimited(source: NewsSource): boolean {
    if (!source.last_fetched_at) return false;

    const lastFetch = new Date(source.last_fetched_at);
    const now = new Date();
    const minutesSinceLastFetch = (now.getTime() - lastFetch.getTime()) / (1000 * 60);

    return minutesSinceLastFetch < source.fetch_interval_minutes;
  }

  /**
   * Update source last fetch time
   */
  private async updateSourceFetchTime(sourceId: string): Promise<void> {
    try {
      await supabase
        .from('news_sources')
        .update({ last_fetched_at: new Date().toISOString() })
        .eq('id', sourceId);
    } catch (error) {
      console.error('Error updating source fetch time:', error);
    }
  }

  /**
   * Add new news source
   */
  async addNewsSource(source: Omit<NewsSource, 'id'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('news_sources')
        .insert(source)
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error adding news source:', error);
      throw error;
    }
  }

  /**
   * Update news source
   */
  async updateNewsSource(sourceId: string, updates: Partial<NewsSource>): Promise<void> {
    try {
      const { error } = await supabase
        .from('news_sources')
        .update(updates)
        .eq('id', sourceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating news source:', error);
      throw error;
    }
  }

  /**
   * Get news sources
   */
  async getNewsSources(): Promise<NewsSource[]> {
    try {
      const { data, error } = await supabase
        .from('news_sources')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting news sources:', error);
      return [];
    }
  }

  /**
   * Test news source
   */
  async testNewsSource(source: NewsSource): Promise<{ success: boolean; articles: number; error?: string }> {
    try {
      const articles = await this.fetchNewsFromSource(source);
      return {
        success: true,
        articles: articles.length
      };
    } catch (error) {
      return {
        success: false,
        articles: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
