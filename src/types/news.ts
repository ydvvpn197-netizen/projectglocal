/**
 * Type definitions for news functionality and related features
 */

// =========================
// News Article Types
// =========================

export interface NewsArticle extends BaseEntity {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description?: string;
  content: string;
  author_id: string;
  author_name: string;
  author?: string;
  author_avatar?: string;
  category: NewsCategory;
  subcategory?: string;
  tags: string[];
  status: NewsStatus;
  published_at: string;
  featured_until?: string;
  is_featured: boolean;
  is_trending: boolean;
  is_breaking: boolean;
  is_verified: boolean;
  source_url?: string;
  source_name?: string;
  source_id?: string;
  image_url?: string;
  image_alt?: string;
  video_url?: string;
  audio_url?: string;
  reading_time: number;
  word_count: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  bookmark_count: number;
  engagement_score: number;
  trending_score: number;
  relevance_score?: number;
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  url?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  metadata: Record<string, unknown>;
}

export type NewsCategory = 
  | 'politics'
  | 'business'
  | 'technology'
  | 'entertainment'
  | 'sports'
  | 'health'
  | 'science'
  | 'world'
  | 'national'
  | 'local'
  | 'opinion'
  | 'analysis'
  | 'breaking'
  | 'featured'
  | 'trending';

export type NewsStatus = 'draft' | 'pending' | 'published' | 'archived' | 'deleted';

export interface NewsAuthor {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
  website?: string;
  social_links: SocialLinks;
  expertise: string[];
  verified: boolean;
  total_articles: number;
  total_views: number;
  total_likes: number;
  reputation_score: number;
  created_at: string;
  updated_at: string;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
}

// =========================
// News Feed Types
// =========================

