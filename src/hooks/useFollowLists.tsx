import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface FollowUser {
  id: string;
  user_id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export const useFollowLists = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  const fetchFollowers = async () => {
    if (!userId) return;

    setFollowersLoading(true);
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles!follows_follower_id_fkey (
            user_id,
            display_name,
            username,
            avatar_url,
            bio,
            created_at
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const followersList = data?.map(item => ({
        id: item.follower_id,
        user_id: item.profiles.user_id,
        display_name: item.profiles.display_name || 'Unknown User',
        username: item.profiles.username || '',
        avatar_url: item.profiles.avatar_url,
        bio: item.profiles.bio,
        created_at: item.profiles.created_at
      })) || [];

      setFollowers(followersList);
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast({
        title: "Error",
        description: "Failed to load followers.",
        variant: "destructive",
      });
    } finally {
      setFollowersLoading(false);
    }
  };

  const fetchFollowing = async () => {
    if (!userId) return;

    setFollowingLoading(true);
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey (
            user_id,
            display_name,
            username,
            avatar_url,
            bio,
            created_at
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const followingList = data?.map(item => ({
        id: item.following_id,
        user_id: item.profiles.user_id,
        display_name: item.profiles.display_name || 'Unknown User',
        username: item.profiles.username || '',
        avatar_url: item.profiles.avatar_url,
        bio: item.profiles.bio,
        created_at: item.profiles.created_at
      })) || [];

      setFollowing(followingList);
    } catch (error) {
      console.error('Error fetching following:', error);
      toast({
        title: "Error",
        description: "Failed to load following list.",
        variant: "destructive",
      });
    } finally {
      setFollowingLoading(false);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchFollowers(), fetchFollowing()]);
    setLoading(false);
  };

  const removeFromFollowers = async (followerId: string) => {
    if (!user || !userId) return;

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', userId);

      if (error) throw error;

      // Remove from local state
      setFollowers(prev => prev.filter(f => f.id !== followerId));

      toast({
        title: "Removed",
        description: "User removed from followers.",
      });
    } catch (error) {
      console.error('Error removing follower:', error);
      toast({
        title: "Error",
        description: "Failed to remove follower.",
        variant: "destructive",
      });
    }
  };

  const unfollowUser = async (followingId: string) => {
    if (!user || !userId) return;

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', followingId);

      if (error) throw error;

      // Remove from local state
      setFollowing(prev => prev.filter(f => f.id !== followingId));

      toast({
        title: "Unfollowed",
        description: "User unfollowed successfully.",
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAll();
    }
  }, [userId]);

  return {
    followers,
    following,
    loading,
    followersLoading,
    followingLoading,
    fetchFollowers,
    fetchFollowing,
    fetchAll,
    removeFromFollowers,
    unfollowUser,
  };
};
