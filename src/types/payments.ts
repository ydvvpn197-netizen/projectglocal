/**
 * Type definitions for payments, Stripe, and related functionality
 */

import { Stripe } from '@stripe/stripe-js';

// =========================
// Stripe Types
// =========================

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  apiVersion: string;
  currency: string;
  supportedCountries: string[];
  supportedCurrencies: string[];
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  client_secret: string;
  payment_method_types: string[];
  created: number;
  description?: string;
  metadata: Record<string, string>;
  last_payment_error?: PaymentError;
  next_action?: NextAction;
  receipt_email?: string;
  setup_future_usage?: 'off_session' | 'on_session';
  shipping?: ShippingDetails;
  statement_descriptor?: string;
  statement_descriptor_suffix?: string;
  transfer_data?: TransferData;
  transfer_group?: string;
}

export type PaymentIntentStatus = 
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

export interface PaymentError {
  type: string;
  code: string;
  decline_code?: string;
  message: string;
  param?: string;
  payment_method?: PaymentMethod;
}

export interface NextAction {
  type: string;
  redirect_to_url?: RedirectToUrl;
  use_stripe_sdk?: UseStripeSdk;
}

export interface RedirectToUrl {
  return_url: string;
  url: string;
}

export interface UseStripeSdk {
  type: string;
  use_stripe_sdk: boolean;
}

export interface ShippingDetails {
  address: Address;
  name: string;
  carrier?: string;
  phone?: string;
  tracking_number?: string;
}

export interface Address {
  city?: string;
  country?: string;
  line1?: string;
  line2?: string;
  postal_code?: string;
  state?: string;
}

export interface TransferData {
  amount?: number;
  destination: string;
  transfer_group?: string;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  billing_details: BillingDetails;
  card?: CardDetails;
  customer?: string;
  livemode: boolean;
  metadata: Record<string, string>;
  sepa_debit?: SepaDebitDetails;
  sofort?: SofortDetails;
  ideal?: IdealDetails;
  bancontact?: BancontactDetails;
  giropay?: GiropayDetails;
  p24?: P24Details;
  eps?: EpsDetails;
  multibanco?: MultibancoDetails;
  alipay?: AlipayDetails;
  wechat_pay?: WechatPayDetails;
  boleto?: BoletoDetails;
  oxxo?: OxxoDetails;
  klarna?: KlarnaDetails;
  affirm?: AffirmDetails;
  us_bank_account?: UsBankAccountDetails;
  customer_balance?: CustomerBalanceDetails;
  au_becs_debit?: AuBecsDebitDetails;
  bacs_debit?: BacsDebitDetails;
  sepa_debit?: SepaDebitDetails;
  sofort?: SofortDetails;
  ideal?: IdealDetails;
  bancontact?: BancontactDetails;
  giropay?: GiropayDetails;
  p24?: P24Details;
  eps?: EpsDetails;
  multibanco?: MultibancoDetails;
  alipay?: AlipayDetails;
  wechat_pay?: WechatPayDetails;
  boleto?: BoletoDetails;
  oxxo?: OxxoDetails;
  klarna?: KlarnaDetails;
  affirm?: AffirmDetails;
  us_bank_account?: UsBankAccountDetails;
  customer_balance?: CustomerBalanceDetails;
  au_becs_debit?: AuBecsDebitDetails;
  bacs_debit?: BacsDebitDetails;
}

export type PaymentMethodType = 
  | 'card'
  | 'sepa_debit'
  | 'sofort'
  | 'ideal'
  | 'bancontact'
  | 'giropay'
  | 'p24'
  | 'eps'
  | 'multibanco'
  | 'alipay'
  | 'wechat_pay'
  | 'boleto'
  | 'oxxo'
  | 'klarna'
  | 'affirm'
  | 'us_bank_account'
  | 'customer_balance'
  | 'au_becs_debit'
  | 'bacs_debit';

export interface BillingDetails {
  address?: Address;
  email?: string;
  name?: string;
  phone?: string;
}

export interface CardDetails {
  brand: string;
  country?: string;
  exp_month: number;
  exp_year: number;
  fingerprint?: string;
  funding: string;
  last4: string;
  networks?: CardNetworks;
  three_d_secure_usage?: ThreeDSecureUsage;
  wallet?: CardWallet;
}

