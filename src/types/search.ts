/**
 * Type definitions for search functionality and related features
 */

// =========================
// Search Query Types
// =========================

export interface SearchQuery {
  query: string;
  filters: SearchFilters;
  sort: SearchSort;
  pagination: PaginationOptions;
  context?: SearchContext;
  options?: SearchOptions;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  location?: string;
  price_range?: PriceRange;
  rating?: number;
  availability?: string[];
  tags?: string[];
  date_range?: DateRange;
  distance?: number;
  features?: string[];
  user_type?: 'individual' | 'business' | 'all';
  content_type?: 'post' | 'event' | 'business' | 'group' | 'user' | 'all';
  status?: 'active' | 'inactive' | 'pending' | 'all';
  verified?: boolean;
  featured?: boolean;
  trending?: boolean;
  popular?: boolean;
  recent?: boolean;
  custom_filters?: Record<string, unknown>;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
  include_free?: boolean;
}

export interface DateRange {
  start: string;
  end: string;
  timezone?: string;
}

export interface SearchSort {
  field: 'relevance' | 'rating' | 'price' | 'distance' | 'date' | 'popularity' | 'trending' | 'name';
  direction: 'asc' | 'desc';
  secondary_sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
  offset?: number;
}

export interface SearchContext {
  user_id?: string;
  user_location?: LocationData;
  user_preferences?: UserSearchPreferences;
  search_history?: string[];
  session_id?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  platform?: 'web' | 'ios' | 'android';
}

export interface SearchOptions {
  include_suggestions?: boolean;
  include_autocomplete?: boolean;
  include_spell_check?: boolean;
  include_synonyms?: boolean;
  fuzzy_matching?: boolean;
  boost_recent?: boolean;
  boost_popular?: boolean;
  boost_verified?: boolean;
  max_results?: number;
  timeout_ms?: number;
  cache_results?: boolean;
}

// =========================
// Search Result Types
// =========================

export interface SearchResult<T> {
  data: T[];
  pagination: PaginationInfo;
  facets: SearchFacets;
  suggestions: SearchSuggestion[];
  spell_check?: SpellCheckResult;
  query_time: number;
  total_results: number;
  metadata: SearchMetadata;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  next_page?: number;
  prev_page?: number;
}

export interface SearchFacets {
  categories: FacetItem[];
  locations: FacetItem[];
  price_ranges: FacetItem[];
  ratings: FacetItem[];
  tags: FacetItem[];
  user_types: FacetItem[];
  content_types: FacetItem[];
  statuses: FacetItem[];
  features: FacetItem[];
  custom_facets: Record<string, FacetItem[]>;
}

export interface FacetItem {
  value: string;
  count: number;
  label: string;
  is_selected?: boolean;
  children?: FacetItem[];
  metadata?: Record<string, unknown>;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'category' | 'tag' | 'location' | 'user';
  relevance_score: number;
  metadata?: Record<string, unknown>;
}

export interface SpellCheckResult {
  original_query: string;
  corrected_query: string;
  suggestions: string[];
  confidence: number;
  did_you_mean?: string;
}

export interface SearchMetadata {
  query_id: string;
  search_engine: string;
  index_version: string;
  cache_hit: boolean;
  filters_applied: string[];
  boost_factors: Record<string, number>;
  ranking_factors: Record<string, number>;
  debug_info?: Record<string, unknown>;
}

// =========================
// Searchable Content Types
// =========================

export interface SearchableContent {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  content: string;
  tags: string[];
  category: string;
  subcategory?: string;
  location?: LocationData;
  author_id: string;
  author_name: string;
  author_type: 'individual' | 'business';
  rating?: number;
  review_count?: number;
  price?: number;
  currency?: string;
  status: 'active' | 'inactive' | 'pending' | 'draft';
  is_verified: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_popular: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  expires_at?: string;
  metadata: Record<string, unknown>;
  search_score?: number;
  relevance_score?: number;
}

