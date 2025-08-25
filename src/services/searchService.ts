// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { SearchQuery, SearchResult, SearchFilter } from '@/types/search';
import { SearchAlgorithms } from '@/utils/searchAlgorithms';

export class SearchService {
  private static instance: SearchService;

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    try {
      // Search across multiple content types
      const searchPromises = [];
      
      if (query.type === 'all' || query.type === 'artist') {
        searchPromises.push(this.searchArtists(query));
      }
      
      if (query.type === 'all' || query.type === 'event') {
        searchPromises.push(this.searchEvents(query));
      }
      
      if (query.type === 'all' || query.type === 'post') {
        searchPromises.push(this.searchPosts(query));
      }
      
      if (query.type === 'all' || query.type === 'group') {
        searchPromises.push(this.searchGroups(query));
      }

      const searchResults = await Promise.all(searchPromises);
      
      // Combine and sort results
      searchResults.forEach(resultSet => {
        results.push(...resultSet);
      });

      // Apply relevance scoring and sorting
      const scoredResults = this.scoreAndSortResults(results, query);
      
      // Apply pagination
      const startIndex = (query.page || 0) * (query.limit || 20);
      const endIndex = startIndex + (query.limit || 20);
      
      return scoredResults.slice(startIndex, endIndex);
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to perform search');
    }
  }

  private async searchArtists(query: SearchQuery): Promise<SearchResult[]> {
    const { data: artists } = await supabase
      .from('artists')
      .select(`
        id,
        user_id,
        specialty,
        hourly_rate_min,
        hourly_rate_max,
        bio,
        is_available
      `)
      .or(`specialty.cs.{${query.query}},bio.ilike.%${query.query}%`)
      .eq('is_available', true);

    if (!artists) return [];

    const results: SearchResult[] = [];
    
    for (const artist of artists) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, location_city, location_state, latitude, longitude')
        .eq('user_id', artist.user_id)
        .single();

      if (profile) {
        const distance = query.location ? this.calculateDistance(
          query.location.latitude,
          query.location.longitude,
          profile.latitude,
          profile.longitude
        ) : undefined;

        if (!query.location || (distance && distance <= query.location.radius)) {
          results.push({
            id: artist.id,
            type: 'artist',
            title: profile.display_name || 'Anonymous',
            description: artist.bio,
            image: profile.avatar_url,
            price: artist.hourly_rate_min,
            location: {
              name: profile.location_city || '',
              city: profile.location_city || '',
              state: profile.location_state || '',
              latitude: profile.latitude,
              longitude: profile.longitude
            },
            distance,
            tags: artist.specialty,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    return results;
  }

  private async searchEvents(query: SearchQuery): Promise<SearchResult[]> {
    let eventsQuery = supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        event_date,
        event_time,
        location_name,
        location_city,
        location_state,
        category,
        price,
        image_url,
        tags,
        created_at
      `)
      .or(`title.ilike.%${query.query}%,description.ilike.%${query.query}%,category.ilike.%${query.query}%`);

    if (query.dateRange) {
      eventsQuery = eventsQuery
        .gte('event_date', query.dateRange.start)
        .lte('event_date', query.dateRange.end);
    } else {
      eventsQuery = eventsQuery.gte('event_date', new Date().toISOString().split('T')[0]);
    }

    const { data: events } = await eventsQuery;

    if (!events) return [];

    return events.map(event => ({
      id: event.id,
      type: 'event',
      title: event.title,
      description: event.description,
      image: event.image_url,
      price: event.price,
      location: {
        name: event.location_name || '',
        city: event.location_city || '',
        state: event.location_state || '',
      },
      date: `${event.event_date} ${event.event_time}`,
      tags: event.tags,
      createdAt: event.created_at,
      updatedAt: event.created_at
    }));
  }

  private async searchPosts(query: SearchQuery): Promise<SearchResult[]> {
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
      .or(`title.ilike.%${query.query}%,content.ilike.%${query.query}%`)
      .eq('status', 'active');

    if (!posts) return [];

    const results: SearchResult[] = [];
    
    for (const post of posts) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', post.user_id)
        .single();

      if (profile) {
        results.push({
          id: post.id,
          type: 'post',
          title: post.title || 'Untitled Post',
          description: post.content.substring(0, 100) + '...',
          image: profile.avatar_url,
          date: post.created_at,
          tags: post.type ? [post.type] : [],
          engagement: {
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            shares: 0,
            views: 0
          },
          createdAt: post.created_at,
          updatedAt: post.created_at
        });
      }
    }

    return results;
  }

  private async searchGroups(query: SearchQuery): Promise<SearchResult[]> {
    const { data: groups } = await supabase
      .from('community_groups')
      .select(`
        id,
        name,
        description,
        category,
        created_at
      `)
      .or(`name.ilike.%${query.query}%,description.ilike.%${query.query}%,category.ilike.%${query.query}%`);

    if (!groups) return [];

    return groups.map(group => ({
      id: group.id,
      type: 'group',
      title: group.name,
      description: group.description,
      date: group.created_at,
      tags: group.category ? [group.category] : [],
      createdAt: group.created_at,
      updatedAt: group.created_at
    }));
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    return SearchAlgorithms.calculateDistance(lat1, lon1, lat2, lon2);
  }

  private scoreAndSortResults(results: SearchResult[], query: SearchQuery): SearchResult[] {
    // Use the advanced search algorithms for better scoring and ranking
    return SearchAlgorithms.rankSearchResults(results, query);
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query.trim()) return [];
    
    // Get recent search history
    const { data: history } = await supabase
      .from('search_history')
      .select('query')
      .ilike('query', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(5);

    const searchHistory = history ? history.map(item => item.query) : [];
    
    // Use the advanced search algorithms for better suggestions
    return SearchAlgorithms.generateSearchSuggestions(query, searchHistory);
  }

  async saveSearchHistory(userId: string, query: string, filters: SearchFilter, resultsCount: number): Promise<void> {
    await supabase
      .from('search_history')
      .insert({
        user_id: userId,
        query,
        filters: JSON.stringify(filters),
        results_count: resultsCount,
        created_at: new Date().toISOString()
      });
  }
}

export const searchService = SearchService.getInstance();
