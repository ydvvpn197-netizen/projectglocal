import { supabase } from '@/integrations/supabase/client';
import { SentimentAnalysisService } from './sentimentAnalysisService';
import { TrendPredictionService } from './trendPredictionService';
import { MLModelService } from './mlModelService';

export interface CommunityInsights {
  sentiment_analysis: {
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
  };
  trend_analysis: Array<{
    trend_type: string;
    trend_name: string;
    trend_score: number;
    trend_direction: 'rising' | 'falling' | 'stable';
    confidence_level: number;
  }>;
  predictions: Array<{
    prediction_type: string;
    prediction_target: string;
    predicted_value: number;
    confidence_score: number;
    prediction_horizon: string;
    prediction_date: string;
  }>;
  community_metrics: {
    total_posts: number;
    total_comments: number;
    total_users: number;
    engagement_rate: number;
    growth_rate: number;
  };
  recommendations: Array<{
    type: 'action' | 'insight' | 'warning';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
  }>;
}

export interface AnalyticsConfig {
  time_period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  geographic_scope?: {
    city?: string;
    state?: string;
    country?: string;
  };
  demographic_scope?: {
    age_groups?: string[];
    interests?: string[];
    user_types?: string[];
  };
  enabled_insights: string[];
  refresh_interval: number; // in seconds
}

export class CommunityAnalyticsService {
  private static instance: CommunityAnalyticsService;
  private sentimentService: SentimentAnalysisService;
  private trendService: TrendPredictionService;
  private mlService: MLModelService;

  public static getInstance(): CommunityAnalyticsService {
    if (!CommunityAnalyticsService.instance) {
      CommunityAnalyticsService.instance = new CommunityAnalyticsService();
    }
    return CommunityAnalyticsService.instance;
  }

  constructor() {
    this.sentimentService = SentimentAnalysisService.getInstance();
    this.trendService = TrendPredictionService.getInstance();
    this.mlService = MLModelService.getInstance();
  }

  /**
   * Get comprehensive community insights
   */
  async getCommunityInsights(config: AnalyticsConfig): Promise<CommunityInsights> {
    try {
      const insights: CommunityInsights = {
        sentiment_analysis: {
          total_analyses: 0,
          average_sentiment: 0,
          sentiment_distribution: { positive: 0, negative: 0, neutral: 0 },
          sentiment_evolution: []
        },
        trend_analysis: [],
        predictions: [],
        community_metrics: {
          total_posts: 0,
          total_comments: 0,
          total_users: 0,
          engagement_rate: 0,
          growth_rate: 0
        },
        recommendations: []
      };

      // Get sentiment analysis
      if (config.enabled_insights.includes('sentiment')) {
        insights.sentiment_analysis = await this.sentimentService.getCommunitySentimentSummary(
          config.time_period as 'day' | 'week' | 'month'
        );
      }

      // Get trend analysis
      if (config.enabled_insights.includes('trends')) {
        insights.trend_analysis = await this.trendService.analyzeTrends(
          config.time_period as 'day' | 'week' | 'month',
          ['topic', 'sentiment', 'engagement', 'location', 'demographic']
        );
      }

      // Get predictions
      if (config.enabled_insights.includes('predictions')) {
        const predictions = await Promise.all([
          this.trendService.generatePredictions('engagement', 'short'),
          this.trendService.generatePredictions('growth', 'medium'),
          this.trendService.generatePredictions('sentiment', 'long')
        ]);
        insights.predictions = predictions.flat();
      }

      // Get community metrics
      if (config.enabled_insights.includes('metrics')) {
        insights.community_metrics = await this.getCommunityMetrics(config);
      }

      // Generate recommendations
      if (config.enabled_insights.includes('recommendations')) {
        insights.recommendations = await this.generateRecommendations(insights);
      }

      return insights;
    } catch (error) {
      console.error('Error getting community insights:', error);
      throw error;
    }
  }

