import { NewsApiArticle } from '@/types/news';

export interface NewsAPIConfig {
  apiKey: string;
  baseUrl: string;
  rateLimit: {
    requestsPerHour: number;
    requestsPerDay: number;
  };
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

export interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export class NewsAPIService {
  private static instance: NewsAPIService;
  private config: NewsAPIConfig;
  private requestCount = 0;
  private lastResetTime = Date.now();

  private constructor() {
    this.config = {
      apiKey: process.env.VITE_NEWS_API_KEY || '',
      baseUrl: 'https://newsapi.org/v2',
      rateLimit: {
        requestsPerHour: 1000,
        requestsPerDay: 10000
      }
    };
  }

  public static getInstance(): NewsAPIService {
    if (!NewsAPIService.instance) {
      NewsAPIService.instance = new NewsAPIService();
    }
    return NewsAPIService.instance;
  }

  /**
   * Get top headlines
   */
  async getTopHeadlines(params: {
    country?: string;
    category?: string;
    sources?: string;
    q?: string;
    pageSize?: number;
    page?: number;
  } = {}): Promise<NewsAPIArticle[]> {
    const endpoint = '/top-headlines';
    const queryParams = new URLSearchParams();

    if (params.country) queryParams.append('country', params.country);
    if (params.category) queryParams.append('category', params.category);
    if (params.sources) queryParams.append('sources', params.sources);
    if (params.q) queryParams.append('q', params.q);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.page) queryParams.append('page', params.page.toString());

    return this.makeRequest(endpoint, queryParams);
  }

  /**
   * Get everything (all articles)
   */
  async getEverything(params: {
    q?: string;
    qInTitle?: string;
    sources?: string;
    domains?: string;
    excludeDomains?: string;
    from?: string;
    to?: string;
    language?: string;
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
    pageSize?: number;
    page?: number;
  } = {}): Promise<NewsAPIArticle[]> {
    const endpoint = '/everything';
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.append('q', params.q);
    if (params.qInTitle) queryParams.append('qInTitle', params.qInTitle);
    if (params.sources) queryParams.append('sources', params.sources);
    if (params.domains) queryParams.append('domains', params.domains);
    if (params.excludeDomains) queryParams.append('excludeDomains', params.excludeDomains);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.language) queryParams.append('language', params.language);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.page) queryParams.append('page', params.page.toString());

    return this.makeRequest(endpoint, queryParams);
  }

  /**
   * Get sources
   */
  async getSources(params: {
    category?: string;
    language?: string;
    country?: string;
  } = {}): Promise<any[]> {
    const endpoint = '/sources';
    const queryParams = new URLSearchParams();

    if (params.category) queryParams.append('category', params.category);
    if (params.language) queryParams.append('language', params.language);
    if (params.country) queryParams.append('country', params.country);

    const response = await this.makeRequest(endpoint, queryParams, 'sources');
    return response;
  }

  /**
   * Make API request
   */
  private async makeRequest(endpoint: string, queryParams: URLSearchParams, dataKey: string = 'articles'): Promise<any[]> {
    if (!this.config.apiKey) {
      throw new Error('News API key not configured');
    }

    // Check rate limit
    this.checkRateLimit();

    const url = `${this.config.baseUrl}${endpoint}?${queryParams.toString()}&apiKey=${this.config.apiKey}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data: NewsAPIResponse = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(`API error: ${data.status}`);
      }

      this.requestCount++;
      return data[dataKey as keyof NewsAPIResponse] as any[] || [];
    } catch (error) {
      console.error('News API request failed:', error);
      throw error;
    }
  }

  /**
   * Check rate limit
   */
  private checkRateLimit(): void {
    const now = Date.now();
    const hoursSinceReset = (now - this.lastResetTime) / (1000 * 60 * 60);

    // Reset counter every hour
    if (hoursSinceReset >= 1) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // Check hourly limit
    if (this.requestCount >= this.config.rateLimit.requestsPerHour) {
      throw new Error('Hourly rate limit exceeded');
    }
  }

  /**
   * Convert NewsAPI article to our format
   */
  convertToNewsArticle(apiArticle: NewsAPIArticle): NewsApiArticle {
    return {
      title: apiArticle.title,
      description: apiArticle.description || '',
      url: apiArticle.url,
      urlToImage: apiArticle.urlToImage,
      publishedAt: apiArticle.publishedAt,
      source: {
        id: apiArticle.source.id || apiArticle.source.name.toLowerCase().replace(/\s+/g, '-'),
        name: apiArticle.source.name
      },
      author: apiArticle.author || undefined,
      content: apiArticle.content || undefined
    };
  }
}
