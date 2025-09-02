import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface FollowUser {
  id: string;
  user_id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export const useFollowLists = () => {
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  const fetchFollowers = async () => {
    if (!user) return;

    try {
      // Mock followers data since database tables may not exist
      const mockFollowers: FollowUser[] = [
        {
          id: 'follower1',
          user_id: 'follower1',
          display_name: 'John Doe',
          username: 'johndoe',
          avatar_url: undefined,
          bio: 'Local community member',
          created_at: new Date().toISOString(),
        },
        {
          id: 'follower2',
          user_id: 'follower2',
          display_name: 'Jane Smith',
          username: 'janesmith',
          avatar_url: undefined,
          bio: 'Artist and creator',
          created_at: new Date().toISOString(),
        }
      ];

      setFollowers(mockFollowers);
    } catch (err) {
      console.error('Error fetching followers:', err);
      setError('Failed to fetch followers');
      setFollowers([]);
    }
  };

  const fetchFollowing = async () => {
    if (!user) return;

    try {
      // Mock following data since database tables may not exist
      const mockFollowing: FollowUser[] = [
        {
          id: 'following1',
          user_id: 'following1',
          display_name: 'Local News',
          username: 'localnews',
          avatar_url: undefined,
          bio: 'Your local news source',
          created_at: new Date().toISOString(),
        },
        {
          id: 'following2',
          user_id: 'following2',
          display_name: 'Community Events',
          username: 'communityevents',
          avatar_url: undefined,
          bio: 'Event organizer',
          created_at: new Date().toISOString(),
        }
      ];

      setFollowing(mockFollowing);
    } catch (err) {
      console.error('Error fetching following:', err);
      setError('Failed to fetch following');
      setFollowing([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await Promise.all([fetchFollowers(), fetchFollowing()]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const removeFromFollowers = (userId: string) => {
    setFollowers(prev => prev.filter(f => f.user_id !== userId));
  };

  const unfollowUser = (userId: string) => {
    setFollowing(prev => prev.filter(f => f.user_id !== userId));
  };

  return {
    followers,
    following,
    loading,
    error,
    followersLoading: loading,
    followingLoading: loading,
    removeFromFollowers,
    unfollowUser,
    refetch: (force?: boolean) => {
      if (user) {
        fetchFollowers();
        fetchFollowing();
      }
    }
  };
};
