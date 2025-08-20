import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserStats {
  totalPosts: number;
  totalEvents: number;
  totalBookings: number;
  totalFollowers: number;
  totalFollowing: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalArtists: number;
  totalEvents: number;
  totalPosts: number;
  totalBookings: number;
  totalGroups: number;
  totalDiscussions: number;
  activeUsers: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface EventStats {
  eventId: string;
  title: string;
  totalAttendees: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  engagementRate: number;
}

export const useAnalytics = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserStats = async (userId?: string) => {
    if (!userId) return;

    try {
      // Fetch user statistics
      const [
        { count: postsCount },
        { count: eventsCount },
        { count: bookingsCount },
        { count: followersCount },
        { count: followingCount },
        { count: likesCount },
        { count: commentsCount }
      ] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('artist_bookings').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
        supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', userId)
      ]);

      // Calculate engagement rate (likes + comments) / posts
      const totalEngagement = (likesCount || 0) + (commentsCount || 0);
      const engagementRate = postsCount ? (totalEngagement / postsCount) * 100 : 0;

      setUserStats({
        totalPosts: postsCount || 0,
        totalEvents: eventsCount || 0,
        totalBookings: bookingsCount || 0,
        totalFollowers: followersCount || 0,
        totalFollowing: followingCount || 0,
        totalLikes: likesCount || 0,
        totalComments: commentsCount || 0,
        engagementRate: Math.round(engagementRate * 100) / 100
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchPlatformStats = async () => {
    try {
      const [
        { count: totalUsers },
        { count: totalArtists },
        { count: totalEvents },
        { count: totalPosts },
        { count: totalBookings },
        { count: totalGroups },
        { count: totalDiscussions }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('artists').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('artist_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('groups').select('*', { count: 'exact', head: true }),
        supabase.from('discussions').select('*', { count: 'exact', head: true })
      ]);

      // Calculate active users (users with activity in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers } = await supabase
        .from('posts')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Calculate new users this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: newUsersThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      // Calculate new users this month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneMonthAgo.toISOString());

      setPlatformStats({
        totalUsers: totalUsers || 0,
        totalArtists: totalArtists || 0,
        totalEvents: totalEvents || 0,
        totalPosts: totalPosts || 0,
        totalBookings: totalBookings || 0,
        totalGroups: totalGroups || 0,
        totalDiscussions: totalDiscussions || 0,
        activeUsers: activeUsers || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        newUsersThisMonth: newUsersThisMonth || 0
      });
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    }
  };

  const fetchEventStats = async (eventId: string): Promise<EventStats | null> => {
    try {
      const [
        { data: event },
        { count: attendeesCount }
      ] = await Promise.all([
        supabase.from('events').select('title').eq('id', eventId).single(),
        supabase.from('event_attendees').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
      ]);

      if (!event) return null;

      const totalRevenue = 0; // Would need to calculate from payments
      const averageRating = 0; // No reviews table yet

      return {
        eventId,
        title: event.title,
        totalAttendees: attendeesCount || 0,
        totalRevenue,
        averageRating,
        totalReviews: 0,
        engagementRate: 0 // Would need to calculate from likes, comments, etc.
      };
    } catch (error) {
      console.error('Error fetching event stats:', error);
      return null;
    }
  };

  const getTrendingContent = async () => {
    try {
      // Get trending posts (most likes in last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: trendingPosts } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          likes_count,
          comments_count,
          created_at,
          profiles!inner (
            display_name,
            avatar_url
          )
        `)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('likes_count', { ascending: false })
        .limit(5);

      // Get trending events (most attendees)
      const { data: trendingEvents } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          max_attendees,
          event_date,
          image_url
        `)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('max_attendees', { ascending: false })
        .limit(5);

      return {
        trendingPosts: trendingPosts || [],
        trendingEvents: trendingEvents || []
      };
    } catch (error) {
      console.error('Error fetching trending content:', error);
      return { trendingPosts: [], trendingEvents: [] };
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserStats(user.id);
    }
    fetchPlatformStats();
    setLoading(false);
  }, [user]);

  return {
    userStats,
    platformStats,
    loading,
    fetchUserStats,
    fetchPlatformStats,
    fetchEventStats,
    getTrendingContent
  };
};
