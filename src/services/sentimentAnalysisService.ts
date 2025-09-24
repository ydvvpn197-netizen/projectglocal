import { supabase } from '@/integrations/supabase/client';

export interface SentimentResult {
  sentiment_score: number;
  sentiment_label: 'positive' | 'negative' | 'neutral';
  confidence_score: number;
}

export interface SentimentAnalysisOptions {
  content_id: string;
  content_type: 'post' | 'comment' | 'news' | 'discussion';
  content_text: string;
  user_id?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export class SentimentAnalysisService {
  private static instance: SentimentAnalysisService;
  
  public static getInstance(): SentimentAnalysisService {
    if (!SentimentAnalysisService.instance) {
      SentimentAnalysisService.instance = new SentimentAnalysisService();
    }
    return SentimentAnalysisService.instance;
  }

  /**
   * Analyze sentiment of text content
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    try {
      // Enhanced sentiment analysis using multiple approaches
      const sentimentScore = this.calculateSentimentScore(text);
      const sentimentLabel = this.getSentimentLabel(sentimentScore);
      const confidenceScore = this.calculateConfidenceScore(text, sentimentScore);

      return {
        sentiment_score: sentimentScore,
        sentiment_label: sentimentLabel,
        confidence_score: confidenceScore
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        sentiment_score: 0,
        sentiment_label: 'neutral',
        confidence_score: 0.5
      };
    }
  }

  /**
   * Store sentiment analysis results in database
   */
  async storeSentimentAnalysis(options: SentimentAnalysisOptions): Promise<void> {
    try {
      const sentimentResult = await this.analyzeSentiment(options.content_text);
      
      const { error } = await supabase
        .from('community_sentiment')
        .insert({
          content_id: options.content_id,
          content_type: options.content_type,
          sentiment_score: sentimentResult.sentiment_score,
          sentiment_label: sentimentResult.sentiment_label,
          confidence_score: sentimentResult.confidence_score,
          analysis_metadata: {
            user_id: options.user_id,
            location: options.location,
            text_length: options.content_text.length,
            analysis_timestamp: new Date().toISOString()
          }
        });

      if (error) {
        console.error('Error storing sentiment analysis:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in storeSentimentAnalysis:', error);
      throw error;
    }
  }

  /**
   * Get sentiment trends for a specific time period
   */
  async getSentimentTrends(
    startDate: Date,
    endDate: Date,
    contentType?: string,
    location?: { city?: string; state?: string; country?: string }
  ) {
    try {
      let query = supabase
        .from('community_sentiment')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Calculate trend metrics
      const trends = this.calculateSentimentTrends(data || []);
      return trends;
    } catch (error) {
      console.error('Error getting sentiment trends:', error);
      throw error;
    }
  }

  /**
   * Get community sentiment summary
   */
  async getCommunitySentimentSummary(
    timePeriod: 'day' | 'week' | 'month' = 'week',
    location?: { city?: string; state?: string; country?: string }
  ) {
    try {
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
      }

      const { data, error } = await supabase
        .from('community_sentiment')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) {
        throw error;
      }

      return this.calculateSentimentSummary(data || []);
    } catch (error) {
      console.error('Error getting community sentiment summary:', error);
      throw error;
    }
  }

  /**
   * Calculate sentiment score using enhanced algorithm
   */
  private calculateSentimentScore(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    let wordCount = 0;

    // Enhanced sentiment word lists
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'excited',
      'awesome', 'brilliant', 'outstanding', 'perfect', 'beautiful', 'amazing', 'incredible', 'superb',
      'delighted', 'pleased', 'satisfied', 'content', 'joyful', 'cheerful', 'optimistic', 'hopeful',
      'successful', 'achievement', 'victory', 'triumph', 'celebration', 'congratulations', 'praise'
    ];

    const negativeWords = [
      'bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'sad', 'disappointed', 'frustrated',
      'horrible', 'disgusting', 'annoying', 'irritating', 'upset', 'worried', 'concerned', 'fearful',
      'depressed', 'miserable', 'unhappy', 'disgusted', 'outraged', 'furious', 'devastated', 'crushed',
      'failure', 'disaster', 'catastrophe', 'crisis', 'problem', 'issue', 'complaint', 'criticism'
    ];

    const intensifiers = ['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'really', 'so'];
    const negators = ['not', 'no', 'never', 'none', 'nothing', 'nowhere', 'neither', 'nor'];

    let intensifierCount = 0;
    let negatorCount = 0;

    for (const word of words) {
      wordCount++;
      
      if (positiveWords.includes(word)) {
        score += 1;
      } else if (negativeWords.includes(word)) {
        score -= 1;
      } else if (intensifiers.includes(word)) {
        intensifierCount++;
      } else if (negators.includes(word)) {
        negatorCount++;
      }
    }

    // Apply intensifier and negator effects
    if (intensifierCount > 0) {
      score *= (1 + intensifierCount * 0.3);
    }
    
    if (negatorCount > 0) {
      score *= -1;
    }

    // Normalize score to -1 to 1 range
    const normalizedScore = Math.max(-1, Math.min(1, score / Math.max(wordCount, 1)));
    
    return normalizedScore;
  }

