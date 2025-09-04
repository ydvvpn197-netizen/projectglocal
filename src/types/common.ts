/**
 * Comprehensive type definitions for the application
 * Replaces all 'any' types with proper TypeScript interfaces
 */

// =========================
// Base Types
// =========================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface BaseUser extends BaseEntity {
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  is_verified: boolean;
  is_active: boolean;
  last_login?: string;
}

export interface BaseContent extends BaseEntity {
  title: string;
  description?: string;
  content: string;
  author_id: string;
  is_published: boolean;
  published_at?: string;
  tags: string[];
  category: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
}

// =========================
// User Types
// =========================

export interface UserProfile extends BaseUser {
  bio?: string;
  location?: string;
  website?: string;
  social_links: SocialLinks;
  preferences: UserPreferences;
  stats: UserStats;
  badges: Badge[];
  subscription_tier: SubscriptionTier;
  points: number;
  reputation_score: number;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export interface UserPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  privacy_level: 'public' | 'friends' | 'private';
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface UserStats {
  total_posts: number;
  total_comments: number;
  total_likes_received: number;
  total_shares: number;
  followers_count: number;
  following_count: number;
  posts_this_month: number;
  engagement_rate: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  earned_at: string;
  category: 'achievement' | 'participation' | 'special';
}

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

// =========================
// Content Types
// =========================

export interface Post extends BaseContent {
  type: 'text' | 'image' | 'video' | 'link' | 'poll';
  media_urls?: string[];
  poll_data?: PollData;
  link_data?: LinkData;
  is_featured: boolean;
  is_pinned: boolean;
  is_locked: boolean;
  moderation_status: ModerationStatus;
  community_id?: string;
  group_id?: string;
}

export interface PollData {
  question: string;
  options: PollOption[];
  end_date: string;
  is_multiple_choice: boolean;
  allow_anonymous: boolean;
  results_visible: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  vote_count: number;
}

export interface LinkData {
  url: string;
  title?: string;
  description?: string;
  image_url?: string;
  domain: string;
}

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface Comment extends BaseEntity {
  post_id: string;
  author_id: string;
  content: string;
  parent_id?: string;
  reply_count: number;
  like_count: number;
  is_edited: boolean;
  edited_at?: string;
  moderation_status: ModerationStatus;
}

export interface Event extends BaseContent {
  start_date: string;
  end_date: string;
  location: EventLocation;
  capacity?: number;
  current_attendees: number;
  is_free: boolean;
  ticket_price?: number;
  currency: string;
  event_type: EventType;
  status: EventStatus;
  organizer_id: string;
  co_organizers: string[];
  categories: string[];
  tags: string[];
}

export interface EventLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  is_virtual: boolean;
  virtual_meeting_url?: string;
}

export type EventType = 'conference' | 'workshop' | 'meetup' | 'webinar' | 'concert' | 'exhibition' | 'other';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'postponed' | 'completed';

// =========================
// Community Types
// =========================

export interface CommunityGroup extends BaseEntity {
  name: string;
  description: string;
  avatar_url?: string;
  cover_url?: string;
  owner_id: string;
  moderators: string[];
  members: string[];
  member_count: number;
  is_public: boolean;
  is_verified: boolean;
  category: string;
  tags: string[];
  rules: GroupRule[];
  settings: GroupSettings;
  stats: GroupStats;
}

export interface GroupRule {
  id: string;
  title: string;
  description: string;
  is_enforced: boolean;
}

export interface GroupSettings {
  allow_member_posts: boolean;
  require_approval: boolean;
  allow_anonymous_posts: boolean;
  max_post_length: number;
  allow_media: boolean;
  allow_polls: boolean;
  allow_events: boolean;
}

export interface GroupStats {
  total_posts: number;
  total_members: number;
  active_members: number;
  posts_this_week: number;
  engagement_rate: number;
}

// =========================
// Business Types
// =========================

