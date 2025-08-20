import { supabase } from '@/integrations/supabase/client';
import type {
  Referral,
  ReferralProgramData,
  ReferralAnalytics,
  ReferralMetrics
} from '@/types/marketing';

export class ReferralService {
  // Create a new referral program entry
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

    // Update user's referral code in profile
    await this.updateUserReferralCode(user.id, referralCode);

    return referral;
  }

  // Get referrals with filters
  static async getReferrals(filters?: {
    referrer_id?: string;
    referred_id?: string;
    status?: Referral['status'];
    date_from?: string;
    date_to?: string;
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
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data: referrals, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return referrals || [];
  }

  // Get referral by code
  static async getReferralByCode(code: string): Promise<Referral | null> {
    const { data: referral, error } = await supabase
      .from('referral_program')
      .select('*')
      .eq('referral_code', code)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return referral;
  }

  // Complete a referral (when referred user signs up)
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

    // Update referrer's stats
    await this.updateReferrerStats(referral.referrer_id);

    // Process reward
    await this.processReferralReward(referral);

    return referral;
  }

  // Get referral metrics for a user or overall
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

  // Get detailed referral analytics
  static async getReferralAnalytics(userId?: string): Promise<ReferralAnalytics> {
    const metrics = await this.getReferralMetrics(userId);

    // Generate referral trend (last 30 days)
    const referralTrend = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayReferrals = await this.getReferrals({
        ...(userId && { referrer_id: userId }),
        date_from: dateStr,
        date_to: dateStr
      });
      
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

  // Get user's referral code
  static async getUserReferralCode(userId: string): Promise<string | null> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return profile?.referral_code || null;
  }

  // Generate referral link
  static async generateReferralLink(userId: string, platform?: string): Promise<string> {
    const referralCode = await this.getUserReferralCode(userId);
    if (!referralCode) {
      throw new Error('No referral code found for user');
    }

    const baseUrl = window.location.origin;
    const referralUrl = `${baseUrl}/signup?ref=${referralCode}`;
    
    if (platform) {
      return `${referralUrl}&platform=${platform}`;
    }
    
    return referralUrl;
  }

  // Track referral click
  static async trackReferralClick(referralCode: string, platform?: string): Promise<void> {
    try {
      await supabase.from('marketing_analytics').insert({
        event_type: 'referral_click',
        event_data: {
          referral_code: referralCode,
          platform: platform,
          timestamp: new Date().toISOString()
        },
        referral_code: referralCode
      });
    } catch (error) {
      console.error('Failed to track referral click:', error);
    }
  }

  // Track referral conversion
  static async trackReferralConversion(referralCode: string, referredUserId: string): Promise<void> {
    try {
      await supabase.from('marketing_analytics').insert({
        event_type: 'referral_conversion',
        event_data: {
          referral_code: referralCode,
          referred_user_id: referredUserId,
          timestamp: new Date().toISOString()
        },
        referral_code: referralCode,
        user_id: referredUserId
      });
    } catch (error) {
      console.error('Failed to track referral conversion:', error);
    }
  }

  // Get referral leaderboard
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

  // Validate referral code
  static async validateReferralCode(code: string): Promise<{
    valid: boolean;
    referral?: Referral;
    error?: string;
  }> {
    try {
      const referral = await this.getReferralByCode(code);
      
      if (!referral) {
        return { valid: false, error: 'Invalid referral code' };
      }

      if (referral.status !== 'pending') {
        return { valid: false, error: 'Referral code already used or expired' };
      }

      return { valid: true, referral };
    } catch (error) {
      return { valid: false, error: 'Error validating referral code' };
    }
  }

  // Get referral rewards history
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

  // Update user's referral code in profile
  private static async updateUserReferralCode(userId: string, referralCode: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ referral_code: referralCode })
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Update referrer's stats
  private static async updateReferrerStats(referrerId: string): Promise<void> {
    const { data: referrals, error } = await supabase
      .from('referral_program')
      .select('*')
      .eq('referrer_id', referrerId)
      .eq('status', 'completed');

    if (error) throw error;

    const referralCount = referrals?.length || 0;
    const totalRewards = referrals?.reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        referral_count: referralCount,
        total_referral_rewards: totalRewards
      })
      .eq('user_id', referrerId);

    if (updateError) throw updateError;
  }

  // Process referral reward
  private static async processReferralReward(referral: Referral): Promise<void> {
    if (!referral.reward_amount || !referral.reward_type) return;

    try {
      switch (referral.reward_type) {
        case 'credits':
          // Add credits to user account
          await this.addCreditsToUser(referral.referrer_id, referral.reward_amount);
          break;
        
        case 'discount':
          // Create discount code for user
          await this.createDiscountForUser(referral.referrer_id, referral.reward_amount);
          break;
        
        case 'premium_access':
          // Grant premium access
          await this.grantPremiumAccess(referral.referrer_id, referral.reward_amount);
          break;
        
        case 'cash':
          // Process cash reward (would integrate with payment system)
          await this.processCashReward(referral.referrer_id, referral.reward_amount, referral.reward_currency);
          break;
      }
    } catch (error) {
      console.error('Failed to process referral reward:', error);
    }
  }

  // Helper methods for reward processing
  private static async addCreditsToUser(userId: string, amount: number): Promise<void> {
    // Implementation would depend on your credits system
    console.log(`Adding ${amount} credits to user ${userId}`);
  }

  private static async createDiscountForUser(userId: string, discountAmount: number): Promise<void> {
    // Implementation would create a discount code
    console.log(`Creating discount of ${discountAmount} for user ${userId}`);
  }

  private static async grantPremiumAccess(userId: string, duration: number): Promise<void> {
    // Implementation would grant premium access
    console.log(`Granting premium access for ${duration} days to user ${userId}`);
  }

  private static async processCashReward(userId: string, amount: number, currency: string): Promise<void> {
    // Implementation would integrate with payment system
    console.log(`Processing cash reward of ${amount} ${currency} for user ${userId}`);
  }
}
