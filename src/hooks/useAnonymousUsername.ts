import { useState, useEffect, useCallback } from 'react';
import { anonymousUsernameService, AnonymousUsername, UsernameGenerationOptions } from '@/services/anonymousUsernameService';

export interface UseAnonymousUsernameReturn {
  anonymousUser: AnonymousUsername | null;
  isLoading: boolean;
  error: string | null;
  createAnonymousUser: (options?: UsernameGenerationOptions) => Promise<void>;
  regenerateUsername: (options?: UsernameGenerationOptions) => Promise<void>;
  revealIdentity: (userId: string) => Promise<void>;
  getPrivacyRecommendations: (userBehavior: {
    postFrequency: number;
    commentFrequency: number;
    locationSharing: boolean;
    realNameUsage: boolean;
  }) => { recommendedLevel: 'low' | 'medium' | 'high' | 'maximum'; reasons: string[] };
  clearError: () => void;
}

export const useAnonymousUsername = (): UseAnonymousUsernameReturn => {
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUsername | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate or retrieve session ID
  const getSessionId = useCallback((): string => {
    let sessionId = localStorage.getItem('anonymous_session_id');
    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('anonymous_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Load existing anonymous user on mount
  useEffect(() => {
    const loadAnonymousUser = async () => {
      try {
        setIsLoading(true);
        const sessionId = getSessionId();
        const user = await anonymousUsernameService.getAnonymousUser(sessionId);
        setAnonymousUser(user);
      } catch (err) {
        console.error('Error loading anonymous user:', err);
        setError('Failed to load anonymous user');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnonymousUser();
  }, [getSessionId]);

  // Create anonymous user
  const createAnonymousUser = useCallback(async (options?: UsernameGenerationOptions) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const sessionId = getSessionId();
      const user = await anonymousUsernameService.createAnonymousUser(sessionId, undefined, options);
      setAnonymousUser(user);
    } catch (err) {
      console.error('Error creating anonymous user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create anonymous user');
    } finally {
      setIsLoading(false);
    }
  }, [getSessionId]);

  // Regenerate username
  const regenerateUsername = useCallback(async (options?: UsernameGenerationOptions) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const sessionId = getSessionId();
      const user = await anonymousUsernameService.regenerateUsername(sessionId, options);
      setAnonymousUser(user);
    } catch (err) {
      console.error('Error regenerating username:', err);
      setError(err instanceof Error ? err.message : 'Failed to regenerate username');
    } finally {
      setIsLoading(false);
    }
  }, [getSessionId]);

  // Reveal identity
  const revealIdentity = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const sessionId = getSessionId();
      const user = await anonymousUsernameService.revealIdentity(sessionId, userId);
      setAnonymousUser(user);
    } catch (err) {
      console.error('Error revealing identity:', err);
      setError(err instanceof Error ? err.message : 'Failed to reveal identity');
    } finally {
      setIsLoading(false);
    }
  }, [getSessionId]);

  // Get privacy recommendations
  const getPrivacyRecommendations = useCallback((userBehavior: {
    postFrequency: number;
    commentFrequency: number;
    locationSharing: boolean;
    realNameUsage: boolean;
  }) => {
    return anonymousUsernameService.getPrivacyRecommendations(userBehavior);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    anonymousUser,
    isLoading,
    error,
    createAnonymousUser,
    regenerateUsername,
    revealIdentity,
    getPrivacyRecommendations,
    clearError
  };
};
