
import { supabase } from '@/integrations/supabase/client';
import { NewsSource, NewsApiArticle } from '@/types/news';

export class LocalNewsApi {
  /**
   * Fetch local news from internal sources
   */
  async fetchNews(source: NewsSource): Promise<NewsApiArticle[]> {
    try {
      // Fetch local community content (posts, events, etc.) and convert to news format
      const localContent = await this.getLocalCommunityContent();
      
      return localContent.map(content => this.convertToNewsArticle(content, source));
    } catch (error) {
      console.error('Error fetching local news:', error);
      return [];
    }
  }

  /**
   * Get local community content
   */
  private async getLocalCommunityContent(): Promise<any[]> {
    try {
      // Fetch recent posts, events, and other community content
      const [posts, events, reviews] = await Promise.all([
        supabase
          .from('posts')
          .select('*, profiles(username, full_name)')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('events')
          .select('*, profiles(username, full_name)')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('reviews')
          .select('*, profiles(username, full_name)')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const content = [
        ...(posts.data || []).map(post => ({ ...post, type: 'post' })),
        ...(events.data || []).map(event => ({ ...event, type: 'event' })),
        ...(reviews.data || []).map(review => ({ ...review, type: 'review' }))
      ];

      return content.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching local community content:', error);
      return [];
    }
  }

  /**
   * Convert local content to news article format
   */
  private convertToNewsArticle(content: any, source: NewsSource): NewsApiArticle {
    const author = content.profiles?.full_name || content.profiles?.username || 'Local Community Member';
    
    let title = '';
    let description = '';
    let category = 'local';

    switch (content.type) {
      case 'post':
        title = content.title || 'Community Post';
        description = content.content?.substring(0, 200) + (content.content?.length > 200 ? '...' : '');
        category = 'community';
        break;
      case 'event':
        title = content.title || 'Local Event';
        description = content.description?.substring(0, 200) + (content.description?.length > 200 ? '...' : '');
        category = 'events';
        break;
      case 'review':
        title = `${content.business_name || 'Local Business'} Review`;
        description = content.content?.substring(0, 200) + (content.content?.length > 200 ? '...' : '');
        category = 'reviews';
        break;
      default:
        title = 'Local Community Update';
        description = 'New community content available';
    }

    return {
      source: { id: source.id, name: source.name },
      author,
      title,
      description,
      url: `/${content.type}/${content.id}`,
      urlToImage: content.image_url || null,
      publishedAt: content.created_at,
      content: content.content || content.description || ''
    };
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    contentCount?: number;
  }> {
    try {
      const content = await this.getLocalCommunityContent();
      
      return {
        success: true,
        message: `Successfully connected to local news source. Found ${content.length} items.`,
        contentCount: content.length
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
