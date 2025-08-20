import { Recommendation, UserPreference, ContentScore } from '@/types/recommendations';

export interface RecommendationScore {
  collaborativeScore: number;
  contentBasedScore: number;
  locationScore: number;
  freshnessScore: number;
  diversityScore: number;
  finalScore: number;
}

export interface UserProfile {
  userId: string;
  preferences: UserPreference[];
  behaviorHistory: Array<{
    action: string;
    contentType: string;
    contentId: string;
    timestamp: string;
  }>;
  location?: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  };
}

export class RecommendationAlgorithms {
  /**
   * Generate personalized recommendations using hybrid approach
   */
  static generateRecommendations(
    userProfile: UserProfile,
    availableContent: any[],
    limit: number = 20
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Calculate scores for each content item
    const scoredContent = availableContent.map(content => {
      const scores = this.calculateRecommendationScores(userProfile, content);
      return {
        ...content,
        scores
      };
    });

    // Sort by final score
    const sortedContent = scoredContent.sort((a, b) => b.scores.finalScore - a.scores.finalScore);

    // Apply diversity filtering
    const diverseContent = this.applyDiversityFilter(sortedContent, limit);

    // Generate recommendations with reasons
    return diverseContent.map((content, index) => ({
      id: `rec_${content.id}_${index}`,
      userId: userProfile.userId,
      contentId: content.id,
      contentType: content.type,
      score: content.scores.finalScore,
      reason: this.generateRecommendationReason(userProfile, content, content.scores),
      algorithm: 'hybrid',
      metadata: {
        collaborativeScore: content.scores.collaborativeScore,
        contentBasedScore: content.scores.contentBasedScore,
        locationScore: content.scores.locationScore,
        freshnessScore: content.scores.freshnessScore,
        diversityScore: content.scores.diversityScore
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }));
  }

  /**
   * Calculate comprehensive recommendation scores
   */
  private static calculateRecommendationScores(userProfile: UserProfile, content: any): RecommendationScore {
    const collaborativeScore = this.calculateCollaborativeScore(userProfile, content);
    const contentBasedScore = this.calculateContentBasedScore(userProfile, content);
    const locationScore = this.calculateLocationScore(userProfile, content);
    const freshnessScore = this.calculateFreshnessScore(content);
    const diversityScore = this.calculateDiversityScore(content);

    // Weighted combination
    const finalScore = (
      collaborativeScore * 0.30 +
      contentBasedScore * 0.25 +
      locationScore * 0.20 +
      freshnessScore * 0.15 +
      diversityScore * 0.10
    );

    return {
      collaborativeScore,
      contentBasedScore,
      locationScore,
      freshnessScore,
      diversityScore,
      finalScore
    };
  }

  /**
   * Calculate collaborative filtering score
   */
  private static calculateCollaborativeScore(userProfile: UserProfile, content: any): number {
    // Find similar users based on behavior patterns
    const similarUsers = this.findSimilarUsers(userProfile);
    
    if (similarUsers.length === 0) {
      return 0.5; // Neutral score if no similar users
    }

    // Calculate average preference of similar users for this content type
    const similarUserPreferences = similarUsers.map(user => {
      const preference = user.preferences.find(p => p.category === content.category);
      return preference ? preference.weight : 0.5;
    });

    const averagePreference = similarUserPreferences.reduce((sum, pref) => sum + pref, 0) / similarUserPreferences.length;
    
    return Math.min(averagePreference, 1.0);
  }

  /**
   * Calculate content-based filtering score
   */
  private static calculateContentBasedScore(userProfile: UserProfile, content: any): number {
    const userPreferences = userProfile.preferences;
    
    if (userPreferences.length === 0) {
      return 0.5; // Neutral score if no preferences
    }

    // Find matching preferences
    const matchingPreference = userPreferences.find(pref => pref.category === content.category);
    
    if (matchingPreference) {
      return matchingPreference.weight;
    }

    // Calculate similarity based on content features
    const contentFeatures = this.extractContentFeatures(content);
    const userInterests = this.extractUserInterests(userProfile);
    
    const similarity = this.calculateFeatureSimilarity(contentFeatures, userInterests);
    
    return Math.min(similarity, 1.0);
  }

  /**
   * Calculate location-based score
   */
  private static calculateLocationScore(userProfile: UserProfile, content: any): number {
    if (!userProfile.location || !content.location) {
      return 0.5; // Neutral score if no location data
    }

    const distance = this.calculateDistance(
      userProfile.location.latitude,
      userProfile.location.longitude,
      content.location.latitude,
      content.location.longitude
    );

    // Convert distance to score (closer = higher score)
    const maxDistance = 50; // 50km max
    const score = Math.max(0, 1 - (distance / maxDistance));
    
    return score;
  }

  /**
   * Calculate freshness score
   */
  private static calculateFreshnessScore(content: any): number {
    const now = new Date();
    const createdAt = new Date(content.createdAt);
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // Exponential decay: newer content gets higher scores
    const decayRate = 0.05; // 5% decay per hour
    const score = Math.exp(-decayRate * hoursSinceCreation);
    
    return Math.max(score, 0.1); // Minimum score of 0.1
  }

  /**
   * Calculate diversity score
   */
  private static calculateDiversityScore(content: any): number {
    // This would be enhanced with actual diversity calculation
    // For now, return a base score
    return 0.8;
  }

  /**
   * Find similar users based on behavior patterns
   */
  private static findSimilarUsers(userProfile: UserProfile): UserProfile[] {
    // This would be implemented with actual user similarity calculation
    // For now, return empty array
    return [];
  }

  /**
   * Extract content features for similarity calculation
   */
  private static extractContentFeatures(content: any): Record<string, number> {
    const features: Record<string, number> = {};

    // Category features
    features[`category_${content.category}`] = 1;

    // Tag features
    if (content.tags) {
      content.tags.forEach((tag: string) => {
        features[`tag_${tag}`] = 1;
      });
    }

    // Price features
    if (content.price) {
      features['price_low'] = content.price < 50 ? 1 : 0;
      features['price_medium'] = content.price >= 50 && content.price < 200 ? 1 : 0;
      features['price_high'] = content.price >= 200 ? 1 : 0;
    }

    // Time features
    if (content.date) {
      const eventDate = new Date(content.date);
      const now = new Date();
      const daysUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      features['time_soon'] = daysUntilEvent <= 7 ? 1 : 0;
      features['time_medium'] = daysUntilEvent > 7 && daysUntilEvent <= 30 ? 1 : 0;
      features['time_far'] = daysUntilEvent > 30 ? 1 : 0;
    }

    return features;
  }

  /**
   * Extract user interests from behavior and preferences
   */
  private static extractUserInterests(userProfile: UserProfile): Record<string, number> {
    const interests: Record<string, number> = {};

    // Add preferences
    userProfile.preferences.forEach(pref => {
      interests[`category_${pref.category}`] = pref.weight;
    });

    // Add behavior-based interests
    const behaviorCounts: Record<string, number> = {};
    userProfile.behaviorHistory.forEach(behavior => {
      const key = `${behavior.action}_${behavior.contentType}`;
      behaviorCounts[key] = (behaviorCounts[key] || 0) + 1;
    });

    // Normalize behavior counts
    const maxCount = Math.max(...Object.values(behaviorCounts), 1);
    Object.entries(behaviorCounts).forEach(([key, count]) => {
      interests[key] = count / maxCount;
    });

    return interests;
  }

  /**
   * Calculate feature similarity between content and user interests
   */
  private static calculateFeatureSimilarity(contentFeatures: Record<string, number>, userInterests: Record<string, number>): number {
    const allFeatures = new Set([...Object.keys(contentFeatures), ...Object.keys(userInterests)]);
    
    let dotProduct = 0;
    let contentMagnitude = 0;
    let userMagnitude = 0;

    allFeatures.forEach(feature => {
      const contentValue = contentFeatures[feature] || 0;
      const userValue = userInterests[feature] || 0;
      
      dotProduct += contentValue * userValue;
      contentMagnitude += contentValue * contentValue;
      userMagnitude += userValue * userValue;
    });

    if (contentMagnitude === 0 || userMagnitude === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(contentMagnitude) * Math.sqrt(userMagnitude));
  }

  /**
   * Apply diversity filter to ensure variety in recommendations
   */
  private static applyDiversityFilter(content: any[], limit: number): any[] {
    const diverseContent: any[] = [];
    const usedCategories = new Set<string>();
    const usedContentTypes = new Set<string>();

    for (const item of content) {
      if (diverseContent.length >= limit) break;

      // Check diversity constraints
      const categoryDiverse = !usedCategories.has(item.category) || usedCategories.size >= 3;
      const typeDiverse = !usedContentTypes.has(item.type) || usedContentTypes.size >= 2;

      if (categoryDiverse && typeDiverse) {
        diverseContent.push(item);
        usedCategories.add(item.category);
        usedContentTypes.add(item.type);
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
   * Generate human-readable recommendation reason
   */
  private static generateRecommendationReason(userProfile: UserProfile, content: any, scores: RecommendationScore): string {
    const reasons: string[] = [];

    if (scores.contentBasedScore > 0.7) {
      const preference = userProfile.preferences.find(p => p.category === content.category);
      if (preference) {
        reasons.push(`Based on your interest in ${content.category}`);
      }
    }

    if (scores.locationScore > 0.7) {
      reasons.push('Happening near you');
    }

    if (scores.freshnessScore > 0.8) {
      reasons.push('Recently added');
    }

    if (scores.collaborativeScore > 0.7) {
      reasons.push('Popular with similar users');
    }

    if (reasons.length === 0) {
      reasons.push('Recommended for you');
    }

    return reasons.join(', ');
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
   * Update user preferences based on behavior
   */
  static updateUserPreferences(userProfile: UserProfile, action: string, contentType: string, contentId: string): UserPreference[] {
    const updatedPreferences = [...userProfile.preferences];
    
    // Find or create preference for this content type
    let preference = updatedPreferences.find(p => p.category === contentType);
    
    if (!preference) {
      preference = {
        id: `pref_${contentType}`,
        userId: userProfile.userId,
        category: contentType,
        weight: 0.5,
        source: 'behavioral',
        lastUpdated: new Date().toISOString()
      };
      updatedPreferences.push(preference);
    }

    // Update weight based on action
    const weightChange = this.getWeightChangeForAction(action);
    preference.weight = Math.max(0, Math.min(1, preference.weight + weightChange));
    preference.lastUpdated = new Date().toISOString();

    return updatedPreferences;
  }

  /**
   * Get weight change for different user actions
   */
  private static getWeightChangeForAction(action: string): number {
    const weightChanges: Record<string, number> = {
      'like': 0.1,
      'comment': 0.15,
      'share': 0.2,
      'bookmark': 0.1,
      'follow': 0.25,
      'view': 0.02,
      'search': 0.05
    };

    return weightChanges[action] || 0;
  }
}