  /**
   * Get sentiment label from score
   */
  private getSentimentLabel(score: number): 'positive' | 'negative' | 'neutral' {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  /**
   * Calculate confidence score based on text characteristics
   */
  private calculateConfidenceScore(text: string, sentimentScore: number): number {
    const textLength = text.length;
    const wordCount = text.split(/\s+/).length;
    
    // Base confidence on text length and sentiment strength
    let confidence = 0.5;
    
    // Longer texts generally have more reliable sentiment
    if (textLength > 50) confidence += 0.2;
    if (textLength > 100) confidence += 0.1;
    
    // Stronger sentiment scores are more confident
    const sentimentStrength = Math.abs(sentimentScore);
    confidence += sentimentStrength * 0.3;
    
    // Word count factor
    if (wordCount > 10) confidence += 0.1;
    
    return Math.min(1, Math.max(0.1, confidence));
  }

  /**
   * Calculate sentiment trends from historical data
   */
  private calculateSentimentTrends(data: Array<{
    sentiment_score: number;
    sentiment_label: string;
    confidence_score: number;
    created_at: string;
  }>) {
    if (data.length === 0) {
      return {
        average_sentiment: 0,
        positive_percentage: 0,
        negative_percentage: 0,
        neutral_percentage: 0,
        trend_direction: 'stable',
        confidence_trend: 0
      };
    }

    const totalSentiment = data.reduce((sum, item) => sum + item.sentiment_score, 0);
    const averageSentiment = totalSentiment / data.length;
    
    const positiveCount = data.filter(item => item.sentiment_label === 'positive').length;
    const negativeCount = data.filter(item => item.sentiment_label === 'negative').length;
    const neutralCount = data.filter(item => item.sentiment_label === 'neutral').length;
    
    const totalCount = data.length;
    
    return {
      average_sentiment: averageSentiment,
      positive_percentage: (positiveCount / totalCount) * 100,
      negative_percentage: (negativeCount / totalCount) * 100,
      neutral_percentage: (neutralCount / totalCount) * 100,
      trend_direction: averageSentiment > 0.1 ? 'rising' : averageSentiment < -0.1 ? 'falling' : 'stable',
      confidence_trend: data.reduce((sum, item) => sum + item.confidence_score, 0) / totalCount
    };
  }

  /**
   * Calculate sentiment summary
   */
  private calculateSentimentSummary(data: Array<{
    sentiment_score: number;
    sentiment_label: string;
    confidence_score: number;
    created_at: string;
  }>) {
    if (data.length === 0) {
      return {
        total_analyses: 0,
        average_sentiment: 0,
        sentiment_distribution: { positive: 0, negative: 0, neutral: 0 },
        top_positive_content: [],
        top_negative_content: [],
        sentiment_evolution: []
      };
    }

    const totalAnalyses = data.length;
    const averageSentiment = data.reduce((sum, item) => sum + item.sentiment_score, 0) / totalAnalyses;
    
    const sentimentDistribution = {
      positive: data.filter(item => item.sentiment_label === 'positive').length,
      negative: data.filter(item => item.sentiment_label === 'negative').length,
      neutral: data.filter(item => item.sentiment_label === 'neutral').length
    };

    // Sort by sentiment score for top content
    const sortedBySentiment = data.sort((a, b) => b.sentiment_score - a.sentiment_score);
    const topPositive = sortedBySentiment.slice(0, 5);
    const topNegative = sortedBySentiment.slice(-5).reverse();

    return {
      total_analyses: totalAnalyses,
      average_sentiment: averageSentiment,
      sentiment_distribution: sentimentDistribution,
      top_positive_content: topPositive,
      top_negative_content: topNegative,
      sentiment_evolution: this.calculateSentimentEvolution(data)
    };
  }

  /**
   * Calculate sentiment evolution over time
   */
  private calculateSentimentEvolution(data: Array<{
    sentiment_score: number;
    created_at: string;
  }>) {
    // Group by day and calculate daily averages
    const dailySentiment = data.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { scores: [], count: 0 };
      }
      acc[date].scores.push(item.sentiment_score);
      acc[date].count++;
      return acc;
    }, {} as Record<string, { scores: number[]; count: number }>);

    return Object.entries(dailySentiment).map(([date, data]) => ({
      date,
      average_sentiment: data.scores.reduce((sum, score) => sum + score, 0) / data.count,
      count: data.count
    })).sort((a, b) => a.date.localeCompare(b.date));
  }
}
