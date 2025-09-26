/**
 * Monetization Types
 * Type definitions for subscription and payment functionality
 */

export interface UserPlanInfo {
  is_premium: boolean;
  plan_type: 'free' | 'pro' | 'enterprise';
  can_create_services: boolean;
  can_feature_events: boolean;
  expires_at?: string;
  features: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  is_popular?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  created_at: string;
  due_date: string;
}
