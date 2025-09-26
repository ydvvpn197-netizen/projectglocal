/**
 * Anonymous Handle Hook
 * Manages anonymous user identity and privacy controls
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AnonymousHandle {
  id: string;
  handle: string;
  displayName: string;
  isAnonymous: boolean;
  canRevealIdentity: boolean;
  createdAt: string;
}

export const useAnonymousHandle = () => {
  const { user } = useAuth();
  const [anonymousHandle, setAnonymousHandle] = useState<AnonymousHandle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate anonymous handle
  const generateAnonymousHandle = useCallback(async (): Promise<string> => {
    const adjectives = [
      'Mysterious', 'Silent', 'Hidden', 'Quiet', 'Secret', 'Unknown', 'Private', 'Stealthy',
      'Whispered', 'Shadow', 'Echo', 'Silhouette', 'Phantom', 'Ghost', 'Spirit', 'Guardian'
    ];
    
    const nouns = [
      'Observer', 'Watcher', 'Listener', 'Thinker', 'Dreamer', 'Wanderer', 'Explorer',
      'Seeker', 'Guardian', 'Keeper', 'Protector', 'Defender', 'Advocate', 'Voice'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 9999) + 1;
    
    return `${adjective}${noun}${number}`;
  }, []);

  // Create anonymous handle for new user
  const createAnonymousHandle = useCallback(async (): Promise<AnonymousHandle> => {
    if (!user) throw new Error('User not authenticated');

    const handle = await generateAnonymousHandle();
    const displayName = `Anonymous ${handle}`;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        anonymous_handle: handle,
        anonymous_display_name: displayName,
        is_anonymous: true,
        can_reveal_identity: false
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      handle: data.anonymous_handle,
      displayName: data.anonymous_display_name,
      isAnonymous: data.is_anonymous,
      canRevealIdentity: data.can_reveal_identity,
      createdAt: data.created_at
    };
  }, [user, generateAnonymousHandle]);

  // Load existing anonymous handle
  const loadAnonymousHandle = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, anonymous_handle, anonymous_display_name, is_anonymous, can_reveal_identity, created_at')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data.anonymous_handle) {
        setAnonymousHandle({
          id: data.id,
          handle: data.anonymous_handle,
          displayName: data.anonymous_display_name,
          isAnonymous: data.is_anonymous,
          canRevealIdentity: data.can_reveal_identity,
          createdAt: data.created_at
        });
      } else {
        // Create new anonymous handle
        const newHandle = await createAnonymousHandle();
        setAnonymousHandle(newHandle);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load anonymous handle');
    } finally {
      setIsLoading(false);
    }
  }, [user, createAnonymousHandle]);

  // Toggle anonymity
  const toggleAnonymity = useCallback(async (isAnonymous: boolean) => {
    if (!user || !anonymousHandle) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_anonymous: isAnonymous })
        .eq('user_id', user.id);

      if (error) throw error;

      setAnonymousHandle(prev => prev ? { ...prev, isAnonymous } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle anonymity');
    }
  }, [user, anonymousHandle]);

  // Update display name
  const updateDisplayName = useCallback(async (newDisplayName: string) => {
    if (!user || !anonymousHandle) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ anonymous_display_name: newDisplayName })
        .eq('user_id', user.id);

      if (error) throw error;

      setAnonymousHandle(prev => prev ? { ...prev, displayName: newDisplayName } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update display name');
    }
  }, [user, anonymousHandle]);

  // Reveal identity (one-time action)
  const revealIdentity = useCallback(async () => {
    if (!user || !anonymousHandle) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          can_reveal_identity: true,
          is_anonymous: false 
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setAnonymousHandle(prev => prev ? { 
        ...prev, 
        canRevealIdentity: true, 
        isAnonymous: false 
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reveal identity');
    }
  }, [user, anonymousHandle]);

  // Load handle on mount
  useEffect(() => {
    if (user) {
      loadAnonymousHandle();
    }
  }, [user, loadAnonymousHandle]);

  return {
    anonymousHandle,
    isLoading,
    error,
    createAnonymousHandle,
    toggleAnonymity,
    updateDisplayName,
    revealIdentity,
    refetch: loadAnonymousHandle
  };
};