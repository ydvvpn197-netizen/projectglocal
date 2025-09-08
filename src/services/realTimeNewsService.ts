import { supabase } from '@/integrations/supabase/client';
import { NewsArticle } from '@/types/news';

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  rssUrl?: string;
  apiEndpoint?: string;
  apiKey?: string;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  categories: string[];
  isActive: boolean;
  lastFetched?: string;
  fetchInterval: number; // in minutes
}

export interface NewsSummary {
  id: string;
  articleId: string;
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  createdAt: string;
}

export class RealTimeNewsService {
  private static instance: RealTimeNewsService;
  private newsSources: NewsSource[] = [];
  private fetchInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<string, (articles: NewsArticle[]) => void> = new Map();

  private constructor() {
    this.initializeNewsSources();
  }

  public static getInstance(): RealTimeNewsService {
    if (!RealTimeNewsService.instance) {
      RealTimeNewsService.instance = new RealTimeNewsService();
    }
    return RealTimeNewsService.instance;
  }

  private async initializeNewsSources() {
    // Initialize with local news sources
    this.newsSources = [
      {
        id: 'local-news-1',
        name: 'Local Community News',
        url: 'https://example-local-news.com',
        rssUrl: 'https://example-local-news.com/rss',
        location: {
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          coordinates: { lat: 28.6139, lng: 77.2090 }
        },
        categories: ['community', 'local', 'events'],
        isActive: true,
        fetchInterval: 15
      },
      {
        id: 'city-news-1',
        name: 'City Development News',
        url: 'https://example-city-news.com',
        apiEndpoint: 'https://api.example-city-news.com/news',
        location: {
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          coordinates: { lat: 28.6139, lng: 77.2090 }
        },
        categories: ['infrastructure', 'development', 'government'],
        isActive: true,
        fetchInterval: 30
      },
      {
        id: 'business-news-1',
        name: 'Local Business News',
        url: 'https://example-business-news.com',
        rssUrl: 'https://example-business-news.com/rss',
        location: {
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          coordinates: { lat: 28.6139, lng: 77.2090 }
        },
        categories: ['business', 'economy', 'startups'],
        isActive: true,
        fetchInterval: 60
      }
    ];

    // Load from database if available
    await this.loadNewsSourcesFromDB();
  }

  private async loadNewsSourcesFromDB() {
    try {
      const { data, error } = await supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      if (data && data.length > 0) {
        this.newsSources = data.map(source => ({
          id: source.id,
          name: source.name,
          url: source.api_endpoint,
          rssUrl: source.api_endpoint,
          apiEndpoint: source.api_endpoint,
          apiKey: source.api_key,
          location: {
            city: source.location_bias || 'Delhi',
            state: 'Delhi',
            country: 'India'
          },
          categories: source.categories || [],
          isActive: source.is_active,
          lastFetched: source.last_fetch_at,
          fetchInterval: 30
        }));
      }
    } catch (error) {
      console.error('Error loading news sources from DB:', error);
    }
  }

  public async startRealTimeFetching() {
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
    }

    // Fetch immediately
    await this.fetchAllNews();

    // Set up interval for regular fetching
    this.fetchInterval = setInterval(async () => {
      await this.fetchAllNews();
    }, 5 * 60 * 1000); // Fetch every 5 minutes

