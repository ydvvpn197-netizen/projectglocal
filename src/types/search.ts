export interface SearchQuery {
  query: string;
  type?: 'all' | 'artist' | 'event' | 'post' | 'group' | 'business';
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
  sortBy?: 'relevance' | 'distance' | 'date' | 'popularity' | 'rating';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: 'artist' | 'event' | 'post' | 'group' | 'business';
  title: string;
  description?: string;
  image?: string;
  rating?: number;
  price?: number;
  location?: {
    name: string;
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
  };
  distance?: number;
  date?: string;
  tags?: string[];
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  relevanceScore?: number;
  createdAt: string;
  updatedAt: string;
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

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'category' | 'tag' | 'location';
  relevance: number;
}

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  filters: SearchFilter;
  resultsCount: number;
  createdAt: string;
}

export interface TrendingContent {
  id: string;
  type: 'artist' | 'event' | 'post' | 'group' | 'business';
  title: string;
  description?: string;
  image?: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    velocity: number;
  };
  trendingScore: number;
  category: string;
  location?: {
    name: string;
    city: string;
    state: string;
  };
  createdAt: string;
  trendingPeriod: 'hour' | 'day' | 'week' | 'month';
}

export interface SearchIndexEntry {
  id: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  location?: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  };
  metadata: Record<string, any>;
  searchVector: string;
  createdAt: string;
  updatedAt: string;
}
