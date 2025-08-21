import { supabase } from '@/integrations/supabase/client';
import { ReferralAnalyticsService } from './referralAnalyticsService';
import { ReferralRewardService } from './referralRewardService';
import type {
  Referral,
  ReferralProgramData,
  ReferralAnalytics,
  ReferralMetrics
} from '@/types/marketing';

/**
 * ReferralService manages user referral programs and core operations
 * 
 * Features:
 * - Referral code generation and management
 * - Referral tracking and validation
 * - Core referral operations
 * - Integration with analytics and reward services
 */
export class ReferralService {
  /**
   * Creates a new referral program entry for a user
   */
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

  /**
   * Get referrals with filters
   */
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

  /**
   * Get referral by code
   */
  static async getReferralByCode(code: string): Promise<Referral | null> {
    const { data: referral, error } = await supabase
      .from('referral_program')
      .select('*')
      .eq('referral_code', code)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return referral;
  }

  /**
   * Complete a referral (when referred user signs up)
   */
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
    await ReferralRewardService.updateReferrerStats(referral.referrer_id);

    // Process reward
    await ReferralRewardService.processReferralReward(referral);

    return referral;
  }

  /**
   * Get referral metrics (delegates to ReferralAnalyticsService)
   */
  static async getReferralMetrics(userId?: string): Promise<ReferralMetrics> {
    return ReferralAnalyticsService.getReferralMetrics(userId);
  }

  /**
   * Get detailed referral analytics (delegates to ReferralAnalyticsService)
   */
  static async getReferralAnalytics(userId?: string): Promise<ReferralAnalytics> {
    return ReferralAnalyticsService.getReferralAnalytics(userId);
  }

  /**
   * Get user's referral code
   */
  static async getUserReferralCode(userId: string): Promise<string | null> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return profile?.referral_code || null;
  }

  /**
   * Generate referral link
   */
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

  /**
   * Track referral click
   */
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

  /**
   * Track referral conversion
   */
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

  /**
   * Get referral leaderboard (delegates to ReferralAnalyticsService)
   */
  static async getReferralLeaderboard(limit: number = 10) {
    return ReferralAnalyticsService.getReferralLeaderboard(limit);
  }

  /**
   * Validate referral code
   */
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

  /**
   * Get referral rewards history (delegates to ReferralAnalyticsService)
   */
  static async getReferralRewardsHistory(userId: string) {
    return ReferralAnalyticsService.getReferralRewardsHistory(userId);
  }

  /**
   * Update user's referral code in profile
   */
  private static async updateUserReferralCode(userId: string, referralCode: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ referral_code: referralCode })
      .eq('user_id', userId);

    if (error) throw error;
  }
}
