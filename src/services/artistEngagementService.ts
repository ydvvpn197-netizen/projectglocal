import { supabase } from '@/integrations/supabase/client';

export interface ArtistFollower {
  id: string;
  artist_id: string;
  follower_id: string;
  created_at: string;
  follower_name?: string;
  follower_avatar?: string;
}

export interface ArtistEngagement {
  id: string;
  artist_id: string;
  follower_id: string;
  type: 'follow' | 'unfollow' | 'like' | 'comment' | 'share' | 'book';
  content_id?: string;
  content_type?: 'post' | 'service' | 'event';
  created_at: string;
}

export interface ArtistStats {
  total_followers: number;
  total_posts: number;
  total_services: number;
  total_events: number;
  total_bookings: number;
  engagement_rate: number;
  recent_followers: ArtistFollower[];
}

export interface ProfileData {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location_city?: string;
}

export interface ArtistFollowerWithProfile {
  id: string;
  artist_id: string;
  follower_id: string;
  created_at: string;
  profiles?: ProfileData;
}

export interface FollowedArtist {
  id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location_city?: string;
  followed_at: string;
}

export interface FollowWithProfile {
  artist_id: string;
  created_at: string;
  profiles?: ProfileData;
}

export interface TrendingArtist {
  id: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location_city?: string;
  follower_count: number;
}

