/**
 * Type definitions for points system and related functionality
 */

export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  current_level: number;
  points_to_next_level: number;
  total_transactions: number;
  created_at: string;
  updated_at: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  points: number;
  type: PointTransactionType;
  reference_id?: string;
  reference_type?: string;
  description: string;
  balance_after: number;
  created_at: string;
}

export type PointTransactionType = 
  | 'event_attendance'
  | 'event_organization'
  | 'poll_creation'
  | 'post_sharing'
  | 'comment_creation'
  | 'profile_completion'
  | 'referral'
  | 'daily_login'
  | 'weekly_challenge'
  | 'manual_adjustment'
  | 'refund'
  | 'penalty';

export interface PointHistoryFilters {
  type?: PointTransactionType;
  start_date?: string;
  end_date?: string;
  min_points?: number;
  max_points?: number;
  reference_type?: string;
  limit?: number;
  offset?: number;
}

export interface CommunityLeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  total_points: number;
  current_level: number;
  rank: number;
  points_this_month: number;
  points_this_week: number;
}

export interface PointsLevel {
  level: number;
  min_points: number;
  max_points: number;
  title: string;
  description: string;
  badge_url?: string;
  benefits: string[];
}

export interface PointsReward {
  id: string;
  title: string;
  description: string;
  points_cost: number;
  category: string;
  is_available: boolean;
  max_redemptions?: number;
  current_redemptions: number;
  expires_at?: string;
  image_url?: string;
}

export interface PointsChallenge {
  id: string;
  title: string;
  description: string;
  points_reward: number;
  type: ChallengeType;
  requirements: ChallengeRequirement[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  participants_count: number;
  max_participants?: number;
}

export type ChallengeType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'special'
  | 'seasonal';

export interface ChallengeRequirement {
  type: 'post_count' | 'comment_count' | 'event_attendance' | 'poll_participation' | 'referral_count';
  target: number;
  current: number;
  description: string;
}

export interface UserChallengeProgress {
  challenge_id: string;
  user_id: string;
  is_completed: boolean;
  completed_at?: string;
  progress: ChallengeRequirement[];
  points_earned: number;
}

export interface PointsSettings {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
  category: string;
  is_public: boolean;
  updated_at: string;
}

export interface PointsAnalytics {
  total_users: number;
  active_users: number;
  total_points_distributed: number;
  total_points_redeemed: number;
  average_points_per_user: number;
  top_earning_activities: Array<{
    activity: string;
    total_points: number;
    user_count: number;
  }>;
  daily_points_distribution: Array<{
    date: string;
    points: number;
    user_count: number;
  }>;
}

export interface PointsNotification {
  id: string;
  user_id: string;
  type: 'points_earned' | 'level_up' | 'challenge_completed' | 'reward_available';
  title: string;
  message: string;
  points_amount?: number;
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  created_at: string;
}

export interface PointsReferral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referrer_points: number;
  referred_points: number;
  status: 'pending' | 'completed' | 'expired';
  completed_at?: string;
  created_at: string;
}

export interface PointsLeaderboardConfig {
  update_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  display_limit: number;
  include_avatars: boolean;
  show_levels: boolean;
  show_trends: boolean;
  cache_duration: number;
}

export interface PointsGamificationConfig {
  enable_levels: boolean;
  enable_badges: boolean;
  enable_challenges: boolean;
  enable_rewards: boolean;
  enable_referrals: boolean;
  points_multiplier: number;
  max_daily_points: number;
  max_weekly_points: number;
  level_up_thresholds: number[];
}

export interface PointsIntegrationConfig {
  enable_social_sharing: boolean;
  enable_achievement_notifications: boolean;
  enable_progress_tracking: boolean;
  enable_leaderboard_sharing: boolean;
  social_platforms: string[];
  notification_channels: string[];
}

export interface PointsAuditLog {
  id: string;
  user_id: string;
  action: string;
  points_change: number;
  previous_balance: number;
  new_balance: number;
  reason: string;
  admin_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PointsExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  date_range?: {
    start: string;
    end: string;
  };
  user_ids?: string[];
  transaction_types?: PointTransactionType[];
  include_metadata: boolean;
  group_by?: 'user' | 'date' | 'type' | 'none';
}

export interface PointsImportResult {
  total_records: number;
  successful_imports: number;
  failed_imports: number;
  errors: Array<{
    row: number;
    field: string;
    value: string;
    error: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    value: string;
    warning: string;
  }>;
}

export interface PointsBackup {
  id: string;
  filename: string;
  file_size: number;
  backup_type: 'full' | 'incremental';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  error_message?: string;
  download_url?: string;
}

export interface PointsRestoreOptions {
  backup_id: string;
  restore_type: 'full' | 'partial';
  target_date?: string;
  user_ids?: string[];
  transaction_types?: PointTransactionType[];
  validate_only: boolean;
  create_backup: boolean;
}

export interface PointsPerformanceMetrics {
  response_time_avg: number;
  response_time_p95: number;
  response_time_p99: number;
  throughput: number;
  error_rate: number;
  cache_hit_rate: number;
  database_query_time: number;
  memory_usage: number;
  cpu_usage: number;
}

export interface PointsHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning';
    response_time: number;
    error_message?: string;
    last_check: string;
  }>;
  overall_score: number;
  recommendations: string[];
  last_updated: string;
}
