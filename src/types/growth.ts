// Growth Types
export interface GrowthMetric {
  id: string;
  metric_date: string;
  metric_type: 'user_acquisition' | 'user_retention' | 'user_engagement' | 'revenue' | 'referral' | 'viral_coefficient';
  metric_value: number;
  metric_unit?: string;
  segment?: string;
  source?: string;
  campaign_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ViralContent {
  id: string;
  content_type: 'post' | 'event' | 'news' | 'profile' | 'group';
  content_id: string;
  viral_score: number;
  share_count: number;
  view_count: number;
  engagement_count: number;
  viral_coefficient: number;
  reach_multiplier: number;
  trending_rank?: number;
  trending_duration: number;
  viral_velocity: number;
  peak_time?: string;
  decay_rate: number;
  viral_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserAcquisition {
  id: string;
  user_id: string;
  acquisition_source: string;
  acquisition_channel: string;
  acquisition_campaign?: string;
  acquisition_cost?: number;
  acquisition_date: string;
  first_touch_attribution: Record<string, any>;
  last_touch_attribution: Record<string, any>;
  multi_touch_attribution: Record<string, any>;
  created_at: string;
}

export interface UserRetention {
  id: string;
  user_id: string;
  cohort_date: string;
  retention_day: number;
  is_retained: boolean;
  retention_activity?: string;
  retention_value?: number;
  created_at: string;
}

export interface UserEngagement {
  id: string;
  user_id: string;
  engagement_date: string;
  engagement_type: string;
  engagement_value: number;
  session_duration?: number;
  page_views?: number;
  actions_performed?: number;
  created_at: string;
}

export interface GrowthHacking {
  id: string;
  name: string;
  description?: string;
  strategy_type: 'acquisition' | 'retention' | 'engagement' | 'monetization' | 'viral';
  target_metric: string;
  current_value: number;
  target_value: number;
  tactics: Array<{
    id: string;
    name: string;
    description?: string;
    status: 'planned' | 'active' | 'completed' | 'failed';
    impact_score: number;
    effort_score: number;
    priority: 'low' | 'medium' | 'high';
    start_date?: string;
    end_date?: string;
    results?: Record<string, any>;
  }>;
  status: 'planning' | 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface ViralLoop {
  id: string;
  name: string;
  description?: string;
  loop_type: 'referral' | 'social_sharing' | 'content_viral' | 'product_hunt';
  trigger_event: string;
  reward_mechanism: string;
  viral_coefficient: number;
  cycle_time: number; // in hours
  conversion_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GrowthExperiment {
  id: string;
  name: string;
  description?: string;
  hypothesis: string;
  experiment_type: 'a_b_test' | 'multivariate' | 'sequential';
  variants: Array<{
    id: string;
    name: string;
    config: Record<string, any>;
    traffic_percentage: number;
  }>;
  metrics: Array<{
    name: string;
    description?: string;
    goal: 'maximize' | 'minimize';
    current_value: number;
  }>;
  status: 'draft' | 'running' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  sample_size: number;
  confidence_level: number;
  winner_variant_id?: string;
  results?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserOnboarding {
  id: string;
  user_id: string;
  onboarding_step: string;
  step_order: number;
  is_completed: boolean;
  completion_time?: number; // in seconds
  dropoff_reason?: string;
  created_at: string;
  completed_at?: string;
}

export interface Gamification {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  achievement_description?: string;
  points_earned: number;
  level_reached?: number;
  badge_earned?: string;
  created_at: string;
}

export interface RetentionTool {
  id: string;
  name: string;
  description?: string;
  tool_type: 'email_sequence' | 'push_notification' | 'in_app_message' | 'loyalty_program';
  trigger_condition: Record<string, any>;
  action_config: Record<string, any>;
  target_segment?: string;
  is_active: boolean;
  effectiveness_score: number;
  created_at: string;
  updated_at: string;
}

export interface GrowthDashboard {
  overview: {
    total_users: number;
    new_users_today: number;
    new_users_this_week: number;
    new_users_this_month: number;
    active_users_today: number;
    active_users_this_week: number;
    retention_rate_7d: number;
    retention_rate_30d: number;
    viral_coefficient: number;
    average_revenue_per_user: number;
  };
  acquisition_metrics: {
    total_acquisitions: number;
    acquisitions_by_source: Record<string, number>;
    acquisition_cost_by_source: Record<string, number>;
    conversion_rate_by_source: Record<string, number>;
  };
  retention_metrics: {
    cohort_retention: Array<{
      cohort_date: string;
      day_1: number;
      day_7: number;
      day_30: number;
      day_90: number;
    }>;
    churn_rate: number;
    churn_reasons: Record<string, number>;
  };
  engagement_metrics: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
    average_session_duration: number;
    average_sessions_per_user: number;
    engagement_by_feature: Record<string, number>;
  };
  viral_metrics: {
    viral_coefficient: number;
    viral_velocity: number;
    top_viral_content: Array<{
      content_id: string;
      content_type: string;
      viral_score: number;
      share_count: number;
    }>;
    viral_loops_performance: Array<{
      loop_id: string;
      loop_name: string;
      viral_coefficient: number;
      conversion_rate: number;
    }>;
  };
  experiments: Array<{
    id: string;
    name: string;
    status: string;
    impact_score: number;
    completion_percentage: number;
  }>;
}

export interface GrowthAnalytics {
  user_growth: Array<{
    date: string;
    new_users: number;
    total_users: number;
    growth_rate: number;
  }>;
  retention_analysis: Array<{
    cohort_date: string;
    cohort_size: number;
    retention_rates: Record<string, number>;
  }>;
  engagement_trends: Array<{
    date: string;
    active_users: number;
    session_count: number;
    average_session_duration: number;
  }>;
  viral_analysis: Array<{
    date: string;
    viral_coefficient: number;
    shares_generated: number;
    new_users_from_shares: number;
  }>;
  revenue_growth: Array<{
    date: string;
    revenue: number;
    paying_users: number;
    average_revenue_per_user: number;
  }>;
}

export interface GrowthStrategy {
  id: string;
  name: string;
  description?: string;
  focus_area: 'acquisition' | 'retention' | 'engagement' | 'monetization';
  target_audience: Record<string, any>;
  key_metrics: string[];
  tactics: Array<{
    id: string;
    name: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    status: 'planned' | 'active' | 'completed' | 'failed';
    start_date?: string;
    end_date?: string;
    results?: Record<string, any>;
  }>;
  budget?: number;
  timeline: {
    start_date: string;
    end_date: string;
    milestones: Array<{
      date: string;
      description: string;
      is_completed: boolean;
    }>;
  };
  success_criteria: Array<{
    metric: string;
    target_value: number;
    current_value: number;
    is_achieved: boolean;
  }>;
  status: 'planning' | 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface GrowthOptimization {
  id: string;
  name: string;
  description?: string;
  optimization_type: 'funnel' | 'landing_page' | 'onboarding' | 'feature_adoption';
  current_performance: Record<string, number>;
  target_performance: Record<string, number>;
  optimization_hypotheses: Array<{
    id: string;
    hypothesis: string;
    expected_impact: number;
    confidence_level: number;
    implementation_effort: 'low' | 'medium' | 'high';
    status: 'proposed' | 'testing' | 'implemented' | 'rejected';
    test_results?: Record<string, any>;
  }>;
  a_b_tests: Array<{
    id: string;
    name: string;
    status: string;
    winner_variant?: string;
    confidence_level?: number;
    impact_metrics: Record<string, number>;
  }>;
  status: 'planning' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}
