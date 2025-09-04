/**
 * Type definitions for admin and moderation functionality
 */

// =========================
// Admin User Types
// =========================

export interface AdminUser extends BaseEntity {
  id: string;
  user_id: string;
  role: AdminRole;
  permissions: Permission[];
  assigned_areas: string[];
  last_moderation_action?: string;
  moderation_stats: ModerationStats;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ModerationStats {
  total_actions: number;
  actions_this_week: number;
  accuracy_rate: number;
  response_time_avg: number;
  last_updated: string;
}

// =========================
// Content Moderation Types
// =========================

export interface ContentReport extends BaseEntity {
  id: string;
  reporter_id: string;
  content_type: 'post' | 'comment' | 'review' | 'business' | 'event' | 'group';
  content_id: string;
  reason: ReportReason;
  description: string;
  evidence?: string[];
  status: ReportStatus;
  assigned_moderator_id?: string;
  resolution?: string;
  resolved_at?: string;
  action_taken?: ModerationAction;
  priority: ReportPriority;
  severity: ReportSeverity;
  is_urgent: boolean;
  tags: string[];
  metadata: Record<string, unknown>;
}

export type ReportReason = 
  | 'spam'
  | 'inappropriate'
  | 'harassment'
  | 'fake_information'
  | 'copyright_violation'
  | 'hate_speech'
  | 'violence'
  | 'sexual_content'
  | 'drugs'
  | 'terrorism'
  | 'other';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'escalated';

export type ModerationAction = 
  | 'warning'
  | 'content_removal'
  | 'user_suspension'
  | 'user_ban'
  | 'content_hide'
  | 'content_edit'
  | 'no_action'
  | 'escalate_to_admin';

export type ReportPriority = 'low' | 'normal' | 'high' | 'urgent';

export type ReportSeverity = 'minor' | 'moderate' | 'major' | 'critical';

export interface ModerationQueue {
  id: string;
  name: string;
  description?: string;
  content_type: string;
  filters: ModerationFilter[];
  assigned_moderators: string[];
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModerationFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | boolean | string[];
  logical_operator?: 'and' | 'or';
}

export interface ModerationTask {
  id: string;
  queue_id: string;
  content_id: string;
  content_type: string;
  assigned_moderator_id?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'escalated';
  priority: number;
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  action_taken?: ModerationAction;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// =========================
// User Management Types
// =========================

export interface UserManagement {
  id: string;
  user_id: string;
  status: UserStatus;
  moderation_history: ModerationHistory[];
  flags: UserFlag[];
  restrictions: UserRestriction[];
  notes: AdminNote[];
  last_reviewed?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending_review' | 'restricted';

export interface ModerationHistory {
  id: string;
  action: ModerationAction;
  reason: string;
  moderator_id: string;
  timestamp: string;
  duration?: string;
  notes?: string;
}

export interface UserFlag {
  id: string;
  type: FlagType;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export type FlagType = 
  | 'spam'
  | 'inappropriate_behavior'
  | 'harassment'
  | 'fake_account'
  | 'multiple_accounts'
  | 'suspicious_activity'
  | 'terms_violation'
  | 'other';

export interface UserRestriction {
  id: string;
  type: RestrictionType;
  reason: string;
  duration: string;
  is_active: boolean;
  created_at: string;
  expires_at: string;
  created_by: string;
}

export type RestrictionType = 
  | 'posting'
  | 'commenting'
  | 'messaging'
  | 'group_creation'
  | 'event_creation'
  | 'business_creation'
  | 'full_access';

export interface AdminNote {
  id: string;
  content: string;
  author_id: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

// =========================
// System Settings Types
// =========================

export interface SystemSetting {
  id: string;
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description: string;
  category: string;
  is_public: boolean;
  is_editable: boolean;
  validation_rules?: ValidationRule[];
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
  validator?: (value: unknown) => boolean | string;
}

export interface SystemConfig {
  id: string;
  name: string;
  description?: string;
  settings: SystemSetting[];
  is_active: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

// =========================
// Analytics & Reporting Types
// =========================

export interface AdminAnalytics {
  id: string;
  period: string;
  metrics: AdminMetrics;
  trends: AdminTrend[];
  breakdowns: AdminBreakdown[];
  alerts: AdminAlert[];
  created_at: string;
}

export interface AdminMetrics {
  total_users: number;
  active_users: number;
  new_users: number;
  suspended_users: number;
  banned_users: number;
  total_content: number;
  flagged_content: number;
  moderation_actions: number;
  system_health_score: number;
  response_time_avg: number;
}

export interface AdminTrend {
  metric: string;
  value: number;
  change_percentage: number;
  trend_direction: 'up' | 'down' | 'stable';
  period: string;
}

export interface AdminBreakdown {
  category: string;
  value: number;
  percentage: number;
  change_percentage: number;
  subcategories?: AdminBreakdown[];
}

export interface AdminAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  is_active: boolean;
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

export type AlertType = 
  | 'system_error'
  | 'performance_degradation'
  | 'security_threat'
  | 'abuse_spike'
  | 'capacity_warning'
  | 'maintenance_required';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

// =========================
// Audit & Logging Types
// =========================

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface SystemLog {
  id: string;
  level: LogLevel;
  message: string;
  context: Record<string, unknown>;
  timestamp: string;
  source: string;
  trace_id?: string;
  user_id?: string;
  session_id?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogFilter {
  level?: LogLevel;
  source?: string;
  start_date?: string;
  end_date?: string;
  user_id?: string;
  search_query?: string;
  limit?: number;
  offset?: number;
}

// =========================
// Content Management Types
// =========================

export interface ContentModeration {
  id: string;
  content_id: string;
  content_type: string;
  status: ModerationStatus;
  flags: ContentFlag[];
  actions: ContentAction[];
  review_history: ReviewHistory[];
  auto_moderation_score?: number;
  manual_review_required: boolean;
  created_at: string;
  updated_at: string;
}

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'under_review';

export interface ContentFlag {
  id: string;
  type: ContentFlagType;
  reason: string;
  confidence: number;
  source: 'auto' | 'user' | 'moderator';
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

export type ContentFlagType = 
  | 'spam'
  | 'inappropriate'
  | 'harassment'
  | 'fake_information'
  | 'copyright_violation'
  | 'hate_speech'
  | 'violence'
  | 'sexual_content'
  | 'drugs'
  | 'terrorism'
  | 'quality_issue'
  | 'duplicate_content';

export interface ContentAction {
  id: string;
  type: ContentActionType;
  reason: string;
  moderator_id: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export type ContentActionType = 
  | 'approve'
  | 'reject'
  | 'flag'
  | 'hide'
  | 'edit'
  | 'delete'
  | 'escalate';

export interface ReviewHistory {
  id: string;
  action: ContentActionType;
  moderator_id: string;
  timestamp: string;
  notes?: string;
  decision_reason?: string;
}

// =========================
// Dashboard & UI Types
// =========================

export interface AdminDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: WidgetPosition;
  size: WidgetSize;
  refresh_interval?: number;
  is_visible: boolean;
}

export type WidgetType = 
  | 'metrics_card'
  | 'chart'
  | 'table'
  | 'list'
  | 'gauge'
  | 'progress_bar'
  | 'alert_feed'
  | 'activity_timeline';

export interface WidgetConfig {
  data_source: string;
  query?: string;
  filters?: Record<string, unknown>;
  display_options?: Record<string, unknown>;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  cell_size: number;
  gap: number;
}

// =========================
// API & Integration Types
// =========================

export interface AdminAPI {
  id: string;
  name: string;
  description?: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  authentication: AuthType;
  rate_limit?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AuthType = 'api_key' | 'jwt' | 'oauth2' | 'none';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  headers: Record<string, string>;
  is_active: boolean;
  retry_count: number;
  timeout: number;
  created_at: string;
  updated_at: string;
}

export type WebhookEvent = 
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'content.created'
  | 'content.updated'
  | 'content.deleted'
  | 'report.created'
  | 'moderation.action_taken'
  | 'system.alert'
  | 'admin.action';

// =========================
// Utility Types
// =========================

export interface AdminFilter {
  user_id?: string;
  role?: AdminRole;
  status?: string;
  start_date?: string;
  end_date?: string;
  search_query?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface AdminStats {
  total_admins: number;
  active_admins: number;
  total_actions: number;
  actions_today: number;
  pending_reports: number;
  system_alerts: number;
  performance_score: number;
}

export interface AdminSummary {
  recent_actions: AdminAuditLog[];
  pending_items: number;
  alerts: AdminAlert[];
  stats: AdminStats;
  quick_actions: QuickAction[];
}

export interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  action: string;
  requires_confirmation: boolean;
  is_dangerous: boolean;
}

// =========================
// Base Entity Interface
// =========================

interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}