  /**
   * Get community metrics
   */
  private async getCommunityMetrics(config: AnalyticsConfig) {
    try {
      const endDate = new Date();
      const startDate = this.getStartDate(config.time_period);

      // Get total posts
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Get total comments
      const { count: totalComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Calculate engagement rate
      const engagementRate = totalPosts && totalUsers ? 
        ((totalPosts + totalComments) / totalUsers) * 100 : 0;

      // Calculate growth rate (simplified)
      const previousPeriodStart = new Date(startDate);
      previousPeriodStart.setTime(previousPeriodStart.getTime() - (endDate.getTime() - startDate.getTime()));
      
      const { count: previousPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', startDate.toISOString());

      const growthRate = previousPosts && totalPosts ? 
        ((totalPosts - previousPosts) / previousPosts) * 100 : 0;

      return {
        total_posts: totalPosts || 0,
        total_comments: totalComments || 0,
        total_users: totalUsers || 0,
        engagement_rate: engagementRate,
        growth_rate: growthRate
      };
    } catch (error) {
      console.error('Error getting community metrics:', error);
      return {
        total_posts: 0,
        total_comments: 0,
        total_users: 0,
        engagement_rate: 0,
        growth_rate: 0
      };
    }
  }

  /**
   * Generate actionable recommendations
   */
  private async generateRecommendations(insights: CommunityInsights): Promise<Array<{
    type: 'action' | 'insight' | 'warning';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
  }>> {
    const recommendations = [];

    // Sentiment-based recommendations
    if (insights.sentiment_analysis.average_sentiment < -0.2) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Negative Sentiment Alert',
        description: 'Community sentiment is significantly negative. Consider addressing concerns and improving communication.',
        priority: 'high' as const,
        actionable: true
      });
    } else if (insights.sentiment_analysis.average_sentiment > 0.3) {
      recommendations.push({
        type: 'insight' as const,
        title: 'Positive Community Health',
        description: 'Community sentiment is very positive. This is a great time to introduce new features or initiatives.',
        priority: 'medium' as const,
        actionable: true
      });
    }

