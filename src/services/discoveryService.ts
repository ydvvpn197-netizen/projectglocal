// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { TrendingContent } from '@/types/search';
import { TrendingAlgorithms } from '@/utils/trendingAlgorithms';
import { DiscoveryAlgorithms } from '@/utils/discoveryAlgorithms';

export class DiscoveryService {
  private static instance: DiscoveryService;

  static getInstance(): DiscoveryService {
    if (!DiscoveryService.instance) {
      DiscoveryService.instance = new DiscoveryService();
    }
    return DiscoveryService.instance;
  }

  async getTrendingContent(period: 'hour' | 'day' | 'week' | 'month' = 'day', limit: number = 20): Promise<TrendingContent[]> {
    try {
      const trending: TrendingContent[] = [];
      
      // Get trending events
      const trendingEvents = await this.getTrendingEvents(period, limit / 4);
      trending.push(...trendingEvents);
      
      // Get trending posts
      const trendingPosts = await this.getTrendingPosts(period, limit / 4);
      trending.push(...trendingPosts);
      
      // Get trending artists
      const trendingArtists = await this.getTrendingArtists(period, limit / 4);
      trending.push(...trendingArtists);
      
      // Get trending groups
      const trendingGroups = await this.getTrendingGroups(period, limit / 4);
      trending.push(...trendingGroups);

      // Use advanced trending algorithms for better ranking
      return TrendingAlgorithms.rankTrendingContent(trending, period).slice(0, limit);
    } catch (error) {
      console.error('Error fetching trending content:', error);
      return [];
    }
  }

  private async getTrendingEvents(period: string, limit: number): Promise<TrendingContent[]> {
    const timeFilter = this.getTimeFilter(period);
    
    const { data: events } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        category,
        event_date,
        location_name,
        location_city,
        location_state,
        image_url,
        max_attendees,
        created_at
      `)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .gte('created_at', timeFilter)
      .order('max_attendees', { ascending: false })
      .limit(limit);

    if (!events) return [];

    return events.map(event => ({
      id: event.id,
      type: 'event',
      title: event.title,
      description: event.description,
      image: event.image_url,
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        velocity: event.max_attendees || 0
      },
      trendingScore: this.calculateTrendingScore(event.max_attendees || 0, event.created_at),
      category: event.category,
      location: {
        name: event.location_name || '',
        city: event.location_city || '',
        state: event.location_state || ''
      },
      createdAt: event.created_at,
      trendingPeriod: period as 'hour' | 'day' | 'week' | 'month'
    }));
  }

  private async getTrendingPosts(period: string, limit: number): Promise<TrendingContent[]> {
    const timeFilter = this.getTimeFilter(period);
    
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        title,
        content,
        type,
        likes_count,
        comments_count,
        created_at
      `)
      .eq('status', 'active')
      .gte('created_at', timeFilter)
      .order('likes_count', { ascending: false })
      .limit(limit);

    if (!posts) return [];

    const results: TrendingContent[] = [];
    
    for (const post of posts) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', post.user_id)
        .single();

