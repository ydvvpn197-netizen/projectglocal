import { useState, useEffect } from 'react';
import { stripeService } from '@/services/stripeService';
import { useAuth } from '@/hooks/useAuth';
import type { UserPlanInfo } from '@/types/monetization';

export function useUserPlan() {
  const [planInfo, setPlanInfo] = useState<UserPlanInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserPlanInfo();
    } else {
      setPlanInfo(null);
      setIsLoading(false);
    }
  }, [user]);

  const loadUserPlanInfo = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const info = await stripeService.getUserPlanInfo(user.id);
      setPlanInfo(info);
    } catch (err) {
      console.error('Error loading user plan info:', err);
      setError(err instanceof Error ? err.message : 'Failed to load plan information');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPlanInfo = () => {
    loadUserPlanInfo();
  };

  return {
    planInfo,
    isLoading,
    error,
    refreshPlanInfo,
    // Convenience getters
    isVerified: planInfo?.is_verified || false,
    isPremium: planInfo?.is_premium || false,
    planType: planInfo?.plan_type || 'free',
    canCreateServices: planInfo?.can_create_services || false,
    canFeatureEvents: planInfo?.can_feature_events || false,
    maxServices: planInfo?.max_services || 0,
    maxFeaturedEvents: planInfo?.max_featured_events || 0,
  };
}