    // Growth-based recommendations
    if (insights.community_metrics.growth_rate < -10) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Declining Growth',
        description: 'Community growth has declined significantly. Consider reviewing engagement strategies and content quality.',
        priority: 'high' as const,
        actionable: true
      });
    } else if (insights.community_metrics.growth_rate > 20) {
      recommendations.push({
        type: 'insight' as const,
        title: 'Strong Growth Momentum',
        description: 'Community is experiencing strong growth. Consider scaling infrastructure and moderation resources.',
        priority: 'medium' as const,
        actionable: true
      });
    }

    // Engagement-based recommendations
    if (insights.community_metrics.engagement_rate < 5) {
      recommendations.push({
        type: 'action' as const,
        title: 'Low Engagement Rate',
        description: 'Community engagement is low. Consider creating more interactive content, polls, or discussion topics.',
        priority: 'high' as const,
        actionable: true
      });
    }

    // Trend-based recommendations
    const risingTrends = insights.trend_analysis.filter(trend => trend.trend_direction === 'rising');
    if (risingTrends.length > 0) {
      recommendations.push({
        type: 'insight' as const,
        title: 'Rising Trends Detected',
        description: `Several trends are rising: ${risingTrends.map(t => t.trend_name).join(', ')}. Consider creating content around these topics.`,
        priority: 'medium' as const,
        actionable: true
      });
    }

    // Prediction-based recommendations
    const highConfidencePredictions = insights.predictions.filter(p => p.confidence_score > 0.8);
    if (highConfidencePredictions.length > 0) {
      recommendations.push({
        type: 'insight' as const,
        title: 'High-Confidence Predictions',
        description: `AI models predict significant changes in ${highConfidencePredictions.map(p => p.prediction_target).join(', ')}. Prepare accordingly.`,
        priority: 'medium' as const,
        actionable: true
      });
    }

    return recommendations;
  }

  /**
   * Store analytics data for historical tracking
   */
  async storeAnalyticsData(insights: CommunityInsights, config: AnalyticsConfig): Promise<void> {
    try {
      const analyticsData = {
        metric_name: 'community_insights',
        metric_value: insights.sentiment_analysis.average_sentiment,
        metric_type: 'score' as const,
        time_period: config.time_period,
        geographic_scope: config.geographic_scope || {},
        demographic_scope: config.demographic_scope || {},
        calculated_at: new Date(),
        metadata: {
          sentiment_analysis: insights.sentiment_analysis,
          trend_count: insights.trend_analysis.length,
          prediction_count: insights.predictions.length,
          community_metrics: insights.community_metrics,
          recommendation_count: insights.recommendations.length
        }
      };

      const { error } = await supabase
        .from('community_analytics')
        .insert(analyticsData);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error storing analytics data:', error);
      throw error;
    }
  }

  /**
   * Get historical analytics data
   */
  async getHistoricalAnalytics(
    metricNames: string[],
    timePeriod: string,
    startDate?: Date,
    endDate?: Date
  ) {
    try {
      let query = supabase
        .from('community_analytics')
        .select('*')
        .in('metric_name', metricNames)
        .eq('time_period', timePeriod);

      if (startDate) {
        query = query.gte('calculated_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('calculated_at', endDate.toISOString());
      }

      const { data, error } = await query.order('calculated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting historical analytics:', error);
      throw error;
    }
  }

  /**
   * Train ML models with community data
   */
  async trainModels(): Promise<{ sentimentModelId: string; trendModelId: string }> {
    try {
      // Get training data
      const sentimentTrainingData = await this.getSentimentTrainingData();
      const trendTrainingData = await this.getTrendTrainingData();

      // Train models
      const sentimentModelId = await this.mlService.trainSentimentModel(sentimentTrainingData);
      const trendModelId = await this.mlService.trainTrendModel(trendTrainingData);

      // Activate models
      await this.mlService.activateModel(sentimentModelId);
      await this.mlService.activateModel(trendModelId);

      return { sentimentModelId, trendModelId };
    } catch (error) {
      console.error('Error training models:', error);
      throw error;
    }
  }

  /**
   * Get sentiment training data
   */
  private async getSentimentTrainingData() {
    try {
      const { data } = await supabase
        .from('community_sentiment')
        .select('*')
        .limit(1000);

      if (!data) return { input_data: [], target_data: [], features: [], metadata: {} };

      const inputData = data.map(item => ({
        text: item.analysis_metadata?.text || '',
        content_type: item.content_type,
        location: item.analysis_metadata?.location || {}
      }));

      const targetData = data.map(item => ({
        sentiment_score: item.sentiment_score,
        sentiment_label: item.sentiment_label
      }));

      return {
        input_data: inputData,
        target_data: targetData,
        features: ['text', 'content_type', 'location'],
        metadata: {
          training_samples: data.length,
          date_range: {
            start: data[data.length - 1]?.created_at,
            end: data[0]?.created_at
          }
        }
      };
    } catch (error) {
      console.error('Error getting sentiment training data:', error);
      return { input_data: [], target_data: [], features: [], metadata: {} };
    }
  }

  /**
   * Get trend training data
   */
  private async getTrendTrainingData() {
    try {
      const { data } = await supabase
        .from('community_analytics')
        .select('*')
        .eq('metric_name', 'community_insights')
        .limit(1000);

      if (!data) return { input_data: [], target_data: [], features: [], metadata: {} };

      const inputData = data.map(item => ({
        time_period: item.time_period,
        geographic_scope: item.geographic_scope,
        demographic_scope: item.demographic_scope,
        previous_value: item.metric_value
      }));

      const targetData = data.map(item => ({
        trend_value: item.metric_value,
        trend_direction: item.metric_value > 0 ? 'rising' : item.metric_value < 0 ? 'falling' : 'stable'
      }));

      return {
        input_data: inputData,
        target_data: targetData,
        features: ['time_period', 'geographic_scope', 'demographic_scope', 'previous_value'],
        metadata: {
          training_samples: data.length,
          date_range: {
            start: data[data.length - 1]?.calculated_at,
            end: data[0]?.calculated_at
          }
        }
      };
    } catch (error) {
      console.error('Error getting trend training data:', error);
      return { input_data: [], target_data: [], features: [], metadata: {} };
    }
  }

  /**
   * Get start date based on time period
   */
  private getStartDate(timePeriod: string): Date {
    const endDate = new Date();
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
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    return startDate;
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(
    format: 'json' | 'csv' = 'json',
    timePeriod: string = 'week'
  ): Promise<string> {
    try {
      const insights = await this.getCommunityInsights({
        time_period: timePeriod as any,
        enabled_insights: ['sentiment', 'trends', 'predictions', 'metrics', 'recommendations']
      });

      if (format === 'json') {
        return JSON.stringify(insights, null, 2);
      } else {
        // Convert to CSV format
        const csvData = this.convertToCSV(insights);
        return csvData;
      }
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }

  /**
   * Convert insights to CSV format
   */
  private convertToCSV(insights: CommunityInsights): string {
    const csvRows = [];
    
    // Add headers
    csvRows.push('Metric,Value,Type,Timestamp');
    
    // Add sentiment data
    csvRows.push(`Average Sentiment,${insights.sentiment_analysis.average_sentiment},sentiment,${new Date().toISOString()}`);
    csvRows.push(`Total Analyses,${insights.sentiment_analysis.total_analyses},count,${new Date().toISOString()}`);
    
    // Add community metrics
    csvRows.push(`Total Posts,${insights.community_metrics.total_posts},count,${new Date().toISOString()}`);
    csvRows.push(`Total Comments,${insights.community_metrics.total_comments},count,${new Date().toISOString()}`);
    csvRows.push(`Total Users,${insights.community_metrics.total_users},count,${new Date().toISOString()}`);
    csvRows.push(`Engagement Rate,${insights.community_metrics.engagement_rate},percentage,${new Date().toISOString()}`);
    csvRows.push(`Growth Rate,${insights.community_metrics.growth_rate},percentage,${new Date().toISOString()}`);
    
    return csvRows.join('\n');
  }
}