export interface CardNetworks {
  available: string[];
  preferred?: string;
}

export interface ThreeDSecureUsage {
  supported: boolean;
}

export interface CardWallet {
  type: string;
  dynamic_last4?: string;
}

export interface SepaDebitDetails {
  bank_code?: string;
  branch_code?: string;
  country?: string;
  fingerprint?: string;
  last4?: string;
  mandate_reference?: string;
  mandate_url?: string;
}

export interface SofortDetails {
  bank_code?: string;
  bank_name?: string;
  bic?: string;
  country?: string;
  iban_last4?: string;
  preferred_language?: string;
  statement_descriptor?: string;
}

export interface IdealDetails {
  bank?: string;
  bic?: string;
  country?: string;
  iban_last4?: string;
  statement_descriptor?: string;
}

export interface BancontactDetails {
  bank_code?: string;
  bank_name?: string;
  bic?: string;
  country?: string;
  iban_last4?: string;
  preferred_language?: string;
  statement_descriptor?: string;
}

export interface GiropayDetails {
  bank_code?: string;
  bank_name?: string;
  bic?: string;
  country?: string;
  iban_last4?: string;
  preferred_language?: string;
  statement_descriptor?: string;
}

export interface P24Details {
  bank?: string;
  country?: string;
  reference?: string;
  statement_descriptor?: string;
}

export interface EpsDetails {
  bank?: string;
  country?: string;
  statement_descriptor?: string;
}

export interface MultibancoDetails {
  entity?: string;
  reference?: string;
  statement_descriptor?: string;
}

export interface AlipayDetails {
  buyer_id?: string;
  fingerprint?: string;
  transaction_id?: string;
}

export interface WechatPayDetails {
  fingerprint?: string;
  transaction_id?: string;
}

export interface BoletoDetails {
  fingerprint?: string;
  hosted_voucher_url?: string;
  pdf?: string;
  reference?: string;
  statement_descriptor?: string;
}

export interface OxxoDetails {
  fingerprint?: string;
  hosted_voucher_url?: string;
  number?: string;
  statement_descriptor?: string;
}

export interface KlarnaDetails {
  payment_method_category?: string;
  preferred_locale?: string;
}

export interface AffirmDetails {
  payment_method_category?: string;
}

export interface UsBankAccountDetails {
  account_holder_type?: string;
  account_type?: string;
  bank_name?: string;
  fingerprint?: string;
  last4?: string;
  routing_number?: string;
}

export interface CustomerBalanceDetails {
  type: string;
}

export interface AuBecsDebitDetails {
  fingerprint?: string;
  last4?: string;
  routing_number?: string;
}

export interface BacsDebitDetails {
  fingerprint?: string;
  last4?: string;
  routing_number?: string;
  sort_code?: string;
}

// =========================
// Subscription Types
// =========================

