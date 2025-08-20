import { useState, useCallback, useEffect } from 'react';
import { followingService } from '@/services/followingService';
import { FollowRelationship, FollowStats, FollowSuggestion } from '@/types/following';
import { useAuth } from './useAuth';

export const useFollowing = () => {
  const [followers, setFollowers] = useState<FollowRelationship[]>([]);
  const [following, setFollowing] = useState<FollowRelationship[]>([]);
  const [followStats, setFollowStats] = useState<FollowStats | null>(null);
  const [suggestions, setSuggestions] = useState<FollowSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchFollowers = useCallback(async (userId?: string) => {
    if (!user && !userId) return;

    const targetUserId = userId || user!.id;
    setLoading(true);
    setError(null);

    try {
      const followersData = await followingService.getFollowers(targetUserId);
      setFollowers(followersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch followers');
      console.error('Error fetching followers:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchFollowing = useCallback(async (userId?: string) => {
    if (!user && !userId) return;

    const targetUserId = userId || user!.id;
    setLoading(true);
    setError(null);

    try {
      const followingData = await followingService.getFollowing(targetUserId);
      setFollowing(followingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch following');
      console.error('Error fetching following:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchFollowStats = useCallback(async (userId?: string) => {
    if (!user && !userId) return;

    const targetUserId = userId || user!.id;
    setLoading(true);
    setError(null);

    try {
      const stats = await followingService.getFollowStats(targetUserId);
      setFollowStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch follow stats');
      console.error('Error fetching follow stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchSuggestions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const suggestionsData = await followingService.getFollowSuggestions(user.id);
      setSuggestions(suggestionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const followUser = useCallback(async (followingId: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await followingService.followUser(user.id, followingId);
      
      // Update local state
      setFollowing(prev => [...prev, {
        id: `${user.id}-${followingId}`,
        followerId: user.id,
        followingId,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]);

      // Refresh stats
      await fetchFollowStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to follow user');
      console.error('Error following user:', err);
    } finally {
      setLoading(false);
    }
  }, [user, fetchFollowStats]);

  const unfollowUser = useCallback(async (followingId: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await followingService.unfollowUser(user.id, followingId);
      
      // Update local state
      setFollowing(prev => prev.filter(f => f.followingId !== followingId));

      // Refresh stats
      await fetchFollowStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unfollow user');
      console.error('Error unfollowing user:', err);
    } finally {
      setLoading(false);
    }
  }, [user, fetchFollowStats]);

  const getFollowStatus = useCallback(async (followingId: string) => {
    if (!user) return 'not_following';

    try {
      return await followingService.getFollowStatus(user.id, followingId);
    } catch (err) {
      console.error('Error getting follow status:', err);
      return 'not_following';
    }
  }, [user]);

  const getPopularUsers = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);

    try {
      const popularUsers = await followingService.getPopularUsers(limit);
      return popularUsers;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch popular users');
      console.error('Error fetching popular users:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsersByInterest = useCallback(async (interest: string, limit: number = 10) => {
    setLoading(true);
    setError(null);

    try {
      const users = await followingService.getUsersByInterest(interest, limit);
      return users;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users by interest');
      console.error('Error fetching users by interest:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async (userId?: string) => {
    if (!user && !userId) return;

    const targetUserId = userId || user!.id;
    
    await Promise.all([
      fetchFollowers(targetUserId),
      fetchFollowing(targetUserId),
      fetchFollowStats(targetUserId)
    ]);

    if (!userId) {
      await fetchSuggestions();
    }
  }, [user, fetchFollowers, fetchFollowing, fetchFollowStats, fetchSuggestions]);

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      refreshAll();
    }
  }, [user, refreshAll]);

  return {
    followers,
    following,
    followStats,
    suggestions,
    loading,
    error,
    fetchFollowers,
    fetchFollowing,
    fetchFollowStats,
    fetchSuggestions,
    followUser,
    unfollowUser,
    getFollowStatus,
    getPopularUsers,
    getUsersByInterest,
    refreshAll
  };
};
