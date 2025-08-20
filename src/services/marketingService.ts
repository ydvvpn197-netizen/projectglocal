import { supabase } from '@/integrations/supabase/client';
import type {
  Campaign,
  CreateCampaignData,
  UpdateCampaignData,
  CampaignMetrics,
  MarketingAnalytics,
  MarketingDashboard,
  PromoCode,
  CreatePromoCodeData,
  UpdatePromoCodeData,
  PromotionalMetrics,
  SocialShare,
  ShareContentData,
  ShareAnalytics,
  Referral,
  ReferralProgramData,
  ReferralAnalytics,
  ReferralMetrics
} from '@/types/marketing';

/**
 * MarketingService provides comprehensive marketing functionality including
 * campaign management, promotional codes, analytics, and referral programs.
 * 
 * Features:
 * - Campaign CRUD operations
 * - Promotional code management
 * - Marketing analytics and metrics
 * - Referral program management
 * - Social sharing analytics
 */
export class MarketingService {
  /**
   * Creates a new marketing campaign
   * @param data - Campaign creation data
   * @returns Promise<Campaign> - Created campaign
   */
  static async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    const { data: campaign, error } = await supabase
      .from('marketing_campaigns')
      .insert({
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return campaign;
  }

  static async getCampaigns(filters?: {
    status?: Campaign['status'];
    campaign_type?: Campaign['campaign_type'];
    created_by?: string;
  }): Promise<Campaign[]> {
    let query = supabase.from('marketing_campaigns').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.campaign_type) {
      query = query.eq('campaign_type', filters.campaign_type);
    }
    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    const { data: campaigns, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return campaigns || [];
  }

  static async getCampaign(id: string): Promise<Campaign> {
    const { data: campaign, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return campaign;
  }

  static async updateCampaign(id: string, data: UpdateCampaignData): Promise<Campaign> {
    const { data: campaign, error } = await supabase
      .from('marketing_campaigns')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return campaign;
  }

  static async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('marketing_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    const { data: campaign, error: campaignError } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError) throw campaignError;

    const impressions = campaign.impressions || 0;
    const clicks = campaign.clicks || 0;
    const conversions = campaign.conversions || 0;
    const spent = campaign.spent || 0;

    return {
      impressions,
      clicks,
      conversions,
      conversion_rate: impressions > 0 ? (conversions / impressions) * 100 : 0,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spent / clicks : 0,
      cpm: impressions > 0 ? (spent / impressions) * 1000 : 0,
      roi: spent > 0 ? ((campaign.roi || 0) / spent) * 100 : 0,
      revenue: campaign.roi || 0,
      cost: spent
    };
  }

  // Promotional Codes
  static async createPromoCode(data: CreatePromoCodeData): Promise<PromoCode> {
    const { data: promoCode, error } = await supabase
      .from('promotional_codes')
      .insert({
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return promoCode;
  }

  static async getPromoCodes(filters?: {
    is_active?: boolean;
    created_by?: string;
  }): Promise<PromoCode[]> {
    let query = supabase.from('promotional_codes').select('*');

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    const { data: promoCodes, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return promoCodes || [];
  }

  static async getPromoCode(id: string): Promise<PromoCode> {
    const { data: promoCode, error } = await supabase
      .from('promotional_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return promoCode;
  }

  static async updatePromoCode(id: string, data: UpdatePromoCodeData): Promise<PromoCode> {
    const { data: promoCode, error } = await supabase
      .from('promotional_codes')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return promoCode;
  }

  static async deletePromoCode(id: string): Promise<void> {
    const { error } = await supabase
      .from('promotional_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async validatePromoCode(code: string, userId: string, amount: number): Promise<any> {
    const { data, error } = await supabase.rpc('validate_promo_code', {
      code_input: code,
      user_id: userId,
      amount: amount
    });

    if (error) throw error;
    return data;
  }

  static async getPromotionalMetrics(): Promise<PromotionalMetrics> {
    const { data: promoCodes, error: codesError } = await supabase
      .from('promotional_codes')
      .select('*');

    if (codesError) throw codesError;

    const { data: usage, error: usageError } = await supabase
      .from('promo_code_usage')
      .select('*');

    if (usageError) throw usageError;

    const totalCodes = promoCodes?.length || 0;
    const activeCodes = promoCodes?.filter(code => code.is_active).length || 0;
    const totalUsage = usage?.length || 0;
    const totalDiscounts = usage?.reduce((sum, u) => sum + u.discount_amount, 0) || 0;
    const averageDiscount = totalUsage > 0 ? totalDiscounts / totalUsage : 0;

    const topPerformingCodes = promoCodes
      ?.map(code => {
        const codeUsage = usage?.filter(u => u.promo_code_id === code.id) || [];
        return {
          code: code.code,
          name: code.name,
          usage_count: codeUsage.length,
          total_discount: codeUsage.reduce((sum, u) => sum + u.discount_amount, 0)
        };
      })
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10) || [];

    return {
      total_codes: totalCodes,
      active_codes: activeCodes,
      total_usage: totalUsage,
      total_discounts: totalDiscounts,
      average_discount: averageDiscount,
      conversion_rate: totalCodes > 0 ? (totalUsage / totalCodes) * 100 : 0,
      top_performing_codes: topPerformingCodes
    };
  }

  // Social Sharing
  static async shareContent(data: ShareContentData): Promise<SocialShare> {
    const { data: share, error } = await supabase
      .from('social_shares')
      .insert({
        ...data,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return share;
  }

  static async getSocialShares(filters?: {
    user_id?: string;
    content_type?: SocialShare['content_type'];
    content_id?: string;
    platform?: SocialShare['platform'];
  }): Promise<SocialShare[]> {
    let query = supabase.from('social_shares').select('*');

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters?.content_type) {
      query = query.eq('content_type', filters.content_type);
    }
    if (filters?.content_id) {
      query = query.eq('content_id', filters.content_id);
    }
    if (filters?.platform) {
      query = query.eq('platform', filters.platform);
    }

    const { data: shares, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return shares || [];
  }

  static async getShareAnalytics(contentId: string, contentType: string): Promise<ShareAnalytics> {
    const { data: shares, error } = await supabase
      .from('social_shares')
      .select('*')
      .eq('content_id', contentId)
      .eq('content_type', contentType);

    if (error) throw error;

    const totalShares = shares?.length || 0;
    const sharesByPlatform = shares?.reduce((acc, share) => {
      acc[share.platform] = (acc[share.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalClicks = shares?.reduce((sum, share) => sum + share.clicks, 0) || 0;
    const totalImpressions = shares?.reduce((sum, share) => sum + share.impressions, 0) || 0;
    const engagementRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const viralCoefficient = totalImpressions > 0 ? (totalShares / totalImpressions) * 100 : 0;

    // Generate time series data (last 30 days)
    const timeSeries = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayShares = shares?.filter(share => 
        share.created_at.startsWith(dateStr)
      ) || [];
      
      timeSeries.push({
        date: dateStr,
        shares: dayShares.length,
        engagement: dayShares.reduce((sum, share) => sum + share.clicks, 0)
      });
    }

    return {
      total_shares: totalShares,
      shares_by_platform: sharesByPlatform,
      engagement_rate: engagementRate,
      viral_coefficient: viralCoefficient,
      reach_estimate: totalImpressions,
      time_series: timeSeries
    };
  }

  // Referral Program
  static async createReferral(data: ReferralProgramData): Promise<Referral> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Generate referral code
    const { data: referralCode, error: codeError } = await supabase.rpc('generate_referral_code');
    if (codeError) throw codeError;

    const { data: referral, error } = await supabase
      .from('referral_program')
      .insert({
        referrer_id: user.id,
        referral_code: referralCode,
        reward_type: data.reward_type,
        reward_amount: data.reward_amount,
        reward_currency: data.reward_currency || 'USD',
        referral_source: data.referral_source
      })
      .select()
      .single();

    if (error) throw error;
    return referral;
  }

  static async getReferrals(filters?: {
    referrer_id?: string;
    referred_id?: string;
    status?: Referral['status'];
  }): Promise<Referral[]> {
    let query = supabase.from('referral_program').select('*');

    if (filters?.referrer_id) {
      query = query.eq('referrer_id', filters.referrer_id);
    }
    if (filters?.referred_id) {
      query = query.eq('referred_id', filters.referred_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data: referrals, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return referrals || [];
  }

  static async getReferralByCode(code: string): Promise<Referral | null> {
    const { data: referral, error } = await supabase
      .from('referral_program')
      .select('*')
      .eq('referral_code', code)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return referral;
  }

  static async completeReferral(referralId: string, referredUserId: string): Promise<Referral> {
    const { data: referral, error } = await supabase
      .from('referral_program')
      .update({
        referred_id: referredUserId,
        status: 'completed',
        conversion_date: new Date().toISOString()
      })
      .eq('id', referralId)
      .select()
      .single();

    if (error) throw error;
    return referral;
  }

  static async getReferralMetrics(userId?: string): Promise<ReferralMetrics> {
    let query = supabase.from('referral_program').select('*');
    
    if (userId) {
      query = query.eq('referrer_id', userId);
    }

    const { data: referrals, error } = await query;
    if (error) throw error;

    const totalReferrals = referrals?.length || 0;
    const successfulReferrals = referrals?.filter(r => r.status === 'completed').length || 0;
    const conversionRate = totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0;
    const totalRewards = referrals?.reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0;
    const averageReward = successfulReferrals > 0 ? totalRewards / successfulReferrals : 0;

    // Get top referrers
    const { data: topReferrers, error: topError } = await supabase
      .from('referral_program')
      .select(`
        referrer_id,
        profiles!referral_program_referrer_id_fkey(username, avatar_url)
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (topError) throw topError;

    const referrerStats = topReferrers?.reduce((acc, r) => {
      const userId = r.referrer_id;
      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          username: r.profiles?.username || 'Unknown',
          referral_count: 0,
          total_rewards: 0
        };
      }
      acc[userId].referral_count++;
      acc[userId].total_rewards += r.reward_amount || 0;
      return acc;
    }, {} as Record<string, any>);

    const topReferrersList = Object.values(referrerStats || {})
      .sort((a: any, b: any) => b.referral_count - a.referral_count)
      .slice(0, 10);

    return {
      total_referrals: totalReferrals,
      successful_referrals: successfulReferrals,
      conversion_rate: conversionRate,
      total_rewards: totalRewards,
      average_reward: averageReward,
      top_referrers: topReferrersList
    };
  }

  // Marketing Analytics
  static async trackEvent(eventData: {
    event_type: string;
    event_data?: Record<string, any>;
    campaign_id?: string;
    referral_code?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  }): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    
    const { error } = await supabase
      .from('marketing_analytics')
      .insert({
        ...eventData,
        user_id: user?.id,
        session_id: sessionStorage.getItem('session_id'),
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        device_type: this.getDeviceType()
      });

    if (error) throw error;
  }

  static async getMarketingDashboard(): Promise<MarketingDashboard> {
    // Get campaigns overview
    const { data: campaigns, error: campaignsError } = await supabase
      .from('marketing_campaigns')
      .select('*');

    if (campaignsError) throw campaignsError;

    const totalCampaigns = campaigns?.length || 0;
    const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
    const totalRevenue = campaigns?.reduce((sum, c) => sum + (c.roi || 0), 0) || 0;
    const totalSpent = campaigns?.reduce((sum, c) => sum + (c.spent || 0), 0) || 0;
    const overallRoi = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;

    // Get recent campaigns
    const recentCampaigns = campaigns
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5) || [];

    // Get top performers
    const topPerformers = campaigns
      ?.map(campaign => ({
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        roi: campaign.roi || 0,
        conversions: campaign.conversions || 0,
        revenue: campaign.roi || 0
      }))
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5) || [];

    // Generate metrics trend (last 30 days)
    const metricsTrend = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // This would typically come from analytics data
      metricsTrend.push({
        date: dateStr,
        impressions: Math.floor(Math.random() * 1000),
        clicks: Math.floor(Math.random() * 100),
        conversions: Math.floor(Math.random() * 10),
        revenue: Math.floor(Math.random() * 1000)
      });
    }

    return {
      overview: {
        total_campaigns: totalCampaigns,
        active_campaigns: activeCampaigns,
        total_revenue: totalRevenue,
        total_spent: totalSpent,
        overall_roi: overallRoi
      },
      recent_campaigns: recentCampaigns,
      top_performers: topPerformers,
      metrics_trend: metricsTrend
    };
  }

  // Utility methods
  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  private static getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/Android/i.test(userAgent)) return 'android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
    if (/Windows/i.test(userAgent)) return 'windows';
    if (/Mac/i.test(userAgent)) return 'mac';
    if (/Linux/i.test(userAgent)) return 'linux';
    return 'unknown';
  }
}
