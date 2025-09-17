/**
 * useAnonymousUsername Hook
 * 
 * Provides anonymous username generation and management similar to Reddit's system.
 * Users get random usernames by default and can choose to reveal their identity.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AnonymousUser {
  id: string;
  username: string;
  display_name?: string;
  is_anonymous: boolean;
  reveal_count: number;
  last_reveal?: string;
}

interface UseAnonymousUsernameReturn {
  currentUser: AnonymousUser | null;
  generateUsername: () => string;
  revealIdentity: () => Promise<boolean>;
  hideIdentity: () => Promise<boolean>;
  updateDisplayName: (name: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

// Adjective and noun lists for username generation
const ADJECTIVES = [
  'Swift', 'Bright', 'Clever', 'Bold', 'Calm', 'Cool', 'Fast', 'Kind',
  'Smart', 'Wise', 'Brave', 'Gentle', 'Happy', 'Lucky', 'Magic', 'Pure',
  'Quick', 'Sharp', 'Strong', 'Sweet', 'True', 'Wild', 'Young', 'Zest',
  'Epic', 'Noble', 'Radiant', 'Vibrant', 'Dynamic', 'Elegant', 'Fierce',
  'Golden', 'Harmonic', 'Infinite', 'Jovial', 'Keen', 'Luminous'
];

const NOUNS = [
  'Tiger', 'Eagle', 'Wolf', 'Bear', 'Fox', 'Hawk', 'Lion', 'Deer',
  'Owl', 'Raven', 'Falcon', 'Shark', 'Dolphin', 'Phoenix', 'Dragon',
  'Unicorn', 'Pegasus', 'Griffin', 'Sphinx', 'Basilisk', 'Phoenix',
  'Explorer', 'Navigator', 'Pioneer', 'Adventurer', 'Dreamer', 'Creator',
  'Builder', 'Artist', 'Writer', 'Sage', 'Mage', 'Warrior', 'Guardian',
  'Wanderer', 'Seeker', 'Thinker', 'Innovator', 'Visionary', 'Legend'
];

const COLORS = [
  'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Cyan',
  'Magenta', 'Lime', 'Indigo', 'Teal', 'Coral', 'Gold', 'Silver', 'Copper',
  'Emerald', 'Ruby', 'Sapphire', 'Amber', 'Pearl', 'Crystal', 'Shadow',
  'Light', 'Dark', 'Bright', 'Deep', 'Rich', 'Vivid', 'Pastel'
];

export const useAnonymousUsername = (): UseAnonymousUsernameReturn => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<AnonymousUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate a random anonymous username
   */
  const generateUsername = useCallback((): string => {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const number = Math.floor(Math.random() * 9999) + 1;
    
    // Random format selection
    const formats = [
      `${adjective}${noun}${number}`,
      `${color}${noun}${number}`,
      `${adjective}${color}${number}`,
      `${noun}${color}${number}`,
      `${adjective}${noun}`,
      `${color}${noun}`
    ];
    
    return formats[Math.floor(Math.random() * formats.length)];
  }, []);

  /**
   * Load current user's anonymous profile
   */
  const loadUserProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!data) {
        // Create new anonymous profile
        const newUsername = generateUsername();
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            username: newUsername,
            display_name: newUsername,
            is_anonymous: true,
            reveal_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        setCurrentUser(newProfile);
      } else {
        setCurrentUser(data);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, generateUsername]);

  /**
   * Reveal user's real identity
   */
  const revealIdentity = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !currentUser) return false;

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_anonymous: false,
          reveal_count: (currentUser.reveal_count || 0) + 1,
          last_reveal: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Reload profile to get updated data
      await loadUserProfile();
      return true;
    } catch (err) {
      console.error('Error revealing identity:', err);
      setError(err instanceof Error ? err.message : 'Failed to reveal identity');
      return false;
    }
  }, [user?.id, currentUser, loadUserProfile]);

  /**
   * Hide user's real identity
   */
  const hideIdentity = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_anonymous: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Reload profile to get updated data
      await loadUserProfile();
      return true;
    } catch (err) {
      console.error('Error hiding identity:', err);
      setError(err instanceof Error ? err.message : 'Failed to hide identity');
      return false;
    }
  }, [user?.id, loadUserProfile]);

  /**
   * Update user's display name
   */
  const updateDisplayName = useCallback(async (name: string): Promise<boolean> => {
    if (!user?.id || !name.trim()) return false;

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: name.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Reload profile to get updated data
      await loadUserProfile();
      return true;
    } catch (err) {
      console.error('Error updating display name:', err);
      setError(err instanceof Error ? err.message : 'Failed to update display name');
      return false;
    }
  }, [user?.id, loadUserProfile]);

  // Load profile on mount
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  return {
    currentUser,
    generateUsername,
    revealIdentity,
    hideIdentity,
    updateDisplayName,
    isLoading,
    error
  };
};