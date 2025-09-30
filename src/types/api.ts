// API types for TheGlocal project
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  context?: string;
}

// User API types
export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar_url?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
  privacy_level: 'public' | 'private' | 'anonymous';
  anonymous_handle?: string;
  anonymous_display_name?: string;
  real_name_visibility: boolean;
  location_sharing: boolean;
  precise_location: boolean;
}

export interface CreateUserProfileRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar_url?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  privacy_level?: 'public' | 'private' | 'anonymous';
  is_anonymous?: boolean;
  anonymous_handle?: string;
  anonymous_display_name?: string;
  real_name_visibility?: boolean;
  location_sharing?: boolean;
  precise_location?: boolean;
}

export interface UpdateUserProfileRequest extends Partial<CreateUserProfileRequest> {
  id: string;
}

// Community API types
export interface Community {
  id: string;
  name: string;
  description?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  member_count: number;
  category?: string;
  tags?: string[];
}

export interface CreateCommunityRequest {
  name: string;
  description?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  is_public?: boolean;
  category?: string;
  tags?: string[];
}

export interface UpdateCommunityRequest extends Partial<CreateCommunityRequest> {
  id: string;
}

// Post API types
export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name?: string;
  author_avatar?: string;
  community_id?: string;
  community_name?: string;
  category?: string;
  tags?: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
  anonymous_handle?: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  is_liked?: boolean;
  is_shared?: boolean;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  community_id?: string;
  category?: string;
  tags?: string[];
  image_url?: string;
  is_anonymous?: boolean;
  anonymous_handle?: string;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string;
}

// Comment API types
export interface Comment {
  id: string;
  content: string;
  author_id: string;
  author_name?: string;
  author_avatar?: string;
  post_id: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
  anonymous_handle?: string;
  likes_count?: number;
  is_liked?: boolean;
}

export interface CreateCommentRequest {
  content: string;
  post_id: string;
  parent_comment_id?: string;
  is_anonymous?: boolean;
  anonymous_handle?: string;
}

export interface UpdateCommentRequest extends Partial<CreateCommentRequest> {
  id: string;
}

// Event API types
export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location_name: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  max_attendees?: number;
  price?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  category?: string;
  tags?: string[];
  featured: boolean;
  attendees_count?: number;
  is_attending?: boolean;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location_name: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  max_attendees?: number;
  price?: number;
  category?: string;
  tags?: string[];
  featured?: boolean;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
}

// Virtual Protest API types
export interface VirtualProtest {
  id: string;
  title: string;
  description: string;
  protest_date: string;
  protest_time: string;
  location_name: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  max_attendees?: number;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  category?: string;
  tags?: string[];
  featured: boolean;
  attendees_count?: number;
  is_attending?: boolean;
}

export interface CreateVirtualProtestRequest {
  title: string;
  description: string;
  protest_date: string;
  protest_time: string;
  location_name: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  max_attendees?: number;
  category?: string;
  tags?: string[];
  featured?: boolean;
}

export interface UpdateVirtualProtestRequest extends Partial<CreateVirtualProtestRequest> {
  id: string;
}

// News Article API types
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  author: string;
  source_url?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  category?: string;
  tags?: string[];
  featured: boolean;
  published: boolean;
  likes_count?: number;
  shares_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_shared?: boolean;
}

export interface CreateNewsArticleRequest {
  title: string;
  content: string;
  summary?: string;
  author: string;
  source_url?: string;
  image_url?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
}

export interface UpdateNewsArticleRequest extends Partial<CreateNewsArticleRequest> {
  id: string;
}

// Interest API types
export interface Interest {
  id: string;
  name: string;
  description?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInterestRequest {
  name: string;
  description?: string;
  category?: string;
}

export interface UpdateInterestRequest extends Partial<CreateInterestRequest> {
  id: string;
}

// Privacy Settings API types
export interface PrivacySettings {
  id: string;
  user_id: string;
  profile_visibility: 'public' | 'private' | 'anonymous';
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  anonymous_mode: boolean;
  anonymous_posts: boolean;
  anonymous_comments: boolean;
  anonymous_votes: boolean;
  location_sharing: boolean;
  precise_location: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdatePrivacySettingsRequest {
  profile_visibility?: 'public' | 'private' | 'anonymous';
  show_email?: boolean;
  show_phone?: boolean;
  show_location?: boolean;
  anonymous_mode?: boolean;
  anonymous_posts?: boolean;
  anonymous_comments?: boolean;
  anonymous_votes?: boolean;
  location_sharing?: boolean;
  precise_location?: boolean;
}

// Search API types
export interface SearchRequest {
  query: string;
  type?: 'all' | 'posts' | 'events' | 'communities' | 'users';
  category?: string;
  location?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult<T = unknown> {
  id: string;
  type: string;
  title: string;
  description?: string;
  url: string;
  score: number;
  data: T;
}

export interface SearchResponse<T = unknown> extends PaginatedResponse<SearchResult<T>> {
  query: string;
  filters: {
    type?: string;
    category?: string;
    location?: string;
    date_from?: string;
    date_to?: string;
  };
}

// Analytics API types
export interface AnalyticsData {
  total_users: number;
  total_posts: number;
  total_events: number;
  total_communities: number;
  active_users: number;
  engagement_rate: number;
  growth_rate: number;
}

export interface UserAnalytics {
  total_posts: number;
  total_comments: number;
  total_events_created: number;
  total_events_attended: number;
  total_communities_joined: number;
  engagement_score: number;
  last_active: string;
}

// Notification API types
export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'follow' | 'event' | 'post' | 'system';
  title: string;
  message: string;
  data?: unknown;
  read: boolean;
  created_at: string;
}

export interface CreateNotificationRequest {
  user_id: string;
  type: 'like' | 'comment' | 'follow' | 'event' | 'post' | 'system';
  title: string;
  message: string;
  data?: unknown;
}

// Report API types
export interface Report {
  id: string;
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'fake_news' | 'other';
  description: string;
  reported_item_type: 'post' | 'comment' | 'event' | 'user' | 'community';
  reported_item_id: string;
  reporter_id: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
}

export interface CreateReportRequest {
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'fake_news' | 'other';
  description: string;
  reported_item_type: 'post' | 'comment' | 'event' | 'user' | 'community';
  reported_item_id: string;
}
