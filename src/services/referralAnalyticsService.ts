// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import type { ReferralAnalytics, ReferralMetrics } from '@/types/marketing';

/**
 * ReferralAnalyticsService handles analytics and metrics calculations for referrals
 */
export class ReferralAnalyticsService {
  /**
   * Get referral metrics for a user or overall
   */
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

  /**
   * Get detailed referral analytics with trend data
   */
  static async getReferralAnalytics(userId?: string): Promise<ReferralAnalytics> {
    const metrics = await this.getReferralMetrics(userId);

    // Generate referral trend (last 30 days)
    const referralTrend = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayReferrals = await this.getReferralsForDate(dateStr, userId);
      const dayConversions = dayReferrals.filter(r => r.status === 'completed');
      
      referralTrend.push({
        date: dateStr,
        referrals: dayReferrals.length,
        conversions: dayConversions.length
      });
    }

    return {
      ...metrics,
      referral_trend: referralTrend
    };
  }

  /**
   * Get referral leaderboard
   */
  static async getReferralLeaderboard(limit: number = 10): Promise<Array<{
    user_id: string;
    username: string;
    avatar_url?: string;
    referral_count: number;
    total_rewards: number;
    conversion_rate: number;
  }>> {
    const { data: referrals, error } = await supabase
      .from('referral_program')
      .select(`
        referrer_id,
        reward_amount,
        status,
        profiles!referral_program_referrer_id_fkey(username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const userStats = referrals?.reduce((acc, r) => {
      const userId = r.referrer_id;
      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          username: r.profiles?.username || 'Unknown',
          avatar_url: r.profiles?.avatar_url,
          referral_count: 0,
          total_rewards: 0,
          successful_referrals: 0
        };
      }
      acc[userId].referral_count++;
      if (r.status === 'completed') {
        acc[userId].successful_referrals++;
        acc[userId].total_rewards += r.reward_amount || 0;
      }
      return acc;
    }, {} as Record<string, any>) || {};

    const leaderboard = Object.values(userStats)
      .map((user: any) => ({
        ...user,
        conversion_rate: user.referral_count > 0 ? (user.successful_referrals / user.referral_count) * 100 : 0
      }))
      .sort((a: any, b: any) => b.referral_count - a.referral_count)
      .slice(0, limit);

    return leaderboard;
  }

  /**
   * Get referral rewards history for a user
   */
  static async getReferralRewardsHistory(userId: string): Promise<Array<{
    id: string;
    referral_code: string;
    reward_type: string;
    reward_amount: number;
    reward_currency: string;
    conversion_date: string;
    referred_user: {
      username: string;
      avatar_url?: string;
    };
  }>> {
    const { data: referrals, error } = await supabase
      .from('referral_program')
      .select(`
        id,
        referral_code,
        reward_type,
        reward_amount,
        reward_currency,
        conversion_date,
        referred_id,
        profiles!referral_program_referred_id_fkey(username, avatar_url)
      `)
      .eq('referrer_id', userId)
      .eq('status', 'completed')
      .order('conversion_date', { ascending: false });

    if (error) throw error;

    return referrals?.map(r => ({
      id: r.id,
      referral_code: r.referral_code,
      reward_type: r.reward_type || 'unknown',
      reward_amount: r.reward_amount || 0,
      reward_currency: r.reward_currency,
      conversion_date: r.conversion_date || '',
      referred_user: {
        username: r.profiles?.username || 'Unknown',
        avatar_url: r.profiles?.avatar_url
      }
    })) || [];
  }

  /**
   * Helper method to get referrals for a specific date
   */
  private static async getReferralsForDate(dateStr: string, userId?: string) {
    let query = supabase
      .from('referral_program')
      .select('*')
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`);

    if (userId) {
      query = query.eq('referrer_id', userId);
    }

    const { data: referrals, error } = await query;
    if (error) throw error;
    return referrals || [];
  }
}
