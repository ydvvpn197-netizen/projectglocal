export interface BillingProfile {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  email?: string;
  name?: string;
  phone?: string;
  address: BillingAddress;
  tax_exempt: TaxExemptStatus;
  preferred_locales: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export type TaxExemptStatus = 'none' | 'exempt' | 'reverse';

export interface Invoice {
  id: string;
  stripe_invoice_id: string;
  customer_id: string;
  subscription_id?: string;
  amount_due: number; // Amount in cents
  amount_paid: number; // Amount in cents
  amount_remaining: number; // Amount in cents
  currency: string;
  status: InvoiceStatus;
  billing_reason: BillingReason;
  collection_method: CollectionMethod;
  due_date?: string;
  period_start: string;
  period_end: string;
  subtotal: number; // Amount in cents
  tax: number; // Amount in cents
  total: number; // Amount in cents
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
export type BillingReason = 'subscription_cycle' | 'subscription_create' | 'subscription_update' | 'subscription_threshold' | 'manual' | 'upcoming';
export type CollectionMethod = 'charge_automatically' | 'send_invoice';

export interface InvoiceItem {
  id: string;
  stripe_invoice_item_id: string;
  invoice_id: string;
  amount: number; // Amount in cents
  currency: string;
  description?: string;
  quantity?: number;
  unit_amount?: number; // Amount in cents
  unit_amount_decimal?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface BillingPortalSession {
  id: string;
  stripe_portal_session_id: string;
  customer_id: string;
  return_url: string;
  url: string;
  created_at: string;
}

export interface CheckoutSession {
  id: string;
  stripe_checkout_session_id: string;
  customer_id?: string;
  payment_intent_id?: string;
  subscription_id?: string;
  mode: CheckoutMode;
  success_url: string;
  cancel_url: string;
  amount_total?: number; // Amount in cents
  currency: string;
  status: CheckoutStatus;
  payment_status: PaymentStatus;
  customer_email?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type CheckoutMode = 'payment' | 'setup' | 'subscription';
export type CheckoutStatus = 'open' | 'complete' | 'expired';
export type PaymentStatus = 'no_payment_required' | 'paid' | 'unpaid';

export interface BillingMetrics {
  total_revenue: number;
  monthly_recurring_revenue: number;
  annual_recurring_revenue: number;
  average_revenue_per_user: number;
  churn_rate: number;
  customer_lifetime_value: number;
  subscription_count: number;
  active_subscriptions: number;
  canceled_subscriptions: number;
  revenue_by_plan: Record<string, number>;
  revenue_by_period: Array<{
    period: string;
    revenue: number;
    subscriptions: number;
  }>;
}

export interface BillingSettings {
  default_currency: string;
  supported_currencies: string[];
  tax_rates: TaxRate[];
  invoice_settings: InvoiceSettings;
  subscription_settings: SubscriptionSettings;
  payment_settings: PaymentSettings;
}

export interface TaxRate {
  id: string;
  stripe_tax_rate_id: string;
  display_name: string;
  description?: string;
  percentage: number;
  inclusive: boolean;
  country?: string;
  state?: string;
  jurisdiction?: string;
  created_at: string;
}

export interface InvoiceSettings {
  default_payment_method?: string;
  custom_fields: InvoiceCustomField[];
  footer?: string;
  rendering_options?: {
    amount_tax_display?: 'include_tax' | 'exclude_tax';
  };
}

export interface InvoiceCustomField {
  name: string;
  value: string;
}

export interface SubscriptionSettings {
  proration_behavior: 'create_prorations' | 'none';
  default_payment_method?: string;
  collection_method: CollectionMethod;
  days_until_due?: number;
  trial_period_days?: number;
}

export interface PaymentSettings {
  payment_method_types: string[];
  save_default_payment_method: 'off' | 'on_subscription';
  payment_method_options: Record<string, unknown>;
}

export interface BillingWebhookEvent {
  id: string;
  type: BillingWebhookEventType;
  data: {
    object: Invoice | CheckoutSession | Record<string, unknown>;
  };
  created: number;
  livemode: boolean;
}

export type BillingWebhookEventType = 
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'invoice.payment_action_required'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'checkout.session.completed'
  | 'checkout.session.expired';
