import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  latitude: number | null;
  longitude: number | null;
  is_verified: boolean | null;
  user_type: string | null;
  created_at: string;
  updated_at: string;
  // Additional fields for artists
  artist_skills?: string[] | null;
  hourly_rate_min?: number | null;
  hourly_rate_max?: number | null;
  portfolio_urls?: string[] | null;
  real_time_location_enabled?: boolean | null;
}

export interface ProfileUpdateData {
  display_name?: string;
  bio?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  avatar_url?: string;
  artist_skills?: string[];
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  portfolio_urls?: string[];
  real_time_location_enabled?: boolean;
}

export interface UserStats {
  eventsAttended: number;
  eventsCreated: number;
  communitiesJoined: number;
  postsCreated: number;
  followers: number;
  following: number;
  points: number;
}

export interface UserBadge {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface UserPost {
  id: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  date: string;
  image?: string;
}

export interface UserBooking {
  id: string;
  eventTitle: string;
  eventImage: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  tickets: number;
}

export interface UserCommunity {
  id: string;
  name: string;
  image: string;
  members: number;
  role: 'admin' | 'moderator' | 'member';
  joinedDate: string;
}

class UserProfileService {

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updateData: ProfileUpdateData): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: unknown) {
      console.error('Error in updateUserProfile:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Fetch events created by user
      const { data: eventsCreated } = await supabase
        .from('events')
        .select('id')
        .eq('user_id', userId);

      // Fetch posts created by user
      const { data: postsCreated } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', userId);

      // Fetch followers count
      const { data: followers } = await supabase
        .from('follows')
        .select('id')
        .eq('followed_id', userId);

      // Fetch following count
      const { data: following } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', userId);

      // Calculate points (simplified calculation)
      const points = (eventsCreated?.length || 0) * 10 + (postsCreated?.length || 0) * 5 + (followers?.length || 0) * 2;

      return {
        eventsAttended: 0, // This would need a separate table to track
        eventsCreated: eventsCreated?.length || 0,
        communitiesJoined: 0, // This would need a separate table to track
        postsCreated: postsCreated?.length || 0,
        followers: followers?.length || 0,
        following: following?.length || 0,
        points
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        eventsAttended: 0,
        eventsCreated: 0,
        communitiesJoined: 0,
        postsCreated: 0,
        followers: 0,
        following: 0,
        points: 0
      };
    }
  }

  async getUserPosts(userId: string): Promise<UserPost[]> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          likes_count,
          comments_count,
          created_at,
          image_url
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching user posts:', error);
        return [];
      }

      return data?.map(post => ({
        id: post.id,
        title: post.title || 'Untitled Post',
        content: post.content,
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        date: this.formatRelativeDate(post.created_at),
        image: post.image_url
      })) || [];
    } catch (error) {
      console.error('Error in getUserPosts:', error);
      return [];
    }
  }

  async getUserBookings(userId: string): Promise<UserBooking[]> {
    try {
      // Get events that the user is attending
      const { data: eventAttendees, error: attendeesError } = await supabase
        .from('event_attendees')
        .select(`
          id,
          status,
          events (
            id,
            title,
            image_url,
            event_date,
            event_time,
            location_name,
            location_city,
            location_state,
            location_country
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'attending')
        .order('created_at', { ascending: false })
        .limit(10);

      if (attendeesError) {
        console.error('Error fetching event attendees:', attendeesError);
        return [];
      }

      // Get artist bookings
      const { data: artistBookings, error: artistBookingsError } = await supabase
        .from('artist_bookings')
        .select(`
          id,
          event_date,
          event_location,
          event_description,
          status,
          artists (
            id,
            specialty,
            bio
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (artistBookingsError) {
        console.error('Error fetching artist bookings:', artistBookingsError);
      }

      const bookings: UserBooking[] = [];

      // Add event attendees
      eventAttendees?.forEach(attendee => {
        if (attendee.events) {
          const location = [
            attendee.events.location_city,
            attendee.events.location_state,
            attendee.events.location_country
          ].filter(Boolean).join(', ') || attendee.events.location_name;

          bookings.push({
            id: attendee.id,
            eventTitle: attendee.events.title,
            eventImage: attendee.events.image_url || '',
            date: this.formatDate(attendee.events.event_date),
            time: attendee.events.event_time,
            location,
            status: attendee.status === 'attending' ? 'confirmed' : 'pending',
            tickets: 1
          });
        }
      });

      // Add artist bookings
      artistBookings?.forEach(booking => {
        const artistName = booking.artists?.specialty?.[0] || 'Artist';
        bookings.push({
          id: booking.id,
          eventTitle: `${artistName} Booking`,
          eventImage: '', // No image for artist bookings
          date: this.formatDate(booking.event_date),
          time: 'TBD',
          location: booking.event_location,
          status: booking.status as 'confirmed' | 'pending' | 'cancelled',
          tickets: 1
        });
      });

      // Sort by date and limit to 10
      return bookings
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Error in getUserBookings:', error);
      return [];
    }
  }

  async getUserCommunities(userId: string): Promise<UserCommunity[]> {
    try {
      // This would need a proper communities table and user_communities junction table
      // For now, return mock data
      return [
        {
          id: '1',
          name: 'Local Artists Collective',
          image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop',
          members: 234,
          role: 'admin' as const,
          joinedDate: 'Jan 2024'
        },
        {
          id: '2',
          name: 'Food Lovers United',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop',
          members: 456,
          role: 'member' as const,
          joinedDate: 'Feb 2024'
        }
      ];
    } catch (error) {
      console.error('Error in getUserCommunities:', error);
      return [];
    }
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      // This would need a proper badges system
      // For now, return mock data based on user stats
      const stats = await this.getUserStats(userId);
      
      const badges: UserBadge[] = [];
      
      if (stats.eventsCreated >= 5) {
        badges.push({
          id: 1,
          name: 'Community Leader',
          icon: 'Crown',
          color: 'bg-yellow-500',
          description: 'Created 5+ successful events'
        });
      }
      
      if (stats.postsCreated >= 10) {
        badges.push({
          id: 2,
          name: 'Top Contributor',
          icon: 'Trophy',
          color: 'bg-orange-500',
          description: 'Top 10% contributor'
        });
      }
      
      if (stats.followers >= 100) {
        badges.push({
          id: 3,
          name: 'Social Butterfly',
          icon: 'Users',
          color: 'bg-pink-500',
          description: '100+ followers'
        });
      }
      
      if (stats.points >= 1000) {
        badges.push({
          id: 4,
          name: 'Point Collector',
          icon: 'Star',
          color: 'bg-purple-500',
          description: 'Earned 1000+ points'
        });
      }
      
      return badges;
    } catch (error) {
      console.error('Error in getUserBadges:', error);
      return [];
    }
  }

  async uploadAvatar(userId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return { success: false, error: uploadError.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating profile with avatar:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, url: publicUrl };
    } catch (error: unknown) {
      console.error('Error in uploadAvatar:', error);
      return { success: false, error: error.message };
    }
  }

  private formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

export const userProfileService = new UserProfileService();
