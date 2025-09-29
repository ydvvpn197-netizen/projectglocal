import { supabase } from '@/integrations/supabase/client';
import { stripePromise } from '@/config/stripe';
import { anonymousUserService } from './anonymousUserService';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripe_price_id: string;
  is_popular?: boolean;
  max_events?: number;
  max_services?: number;
  verification_included?: boolean;
  priority_support?: boolean;
  analytics_access?: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  metadata: Record<string, string>;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  payment_method: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface RevenueAnalytics {
  total_revenue: number;
  monthly_revenue: number;
  subscription_revenue: number;
  one_time_revenue: number;
  active_subscriptions: number;
  churn_rate: number;
  average_revenue_per_user: number;
  top_plans: Array<{
    plan_id: string;
    plan_name: string;
    revenue: number;
    subscribers: number;
  }>;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    subscriptions: number;
  }>;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  currency?: string;
  max_uses?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  applicable_plans: string[];
  is_active: boolean;
}

export class MonetizationEnhanced {
  private static instance: MonetizationEnhanced;
  private plans: SubscriptionPlan[] = [];
  private promoCodes: PromoCode[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.initializePlans();
  }

  static getInstance(): MonetizationEnhanced {
    if (!MonetizationEnhanced.instance) {
      MonetizationEnhanced.instance = new MonetizationEnhanced();
    }
    return MonetizationEnhanced.instance;
  }

  /**
   * Initialize subscription plans
   */
  private initializePlans(): void {
    this.plans = [
      {
        id: 'basic',
        name: 'Basic User',
        description: 'Essential features for regular users',
        price: 2000, // ₹20
        currency: 'inr',
        interval: 'month',
        features: [
          'Verified badge',
          'Priority support',
          'Basic analytics',
          'Up to 5 events per month'
        ],
        stripe_price_id: 'price_basic_monthly',
        max_events: 5,
        verification_included: true
      },
      {
        id: 'artist_pro',
        name: 'Artist Pro',
        description: 'Complete toolkit for artists and creators',
        price: 10000, // ₹100
        currency: 'inr',
        interval: 'month',
        features: [
          'All Basic features',
          'Unlimited events',
          'Service marketplace access',
          'Advanced analytics',
          'Priority listing',
          'Direct booking system'
        ],
        stripe_price_id: 'price_artist_pro_monthly',
        is_popular: true,
        max_events: -1, // Unlimited
        max_services: 10,
        verification_included: true,
        priority_support: true,
        analytics_access: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Full platform access for organizations',
        price: 50000, // ₹500
        currency: 'inr',
        interval: 'month',
        features: [
          'All Artist Pro features',
          'Custom branding',
          'API access',
          'Dedicated support',
          'Advanced reporting',
          'Multi-user management'
        ],
        stripe_price_id: 'price_enterprise_monthly',
        max_events: -1,
        max_services: -1,
        verification_included: true,
        priority_support: true,
        analytics_access: true
      }
    ];
  }

  /**
   * Get available subscription plans
   */
  getSubscriptionPlans(): SubscriptionPlan[] {
    return this.plans;
  }

