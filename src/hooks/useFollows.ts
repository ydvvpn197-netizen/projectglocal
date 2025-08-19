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

  // Realtime updates for followers/following
  useEffect(() => {
    if (!user || !profileUserId) return;
    const followersChannel = supabase
      .channel(`follows:followers:${profileUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'follows',
        filter: `following_id=eq.${profileUserId}`,
      }, (payload: any) => {
        setFollowersCount((c) => c + 1);
        if (payload?.new?.follower_id === user.id && payload?.new?.following_id === profileUserId) {
          setIsFollowing(true);
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'follows',
        filter: `following_id=eq.${profileUserId}`,
      }, (payload: any) => {
        setFollowersCount((c) => Math.max(0, c - 1));
        if (payload?.old?.follower_id === user.id && payload?.old?.following_id === profileUserId) {
          setIsFollowing(false);
        }
      })
      .subscribe();

    const followingChannel = supabase
      .channel(`follows:following:${profileUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'follows',
        filter: `follower_id=eq.${profileUserId}`,
      }, () => {
        setFollowingCount((c) => c + 1);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'follows',
        filter: `follower_id=eq.${profileUserId}`,
      }, () => {
        setFollowingCount((c) => Math.max(0, c - 1));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(followersChannel);
      supabase.removeChannel(followingChannel);
    };
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

