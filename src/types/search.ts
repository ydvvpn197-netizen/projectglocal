export interface TrendingContent {
  id: string;
  type: string;
  title: string;
  description?: string;
  image?: string;
  createdAt: string;
  trendingScore: number;
  trendingPeriod?: string;
  category?: string;
  location?: {
    name?: string;
    city?: string;
    state?: string;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    velocity: number;
  };
  metadata?: {
    tags?: string[];
    [key: string]: any;
  };
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: string;
  score: number;
  highlighted: string;
  image?: string;
  description?: string;
  location?: {
    name?: string;
    city?: string;
    state?: string;
  };
  distance?: number;
  price?: number;
  date?: string;
  createdAt?: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  tags?: string[];
  rating?: number;
  relevanceScore?: number;
}

export interface SearchQuery {
  query: string;
  type?: string;
  category?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface SearchFilter {
  type: string;
  category: string;
  location: {
    enabled: boolean;
    radius: number;
  };
  dateRange: {
    enabled: boolean;
    start: string;
    end: string;
  };
  priceRange: {
    enabled: boolean;
    min: number;
    max: number;
  };
  tags: string[];
  rating: number;
  sortBy: string;
}

export interface SearchFilters {
  type?: string[];
  location?: {
    enabled: boolean;
    radius: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'user' | 'hashtag' | 'location' | 'category';
  score: number;
  relevance?: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
}
