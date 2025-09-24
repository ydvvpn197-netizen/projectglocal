import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { PointsService } from '@/services/pointsService';
import { supabase } from '@/integrations/supabase/client';
import { 
  UserPoints, 
  PointTransaction, 
  CommunityLeaderboardEntry,
  PointTransactionType
} from '@/types/community';

interface UsePointsReturn {
  // Current user points
  userPoints: UserPoints | null;
  loading: boolean;
  error: string | null;
  
  // Leaderboard
  leaderboard: CommunityLeaderboardEntry[];
  leaderboardLoading: boolean;
  leaderboardError: string | null;
  
  // Point history
  pointHistory: PointTransaction[];
  historyLoading: boolean;
  historyError: string | null;
  
  // Actions
  refreshUserPoints: () => Promise<void>;
  refreshLeaderboard: (limit?: number) => Promise<void>;
  refreshPointHistory: (filters?: PointHistoryFilters) => Promise<void>;
  addPoints: (points: number, type: PointTransactionType, referenceId?: string, referenceType?: string, description?: string) => Promise<boolean>;
  handleEventAttendance: (eventId: string) => Promise<boolean>;
  handleEventOrganization: (eventId: string) => Promise<boolean>;
  handlePollCreation: (pollId: string) => Promise<boolean>;
  handlePostSharing: (postId: string) => Promise<boolean>;
  
  // Real-time updates
  subscribeToPointsUpdates: () => void;
  unsubscribeFromPointsUpdates: () => void;
}

export const usePoints = (): UsePointsReturn => {
  const { user } = useAuth();
  
  // State for current user points
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for leaderboard
  const [leaderboard, setLeaderboard] = useState<CommunityLeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  
  // State for point history
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
  // Real-time subscription
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);

  // Load current user points
  const loadUserPoints = useCallback(async () => {
    if (!user) {
      setUserPoints(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const points = await PointsService.getCurrentUserPoints();
      setUserPoints(points);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user points');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load leaderboard
  const loadLeaderboard = useCallback(async (limit: number = 5) => {
    try {
      setLeaderboardLoading(true);
      setLeaderboardError(null);
      const data = await PointsService.getLeaderboard({ limit });
      setLeaderboard(data);
    } catch (err) {
      setLeaderboardError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  // Load point history
  const loadPointHistory = useCallback(async (filters?: PointHistoryFilters) => {
    if (!user) return;

    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const history = await PointsService.getCurrentUserPointHistory(filters);
      setPointHistory(history);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to load point history');
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  // Add points manually
  const addPoints = useCallback(async (
    points: number, 
    type: PointTransactionType, 
    referenceId?: string, 
    referenceType?: string, 
    description?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await PointsService.addPoints(
        user.id, 
        points, 
        type, 
        referenceId, 
                 referenceType as string, 
        description
      );
      
      if (success) {
        // Refresh user points after adding
        await loadUserPoints();
      }
      
      return success;
    } catch (err) {
      console.error('Error adding points:', err);
      return false;
    }
  }, [user, loadUserPoints]);

  // Handle event attendance
  const handleEventAttendance = useCallback(async (eventId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await PointsService.handleEventAttendance(eventId, user.id);
      if (success) {
        await loadUserPoints();
      }
      return success;
    } catch (err) {
      console.error('Error handling event attendance points:', err);
      return false;
    }
  }, [user, loadUserPoints]);

  // Handle event organization
  const handleEventOrganization = useCallback(async (eventId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await PointsService.handleEventOrganization(eventId, user.id);
      if (success) {
        await loadUserPoints();
      }
      return success;
    } catch (err) {
      console.error('Error handling event organization points:', err);
      return false;
    }
  }, [user, loadUserPoints]);

  // Handle poll creation
  const handlePollCreation = useCallback(async (pollId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await PointsService.handlePollCreation(pollId, user.id);
      if (success) {
        await loadUserPoints();
      }
      return success;
    } catch (err) {
      console.error('Error handling poll creation points:', err);
      return false;
    }
  }, [user, loadUserPoints]);

  // Handle post sharing
  const handlePostSharing = useCallback(async (postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await PointsService.handlePostSharing(postId, user.id);
      if (success) {
        await loadUserPoints();
      }
      return success;
    } catch (err) {
      console.error('Error handling post sharing points:', err);
      return false;
    }
  }, [user, loadUserPoints]);

  // Subscribe to real-time points updates
  const subscribeToPointsUpdates = useCallback(() => {
    if (!user) return;

    // Subscribe to user_points changes
    const userPointsSubscription = supabase
      .channel('user_points_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('User points updated:', payload);
          loadUserPoints();
        }
      )
      .subscribe();

    // Subscribe to leaderboard changes
    const leaderboardSubscription = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_leaderboard'
        },
        (payload) => {
          console.log('Leaderboard updated:', payload);
          loadLeaderboard();
        }
      )
      .subscribe();

    setSubscription({ userPointsSubscription, leaderboardSubscription });
  }, [user, loadUserPoints, loadLeaderboard]);

  // Unsubscribe from real-time updates
  const unsubscribeFromPointsUpdates = useCallback(() => {
    if (subscription) {
      subscription.userPointsSubscription?.unsubscribe();
      subscription.leaderboardSubscription?.unsubscribe();
      setSubscription(null);
    }
  }, [subscription]);

  // Initialize data
  useEffect(() => {
    if (user) {
      loadUserPoints();
      loadLeaderboard();
      loadPointHistory();
    } else {
      setUserPoints(null);
      setLeaderboard([]);
      setPointHistory([]);
      setLoading(false);
    }
  }, [user, loadUserPoints, loadLeaderboard, loadPointHistory]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromPointsUpdates();
    };
  }, [unsubscribeFromPointsUpdates]);

  return {
    // Current user points
    userPoints,
    loading,
    error,
    
    // Leaderboard
    leaderboard,
    leaderboardLoading,
    leaderboardError,
    
    // Point history
    pointHistory,
    historyLoading,
    historyError,
    
    // Actions
    refreshUserPoints: loadUserPoints,
    refreshLeaderboard: loadLeaderboard,
    refreshPointHistory: loadPointHistory,
    addPoints,
    handleEventAttendance,
    handleEventOrganization,
    handlePollCreation,
    handlePostSharing,
    
    // Real-time updates
    subscribeToPointsUpdates,
    unsubscribeFromPointsUpdates
  };
};
