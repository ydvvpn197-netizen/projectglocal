import { supabase } from '@/integrations/supabase/client';
import { 
  UserPoints, 
  PointTransaction, 
  CommunityLeaderboardEntry,
  LeaderboardFilters,
  PointHistoryFilters,
  PointTransactionType
} from '@/types/community';

export class PointsService {
  // Get user's current points and rank
  static async getUserPoints(userId: string): Promise<UserPoints | null> {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user points:', error);
      return null;
    }
  }

  // Add points to a user
  static async addPoints(
    userId: string, 
    points: number, 
    transactionType: PointTransactionType, 
    description?: string, 
    metadata?: any
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('add_user_points', {
        p_user_id: userId,
        p_points: points,
        p_transaction_type: transactionType,
        p_description: description || '',
        p_metadata: metadata || null
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding points:', error);
      return false;
    }
  }

  // Get current user's points
  static async getCurrentUserPoints(): Promise<UserPoints | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      return await this.getUserPoints(user.id);
    } catch (error) {
      console.error('Error fetching current user points:', error);
      return null;
    }
  }

  // Get community leaderboard
  static async getLeaderboard(filters?: LeaderboardFilters): Promise<CommunityLeaderboardEntry[]> {
    try {
      let query = supabase
        .from('community_leaderboard')
        .select('*')
        .order('rank', { ascending: true });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1);
      }
      if (filters?.min_points) {
        query = query.gte('total_points', filters.min_points);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Database error fetching leaderboard:', error);
        // If leaderboard table is empty, try to get from user_points as fallback
        return await this.getLeaderboardFallback(filters);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Try fallback method
      return await this.getLeaderboardFallback(filters);
    }
  }

  // Fallback method to get leaderboard from user_points table
  private static async getLeaderboardFallback(filters?: LeaderboardFilters): Promise<CommunityLeaderboardEntry[]> {
    try {
      let query = supabase
        .from('user_points')
        .select(`
          user_id,
          total_points,
          rank,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .order('total_points', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1);
      }
      if (filters?.min_points) {
        query = query.gte('total_points', filters.min_points);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform the data to match CommunityLeaderboardEntry format
      return (data || []).map(entry => ({
        id: entry.user_id,
        user_id: entry.user_id,
        display_name: entry.profiles?.display_name,
        avatar_url: entry.profiles?.avatar_url,
        total_points: entry.total_points,
        rank: entry.rank,
        last_updated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching leaderboard fallback:', error);
      return [];
    }
  }

  // Get top N users from leaderboard
  static async getTopUsers(limit: number = 5): Promise<CommunityLeaderboardEntry[]> {
    return await this.getLeaderboard({ limit });
  }

  // Get user's point transaction history
  static async getPointHistory(userId: string, filters?: PointHistoryFilters): Promise<PointTransaction[]> {
    try {
      let query = supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.transaction_type) {
        query = query.eq('transaction_type', filters.transaction_type);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching point history:', error);
      return [];
    }
  }

  // Get current user's point history
  static async getCurrentUserPointHistory(filters?: PointHistoryFilters): Promise<PointTransaction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      return await this.getPointHistory(user.id, filters);
    } catch (error) {
      console.error('Error fetching current user point history:', error);
      return [];
    }
  }

  // Manually add points (for testing or admin purposes)
  static async addPointsWithReference(
    userId: string,
    points: number,
    transactionType: PointTransactionType,
    referenceId?: string,
    referenceType?: 'post' | 'comment' | 'event' | 'poll',
    description?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('add_user_points', {
        p_user_id: userId,
        p_points: points,
        p_transaction_type: transactionType,
        p_reference_id: referenceId,
        p_reference_type: referenceType,
        p_description: description
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding points:', error);
      return false;
    }
  }

  // Handle event attendance points
  static async handleEventAttendance(eventId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('handle_event_points', {
        p_event_id: eventId,
        p_user_id: userId,
        p_action: 'attended'
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error handling event attendance points:', error);
      return false;
    }
  }

  // Handle event organization points
  static async handleEventOrganization(eventId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('handle_event_points', {
        p_event_id: eventId,
        p_user_id: userId,
        p_action: 'organized'
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error handling event organization points:', error);
      return false;
    }
  }

  // Handle poll creation points
  static async handlePollCreation(pollId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('handle_poll_points', {
        p_poll_id: pollId,
        p_user_id: userId,
        p_action: 'created'
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error handling poll creation points:', error);
      return false;
    }
  }

  // Handle post sharing points
  static async handlePostSharing(postId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('handle_share_points', {
        p_post_id: postId,
        p_user_id: userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error handling post sharing points:', error);
      return false;
    }
  }

  // Get points summary for current user
  static async getCurrentUserPointsSummary(): Promise<{
    totalPoints: number;
    rank: number;
    recentTransactions: PointTransaction[];
    pointsBreakdown: Record<string, number>;
  } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const [userPoints, recentTransactions] = await Promise.all([
        this.getUserPoints(user.id),
        this.getPointHistory(user.id, { limit: 10 })
      ]);

      if (!userPoints) return null;

      // Calculate points breakdown by transaction type
      const pointsBreakdown: Record<string, number> = {};
      recentTransactions.forEach(transaction => {
        const type = transaction.transaction_type;
        pointsBreakdown[type] = (pointsBreakdown[type] || 0) + transaction.points;
      });

      return {
        totalPoints: userPoints.total_points,
        rank: userPoints.rank,
        recentTransactions,
        pointsBreakdown
      };
    } catch (error) {
      console.error('Error fetching points summary:', error);
      return null;
    }
  }

  // Get leaderboard with user's position highlighted
  static async getLeaderboardWithUserPosition(userId: string, limit: number = 100): Promise<{
    leaderboard: CommunityLeaderboardEntry[];
    userPosition: number;
    userEntry?: CommunityLeaderboardEntry;
  }> {
    try {
      const [leaderboard, userPoints] = await Promise.all([
        this.getLeaderboard({ limit }),
        this.getUserPoints(userId)
      ]);

      const userPosition = userPoints?.rank || 0;
      const userEntry = leaderboard.find(entry => entry.user_id === userId);

      return {
        leaderboard,
        userPosition,
        userEntry
      };
    } catch (error) {
      console.error('Error fetching leaderboard with user position:', error);
      return {
        leaderboard: [],
        userPosition: 0
      };
    }
  }

  // Refresh leaderboard ranks (admin function)
  static async refreshLeaderboardRanks(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('refresh_all_leaderboard_ranks');
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error refreshing leaderboard ranks:', error);
      return false;
    }
  }

  // Get points statistics for admin dashboard
  static async getPointsStatistics(): Promise<{
    totalUsers: number;
    totalPoints: number;
    averagePoints: number;
    topUser: CommunityLeaderboardEntry | null;
    recentActivity: number;
  }> {
    try {
      const [
        { count: totalUsers },
        { data: totalPointsData },
        { data: topUser },
        { count: recentActivity }
      ] = await Promise.all([
        supabase.from('user_points').select('*', { count: 'exact', head: true }),
        supabase.from('user_points').select('total_points'),
        supabase.from('community_leaderboard').select('*').order('total_points', { ascending: false }).limit(1).single(),
        supabase.from('point_transactions').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      const totalPoints = totalPointsData?.reduce((sum, user) => sum + user.total_points, 0) || 0;
      const averagePoints = totalUsers ? Math.round(totalPoints / totalUsers) : 0;

      return {
        totalUsers: totalUsers || 0,
        totalPoints,
        averagePoints,
        topUser: topUser || null,
        recentActivity: recentActivity || 0
      };
    } catch (error) {
      console.error('Error fetching points statistics:', error);
      return {
        totalUsers: 0,
        totalPoints: 0,
        averagePoints: 0,
        topUser: null,
        recentActivity: 0
      };
    }
  }
}