      if (profile) {
        const engagement = (post.likes_count || 0) + (post.comments_count || 0) * 2;
        
        results.push({
          id: post.id,
          type: 'post',
          title: post.title || 'Untitled Post',
          description: post.content.substring(0, 100) + '...',
          image: profile.avatar_url,
          engagement: {
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            shares: 0,
            views: 0,
            velocity: engagement
          },
          trendingScore: this.calculateTrendingScore(engagement, post.created_at),
          category: post.type || 'general',
          createdAt: post.created_at,
          trendingPeriod: period as 'hour' | 'day' | 'week' | 'month'
        });
      }
    }

    return results;
  }

  private async getTrendingArtists(period: string, limit: number): Promise<TrendingContent[]> {
    const timeFilter = this.getTimeFilter(period);
    
    // Get artists with most bookings in the period
    const { data: artists } = await supabase
      .from('artists')
      .select(`
        id,
        user_id,
        specialty,
        bio,
        hourly_rate_min,
        is_available
      `)
      .eq('is_available', true)
      .limit(limit);

    if (!artists) return [];

    const results: TrendingContent[] = [];
    
    for (const artist of artists) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, location_city, location_state')
        .eq('user_id', artist.user_id)
        .single();

      if (profile) {
        // Calculate engagement based on profile views and bookings
        const engagement = Math.floor(Math.random() * 100) + 10; // Placeholder
        
        results.push({
          id: artist.id,
          type: 'artist',
          title: profile.display_name || 'Anonymous',
          description: artist.bio,
          image: profile.avatar_url,
          engagement: {
            likes: 0,
            comments: 0,
            shares: 0,
            views: engagement,
            velocity: engagement
          },
          trendingScore: this.calculateTrendingScore(engagement, new Date().toISOString()),
          category: artist.specialty?.[0] || 'artist',
          location: {
            name: profile.location_city || '',
            city: profile.location_city || '',
            state: profile.location_state || ''
          },
          createdAt: new Date().toISOString(),
          trendingPeriod: period as 'hour' | 'day' | 'week' | 'month'
        });
      }
    }

    return results;
  }

  private async getTrendingGroups(period: string, limit: number): Promise<TrendingContent[]> {
    const timeFilter = this.getTimeFilter(period);
    
    const { data: groups } = await supabase
      .from('community_groups')
      .select(`
        id,
        name,
        description,
        category,
        created_at
      `)
      .gte('created_at', timeFilter)
      .limit(limit);

    if (!groups) return [];

    return groups.map(group => {
      const engagement = Math.floor(Math.random() * 50) + 5; // Placeholder
      
      return {
        id: group.id,
        type: 'group',
        title: group.name,
        description: group.description,
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0,
          views: engagement,
          velocity: engagement
        },
        trendingScore: this.calculateTrendingScore(engagement, group.created_at),
        category: group.category,
        createdAt: group.created_at,
        trendingPeriod: period as 'hour' | 'day' | 'week' | 'month'
      };
    });
  }

  private getTimeFilter(period: string): string {
    const now = new Date();
    let filterDate: Date;
    
    switch (period) {
      case 'hour':
        filterDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        filterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        filterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    return filterDate.toISOString();
  }

  private calculateTrendingScore(engagement: number, createdAt: string): number {
    const now = new Date();
    const created = new Date(createdAt);
    const hoursSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    // Apply time decay: newer content gets higher scores
    const timeDecay = Math.max(0.1, 1 - (hoursSinceCreation / 168)); // 168 hours = 1 week
    
    // Calculate velocity (engagement per hour)
    const velocity = engagement / Math.max(1, hoursSinceCreation);
    
    // Combine engagement, velocity, and time decay
    return (engagement * 0.4 + velocity * 0.4 + timeDecay * 0.2) * 100;
  }

  async getDiscoverContent(userId: string, limit: number = 20): Promise<TrendingContent[]> {
    try {
      // Get user preferences and behavior
      const userPreferences = await this.getUserPreferences(userId);
      
      // Get diverse content based on preferences
      const content = await this.getTrendingContent('day', limit * 2);
      
      // Filter and rank based on user preferences
      const personalizedContent = content
        .map(item => ({
          ...item,
          personalizationScore: this.calculatePersonalizationScore(item, userPreferences)
        }))
        .sort((a, b) => b.personalizationScore - a.personalizationScore)
        .slice(0, limit);

      return personalizedContent.map(({ personalizationScore, ...item }) => item);
    } catch (error) {
      console.error('Error fetching discover content:', error);
      return this.getTrendingContent('day', limit);
    }
  }

  private async getUserPreferences(userId: string): Promise<string[]> {
    // Get user's recent interactions to determine preferences
    const { data: interactions } = await supabase
      .from('posts')
      .select('type, category')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50);

    if (!interactions) return [];

    const preferences = new Set<string>();
    interactions.forEach(interaction => {
      if (interaction.type) preferences.add(interaction.type);
      if (interaction.category) preferences.add(interaction.category);
    });

    return Array.from(preferences);
  }

  private calculatePersonalizationScore(content: TrendingContent, userPreferences: string[]): number {
    if (userPreferences.length === 0) return 0.5; // Neutral score for users without preferences
    
    let score = 0;
    let matches = 0;
    
    // Check category match
    if (userPreferences.includes(content.category)) {
      score += 0.4;
      matches++;
    }
    
    // Check tag matches
    if (content.tags) {
      content.tags.forEach(tag => {
        if (userPreferences.includes(tag)) {
          score += 0.2;
          matches++;
        }
      });
    }
    
    // Normalize score based on number of matches
    return matches > 0 ? score / matches : 0.5;
  }
}

export const discoveryService = DiscoveryService.getInstance();
