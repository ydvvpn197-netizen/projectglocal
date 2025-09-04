export interface Recommendation {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'artist' | 'event' | 'post' | 'group' | 'business';
  score: number;
  reason: string;
  algorithm: 'collaborative' | 'content-based' | 'hybrid' | 'location-based';
  metadata: Record<string, unknown>;
  createdAt: string;
  expiresAt?: string;
}

export interface UserPreference {
  id: string;
  userId: string;
  category: string;
  weight: number;
  source: 'explicit' | 'implicit' | 'behavioral';
  lastUpdated: string;
}

export interface ContentScore {
  contentId: string;
  contentType: string;
  relevanceScore: number;
  popularityScore: number;
  freshnessScore: number;
  locationScore: number;
  overallScore: number;
  factors: {
    userInterest: number;
    contentQuality: number;
    engagement: number;
    recency: number;
    proximity: number;
  };
}

export interface RecommendationSettings {
  userId: string;
  enabled: boolean;
  categories: string[];
  excludedCategories: string[];
  locationWeight: number;
  freshnessWeight: number;
  diversityWeight: number;
  maxRecommendations: number;
  updateFrequency: 'realtime' | 'hourly' | 'daily';
  lastUpdated: string;
}

export interface UserBehavior {
  id: string;
  userId: string;
  action: 'view' | 'like' | 'comment' | 'share' | 'bookmark' | 'follow' | 'search';
  contentType: string;
  contentId: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
}

export interface ContentFeature {
  contentId: string;
  contentType: string;
  features: {
    category: string[];
    tags: string[];
    sentiment: number;
    complexity: number;
    popularity: number;
    freshness: number;
    location: {
      latitude: number;
      longitude: number;
      city: string;
      state: string;
    };
  };
  vector: number[];
  lastUpdated: string;
}