    // Set up real-time subscriptions
    this.setupRealTimeSubscriptions();
  }

  public stopRealTimeFetching() {
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
      this.fetchInterval = null;
    }
  }

  private async fetchAllNews() {
    const promises = this.newsSources
      .filter(source => source.isActive)
      .map(source => this.fetchNewsFromSource(source));

    try {
      const results = await Promise.allSettled(promises);
      const allArticles: NewsArticle[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allArticles.push(...result.value);
        } else {
          console.error(`Failed to fetch from source ${this.newsSources[index].name}:`, result.reason);
        }
      });

      if (allArticles.length > 0) {
        await this.processAndStoreArticles(allArticles);
        this.notifySubscribers(allArticles);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  }

  private async fetchNewsFromSource(source: NewsSource): Promise<NewsArticle[]> {
    try {
      // For demo purposes, generate mock articles
      // In production, you would fetch from actual RSS feeds or APIs
      const mockArticles: NewsArticle[] = [
        {
          id: `article-${Date.now()}-${Math.random()}`,
          title: `Breaking: ${source.name} - New Development in ${source.location.city}`,
          description: `Latest updates from ${source.location.city} regarding local developments and community news.`,
          content: `Full article content about recent developments in ${source.location.city}...`,
          url: `${source.url}/article-${Date.now()}`,
          image_url: `https://images.unsplash.com/photo-${1500000000000 + Math.random() * 1000000000}?w=400&h=300&fit=crop`,
          source: source.name,
          category: source.categories[0] || 'general',
          location: {
            city: source.location.city,
            state: source.location.state,
            country: source.location.country
          },
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          engagement: {
            likes: Math.floor(Math.random() * 50),
            comments: Math.floor(Math.random() * 20),
            shares: Math.floor(Math.random() * 10),
            views: Math.floor(Math.random() * 200)
          }
        }
      ];

      return mockArticles;
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
      return [];
    }
  }

  private async processAndStoreArticles(articles: NewsArticle[]) {
    try {
      // Generate summaries for articles
      const articlesWithSummaries = await Promise.all(
        articles.map(async (article) => {
          const summary = await this.generateSummary(article);
          return {
            ...article,
            summary: summary.summary,
            key_points: summary.keyPoints,
            sentiment: summary.sentiment
          };
        })
      );

      // Store in database
      const { error } = await supabase
        .from('news_articles')
        .upsert(
          articlesWithSummaries.map(article => ({
            id: article.id,
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            image_url: article.image_url,
            source: article.source,
            category: article.category,
            location_name: article.location.city,
            location_lat: article.location.coordinates?.lat,
            location_lng: article.location.coordinates?.lng,
            published_at: article.published_at,
            summary: article.summary,
            key_points: article.key_points,
            sentiment: article.sentiment,
            engagement_score: (article.engagement.likes + article.engagement.comments + article.engagement.shares) / 10
          })),
          { onConflict: 'id' }
        );

      if (error) throw error;

      // Update source last fetch time
      await this.updateSourceFetchTimes();

    } catch (error) {
      console.error('Error processing and storing articles:', error);
    }
  }

  private async generateSummary(article: NewsArticle): Promise<NewsSummary> {
    // In production, you would use an AI service like OpenAI, Claude, or a local model
    // For now, we'll create a simple summary
    const words = article.description.split(' ');
    const summary = words.slice(0, 20).join(' ') + '...';
    
    const keyPoints = [
      `Important development in ${article.location.city}`,
      'Community impact and local relevance',
      'Timeline and next steps'
    ];

    return {
      id: `summary-${article.id}`,
      articleId: article.id,
      summary,
      keyPoints,
      sentiment: 'neutral' as const,
      confidence: 0.8,
      createdAt: new Date().toISOString()
    };
  }

  private async updateSourceFetchTimes() {
    const updatePromises = this.newsSources.map(source =>
      supabase
        .from('news_sources')
        .update({ last_fetch_at: new Date().toISOString() })
        .eq('id', source.id)
    );

    await Promise.allSettled(updatePromises);
  }

  private setupRealTimeSubscriptions() {
    // Subscribe to new articles
    supabase
      .channel('news_articles_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'news_articles'
        },
        (payload) => {
          console.log('New article received:', payload);
          this.notifySubscribers([payload.new as NewsArticle]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'news_articles'
        },
        (payload) => {
          console.log('Article updated:', payload);
          this.notifySubscribers([payload.new as NewsArticle]);
        }
      )
      .subscribe();

    // Subscribe to article interactions
    supabase
      .channel('news_interactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_article_interactions'
        },
        (payload) => {
          console.log('Article interaction updated:', payload);
          this.updateArticleEngagement(payload.new as any);
        }
      )
      .subscribe();
  }

  private async updateArticleEngagement(interaction: any) {
    try {
      // Update engagement score
      await supabase.rpc('update_article_engagement_score', {
        article_uuid: interaction.article_id
      });
    } catch (error) {
      console.error('Error updating article engagement:', error);
    }
  }

  public subscribeToNews(callback: (articles: NewsArticle[]) => void): string {
    const subscriptionId = `news-${Date.now()}-${Math.random()}`;
    this.subscribers.set(subscriptionId, callback);
    return subscriptionId;
  }

  public unsubscribeFromNews(subscriptionId: string) {
    this.subscribers.delete(subscriptionId);
  }

  private notifySubscribers(articles: NewsArticle[]) {
    this.subscribers.forEach(callback => {
      try {
        callback(articles);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  public async getLatestArticles(limit: number = 20): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(article => ({
        id: article.id,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        image_url: article.image_url,
        source: article.source,
        category: article.category,
        location: {
          city: article.location_name,
          state: 'Delhi',
          country: 'India'
        },
        published_at: article.published_at,
        created_at: article.created_at,
        engagement: {
          likes: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 20),
          shares: Math.floor(Math.random() * 10),
          views: Math.floor(Math.random() * 200)
        }
      }));
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      return [];
    }
  }

  public async getArticlesByLocation(
    city: string,
    radiusKm: number = 50,
    limit: number = 20
  ): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_nearby_news_articles', {
          user_lat: 28.6139, // Delhi coordinates
          user_lng: 77.2090,
          radius_km: radiusKm,
          limit_count: limit
        });

      if (error) throw error;

      return (data || []).map(article => ({
        id: article.id,
        title: article.title,
        description: article.description,
        content: '',
        url: article.url,
        image_url: article.image_url,
        source: 'Local News',
        category: article.category,
        location: {
          city: article.location_name,
          state: 'Delhi',
          country: 'India'
        },
        published_at: article.published_at,
        created_at: new Date().toISOString(),
        engagement: {
          likes: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 20),
          shares: Math.floor(Math.random() * 10),
          views: Math.floor(Math.random() * 200)
        }
      }));
    } catch (error) {
      console.error('Error fetching articles by location:', error);
      return [];
    }
  }
}

export const realTimeNewsService = RealTimeNewsService.getInstance();
