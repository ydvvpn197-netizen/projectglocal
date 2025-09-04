import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Event, CommunityGroup, UserProfile } from '@/types/common';

// Enhanced API service with better error handling, caching, and real-time updates
export class EnhancedApiService {
  private static instance: EnhancedApiService;
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private subscriptions = new Map<string, unknown>();
  private toast = useToast();

  static getInstance(): EnhancedApiService {
    if (!EnhancedApiService.instance) {
      EnhancedApiService.instance = new EnhancedApiService();
    }
    return EnhancedApiService.instance;
  }

  // Generic fetch method with caching and error handling
  async fetch<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: {
      ttl?: number; // Time to live in milliseconds
      forceRefresh?: boolean;
      onError?: (error: unknown) => void;
    } = {}
  ): Promise<T> {
    const { ttl = 5 * 60 * 1000, forceRefresh = false, onError } = options; // Default 5 minutes

    // Check cache first
    if (!forceRefresh) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }
    }

    try {
      const data = await queryFn();
      
      // Cache the result
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
      });

      return data;
    } catch (error) {
      console.error(`API Error for key "${key}":`, error);
      
      // Try to return cached data if available
      const cached = this.cache.get(key);
      if (cached) {
        console.warn('Returning cached data due to API error');
        return cached.data;
      }

      // Call custom error handler or show toast
      if (onError) {
        onError(error);
      } else {
        this.showErrorToast('Failed to fetch data. Please try again.');
      }

      throw error;
    }
  }

  // Clear cache for specific key or all cache
  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Subscribe to real-time updates
  subscribe<T>(
    channel: string,
    event: string,
    callback: (payload: T) => void,
    filter?: string
  ) {
    const subscriptionKey = `${channel}:${event}:${filter || 'all'}`;
    
    // Unsubscribe if already exists
    this.unsubscribe(subscriptionKey);

    const subscription = supabase
      .channel(channel)
      .on('postgres_changes', {
        event,
        schema: 'public',
        table: channel,
        filter,
      }, callback)
      .subscribe();

    this.subscriptions.set(subscriptionKey, subscription);
    return subscriptionKey;
  }

  // Unsubscribe from real-time updates
  unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(key);
    }
  }

  // Unsubscribe from all real-time updates
  unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
  }

  // Enhanced error handling with toast notifications
  private showErrorToast(message: string) {
    // Note: This would need to be implemented with a proper toast context
    console.error(message);
  }

  private showSuccessToast(message: string) {
    console.log(message);
  }
}

// Event-related API methods
export class EventApiService extends EnhancedApiService {
  async getEvents(options: {
    category?: string;
    location?: string;
    date?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { category, location, date, limit = 20, offset = 0 } = options;
    
    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:users!events_organizer_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        attendees:event_attendees(count),
        category:categories(name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category_id', category);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (date) {
      query = query.gte('start_date', date);
    }

    return this.fetch(
      `events:${JSON.stringify(options)}`,
      async () => {
        const { data, error } = await query;
        if (error) throw error;
        return data;
      },
      { ttl: 2 * 60 * 1000 } // 2 minutes cache
    );
  }

  async getEventById(id: string) {
    return this.fetch(
      `event:${id}`,
      async () => {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            organizer:users!events_organizer_id_fkey(
              id,
              full_name,
              avatar_url,
              bio
            ),
            attendees:event_attendees(
              user:users(id, full_name, avatar_url)
            ),
            category:categories(name),
            reviews:event_reviews(
              id,
              rating,
              comment,
              created_at,
              user:users(id, full_name, avatar_url)
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      },
      { ttl: 5 * 60 * 1000 } // 5 minutes cache
    );
  }

  async createEvent(eventData: Partial<Event>) {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;

    // Clear related cache
    this.clearCache('events');

    this.showSuccessToast('Event created successfully!');
    return data;
  }

  async updateEvent(id: string, updates: Partial<Event>) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Clear related cache
    this.clearCache(`event:${id}`);
    this.clearCache('events');

    this.showSuccessToast('Event updated successfully!');
    return data;
  }

  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Clear related cache
    this.clearCache(`event:${id}`);
    this.clearCache('events');

    this.showSuccessToast('Event deleted successfully!');
  }

