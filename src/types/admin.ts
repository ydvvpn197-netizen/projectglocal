// Admin Dashboard Type Definitions

export interface AdminRole {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  permissions: AdminPermissions;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminPermissions {
  users?: string[];
  content?: string[];
  analytics?: string[];
  settings?: string[];
  admin_users?: string[];
  roles?: string[];
  [key: string]: string[] | undefined;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role_id?: string;
  is_active: boolean;
  last_login_at?: string;
  login_count: number;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  ip_whitelist: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  role?: AdminRole;
  profile?: {
    username: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface AdminAction {
  id: string;
  admin_user_id?: string;
  action_type: string;
  resource_type: string;
  resource_id?: string;
  action_data?: any;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  created_at: string;
  // Joined data
  admin_user?: AdminUser;
}

export interface ContentReport {
  id: string;
  reporter_id?: string;
  content_type: 'post' | 'event' | 'review' | 'comment' | 'artist';
  content_id: string;
  report_reason: string;
  report_details?: string;
  report_status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  reporter?: {
    username: string;
    full_name: string;
    email: string;
  };
  reviewer?: AdminUser;
  content?: any; // The actual content being reported
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Admin Dashboard State Types
export interface AdminDashboardState {
  currentUser: AdminUser | null;
  permissions: AdminPermissions | null;
  isLoading: boolean;
  error: string | null;
}

// User Management Types
export interface UserManagementFilters {
  search?: string;
  status?: 'active' | 'suspended' | 'banned';
  role?: string;
  date_from?: string;
  date_to?: string;
  location?: string;
}

export interface UserAction {
  type: 'suspend' | 'ban' | 'activate' | 'delete' | 'change_role';
  user_id: string;
  reason?: string;
  duration?: number; // For suspensions
  new_role?: string;
}

// Content Moderation Types
export interface ModerationFilters {
  content_type?: string;
  status?: string;
  severity?: 'low' | 'medium' | 'high';
  date_from?: string;
  date_to?: string;
  reviewed_by?: string;
}

export interface ModerationAction {
  type: 'approve' | 'reject' | 'delete' | 'feature' | 'unfeature';
  content_id: string;
  content_type: string;
  reason?: string;
  notify_user?: boolean;
}

// Analytics Types
export interface AnalyticsFilters {
  date_range: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month';
  content_type?: string;
}

export interface UserAnalytics {
  date: string;
  new_users: number;
  active_users: number;
  total_users: number;
  user_engagement_rate: number;
}

export interface ContentAnalytics {
  date: string;
  content_type: string;
  new_content: number;
  total_content: number;
  engagement_rate: number;
}

export interface PlatformMetrics {
  total_users: number;
  active_users_today: number;
  total_content: number;
  content_created_today: number;
  total_reports: number;
  pending_reports: number;
  system_health: 'excellent' | 'good' | 'warning' | 'critical';
}

// System Management Types
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  response_time: number;
  error_rate: number;
  active_connections: number;
  memory_usage: number;
  cpu_usage: number;
  disk_usage: number;
}

export interface PerformanceMetrics {
  page_load_time: number;
  api_response_time: number;
  database_query_time: number;
  cache_hit_rate: number;
  error_count: number;
  request_count: number;
}

// Admin API Response Types
export interface AdminApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Admin Dashboard Component Props
export interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export interface AdminTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
  }>;
  onRowClick?: (item: T) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export interface AdminFilterProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onReset?: () => void;
}

// Admin Dashboard Hook Types
export interface UseAdminAuthReturn {
  adminUser: AdminUser | null;
  permissions: AdminPermissions | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export interface UseUserManagementReturn {
  users: Array<any>;
  loading: boolean;
  error: string | null;
  filters: UserManagementFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  fetchUsers: (filters?: UserManagementFilters) => Promise<void>;
  updateFilters: (filters: Partial<UserManagementFilters>) => void;
  performAction: (action: UserAction) => Promise<void>;
  exportUsers: (format: 'csv' | 'json') => Promise<void>;
}

export interface UseContentModerationReturn {
  reports: ContentReport[];
  loading: boolean;
  error: string | null;
  filters: ModerationFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  fetchReports: (filters?: ModerationFilters) => Promise<void>;
  updateFilters: (filters: Partial<ModerationFilters>) => void;
  moderateContent: (action: ModerationAction) => Promise<void>;
  bulkModerate: (actions: ModerationAction[]) => Promise<void>;
}

export interface UseAdminAnalyticsReturn {
  userAnalytics: UserAnalytics[];
  contentAnalytics: ContentAnalytics[];
  platformMetrics: PlatformMetrics;
  loading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
  fetchAnalytics: (filters?: AnalyticsFilters) => Promise<void>;
  updateFilters: (filters: Partial<AnalyticsFilters>) => void;
  exportAnalytics: (format: 'csv' | 'json', type: 'users' | 'content') => Promise<void>;
}

export interface UseSystemManagementReturn {
  systemHealth: SystemHealth;
  performanceMetrics: PerformanceMetrics;
  settings: SystemSetting[];
  loading: boolean;
  error: string | null;
  fetchSystemHealth: () => Promise<void>;
  fetchPerformanceMetrics: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSetting: (key: string, value: any) => Promise<void>;
  backupDatabase: () => Promise<void>;
  clearCache: () => Promise<void>;
}

// Admin Dashboard Event Types
export interface AdminEvent {
  type: 'user_action' | 'content_moderation' | 'system_alert' | 'security_alert';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  data?: any;
}

// Admin Dashboard Notification Types
export interface AdminNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

// Admin Dashboard Export Types
export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filters?: Record<string, any>;
  columns?: string[];
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  download_url?: string;
  error?: string;
}

// Admin Dashboard Security Types
export interface SecurityAudit {
  id: string;
  admin_user_id: string;
  action: string;
  resource: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  timestamp: string;
  details?: any;
}

export interface SecuritySettings {
  two_factor_required: boolean;
  session_timeout: number;
  max_login_attempts: number;
  ip_whitelist_enabled: boolean;
  allowed_ips: string[];
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special: boolean;
  };
}