export class ArtistEngagementService {
  /**
   * Follow an artist
   */
  static async followArtist(artistId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Check if already following
      const { data: existingFollow } = await supabase
        .from('artist_followers')
        .select('id')
        .eq('artist_id', artistId)
        .eq('follower_id', user.id)
        .single();

      if (existingFollow) {
        return { success: false, error: 'Already following this artist' };
      }

      // Add follow
      const { error } = await supabase
        .from('artist_followers')
        .insert({
          artist_id: artistId,
          follower_id: user.id
        });

      if (error) throw error;

      // Record engagement
      await this.recordEngagement(artistId, 'follow');

      return { success: true };
    } catch (error: unknown) {
      console.error('Error following artist:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Unfollow an artist
   */
  static async unfollowArtist(artistId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('artist_followers')
        .delete()
        .eq('artist_id', artistId)
        .eq('follower_id', user.id);

      if (error) throw error;

      // Record engagement
      await this.recordEngagement(artistId, 'unfollow');

      return { success: true };
    } catch (error: unknown) {
      console.error('Error unfollowing artist:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Check if user is following an artist
   */
  static async isFollowingArtist(artistId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('artist_followers')
        .select('id')
        .eq('artist_id', artistId)
        .eq('follower_id', user.id)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get artist followers
   */
  static async getArtistFollowers(artistId: string, limit: number = 20, offset: number = 0): Promise<{ followers: ArtistFollower[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('artist_followers')
        .select(`
          *,
          profiles!artist_followers_follower_id_fkey(display_name, avatar_url)
        `)
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const followers: ArtistFollower[] = (data || []).map((follower: ArtistFollowerWithProfile) => ({
        id: follower.id,
        artist_id: follower.artist_id,
        follower_id: follower.follower_id,
        created_at: follower.created_at,
        follower_name: follower.profiles?.display_name,
        follower_avatar: follower.profiles?.avatar_url
      }));

      return { followers, error: null };
    } catch (error: unknown) {
      console.error('Error getting artist followers:', error);
      return { followers: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get artists followed by user
   */
  static async getFollowedArtists(userId: string, limit: number = 20, offset: number = 0): Promise<{ artists: FollowedArtist[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('artist_followers')
        .select(`
          *,
          profiles!artist_followers_artist_id_fkey(display_name, avatar_url, bio, location_city)
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const artists = (data || []).map((follow: FollowWithProfile) => ({
        id: follow.artist_id,
        display_name: follow.profiles?.display_name,
        avatar_url: follow.profiles?.avatar_url,
        bio: follow.profiles?.bio,
        location_city: follow.profiles?.location_city,
        followed_at: follow.created_at
      }));

      return { artists, error: null };
    } catch (error: unknown) {
      console.error('Error getting followed artists:', error);
      return { artists: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get artist statistics
   */
  static async getArtistStats(artistId: string): Promise<{ stats: ArtistStats; error: string | null }> {
    try {
      // Get follower count
      const { count: followerCount } = await supabase
        .from('artist_followers')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', artistId);

      // Get posts count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', artistId)
        .eq('type', 'post');

      // Get services count
      const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', artistId);

      // Get events count
      const { count: eventsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', artistId)
        .eq('type', 'event');

      // Get bookings count
      const { count: bookingsCount } = await supabase
        .from('service_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', artistId);

      // Get recent followers
      const { data: recentFollowers } = await supabase
        .from('artist_followers')
        .select(`
          *,
          profiles!artist_followers_follower_id_fkey(display_name, avatar_url)
        `)
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false })
        .limit(5);

      const stats: ArtistStats = {
        total_followers: followerCount || 0,
        total_posts: postsCount || 0,
        total_services: servicesCount || 0,
        total_events: eventsCount || 0,
        total_bookings: bookingsCount || 0,
        engagement_rate: 0, // Calculate based on interactions
        recent_followers: (recentFollowers || []).map((follower: ArtistFollowerWithProfile) => ({
          id: follower.id,
          artist_id: follower.artist_id,
          follower_id: follower.follower_id,
          created_at: follower.created_at,
          follower_name: follower.profiles?.display_name,
          follower_avatar: follower.profiles?.avatar_url
        }))
      };

      return { stats, error: null };
    } catch (error: unknown) {
      console.error('Error getting artist stats:', error);
      const emptyStats: ArtistStats = {
        total_followers: 0,
        total_posts: 0,
        total_services: 0,
        total_events: 0,
        total_bookings: 0,
        engagement_rate: 0,
        recent_followers: []
      };
      return { stats: emptyStats, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Record engagement activity
   */
  static async recordEngagement(artistId: string, type: string, contentId?: string, contentType?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('artist_engagements')
        .insert({
          artist_id: artistId,
          follower_id: user.id,
          type,
          content_id: contentId,
          content_type: contentType
        });
    } catch (error) {
      console.error('Error recording engagement:', error);
    }
  }

  /**
   * Get artist engagement history
   */
  static async getArtistEngagements(artistId: string, limit: number = 50): Promise<{ engagements: ArtistEngagement[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('artist_engagements')
        .select('*')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { engagements: data || [], error: null };
    } catch (error: unknown) {
      console.error('Error getting artist engagements:', error);
      return { engagements: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get trending artists
   */
  static async getTrendingArtists(limit: number = 10): Promise<{ artists: TrendingArtist[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('artist_followers')
        .select(`
          artist_id,
          profiles!artist_followers_artist_id_fkey(display_name, avatar_url, bio, location_city)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Group by artist and count followers
      const artistCounts = (data || []).reduce((acc: Record<string, TrendingArtist>, follow: FollowWithProfile) => {
        const artistId = follow.artist_id;
        if (!acc[artistId]) {
          acc[artistId] = {
            id: artistId,
            display_name: follow.profiles?.display_name,
            avatar_url: follow.profiles?.avatar_url,
            bio: follow.profiles?.bio,
            location_city: follow.profiles?.location_city,
            follower_count: 0
          };
        }
        acc[artistId].follower_count++;
        return acc;
      }, {});

      const artists = Object.values(artistCounts).sort((a: TrendingArtist, b: TrendingArtist) => b.follower_count - a.follower_count);

      return { artists, error: null };
    } catch (error: unknown) {
      console.error('Error getting trending artists:', error);
      return { artists: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Search artists
   */
  static async searchArtists(query: string, limit: number = 20): Promise<{ artists: ProfileData[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`display_name.ilike.%${query}%, bio.ilike.%${query}%, location_city.ilike.%${query}%`)
        .eq('is_premium', true) // Only show premium users (artists)
        .limit(limit);

      if (error) throw error;

      return { artists: data || [], error: null };
    } catch (error: unknown) {
      console.error('Error searching artists:', error);
      return { artists: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
