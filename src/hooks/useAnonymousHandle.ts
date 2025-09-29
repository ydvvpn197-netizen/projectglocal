/**
 * Anonymous Handle Hook
 * Manages privacy-first anonymous handles for users
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface AnonymousHandleData {
  anonymous_handle: string;
  is_anonymous: boolean;
  real_name_visibility: boolean;
  handle_generated_at: string;
}

export interface UserDisplayInfo {
  display_name: string;
  is_anonymous: boolean;
  can_see_real_name: boolean;
}

export function useAnonymousHandle() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [handleData, setHandleData] = useState<AnonymousHandleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's anonymous handle data
  const loadHandleData = useCallback(async () => {
    if (!user) {
      setHandleData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('anonymous_handle, is_anonymous, real_name_visibility, handle_generated_at')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setHandleData(data);
    } catch (err) {
      console.error('Error loading anonymous handle data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load handle data');
      toast({
        title: 'Error',
        description: 'Failed to load your anonymous handle settings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Update anonymity settings
  const updateAnonymitySettings = useCallback(async (
    isAnonymous: boolean,
    realNameVisibility: boolean = false
  ) => {
    if (!user || !handleData) return;

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_anonymous: isAnonymous,
          real_name_visibility: realNameVisibility
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setHandleData(prev => prev ? {
        ...prev,
        is_anonymous: isAnonymous,
        real_name_visibility: realNameVisibility
      } : null);

      toast({
        title: 'Settings Updated',
        description: `Your anonymity settings have been updated`,
      });
    } catch (err) {
      console.error('Error updating anonymity settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      toast({
        title: 'Error',
        description: 'Failed to update your anonymity settings',
        variant: 'destructive'
      });
    }
  }, [user, handleData, toast]);

  // Regenerate anonymous handle
  const regenerateHandle = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);

      const { data, error: regenerateError } = await supabase
        .rpc('generate_anonymous_handle');

      if (regenerateError) {
        throw regenerateError;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          anonymous_handle: data,
          handle_generated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Reload handle data
      await loadHandleData();

      toast({
        title: 'Handle Regenerated',
        description: 'Your anonymous handle has been regenerated',
      });
    } catch (err) {
      console.error('Error regenerating handle:', err);
      setError(err instanceof Error ? err.message : 'Failed to regenerate handle');
      toast({
        title: 'Error',
        description: 'Failed to regenerate your anonymous handle',
        variant: 'destructive'
      });
    }
  }, [user, loadHandleData, toast]);

  // Get display name for a user (respects anonymity)
  const getUserDisplayName = useCallback(async (userId: string): Promise<UserDisplayInfo> => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_display_name', { profile_record: { id: userId } });

      if (error) throw error;

      // Check if current user can see real name
      const { data: canSeeRealName, error: canSeeError } = await supabase
        .rpc('can_see_real_name', {
          viewer_id: user?.id || null,
          target_id: userId
        });

      if (canSeeError) {
        console.warn('Error checking real name visibility:', canSeeError);
      }

      return {
        display_name: data || 'Anonymous User',
        is_anonymous: canSeeRealName === false,
        can_see_real_name: canSeeRealName === true
      };
    } catch (err) {
      console.error('Error getting user display name:', err);
      return {
        display_name: 'Anonymous User',
        is_anonymous: true,
        can_see_real_name: false
      };
    }
  }, [user]);

  // Load data on mount
  useEffect(() => {
    loadHandleData();
  }, [loadHandleData]);

  return {
    handleData,
    isLoading,
    error,
    updateAnonymitySettings,
    regenerateHandle,
    getUserDisplayName,
    refreshHandleData: loadHandleData,
    // Convenience getters
    isAnonymous: handleData?.is_anonymous ?? true,
    anonymousHandle: handleData?.anonymous_handle ?? null,
    realNameVisibility: handleData?.real_name_visibility ?? false
  };
}