export interface BusinessProfile extends BaseEntity {
  name: string;
  description: string;
  logo_url?: string;
  cover_url?: string;
  owner_id: string;
  category: BusinessCategory;
  subcategory: string;
  contact_info: BusinessContactInfo;
  location: BusinessLocation;
  services: BusinessService[];
  hours: BusinessHours;
  social_media: SocialLinks;
  verification_status: VerificationStatus;
  rating: number;
  review_count: number;
  is_featured: boolean;
  subscription_plan: BusinessSubscriptionPlan;
}

export type BusinessCategory = 
  | 'food_beverage' 
  | 'retail' 
  | 'health_wellness' 
  | 'beauty_fashion' 
  | 'technology' 
  | 'education' 
  | 'entertainment' 
  | 'professional_services' 
  | 'home_garden' 
  | 'automotive' 
  | 'other';

export interface BusinessContactInfo {
  phone: string;
  email: string;
  website?: string;
  emergency_contact?: string;
}

export interface BusinessLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  service_areas: string[];
}

export interface BusinessService {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration?: number;
  is_available: boolean;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  is_open: boolean;
  open_time?: string;
  close_time?: string;
  is_24_hours: boolean;
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type BusinessSubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

// =========================
// Booking & Payment Types
// =========================

export interface Booking extends BaseEntity {
  customer_id: string;
  business_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  status: BookingStatus;
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  special_requests?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  refund_amount?: number;
  notes?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'digital_wallet' | 'cash';
  last4?: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
}

export interface PaymentTransaction extends BaseEntity {
  booking_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method_id: string;
  transaction_id: string;
  gateway_response?: GatewayResponse;
  refund_amount?: number;
  refund_reason?: string;
}

export interface GatewayResponse {
  success: boolean;
  message: string;
  transaction_id: string;
  gateway: string;
  response_code: string;
  response_message: string;
}

// =========================
// Notification Types
// =========================

export interface Notification extends BaseEntity {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  action_data?: Record<string, unknown>;
  priority: NotificationPriority;
  expires_at?: string;
  category: NotificationCategory;
}

export type NotificationType = 
  | 'booking_confirmation' 
  | 'booking_reminder' 
  | 'payment_success' 
  | 'payment_failed' 
  | 'new_review' 
  | 'new_follower' 
  | 'new_message' 
  | 'post_like' 
  | 'post_comment' 
  | 'event_reminder' 
  | 'system_alert';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationCategory = 'booking' | 'payment' | 'social' | 'system' | 'marketing';

// =========================
// Search & Filter Types
// =========================

export interface SearchQuery {
  query: string;
  filters: SearchFilters;
  sort: SearchSort;
  pagination: PaginationOptions;
}

export interface SearchFilters {
  category?: string;
  location?: string;
  price_range?: PriceRange;
  rating?: number;
  availability?: string[];
  tags?: string[];
  date_range?: DateRange;
  distance?: number;
  features?: string[];
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface SearchSort {
  field: 'relevance' | 'rating' | 'price' | 'distance' | 'date' | 'popularity';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

export interface SearchResult<T> {
  data: T[];
  pagination: PaginationOptions;
  facets: SearchFacets;
  query_time: number;
}

export interface SearchFacets {
  categories: FacetItem[];
  locations: FacetItem[];
  price_ranges: FacetItem[];
  ratings: FacetItem[];
  tags: FacetItem[];
}

export interface FacetItem {
  value: string;
  count: number;
  label: string;
}

// =========================
// Analytics & Metrics Types
// =========================

export interface AnalyticsData {
  period: string;
  metrics: MetricsData;
  trends: TrendData[];
  breakdowns: BreakdownData[];
}

export interface MetricsData {
  total_users: number;
  active_users: number;
  total_posts: number;
  total_bookings: number;
  total_revenue: number;
  engagement_rate: number;
  conversion_rate: number;
  retention_rate: number;
}

export interface TrendData {
  date: string;
  value: number;
  change_percentage: number;
  trend_direction: 'up' | 'down' | 'stable';
}

export interface BreakdownData {
  category: string;
  value: number;
  percentage: number;
  change_percentage: number;
}

// =========================
// AI & Recommendation Types
// =========================

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence_score: number;
  data_source: string;
  generated_at: string;
  actionable: boolean;
  action_items?: string[];
}

export type InsightType = 
  | 'trend_analysis' 
  | 'user_behavior' 
  | 'content_performance' 
  | 'recommendation' 
  | 'anomaly_detection' 
  | 'prediction';

export interface UserPreference {
  category: string;
  interest_score: number;
  last_interaction: string;
  interaction_count: number;
}

export interface UserBehaviorPattern {
  pattern_type: string;
  frequency: number;
  time_of_day: string;
  day_of_week: string;
  duration: number;
  confidence: number;
}

export interface ContentAnalysis {
  quality_score: number;
  engagement_potential: number;
  virality_score: number;
  target_audience: string[];
  recommended_tags: string[];
  optimization_suggestions: string[];
}

// =========================
// Admin & Moderation Types
// =========================

export interface AdminUser extends BaseUser {
  role: AdminRole;
  permissions: Permission[];
  assigned_areas: string[];
  last_moderation_action?: string;
  moderation_stats: ModerationStats;
}

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

export interface ModerationStats {
  total_actions: number;
  actions_this_week: number;
  accuracy_rate: number;
  response_time_avg: number;
}

export interface ContentReport extends BaseEntity {
  reporter_id: string;
  content_type: 'post' | 'comment' | 'review' | 'business';
  content_id: string;
  reason: ReportReason;
  description: string;
  evidence?: string[];
  status: ReportStatus;
  assigned_moderator_id?: string;
  resolution?: string;
  resolved_at?: string;
  action_taken?: ModerationAction;
}

export type ReportReason = 
  | 'spam' 
  | 'inappropriate' 
  | 'harassment' 
  | 'fake_information' 
  | 'copyright_violation' 
  | 'other';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';
export type ModerationAction = 'warning' | 'content_removal' | 'user_suspension' | 'user_ban' | 'no_action';

export interface SystemSetting {
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description: string;
  category: string;
  is_public: boolean;
  updated_by: string;
}

// =========================
// API Response Types
// =========================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  request_id?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status_code: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// =========================
// Utility Types
// =========================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type ValueOf<T> = T[keyof T];

export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> = Awaited<ReturnType<T>>;

// =========================
// Form & Validation Types
// =========================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'time' | 'file';
  required: boolean;
  placeholder?: string;
  options?: FormOption[];
  validation?: ValidationRule[];
  defaultValue?: unknown;
}

export interface FormOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
  validator?: (value: unknown) => boolean | string;
}

