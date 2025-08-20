import { SearchResult, TrendingContent } from '@/types/search';
import { Recommendation } from '@/types/recommendations';

export interface DiscoveryScore {
  interestMatchScore: number;
  diversityScore: number;
  freshnessScore: number;
  locationRelevanceScore: number;
  engagementPredictionScore: number;
  serendipityScore: number;
  finalScore: number;
}

export interface DiscoveryFilters {
  categories: string[];
  contentTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
  location: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  priceRange: {
    min: number;
    max: number;
  };
  tags: string[];
}

export class DiscoveryAlgorithms {
  /**
   * Discover content based on user interests and filters
   */
  static discoverContent(
    userInterests: string[],
    userLocation: { latitude: number; longitude: number; city: string; state: string } | null,
    availableContent: any[],
    filters: DiscoveryFilters,
    limit: number = 20
  ): any[] {
    // Apply filters first
    const filteredContent = this.applyDiscoveryFilters(availableContent, filters);

    // Calculate discovery scores
    const scoredContent = filteredContent.map(content => {
      const scores = this.calculateDiscoveryScores(
        userInterests,
        userLocation,
        content,
        filters
      );
      return {
        ...content,
        discoveryScore: scores.finalScore,
        scores
      };
    });

    // Sort by discovery score
    const sortedContent = scoredContent.sort((a, b) => b.discoveryScore - a.discoveryScore);

    // Apply diversity balancing
    const diverseContent = this.applyDiversityBalancing(sortedContent, limit);

    return diverseContent;
  }

