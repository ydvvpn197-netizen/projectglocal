import { useState, useCallback, useEffect } from 'react';
import { recommendationService } from '@/services/recommendationService';
import { Recommendation } from '@/types/recommendations';
import { useAuth } from './useAuth';

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  const { user } = useAuth();

  const fetchRecommendations = useCallback(async () => {
    if (!user) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recs = await recommendationService.getRecommendations(user.id, limit);
      setRecommendations(recs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  const refreshRecommendations = useCallback(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const updateUserPreference = useCallback(async (category: string, weight: number) => {
    if (!user) return;

    try {
      await recommendationService.updateUserPreferences(user.id, category, weight);
      // Refresh recommendations after updating preferences
      await fetchRecommendations();
    } catch (err) {
      console.error('Error updating user preference:', err);
    }
  }, [user, fetchRecommendations]);

  const trackUserBehavior = useCallback(async (
    action: string, 
    contentType: string, 
    contentId: string
  ) => {
    if (!user) return;

    try {
      await recommendationService.trackUserBehavior(user.id, action, contentType, contentId);
    } catch (err) {
      console.error('Error tracking user behavior:', err);
    }
  }, [user]);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
  }, []);

  // Fetch recommendations on mount and when user/limit changes
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    loading,
    error,
    limit,
    fetchRecommendations,
    refreshRecommendations,
    updateUserPreference,
    trackUserBehavior,
    changeLimit
  };
};
