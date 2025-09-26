/**
 * Anonymous Handle Hook
 * Provides functionality for managing anonymous handles and privacy settings
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PrivacySettings {
  show_real_name: boolean;
  show_real_avatar: boolean;
  show_real_email: boolean;
  show_real_location: boolean;
  privacy_level: 'anonymous' | 'pseudonymous' | 'public';
  anonymous_handle: string;
}

export interface UserDisplayInfo {
  display_name: string;
  avatar_url: string;
  is_anonymous: boolean;
  privacy_level: string;
}

export const useAnonymousHandle = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch privacy settings for current user
  const fetchPrivacySettings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .rpc('get_user_privacy_settings', { user_id: user.id });

      if (fetchError) throw fetchError;

      setPrivacySettings(data);
    } catch (err) {
      console.error('Error fetching privacy settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch privacy settings');
      toast({
        title: "Error",
        description: "Failed to load privacy settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Update privacy settings
  const updatePrivacySettings = useCallback(async (settings: Partial<PrivacySettings>) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .rpc('update_privacy_settings', {
          p_user_id: user.id,
          p_show_real_name: settings.show_real_name,
          p_show_real_avatar: settings.show_real_avatar,
          p_show_real_email: settings.show_real_email,
          p_show_real_location: settings.show_real_location,
          p_privacy_level: settings.privacy_level
        });

      if (updateError) throw updateError;

      // Refresh privacy settings
      await fetchPrivacySettings();

      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved",
      });

      return true;
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update privacy settings');
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchPrivacySettings]);

  // Get display information for a user (respects privacy settings)
  const getUserDisplayInfo = useCallback(async (userId: string): Promise<UserDisplayInfo | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_user_display_name', { user_id: userId });

      if (fetchError) throw fetchError;

      const { data: avatarData, error: avatarError } = await supabase
        .rpc('get_user_avatar', { user_id: userId });

      if (avatarError) throw avatarError;

      const { data: privacyData, error: privacyError } = await supabase
        .rpc('get_user_privacy_settings', { user_id: userId });

      if (privacyError) throw privacyError;

      return {
        display_name: data || 'Anonymous_User',
        avatar_url: avatarData || '/images/anonymous-avatar.png',
        is_anonymous: !privacyData?.show_real_name,
        privacy_level: privacyData?.privacy_level || 'anonymous'
      };
    } catch (err) {
      console.error('Error fetching user display info:', err);
      return {
        display_name: 'Anonymous_User',
        avatar_url: '/images/anonymous-avatar.png',
        is_anonymous: true,
        privacy_level: 'anonymous'
      };
    }
  }, []);

  // Generate new anonymous handle
  const generateNewHandle = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const { data, error: generateError } = await supabase
        .rpc('generate_anonymous_handle');

      if (generateError) throw generateError;

      // Update the user's anonymous handle
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ anonymous_handle: data })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh privacy settings
      await fetchPrivacySettings();

      toast({
        title: "New Handle Generated",
        description: `Your new anonymous handle is: ${data}`,
      });

      return data;
    } catch (err) {
      console.error('Error generating new handle:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate new handle');
      toast({
        title: "Error",
        description: "Failed to generate new anonymous handle",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchPrivacySettings]);

  // Create anonymous session
  const createAnonymousSession = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error: sessionError } = await supabase
        .rpc('create_anonymous_session');

      if (sessionError) throw sessionError;

      // Store session token in localStorage for anonymous users
      localStorage.setItem('anonymous_session_token', data);

      return data;
    } catch (err) {
      console.error('Error creating anonymous session:', err);
      return null;
    }
  }, []);

  // Get current anonymous session
  const getAnonymousSession = useCallback((): string | null => {
    return localStorage.getItem('anonymous_session_token');
  }, []);

  // Clear anonymous session
  const clearAnonymousSession = useCallback(() => {
    localStorage.removeItem('anonymous_session_token');
  }, []);

  // Load privacy settings on mount
  useEffect(() => {
    if (user) {
      fetchPrivacySettings();
    }
  }, [user, fetchPrivacySettings]);

  return {
    privacySettings,
    loading,
    error,
    fetchPrivacySettings,
    updatePrivacySettings,
    getUserDisplayInfo,
    generateNewHandle,
    createAnonymousSession,
    getAnonymousSession,
    clearAnonymousSession
  };
};