export interface Subscription {
  id: string;
  customer_id: string;
  status: SubscriptionStatus;
  current_period_start: number;
  current_period_end: number;
  created: number;
  canceled_at?: number;
  cancel_at_period_end: boolean;
  current_period_end_timestamp: number;
  default_payment_method?: string;
  default_source?: string;
  default_tax_rates: TaxRate[];
  discount?: Discount;
  items: SubscriptionItem[];
  latest_invoice?: string;
  livemode: boolean;
  metadata: Record<string, string>;
  next_pending_invoice_item_invoice_timestamp?: number;
  pause_collection?: PauseCollection;
  pending_invoice_item_interval?: PendingInvoiceItemInterval;
  pending_setup_intent?: string;
  pending_update?: PendingUpdate;
  quantity?: number;
  schedule?: string;
  start_date: number;
  status_transitions: StatusTransitions;
  transfer_data?: TransferData;
  trial_end?: number;
  trial_start?: number;
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

export interface TaxRate {
  id: string;
  object: string;
  active: boolean;
  country?: string;
  created: number;
  description?: string;
  display_name: string;
  inclusive: boolean;
  jurisdiction?: string;
  livemode: boolean;
  metadata: Record<string, string>;
  percentage: number;
  state?: string;
  tax_type?: string;
}

export interface Discount {
  id: string;
  object: string;
  coupon: Coupon;
  customer?: string;
  end?: number;
  invoice?: string;
  invoice_item?: string;
  promotion_code?: string;
  start: number;
  subscription?: string;
  subscription_item?: string;
}

export interface Coupon {
  id: string;
  object: string;
  amount_off?: number;
  created: number;
  currency?: string;
  duration: string;
  duration_in_months?: number;
  livemode: boolean;
  max_redemptions?: number;
  metadata: Record<string, string>;
  name?: string;
  percent_off?: number;
  redeem_by?: number;
  times_redeemed: number;
  valid: boolean;
}

export interface SubscriptionItem {
  id: string;
  object: string;
  billing_thresholds?: BillingThresholds;
  created: number;
  metadata: Record<string, string>;
  price: Price;
  quantity?: number;
  subscription: string;
  tax_rates: TaxRate[];
}

export interface BillingThresholds {
  amount_gte?: number;
  reset_billing_cycle_anchor?: boolean;
}

export interface Price {
  id: string;
  object: string;
  active: boolean;
  billing_scheme: string;
  created: number;
  currency: string;
  custom_unit_amount?: number;
  livemode: boolean;
  lookup_key?: string;
  metadata: Record<string, string>;
  nickname?: string;
  product: string;
  recurring?: Recurring;
  tax_behavior?: string;
  tiers?: PriceTier[];
  tiers_mode?: string;
  transform_quantity?: TransformQuantity;
  type: string;
  unit_amount?: number;
  unit_amount_decimal?: string;
}

export interface Recurring {
  aggregate_usage?: string;
  interval: string;
  interval_count: number;
  usage_type: string;
}

export interface PriceTier {
  flat_amount?: number;
  flat_amount_decimal?: string;
  unit_amount?: number;
  unit_amount_decimal?: string;
  up_to?: number;
}

export interface TransformQuantity {
  divide_by: number;
  round: string;
}

export interface PauseCollection {
  behavior: string;
  pause_until?: number;
}

export interface PendingInvoiceItemInterval {
  interval: string;
  interval_count: number;
}

export interface PendingUpdate {
  billing_cycle_anchor?: number;
  collection_method?: string;
  default_payment_method?: string;
  default_source?: string;
  default_tax_rates?: TaxRate[];
  items?: SubscriptionItem[];
  pause_collection?: PauseCollection;
  proration_behavior?: string;
  proration_date?: number;
  transfer_data?: TransferData;
  trial_end?: number;
  trial_from_plan?: boolean;
}

export interface StatusTransitions {
  canceled_at?: number;
  completed_at?: number;
  created: number;
  current_period_start: number;
  current_period_end: number;
  ended_at?: number;
  trial_start?: number;
  trial_end?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  trial_period_days?: number;
  metadata: Record<string, string>;
  features: PlanFeature[];
  is_popular?: boolean;
  is_enterprise?: boolean;
  max_users?: number;
  max_projects?: number;
  max_storage_gb?: number;
  support_level: 'basic' | 'priority' | 'dedicated';
}

export interface PlanFeature {
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  unit?: string;
}

// =========================
// Checkout & Billing Types
// =========================

export interface CheckoutSession {
  id: string;
  object: string;
  amount_subtotal: number;
  amount_total: number;
  currency: string;
  customer?: string;
  customer_email?: string;
  livemode: boolean;
  locale?: string;
  metadata: Record<string, string>;
  mode: string;
  payment_intent?: string;
  payment_method_types: string[];
  payment_status: string;
  setup_intent?: string;
  shipping?: ShippingDetails;
  submit_type?: string;
  subscription?: string;
  success_url: string;
  cancel_url: string;
  url?: string;
}

export interface BillingPortalSession {
  id: string;
  object: string;
  created: number;
  customer: string;
  livemode: boolean;
  return_url: string;
  url: string;
}

// =========================
// Payment Form Types
// =========================

export interface PaymentFormData {
  amount: number;
  currency: string;
  description?: string;
  customer_id?: string;
  payment_method_id?: string;
  confirm?: boolean;
  capture_method?: 'automatic' | 'manual';
  confirmation_method?: 'automatic' | 'manual';
  off_session?: boolean;
  setup_future_usage?: 'off_session' | 'on_session';
  metadata?: Record<string, string>;
  receipt_email?: string;
  statement_descriptor?: string;
  statement_descriptor_suffix?: string;
  transfer_data?: TransferData;
  transfer_group?: string;
}

export interface StripeConfirmPaymentOptions {
  payment_method?: string;
  return_url?: string;
  setup_future_usage?: 'off_session' | 'on_session';
  off_session?: boolean;
  payment_method_data?: {
    type: string;
    billing_details?: BillingDetails;
    card?: {
      token?: string;
    };
  };
  shipping?: ShippingDetails;
  receipt_email?: string;
  statement_descriptor?: string;
  statement_descriptor_suffix?: string;
}

// =========================
// Error & Response Types
// =========================

export interface StripeError {
  type: string;
  code: string;
  decline_code?: string;
  message: string;
  param?: string;
  request_id?: string;
  payment_intent?: PaymentIntent;
  payment_method?: PaymentMethod;
  setup_intent?: Record<string, unknown>;
  source?: Record<string, unknown>;
}

export interface StripeResponse<T> {
  data: T;
  has_more: boolean;
  object: string;
  total_count?: number;
  url: string;
}

export interface StripeWebhookEvent {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    object: Record<string, unknown>;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id?: string;
    idempotency_key?: string;
  };
  type: string;
}

