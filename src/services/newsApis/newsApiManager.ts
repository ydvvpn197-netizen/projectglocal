import { NewsSource, NewsApiArticle } from '@/types/news';
import { NewsApiOrg } from './newsApiOrg';
import { GoogleNewsApi } from './googleNewsApi';
import { LocalNewsApi } from './localNewsApi';

export class NewsApiManager {
  private newsApiOrg: NewsApiOrg;
  private googleNewsApi: GoogleNewsApi;
  private localNewsApi: LocalNewsApi;

  constructor() {
    this.newsApiOrg = new NewsApiOrg();
    this.googleNewsApi = new GoogleNewsApi();
    this.localNewsApi = new LocalNewsApi();
  }

  /**
   * Fetch news from external source
   */
  async fetchFromExternalSource(source: NewsSource): Promise<NewsApiArticle[]> {
    try {
      // Determine which API to use based on source name or endpoint
      if (source.api_endpoint.includes('newsapi.org')) {
        return await this.newsApiOrg.fetchNews(source);
      } else if (source.api_endpoint.includes('news.google.com')) {
        return await this.googleNewsApi.fetchNews(source);
      } else {
        // Generic external API call
        return await this.fetchFromGenericApi(source);
      }
    } catch (error) {
      console.error(`Error fetching from external source ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Fetch news from local source
   */
  async fetchFromLocalSource(source: NewsSource): Promise<NewsApiArticle[]> {
    try {
      return await this.localNewsApi.fetchNews(source);
    } catch (error) {
      console.error(`Error fetching from local source ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Fetch news from RSS source
   */
  async fetchFromRssSource(source: NewsSource): Promise<NewsApiArticle[]> {
    try {
      // For now, we'll use a generic RSS parser
      // In a full implementation, you'd want to use a proper RSS parser library
      return await this.fetchFromRssFeed(source.api_endpoint);
    } catch (error) {
      console.error(`Error fetching from RSS source ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Fetch from generic API
   */
  private async fetchFromGenericApi(source: NewsSource): Promise<NewsApiArticle[]> {
    try {
      const response = await fetch(source.api_endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(source.api_key && { 'Authorization': `Bearer ${source.api_key}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Try to parse the response based on common patterns
      return this.parseGenericApiResponse(data, source);
    } catch (error) {
      console.error('Error fetching from generic API:', error);
      return [];
    }
  }

  /**
   * Parse generic API response
   */
  private parseGenericApiResponse(data: any, source: NewsSource): NewsApiArticle[] {
    try {
      // Try different common response patterns
      let articles: any[] = [];

      // Pattern 1: { articles: [...] }
      if (data.articles && Array.isArray(data.articles)) {
        articles = data.articles;
      }
      // Pattern 2: { data: { articles: [...] } }
      else if (data.data?.articles && Array.isArray(data.data.articles)) {
        articles = data.data.articles;
      }
      // Pattern 3: Direct array
      else if (Array.isArray(data)) {
        articles = data;
      }
      // Pattern 4: { results: [...] }
      else if (data.results && Array.isArray(data.results)) {
        articles = data.results;
      }
      else {
        console.warn('Unknown API response format:', data);
        return [];
      }

      return articles.map(article => this.normalizeArticle(article, source));
    } catch (error) {
      console.error('Error parsing generic API response:', error);
      return [];
    }
  }

  /**
   * Fetch from RSS feed
   */
  private async fetchFromRssFeed(rssUrl: string): Promise<NewsApiArticle[]> {
    try {
      // For now, we'll return an empty array
      // In a full implementation, you'd want to use a proper RSS parser
      console.warn('RSS feed parsing not implemented yet');
      return [];
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      return [];
    }
  }

  /**
   * Normalize article from different API formats
   */
  private normalizeArticle(article: any, source: NewsSource): NewsApiArticle {
    return {
      source: {
        id: article.source?.id || source.id,
        name: article.source?.name || source.name
      },
      author: article.author || article.byline || article.creator || null,
      title: article.title || article.headline || '',
      description: article.description || article.summary || article.excerpt || null,
      url: article.url || article.link || article.webUrl || '',
      urlToImage: article.urlToImage || article.image || article.media?.url || null,
      publishedAt: article.publishedAt || article.published_date || article.date || new Date().toISOString(),
      content: article.content || article.body || null
    };
  }

  /**
   * Test API connection
   */
  async testApiConnection(source: NewsSource): Promise<{
    success: boolean;
    message: string;
    articlesCount?: number;
  }> {
    try {
      let articles: NewsApiArticle[] = [];

      switch (source.source_type) {
        case 'external':
          articles = await this.fetchFromExternalSource(source);
          break;
        case 'local':
          articles = await this.fetchFromLocalSource(source);
          break;
        case 'rss':
          articles = await this.fetchFromRssSource(source);
          break;
        default:
          return {
            success: false,
            message: `Unsupported source type: ${source.source_type}`
          };
      }

      return {
        success: true,
        message: `Successfully fetched ${articles.length} articles from ${source.name}`,
        articlesCount: articles.length
      };
    } catch (error) {
      return {
        success: false,
        message: `Error testing connection: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get available API sources
   */
  getAvailableSources(): Array<{
    name: string;
    type: 'external' | 'local' | 'rss';
    endpoint: string;
    description: string;
    requiresApiKey: boolean;
  }> {
    return [
      {
        name: 'NewsAPI.org',
        type: 'external',
        endpoint: 'https://newsapi.org/v2',
        description: 'Comprehensive news API with global coverage',
        requiresApiKey: true
      },
      {
        name: 'Google News',
        type: 'external',
        endpoint: 'https://news.google.com',
        description: 'Google News RSS feeds',
        requiresApiKey: false
      },
      {
        name: 'Local Community',
        type: 'local',
        endpoint: 'internal',
        description: 'Local community news and events',
        requiresApiKey: false
      },
      {
        name: 'Custom RSS Feed',
        type: 'rss',
        endpoint: 'https://example.com/feed.xml',
        description: 'Custom RSS feed URL',
        requiresApiKey: false
      }
    ];
  }

  /**
   * Validate API configuration
   */
  validateApiConfig(source: NewsSource): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!source.name) {
      errors.push('Source name is required');
    }

    if (!source.api_endpoint) {
      errors.push('API endpoint is required');
    }

    // Check endpoint format
    if (source.api_endpoint && !this.isValidUrl(source.api_endpoint) && source.api_endpoint !== 'internal') {
      errors.push('Invalid API endpoint URL');
    }

    // Check API key requirements
    if (source.api_endpoint.includes('newsapi.org') && !source.api_key) {
      errors.push('API key is required for NewsAPI.org');
    }

    // Check rate limiting
    if (source.rate_limit_per_hour < 1) {
      warnings.push('Rate limit should be at least 1 request per hour');
    }

    // Check categories
    if (source.categories.length === 0) {
      warnings.push('No categories specified - will fetch all available categories');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if URL is valid
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get API usage statistics
   */
  async getApiUsageStats(source: NewsSource): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    lastRequestTime?: string;
    averageResponseTime?: number;
  }> {
    // This would typically be stored in a database
    // For now, return mock data
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      lastRequestTime: source.last_fetch_at,
      averageResponseTime: undefined
    };
  }

  /**
   * Update API usage statistics
   */
  async updateApiUsageStats(
    source: NewsSource, 
    success: boolean, 
    responseTime: number
  ): Promise<void> {
    // This would typically update a database
    // For now, just log the usage
    console.log(`API Usage - Source: ${source.name}, Success: ${success}, Response Time: ${responseTime}ms`);
  }
}
