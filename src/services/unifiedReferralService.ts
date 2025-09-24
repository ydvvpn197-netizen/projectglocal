import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from './errorHandlingService';

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  max_uses: number;
  current_uses: number;
  reward_amount: number;
  reward_type: 'points' | 'credits' | 'discount';
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReferralUsage {
  id: string;
  referral_code_id: string;
  referrer_id: string;
  referred_user_id: string;
  reward_claimed: boolean;
  reward_amount: number;
  created_at: string;
}

export interface ReferralAnalytics {
  total_referrals: number;
  successful_referrals: number;
  total_rewards_given: number;
  conversion_rate: number;
  top_referrers: Array<{
    user_id: string;
    display_name: string;
    referral_count: number;
    total_rewards: number;
  }>;
}

export interface ReferralReward {
  id: string;
  user_id: string;
  referral_usage_id: string;
  amount: number;
  reward_type: 'points' | 'credits' | 'discount';
  claimed_at: string;
  expires_at?: string;
}

export class UnifiedReferralService {
  /**
   * Generate a unique referral code for a user
   */
  static async generateReferralCode(
    userId: string,
    options: {
      maxUses?: number;
      rewardAmount?: number;
      rewardType?: 'points' | 'credits' | 'discount';
      expiresAt?: string;
    } = {}
  ): Promise<ReferralCode | null> {
    try {
      const code = this.generateUniqueCode();
      
      const { data, error } = await supabase
        .from('referral_codes')
        .insert({
          user_id: userId,
          code,
          max_uses: options.maxUses || 10,
          current_uses: 0,
          reward_amount: options.rewardAmount || 100,
          reward_type: options.rewardType || 'points',
          expires_at: options.expiresAt,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.handleApiError(error, 'ReferralService.generateReferralCode');
      return null;
    }
  }

  /**
   * Get referral codes for a user
   */
  static async getUserReferralCodes(userId: string): Promise<ReferralCode[]> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorHandler.handleApiError(error, 'ReferralService.getUserReferralCodes');
      return [];
    }
  }