  async attendEvent(eventId: string, userId: string) {
    const { data, error } = await supabase
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: userId,
        status: 'confirmed'
      })
      .select()
      .single();

    if (error) throw error;

    // Clear related cache
    this.clearCache(`event:${eventId}`);
    this.clearCache('events');

    this.showSuccessToast('Successfully joined the event!');
    return data;
  }

  async leaveEvent(eventId: string, userId: string) {
    const { error } = await supabase
      .from('event_attendees')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;

    // Clear related cache
    this.clearCache(`event:${eventId}`);
    this.clearCache('events');

    this.showSuccessToast('Successfully left the event.');
  }
}

// Community-related API methods
export class CommunityApiService extends EnhancedApiService {
  async getCommunities(options: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { category, search, limit = 20, offset = 0 } = options;
    
    let query = supabase
      .from('community_groups')
      .select(`
        *,
        creator:users!community_groups_creator_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        members:group_members(count),
        category:categories(name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category_id', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    return this.fetch(
      `communities:${JSON.stringify(options)}`,
      async () => {
        const { data, error } = await query;
        if (error) throw error;
        return data;
      },
      { ttl: 3 * 60 * 1000 } // 3 minutes cache
    );
  }

  async getCommunityById(id: string) {
    return this.fetch(
      `community:${id}`,
      async () => {
        const { data, error } = await supabase
          .from('community_groups')
          .select(`
            *,
            creator:users!community_groups_creator_id_fkey(
              id,
              full_name,
              avatar_url,
              bio
            ),
            members:group_members(
              user:users(id, full_name, avatar_url),
              role,
              joined_at
            ),
            discussions:discussions(
              id,
              title,
              content,
              created_at,
              author:users(id, full_name, avatar_url),
              replies:discussion_replies(count)
            ),
            category:categories(name)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      },
      { ttl: 5 * 60 * 1000 } // 5 minutes cache
    );
  }

  async createCommunity(communityData: Partial<CommunityGroup>) {
    const { data, error } = await supabase
      .from('community_groups')
      .insert(communityData)
      .select()
      .single();

    if (error) throw error;

    // Clear related cache
    this.clearCache('communities');

    this.showSuccessToast('Community created successfully!');
    return data;
  }

  async joinCommunity(groupId: string, userId: string) {
    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        role: 'member'
      })
      .select()
      .single();

    if (error) throw error;

    // Clear related cache
    this.clearCache(`community:${groupId}`);
    this.clearCache('communities');

    this.showSuccessToast('Successfully joined the community!');
    return data;
  }

  async leaveCommunity(groupId: string, userId: string) {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;

    // Clear related cache
    this.clearCache(`community:${groupId}`);
    this.clearCache('communities');

    this.showSuccessToast('Successfully left the community.');
  }
}

// User-related API methods
export class UserApiService extends EnhancedApiService {
  async getUserProfile(userId: string) {
    return this.fetch(
      `user:${userId}`,
      async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select(`
            *,
            user:users(
              id,
              email,
              full_name,
              avatar_url,
              created_at
            ),
            events_attending:event_attendees(
              event:events(id, title, start_date, location)
            ),
            events_created:events(
              id,
              title,
              start_date,
              location,
              attendees:event_attendees(count)
            ),
            communities:group_members(
              group:community_groups(id, name, description)
            )
          `)
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        return data;
      },
      { ttl: 10 * 60 * 1000 } // 10 minutes cache
    );
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Clear related cache
    this.clearCache(`user:${userId}`);

    this.showSuccessToast('Profile updated successfully!');
    return data;
  }

  async followUser(followerId: string, followingId: string) {
    const { data, error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: followerId,
        following_id: followingId
      })
      .select()
      .single();

    if (error) throw error;

    this.showSuccessToast('Successfully followed user!');
    return data;
  }

  async unfollowUser(followerId: string, followingId: string) {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;

    this.showSuccessToast('Successfully unfollowed user.');
  }
}

// Export singleton instances
export const eventApi = EventApiService.getInstance();
export const communityApi = CommunityApiService.getInstance();
export const userApi = UserApiService.getInstance();
export const apiService = EnhancedApiService.getInstance();
