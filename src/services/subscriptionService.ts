import { supabase } from '@/integrations/supabase/client';
import { stripeService } from './stripeService';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  user_type: 'user' | 'artist';
  plan_type: 'monthly' | 'yearly';
  price_in_cents: number;
  currency: string;
  stripe_price_id?: string;
  features: Record<string, boolean | string | number>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Indian pricing configuration
export const INDIAN_PRICING = {
  NORMAL_USER_MONTHLY: 2000, // ₹20 in paise
  NORMAL_USER_YEARLY: 20000, // ₹200 in paise (2 months free)
  ARTIST_MONTHLY: 10000, // ₹100 in paise
  ARTIST_YEARLY: 100000, // ₹1000 in paise (2 months free)
  CURRENCY: 'inr' as const,
} as const;

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface SubscriptionStatus {
  is_pro: boolean;
  plan?: SubscriptionPlan;
  subscription?: UserSubscription;
  expires_at?: string;
  can_comment_news: boolean;
  can_feature_listing: boolean;
  has_priority_support: boolean;
}

export class SubscriptionService {
  /**
   * Get all available subscription plans for a user type
   */
  async getSubscriptionPlans(userType: 'user' | 'artist'): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('user_type', userType)
        .eq('is_active', true)
        .order('plan_type', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  }

  /**
   * Get user's current subscription status
   */
  async getUserSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      // Get user's current subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        throw subscriptionError;
      }

      const isPro = subscription && 
        subscription.status === 'active' && 
        (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date());

      const features = subscription?.plan?.features || {};

      return {
        is_pro: isPro,
        plan: subscription?.plan,
        subscription: subscription,
        expires_at: subscription?.current_period_end,
        can_comment_news: isPro && features.news_comments === true,
        can_feature_listing: isPro && features.featured_listing === true,
        has_priority_support: isPro && features.priority_support === true,
      };
    } catch (error) {
      console.error('Error fetching user subscription status:', error);
      return {
        is_pro: false,
        can_comment_news: false,
        can_feature_listing: false,
        has_priority_support: false,
      };
    }
  }

  /**
   * Create a subscription checkout session
   */
  async createSubscriptionCheckout(planId: string, userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Get the plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError || !plan) {
        throw new Error('Plan not found');
      }

      // Check if user already has an active subscription
      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('id, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (existingSubscription) {
        throw new Error('User already has an active subscription');
      }

      // Create Stripe checkout session using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.stripe_price_id,
          mode: 'subscription',
          userId: userId,
          planId: planId,
          successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/subscription/cancel`,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }

      return {
        success: true,
        url: data.url,
      };
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user's active subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subscriptionError || !subscription) {
        throw new Error('No active subscription found');
      }

      if (!subscription.stripe_subscription_id) {
        throw new Error('No Stripe subscription ID found');
      }

      // Cancel the subscription in Stripe using Supabase Edge Function
      const { error: cancelError } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscriptionId: subscription.stripe_subscription_id,
          userId: userId,
        },
      });

      if (cancelError) {
        throw new Error(cancelError.message || 'Failed to cancel subscription');
      }

      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if user can comment on news articles
   */
  async canCommentOnNews(userId: string): Promise<boolean> {
    try {
      const status = await this.getUserSubscriptionStatus(userId);
      return status.can_comment_news;
    } catch (error) {
      console.error('Error checking news comment permission:', error);
      return false;
    }
  }

  /**
   * Check if user can feature listings
   */
  async canFeatureListing(userId: string): Promise<boolean> {
    try {
      const status = await this.getUserSubscriptionStatus(userId);
      return status.can_feature_listing;
    } catch (error) {
      console.error('Error checking feature listing permission:', error);
      return false;
    }
  }

  /**
   * Get user's subscription history
   */
  async getUserSubscriptionHistory(userId: string): Promise<UserSubscription[]> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      return [];
    }
  }

  /**
   * Update subscription from webhook
   */
  async updateSubscriptionFromWebhook(
    stripeSubscriptionId: string,
    status: string,
    currentPeriodStart?: string,
    currentPeriodEnd?: string,
    cancelAtPeriodEnd?: boolean
  ): Promise<void> {
    try {
      const updateData: {
        status: string;
        updated_at: string;
        current_period_start?: string;
        current_period_end?: string;
        cancel_at_period_end?: boolean;
      } = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (currentPeriodStart) {
        updateData.current_period_start = currentPeriodStart;
      }
      if (currentPeriodEnd) {
        updateData.current_period_end = currentPeriodEnd;
      }
      if (cancelAtPeriodEnd !== undefined) {
        updateData.cancel_at_period_end = cancelAtPeriodEnd;
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update(updateData)
        .eq('stripe_subscription_id', stripeSubscriptionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating subscription from webhook:', error);
      throw error;
    }
  }

  /**
   * Create subscription record
   */
  async createSubscription(
    userId: string,
    planId: string,
    stripeSubscriptionId: string,
    stripeCustomerId: string,
    currentPeriodStart: string,
    currentPeriodEnd: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          stripe_subscription_id: stripeSubscriptionId,
          stripe_customer_id: stripeCustomerId,
          status: 'active',
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: false,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
