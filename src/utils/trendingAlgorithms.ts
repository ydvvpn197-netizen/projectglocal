import { TrendingContent } from '@/types/search';

export interface TrendingMetrics {
  engagementScore: number;
  velocityScore: number;
  timeDecayScore: number;
  categoryWeight: number;
  locationRelevance: number;
  qualityScore: number;
  finalScore: number;
}

export class TrendingAlgorithms {
  /**
   * Calculate comprehensive trending score for content
   */
  static calculateTrendingScore(content: TrendingContent, period: 'hour' | 'day' | 'week' | 'month' = 'day'): TrendingMetrics {
    const engagementScore = this.calculateEngagementScore(content);
    const velocityScore = this.calculateVelocityScore(content);
    const timeDecayScore = this.calculateTimeDecayScore(content);
    const categoryWeight = this.calculateCategoryWeight(content);
    const locationRelevance = this.calculateLocationRelevance(content);
    const qualityScore = this.calculateQualityScore(content);

    // Weighted combination based on period
    const weights = this.getPeriodWeights(period);
    
    const finalScore = (
      engagementScore * weights.engagement +
      velocityScore * weights.velocity +
      timeDecayScore * weights.timeDecay +
      categoryWeight * weights.category +
      locationRelevance * weights.location +
      qualityScore * weights.quality
    );

    return {
      engagementScore,
      velocityScore,
      timeDecayScore,
      categoryWeight,
      locationRelevance,
      qualityScore,
      finalScore
    };
  }

  /**
   * Calculate engagement score based on likes, comments, shares, views
   */
  private static calculateEngagementScore(content: TrendingContent): number {
    const { likes, comments, shares, views } = content.engagement;
    
    // Weighted engagement calculation
    const score = (
      likes * 1 +
      comments * 2 +
      shares * 3 +
      views * 0.1
    );

    // Normalize to 0-100 scale
    return Math.min(score / 10, 100);
  }

  /**
   * Calculate velocity score (engagement per time unit)
   */
  private static calculateVelocityScore(content: TrendingContent): number {
    const { velocity } = content.engagement;
    
    // Velocity is already calculated per hour
    // Normalize to 0-100 scale
    return Math.min(velocity * 10, 100);
  }

  /**
   * Calculate time decay score (newer content gets higher scores)
   */
  private static calculateTimeDecayScore(content: TrendingContent): number {
    const now = new Date();
    const createdAt = new Date(content.createdAt);
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // Exponential decay function
    const decayRate = 0.1; // 10% decay per hour
    const score = Math.exp(-decayRate * hoursSinceCreation) * 100;
    
    return Math.max(score, 1); // Minimum score of 1
  }

  /**
   * Calculate category weight based on content type and category
   */
  private static calculateCategoryWeight(content: TrendingContent): number {
    const categoryWeights: Record<string, number> = {
      'music': 1.2,
      'art': 1.1,
      'food': 1.0,
      'sports': 1.3,
      'business': 0.9,
      'education': 1.0,
      'entertainment': 1.2,
      'health': 1.1,
      'technology': 1.0,
      'fashion': 1.1,
      'travel': 1.0
    };

    const weight = categoryWeights[content.category.toLowerCase()] || 1.0;
    return weight * 100;
  }

  /**
   * Calculate location relevance score
   */
  private static calculateLocationRelevance(content: TrendingContent): number {
    // This would need to be enhanced with actual location matching logic
    // For now, return a base score
    return 80; // Base location relevance
  }

  /**
   * Calculate quality score based on content characteristics
   */
  private static calculateQualityScore(content: TrendingContent): number {
    let score = 50; // Base quality score

    // Title quality
    if (content.title && content.title.length > 10) {
      score += 10;
    }

    // Description quality
    if (content.description && content.description.length > 50) {
      score += 10;
    }

    // Image presence
    if (content.image) {
      score += 10;
    }

    // Engagement ratio (likes vs views)
    if (content.engagement.views > 0) {
      const engagementRatio = content.engagement.likes / content.engagement.views;
      score += Math.min(engagementRatio * 100, 20);
    }

    return Math.min(score, 100);
  }

