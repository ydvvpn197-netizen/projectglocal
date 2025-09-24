// Extended types to replace 'any' usage throughout the application

// Content and Recommendation Types
export interface ContentItem {
  id: string;
  type: 'post' | 'event' | 'group' | 'poll' | 'article';
  title?: string;
  content?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  media_urls?: string[];
  location?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface RecommendationScore {
  collaborative: number;
  contentBased: number;
  location: number;
  freshness: number;
  diversity: number;
  total: number;
}

export interface FollowRecommendationScore {
  mutualConnections: number;
  activity: number;
  location: number;
  interests: number;
  total: number;
}

export interface DiscoveryFilters {
  categories?: string[];
  locations?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  interests?: string[];
  radius?: number;
}

// API and Service Types
export interface SupabaseClient {
  from: (table: string) => SupabaseQueryBuilder;
  auth: {
    getUser: () => Promise<{ data: { user: unknown } | null; error: unknown }>;
    signOut: () => Promise<{ error: unknown }>;
  };
  storage: {
    from: (bucket: string) => SupabaseStorageClient;
  };
}

export interface SupabaseQueryBuilder {
  select: (columns?: string) => SupabaseQueryBuilder;
  insert: (data: unknown) => SupabaseQueryBuilder;
  update: (data: unknown) => SupabaseQueryBuilder;
  delete: () => SupabaseQueryBuilder;
  eq: (column: string, value: unknown) => SupabaseQueryBuilder;
  neq: (column: string, value: unknown) => SupabaseQueryBuilder;
  gt: (column: string, value: unknown) => SupabaseQueryBuilder;
  lt: (column: string, value: unknown) => SupabaseQueryBuilder;
  gte: (column: string, value: unknown) => SupabaseQueryBuilder;
  lte: (column: string, value: unknown) => SupabaseQueryBuilder;
  like: (column: string, value: string) => SupabaseQueryBuilder;
  ilike: (column: string, value: string) => SupabaseQueryBuilder;
  in: (column: string, values: unknown[]) => SupabaseQueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => SupabaseQueryBuilder;
  limit: (count: number) => SupabaseQueryBuilder;
  range: (from: number, to: number) => SupabaseQueryBuilder;
  single: () => Promise<{ data: unknown; error: unknown }>;
  maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
  execute: () => Promise<{ data: unknown; error: unknown }>;
}

export interface SupabaseStorageClient {
  upload: (path: string, file: File) => Promise<{ data: unknown; error: unknown }>;
  download: (path: string) => Promise<{ data: Blob; error: unknown }>;
  remove: (paths: string[]) => Promise<{ data: unknown; error: unknown }>;
  getPublicUrl: (path: string) => { data: { publicUrl: string } };
}

// Error Types
export interface ApiErrorResponse {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Payment and Billing Types
export interface BillingDetails {
  name: string;
  email: string;
  phone?: string;
  address: AddressDetails;
}

export interface AddressDetails {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface PaymentMetadata {
  order_id?: string;
  customer_id?: string;
  description?: string;
  [key: string]: unknown;
}

export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  metadata?: PaymentMetadata;
  billing_details?: BillingDetails;
}

export interface SanitizedPaymentData {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
  billing_details?: BillingDetails;
}

// Location and Maps Types
export interface GoogleMapsPlace {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  types: string[];
  vicinity?: string;
}

export interface LocationCacheData {
  places: GoogleMapsPlace[];
  timestamp: number;
  ttl: number;
}

// News and Content Types
export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    id?: string;
    name: string;
  };
  author?: string;
  category?: string;
  location?: string;
  relevance_score?: number;
}

export interface ArticleCategory {
  category: string;
  confidence: number;
  keywords: string[];
}

// User and Community Types
export interface UserWithConnections {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  followers: UserConnection[];
  following: UserConnection[];
  created_at: string;
  updated_at: string;
}

export interface UserConnection {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  followed_at: string;
}

export interface CommunityContent {
  id: string;
  type: 'post' | 'poll' | 'event' | 'group';
  title?: string;
  content?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  category?: string;
  tags?: string[];
  location?: string;
  media_urls?: string[];
}

// Function Types
export interface GenericFunction<TArgs extends unknown[] = unknown[], TReturn = unknown> {
  (...args: TArgs): TReturn;
}

export interface DebouncedFunction<TArgs extends unknown[] = unknown[], TReturn = unknown> {
  (...args: TArgs): TReturn;
  cancel: () => void;
  flush: () => void;
}

export interface ThrottledFunction<TArgs extends unknown[] = unknown[], TReturn = unknown> {
  (...args: TArgs): TReturn;
  cancel: () => void;
  flush: () => void;
}

// Event and Hook Types
export interface EventData {
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location: string;
  category?: string;
  max_attendees?: number;
  price?: number;
  tags?: string[];
  media_urls?: string[];
}

export interface CommunityData {
  name: string;
  description: string;
  category?: string;
  is_private: boolean;
  tags?: string[];
  media_urls?: string[];
}

export interface UserUpdateData {
  display_name?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  avatar_url?: string;
  preferences?: Record<string, unknown>;
}

// Settings and Configuration Types
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  privacy: {
    profile_visibility: 'public' | 'friends' | 'private';
    location_sharing: boolean;
    activity_visibility: 'public' | 'friends' | 'private';
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    currency: string;
  };
  [key: string]: unknown;
}

// Generic Content Types
export interface GenericContent {
  id: string;
  type: string;
  title?: string;
  content?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// Transform Options
export interface TransformOptions {
  user: Record<string, string>;
  community: Record<string, string>;
  post: Record<string, string>;
  event: Record<string, string>;
  profile: Record<string, string>;
}

// API Response Types
export interface GenericApiResponse<T = unknown> {
  data: T | null;
  error: ApiErrorResponse | null;
}

// Cache and Storage Types
export interface CacheOptions {
  ttl: number;
  maxSize: number;
  persistent: boolean;
}

export interface StorageItem<T = unknown> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
}
