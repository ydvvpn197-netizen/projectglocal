// Monetization types for the platform

export type PlanType = 'free' | 'verified' | 'premium';
export type PaymentType = 'verification' | 'premium_subscription' | 'event_feature' | 'service_purchase';
export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled' | 'requires_action';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';

// User profile with monetization fields
export interface MonetizedUserProfile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_premium: boolean;
  plan_type: PlanType;
  stripe_customer_id: string | null;
  premium_expires_at: string | null;
  verification_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// Service interface for premium users
export interface Service {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number; // Price in cents
  currency: string;
  category: string | null;
  availability_schedule: Record<string, any>;
  is_active: boolean;
  max_bookings_per_day: number;
  requires_approval: boolean;
  cancellation_policy: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Joined fields
  provider?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    is_premium: boolean;
  };
}

// Service booking interface
export interface ServiceBooking {
  id: string;
  service_id: string;
  customer_id: string;
  provider_id: string;
  booking_date: string;
  duration_minutes: number;
  total_amount: number; // Amount in cents
  currency: string;
  status: BookingStatus;
  payment_intent_id: string | null;
  payment_status: PaymentStatus;
  notes: string | null;
  customer_notes: string | null;
  provider_notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Joined fields
  service?: Service;
  customer?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  provider?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

// Subscription interface
export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Payment interface
export interface Payment {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  amount: number; // Amount in cents
  currency: string;
  status: PaymentStatus;
  payment_type: PaymentType;
  description: string | null;
  metadata: Record<string, any>;
  related_id: string | null;
  related_type: string | null;
  created_at: string;
  updated_at: string;
}

// Service review interface
export interface ServiceReview {
  id: string;
  booking_id: string;
  service_id: string;
  customer_id: string;
  provider_id: string;
  rating: number; // 1-5
  review_text: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  service?: {
    id: string;
    title: string;
  };
}

// Featured event interface (extends posts)
export interface FeaturedEvent {
  id: string;
  user_id: string;
  type: 'event';
  title: string;
  content: string;
  is_featured: boolean;
  featured_until: string | null;
  featured_price: number | null;
  stripe_payment_intent_id: string | null;
  event_date: string | null;
  event_location: string | null;
  price_range: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    is_premium: boolean;
  };
}

// Checkout session configuration
export interface CheckoutSessionConfig {
  type: PaymentType;
  userId: string;
  eventId?: string;
  serviceId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

// Payment result
export interface PaymentResult {
  success: boolean;
  sessionId?: string;
  error?: string;
  url?: string;
}

// Service creation/update data
export interface ServiceData {
  title: string;
  description: string;
  price: number; // Price in cents
  currency?: string;
  category?: string;
  availability_schedule?: Record<string, any>;
  max_bookings_per_day?: number;
  requires_approval?: boolean;
  cancellation_policy?: string;
  metadata?: Record<string, any>;
}

// Service booking data
export interface ServiceBookingData {
  service_id: string;
  booking_date: string;
  duration_minutes?: number;
  notes?: string;
  customer_notes?: string;
}

// Service review data
export interface ServiceReviewData {
  booking_id: string;
  rating: number;
  review_text?: string;
  is_public?: boolean;
}

// Pricing configuration
export interface PricingConfig {
  verification: {
    amount: number;
    currency: string;
    description: string;
    interval: 'month' | 'year';
  };
  premium: {
    amount: number;
    currency: string;
    description: string;
    interval: 'month' | 'year';
  };
  eventFeature: {
    amount: number;
    currency: string;
    description: string;
    duration_days: number;
  };
}

// User plan information
export interface UserPlanInfo {
  plan_type: PlanType;
  is_verified: boolean;
  is_premium: boolean;
  premium_expires_at: string | null;
  verification_expires_at: string | null;
  can_create_services: boolean;
  can_feature_events: boolean;
  max_services: number;
  max_featured_events: number;
}

// Service statistics
export interface ServiceStats {
  total_services: number;
  active_services: number;
  total_bookings: number;
  completed_bookings: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
}

// Payment statistics
export interface PaymentStats {
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  total_revenue: number;
  verification_payments: number;
  premium_payments: number;
  event_feature_payments: number;
  service_payments: number;
}
