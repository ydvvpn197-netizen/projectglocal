import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeInsightsConfig {
  timePeriod: 'day' | 'week' | 'month';
  autoRefresh: boolean;
  refreshInterval: number; // in milliseconds
}

interface InsightsData {
  sentiment: any;
  trends: any[];
  predictions: any[];
  lastUpdated: Date;
}

export const useRealTimeInsights = (config: RealTimeInsightsConfig) => {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionRef = useRef<any>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Dynamically import services
      const [
        { optimizedSentimentService },
        { optimizedTrendService }
      ] = await Promise.all([
        import('../services/optimizedSentimentService'),
        import('../services/optimizedTrendService')
      ]);

      // Load data in parallel
      const [sentiment, trends, predictions] = await Promise.all([
        optimizedSentimentService.getCommunitySentimentSummary(config.timePeriod),
        optimizedTrendService.analyzeTrends(config.timePeriod),
        optimizedTrendService.generatePredictions('engagement', 'short')
      ]);

      setData({
        sentiment,
        trends,
        predictions,
        lastUpdated: new Date()
      });

    } catch (err) {
      console.error('Error loading real-time insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [config.timePeriod]);

  // Set up real-time subscriptions
  const setupRealtimeSubscriptions = useCallback(() => {
    // Subscribe to sentiment changes
    const sentimentSubscription = supabase
      .channel('sentiment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_sentiment'
        },
        (payload) => {
          console.log('Sentiment data changed:', payload);
          // Reload data when sentiment changes
          loadData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_trends'
        },
        (payload) => {
          console.log('Trends data changed:', payload);
          // Reload data when trends change
          loadData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_predictions'
        },
        (payload) => {
          console.log('Predictions data changed:', payload);
          // Reload data when predictions change
          loadData();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    subscriptionRef.current = sentimentSubscription;
  }, [loadData]);

  // Set up polling interval
  const setupPolling = useCallback(() => {
    if (config.autoRefresh && config.refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        loadData();
      }, config.refreshInterval);
    }
  }, [config.autoRefresh, config.refreshInterval, loadData]);

  // Clean up subscriptions and intervals
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  // Initialize and manage subscriptions
  useEffect(() => {
    loadData();
    setupRealtimeSubscriptions();
    setupPolling();

    return cleanup;
  }, [loadData, setupRealtimeSubscriptions, setupPolling, cleanup]);

  // Update polling when config changes
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setupPolling();
  }, [setupPolling]);

  // Manual refresh function
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Connection health check
  const checkConnection = useCallback(async () => {
    try {
      const { data: healthCheck } = await supabase
        .from('community_sentiment')
        .select('id')
        .limit(1);
      
      return { healthy: true, data: healthCheck };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }, []);

  return {
    data,
    loading,
    error,
    isConnected,
    refresh,
    checkConnection,
    lastUpdated: data?.lastUpdated
  };
};

export default useRealTimeInsights;
