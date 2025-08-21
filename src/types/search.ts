export interface TrendingContent {
  id: string;
  type: string;
  title: string;
  description?: string;
  image?: string;
  createdAt: string;
  trendingScore: number;
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
  type: 'query' | 'user' | 'hashtag' | 'location';
  score: number;
}