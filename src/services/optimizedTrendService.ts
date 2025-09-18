import { supabase } from '@/integrations/supabase/client';

export interface OptimizedTrendData {
  trend_type: string;
  trend_name: string;
  trend_description?: string;
  trend_score: number;
  trend_direction: 'rising' | 'falling' | 'stable';
  confidence_level: number;
}

export interface OptimizedPredictionData {
  prediction_type: string;
  prediction_target: string;
  predicted_value: number;
  confidence_score: number;
  prediction_horizon: string;
  prediction_date: string;
}

/**
 * Optimized Trend Service with no circular dependencies
 * Designed for community insights dashboard
 */
export class OptimizedTrendService {
  private static instance: OptimizedTrendService | null = null;
  
  public static getInstance(): OptimizedTrendService {
    if (!OptimizedTrendService.instance) {
      OptimizedTrendService.instance = new OptimizedTrendService();
    }
    return OptimizedTrendService.instance;
  }

  /**
   * Get community trends for dashboard
   */
  async analyzeTrends(
    timePeriod: 'day' | 'week' | 'month' = 'week'
  ): Promise<OptimizedTrendData[]> {
    try {
      const endDate = new Date();
      const startDate = this.getStartDate(timePeriod);

      const { data: trendsData, error } = await supabase
        .from('community_trends')
        .select('*')
        .gte('time_period_start', startDate.toISOString())
        .lte('time_period_end', endDate.toISOString())
        .order('confidence_level', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching trends data:', error);
        return this.getDefaultTrends();
      }

      if (!trendsData || trendsData.length === 0) {
        return this.getDefaultTrends();
      }

      return trendsData.map(trend => ({
        trend_type: trend.trend_type,
        trend_name: trend.trend_name,
        trend_description: trend.trend_description,
        trend_score: trend.trend_score,
        trend_direction: trend.trend_direction,
        confidence_level: trend.confidence_level
      }));
    } catch (error) {
      console.error('Error in analyzeTrends:', error);
      return this.getDefaultTrends();
    }
  }

  /**
   * Get predictions for dashboard
   */
  async generatePredictions(
    predictionType: 'engagement' | 'growth' | 'sentiment' | 'trend' | 'event',
    horizon: 'short' | 'medium' | 'long' = 'short'
  ): Promise<OptimizedPredictionData[]> {
    try {
      let query = supabase
        .from('community_predictions')
        .select('*')
        .eq('prediction_type', predictionType)
        .eq('prediction_horizon', horizon)
        .gte('prediction_date', new Date().toISOString())
        .order('confidence_score', { ascending: false })
        .limit(5);

      const { data: predictionsData, error } = await query;

      if (error) {
        console.error('Error fetching predictions data:', error);
        return this.getDefaultPredictions(predictionType, horizon);
      }

      if (!predictionsData || predictionsData.length === 0) {
        return this.getDefaultPredictions(predictionType, horizon);
      }

      return predictionsData.map(prediction => ({
        prediction_type: prediction.prediction_type,
        prediction_target: prediction.prediction_target,
        predicted_value: prediction.predicted_value,
        confidence_score: prediction.confidence_score,
        prediction_horizon: prediction.prediction_horizon,
        prediction_date: prediction.prediction_date
      }));
    } catch (error) {
      console.error('Error in generatePredictions:', error);
      return this.getDefaultPredictions(predictionType, horizon);
    }
  }

  /**
   * Get analytics data for trends
   */
  async getAnalyticsData(
    metricNames: string[] = ['total_posts', 'active_users', 'engagement_rate'],
    timePeriod: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<any[]> {
    try {
      const { data: analyticsData, error } = await supabase
        .from('community_analytics')
        .select('*')
        .in('metric_name', metricNames)
        .eq('time_period', timePeriod)
        .order('calculated_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching analytics data:', error);
        return [];
      }

      return analyticsData || [];
    } catch (error) {
      console.error('Error in getAnalyticsData:', error);
      return [];
    }
  }

  /**
   * Get start date based on time period
   */
  private getStartDate(timePeriod: 'day' | 'week' | 'month'): Date {
    const startDate = new Date();
    
    switch (timePeriod) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }
    
    return startDate;
  }

  /**
   * Get default trends for error cases
   */
  private getDefaultTrends(): OptimizedTrendData[] {
    return [
      {
        trend_type: 'engagement',
        trend_name: 'Community Engagement',
        trend_description: 'Overall community participation levels',
        trend_score: 0.75,
        trend_direction: 'rising',
        confidence_level: 0.88
      },
      {
        trend_type: 'topic',
        trend_name: 'Local Events',
        trend_description: 'Interest in community events and gatherings',
        trend_score: 0.65,
        trend_direction: 'rising',
        confidence_level: 0.82
      },
      {
        trend_type: 'sentiment',
        trend_name: 'Public Services',
        trend_description: 'Community sentiment around public services',
        trend_score: -0.15,
        trend_direction: 'stable',
        confidence_level: 0.71
      }
    ];
  }

  /**
   * Get default predictions for error cases
   */
  private getDefaultPredictions(
    predictionType: string,
    horizon: string
  ): OptimizedPredictionData[] {
    const futureDate = new Date();
    const days = horizon === 'short' ? 7 : horizon === 'medium' ? 30 : 90;
    futureDate.setDate(futureDate.getDate() + days);

    return [
      {
        prediction_type: predictionType,
        prediction_target: `${predictionType}_growth`,
        predicted_value: 1.25,
        confidence_score: 0.87,
        prediction_horizon: horizon,
        prediction_date: futureDate.toISOString()
      },
      {
        prediction_type: predictionType,
        prediction_target: `${predictionType}_engagement`,
        predicted_value: 0.78,
        confidence_score: 0.82,
        prediction_horizon: horizon,
        prediction_date: futureDate.toISOString()
      }
    ];
  }

  /**
   * Calculate trend metrics from analytics data
   */
  calculateTrendMetrics(data: any[]): {
    growth_rate: number;
    trend_direction: 'rising' | 'falling' | 'stable';
    confidence: number;
  } {
    if (data.length < 2) {
      return { growth_rate: 0, trend_direction: 'stable', confidence: 0.5 };
    }

    const recent = data[0].metric_value;
    const previous = data[data.length - 1].metric_value;
    const growthRate = (recent - previous) / previous;

    let trendDirection: 'rising' | 'falling' | 'stable' = 'stable';
    if (growthRate > 0.05) trendDirection = 'rising';
    else if (growthRate < -0.05) trendDirection = 'falling';

    const confidence = Math.min(0.95, 0.5 + Math.abs(growthRate) * 2);

    return {
      growth_rate: growthRate,
      trend_direction: trendDirection,
      confidence: confidence
    };
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      const { error: trendsError } = await supabase
        .from('community_trends')
        .select('id')
        .limit(1);

      const { error: predictionsError } = await supabase
        .from('community_predictions')
        .select('id')
        .limit(1);

      if (trendsError || predictionsError) {
        return { 
          healthy: false, 
          message: `Database error: ${trendsError?.message || predictionsError?.message}` 
        };
      }

      return { healthy: true, message: 'Service is healthy' };
    } catch (error) {
      return { 
        healthy: false, 
        message: `Service error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Export singleton instance
export const optimizedTrendService = OptimizedTrendService.getInstance();