export type ContentType = 
  | 'post'
  | 'event'
  | 'business'
  | 'group'
  | 'user'
  | 'service'
  | 'product'
  | 'article'
  | 'review'
  | 'comment';

export interface LocationData {
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
  place_id?: string;
  timezone?: string;
}

// =========================
// Search Index Types
// =========================

export interface SearchIndex {
  id: string;
  name: string;
  description?: string;
  content_type: ContentType;
  schema: SearchIndexSchema;
  settings: SearchIndexSettings;
  status: 'active' | 'building' | 'maintenance' | 'disabled';
  document_count: number;
  size_bytes: number;
  last_updated: string;
  created_at: string;
}

export interface SearchIndexSchema {
  fields: SearchField[];
  analyzers: SearchAnalyzer[];
  filters: SearchFilter[];
  sorters: SearchSorter[];
}

export interface SearchField {
  name: string;
  type: FieldType;
  analyzer?: string;
  filter?: string;
  sorter?: string;
  is_searchable: boolean;
  is_filterable: boolean;
  is_sortable: boolean;
  is_facetable: boolean;
  boost?: number;
  required?: boolean;
  default_value?: unknown;
  validation_rules?: ValidationRule[];
}

export type FieldType = 
  | 'text'
  | 'keyword'
  | 'number'
  | 'boolean'
  | 'date'
  | 'geo_point'
  | 'nested'
  | 'object';

export interface SearchAnalyzer {
  name: string;
  type: 'standard' | 'simple' | 'whitespace' | 'stop' | 'keyword' | 'pattern' | 'custom';
  config: Record<string, unknown>;
}

export interface SearchFilter {
  name: string;
  type: 'lowercase' | 'uppercase' | 'trim' | 'stopwords' | 'stemming' | 'synonyms' | 'custom';
  config: Record<string, unknown>;
}

export interface SearchSorter {
  name: string;
  type: 'field' | 'geo_distance' | 'script' | 'custom';
  config: Record<string, unknown>;
}

export interface SearchIndexSettings {
  shards: number;
  replicas: number;
  refresh_interval: string;
  max_result_window: number;
  analysis: AnalysisSettings;
  index: IndexSettings;
  search: SearchSettings;
}

export interface AnalysisSettings {
  analyzer: Record<string, unknown>;
  filter: Record<string, unknown>;
  normalizer: Record<string, unknown>;
  char_filter: Record<string, unknown>;
}

export interface IndexSettings {
  number_of_shards: number;
  number_of_replicas: number;
  refresh_interval: string;
  max_result_window: number;
  blocks: Record<string, unknown>;
}

export interface SearchSettings {
  default_field: string;
  default_operator: 'AND' | 'OR';
  allow_leading_wildcard: boolean;
  enable_position_increments: boolean;
  max_expansions: number;
  fuzzy_prefix_length: number;
  fuzzy_min_sim: number;
}

// =========================
// Search Analytics Types
// =========================

export interface SearchAnalytics {
  id: string;
  period: string;
  metrics: SearchMetrics;
  trends: SearchTrend[];
  breakdowns: SearchBreakdown[];
  insights: SearchInsight[];
  created_at: string;
}

export interface SearchMetrics {
  total_searches: number;
  unique_searchers: number;
  total_results: number;
  average_results_per_search: number;
  zero_result_searches: number;
  zero_result_rate: number;
  average_search_time: number;
  search_success_rate: number;
  click_through_rate: number;
  conversion_rate: number;
}

export interface SearchTrend {
  date: string;
  searches: number;
  results: number;
  zero_results: number;
  avg_search_time: number;
  click_through_rate: number;
}

export interface SearchBreakdown {
  category: string;
  searches: number;
  results: number;
  zero_results: number;
  click_through_rate: number;
  conversion_rate: number;
  subcategories?: SearchBreakdown[];
}

export interface SearchInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'issue';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
  data: Record<string, unknown>;
}

// =========================
// Search Performance Types
// =========================

