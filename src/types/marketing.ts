// Marketing Types
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  campaign_type: 'promotional' | 'referral' | 'social' | 'email' | 'push' | 'affiliate';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  target_audience?: Record<string, unknown>;
  campaign_config?: Record<string, unknown>;
  budget?: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversion_rate: number;
  roi: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  reward_type?: 'credits' | 'discount' | 'premium_access' | 'cash';
  reward_amount?: number;
  reward_currency: string;
  conversion_date?: string;
  referral_source?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialShare {
  id: string;
  user_id?: string;
  content_type: 'post' | 'event' | 'profile' | 'group' | 'news';
  content_id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'whatsapp' | 'telegram' | 'email' | 'sms';
  share_url?: string;
  share_text?: string;
  share_metadata?: Record<string, unknown>;
  clicks: number;
  impressions: number;
  engagement_rate: number;
  viral_coefficient: number;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  minimum_purchase: number;
  maximum_discount?: number;
  usage_limit?: number;
  used_count: number;
  user_limit: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  applicable_services?: Record<string, unknown>;
  excluded_services?: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeUsage {
  id: string;
  promo_code_id: string;
  user_id: string;
  order_id?: string;
  discount_amount: number;
  original_amount: number;
  final_amount: number;
  used_at: string;
}

export interface MarketingAnalytics {
  id: string;
  user_id?: string;
  session_id?: string;
  event_type: string;
  event_data?: Record<string, unknown>;
  campaign_id?: string;
  referral_code?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  location_data?: Record<string, unknown>;
  created_at: string;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  conversion_rate: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roi: number;
  revenue: number;
  cost: number;
}

export interface ReferralMetrics {
  total_referrals: number;
  successful_referrals: number;
  conversion_rate: number;
  total_rewards: number;
  average_reward: number;
  top_referrers: Array<{
    user_id: string;
    username: string;
    referral_count: number;
    total_rewards: number;
  }>;
}

export interface SocialSharingMetrics {
  total_shares: number;
  shares_by_platform: Record<string, number>;
  viral_coefficient: number;
  engagement_rate: number;
  top_shared_content: Array<{
    content_id: string;
    content_type: string;
    share_count: number;
    viral_score: number;
  }>;
}

export interface PromotionalMetrics {
  total_codes: number;
  active_codes: number;
  total_usage: number;
  total_discounts: number;
  average_discount: number;
  conversion_rate: number;
  top_performing_codes: Array<{
    code: string;
    name: string;
    usage_count: number;
    total_discount: number;
  }>;
}

// Campaign Creation/Update Types
export interface CreateCampaignData {
  name: string;
  description?: string;
  campaign_type: Campaign['campaign_type'];
  start_date?: string;
  end_date?: string;
  target_audience?: Record<string, unknown>;
  campaign_config?: Record<string, unknown>;
  budget?: number;
}

export interface UpdateCampaignData {
  name?: string;
  description?: string;
  status?: Campaign['status'];
  end_date?: string;
  target_audience?: Record<string, unknown>;
  campaign_config?: Record<string, unknown>;
  budget?: number;
}

// Promo Code Creation/Update Types
export interface CreatePromoCodeData {
  code: string;
  name: string;
  description?: string;
  discount_type: PromoCode['discount_type'];
  discount_value: number;
  minimum_purchase?: number;
  maximum_discount?: number;
  usage_limit?: number;
  user_limit?: number;
  valid_until?: string;
  applicable_services?: Record<string, unknown>;
  excluded_services?: Record<string, unknown>;
}

export interface UpdatePromoCodeData {
  name?: string;
  description?: string;
  discount_value?: number;
  minimum_purchase?: number;
  maximum_discount?: number;
  usage_limit?: number;
  user_limit?: number;
  valid_until?: string;
  is_active?: boolean;
  applicable_services?: Record<string, unknown>;
  excluded_services?: Record<string, unknown>;
}

// Social Sharing Types
export interface ShareContentData {
  content_type: SocialShare['content_type'];
  content_id: string;
  platform: SocialShare['platform'];
  share_text?: string;
  share_url?: string;
  share_metadata?: Record<string, unknown>;
}

export interface ShareAnalytics {
  total_shares: number;
  shares_by_platform: Record<string, number>;
  engagement_rate: number;
  viral_coefficient: number;
  reach_estimate: number;
  time_series: Array<{
    date: string;
    shares: number;
    engagement: number;
  }>;
}

// Referral Program Types
export interface ReferralProgramData {
  reward_type: Referral['reward_type'];
  reward_amount: number;
  reward_currency?: string;
  referral_source?: string;
}

export interface ReferralAnalytics {
  total_referrals: number;
  successful_referrals: number;
  conversion_rate: number;
  total_rewards: number;
  average_reward: number;
  referral_trend: Array<{
    date: string;
    referrals: number;
    conversions: number;
  }>;
  top_referrers: Array<{
    user_id: string;
    username: string;
    avatar_url?: string;
    referral_count: number;
    total_rewards: number;
  }>;
}

// Marketing Automation Types
export interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  trigger_type: 'user_action' | 'time_based' | 'condition_met';
  trigger_config: Record<string, unknown>;
  actions: Array<{
    type: 'email' | 'push_notification' | 'sms' | 'in_app_message';
    config: Record<string, unknown>;
    delay_seconds?: number;
  }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSegment {
  id: string;
  name: string;
  description?: string;
  criteria: Record<string, unknown>;
  user_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  segment_id?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
}

// A/B Testing Types
export interface ABTest {
  id: string;
  name: string;
  description?: string;
  test_type: 'campaign' | 'landing_page' | 'email' | 'feature';
  variants: Array<{
    id: string;
    name: string;
    config: Record<string, unknown>;
    traffic_percentage: number;
  }>;
  metrics: Array<{
    name: string;
    description?: string;
    goal: 'maximize' | 'minimize';
  }>;
  status: 'draft' | 'running' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  winner_variant_id?: string;
  confidence_level?: number;
  created_at: string;
}

// Influencer Marketing Types
export interface Influencer {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  follower_count: number;
  engagement_rate: number;
  categories: string[];
  contact_email?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface InfluencerCampaign {
  id: string;
  name: string;
  description?: string;
  influencer_id: string;
  campaign_id: string;
  status: 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  terms: Record<string, unknown>;
  compensation: {
    type: 'fixed' | 'commission' | 'product' | 'hybrid';
    amount: number;
    currency: string;
  };
  start_date?: string;
  end_date?: string;
  deliverables: string[];
  metrics: Record<string, number>;
  created_at: string;
  updated_at: string;
}

// Affiliate Program Types
export interface AffiliateProgram {
  id: string;
  name: string;
  description?: string;
  commission_rate: number;
  commission_type: 'percentage' | 'fixed';
  minimum_payout: number;
  payout_schedule: 'weekly' | 'monthly' | 'quarterly';
  is_active: boolean;
  terms_and_conditions: string;
  created_at: string;
  updated_at: string;
}

export interface Affiliate {
  id: string;
  user_id: string;
  program_id: string;
  affiliate_code: string;
  status: 'pending' | 'approved' | 'suspended' | 'terminated';
  total_earnings: number;
  total_referrals: number;
  successful_referrals: number;
  conversion_rate: number;
  joined_at: string;
  last_activity: string;
}

// Marketing Dashboard Types
export interface MarketingDashboard {
  overview: {
    total_campaigns: number;
    active_campaigns: number;
    total_revenue: number;
    total_spent: number;
    overall_roi: number;
  };
  recent_campaigns: Campaign[];
  top_performers: Array<{
    campaign_id: string;
    campaign_name: string;
    roi: number;
    conversions: number;
    revenue: number;
  }>;
  metrics_trend: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
}