  /**
   * Validate and use a referral code
   */
  static async useReferralCode(
    code: string,
    referredUserId: string
  ): Promise<{ success: boolean; reward?: ReferralReward; error?: string }> {
    try {
      // Get the referral code
      const { data: referralCode, error: codeError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code)
        .single();

      if (codeError || !referralCode) {
        return { success: false, error: 'Invalid referral code' };
      }

      // Check if code is expired
      if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
        return { success: false, error: 'Referral code has expired' };
      }

      // Check if code has reached max uses
      if (referralCode.current_uses >= referralCode.max_uses) {
        return { success: false, error: 'Referral code has reached maximum uses' };
      }

      // Check if user has already used this code
      const { data: existingUsage } = await supabase
        .from('referral_usage')
        .select('*')
        .eq('referral_code_id', referralCode.id)
        .eq('referred_user_id', referredUserId)
        .single();

      if (existingUsage) {
        return { success: false, error: 'You have already used this referral code' };
      }

      // Create referral usage record
      const { data: usage, error: usageError } = await supabase
        .from('referral_usage')
        .insert({
          referral_code_id: referralCode.id,
          referrer_id: referralCode.user_id,
          referred_user_id: referredUserId,
          reward_claimed: false,
          reward_amount: referralCode.reward_amount,
        })
        .select()
        .single();

      if (usageError) throw usageError;

      // Update referral code usage count
      await supabase
        .from('referral_codes')
        .update({ current_uses: referralCode.current_uses + 1 })
        .eq('id', referralCode.id);

      // Create reward for referrer
      const reward = await this.createReferralReward(
        referralCode.user_id,
        usage.id,
        referralCode.reward_amount,
        referralCode.reward_type
      );

      return { success: true, reward };
    } catch (error) {
      errorHandler.handleApiError(error, 'ReferralService.useReferralCode');
      return { success: false, error: 'Failed to use referral code' };
    }
  }

  /**
   * Create a referral reward
   */
  static async createReferralReward(
    userId: string,
    referralUsageId: string,
    amount: number,
    rewardType: 'points' | 'credits' | 'discount'
  ): Promise<ReferralReward | null> {
    try {
      const { data, error } = await supabase
        .from('referral_rewards')
        .insert({
          user_id: userId,
          referral_usage_id: referralUsageId,
          amount,
          reward_type: rewardType,
          claimed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.handleApiError(error, 'ReferralService.createReferralReward');
      return null;
    }
  }

  /**
   * Get referral analytics for a user
   */
  static async getUserReferralAnalytics(userId: string): Promise<ReferralAnalytics | null> {
    try {
      // Get user's referral codes
      const { data: referralCodes } = await supabase
        .from('referral_codes')
        .select('id')
        .eq('user_id', userId);

      if (!referralCodes?.length) {
        return {
          total_referrals: 0,
          successful_referrals: 0,
          total_rewards_given: 0,
          conversion_rate: 0,
          top_referrers: [],
        };
      }

      const codeIds = referralCodes.map(code => code.id);

      // Get referral usage for user's codes
      const { data: usage } = await supabase
        .from('referral_usage')
        .select('*')
        .in('referral_code_id', codeIds);

      const totalReferrals = usage?.length || 0;
      const successfulReferrals = usage?.filter(u => u.reward_claimed).length || 0;

      // Get total rewards given
      const { data: rewards } = await supabase
        .from('referral_rewards')
        .select('amount')
        .eq('user_id', userId);

      const totalRewardsGiven = rewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;

      return {
        total_referrals: totalReferrals,
        successful_referrals: successfulReferrals,
        total_rewards_given: totalRewardsGiven,
        conversion_rate: totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0,
        top_referrers: [], // Would need additional query to get top referrers
      };
    } catch (error) {
      errorHandler.handleApiError(error, 'ReferralService.getUserReferralAnalytics');
      return null;
    }
  }

  /**
   * Get global referral analytics (admin only)
   */
  static async getGlobalReferralAnalytics(): Promise<ReferralAnalytics | null> {
    try {
      // Get all referral usage
      const { data: usage } = await supabase
        .from('referral_usage')
        .select('*');

      const totalReferrals = usage?.length || 0;
      const successfulReferrals = usage?.filter(u => u.reward_claimed).length || 0;

      // Get top referrers
      const { data: topReferrers } = await supabase
        .from('referral_usage')
        .select(`
          referrer_id,
          profiles!referrer_id(display_name),
          referral_codes!referral_code_id(reward_amount)
        `)
        .eq('reward_claimed', true);

      // Process top referrers data
      const referrerStats = new Map<string, { count: number; totalRewards: number; displayName: string }>();
      
      topReferrers?.forEach(usage => {
        const referrerId = usage.referrer_id;
        const current = referrerStats.get(referrerId) || { count: 0, totalRewards: 0, displayName: '' };
        
        referrerStats.set(referrerId, {
          count: current.count + 1,
          totalRewards: current.totalRewards + (usage.referral_codes?.reward_amount || 0),
          displayName: usage.profiles?.display_name || 'Unknown User',
        });
      });

      const topReferrersList = Array.from(referrerStats.entries())
        .map(([userId, stats]) => ({
          user_id: userId,
          display_name: stats.displayName,
          referral_count: stats.count,
          total_rewards: stats.totalRewards,
        }))
        .sort((a, b) => b.referral_count - a.referral_count)
        .slice(0, 10);

      return {
        total_referrals: totalReferrals,
        successful_referrals: successfulReferrals,
        total_rewards_given: topReferrersList.reduce((sum, ref) => sum + ref.total_rewards, 0),
        conversion_rate: totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0,
        top_referrers: topReferrersList,
      };
    } catch (error) {
      errorHandler.handleApiError(error, 'ReferralService.getGlobalReferralAnalytics');
      return null;
    }
  }

  /**
   * Generate a unique referral code
   */
  private static generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