export interface SearchPerformance {
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

export interface SearchPerformanceMetrics {
  average_query_time: number;
  average_index_time: number;
  cache_hit_rate: number;
  memory_usage_avg: number;
  cpu_usage_avg: number;
  error_rate: number;
  throughput_avg: number;
  response_time_p95: number;
  response_time_p99: number;
  slow_queries: SlowQuery[];
}

export interface SlowQuery {
  query: string;
  execution_time: number;
  timestamp: string;
  user_id?: string;
  session_id?: string;
  explain_plan?: Record<string, unknown>;
}

// =========================
// Search Configuration Types
// =========================

export interface SearchConfig {
  default_search_type: 'relevance' | 'exact' | 'fuzzy' | 'semantic';
  max_search_results: number;
  default_page_size: number;
  max_page_size: number;
  search_timeout: number;
  cache_enabled: boolean;
  cache_ttl: number;
  spell_check_enabled: boolean;
  autocomplete_enabled: boolean;
  suggestions_enabled: boolean;
  facets_enabled: boolean;
  highlighting_enabled: boolean;
  synonyms_enabled: boolean;
  boost_factors: BoostFactors;
  ranking_factors: RankingFactors;
}

export interface BoostFactors {
  recency: number;
  popularity: number;
  relevance: number;
  user_rating: number;
  verification_status: number;
  featured_status: number;
  trending_status: number;
  content_quality: number;
  user_reputation: number;
  engagement_rate: number;
}

export interface RankingFactors {
  text_relevance: number;
  field_boosts: Record<string, number>;
  function_scores: FunctionScore[];
  custom_scripts: CustomScript[];
}

export interface FunctionScore {
  field: string;
  factor: number;
  modifier: 'log' | 'log1p' | 'log2p' | 'ln' | 'ln1p' | 'ln2p' | 'square' | 'sqrt' | 'reciprocal';
  missing?: number;
}

export interface CustomScript {
  name: string;
  script: string;
  weight: number;
  parameters?: Record<string, unknown>;
}

// =========================
// Search User Preferences
// =========================

export interface UserSearchPreferences {
  user_id: string;
  default_search_type: 'relevance' | 'exact' | 'fuzzy' | 'semantic';
  default_filters: Record<string, unknown>;
  preferred_categories: string[];
  preferred_locations: string[];
  price_range_preference?: PriceRange;
  rating_preference?: number;
  content_type_preferences: Record<ContentType, number>;
  search_history_enabled: boolean;
  personalized_results: boolean;
  safe_search: boolean;
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  query: string;
  filters: SearchFilters;
  results_count: number;
  clicked_results: string[];
  search_time: number;
  timestamp: string;
  session_id: string;
  device_type: string;
  platform: string;
}

// =========================
// Search Validation Types
// =========================

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
  validator?: (value: unknown) => boolean | string;
}

export interface SearchValidation {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

export interface ValidationSuggestion {
  field: string;
  message: string;
  current_value: unknown;
  suggested_value: unknown;
  reason: string;
}

// =========================
// Utility Types
// =========================

export interface SearchFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'range' | 'exists' | 'missing';
  value: unknown;
  logical_operator?: 'and' | 'or';
}

export interface SearchAggregation {
  name: string;
  type: 'terms' | 'range' | 'date_histogram' | 'histogram' | 'stats' | 'cardinality' | 'geo_distance';
  field: string;
  config: Record<string, unknown>;
}

export interface SearchHighlight {
  field: string;
  pre_tags: string[];
  post_tags: string[];
  fragment_size: number;
  number_of_fragments: number;
  highlight_query?: Record<string, unknown>;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'category' | 'tag' | 'location' | 'user';
  relevance_score: number;
  metadata?: Record<string, unknown>;
}

export interface SearchResult<T> {
  data: T[];
  pagination: PaginationInfo;
  facets: SearchFacets;
  suggestions: SearchSuggestion[];
  spell_check?: SpellCheckResult;
  query_time: number;
  total_results: number;
  metadata: SearchMetadata;
}
