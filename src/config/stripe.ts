import { loadStripe } from '@stripe/stripe-js';

// Stripe configuration
export const STRIPE_CONFIG = {
  // Pricing configuration - Updated for Indian market
  PRICING: {
    NORMAL_USER: {
      amount: 2000, // ₹20 in paise (Indian currency)
      currency: 'inr',
      description: 'Normal User Pro Subscription',
      interval: 'month' as const,
    },
    ARTIST_USER: {
      amount: 10000, // ₹100 in paise (Indian currency)
      currency: 'inr',
      description: 'Artist Pro Subscription',
      interval: 'month' as const,
    },
    EVENT_FEATURE: {
      amount: 5000, // ₹50 in paise for featuring events
      currency: 'inr',
      description: 'Featured Event Listing',
      duration_days: 30, // Featured for 30 days
    },
    // Legacy pricing for backward compatibility
    VERIFICATION: {
      amount: 2000, // ₹20 in paise
      currency: 'inr',
      description: 'User Verification Subscription',
      interval: 'month' as const,
    },
    PREMIUM: {
      amount: 10000, // ₹100 in paise
      currency: 'inr',
      description: 'Premium Plan Subscription',
      interval: 'month' as const,
    },
  },
  
  // Stripe keys
  PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  SECRET_KEY: import.meta.env.STRIPE_SECRET_KEY,
  WEBHOOK_SECRET: import.meta.env.STRIPE_WEBHOOK_SECRET,
  
  // Webhook events to handle
  WEBHOOK_EVENTS: [
    'checkout.session.completed',
    'invoice.paid',
    'invoice.payment_failed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
  ],
} as const;

// Initialize Stripe
export const stripePromise = loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY);

// Payment types
export type PaymentType = 'verification' | 'premium_subscription' | 'event_feature' | 'service_purchase';

export type PlanType = 'free' | 'verified' | 'premium';

// Stripe checkout session configuration
export interface CheckoutSessionConfig {
  type: PaymentType;
  userId: string;
  eventId?: string;
  serviceId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

// Payment result interface
export interface PaymentResult {
  success: boolean;
  sessionId?: string;
  error?: string;
  url?: string;
}

// Subscription status
export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'past_due' 
  | 'trialing' 
  | 'unpaid';

// Payment status
export type PaymentStatus = 
  | 'pending' 
  | 'succeeded' 
  | 'failed' 
  | 'canceled' 
  | 'requires_action';

// Service booking status
export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled' 
  | 'refunded';

// Validation functions
export const validateStripeConfig = (): boolean => {
  // Skip validation in test mode
  if (import.meta.env.MODE === 'test') {
    return true;
  }
  
  if (!STRIPE_CONFIG.PUBLISHABLE_KEY) {
    console.error('Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable');
    return false;
  }
  return true;
};

export const getStripeAmount = (type: PaymentType): number => {
  switch (type) {
    case 'verification':
      return STRIPE_CONFIG.PRICING.VERIFICATION.amount;
    case 'premium_subscription':
      return STRIPE_CONFIG.PRICING.PREMIUM.amount;
    case 'event_feature':
      return STRIPE_CONFIG.PRICING.EVENT_FEATURE.amount;
    case 'service_purchase':
      // Service purchase amount is dynamic based on service
      return 0;
    default:
      return 0;
  }
};

export const getStripeDescription = (type: PaymentType): string => {
  switch (type) {
    case 'verification':
      return STRIPE_CONFIG.PRICING.VERIFICATION.description;
    case 'premium_subscription':
      return STRIPE_CONFIG.PRICING.PREMIUM.description;
    case 'event_feature':
      return STRIPE_CONFIG.PRICING.EVENT_FEATURE.description;
    case 'service_purchase':
      return 'Service Purchase';
    default:
      return 'Payment';
  }
};
