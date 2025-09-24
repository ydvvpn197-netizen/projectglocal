import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { PrivacyService, PrivacySettings, AnonymousUser } from '@/services/privacyService';

export const usePrivacy = () => {
  const { user } = useAuth();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load privacy settings
  const loadPrivacySettings = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const settings = await PrivacyService.getPrivacySettings(user.id);
      setPrivacySettings(settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update privacy settings
  const updatePrivacySettings = useCallback(async (updates: Partial<PrivacySettings>) => {
    if (!user || !privacySettings) return false;
    
    setLoading(true);
    setError(null);
    try {
      const success = await PrivacyService.updatePrivacySettings(user.id, updates);
      if (success) {
        setPrivacySettings(prev => prev ? { ...prev, ...updates } : null);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update privacy settings');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, privacySettings]);

  // Initialize anonymous mode
  const initializeAnonymousMode = useCallback(async () => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    try {
      const sessionId = PrivacyService.getSessionId();
      const anonUser = await PrivacyService.getOrCreateAnonymousUser(sessionId);
      
      if (anonUser) {
        setAnonymousUser(anonUser);
        setIsAnonymous(true);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize anonymous mode');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Exit anonymous mode
  const exitAnonymousMode = useCallback(() => {
    setIsAnonymous(false);
    setAnonymousUser(null);
  }, []);

  // Update anonymous user profile
  const updateAnonymousUser = useCallback(async (updates: Partial<AnonymousUser>) => {
    if (!anonymousUser) return false;
    
    setLoading(true);
    setError(null);
    try {
      const success = await PrivacyService.updateAnonymousUser(anonymousUser.id, updates);
      if (success) {
        setAnonymousUser(prev => prev ? { ...prev, ...updates } : null);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update anonymous profile');
      return false;
    } finally {
      setLoading(false);
    }
  }, [anonymousUser]);

  // Check if user can view profile
  const canViewProfile = useCallback(async (profileOwnerId: string) => {
    if (!user) return false;
    return await PrivacyService.canViewProfile(user.id, profileOwnerId);
  }, [user]);

  // Check if user can send message
  const canSendMessage = useCallback(async (recipientId: string) => {
    if (!user) return false;
    return await PrivacyService.canSendMessage(user.id, recipientId);
  }, [user]);

  // Check if user can view activity
  const canViewActivity = useCallback(async (activityOwnerId: string) => {
    if (!user) return false;
    return await PrivacyService.canViewActivity(user.id, activityOwnerId);
  }, [user]);

  // Filter content by privacy
  const filterContentByPrivacy = useCallback(async <T extends { user_id: string }>(
    content: T[]
  ) => {
    if (!user) return content;
    return await PrivacyService.filterContentByPrivacy(content, user.id);
  }, [user]);

  // Bulk update privacy settings
  const updateBulkPrivacySettings = useCallback(async (
    category: 'profile' | 'activity' | 'messages' | 'discovery' | 'data' | 'anonymous' | 'location',
    settings: Record<string, boolean | string>
  ) => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    try {
      const success = await PrivacyService.updateBulkPrivacySettings(user.id, category, settings);
      if (success) {
        await loadPrivacySettings(); // Reload settings
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update privacy settings');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, loadPrivacySettings]);

  // Get default privacy settings
  const getDefaultPrivacySettings = useCallback(() => {
    if (!user) return null;
    return PrivacyService.getDefaultPrivacySettings(user.id);
  }, [user]);

  // Reset privacy settings to default
  const resetPrivacySettings = useCallback(async () => {
    if (!user) return false;
    
    const defaultSettings = getDefaultPrivacySettings();
    if (!defaultSettings) return false;
    
    return await updatePrivacySettings(defaultSettings);
  }, [user, getDefaultPrivacySettings, updatePrivacySettings]);

  // Load settings on mount
  useEffect(() => {
    if (user) {
      loadPrivacySettings();
    }
  }, [user, loadPrivacySettings]);

  return {
    // State
    privacySettings,
    anonymousUser,
    isAnonymous,
    loading,
    error,
    
    // Privacy settings methods
    loadPrivacySettings,
    updatePrivacySettings,
    updateBulkPrivacySettings,
    resetPrivacySettings,
    getDefaultPrivacySettings,
    
    // Anonymous mode methods
    initializeAnonymousMode,
    exitAnonymousMode,
    updateAnonymousUser,
    
    // Privacy check methods
    canViewProfile,
    canSendMessage,
    canViewActivity,
    filterContentByPrivacy,
    
    // Utility methods
    generateSessionId: PrivacyService.generateSessionId,
    getSessionId: PrivacyService.getSessionId
  };
};
