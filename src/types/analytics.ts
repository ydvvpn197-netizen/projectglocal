/**
 * Type definitions for analytics functionality and related features
 */

// =========================
// Core Analytics Types
// =========================

export interface AnalyticsEvent extends BaseEntity {
  id: string;
  event_type: AnalyticsEventType;
  event_name: string;
  user_id?: string;
  session_id?: string;
  timestamp: string;
  properties: Record<string, unknown>;
  context: AnalyticsContext;
  metadata: Record<string, unknown>;
}

export type AnalyticsEventType = 
  | 'page_view'
  | 'user_action'
  | 'system_event'
  | 'error_event'
  | 'performance_event'
  | 'business_event'
  | 'custom_event';

export interface AnalyticsContext {
  page_url: string;
  referrer?: string;
  user_agent: string;
  ip_address?: string;
  location?: GeoLocation;
  device_info: DeviceInfo;
  browser_info: BrowserInfo;
  session_data: SessionData;
  user_data?: UserData;
}

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'wearable' | 'unknown';
  platform: string;
  model?: string;
  screen_resolution: string;
  viewport_size: string;
  pixel_ratio: number;
  orientation: 'portrait' | 'landscape';
}

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  engine_version: string;
  language: string;
  languages: string[];
  cookies_enabled: boolean;
  javascript_enabled: boolean;
  local_storage_enabled: boolean;
  session_storage_enabled: boolean;
}

export interface SessionData {
  session_id: string;
  start_time: string;
  duration: number;
  page_count: number;
  event_count: number;
  is_active: boolean;
  last_activity: string;
}

export interface UserData {
  user_id: string;
  email?: string;
  username?: string;
  role?: string;
  subscription_tier?: string;
  registration_date: string;
  last_login: string;
  preferences: Record<string, unknown>;
}

// =========================
// User Analytics Types
// =========================

export interface UserAnalytics extends BaseEntity {
  user_id: string;
  period: string;
  metrics: UserMetrics;
  behavior: UserBehavior;
  engagement: UserEngagement;
  retention: UserRetention;
  conversion: UserConversion;
  segments: UserSegment[];
  insights: UserInsight[];
}

export interface UserMetrics {
  total_sessions: number;
  total_page_views: number;
  total_events: number;
  average_session_duration: number;
  average_pages_per_session: number;
  average_events_per_session: number;
  unique_pages_visited: number;
  returning_visits: number;
  bounce_rate: number;
  exit_rate: number;
}

export interface UserBehavior {
  page_flow: PageFlow[];
  click_patterns: ClickPattern[];
  scroll_patterns: ScrollPattern[];
  search_patterns: SearchPattern[];
  navigation_patterns: NavigationPattern[];
  time_spent_patterns: TimeSpentPattern[];
}

export interface PageFlow {
  from_page: string;
  to_page: string;
  count: number;
  conversion_rate: number;
  average_time: number;
}

export interface ClickPattern {
  element_type: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  click_count: number;
  unique_users: number;
  click_rate: number;
}

export interface ScrollPattern {
  page_url: string;
  average_scroll_depth: number;
  scroll_events: number;
  unique_users: number;
  engagement_score: number;
}

export interface SearchPattern {
  search_term: string;
  search_count: number;
  unique_users: number;
  result_clicks: number;
  no_result_searches: number;
  search_success_rate: number;
}

export interface NavigationPattern {
  navigation_type: 'menu' | 'breadcrumb' | 'pagination' | 'search' | 'direct';
  element_id?: string;
  usage_count: number;
  unique_users: number;
  success_rate: number;
}

export interface TimeSpentPattern {
  page_url: string;
  average_time: number;
  median_time: number;
  time_distribution: TimeDistribution[];
  engagement_score: number;
}

export interface TimeDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface UserEngagement {
  engagement_score: number;
  content_engagement: ContentEngagement;
  feature_usage: FeatureUsage;
  social_engagement: SocialEngagement;
  gamification_engagement: GamificationEngagement;
}

export interface ContentEngagement {
  articles_read: number;
  videos_watched: number;
  images_viewed: number;
  downloads: number;
  shares: number;
  comments: number;
  likes: number;
  average_time_per_content: number;
}

export interface FeatureUsage {
  feature_name: string;
  usage_count: number;
  unique_users: number;
  last_used: string;
  adoption_rate: number;
  retention_rate: number;
}

export interface SocialEngagement {
  posts_created: number;
  comments_made: number;
  likes_given: number;
  shares_made: number;
  follows: number;
  messages_sent: number;
  group_participation: number;
}

