// Export all types from a single file
export * from './database';
export * from './api';
export * from './ui';

// Re-export common types for convenience
export type { Database } from './database';
export type { ApiResponse, PaginatedResponse, ApiError } from './api';
export type { BaseComponentProps, ButtonProps, InputProps } from './ui';

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Form types
export type FormData<T> = {
  [K in keyof T]: T[K];
};

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

export type FormState<T> = {
  data: FormData<T>;
  errors: FormErrors<T>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
};

// API request/response types
export type RequestConfig = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
};

export type ResponseConfig<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
};

// Pagination types
export type PaginationParams = {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// Filter types
export type FilterOption = {
  label: string;
  value: string;
  count?: number;
  disabled?: boolean;
};

export type FilterConfig = {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'text';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
};

// Sort types
export type SortOption = {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
};

export type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
  label: string;
};

// Search types
export type SearchFilters = {
  query?: string;
  type?: string;
  category?: string;
  location?: string;
  date_from?: string;
  date_to?: string;
  tags?: string[];
  user?: string;
  community?: string;
};

export type SearchSort = {
  field: string;
  direction: 'asc' | 'desc';
};

export type SearchConfig = {
  query: string;
  filters: SearchFilters;
  sort: SearchSort;
  pagination: PaginationParams;
};

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationConfig = {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
};

// Theme types
export type ColorScheme = 'light' | 'dark' | 'auto';

export type ThemeConfig = {
  scheme: ColorScheme;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  input: string;
  ring: string;
};

// Layout types
export type LayoutMode = 'sidebar' | 'topbar' | 'minimal';

export type LayoutConfig = {
  mode: LayoutMode;
  sidebar: {
    collapsed: boolean;
    width: number;
    minWidth: number;
    maxWidth: number;
  };
  header: {
    height: number;
    sticky: boolean;
  };
  footer: {
    height: number;
    sticky: boolean;
  };
  content: {
    padding: number;
    maxWidth: number;
  };
};

// User preferences types
export type UserPreferences = {
  theme: ThemeConfig;
  layout: LayoutConfig;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'anonymous';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    anonymousMode: boolean;
  };
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
};

// Error types
export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONFLICT_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export type ErrorDetails = {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: string;
  context?: string;
  stack?: string;
};

// Loading types
export type LoadingState = {
  isLoading: boolean;
  progress: number;
  message?: string;
  error?: string;
};

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
};

// Cache types
export type CacheConfig = {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'fifo';
};

export type CacheEntry<T> = {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
};

// Analytics types
export type AnalyticsEvent = {
  name: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
};

export type AnalyticsConfig = {
  enabled: boolean;
  trackingId: string;
  debug: boolean;
  anonymize: boolean;
};

// Performance types
export type PerformanceMetric = {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  context?: Record<string, any>;
};

export type PerformanceConfig = {
  enabled: boolean;
  sampleRate: number;
  maxMetrics: number;
  reportInterval: number;
};

// Security types
export type SecurityConfig = {
  csp: string;
  hsts: boolean;
  xssProtection: boolean;
  frameOptions: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  referrerPolicy: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
};

// Feature flag types
export type FeatureFlag = {
  name: string;
  enabled: boolean;
  description?: string;
  rollout?: number;
  conditions?: Record<string, any>;
};

export type FeatureFlags = Record<string, FeatureFlag>;

// A/B testing types
export type ABTest = {
  name: string;
  variants: Array<{
    name: string;
    weight: number;
    config: Record<string, any>;
  }>;
  startDate: string;
  endDate?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
};

export type ABTestAssignment = {
  testName: string;
  variant: string;
  userId: string;
  assignedAt: string;
};

// Internationalization types
export type Locale = {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: string;
};

export type Translation = {
  key: string;
  value: string;
  locale: string;
  namespace: string;
  context?: string;
};

export type TranslationConfig = {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackLocale: string;
  namespaces: string[];
  loadPath: string;
  saveMissing: boolean;
};