  /**
   * Create checkout session for subscription
   */
  async createSubscriptionCheckout(
    planId: string,
    options: {
      promoCode?: string;
      isAnonymous?: boolean;
      successUrl?: string;
      cancelUrl?: string;
    } = {}
  ): Promise<{ sessionUrl: string; sessionId: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const plan = this.plans.find(p => p.id === planId);
      
      if (!plan) {
        throw new Error('Plan not found');
      }

      const sessionId = options.isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      // Apply promo code discount if provided
      let finalPrice = plan.price;
      let discountMetadata = {};

      if (options.promoCode) {
        const promoCode = await this.validatePromoCode(options.promoCode, planId);
        if (promoCode) {
          finalPrice = this.calculateDiscountedPrice(plan.price, promoCode);
          discountMetadata = {
            promo_code: options.promoCode,
            original_price: plan.price.toString(),
            discounted_price: finalPrice.toString()
          };
        }
      }

      const checkoutData = {
        plan_id: planId,
        user_id: user?.id,
        session_id: sessionId,
        amount: finalPrice,
        currency: plan.currency,
        interval: plan.interval,
        success_url: options.successUrl || `${window.location.origin}/subscription/success`,
        cancel_url: options.cancelUrl || `${window.location.origin}/subscription/cancel`,
        metadata: {
          ...discountMetadata,
          plan_name: plan.name,
          is_anonymous: options.isAnonymous?.toString() || 'false'
        }
      };

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: checkoutData
      });

      if (error) throw error;

      return {
        sessionUrl: data.session_url,
        sessionId: data.session_id
      };
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      throw error;
    }
  }

  /**
   * Create one-time payment for event featuring
   */
  async createEventFeaturePayment(
    eventId: string,
    options: {
      duration?: number; // days
      isAnonymous?: boolean;
    } = {}
  ): Promise<{ sessionUrl: string; sessionId: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = options.isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      const duration = options.duration || 30;
      const amount = this.calculateFeaturePrice(duration);

      const paymentData = {
        type: 'event_feature',
        event_id: eventId,
        user_id: user?.id,
        session_id: sessionId,
        amount,
        currency: 'inr',
        duration,
        success_url: `${window.location.origin}/events/${eventId}?featured=true`,
        cancel_url: `${window.location.origin}/events/${eventId}`,
        metadata: {
          event_id: eventId,
          duration: duration.toString(),
          is_anonymous: options.isAnonymous?.toString() || 'false'
        }
      };

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: paymentData
      });

      if (error) throw error;

      return {
        sessionUrl: data.session_url,
        sessionId: data.session_id
      };
    } catch (error) {
      console.error('Error creating event feature payment:', error);
      throw error;
    }
  }

  /**
   * Create service purchase payment
   */
  async createServicePurchasePayment(
    serviceId: string,
    bookingId: string,
    amount: number,
    options: {
      isAnonymous?: boolean;
    } = {}
  ): Promise<{ sessionUrl: string; sessionId: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = options.isAnonymous ? 
        await anonymousUserService.getCurrentSessionId() : 
        undefined;

      const paymentData = {
        type: 'service_purchase',
        service_id: serviceId,
        booking_id: bookingId,
        user_id: user?.id,
        session_id: sessionId,
        amount,
        currency: 'inr',
        success_url: `${window.location.origin}/bookings/${bookingId}?paid=true`,
        cancel_url: `${window.location.origin}/services/${serviceId}`,
        metadata: {
          service_id: serviceId,
          booking_id: bookingId,
          is_anonymous: options.isAnonymous?.toString() || 'false'
        }
      };

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: paymentData
      });

      if (error) throw error;

      return {
        sessionUrl: data.session_url,
        sessionId: data.session_id
      };
    } catch (error) {
      console.error('Error creating service purchase payment:', error);
      throw error;
    }
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId?: string): Promise<Subscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = userId || user?.id;

      if (!currentUserId) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', currentUserId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscription_id: subscriptionId,
          cancel_at_period_end: cancelAtPeriodEnd
        }
      });

      if (error) throw error;
      return data.success;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(
    userId?: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
    } = {}
  ): Promise<PaymentHistory[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = userId || user?.id;

      if (!currentUserId) return [];

      let query = supabase
        .from('payments')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  /**
   * Get revenue analytics (admin only)
   */
  async getRevenueAnalytics(
    dateRange: {
      start: string;
      end: string;
    }
  ): Promise<RevenueAnalytics> {
    try {
      const { data, error } = await supabase.functions.invoke('get-revenue-analytics', {
        body: {
          start_date: dateRange.start,
          end_date: dateRange.end
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      return {
        total_revenue: 0,
        monthly_revenue: 0,
        subscription_revenue: 0,
        one_time_revenue: 0,
        active_subscriptions: 0,
        churn_rate: 0,
        average_revenue_per_user: 0,
        top_plans: [],
        revenue_by_month: []
      };
    }
  }

  /**
   * Create promo code
   */
  async createPromoCode(
    code: string,
    discountType: 'percentage' | 'fixed_amount',
    discountValue: number,
    options: {
      currency?: string;
      maxUses?: number;
      validFrom?: string;
      validUntil?: string;
      applicablePlans?: string[];
    } = {}
  ): Promise<PromoCode> {
    try {
      const promoCodeData = {
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_value: discountValue,
        currency: options.currency || 'inr',
        max_uses: options.maxUses,
        used_count: 0,
        valid_from: options.validFrom || new Date().toISOString(),
        valid_until: options.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        applicable_plans: options.applicablePlans || [],
        is_active: true
      };

      const { data, error } = await supabase
        .from('promo_codes')
        .insert(promoCodeData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating promo code:', error);
      throw error;
    }
  }

  /**
   * Validate promo code
   */
  async validatePromoCode(code: string, planId: string): Promise<PromoCode | null> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) return null;

      // Check if code is still valid
      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validUntil = new Date(data.valid_until);

      if (now < validFrom || now > validUntil) return null;

      // Check usage limit
      if (data.max_uses && data.used_count >= data.max_uses) return null;

      // Check if applicable to plan
      if (data.applicable_plans.length > 0 && !data.applicable_plans.includes(planId)) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error validating promo code:', error);
      return null;
    }
  }

  /**
   * Apply promo code to payment
   */
  async applyPromoCode(code: string, amount: number, currency: string): Promise<{
    discountedAmount: number;
    discount: number;
    promoCode: PromoCode;
  }> {
    try {
      const promoCode = await this.validatePromoCode(code, 'any');
      
      if (!promoCode) {
        throw new Error('Invalid promo code');
      }

      const discount = this.calculateDiscount(amount, promoCode);
      const discountedAmount = Math.max(0, amount - discount);

      return {
        discountedAmount,
        discount,
        promoCode
      };
    } catch (error) {
      console.error('Error applying promo code:', error);
      throw error;
    }
  }

  /**
   * Get user's payment methods
   */
  async getPaymentMethods(userId?: string): Promise<PaymentMethod[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = userId || user?.id;

      if (!currentUserId) return [];

      const { data, error } = await supabase.functions.invoke('get-payment-methods', {
        body: { user_id: currentUserId }
      });

      if (error) throw error;
      return data.payment_methods || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(paymentMethodId: string, isDefault: boolean = false): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('update-payment-method', {
        body: {
          payment_method_id: paymentMethodId,
          is_default: isDefault
        }
      });

      if (error) throw error;
      return data.success;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  /**
   * Get billing portal URL
   */
  async getBillingPortalUrl(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('billing-portal-sessions', {
        body: {
          user_id: user.id,
          return_url: `${window.location.origin}/subscription`
        }
      });

      if (error) throw error;
      return data.url;
    } catch (error) {
      console.error('Error getting billing portal URL:', error);
      throw error;
    }
  }

  /**
   * Calculate feature price based on duration
   */
  private calculateFeaturePrice(duration: number): number {
    const basePrice = 5000; // ₹50 base price
    const dailyRate = 100; // ₹1 per day
    return basePrice + (duration * dailyRate);
  }

  /**
   * Calculate discounted price
   */
  private calculateDiscountedPrice(originalPrice: number, promoCode: PromoCode): number {
    let discount = 0;

    if (promoCode.discount_type === 'percentage') {
      discount = (originalPrice * promoCode.discount_value) / 100;
    } else if (promoCode.discount_type === 'fixed_amount') {
      discount = promoCode.discount_value;
    }

    return Math.max(0, originalPrice - discount);
  }

  /**
   * Calculate discount amount
   */
  private calculateDiscount(amount: number, promoCode: PromoCode): number {
    if (promoCode.discount_type === 'percentage') {
      return (amount * promoCode.discount_value) / 100;
    } else if (promoCode.discount_type === 'fixed_amount') {
      return Math.min(promoCode.discount_value, amount);
    }
    return 0;
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId?: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    return subscription?.status === 'active';
  }

  /**
   * Get user's subscription features
   */
  async getUserFeatures(userId?: string): Promise<{
    canCreateEvents: boolean;
    maxEvents: number;
    canSellServices: boolean;
    maxServices: number;
    hasVerification: boolean;
    hasPrioritySupport: boolean;
    hasAnalytics: boolean;
  }> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      return {
        canCreateEvents: true,
        maxEvents: 3,
        canSellServices: false,
        maxServices: 0,
        hasVerification: false,
        hasPrioritySupport: false,
        hasAnalytics: false
      };
    }

    const plan = subscription.plan;
    
    return {
      canCreateEvents: true,
      maxEvents: plan?.max_events || -1,
      canSellServices: (plan?.max_services || 0) > 0,
      maxServices: plan?.max_services || 0,
      hasVerification: plan?.verification_included || false,
      hasPrioritySupport: plan?.priority_support || false,
      hasAnalytics: plan?.analytics_access || false
    };
  }
}

export const monetizationEnhanced = MonetizationEnhanced.getInstance();
