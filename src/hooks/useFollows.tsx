import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/notificationService';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export const useFollows = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      checkFollowStatus();
      getFollowCounts();
    }
  }, [userId, user]);

  const checkFollowStatus = async () => {
    if (!user || !userId) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (data && !error) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    } catch (error) {
      setIsFollowing(false);
    }
  };

  const getFollowCounts = async () => {
    if (!userId) return;

    try {
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('follower_id', userId)
      ]);

      setFollowersCount(followersResult.count || 0);
      setFollowingCount(followingResult.count || 0);
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!user || !userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow users",
        variant: "destructive",
      });
      return false;
    }

    if (user.id === userId) {
      toast({
        title: "Cannot follow yourself",
        description: "You cannot follow your own profile",
        variant: "destructive",
      });
      return false;
    }

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;

        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this user",
        });
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (error) throw error;

        // Create notification for the user being followed
        try {
          await notificationService.createNewFollowerNotification(user.id, userId);
        } catch (notificationError) {
          console.error('Error creating follow notification:', notificationError);
          // Don't fail the follow operation if notification fails
        }

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        
        toast({
          title: "Following",
          description: "You are now following this user",
        });
      }

      return true;
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isFollowing,
    followersCount,
    followingCount,
    loading,
    toggleFollow,
    refetch: () => {
      checkFollowStatus();
      getFollowCounts();
    }
  };
};
