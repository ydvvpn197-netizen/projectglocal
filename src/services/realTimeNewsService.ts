import { supabase } from '../integrations/supabase/client';
import { NewsArticle } from '../types/news';

interface GNewsResponse {
  articles: Array<{
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    source: {
  name: string;
  url: string;
    };
  }>;
  totalArticles: number;
}

interface NewsAPIResponse {
  articles: Array<{
    title: string;
    description: string;
    content: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: {
      name: string;
      url: string;
    };
  }>;
  totalResults: number;
}

export class RealTimeNewsService {
  private gnewsApiKey: string;
  private newsApiKey: string;
  private refreshInterval: number = 5 * 60 * 1000; // 5 minutes
  private isRefreshing: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.gnewsApiKey = import.meta.env.VITE_GNEWS_API_KEY;
    this.newsApiKey = import.meta.env.VITE_NEWS_API_KEY;
    
    if (!this.gnewsApiKey && !this.newsApiKey) {
      console.warn('No news API keys configured');
    }
  }

  /**
   * Fetch real-time news from multiple sources
   */
  async fetchRealTimeNews(category?: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const articles: NewsArticle[] = [];
      
      // Fetch from GNews API
      if (this.gnewsApiKey) {
        const gnewsArticles = await this.fetchFromGNews(category, limit);
        articles.push(...gnewsArticles);
      }
      
      // Fetch from NewsAPI
      if (this.newsApiKey) {
        const newsApiArticles = await this.fetchFromNewsAPI(category, limit);
        articles.push(...newsApiArticles);
      }
      
      // Remove duplicates based on URL
      const uniqueArticles = this.removeDuplicateArticles(articles);
      
      // Save to database
      await this.saveArticlesToDatabase(uniqueArticles);
      
      return uniqueArticles.slice(0, limit);
    } catch (error) {
      console.error('Error fetching real-time news:', error);
      throw new Error('Failed to fetch real-time news');
    }
  }

  /**
   * Fetch news from GNews API
   */
  private async fetchFromGNews(category?: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const categoryParam = category ? `&category=${category}` : '';
      const url = `https://gnews.io/api/v4/top-headlines?token=${this.gnewsApiKey}&lang=en&country=us&max=${limit}${categoryParam}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`GNews API error: ${response.status}`);
      }
      
      const data: GNewsResponse = await response.json();
      
      return data.articles.map(article => this.transformGNewsArticle(article));
    } catch (error) {
      console.error('Error fetching from GNews:', error);
      return [];
    }
  }

  /**
   * Fetch news from NewsAPI
   */
  private async fetchFromNewsAPI(category?: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const categoryParam = category ? `&category=${category}` : '';
      const url = `https://newsapi.org/v2/top-headlines?apiKey=${this.newsApiKey}&country=us&pageSize=${limit}${categoryParam}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }
      
      const data: NewsAPIResponse = await response.json();
      
      return data.articles.map(article => this.transformNewsAPIArticle(article));
    } catch (error) {
      console.error('Error fetching from NewsAPI:', error);
      return [];
    }
  }

  /**
   * Transform GNews article to our format
   */
  private transformGNewsArticle(article: GNewsResponse['articles'][0]): NewsArticle {
    const articleId = this.generateArticleId(article.url);
          return {
      id: articleId,
      article_id: articleId,
            title: article.title,
            description: article.description,
      content: article.content || article.description,
            url: article.url,
      image_url: article.image,
      source_name: article.source.name,
      source_url: article.source.url,
      published_at: new Date(article.publishedAt).toISOString(),
      city: 'Unknown',
      country: 'US',
      category: 'general',
      language: 'en',
      ai_summary: article.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };
  }

  /**
   * Transform NewsAPI article to our format
   */
  private transformNewsAPIArticle(article: NewsAPIResponse['articles'][0]): NewsArticle {
    const articleId = this.generateArticleId(article.url);
    return {
      id: articleId,
      article_id: articleId,
      title: article.title,
      description: article.description,
      content: article.content || article.description,
      url: article.url,
      image_url: article.urlToImage,
      source_name: article.source.name,
      source_url: article.source.url,
      published_at: new Date(article.publishedAt).toISOString(),
      city: 'Unknown',
      country: 'US',
      category: 'general',
      language: 'en',
      ai_summary: article.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };
  }

  /**
   * Generate unique article ID from URL
   */
  private generateArticleId(url: string): string {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  }

  /**
   * Remove duplicate articles based on URL
   */
  private removeDuplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      if (seen.has(article.url)) {
        return false;
      }
      seen.add(article.url);
      return true;
    });
  }

  /**
   * Save articles to database
   */
  private async saveArticlesToDatabase(articles: NewsArticle[]): Promise<void> {
    try {
      for (const article of articles) {
        // Check if article already exists
        const { data: existingArticle } = await supabase
          .from('news_cache')
          .select('article_id')
          .eq('article_id', article.article_id)
          .single();

        if (!existingArticle) {
          // Insert new article
          const { error } = await supabase
            .from('news_cache')
            .insert({
              article_id: article.article_id,
              title: article.title,
              description: article.description,
              content: article.content,
              url: article.url,
              image_url: article.image_url,
              source_name: article.source_name,
              source_url: article.source_url,
              published_at: article.published_at,
              city: article.city,
              country: article.country,
              category: article.category,
              language: article.language,
              ai_summary: article.ai_summary,
              created_at: article.created_at,
              updated_at: article.updated_at,
              expires_at: article.expires_at
            });

          if (error) {
            console.error('Error saving article:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error saving articles to database:', error);
    }
  }

  /**
   * Start real-time news updates
   */
  startRealTimeUpdates(callback: (articles: NewsArticle[]) => void): void {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;
    
    // Initial fetch
    this.fetchRealTimeNews().then(callback).catch(console.error);
    
    // Set up interval for updates
    const interval = setInterval(async () => {
      try {
        const articles = await this.fetchRealTimeNews();
        callback(articles);
      } catch (error) {
        console.error('Error in real-time update:', error);
      }
    }, this.refreshInterval);

    // Store interval ID for cleanup
    this.updateInterval = interval;
  }

  /**
   * Stop real-time news updates
   */
  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRefreshing = false;
  }

  /**
   * Get trending articles
   */
  async getTrendingArticles(limit: number = 10): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_cache')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapDatabaseToNewsArticle);
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      return [];
    }
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(category: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_cache')
        .select('*')
        .eq('category', category)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapDatabaseToNewsArticle);
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      return [];
    }
  }

  /**
   * Search articles
   */
  async searchArticles(query: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_cache')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapDatabaseToNewsArticle);
    } catch (error) {
      console.error('Error searching articles:', error);
      return [];
    }
  }

  /**
   * Map database record to NewsArticle
   */
  private mapDatabaseToNewsArticle(record: any): NewsArticle {
    return {
      id: record.article_id,
      article_id: record.article_id,
      title: record.title,
      description: record.description,
      content: record.content,
      url: record.url,
      image_url: record.image_url,
      source_name: record.source_name,
      source_url: record.source_url,
      published_at: record.published_at,
      city: record.city,
      country: record.country,
      category: record.category,
      language: record.language,
      ai_summary: record.ai_summary,
      created_at: record.created_at,
      updated_at: record.updated_at,
      expires_at: record.expires_at
    };
  }
}

export const realTimeNewsService = new RealTimeNewsService();
export default realTimeNewsService;