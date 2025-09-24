import { NewsSource, NewsApiArticle, NewsApiResponse } from '@/types/news';
import { news } from '@/config/environment';

export class NewsApiOrg {
  private baseUrl = 'https://newsapi.org/v2';
  private apiKey: string;

  constructor() {
    this.apiKey = news.apiKey;
  }

  /**
   * Fetch news from NewsAPI.org
   */
  async fetchNews(source: NewsSource): Promise<NewsApiArticle[]> {
    try {
      if (!this.apiKey) {
        console.warn('NewsAPI.org API key not configured');
        return [];
      }

      const articles: NewsApiArticle[] = [];
      
      // Fetch articles for each category
      for (const category of source.categories) {
        try {
          const categoryArticles = await this.fetchCategoryNews(category, source.location_bias);
          articles.push(...categoryArticles);
        } catch (error) {
          console.error(`Error fetching category ${category}:`, error);
        }
      }

      // If no categories specified, fetch top headlines
      if (source.categories.length === 0) {
        const topHeadlines = await this.fetchTopHeadlines(source.location_bias);
        articles.push(...topHeadlines);
      }

      return articles;
    } catch (error) {
      console.error('Error fetching news from NewsAPI.org:', error);
      return [];
    }
  }

  /**
   * Fetch news by category
   */
  private async fetchCategoryNews(category: string, locationBias?: string): Promise<NewsApiArticle[]> {
    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        category: category,
        pageSize: '20',
        language: 'en',
        sortBy: 'publishedAt'
      });

      if (locationBias) {
        params.append('country', this.getCountryCode(locationBias));
      }

      const response = await fetch(`${this.baseUrl}/top-headlines?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NewsApiResponse = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(`API error: ${data.status}`);
      }

      return data.articles || [];
    } catch (error) {
      console.error(`Error fetching category news for ${category}:`, error);
      return [];
    }
  }

  /**
   * Fetch top headlines
   */
  private async fetchTopHeadlines(locationBias?: string): Promise<NewsApiArticle[]> {
    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        pageSize: '20',
        language: 'en',
        sortBy: 'publishedAt'
      });

      if (locationBias) {
        params.append('country', this.getCountryCode(locationBias));
      }

      const response = await fetch(`${this.baseUrl}/top-headlines?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NewsApiResponse = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(`API error: ${data.status}`);
      }

      return data.articles || [];
    } catch (error) {
      console.error('Error fetching top headlines:', error);
      return [];
    }
  }

  /**
   * Search news articles
   */
  async searchNews(query: string, options: {
    from?: string;
    to?: string;
    language?: string;
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
    pageSize?: number;
  } = {}): Promise<NewsApiArticle[]> {
    try {
      if (!this.apiKey) {
        console.warn('NewsAPI.org API key not configured');
        return [];
      }

      const params = new URLSearchParams({
        apiKey: this.apiKey,
        q: query,
        pageSize: (options.pageSize || 20).toString(),
        language: options.language || 'en',
        sortBy: options.sortBy || 'publishedAt'
      });

      if (options.from) {
        params.append('from', options.from);
      }

      if (options.to) {
        params.append('to', options.to);
      }

      const response = await fetch(`${this.baseUrl}/everything?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NewsApiResponse = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(`API error: ${data.status}`);
      }

      return data.articles || [];
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  /**
   * Get available categories
   */
  getAvailableCategories(): Array<{
    name: string;
    displayName: string;
    description: string;
  }> {
    return [
      { name: 'general', displayName: 'General', description: 'General news and updates' },
      { name: 'business', displayName: 'Business', description: 'Business and economic news' },
      { name: 'technology', displayName: 'Technology', description: 'Technology and innovation news' },
      { name: 'entertainment', displayName: 'Entertainment', description: 'Entertainment and culture news' },
      { name: 'sports', displayName: 'Sports', description: 'Sports news and updates' },
      { name: 'health', displayName: 'Health', description: 'Health and wellness news' },
      { name: 'science', displayName: 'Science', description: 'Science and research news' }
    ];
  }

  /**
   * Get available countries
   */
  getAvailableCountries(): Array<{
    code: string;
    name: string;
  }> {
    return [
      { code: 'us', name: 'United States' },
      { code: 'gb', name: 'United Kingdom' },
      { code: 'ca', name: 'Canada' },
      { code: 'au', name: 'Australia' },
      { code: 'in', name: 'India' },
      { code: 'de', name: 'Germany' },
      { code: 'fr', name: 'France' },
      { code: 'jp', name: 'Japan' },
      { code: 'cn', name: 'China' },
      { code: 'br', name: 'Brazil' }
    ];
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): Array<{
    code: string;
    name: string;
  }> {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' }
    ];
  }

  /**
   * Get country code from location bias
   */
  private getCountryCode(locationBias: string): string {
    const countryMap: Record<string, string> = {
      'united states': 'us',
      'usa': 'us',
      'us': 'us',
      'united kingdom': 'gb',
      'uk': 'gb',
      'great britain': 'gb',
      'canada': 'ca',
      'australia': 'au',
      'india': 'in',
      'germany': 'de',
      'france': 'fr',
      'japan': 'jp',
      'china': 'cn',
      'brazil': 'br'
    };

    const normalized = locationBias.toLowerCase().trim();
    return countryMap[normalized] || 'us'; // Default to US
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    quota?: {
      used: number;
      total: number;
    };
  }> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          message: 'API key not configured'
        };
      }

      const response = await fetch(`${this.baseUrl}/top-headlines?apiKey=${this.apiKey}&country=us&pageSize=1`);
      
      if (!response.ok) {
        return {
          success: false,
          message: `HTTP error! status: ${response.status}`
        };
      }

      const data: NewsApiResponse = await response.json();
      
      if (data.status !== 'ok') {
        return {
          success: false,
          message: `API error: ${data.status}`
        };
      }

      // Extract quota information from headers if available
      const quotaUsed = response.headers.get('X-RateLimit-Used');
      const quotaTotal = response.headers.get('X-RateLimit-Total');

      return {
        success: true,
        message: 'Connection successful',
        quota: quotaUsed && quotaTotal ? {
          used: parseInt(quotaUsed),
          total: parseInt(quotaTotal)
        } : undefined
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get API usage statistics
   */
  async getUsageStats(): Promise<{
    totalRequests: number;
    remainingRequests: number;
    resetTime?: string;
  }> {
    // NewsAPI.org doesn't provide usage stats in the response
    // This would need to be tracked separately
    return {
      totalRequests: 0,
      remainingRequests: 1000, // Default free tier limit
      resetTime: undefined
    };
  }
}
