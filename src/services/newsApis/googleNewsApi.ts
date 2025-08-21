import { NewsSource, NewsApiArticle } from '@/types/news';

export class GoogleNewsApi {
  private baseUrl = 'https://gnews.io/api/v4';
  private apiKey = 'edcc8605b836ce982b924ab1bbe45056'; // GNews API Key

  /**
   * Fetch news from Google News via GNews API
   */
  async fetchNews(source: NewsSource): Promise<NewsApiArticle[]> {
    try {
      // Get location from source configuration or use default
      const location = source.location_filter || 'world';
      const category = source.category_filter || 'general';
      
      // Build API URL with location and category filters
      const url = `${this.baseUrl}/top-headlines?` + 
        `country=${location}&` +
        `category=${category}&` +
        `max=20&` +
        `apikey=${this.apiKey}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`GNews API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(`GNews API error: ${data.message}`);
      }

      return this.transformArticles(data.articles, source);
    } catch (error) {
      console.error('Error fetching news from Google News:', error);
      
      // Fallback to mock data if API fails
      console.warn('Falling back to mock data due to API error');
      return this.getMockArticles(source);
    }
  }

  /**
   * Fetch location-specific news
   */
  async fetchLocationNews(
    lat: number, 
    lng: number, 
    radius: number = 50,
    source: NewsSource
  ): Promise<NewsApiArticle[]> {
    try {
      // Get location name from coordinates for better search
      const locationName = await this.getLocationName(lat, lng);
      
      // Search for news in the specific location
      const url = `${this.baseUrl}/search?` +
        `q=${encodeURIComponent(locationName)}&` +
        `max=20&` +
        `sortby=publishedAt&` +
        `apikey=${this.apiKey}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`GNews API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(`GNews API error: ${data.message}`);
      }

      // Filter articles by relevance to location
      const locationArticles = data.articles.filter((article: any) => 
        this.isLocationRelevant(article, locationName, lat, lng, radius)
      );

      return this.transformArticles(locationArticles, source);
    } catch (error) {
      console.error('Error fetching location news:', error);
      return this.getMockArticles(source);
    }
  }

  /**
   * Transform GNews API response to our format
   */
  private transformArticles(articles: any[], source: NewsSource): NewsApiArticle[] {
    return articles.map(article => ({
      source: { 
        id: source.id, 
        name: article.source?.name || source.name 
      },
      author: article.author || 'Unknown',
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.image || article.urlToImage,
      publishedAt: article.publishedAt,
      content: article.content,
      // Add location metadata if available
      location: article.location || null
    }));
  }

  /**
   * Check if article is relevant to the specified location
   */
  private isLocationRelevant(
    article: any, 
    locationName: string, 
    lat: number, 
    lng: number, 
    radius: number
  ): boolean {
    const text = `${article.title} ${article.description} ${article.content}`.toLowerCase();
    const locationLower = locationName.toLowerCase();
    
    // Check if location name appears in article
    if (text.includes(locationLower)) {
      return true;
    }

    // Check for nearby city names or landmarks
    const nearbyTerms = this.getNearbyLocationTerms(lat, lng);
    return nearbyTerms.some(term => text.includes(term.toLowerCase()));
  }

  /**
   * Get location name from coordinates using reverse geocoding
   */
  private async getLocationName(lat: number, lng: number): Promise<string> {
    try {
      // Use a simple reverse geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.display_name.split(',')[0]; // Get city name
      }
    } catch (error) {
      console.error('Error getting location name:', error);
    }
    
    return 'local area';
  }

  /**
   * Get nearby location terms for better matching
   */
  private getNearbyLocationTerms(lat: number, lng: number): string[] {
    // This would ideally use a geocoding service to get nearby cities
    // For now, return common terms
    return ['local', 'community', 'area', 'region', 'city', 'town'];
  }

  /**
   * Get mock articles for development/fallback
   */
  private getMockArticles(source: NewsSource): NewsApiArticle[] {
    const mockArticles: NewsApiArticle[] = [
      {
        source: { id: source.id, name: source.name },
        author: 'Local Reporter',
        title: 'Community Development Project Approved',
        description: 'Local council approves new mixed-use development that will include affordable housing, retail spaces, and a community center.',
        url: 'https://example.com/local-event',
        urlToImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=200&fit=crop',
        publishedAt: new Date().toISOString(),
        content: 'Local community event details...'
      },
      {
        source: { id: source.id, name: source.name },
        author: 'Community News',
        title: 'Farmers Market Returns for Summer Season',
        description: 'The popular farmers market will return next weekend featuring over 50 local vendors, live music, and family activities.',
        url: 'https://example.com/farmers-market',
        urlToImage: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        content: 'Farmers market details...'
      },
      {
        source: { id: source.id, name: source.name },
        author: 'Arts & Culture',
        title: 'Local Artists Collaborate for Public Mural Project',
        description: 'Five local artists have been selected to create a new mural celebrating community diversity and local history.',
        url: 'https://example.com/mural-project',
        urlToImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        content: 'Mural project details...'
      }
    ];

    return mockArticles;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const url = `${this.baseUrl}/top-headlines?country=us&max=1&apikey=${this.apiKey}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'error') {
          return {
            success: false,
            message: `GNews API error: ${data.message}`
          };
        }
        return {
          success: true,
          message: 'GNews API connection successful'
        };
      } else {
        return {
          success: false,
          message: `HTTP error: ${response.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error}`
      };
    }
  }
}