  /**
   * Apply discovery filters to content
   */
  private static applyDiscoveryFilters(content: any[], filters: DiscoveryFilters): any[] {
    return content.filter(item => {
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(item.category)) {
        return false;
      }

      // Content type filter
      if (filters.contentTypes.length > 0 && !filters.contentTypes.includes(item.type)) {
        return false;
      }

      // Date range filter
      if (item.date) {
        const itemDate = new Date(item.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (itemDate < startDate || itemDate > endDate) {
          return false;
        }
      }

      // Location filter
      if (filters.location && item.location) {
        const distance = this.calculateDistance(
          filters.location.latitude,
          filters.location.longitude,
          item.location.latitude,
          item.location.longitude
        );
        
        if (distance > filters.location.radius) {
          return false;
        }
      }

      // Price filter
      if (item.price) {
        if (item.price < filters.priceRange.min || item.price > filters.priceRange.max) {
          return false;
        }
      }

      // Tag filter
      if (filters.tags.length > 0 && item.tags) {
        const hasMatchingTag = filters.tags.some(tag => 
          item.tags.includes(tag)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Calculate comprehensive discovery scores
   */
  private static calculateDiscoveryScores(
    userInterests: string[],
    userLocation: { latitude: number; longitude: number; city: string; state: string } | null,
    content: any,
    filters: DiscoveryFilters
  ): DiscoveryScore {
    const interestMatchScore = this.calculateInterestMatchScore(userInterests, content);
    const diversityScore = this.calculateDiversityScore(content);
    const freshnessScore = this.calculateFreshnessScore(content);
    const locationRelevanceScore = this.calculateLocationRelevanceScore(userLocation, content);
    const engagementPredictionScore = this.calculateEngagementPredictionScore(content);
    const serendipityScore = this.calculateSerendipityScore(userInterests, content);

    // Weighted combination
    const finalScore = (
      interestMatchScore * 0.30 +
      diversityScore * 0.15 +
      freshnessScore * 0.20 +
      locationRelevanceScore * 0.20 +
      engagementPredictionScore * 0.10 +
      serendipityScore * 0.05
    );

    return {
      interestMatchScore,
      diversityScore,
      freshnessScore,
      locationRelevanceScore,
      engagementPredictionScore,
      serendipityScore,
      finalScore
    };
  }

  /**
   * Calculate interest matching score
   */
  private static calculateInterestMatchScore(userInterests: string[], content: any): number {
    if (userInterests.length === 0) {
      return 0.5; // Neutral score if no interests
    }

    const contentInterests = [
      content.category,
      ...(content.tags || [])
    ];

    const matchingInterests = userInterests.filter(interest =>
      contentInterests.some(contentInterest =>
        contentInterest.toLowerCase().includes(interest.toLowerCase())
      )
    );

    const matchRatio = matchingInterests.length / userInterests.length;
    return Math.min(matchRatio, 1.0);
  }

  /**
   * Calculate diversity score
   */
  private static calculateDiversityScore(content: any): number {
    let score = 0.5; // Base score

    // Content type diversity
    const contentTypeWeights: Record<string, number> = {
      'event': 1.0,
      'artist': 0.9,
      'post': 0.8,
      'group': 0.7,
      'business': 0.6
    };

    score += (contentTypeWeights[content.type] || 0.5) * 0.3;

    // Category diversity
    const categoryWeights: Record<string, number> = {
      'music': 1.0,
      'art': 0.9,
      'food': 0.8,
      'sports': 0.9,
      'business': 0.7,
      'education': 0.8
    };

    score += (categoryWeights[content.category] || 0.5) * 0.2;

    // Tag diversity
    if (content.tags && content.tags.length > 0) {
      score += Math.min(content.tags.length / 5, 1.0) * 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate freshness score
   */
  private static calculateFreshnessScore(content: any): number {
    const now = new Date();
    const createdAt = new Date(content.createdAt);
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // Exponential decay: newer content gets higher scores
    const decayRate = 0.03; // 3% decay per hour
    const score = Math.exp(-decayRate * hoursSinceCreation);
    
    return Math.max(score, 0.1); // Minimum score of 0.1
  }

  /**
   * Calculate location relevance score
   */
  private static calculateLocationRelevanceScore(
    userLocation: { latitude: number; longitude: number; city: string; state: string } | null,
    content: any
  ): number {
    if (!userLocation || !content.location) {
      return 0.5; // Neutral score if no location data
    }

    // Same city gets highest score
    if (userLocation.city === content.location.city) {
      return 1.0;
    }

    // Same state gets medium score
    if (userLocation.state === content.location.state) {
      return 0.8;
    }

    // Calculate distance if coordinates available
    if (content.location.latitude && content.location.longitude) {
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        content.location.latitude,
        content.location.longitude
      );

      // Convert distance to score (closer = higher score)
      const maxDistance = 100; // 100km max
      return Math.max(0, 1 - (distance / maxDistance));
    }

    return 0.3; // Default score for different locations
  }

  /**
   * Calculate engagement prediction score
   */
  private static calculateEngagementPredictionScore(content: any): number {
    let score = 0.5; // Base score

    // Historical engagement
    if (content.engagement) {
      const totalEngagement = content.engagement.likes + content.engagement.comments + content.engagement.shares;
      score += Math.min(totalEngagement / 1000, 1.0) * 0.3;
    }

    // Content quality indicators
    if (content.title && content.title.length > 10) {
      score += 0.1;
    }

    if (content.description && content.description.length > 50) {
      score += 0.1;
    }

    if (content.image) {
      score += 0.1;
    }

    // Popularity indicators
    if (content.attendees_count) {
      score += Math.min(content.attendees_count / 100, 1.0) * 0.2;
    }

    if (content.rating) {
      score += (content.rating / 5) * 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate serendipity score (unexpected but relevant content)
   */
  private static calculateSerendipityScore(userInterests: string[], content: any): number {
    if (userInterests.length === 0) {
      return 0.5; // Neutral score if no interests
    }

    // Check if content is outside user's typical interests but still relevant
    const contentInterests = [content.category, ...(content.tags || [])];
    const matchingInterests = userInterests.filter(interest =>
      contentInterests.some(contentInterest =>
        contentInterest.toLowerCase().includes(interest.toLowerCase())
      )
    );

    // Serendipity: some overlap but not complete match
    const overlapRatio = matchingInterests.length / userInterests.length;
    
    if (overlapRatio > 0 && overlapRatio < 0.7) {
      return 0.8; // Good serendipity score
    } else if (overlapRatio === 0) {
      return 0.3; // No overlap, low serendipity
    } else {
      return 0.5; // Too much overlap, neutral serendipity
    }
  }

  /**
   * Apply diversity balancing to ensure variety
   */
  private static applyDiversityBalancing(content: any[], limit: number): any[] {
    const diverseContent: any[] = [];
    const usedCategories = new Set<string>();
    const usedContentTypes = new Set<string>();
    const usedTags = new Set<string>();

    for (const item of content) {
      if (diverseContent.length >= limit) break;

      // Check diversity constraints
      const categoryDiverse = !usedCategories.has(item.category) || usedCategories.size >= 4;
      const typeDiverse = !usedContentTypes.has(item.type) || usedContentTypes.size >= 3;
      const tagDiverse = this.checkTagDiversity(item.tags || [], usedTags);

      if (categoryDiverse && typeDiverse && tagDiverse) {
        diverseContent.push(item);
        usedCategories.add(item.category);
        usedContentTypes.add(item.type);
        (item.tags || []).forEach(tag => usedTags.add(tag));
      }
    }

    // Fill remaining slots if needed
    if (diverseContent.length < limit) {
      for (const item of content) {
        if (diverseContent.length >= limit) break;
        if (!diverseContent.find(c => c.id === item.id)) {
          diverseContent.push(item);
        }
      }
    }

    return diverseContent;
  }

  /**
   * Check tag diversity
   */
  private static checkTagDiversity(itemTags: string[], usedTags: Set<string>): boolean {
    if (itemTags.length === 0) return true;

    const newTags = itemTags.filter(tag => !usedTags.has(tag));
    return newTags.length > 0 || usedTags.size >= 10;
  }

  /**
   * Calculate distance between two points
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Generate personalized discovery insights
   */
  static generateDiscoveryInsights(
    userInterests: string[],
    discoveredContent: any[]
  ): {
    topCategories: string[];
    trendingTopics: string[];
    recommendations: string[];
    insights: string[];
  } {
    // Analyze top categories
    const categoryCounts: Record<string, number> = {};
    discoveredContent.forEach(content => {
      categoryCounts[content.category] = (categoryCounts[content.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([category, _]) => category);

    // Analyze trending topics from tags
    const tagCounts: Record<string, number> = {};
    discoveredContent.forEach(content => {
      (content.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const trendingTopics = Object.entries(tagCounts)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 10)
      .map(([tag, _]) => tag);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (topCategories.length < 3) {
      recommendations.push('Explore more diverse categories to discover new interests');
    }
    
    if (trendingTopics.length < 5) {
      recommendations.push('Try searching for trending topics in your area');
    }

    // Generate insights
    const insights: string[] = [];
    
    if (topCategories.includes('music')) {
      insights.push('You seem to enjoy music-related content');
    }
    
    if (topCategories.includes('food')) {
      insights.push('Food and dining experiences are popular in your area');
    }

    const localContent = discoveredContent.filter(content => 
      content.location && content.location.city
    );
    
    if (localContent.length > discoveredContent.length * 0.7) {
      insights.push('Most of your discoveries are local events and activities');
    }

    return {
      topCategories,
      trendingTopics,
      recommendations,
      insights
    };
  }

  /**
   * Match content with user interests for personalized discovery
   */
  static matchContentWithInterests(
    userInterests: string[],
    content: any[]
  ): {
    perfectMatches: any[];
    goodMatches: any[];
    serendipitousMatches: any[];
  } {
    const perfectMatches: any[] = [];
    const goodMatches: any[] = [];
    const serendipitousMatches: any[] = [];

    content.forEach(item => {
      const contentInterests = [item.category, ...(item.tags || [])];
      const matchingInterests = userInterests.filter(interest =>
        contentInterests.some(contentInterest =>
          contentInterest.toLowerCase().includes(interest.toLowerCase())
        )
      );

      const matchRatio = matchingInterests.length / userInterests.length;

      if (matchRatio >= 0.8) {
        perfectMatches.push(item);
      } else if (matchRatio >= 0.4) {
        goodMatches.push(item);
      } else if (matchRatio > 0) {
        serendipitousMatches.push(item);
      }
    });

    return {
      perfectMatches,
      goodMatches,
      serendipitousMatches
    };
  }
}