// =========================
// Utility Types
// =========================

export interface PaymentMethodOptions {
  card?: {
    request_three_d_secure?: 'automatic' | 'any' | 'challenge';
  };
  sepa_debit?: {
    mandate_options?: {
      reference: string;
      interval: 'one_time' | 'recurring';
      interval_count: number;
      supported_types: string[];
    };
  };
  sofort?: {
    preferred_language?: string;
  };
  ideal?: {
    preferred_language?: string;
  };
  bancontact?: {
    preferred_language?: string;
  };
  giropay?: {
    preferred_language?: string;
  };
  p24?: {
    tos_shown_and_accepted?: boolean;
  };
  eps?: {
    preferred_language?: string;
  };
  multibanco?: {
    reference?: string;
  };
  alipay?: {
    preferred_language?: string;
  };
  wechat_pay?: {
    app_id?: string;
  };
  boleto?: {
    expires_after_days?: number;
    request_three_d_secure?: 'automatic' | 'any' | 'challenge';
  };
  oxxo?: {
    expires_after_days?: number;
  };
  klarna?: {
    preferred_locale?: string;
  };
  affirm?: {
    preferred_locale?: string;
  };
  us_bank_account?: {
    financial_connections?: {
      permissions: string[];
    };
  };
  customer_balance?: {
    funding_type?: 'bank_transfer' | 'card';
    bank_transfer?: {
      type: 'us_bank_account' | 'eu_bank_transfer' | 'gb_bank_transfer' | 'jp_bank_transfer' | 'mx_bank_transfer' | 'au_bank_transfer' | 'ca_bank_transfer';
      eu_bank_transfer?: {
        country: string;
      };
      gb_bank_transfer?: {
        account_holder_type?: 'individual' | 'company';
        sort_code?: string;
      };
      jp_bank_transfer?: {
        bank?: string;
        branch_code?: string;
      };
      mx_bank_transfer?: {
        bank?: string;
      };
      au_bank_transfer?: {
        bank?: string;
        branch_code?: string;
      };
      ca_bank_transfer?: {
        bank?: string;
        branch_code?: string;
        institution_number?: string;
        transit_number?: string;
      };
    };
  };
  au_becs_debit?: {
    account_number: string;
    bsb_number: string;
  };
  bacs_debit?: {
    account_number: string;
    sort_code: string;
  };
  sepa_debit?: {
    iban: string;
  };
  sofort?: {
    country: string;
  };
  ideal?: {
    bank?: string;
  };
  bancontact?: {
    country: string;
  };
  giropay?: {
    country: string;
  };
  p24?: {
    country: string;
  };
  eps?: {
    country: string;
  };
  multibanco?: {
    country: string;
  };
  alipay?: {
    country: string;
  };
  wechat_pay?: {
    country: string;
  };
  boleto?: {
    country: string;
  };
  oxxo?: {
    country: string;
  };
  klarna?: {
    country: string;
  };
  affirm?: {
    country: string;
  };
  us_bank_account?: {
    country: string;
  };
  customer_balance?: {
    country: string;
  };
  au_becs_debit?: {
    country: string;
  };
  bacs_debit?: {
    country: string;
  };
}
