/**
 * Type definitions for notifications and related functionality
 */

// =========================
// Base Notification Types
// =========================

export interface Notification extends BaseEntity {
  id: string;
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
  created_at: string;
  updated_at: string;
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
  | 'system_alert'
  | 'points_earned'
  | 'level_up'
  | 'challenge_completed'
  | 'reward_available'
  | 'group_invitation'
  | 'event_invitation'
  | 'content_moderation'
  | 'security_alert'
  | 'maintenance_notice';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationCategory = 
  | 'booking'
  | 'payment'
  | 'social'
  | 'system'
  | 'marketing'
  | 'points'
  | 'security'
  | 'maintenance';

// =========================
// Notification Templates
// =========================

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  category: NotificationCategory;
  title_template: string;
  message_template: string;
  variables: NotificationVariable[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'url';
  required: boolean;
  default_value?: string;
  validation_regex?: string;
}

export interface NotificationTemplateInstance {
  template_id: string;
  variables: Record<string, string>;
  user_id: string;
  priority?: NotificationPriority;
  expires_at?: string;
  action_url?: string;
  action_data?: Record<string, unknown>;
}

// =========================
// Notification Channels
// =========================

export interface NotificationChannel {
  id: string;
  name: string;
  type: ChannelType;
  is_enabled: boolean;
  config: ChannelConfig;
  created_at: string;
  updated_at: string;
}

export type ChannelType = 
  | 'email'
  | 'push'
  | 'sms'
  | 'in_app'
  | 'webhook'
  | 'slack'
  | 'discord'
  | 'telegram'
  | 'whatsapp';

export interface ChannelConfig {
  api_key?: string;
  api_secret?: string;
  webhook_url?: string;
  sender_email?: string;
  sender_name?: string;
  template_id?: string;
  rate_limit?: number;
  retry_attempts?: number;
  retry_delay?: number;
  timeout?: number;
  custom_headers?: Record<string, string>;
}

// =========================
// User Notification Preferences
// =========================

export interface UserNotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  webhook_enabled: boolean;
  slack_enabled: boolean;
  discord_enabled: boolean;
  telegram_enabled: boolean;
  whatsapp_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryPreferences {
  category: NotificationCategory;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  webhook_enabled: boolean;
  slack_enabled: boolean;
  discord_enabled: boolean;
  telegram_enabled: boolean;
  whatsapp_enabled: boolean;
}

export interface TypePreferences {
  type: NotificationType;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  webhook_enabled: boolean;
  slack_enabled: boolean;
  discord_enabled: boolean;
  telegram_enabled: boolean;
  whatsapp_enabled: boolean;
}

// =========================
// Notification Delivery
// =========================

export interface NotificationDelivery {
  id: string;
  notification_id: string;
  user_id: string;
  channel: ChannelType;
  status: DeliveryStatus;
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  delivery_attempts: DeliveryAttempt[];
  created_at: string;
  updated_at: string;
}

export type DeliveryStatus = 
  | 'pending'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'retrying'
  | 'cancelled';

export interface DeliveryAttempt {
  attempt_number: number;
  timestamp: string;
  status: DeliveryStatus;
  error_message?: string;
  response_code?: number;
  response_body?: string;
  duration_ms: number;
}

// =========================
// Notification Scheduling
// =========================

export interface NotificationSchedule {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  cron_expression: string;
  timezone: string;
  is_active: boolean;
  last_run?: string;
  next_run: string;
  max_runs?: number;
  current_runs: number;
  target_users: ScheduleTarget[];
  variables: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ScheduleTarget {
  type: 'all_users' | 'user_group' | 'specific_users' | 'filter';
  value: string | string[];
  filter_criteria?: Record<string, unknown>;
}

export interface ScheduledNotification {
  id: string;
  schedule_id: string;
  user_id: string;
  template_id: string;
  variables: Record<string, string>;
  scheduled_for: string;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

// =========================
// Notification Analytics
// =========================

export interface NotificationAnalytics {
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  unsubscribe_rate: number;
  spam_rate: number;
  channel_performance: ChannelPerformance[];
  category_performance: CategoryPerformance[];
  type_performance: TypePerformance[];
  time_performance: TimePerformance[];
  user_engagement: UserEngagement[];
}

export interface ChannelPerformance {
  channel: ChannelType;
  sent: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
  avg_delivery_time: number;
  cost_per_notification: number;
}

export interface CategoryPerformance {
  category: NotificationCategory;
  sent: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}

export interface TypePerformance {
  type: NotificationType;
  sent: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  unsubscribe_rate: number;
}

export interface TimePerformance {
  hour: number;
  sent: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}

export interface UserEngagement {
  user_id: string;
  total_received: number;
  total_opened: number;
  total_clicked: number;
  open_rate: number;
  click_rate: number;
  last_engagement?: string;
  preferred_channels: ChannelType[];
  preferred_categories: NotificationCategory[];
  preferred_types: NotificationType[];
}

// =========================
// Notification Rules & Triggers
// =========================

export interface NotificationRule {
  id: string;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  trigger_conditions: TriggerCondition[];
  notification_template_id: string;
  target_users: RuleTarget[];
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export type TriggerType = 
  | 'event_based'
  | 'time_based'
  | 'condition_based'
  | 'webhook_based'
  | 'manual';

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | boolean | string[];
  logical_operator?: 'and' | 'or';
}

export interface RuleTarget {
  type: 'all_users' | 'user_group' | 'specific_users' | 'filter';
  value: string | string[];
  filter_criteria?: Record<string, unknown>;
}

// =========================
// Notification Groups & Batches
// =========================

export interface NotificationGroup {
  id: string;
  name: string;
  description?: string;
  notifications: Notification[];
  total_count: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  status: 'pending' | 'sending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface NotificationBatch {
  id: string;
  group_id: string;
  batch_number: number;
  notifications: Notification[];
  status: 'pending' | 'sending' | 'sent' | 'failed';
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

// =========================
// Notification Settings & Configuration
// =========================

export interface NotificationSettings {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
  category: string;
  is_public: boolean;
  updated_at: string;
}

export interface NotificationConfig {
  default_priority: NotificationPriority;
  default_expiry_hours: number;
  max_retry_attempts: number;
  retry_delay_minutes: number;
  batch_size: number;
  rate_limit_per_minute: number;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  language: string;
  channels: ChannelType[];
  categories: NotificationCategory[];
  types: NotificationType[];
}

// =========================
// Notification Testing & Development
// =========================

export interface NotificationTest {
  id: string;
  template_id: string;
  test_user_id: string;
  variables: Record<string, string>;
  channels: ChannelType[];
  status: 'pending' | 'sent' | 'failed';
  results: TestResult[];
  created_at: string;
}

export interface TestResult {
  channel: ChannelType;
  status: 'success' | 'failed';
  message?: string;
  response_code?: number;
  response_body?: string;
  duration_ms: number;
  timestamp: string;
}

export interface NotificationPreview {
  template_id: string;
  variables: Record<string, string>;
  channels: ChannelType[];
  previews: ChannelPreview[];
}

export interface ChannelPreview {
  channel: ChannelType;
  title: string;
  message: string;
  formatted_content: string;
  estimated_delivery_time: string;
  cost_estimate: number;
}

// =========================
// Utility Types
// =========================

export interface NotificationFilter {
  user_id?: string;
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  is_read?: boolean;
  start_date?: string;
  end_date?: string;
  search_query?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'priority' | 'type' | 'category';
  sort_order?: 'asc' | 'desc';
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  by_category: Record<NotificationCategory, number>;
  by_type: Record<NotificationType, number>;
  by_priority: Record<NotificationPriority, number>;
}

export interface NotificationSummary {
  recent: Notification[];
  unread_count: number;
  important_count: number;
  upcoming_count: number;
  stats: NotificationStats;
}

export interface NotificationAction {
  id: string;
  notification_id: string;
  user_id: string;
  action_type: 'open' | 'click' | 'dismiss' | 'snooze' | 'mark_read' | 'unsubscribe';
  action_data?: Record<string, unknown>;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export interface NotificationFeedback {
  id: string;
  notification_id: string;
  user_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback_text?: string;
  helpful: boolean;
  category: 'general' | 'content' | 'timing' | 'frequency' | 'other';
  created_at: string;
}

// =========================
// Base Entity Interface
// =========================

interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}
