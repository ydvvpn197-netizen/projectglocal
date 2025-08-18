import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useFollows = (profileUserId?: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchFollowState = async () => {
    if (!user || !profileUserId) return;
    try {
      const [relRes, followersRes, followingRes] = await Promise.all([
        supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', profileUserId).maybeSingle(),
        supabase.from('follows').select('id').eq('following_id', profileUserId),
        supabase.from('follows').select('id').eq('follower_id', profileUserId),
      ]);
      setIsFollowing(Boolean(relRes.data));
      setFollowersCount(followersRes.data?.length || 0);
      setFollowingCount(followingRes.data?.length || 0);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchFollowState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profileUserId]);

  const follow = async () => {
    if (!user || !profileUserId) return;
    setLoading(true);
    try {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profileUserId });
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);
    } finally {
      setLoading(false);
    }
  };

  const unfollow = async () => {
    if (!user || !profileUserId) return;
    setLoading(true);
    try {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profileUserId);
      setIsFollowing(false);
      setFollowersCount((c) => Math.max(0, c - 1));
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, followersCount, followingCount, follow, unfollow, loading, refetch: fetchFollowState };
};