export interface GamificationEngagement {
  points_earned: number;
  badges_earned: number;
  levels_achieved: number;
  challenges_completed: number;
  leaderboard_position?: number;
  rewards_claimed: number;
}

export interface UserRetention {
  day_1_retention: number;
  day_7_retention: number;
  day_30_retention: number;
  day_90_retention: number;
  cohort_analysis: CohortAnalysis[];
  churn_prediction: ChurnPrediction;
}

export interface CohortAnalysis {
  cohort_date: string;
  cohort_size: number;
  day_1_retention: number;
  day_7_retention: number;
  day_30_retention: number;
  day_90_retention: number;
  lifetime_value: number;
}

export interface ChurnPrediction {
  churn_probability: number;
  churn_risk_factors: string[];
  churn_prevention_suggestions: string[];
  next_churn_date?: string;
  confidence_score: number;
}

export interface UserConversion {
  conversion_funnel: ConversionFunnel[];
  conversion_rates: ConversionRates;
  conversion_value: ConversionValue;
  conversion_attribution: ConversionAttribution;
}

export interface ConversionFunnel {
  stage_name: string;
  stage_order: number;
  users_entered: number;
  users_exited: number;
  conversion_rate: number;
  drop_off_rate: number;
  average_time_in_stage: number;
}

export interface ConversionRates {
  overall_conversion_rate: number;
  conversion_rate_by_source: Record<string, number>;
  conversion_rate_by_device: Record<string, number>;
  conversion_rate_by_location: Record<string, number>;
  conversion_rate_by_time: Record<string, number>;
}

export interface ConversionValue {
  total_conversion_value: number;
  average_conversion_value: number;
  conversion_value_by_source: Record<string, number>;
  conversion_value_by_product: Record<string, number>;
  lifetime_value: number;
}

export interface ConversionAttribution {
  attribution_model: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';
  touchpoints: Touchpoint[];
  assisted_conversions: number;
  direct_conversions: number;
}

export interface Touchpoint {
  channel: string;
  source: string;
  medium: string;
  campaign?: string;
  touch_count: number;
  conversion_credit: number;
  first_touch_date: string;
  last_touch_date: string;
}

export interface UserSegment {
  segment_id: string;
  segment_name: string;
  segment_type: 'demographic' | 'behavioral' | 'geographic' | 'technographic' | 'custom';
  criteria: SegmentCriteria[];
  user_count: number;
  created_at: string;
  updated_at: string;
}

export interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'range' | 'exists' | 'missing';
  value: unknown;
  logical_operator?: 'and' | 'or';
}

export interface UserInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'issue' | 'prediction';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
  data: Record<string, unknown>;
  created_at: string;
}

// =========================
// Content Analytics Types
// =========================

export interface ContentAnalytics extends BaseEntity {
  content_id: string;
  content_type: ContentType;
  period: string;
  metrics: ContentMetrics;
  performance: ContentPerformance;
  engagement: ContentEngagement;
  distribution: ContentDistribution;
  insights: ContentInsight[];
}

export type ContentType = 
  | 'article'
  | 'video'
  | 'image'
  | 'audio'
  | 'document'
  | 'post'
  | 'comment'
  | 'event'
  | 'product'
  | 'service';

export interface ContentMetrics {
  views: number;
  unique_views: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  downloads: number;
  completion_rate: number;
  average_time_spent: number;
}

export interface ContentPerformance {
  performance_score: number;
  ranking_position: number;
  search_visibility: number;
  social_reach: number;
  viral_coefficient: number;
  amplification_rate: number;
  conversion_rate: number;
  revenue_generated: number;
}

export interface ContentEngagement {
  engagement_score: number;
  interaction_rate: number;
  comment_quality_score: number;
  share_quality_score: number;
  user_sentiment: UserSentiment;
  engagement_trends: EngagementTrend[];
}

export interface UserSentiment {
  positive_percentage: number;
  neutral_percentage: number;
  negative_percentage: number;
  sentiment_score: number;
  key_phrases: string[];
  emotion_analysis: EmotionAnalysis;
}

export interface EmotionAnalysis {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  disgust: number;
  trust: number;
  anticipation: number;
}

export interface EngagementTrend {
  date: string;
  engagement_score: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
}

export interface ContentDistribution {
  channels: DistributionChannel[];
  geographic_distribution: GeographicDistribution[];
  demographic_distribution: DemographicDistribution[];
  device_distribution: DeviceDistribution[];
  time_distribution: TimeDistribution[];
}

