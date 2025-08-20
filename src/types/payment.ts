export interface PaymentIntent {
  id: string;
  stripe_payment_intent_id: string;
  user_id: string;
  amount: number; // Amount in cents
  currency: string;
  status: PaymentIntentStatus;
  payment_method_types: string[];
  metadata: Record<string, any>;
  client_secret?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentIntentStatus = 
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

export interface Subscription {
  id: string;
  stripe_subscription_id: string;
  user_id: string;
  stripe_customer_id: string;
  status: SubscriptionStatus;
  plan_id: string;
  plan_name: string;
  plan_price: number; // Price in cents
  currency: string;
  interval: 'monthly' | 'yearly';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus = 
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

export interface PaymentMethod {
  id: string;
  stripe_payment_method_id: string;
  user_id: string;
  type: string;
  card_brand?: string;
  card_last4?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  billing_details: Record<string, any>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  stripe_charge_id?: string;
  payment_intent_id: string;
  user_id: string;
  amount: number; // Amount in cents
  currency: string;
  status: TransactionStatus;
  description?: string;
  metadata: Record<string, any>;
  fee_amount?: number; // Stripe fee in cents
  net_amount?: number; // Net amount after fees
  created_at: string;
  updated_at: string;
}

export type TransactionStatus = 
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'canceled';

export interface Refund {
  id: string;
  stripe_refund_id: string;
  transaction_id: string;
  amount: number; // Amount in cents
  currency: string;
  status: RefundStatus;
  reason?: RefundReason;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';
export type RefundReason = 'requested_by_customer' | 'duplicate' | 'fraudulent';

export interface BillingProfile {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  email?: string;
  name?: string;
  phone?: string;
  address: Record<string, any>;
  tax_exempt: string;
  preferred_locales: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ArtistPayout {
  id: string;
  artist_id: string;
  stripe_transfer_id?: string;
  transaction_id: string;
  amount: number; // Amount in cents
  currency: string;
  status: PayoutStatus;
  commission_amount: number; // Platform commission
  net_amount: number; // Amount after commission
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';

export interface EventTicket {
  id: string;
  event_id: string;
  user_id: string;
  transaction_id: string;
  ticket_type: string;
  price: number; // Price in cents
  quantity: number;
  qr_code: string;
  status: TicketStatus;
  used_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type TicketStatus = 'active' | 'used' | 'refunded' | 'canceled';

export interface BookingPayment {
  id: string;
  booking_id: string;
  payment_intent_id: string;
  transaction_id: string;
  amount: number; // Amount in cents
  currency: string;
  status: BookingPaymentStatus;
  commission_percentage: number;
  commission_amount: number; // Commission in cents
  net_amount: number; // Amount after commission
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type BookingPaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';

export interface PaymentFormData {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  payment_method_types?: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // Price in cents
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  stripe_price_id: string;
}

export interface PaymentError {
  code: string;
  message: string;
  type: 'validation_error' | 'card_error' | 'invalid_request_error' | 'api_error' | 'authentication_error';
  decline_code?: string;
  param?: string;
}

export interface PaymentSuccess {
  payment_intent_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: string;
  receipt_url?: string;
}

export interface PaymentAnalytics {
  total_revenue: number;
  total_transactions: number;
  average_transaction_value: number;
  success_rate: number;
  refund_rate: number;
  currency_breakdown: Record<string, number>;
  monthly_trends: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
}