export interface FormState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// =========================
// Event & Handler Types
// =========================

export interface EventHandler<T = Event> {
  (event: T): void;
}

export interface ChangeEventHandler<T = HTMLInputElement> {
  (event: React.ChangeEvent<T>): void;
}

export interface ClickEventHandler<T = HTMLElement> {
  (event: React.MouseEvent<T>): void;
}

export interface SubmitEventHandler<T = HTMLFormElement> {
  (event: React.FormEvent<T>): void;
}

// =========================
// Component Props Types
// =========================

export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface LoadingProps extends BaseComponentProps {
  isLoading: boolean;
  loadingText?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface ErrorProps extends BaseComponentProps {
  error: Error | string | null;
  onRetry?: () => void;
  showRetry?: boolean;
}

export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

// =========================
// Configuration Types
// =========================

export interface AppConfig {
  api: ApiConfig;
  features: FeatureFlags;
  limits: AppLimits;
  integrations: IntegrationConfig;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface FeatureFlags {
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableChat: boolean;
  enableGroups: boolean;
  enablePolls: boolean;
  enableEvents: boolean;
  enableBookings: boolean;
  enablePayments: boolean;
}

export interface AppLimits {
  maxPostLength: number;
  maxCommentLength: number;
  maxFileSize: number;
  maxImagesPerPost: number;
  maxTagsPerPost: number;
  maxGroupMembers: number;
  maxEventAttendees: number;
}

export interface IntegrationConfig {
  googleMaps: GoogleMapsConfig;
  stripe: StripeConfig;
  supabase: SupabaseConfig;
  email: EmailConfig;
}

export interface GoogleMapsConfig {
  apiKey: string;
  libraries: string[];
}

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'ses' | 'smtp';
  apiKey?: string;
  domain?: string;
  fromEmail: string;
  fromName: string;
}