export interface DistributionChannel {
  channel_name: string;
  views: number;
  engagement_rate: number;
  conversion_rate: number;
  cost_per_view: number;
  roi: number;
}

export interface GeographicDistribution {
  country: string;
  region?: string;
  city?: string;
  views: number;
  engagement_rate: number;
  conversion_rate: number;
}

export interface DemographicDistribution {
  age_group: string;
  gender: string;
  views: number;
  engagement_rate: number;
  conversion_rate: number;
}

export interface DeviceDistribution {
  device_type: string;
  platform: string;
  views: number;
  engagement_rate: number;
  conversion_rate: number;
}

export interface ContentInsight {
  type: 'performance' | 'engagement' | 'distribution' | 'trend' | 'opportunity' | 'issue';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
  data: Record<string, unknown>;
  created_at: string;
}

// =========================
// Business Analytics Types
// =========================

export interface BusinessAnalytics extends BaseEntity {
  business_id: string;
  period: string;
  metrics: BusinessMetrics;
  financial: FinancialMetrics;
  operational: OperationalMetrics;
  customer: CustomerMetrics;
  market: MarketMetrics;
  insights: BusinessInsight[];
}

export interface BusinessMetrics {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  average_order_value: number;
  customer_lifetime_value: number;
  customer_acquisition_cost: number;
  customer_retention_rate: number;
  churn_rate: number;
  net_promoter_score: number;
  customer_satisfaction_score: number;
}

export interface FinancialMetrics {
  revenue_growth: number;
  profit_margin: number;
  operating_expenses: number;
  cash_flow: number;
  return_on_investment: number;
  return_on_advertising_spend: number;
  cost_per_acquisition: number;
  average_revenue_per_user: number;
  monthly_recurring_revenue: number;
  annual_recurring_revenue: number;
}

export interface OperationalMetrics {
  order_fulfillment_time: number;
  inventory_turnover: number;
  customer_service_response_time: number;
  website_uptime: number;
  app_crash_rate: number;
  load_time: number;
  error_rate: number;
  throughput: number;
  efficiency_score: number;
}

export interface CustomerMetrics {
  new_customers: number;
  returning_customers: number;
  customer_segments: CustomerSegment[];
  customer_journey: CustomerJourney[];
  customer_feedback: CustomerFeedback[];
  customer_support: CustomerSupport;
}

export interface CustomerSegment {
  segment_name: string;
  segment_size: number;
  average_order_value: number;
  customer_lifetime_value: number;
  retention_rate: number;
  churn_rate: number;
  engagement_score: number;
}

export interface CustomerJourney {
  stage_name: string;
  stage_order: number;
  customers_entered: number;
  customers_exited: number;
  conversion_rate: number;
  average_time_in_stage: number;
  drop_off_reasons: string[];
}

export interface CustomerFeedback {
  feedback_type: 'review' | 'survey' | 'support_ticket' | 'social_media';
  rating: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  response_time: number;
  resolution_rate: number;
}

export interface CustomerSupport {
  total_tickets: number;
  resolved_tickets: number;
  average_resolution_time: number;
  customer_satisfaction_score: number;
  first_response_time: number;
  escalation_rate: number;
}

export interface MarketMetrics {
  market_share: number;
  competitive_position: number;
  market_growth_rate: number;
  customer_acquisition_rate: number;
  brand_awareness: number;
  brand_sentiment: number;
  market_trends: MarketTrend[];
}

export interface MarketTrend {
  trend_name: string;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
  impact_level: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
  opportunities: string[];
  threats: string[];
}

export interface BusinessInsight {
  type: 'financial' | 'operational' | 'customer' | 'market' | 'trend' | 'opportunity' | 'issue';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
  data: Record<string, unknown>;
  created_at: string;
}

// =========================
// Performance Analytics Types
// =========================

export interface PerformanceAnalytics extends BaseEntity {
  id: string;
  period: string;
  metrics: PerformanceMetrics;
  web_performance: WebPerformance;
  mobile_performance: MobilePerformance;
  api_performance: APIPerformance;
  database_performance: DatabasePerformance;
  insights: PerformanceInsight[];
}

export interface PerformanceMetrics {
  overall_score: number;
  availability: number;
  reliability: number;
  efficiency: number;
  scalability: number;
  security_score: number;
  compliance_score: number;
}

