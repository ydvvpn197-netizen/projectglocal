import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserService, UserProfile, ArtistProfile, UserSettings } from '@/services/userService';

export interface UseUserProfileReturn {
  profile: UserProfile | null;
  artistProfile: ArtistProfile | null;
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  updateArtistProfile: (updates: Partial<ArtistProfile>) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setArtistProfile(null);
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [profileResult, settingsResult] = await Promise.all([
        UserService.getUserProfile(user.id),
        UserService.getUserSettings(user.id)
      ]);

      if (profileResult.error) {
        throw new Error(profileResult.error);
      }

      if (settingsResult.error) {
        console.warn('Error fetching settings:', settingsResult.error);
        // Don't throw error, just use null settings
      }

      setProfile(profileResult.profile);
      setArtistProfile(profileResult.artistProfile || null);
      setSettings(settingsResult.settings || null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      return { success: false, error: 'No user ID' };
    }

    try {
      const result = await UserService.updateUserProfile(user.id, updates);
      
      if (result.success) {
        // Optimistically update local state
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      }
      
      return result;
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update profile' };
    }
  }, [user?.id]);

  const updateArtistProfile = useCallback(async (updates: Partial<ArtistProfile>) => {
    if (!user?.id) {
      return { success: false, error: 'No user ID' };
    }

    try {
      const result = await UserService.updateArtistProfile(user.id, updates);
      
      if (result.success) {
        // Optimistically update local state
        setArtistProfile(prev => prev ? { ...prev, ...updates } : null);
      }
      
      return result;
    } catch (err) {
      console.error('Error updating artist profile:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update artist profile' };
    }
  }, [user?.id]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user?.id) {
      return { success: false, error: 'No user ID' };
    }

    try {
      const result = await UserService.updateUserSettings(user.id, updates);
      
      if (result.success) {
        // Optimistically update local state
        setSettings(prev => prev ? { ...prev, ...updates } : null);
      }
      
      return result;
    } catch (err) {
      console.error('Error updating settings:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update settings' };
    }
  }, [user?.id]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    artistProfile,
    settings,
    loading,
    error,
    updateProfile,
    updateArtistProfile,
    updateSettings,
    refreshProfile,
  };
};
