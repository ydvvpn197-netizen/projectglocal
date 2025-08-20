import { FollowSuggestion, FollowRelationship, FollowStats } from '@/types/following';

export interface UserSimilarity {
  userId: string;
  similarityScore: number;
  commonInterests: string[];
  mutualConnections: number;
  activityLevel: number;
  locationProximity: number;
}

export interface FollowRecommendationScore {
  similarityScore: number;
  mutualConnectionsScore: number;
  activityScore: number;
  locationScore: number;
  interestOverlapScore: number;
  finalScore: number;
}

export class FollowingAlgorithms {
  /**
   * Generate follow suggestions for a user
   */
  static generateFollowSuggestions(
    userId: string,
    userInterests: string[],
    userLocation: { latitude: number; longitude: number; city: string; state: string } | null,
    existingFollows: string[],
    allUsers: any[],
    limit: number = 20
  ): FollowSuggestion[] {
    // Filter out users already followed
    const candidateUsers = allUsers.filter(user => 
      user.id !== userId && !existingFollows.includes(user.id)
    );

    // Calculate similarity scores for all candidates
    const scoredUsers = candidateUsers.map(user => {
      const scores = this.calculateFollowRecommendationScores(
        userId,
        userInterests,
        userLocation,
        user,
        allUsers
      );

      return {
        ...user,
        scores
      };
    });

    // Sort by final score
    const sortedUsers = scoredUsers.sort((a, b) => b.scores.finalScore - a.scores.finalScore);

    // Generate follow suggestions
    return sortedUsers.slice(0, limit).map((user, index) => ({
      id: `suggestion_${user.id}_${index}`,
      userId: user.id,
      displayName: user.display_name || user.username || 'Anonymous',
      avatarUrl: user.avatar_url,
      bio: user.bio || '',
      score: user.scores.finalScore,
      commonInterests: this.findCommonInterests(userInterests, user.interests || []),
      mutualFollowers: this.countMutualFollowers(userId, user.id, allUsers),
      location: user.location ? {
        city: user.location.city || '',
        state: user.location.state || ''
      } : null,
      reason: this.generateFollowReason(user.scores, user),
      createdAt: new Date().toISOString()
    }));
  }

  /**
   * Calculate comprehensive follow recommendation scores
   */
  private static calculateFollowRecommendationScores(
    userId: string,
    userInterests: string[],
    userLocation: { latitude: number; longitude: number; city: string; state: string } | null,
    candidateUser: any,
    allUsers: any[]
  ): FollowRecommendationScore {
    const similarityScore = this.calculateSimilarityScore(userInterests, candidateUser.interests || []);
    const mutualConnectionsScore = this.calculateMutualConnectionsScore(userId, candidateUser.id, allUsers);
    const activityScore = this.calculateActivityScore(candidateUser);
    const locationScore = this.calculateLocationScore(userLocation, candidateUser.location);
    const interestOverlapScore = this.calculateInterestOverlapScore(userInterests, candidateUser.interests || []);

    // Weighted combination
    const finalScore = (
      similarityScore * 0.25 +
      mutualConnectionsScore * 0.30 +
      activityScore * 0.20 +
      locationScore * 0.15 +
      interestOverlapScore * 0.10
    );

    return {
      similarityScore,
      mutualConnectionsScore,
      activityScore,
      locationScore,
      interestOverlapScore,
      finalScore
    };
  }

  /**
   * Calculate similarity score based on user interests
   */
  private static calculateSimilarityScore(userInterests: string[], candidateInterests: string[]): number {
    if (userInterests.length === 0 || candidateInterests.length === 0) {
      return 0.5; // Neutral score if no interests
    }

    const commonInterests = this.findCommonInterests(userInterests, candidateInterests);
    const similarity = commonInterests.length / Math.max(userInterests.length, candidateInterests.length);
    
    return Math.min(similarity, 1.0);
  }

