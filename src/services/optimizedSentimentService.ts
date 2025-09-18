import { supabase } from '@/integrations/supabase/client';

export interface OptimizedSentimentData {
  total_analyses: number;
  average_sentiment: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  sentiment_evolution: Array<{
    date: string;
    average_sentiment: number;
    count: number;
  }>;
}

export interface SentimentTrendData {
  date: string;
  sentiment_score: number;
  confidence: number;
  content_type: string;
}

/**
 * Optimized Sentiment Service with no circular dependencies
 * Designed for community insights dashboard
 */
export class OptimizedSentimentService {
  private static instance: OptimizedSentimentService | null = null;
  
  public static getInstance(): OptimizedSentimentService {
    if (!OptimizedSentimentService.instance) {
      OptimizedSentimentService.instance = new OptimizedSentimentService();
    }
    return OptimizedSentimentService.instance;
  }

  /**
   * Get community sentiment summary for dashboard
   */
  async getCommunitySentimentSummary(
    timePeriod: 'day' | 'week' | 'month' = 'week'
  ): Promise<OptimizedSentimentData> {
    try {
      const endDate = new Date();
      const startDate = this.getStartDate(timePeriod);

      // Get sentiment data from database
      const { data: sentimentData, error } = await supabase
        .from('community_sentiment')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching sentiment data:', error);
        return this.getDefaultSentimentData();
      }

      if (!sentimentData || sentimentData.length === 0) {
        return this.getDefaultSentimentData();
      }

      return this.processSentimentData(sentimentData);
    } catch (error) {
      console.error('Error in getCommunitySentimentSummary:', error);
      return this.getDefaultSentimentData();
    }
  }

  /**
   * Get sentiment trends for charts
   */
  async getSentimentTrends(
    timePeriod: 'day' | 'week' | 'month' = 'week'
  ): Promise<SentimentTrendData[]> {
    try {
      const endDate = new Date();
      const startDate = this.getStartDate(timePeriod);

      const { data: sentimentData, error } = await supabase
        .from('community_sentiment')
        .select('created_at, sentiment_score, confidence_score, content_type')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error || !sentimentData) {
        console.error('Error fetching sentiment trends:', error);
        return [];
      }

      return sentimentData.map(item => ({
        date: new Date(item.created_at).toISOString().split('T')[0],
        sentiment_score: item.sentiment_score,
        confidence: item.confidence_score,
        content_type: item.content_type
      }));
    } catch (error) {
      console.error('Error in getSentimentTrends:', error);
      return [];
    }
  }

  /**
   * Process raw sentiment data into dashboard format
   */
  private processSentimentData(data: any[]): OptimizedSentimentData {
    const totalAnalyses = data.length;
    const averageSentiment = data.reduce((sum, item) => sum + item.sentiment_score, 0) / totalAnalyses;
    
    // Calculate distribution
    const positive = data.filter(item => item.sentiment_label === 'positive').length;
    const negative = data.filter(item => item.sentiment_label === 'negative').length;
    const neutral = data.filter(item => item.sentiment_label === 'neutral').length;
    
    const sentimentDistribution = {
      positive: Math.round((positive / totalAnalyses) * 100),
      negative: Math.round((negative / totalAnalyses) * 100),
      neutral: Math.round((neutral / totalAnalyses) * 100)
    };

    // Calculate evolution (daily averages)
    const dailyData = this.groupByDay(data);
    const sentimentEvolution = Object.entries(dailyData).map(([date, items]) => ({
      date,
      average_sentiment: items.reduce((sum: number, item: any) => sum + item.sentiment_score, 0) / items.length,
      count: items.length
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      total_analyses: totalAnalyses,
      average_sentiment: Math.round(averageSentiment * 100) / 100,
      sentiment_distribution: sentimentDistribution,
      sentiment_evolution: sentimentEvolution
    };
  }

  /**
   * Group sentiment data by day
   */
  private groupByDay(data: any[]): Record<string, any[]> {
    return data.reduce((acc: Record<string, any[]>, item: any) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as Record<string, any[]>);
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
   * Get default sentiment data for error cases
   */
  private getDefaultSentimentData(): OptimizedSentimentData {
    return {
      total_analyses: 0,
      average_sentiment: 0,
      sentiment_distribution: { positive: 0, negative: 0, neutral: 0 },
      sentiment_evolution: []
    };
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('community_sentiment')
        .select('id')
        .limit(1);

      if (error) {
        return { healthy: false, message: `Database error: ${error.message}` };
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
export const optimizedSentimentService = OptimizedSentimentService.getInstance();
