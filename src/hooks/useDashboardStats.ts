import { useState, useEffect, useCallback } from 'react';
import { PlatformAnalyticsService, DashboardStats } from '@/services/platformAnalyticsService';

export const useDashboardStats = (refreshInterval: number = 30000) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const analyticsService = new PlatformAnalyticsService();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dashboardStats = await analyticsService.getDashboardStats();
      setStats(dashboardStats);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, [analyticsService]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Set up auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchStats, refreshInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    lastRefresh,
    refresh
  };
};