  /**
   * Get period-specific weights for trending calculation
   */
  private static getPeriodWeights(period: 'hour' | 'day' | 'week' | 'month') {
    const weights = {
      hour: {
        engagement: 0.25,
        velocity: 0.35,
        timeDecay: 0.20,
        category: 0.10,
        location: 0.05,
        quality: 0.05
      },
      day: {
        engagement: 0.30,
        velocity: 0.25,
        timeDecay: 0.25,
        category: 0.10,
        location: 0.05,
        quality: 0.05
      },
      week: {
        engagement: 0.35,
        velocity: 0.15,
        timeDecay: 0.20,
        category: 0.15,
        location: 0.10,
        quality: 0.05
      },
      month: {
        engagement: 0.40,
        velocity: 0.10,
        timeDecay: 0.15,
        category: 0.20,
        location: 0.10,
        quality: 0.05
      }
    };

    return weights[period];
  }

  /**
   * Apply trending ranking to content list
   */
  static rankTrendingContent(contentList: TrendingContent[], period: 'hour' | 'day' | 'week' | 'month' = 'day'): TrendingContent[] {
    return contentList
      .map(content => {
        const metrics = this.calculateTrendingScore(content, period);
        return {
          ...content,
          trendingScore: metrics.finalScore
        };
      })
      .sort((a, b) => b.trendingScore - a.trendingScore);
  }

  /**
   * Calculate trending velocity (engagement change over time)
   */
  static calculateTrendingVelocity(engagementHistory: Array<{ timestamp: string; engagement: number }>): number {
    if (engagementHistory.length < 2) {
      return 0;
    }

    // Sort by timestamp
    const sorted = engagementHistory.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate velocity (engagement per hour)
    const timeSpan = (new Date(sorted[sorted.length - 1].timestamp).getTime() - 
                     new Date(sorted[0].timestamp).getTime()) / (1000 * 60 * 60);
    
    const engagementChange = sorted[sorted.length - 1].engagement - sorted[0].engagement;
    
    return timeSpan > 0 ? engagementChange / timeSpan : 0;
  }

  /**
   * Detect trending patterns in content
   */
  static detectTrendingPattern(content: TrendingContent): 'rising' | 'stable' | 'declining' {
    const velocity = content.engagement.velocity;
    
    if (velocity > 10) {
      return 'rising';
    } else if (velocity > 2) {
      return 'stable';
    } else {
      return 'declining';
    }
  }

  /**
   * Calculate trending momentum (acceleration of engagement)
   */
  static calculateTrendingMomentum(engagementHistory: Array<{ timestamp: string; engagement: number }>): number {
    if (engagementHistory.length < 3) {
      return 0;
    }

    // Calculate velocity changes over time
    const velocities: number[] = [];
    
    for (let i = 1; i < engagementHistory.length; i++) {
      const timeSpan = (new Date(engagementHistory[i].timestamp).getTime() - 
                       new Date(engagementHistory[i - 1].timestamp).getTime()) / (1000 * 60 * 60);
      
      const engagementChange = engagementHistory[i].engagement - engagementHistory[i - 1].engagement;
      velocities.push(timeSpan > 0 ? engagementChange / timeSpan : 0);
    }

    // Calculate momentum (change in velocity)
    if (velocities.length < 2) {
      return 0;
    }

    return velocities[velocities.length - 1] - velocities[0];
  }

  /**
   * Filter trending content by quality threshold
   */
  static filterByQuality(contentList: TrendingContent[], minQualityScore: number = 30): TrendingContent[] {
    return contentList.filter(content => {
      const metrics = this.calculateTrendingScore(content);
      return metrics.qualityScore >= minQualityScore;
    });
  }

  /**
   * Get trending insights for content
   */
  static getTrendingInsights(content: TrendingContent): {
    pattern: string;
    momentum: string;
    prediction: string;
    recommendations: string[];
  } {
    const pattern = this.detectTrendingPattern(content);
    const velocity = content.engagement.velocity;
    
    let momentum = 'stable';
    if (velocity > 20) momentum = 'strong';
    else if (velocity > 10) momentum = 'moderate';
    else if (velocity < 2) momentum = 'weak';

    let prediction = 'stable';
    if (velocity > 15 && pattern === 'rising') prediction = 'likely to trend higher';
    else if (velocity < 5 && pattern === 'declining') prediction = 'likely to decline';
    else prediction = 'expected to remain stable';

    const recommendations: string[] = [];
    if (pattern === 'rising') {
      recommendations.push('Consider promoting this content');
      recommendations.push('Monitor engagement closely');
    } else if (pattern === 'declining') {
      recommendations.push('Consider refreshing content');
      recommendations.push('Analyze engagement patterns');
    }

    return {
      pattern,
      momentum,
      prediction,
      recommendations
    };
  }
}
