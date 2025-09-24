
import { supabase } from '@/integrations/supabase/client';
import type { Referral } from '@/types/marketing';

/**
 * ReferralRewardService handles reward processing and distribution for referrals
 */
export class ReferralRewardService {
  /**
   * Process referral reward based on reward type
   */
  static async processReferralReward(referral: Referral): Promise<void> {
    if (!referral.reward_amount || !referral.reward_type) return;

    try {
      switch (referral.reward_type) {
        case 'credits':
          await this.addCreditsToUser(referral.referrer_id, referral.reward_amount);
          break;
        
        case 'discount':
          await this.createDiscountForUser(referral.referrer_id, referral.reward_amount);
          break;
        
        case 'premium_access':
          await this.grantPremiumAccess(referral.referrer_id, referral.reward_amount);
          break;
        
        case 'cash':
          await this.processCashReward(referral.referrer_id, referral.reward_amount, referral.reward_currency);
          break;
      }
    } catch (error) {
      console.error('Failed to process referral reward:', error);
      throw error;
    }
  }

  /**
   * Add credits to user account
   */
  private static async addCreditsToUser(userId: string, amount: number): Promise<void> {
    // Implementation would depend on your credits system
    // For now, we'll update the user's profile with credit information
    const { error } = await supabase
      .from('profiles')
      .update({
        credits: supabase.sql`credits + ${amount}`,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
    console.log(`Added ${amount} credits to user ${userId}`);
  }

  /**
   * Create discount code for user
   */
  private static async createDiscountForUser(userId: string, discountAmount: number): Promise<void> {
    // Create a discount code for the user
    const discountCode = `REF${userId.slice(0, 8).toUpperCase()}`;
    
    const { error } = await supabase
      .from('promo_codes')
      .insert({
        code: discountCode,
        name: 'Referral Reward',
        description: 'Reward for successful referral',
        discount_type: 'fixed',
        discount_value: discountAmount,
        minimum_purchase: 0,
        usage_limit: 1,
        user_limit: 1,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        is_active: true,
        created_by: userId
      });

    if (error) throw error;
    console.log(`Created discount of ${discountAmount} for user ${userId}`);
  }

  /**
   * Grant premium access to user
   */
  private static async grantPremiumAccess(userId: string, duration: number): Promise<void> {
    // Update user's premium status
    const { error } = await supabase
      .from('profiles')
      .update({
        is_premium: true,
        premium_expires_at: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
    console.log(`Granted premium access for ${duration} days to user ${userId}`);
  }

  /**
   * Process cash reward (would integrate with payment system)
   */
  private static async processCashReward(userId: string, amount: number, currency: string): Promise<void> {
    // This would typically integrate with a payment system like Stripe
    // For now, we'll create a pending payout record
    
    const { error } = await supabase
      .from('payouts')
      .insert({
        user_id: userId,
        amount: amount,
        currency: currency,
        status: 'pending',
        type: 'referral_reward',
        description: 'Referral reward payout',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    console.log(`Processing cash reward of ${amount} ${currency} for user ${userId}`);
  }

  /**
   * Update referrer's stats after successful referral
   */
  static async updateReferrerStats(referrerId: string): Promise<void> {
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
        total_referral_rewards: totalRewards,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', referrerId);

    if (updateError) throw updateError;
  }

  /**
   * Check if user is eligible for bonus reward
   */
  static async checkBonusEligibility(userId: string, requiredReferrals: number = 5): Promise<{
    eligible: boolean;
    currentReferrals: number;
    requiredReferrals: number;
    bonusAmount: number;
  }> {
    const { data: referrals, error } = await supabase
      .from('referral_program')
      .select('*')
      .eq('referrer_id', userId)
      .eq('status', 'completed');

    if (error) throw error;

    const currentReferrals = referrals?.length || 0;
    const eligible = currentReferrals >= requiredReferrals;
    const bonusAmount = eligible ? 10 : 0; // $10 bonus

    return {
      eligible,
      currentReferrals,
      requiredReferrals,
      bonusAmount
    };
  }

  /**
   * Process bonus reward if eligible
   */
  static async processBonusReward(userId: string): Promise<boolean> {
    const eligibility = await this.checkBonusEligibility(userId);
    
    if (!eligibility.eligible) {
      return false;
    }

    // Process the bonus reward
    await this.processCashReward(userId, eligibility.bonusAmount, 'USD');
    
    // Mark bonus as processed
    const { error } = await supabase
      .from('profiles')
      .update({
        bonus_processed: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
    
    return true;
  }
}