  /**
   * Calculate mutual connections score
   */
  private static calculateMutualConnectionsScore(userId: string, candidateId: string, allUsers: any[]): number {
    const mutualCount = this.countMutualFollowers(userId, candidateId, allUsers);
    
    // Normalize based on typical social network sizes
    const maxMutual = 50; // Assume max 50 mutual connections
    return Math.min(mutualCount / maxMutual, 1.0);
  }

  /**
   * Calculate activity score based on user engagement
   */
  private static calculateActivityScore(user: any): number {
    let score = 0.5; // Base score

    // Post activity
    if (user.posts_count) {
      const postScore = Math.min(user.posts_count / 100, 1.0);
      score += postScore * 0.2;
    }

    // Event creation activity
    if (user.events_created_count) {
      const eventScore = Math.min(user.events_created_count / 20, 1.0);
      score += eventScore * 0.2;
    }

    // Recent activity (last 30 days)
    if (user.last_activity) {
      const daysSinceActivity = (new Date().getTime() - new Date(user.last_activity).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceActivity <= 7) {
        score += 0.3; // Very active
      } else if (daysSinceActivity <= 30) {
        score += 0.2; // Active
      } else if (daysSinceActivity <= 90) {
        score += 0.1; // Somewhat active
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate location proximity score
   */
  private static calculateLocationScore(
    userLocation: { latitude: number; longitude: number; city: string; state: string } | null,
    candidateLocation: any
  ): number {
    if (!userLocation || !candidateLocation) {
      return 0.5; // Neutral score if no location data
    }

    // Same city gets highest score
    if (userLocation.city === candidateLocation.city) {
      return 1.0;
    }

    // Same state gets medium score
    if (userLocation.state === candidateLocation.state) {
      return 0.7;
    }

    // Calculate distance if coordinates available
    if (candidateLocation.latitude && candidateLocation.longitude) {
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        candidateLocation.latitude,
        candidateLocation.longitude
      );

      // Convert distance to score (closer = higher score)
      const maxDistance = 100; // 100km max
      return Math.max(0, 1 - (distance / maxDistance));
    }

    return 0.3; // Default score for different locations
  }

  /**
   * Calculate interest overlap score
   */
  private static calculateInterestOverlapScore(userInterests: string[], candidateInterests: string[]): number {
    if (userInterests.length === 0 || candidateInterests.length === 0) {
      return 0.5; // Neutral score if no interests
    }

    const commonInterests = this.findCommonInterests(userInterests, candidateInterests);
    const overlapRatio = commonInterests.length / Math.min(userInterests.length, candidateInterests.length);
    
    return Math.min(overlapRatio, 1.0);
  }

  /**
   * Find common interests between two users
   */
  private static findCommonInterests(userInterests: string[], candidateInterests: string[]): string[] {
    const userInterestsLower = userInterests.map(interest => interest.toLowerCase());
    const candidateInterestsLower = candidateInterests.map(interest => interest.toLowerCase());
    
    return userInterestsLower.filter(interest => 
      candidateInterestsLower.includes(interest)
    );
  }

  /**
   * Count mutual followers between two users
   */
  private static countMutualFollowers(userId1: string, userId2: string, allUsers: any[]): number {
    // This would be implemented with actual follow relationship data
    // For now, return a simulated count
    const user1 = allUsers.find(u => u.id === userId1);
    const user2 = allUsers.find(u => u.id === userId2);
    
    if (!user1 || !user2) return 0;

    // Simulate mutual followers based on user data
    const user1Followers = user1.followers_count || 0;
    const user2Followers = user2.followers_count || 0;
    
    // Estimate mutual followers as a percentage of the smaller follower count
    const minFollowers = Math.min(user1Followers, user2Followers);
    return Math.floor(minFollowers * 0.1); // Assume 10% overlap
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
   * Generate human-readable follow reason
   */
  private static generateFollowReason(scores: FollowRecommendationScore, user: any): string {
    const reasons: string[] = [];

    if (scores.similarityScore > 0.7) {
      reasons.push('Similar interests');
    }

    if (scores.mutualConnectionsScore > 0.5) {
      const mutualCount = Math.floor(scores.mutualConnectionsScore * 50);
      reasons.push(`${mutualCount} mutual connections`);
    }

    if (scores.activityScore > 0.7) {
      reasons.push('Very active');
    } else if (scores.activityScore > 0.5) {
      reasons.push('Active user');
    }

    if (scores.locationScore > 0.8) {
      reasons.push('Same city');
    } else if (scores.locationScore > 0.6) {
      reasons.push('Nearby');
    }

    if (scores.interestOverlapScore > 0.6) {
      reasons.push('Shared interests');
    }

    if (reasons.length === 0) {
      reasons.push('Recommended for you');
    }

    return reasons.join(', ');
  }

  /**
   * Get popular users for follow suggestions
   */
  static getPopularUsers(allUsers: any[], limit: number = 10): any[] {
    return allUsers
      .filter(user => user.followers_count > 0)
      .sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0))
      .slice(0, limit);
  }

  /**
   * Get users by specific interest
   */
  static getUsersByInterest(allUsers: any[], interest: string, limit: number = 10): any[] {
    const interestLower = interest.toLowerCase();
    
    return allUsers
      .filter(user => {
        const userInterests = user.interests || [];
        return userInterests.some((userInterest: string) => 
          userInterest.toLowerCase().includes(interestLower)
        );
      })
      .sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0))
      .slice(0, limit);
  }

  /**
   * Calculate follow statistics for a user
   */
  static calculateFollowStats(
    userId: string,
    followers: any[],
    following: any[]
  ): FollowStats {
    const totalFollowers = followers.length;
    const totalFollowing = following.length;
    
    // Calculate mutual followers
    const mutualFollowers = followers.filter(follower => 
      following.some(followingUser => followingUser.id === follower.id)
    ).length;

    // Calculate engagement rate (likes, comments, etc. from followers)
    const totalEngagement = followers.reduce((sum, follower) => 
      sum + (follower.engagement_count || 0), 0
    );

    const engagementRate = totalFollowers > 0 ? totalEngagement / totalFollowers : 0;

    // Calculate growth rate (new followers in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentFollowers = followers.filter(follower => 
      new Date(follower.followed_at || follower.created_at) > thirtyDaysAgo
    ).length;

    const growthRate = totalFollowers > 0 ? recentFollowers / totalFollowers : 0;

    return {
      userId,
      totalFollowers,
      totalFollowing,
      mutualFollowers,
      engagementRate,
      growthRate,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Analyze follow network for insights
   */
  static analyzeFollowNetwork(
    userId: string,
    followers: any[],
    following: any[]
  ): {
    networkSize: number;
    networkDensity: number;
    influentialConnections: number;
    commonInterests: string[];
    recommendations: string[];
  } {
    const networkSize = new Set([...followers.map(f => f.id), ...following.map(f => f.id)]).size;
    
    // Calculate network density (connections / possible connections)
    const possibleConnections = networkSize * (networkSize - 1) / 2;
    const actualConnections = followers.length + following.length;
    const networkDensity = possibleConnections > 0 ? actualConnections / possibleConnections : 0;

    // Count influential connections (users with many followers)
    const influentialConnections = [...followers, ...following].filter(user => 
      (user.followers_count || 0) > 1000
    ).length;

    // Find common interests across network
    const allInterests = [...followers, ...following].flatMap(user => user.interests || []);
    const interestCounts: Record<string, number> = {};
    allInterests.forEach(interest => {
      interestCounts[interest] = (interestCounts[interest] || 0) + 1;
    });

    const commonInterests = Object.entries(interestCounts)
      .filter(([_, count]) => count > 1)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([interest, _]) => interest);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (networkDensity < 0.1) {
      recommendations.push('Consider following more people to expand your network');
    }
    
    if (influentialConnections < 5) {
      recommendations.push('Connect with more influential users in your field');
    }
    
    if (commonInterests.length < 3) {
      recommendations.push('Diversify your interests to connect with more people');
    }

    return {
      networkSize,
      networkDensity,
      influentialConnections,
      commonInterests,
      recommendations
    };
  }
}
