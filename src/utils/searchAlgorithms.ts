import { SearchResult, SearchQuery } from '@/types/search';

export interface SearchScore {
  textRelevance: number;
  locationRelevance: number;
  categoryRelevance: number;
  engagementScore: number;
  freshnessScore: number;
  totalScore: number;
}

export class SearchAlgorithms {
  /**
   * Calculate comprehensive relevance score for search results
   */
  static calculateRelevanceScore(result: SearchResult, query: SearchQuery): SearchScore {
    const textRelevance = this.calculateTextRelevance(result, query);
    const locationRelevance = this.calculateLocationRelevance(result, query);
    const categoryRelevance = this.calculateCategoryRelevance(result, query);
    const engagementScore = this.calculateEngagementScore(result);
    const freshnessScore = this.calculateFreshnessScore(result);

    const totalScore = (
      textRelevance * 0.35 +
      locationRelevance * 0.25 +
      categoryRelevance * 0.15 +
      engagementScore * 0.15 +
      freshnessScore * 0.10
    );

    return {
      textRelevance,
      locationRelevance,
      categoryRelevance,
      engagementScore,
      freshnessScore,
      totalScore
    };
  }

  /**
   * Calculate text relevance based on query matching
   */
  private static calculateTextRelevance(result: SearchResult, query: SearchQuery): number {
    const queryLower = query.query.toLowerCase();
    const titleLower = result.title.toLowerCase();
    const descLower = result.description?.toLowerCase() || '';
    const tagsLower = result.tags?.map(tag => tag.toLowerCase()) || [];

    let score = 0;

    // Title matching (highest weight)
    if (titleLower.includes(queryLower)) {
      score += 10;
    } else if (titleLower.split(' ').some(word => word.includes(queryLower))) {
      score += 7;
    }

    // Description matching
    if (descLower.includes(queryLower)) {
      score += 5;
    } else if (descLower.split(' ').some(word => word.includes(queryLower))) {
      score += 3;
    }

    // Tag matching
    tagsLower.forEach(tag => {
      if (tag.includes(queryLower)) {
        score += 3;
      }
    });

    // Exact phrase matching bonus
    if (titleLower === queryLower) {
      score += 5;
    }

    return Math.min(score, 20);
  }

  /**
   * Calculate location relevance based on distance and location matching
   */
  private static calculateLocationRelevance(result: SearchResult, query: SearchQuery): number {
    if (!query.location || !result.location) {
      return 0;
    }

    let score = 0;

    // Distance-based scoring
    if (result.distance !== undefined) {
      if (result.distance <= 5) {
        score += 10; // Very close
      } else if (result.distance <= 15) {
        score += 7; // Close
      } else if (result.distance <= 30) {
        score += 4; // Moderate distance
      } else if (result.distance <= 50) {
        score += 2; // Far but within range
      }
    }

    // Location name matching
    const queryLower = query.query.toLowerCase();
    const locationName = result.location.name?.toLowerCase() || '';
    const cityName = result.location.city?.toLowerCase() || '';
    const stateName = result.location.state?.toLowerCase() || '';

    if (locationName.includes(queryLower) || cityName.includes(queryLower) || stateName.includes(queryLower)) {
      score += 5;
    }

    return Math.min(score, 15);
  }

  /**
   * Calculate category relevance
   */
  private static calculateCategoryRelevance(result: SearchResult, query: SearchQuery): number {
    if (!query.category || query.category === 'all') {
      return 5; // Neutral score for no category filter
    }

    // This would need to be enhanced with actual category matching logic
    // For now, return a base score
    return 5;
  }

  /**
   * Calculate engagement score based on likes, comments, shares, views
   */
  private static calculateEngagementScore(result: SearchResult): number {
    if (!result.engagement) {
      return 0;
    }

    const { likes, comments, shares, views } = result.engagement;
    
    // Weighted engagement calculation
    const score = (
      likes * 1 +
      comments * 2 +
      shares * 3 +
      views * 0.1
    );

    // Normalize to 0-10 scale
    return Math.min(score / 100, 10);
  }

  /**
   * Calculate freshness score based on creation date
   */
  private static calculateFreshnessScore(result: SearchResult): number {
    const now = new Date();
    const createdAt = new Date(result.createdAt);
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    // Exponential decay: newer content gets higher scores
    if (hoursSinceCreation <= 1) {
      return 10; // Very fresh (last hour)
    } else if (hoursSinceCreation <= 24) {
      return 8; // Fresh (last day)
    } else if (hoursSinceCreation <= 168) {
      return 6; // Recent (last week)
    } else if (hoursSinceCreation <= 720) {
      return 4; // Older (last month)
    } else {
      return 2; // Old content
    }
  }

  /**
   * Apply advanced ranking to search results
   */
  static rankSearchResults(results: SearchResult[], query: SearchQuery): SearchResult[] {
    return results
      .map(result => {
        const score = this.calculateRelevanceScore(result, query);
        return {
          ...result,
          relevanceScore: score.totalScore
        };
      })
      .sort((a, b) => {
        switch (query.sortBy) {
          case 'relevance':
            return (b.relevanceScore || 0) - (a.relevanceScore || 0);
          case 'distance':
            return (a.distance || 0) - (b.distance || 0);
          case 'date':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'popularity': {
            const aEngagement = a.engagement ? a.engagement.likes + a.engagement.comments : 0;
            const bEngagement = b.engagement ? b.engagement.likes + b.engagement.comments : 0;
            return bEngagement - aEngagement;
          }
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          default:
            return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        }
      });
  }

  /**
   * Generate search suggestions based on query
   */
  static generateSearchSuggestions(query: string, searchHistory: string[] = []): string[] {
    const suggestions = new Set<string>();
    
    // Add search history matches
    searchHistory.forEach(historyQuery => {
      if (historyQuery.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(historyQuery);
      }
    });

    // Add common search terms
    const commonTerms = [
      'music', 'art', 'food', 'sports', 'business', 'education',
      'concert', 'exhibition', 'restaurant', 'gym', 'workshop',
      'local', 'nearby', 'today', 'this week', 'free', 'paid'
    ];

    commonTerms.forEach(term => {
      if (term.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(term);
      }
    });

    // Add category suggestions
    const categories = [
      'music', 'art', 'food', 'sports', 'business', 'education',
      'entertainment', 'health', 'technology', 'fashion', 'travel'
    ];

    categories.forEach(category => {
      if (category.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(category);
      }
    });

    return Array.from(suggestions).slice(0, 10);
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
}
