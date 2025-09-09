import { supabase } from '../integrations/supabase/client';
import { NewsArticle, NewsSource, NewsCategory } from '../types/news';

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

class RealTimeNewsService {
  private gnewsApiKey: string;
  private newsApiKey: string;
  private refreshInterval: number = 5 * 60 * 1000; // 5 minutes
  private isRefreshing: boolean = false;

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
    return {
      id: this.generateArticleId(article.url),
      title: article.title,
      content: article.content || article.description,
      summary: article.description,
      url: article.url,
      image_url: article.image,
      published_at: new Date(article.publishedAt).toISOString(),
      source_id: this.getOrCreateSourceId(article.source.name, article.source.url),
      category_id: this.getCategoryId('general'),
      author: article.source.name,
      language: 'en',
      country: 'us',
      is_breaking: false,
      is_featured: false,
      view_count: 0,
      like_count: 0,
      share_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Transform NewsAPI article to our format
   */
  private transformNewsAPIArticle(article: NewsAPIResponse['articles'][0]): NewsArticle {
    return {
      id: this.generateArticleId(article.url),
      title: article.title,
      content: article.content || article.description,
      summary: article.description,
      url: article.url,
      image_url: article.urlToImage,
      published_at: new Date(article.publishedAt).toISOString(),
      source_id: this.getOrCreateSourceId(article.source.name, article.source.url),
      category_id: this.getCategoryId('general'),
      author: article.source.name,
      language: 'en',
      country: 'us',
      is_breaking: false,
      is_featured: false,
      view_count: 0,
      like_count: 0,
      share_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Generate unique article ID from URL
   */
  private generateArticleId(url: string): string {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  }

  /**
   * Get or create source ID
   */
  private async getOrCreateSourceId(name: string, url: string): Promise<string> {
    try {
      // Check if source exists
      const { data: existingSource } = await supabase
        .from('news_sources')
        .select('id')
        .eq('name', name)
        .single();

      if (existingSource) {
        return existingSource.id;
      }

      // Create new source
      const { data: newSource, error } = await supabase
        .from('news_sources')
        .insert({
          name,
          url,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating news source:', error);
        return 'default-source';
      }

      return newSource.id;
    } catch (error) {
      console.error('Error getting/creating source:', error);
      return 'default-source';
    }
  }

  /**
   * Get category ID
   */
  private async getCategoryId(categoryName: string): Promise<string> {
    try {
      const { data: category } = await supabase
        .from('news_categories')
        .select('id')
        .eq('name', categoryName)
        .single();

      return category?.id || 'general';
    } catch (error) {
      console.error('Error getting category:', error);
      return 'general';
    }
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
          .from('news_articles')
          .select('id')
          .eq('url', article.url)
          .single();

        if (!existingArticle) {
          // Insert new article
      const { error } = await supabase
        .from('news_articles')
            .insert(article);

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
    (this as any).updateInterval = interval;
  }

  /**
   * Stop real-time news updates
   */
  stopRealTimeUpdates(): void {
    if ((this as any).updateInterval) {
      clearInterval((this as any).updateInterval);
      (this as any).updateInterval = null;
    }
    this.isRefreshing = false;
  }

  /**
   * Get trending articles
   */
  async getTrendingArticles(limit: number = 10): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          *,
          news_sources(name, url),
          news_categories(name)
        `)
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
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
        .from('news_articles')
        .select(`
          *,
          news_sources(name, url),
          news_categories(name)
        `)
        .eq('news_categories.name', category)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
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
        .from('news_articles')
        .select(`
          *,
          news_sources(name, url),
          news_categories(name)
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching articles:', error);
      return [];
    }
  }
}

export const realTimeNewsService = new RealTimeNewsService();
export default realTimeNewsService;
