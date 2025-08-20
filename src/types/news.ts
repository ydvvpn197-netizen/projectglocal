// News Feed Type Definitions

export interface NewsSource {
  id: string;
  name: string;
  api_endpoint: string;
  api_key?: string;
  source_type: 'external' | 'local' | 'rss';
  location_bias?: string;
  categories: string[];
  is_active: boolean;
  rate_limit_per_hour: number;
  last_fetch_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsCategory {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon?: string;
  color?: string;
  relevance_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsArticle {
  id: string;
  source_id: string;
  external_id?: string;
  title: string;
  description?: string;
  content?: string;
  url?: string;
  image_url?: string;
  published_at?: string;
  author?: string;
  category?: string;
  tags: string[];
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  relevance_score: number;
  engagement_score: number;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsPreferences {
  id: string;
  user_id: string;
  preferred_categories: string[];
  excluded_categories: string[];
  preferred_sources: string[];
  excluded_sources: string[];
  location_radius_km: number;
  max_articles_per_day: number;
  notification_enabled: boolean;
  digest_frequency: 'hourly' | 'daily' | 'weekly';
  last_digest_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsArticleInteraction {
  id: string;
  user_id: string;
  article_id: string;
  interaction_type: 'view' | 'like' | 'share' | 'bookmark' | 'comment';
  interaction_data?: any;
  created_at: string;
}

export interface NewsArticleBookmark {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface NewsArticleComment {
  id: string;
  user_id: string;
  article_id: string;
  parent_comment_id?: string;
  content: string;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

export interface NewsApiArticle {
  source: {
    id?: string;
    name: string;
  };
  author?: string;
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  content?: string;
}

export interface GoogleNewsApiResponse {
  articles: GoogleNewsArticle[];
}

export interface GoogleNewsArticle {
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

// News Feed Types
export interface NewsFeedItem extends NewsArticle {
  distance_km?: number;
  is_bookmarked?: boolean;
  interaction_count?: number;
  comment_count?: number;
}

export interface NewsFeedFilters {
  categories?: string[];
  sources?: string[];
  date_range?: 'today' | 'week' | 'month';
  location_radius?: number;
  sort_by?: 'relevance' | 'date' | 'engagement';
}

export interface NewsSearchParams {
  query: string;
  category?: string;
  source?: string;
  date_from?: string;
  date_to?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

// News Personalization Types
export interface NewsPersonalizationData {
  reading_history: string[];
  category_preferences: Record<string, number>;
  source_preferences: Record<string, number>;
  location_preferences: {
    enabled: boolean;
    radius_km: number;
  };
  engagement_patterns: {
    view_time: number;
    completion_rate: number;
    interaction_rate: number;
  };
}

// News Notification Types
export interface NewsNotification {
  id: string;
  user_id: string;
  type: 'breaking_news' | 'digest' | 'trending' | 'personalized';
  title: string;
  message: string;
  article_id?: string;
  category?: string;
  is_read: boolean;
  created_at: string;
}

// News Analytics Types
export interface NewsAnalytics {
  total_articles: number;
  total_views: number;
  total_interactions: number;
  popular_categories: Array<{
    category: string;
    count: number;
    engagement_rate: number;
  }>;
  popular_sources: Array<{
    source: string;
    count: number;
    engagement_rate: number;
  }>;
  user_engagement: {
    avg_reading_time: number;
    completion_rate: number;
    interaction_rate: number;
  };
  location_insights: {
    local_articles: number;
    local_engagement: number;
    top_locations: Array<{
      location: string;
      article_count: number;
    }>;
  };
}

// News Processing Types
export interface NewsProcessingResult {
  article: NewsArticle;
  processing_status: 'success' | 'error' | 'pending';
  location_extracted?: {
    lat: number;
    lng: number;
    name: string;
    confidence: number;
  };
  category_predicted?: {
    category: string;
    confidence: number;
  };
  relevance_score?: number;
  error_message?: string;
}

// News Aggregation Types
export interface NewsAggregationConfig {
  sources: string[];
  categories: string[];
  location_bias?: string;
  max_articles_per_source: number;
  deduplication_enabled: boolean;
  content_filtering_enabled: boolean;
}

export interface NewsAggregationResult {
  total_articles_fetched: number;
  total_articles_processed: number;
  total_articles_stored: number;
  duplicates_removed: number;
  processing_errors: number;
  sources_processed: string[];
  processing_time_ms: number;
}