export interface NewsFeed {
  id: string;
  name: string;
  description?: string;
  type: FeedType;
  filters: NewsFilter[];
  sort: NewsSort;
  is_personalized: boolean;
  is_public: boolean;
  owner_id?: string;
  subscribers_count: number;
  articles_count: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export type FeedType = 'personal' | 'public' | 'curated' | 'algorithmic' | 'rss';

export interface NewsFilter {
  category?: NewsCategory;
  subcategory?: string;
  tags?: string[];
  author_id?: string;
  source_name?: string;
  date_range?: DateRange;
  status?: NewsStatus;
  is_featured?: boolean;
  is_trending?: boolean;
  is_breaking?: boolean;
  min_reading_time?: number;
  max_reading_time?: number;
  min_engagement_score?: number;
  custom_filters?: Record<string, unknown>;
}

export interface NewsSort {
  field: 'published_at' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count' | 'share_count' | 'engagement_score' | 'trending_score' | 'relevance';
  direction: 'asc' | 'desc';
  secondary_sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface DateRange {
  start: string;
  end: string;
  timezone?: string;
}

// =========================
// News Aggregation Types
// =========================

export interface NewsSource {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  description?: string;
  category: NewsCategory;
  country: string;
  language: string;
  reliability_score: number;
  bias_score: number;
  fact_check_score: number;
  is_verified: boolean;
  is_active: boolean;
  last_fetch?: string;
  last_fetch_at?: string;
  fetch_frequency: number;
  total_articles: number;
  source_type: 'external' | 'local' | 'rss';
  api_endpoint: string;
  api_key?: string;
  rate_limit_per_hour: number;
  categories: NewsCategory[];
  location_filter?: string;
  category_filter?: string;
  created_at: string;
  updated_at: string;
}

export interface RSSFeed {
  id: string;
  source_id: string;
  url: string;
  title: string;
  description?: string;
  language: string;
  last_fetch?: string;
  fetch_frequency: number;
  is_active: boolean;
  error_count: number;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsAggregation {
  id: string;
  source_id: string;
  article_id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  published_at: string;
  fetched_at: string;
  status: 'pending' | 'processed' | 'published' | 'rejected' | 'error';
  processing_errors?: string[];
  metadata: Record<string, unknown>;
}

// =========================
// News Interaction Types
// =========================

export interface NewsInteraction {
  id: string;
  user_id: string;
  article_id: string;
  type: InteractionType;
  value?: string | number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export type InteractionType = 
  | 'view'
  | 'like'
  | 'dislike'
  | 'comment'
  | 'share'
  | 'bookmark'
  | 'report'
  | 'rate'
  | 'subscribe'
  | 'unsubscribe';

export interface NewsComment {
  id: string;
  article_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  parent_id?: string;
  is_edited: boolean;
  edited_at?: string;
  like_count: number;
  dislike_count: number;
  reply_count: number;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  moderation_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsRating {
  id: string;
  user_id: string;
  article_id: string;
  rating: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

// =========================
// News Analytics Types
// =========================

export interface NewsAnalytics {
  id: string;
  period: string;
  metrics: NewsMetrics;
  trends: NewsTrend[];
  breakdowns: NewsBreakdown[];
  insights: NewsInsight[];
  created_at: string;
}

export interface NewsMetrics {
  total_articles: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_bookmarks: number;
  average_reading_time: number;
  average_engagement_score: number;
  average_trending_score: number;
  unique_readers: number;
  returning_readers: number;
  bounce_rate: number;
  click_through_rate: number;
}

export interface NewsTrend {
  date: string;
  articles: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_score: number;
  trending_score: number;
}

export interface NewsBreakdown {
  category: string;
  articles: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_score: number;
  subcategories?: NewsBreakdown[];
}

export interface NewsInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'issue';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
  data: Record<string, unknown>;
}

// =========================
// News Recommendation Types
// =========================

export interface NewsRecommendation {
  id: string;
  user_id: string;
  article_id: string;
  score: number;
  reason: string;
  algorithm: string;
  is_clicked: boolean;
  clicked_at?: string;
  is_dismissed: boolean;
  dismissed_at?: string;
  created_at: string;
}

export interface NewsRecommendationEngine {
  id: string;
  name: string;
  description?: string;
  type: 'collaborative' | 'content_based' | 'hybrid' | 'deep_learning';
  config: RecommendationConfig;
  performance_metrics: RecommendationPerformance;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecommendationConfig {
  algorithm: string;
  parameters: Record<string, unknown>;
  filters: Record<string, unknown>;
  boost_factors: Record<string, number>;
  decay_factors: Record<string, number>;
  max_recommendations: number;
  min_score: number;
}

export interface RecommendationPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  click_through_rate: number;
  conversion_rate: number;
  diversity_score: number;
  novelty_score: number;
  coverage_score: number;
}

// =========================
// News Curation Types
// =========================

export interface NewsCuration {
  id: string;
  name: string;
  description?: string;
  curator_id: string;
  curator_name: string;
  type: CurationType;
  criteria: CurationCriteria[];
  is_automated: boolean;
  is_public: boolean;
  subscribers_count: number;
  articles_count: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export type CurationType = 'manual' | 'automated' | 'hybrid' | 'ai_powered';

export interface CurationCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'range';
  value: unknown;
  weight: number;
  logical_operator?: 'and' | 'or';
}

export interface CuratedArticle {
  id: string;
  curation_id: string;
  article_id: string;
  position: number;
  reason: string;
  curator_notes?: string;
  is_featured: boolean;
  featured_until?: string;
  created_at: string;
}

// =========================
// News Notification Types
// =========================

export interface NewsNotification {
  id: string;
  user_id: string;
  type: NewsNotificationType;
  title: string;
  message: string;
  article_id?: string;
  category?: NewsCategory;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
  created_at: string;
}

export type NewsNotificationType = 
  | 'breaking_news'
  | 'category_update'
  | 'author_post'
  | 'trending_article'
  | 'personalized_recommendation'
  | 'subscription_update'
  | 'curation_update'
  | 'system_alert';

// =========================
// News Search Types
// =========================

export interface NewsSearchQuery {
  query: string;
  filters: NewsSearchFilters;
  sort: NewsSearchSort;
  pagination: NewsPaginationOptions;
  options?: NewsSearchOptions;
}

export interface NewsSearchFilters {
  category?: NewsCategory;
  subcategory?: string;
  tags?: string[];
  author_id?: string;
  source_name?: string;
  date_range?: DateRange;
  status?: NewsStatus;
  is_featured?: boolean;
  is_trending?: boolean;
  is_breaking?: boolean;
  min_reading_time?: number;
  max_reading_time?: number;
  min_engagement_score?: number;
  language?: string;
  country?: string;
  custom_filters?: Record<string, unknown>;
}

export interface NewsSearchSort {
  field: 'relevance' | 'published_at' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count' | 'share_count' | 'engagement_score' | 'trending_score';
  direction: 'asc' | 'desc';
}

export interface NewsPaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

export interface NewsSearchOptions {
  include_suggestions?: boolean;
  include_spell_check?: boolean;
  include_synonyms?: boolean;
  fuzzy_matching?: boolean;
  boost_recent?: boolean;
  boost_popular?: boolean;
  boost_featured?: boolean;
  max_results?: number;
  timeout_ms?: number;
  cache_results?: boolean;
}

export interface NewsSearchResult {
  articles: NewsArticle[];
  pagination: NewsPaginationInfo;
  facets: NewsSearchFacets;
  suggestions: NewsSearchSuggestion[];
  spell_check?: NewsSpellCheckResult;
  query_time: number;
  total_results: number;
  metadata: NewsSearchMetadata;
}

export interface NewsPaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface NewsSearchFacets {
  categories: NewsFacetItem[];
  subcategories: NewsFacetItem[];
  tags: NewsFacetItem[];
  authors: NewsFacetItem[];
  sources: NewsFacetItem[];
  dates: NewsFacetItem[];
  custom_facets: Record<string, NewsFacetItem[]>;
}

export interface NewsFacetItem {
  value: string;
  count: number;
  label: string;
  is_selected?: boolean;
}

export interface NewsSearchSuggestion {
  text: string;
  type: 'query' | 'category' | 'tag' | 'author' | 'source';
  relevance_score: number;
}

export interface NewsSpellCheckResult {
  original_query: string;
  corrected_query: string;
  suggestions: string[];
  confidence: number;
}

export interface NewsSearchMetadata {
  query_id: string;
  search_engine: string;
  index_version: string;
  cache_hit: boolean;
  filters_applied: string[];
  boost_factors: Record<string, number>;
  ranking_factors: Record<string, number>;
}

// =========================
// News Performance Types
// =========================

export interface NewsPerformance {
  query_time: number;
  index_time: number;
  cache_hit_rate: number;
  memory_usage: number;
  cpu_usage: number;
  disk_usage: number;
  network_latency: number;
  error_rate: number;
  throughput: number;
  response_time_p95: number;
  response_time_p99: number;
}

export interface NewsPerformanceMetrics {
  average_query_time: number;
  average_index_time: number;
  cache_hit_rate: number;
  memory_usage_avg: number;
  cpu_usage_avg: number;
  error_rate: number;
  throughput_avg: number;
  response_time_p95: number;
  response_time_p99: number;
  slow_queries: NewsSlowQuery[];
}

export interface NewsSlowQuery {
  query: string;
  execution_time: number;
  timestamp: string;
  user_id?: string;
  explain_plan?: Record<string, unknown>;
}

// =========================
// News Configuration Types
// =========================

export interface NewsConfig {
  default_sort: 'published_at' | 'relevance' | 'trending' | 'popular';
  max_search_results: number;
  default_page_size: number;
  max_page_size: number;
  search_timeout: number;
  cache_enabled: boolean;
  cache_ttl: number;
  spell_check_enabled: boolean;
  suggestions_enabled: boolean;
  facets_enabled: boolean;
  highlighting_enabled: boolean;
  synonyms_enabled: boolean;
  boost_factors: NewsBoostFactors;
  ranking_factors: NewsRankingFactors;
}

export interface NewsBoostFactors {
  recency: number;
  popularity: number;
  relevance: number;
  author_reputation: number;
  source_reliability: number;
  featured_status: number;
  trending_status: number;
  breaking_status: number;
  content_quality: number;
  engagement_rate: number;
}

export interface NewsRankingFactors {
  text_relevance: number;
  field_boosts: Record<string, number>;
  function_scores: NewsFunctionScore[];
  custom_scripts: NewsCustomScript[];
}

export interface NewsFunctionScore {
  field: string;
  factor: number;
  modifier: 'log' | 'log1p' | 'log2p' | 'ln' | 'ln1p' | 'ln2p' | 'square' | 'sqrt' | 'reciprocal';
  missing?: number;
}

export interface NewsCustomScript {
  name: string;
  script: string;
  weight: number;
  parameters?: Record<string, unknown>;
}

// =========================
// News User Preferences
// =========================

export interface NewsUserPreferences {
  user_id: string;
  default_sort: 'published_at' | 'relevance' | 'trending' | 'popular';
  preferred_categories: NewsCategory[];
  preferred_authors: string[];
  preferred_sources: string[];
  excluded_categories: NewsCategory[];
  excluded_authors: string[];
  excluded_sources: string[];
  reading_time_preference?: number;
  notification_preferences: NewsNotificationPreferences;
  language: string;
  timezone: string;
  safe_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsNotificationPreferences {
  breaking_news: boolean;
  category_updates: boolean;
  author_posts: boolean;
  trending_articles: boolean;
  personalized_recommendations: boolean;
  subscription_updates: boolean;
  curation_updates: boolean;
  system_alerts: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

// =========================
// News Validation Types
// =========================

export interface NewsValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
  validator?: (value: unknown) => boolean | string;
}

export interface NewsValidation {
  is_valid: boolean;
  errors: NewsValidationError[];
  warnings: NewsValidationWarning[];
  suggestions: NewsValidationSuggestion[];
}

export interface NewsValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

export interface NewsValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

export interface NewsValidationSuggestion {
  field: string;
  message: string;
  current_value: unknown;
  suggested_value: unknown;
  reason: string;
}

// =========================
// Utility Types
// =========================

export interface NewsFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'range' | 'exists' | 'missing';
  value: unknown;
  logical_operator?: 'and' | 'or';
}

export interface NewsAggregation {
  name: string;
  type: 'terms' | 'range' | 'date_histogram' | 'histogram' | 'stats' | 'cardinality' | 'geo_distance';
  field: string;
  config: Record<string, unknown>;
}

export interface NewsHighlight {
  field: string;
  pre_tags: string[];
  post_tags: string[];
  fragment_size: number;
  number_of_fragments: number;
  highlight_query?: Record<string, unknown>;
}

// =========================
// News API Types
// =========================

export interface NewsApiArticle {
  source: {
    id: string;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  location?: string | null;
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

export interface NewsAggregationConfig {
  sources: NewsSource[];
  categories: NewsCategory[];
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
  timeRange?: {
    start: string;
    end: string;
  };
  maxArticles: number;
  deduplication: boolean;
  contentFiltering: boolean;
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

export interface NewsProcessingResult {
  success: boolean;
  articles_processed: number;
  articles_stored: number;
  errors: string[];
  processing_time_ms: number;
}

// =========================
// Base Entity Interface
// =========================

interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}
