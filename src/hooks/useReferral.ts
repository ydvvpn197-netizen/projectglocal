import { useState, useCallback, useEffect } from 'react';
import { ReferralService } from '@/services/referralService';
import { useAuth } from '@/hooks/useAuth';
import type { Referral, ReferralAnalytics, ReferralMetrics } from '@/types/marketing';

interface UseReferralOptions {
  onReferralCreated?: (referral: Referral) => void;
  onReferralCompleted?: (referral: Referral) => void;
  onError?: (error: Error) => void;
}

interface UseReferralReturn {
  // State
  referrals: Referral[];
  analytics: ReferralAnalytics | null;
  referralCode: string | null;
  referralLink: string | null;
  loading: boolean;
  error: Error | null;
  
  // Actions
  createReferral: (data: any) => Promise<Referral>;
  getReferrals: (filters?: any) => Promise<void>;
  getReferralByCode: (code: string) => Promise<Referral | null>;
  completeReferral: (referralId: string, referredUserId: string) => Promise<Referral>;
  generateReferralLink: (platform?: string) => Promise<string>;
  trackReferralClick: (code: string, platform?: string) => Promise<void>;
  trackReferralConversion: (code: string, referredUserId: string) => Promise<void>;
  validateReferralCode: (code: string) => Promise<any>;
  getReferralLeaderboard: (limit?: number) => Promise<any>;
  getReferralRewardsHistory: () => Promise<any>;
  
  // Utility
  copyReferralLink: () => Promise<void>;
  shareReferralLink: (platform: string) => Promise<void>;
}

export const useReferral = (options: UseReferralOptions = {}): UseReferralReturn => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load user's referral data on mount
  useEffect(() => {
    if (user) {
      loadUserReferralData();
    }
  }, [user]);

  const loadUserReferralData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get user's referral code
      const code = await ReferralService.getUserReferralCode(user.id);
      setReferralCode(code);

      // Generate referral link
      if (code) {
        const link = await ReferralService.generateReferralLink(user.id);
        setReferralLink(link);
      }

      // Load user's referrals
      await getReferrals({ referrer_id: user.id });

      // Load analytics
      const analyticsData = await ReferralService.getReferralAnalytics(user.id);
      setAnalytics(analyticsData);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [user, options]);

  const createReferral = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      const referral = await ReferralService.createReferral(data);
      
      // Update local state
      setReferrals(prev => [referral, ...prev]);
      
      // Reload user data to get updated code and link
      await loadUserReferralData();
      
      options.onReferralCreated?.(referral);
      
      return referral;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadUserReferralData, options]);

  const getReferrals = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);

      const referralsData = await ReferralService.getReferrals(filters);
      setReferrals(referralsData);
      
      return referralsData;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const getReferralByCode = useCallback(async (code: string) => {
    try {
      setError(null);
      return await ReferralService.getReferralByCode(code);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      throw error;
    }
  }, [options]);

  const completeReferral = useCallback(async (referralId: string, referredUserId: string) => {
    try {
      setLoading(true);
      setError(null);

      const referral = await ReferralService.completeReferral(referralId, referredUserId);
      
      // Update local state
      setReferrals(prev => prev.map(r => 
        r.id === referralId ? referral : r
      ));
      
      // Reload analytics
      if (user) {
        const analyticsData = await ReferralService.getReferralAnalytics(user.id);
        setAnalytics(analyticsData);
      }
      
      options.onReferralCompleted?.(referral);
      
      return referral;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, options]);

  const generateReferralLink = useCallback(async (platform?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const link = await ReferralService.generateReferralLink(user.id, platform);
      setReferralLink(link);
      return link;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      throw error;
    }
  }, [user, options]);

  const trackReferralClick = useCallback(async (code: string, platform?: string) => {
    try {
      setError(null);
      await ReferralService.trackReferralClick(code, platform);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      throw error;
    }
  }, [options]);

  const trackReferralConversion = useCallback(async (code: string, referredUserId: string) => {
    try {
      setError(null);
      await ReferralService.trackReferralConversion(code, referredUserId);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      throw error;
    }
  }, [options]);

  const validateReferralCode = useCallback(async (code: string) => {
    try {
      setError(null);
      return await ReferralService.validateReferralCode(code);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      throw error;
    }
  }, [options]);

  const getReferralLeaderboard = useCallback(async (limit: number = 10) => {
    try {
      setError(null);
      return await ReferralService.getReferralLeaderboard(limit);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      throw error;
    }
  }, [options]);

  const getReferralRewardsHistory = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      return await ReferralService.getReferralRewardsHistory(user.id);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      throw error;
    }
  }, [user, options]);

  const copyReferralLink = useCallback(async () => {
    if (!referralLink) {
      throw new Error('No referral link available');
    }

    try {
      await navigator.clipboard.writeText(referralLink);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      throw error;
    }
  }, [referralLink, options]);

  const shareReferralLink = useCallback(async (platform: string) => {
    if (!referralLink || !referralCode) {
      throw new Error('No referral link available');
    }

    try {
      // Track the share
      await trackReferralClick(referralCode, platform);
      
      // Open share dialog (this would integrate with social sharing service)
      const shareUrl = `${referralLink}&platform=${platform}`;
      window.open(shareUrl, '_blank');
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      throw error;
    }
  }, [referralLink, referralCode, trackReferralClick, options]);

  return {
    // State
    referrals,
    analytics,
    referralCode,
    referralLink,
    loading,
    error,
    
    // Actions
    createReferral,
    getReferrals,
    getReferralByCode,
    completeReferral,
    generateReferralLink,
    trackReferralClick,
    trackReferralConversion,
    validateReferralCode,
    getReferralLeaderboard,
    getReferralRewardsHistory,
    
    // Utility
    copyReferralLink,
    shareReferralLink
  };
};

// Hook for managing referral analytics
export const useReferralAnalytics = (userId?: string) => {
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [metrics, setMetrics] = useState<ReferralMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadAnalytics = useCallback(async (id?: string) => {
    try {
      setLoading(true);
      setError(null);

      const analyticsData = await ReferralService.getReferralAnalytics(id);
      setAnalytics(analyticsData);
      
      const metricsData = await ReferralService.getReferralMetrics(id);
      setMetrics(metricsData);
      
      return { analytics: analyticsData, metrics: metricsData };
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAnalytics = useCallback(() => {
    return loadAnalytics(userId);
  }, [userId, loadAnalytics]);

  return {
    analytics,
    metrics,
    loading,
    error,
    loadAnalytics,
    refreshAnalytics
  };
};

// Hook for referral validation
export const useReferralValidation = () => {
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const validateCode = useCallback(async (code: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await ReferralService.validateReferralCode(code);
      setValidationResult(result);
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setError(null);
  }, []);

  return {
    validationResult,
    loading,
    error,
    validateCode,
    clearValidation
  };
};
