import { supabase } from '@/integrations/supabase/client';

export interface PlatformStats {
  activeUsers: number;
  eventsCreated: number;
  communities: number;
  artists: number;
}

export interface DailyChange {
  activeUsers: number;
  eventsCreated: number;
  communities: number;
  artists: number;
}

export interface DashboardStats {
  current: PlatformStats;
  dailyChange: DailyChange;
  lastUpdated: Date;
}

export class PlatformAnalyticsService {
  /**
   * Get real-time platform statistics for the landing page dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [
        activeUsersResult,
        eventsResult,
        communitiesResult,
        artistsResult,
        yesterdayActiveUsersResult,
        yesterdayEventsResult,
        yesterdayCommunitiesResult,
        yesterdayArtistsResult
      ] = await Promise.all([
        // Current active users (users with activity in last 30 days)
        this.getActiveUsers(),
        
        // Current total events
        this.getTotalEvents(),
        
        // Current total communities (groups)
        this.getTotalCommunities(),
        
        // Current total artists
        this.getTotalArtists(),
        
        // Yesterday's active users
        this.getActiveUsers(1),
        
        // Yesterday's total events
        this.getTotalEvents(1),
        
        // Yesterday's total communities
        this.getTotalCommunities(1),
        
        // Yesterday's total artists
        this.getTotalArtists(1)
      ]);

      const current: PlatformStats = {
        activeUsers: activeUsersResult,
        eventsCreated: eventsResult,
        communities: communitiesResult,
        artists: artistsResult
      };

      const dailyChange: DailyChange = {
        activeUsers: this.calculatePercentageChange(yesterdayActiveUsersResult, activeUsersResult),
        eventsCreated: this.calculatePercentageChange(yesterdayEventsResult, eventsResult),
        communities: this.calculatePercentageChange(yesterdayCommunitiesResult, communitiesResult),
        artists: this.calculatePercentageChange(yesterdayArtistsResult, artistsResult)
      };

      return {
        current,
        dailyChange,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get active users count (users with activity in last 30 days)
   */
  private async getActiveUsers(daysAgo: number = 0): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30 - daysAgo);
      
      // Get unique users who have created posts, events, or discussions in the last 30 days
      const [postsResult, eventsResult, discussionsResult] = await Promise.all([
        supabase
          .from('posts')
          .select('user_id')
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('events')
          .select('user_id')
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('discussions')
          .select('user_id')
          .gte('created_at', thirtyDaysAgo.toISOString())
      ]);

      if (postsResult.error) throw postsResult.error;
      if (eventsResult.error) throw eventsResult.error;
      if (discussionsResult.error) throw discussionsResult.error;

      // Combine all user IDs and count unique ones
      const allUserIds = [
        ...(postsResult.data?.map(user => user.user_id) || []),
        ...(eventsResult.data?.map(user => user.user_id) || []),
        ...(discussionsResult.data?.map(user => user.user_id) || [])
      ];

      const uniqueUsers = new Set(allUserIds);
      return uniqueUsers.size;
    } catch (error) {
      console.error('Error getting active users:', error);
      return 0;
    }
  }

  /**
   * Get total events count
   */
  private async getTotalEvents(daysAgo: number = 0): Promise<number> {
    try {
      let query = supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      if (daysAgo > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        query = query.lte('created_at', cutoffDate.toISOString());
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting total events:', error);
      return 0;
    }
  }

  /**
   * Get total communities count (groups)
   */
  private async getTotalCommunities(daysAgo: number = 0): Promise<number> {
    try {
      let query = supabase
        .from('groups')
        .select('*', { count: 'exact', head: true });

      if (daysAgo > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        query = query.lte('created_at', cutoffDate.toISOString());
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting total communities:', error);
      return 0;
    }
  }

  /**
   * Get total artists count
   */
  private async getTotalArtists(daysAgo: number = 0): Promise<number> {
    try {
      let query = supabase
        .from('artists')
        .select('*', { count: 'exact', head: true });

      if (daysAgo > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        query = query.lte('created_at', cutoffDate.toISOString());
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting total artists:', error);
      return 0;
    }
  }

  /**
   * Calculate percentage change between two values
   */
  private calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) {
      return newValue > 0 ? 100 : 0;
    }
    
    const change = ((newValue - oldValue) / oldValue) * 100;
    return Math.round(change * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Format number with commas for display
   */
  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  /**
   * Format percentage change for display
   */
  formatPercentageChange(change: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}%`;
  }
}