export interface WebPerformance {
  page_load_time: number;
  first_contentful_paint: number;
  largest_contentful_paint: number;
  first_input_delay: number;
  cumulative_layout_shift: number;
  time_to_interactive: number;
  dom_content_loaded: number;
  window_load: number;
  core_web_vitals: CoreWebVitals;
}

export interface CoreWebVitals {
  lcp_score: number;
  fid_score: number;
  cls_score: number;
  overall_score: number;
  status: 'good' | 'needs_improvement' | 'poor';
}

export interface MobilePerformance {
  app_launch_time: number;
  app_crash_rate: number;
  battery_usage: number;
  memory_usage: number;
  network_requests: number;
  offline_functionality: number;
  push_notification_delivery: number;
}

export interface APIPerformance {
  response_time: number;
  throughput: number;
  error_rate: number;
  availability: number;
  latency_p95: number;
  latency_p99: number;
  request_size: number;
  response_size: number;
  cache_hit_rate: number;
}

export interface DatabasePerformance {
  query_execution_time: number;
  connection_pool_usage: number;
  slow_query_count: number;
  deadlock_count: number;
  index_usage: number;
  table_size: number;
  backup_success_rate: number;
  replication_lag: number;
}

export interface PerformanceInsight {
  type: 'performance' | 'availability' | 'reliability' | 'efficiency' | 'scalability' | 'security' | 'compliance';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
  data: Record<string, unknown>;
  created_at: string;
}

// =========================
// Real-time Analytics Types
// =========================

export interface RealTimeAnalytics extends BaseEntity {
  id: string;
  timestamp: string;
  metrics: RealTimeMetrics;
  active_users: ActiveUsers;
  current_activity: CurrentActivity;
  system_status: SystemStatus;
  alerts: RealTimeAlert[];
}

export interface RealTimeMetrics {
  active_users_count: number;
  concurrent_sessions: number;
  requests_per_minute: number;
  events_per_minute: number;
  error_rate: number;
  response_time: number;
  throughput: number;
}

export interface ActiveUsers {
  total_active: number;
  new_users: number;
  returning_users: number;
  users_by_page: Record<string, number>;
  users_by_feature: Record<string, number>;
  users_by_location: Record<string, number>;
  users_by_device: Record<string, number>;
}

export interface CurrentActivity {
  current_page_views: number;
  current_searches: number;
  current_transactions: number;
  current_errors: number;
  trending_content: TrendingContent[];
  popular_features: PopularFeature[];
}

export interface TrendingContent {
  content_id: string;
  content_type: string;
  views: number;
  engagement_rate: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
}

export interface PopularFeature {
  feature_name: string;
  usage_count: number;
  unique_users: number;
  engagement_rate: number;
}

export interface SystemStatus {
  overall_status: 'healthy' | 'warning' | 'critical';
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_usage: number;
  database_status: 'healthy' | 'warning' | 'critical';
  cache_status: 'healthy' | 'warning' | 'critical';
}

export interface RealTimeAlert {
  alert_id: string;
  alert_type: 'performance' | 'error' | 'security' | 'business' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  is_acknowledged: boolean;
  is_resolved: boolean;
}

// =========================
// Analytics Configuration Types
// =========================

export interface AnalyticsConfig {
  tracking_enabled: boolean;
  privacy_compliant: boolean;
  data_retention_days: number;
  sampling_rate: number;
  event_batching: EventBatching;
  real_time_enabled: boolean;
  export_formats: string[];
  integrations: AnalyticsIntegration[];
}

export interface EventBatching {
  enabled: boolean;
  batch_size: number;
  batch_timeout: number;
  max_queue_size: number;
}

export interface AnalyticsIntegration {
  name: string;
  type: 'google_analytics' | 'mixpanel' | 'amplitude' | 'hotjar' | 'custom';
  config: Record<string, unknown>;
  is_active: boolean;
}

// =========================
// Analytics Export Types
// =========================

export interface AnalyticsExport {
  id: string;
  export_type: 'report' | 'data_dump' | 'dashboard' | 'custom';
  format: 'csv' | 'json' | 'excel' | 'pdf' | 'html';
  filters: AnalyticsFilter[];
  date_range: DateRange;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  file_size?: number;
  created_at: string;
  completed_at?: string;
}

export interface AnalyticsFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'range' | 'exists' | 'missing';
  value: unknown;
  logical_operator?: 'and' | 'or';
}

export interface DateRange {
  start: string;
  end: string;
  timezone?: string;
}

// =========================
// Base Entity Interface
// =========================

interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}
