// Stripe-specific types for payment integration

export interface StripePaymentIntent {
  id: string;
  object: 'payment_intent';
  amount: number;
  amount_capturable: number;
  amount_details: {
    tip: {
      amount: number;
    };
  };
  amount_received: number;
  application: string | null;
  application_fee_amount: number | null;
  automatic_payment_methods: {
    allow_redirects: string;
    enabled: boolean;
  } | null;
  canceled_at: number | null;
  cancellation_reason: string | null;
  capture_method: string;
  charges: {
    object: string;
    data: StripeCharge[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: string | null;
  description: string | null;
  invoice: string | null;
  last_payment_error: StripePaymentError | null;
  latest_charge: string | null;
  livemode: boolean;
  metadata: Record<string, string>;
  next_action: StripeNextAction | null;
  on_behalf_of: string | null;
  payment_method: string | null;
  payment_method_options: Record<string, any>;
  payment_method_types: string[];
  processing: StripeProcessing | null;
  receipt_email: string | null;
  review: string | null;
  setup_future_usage: string | null;
  shipping: StripeShipping | null;
  source: string | null;
  statement_descriptor: string | null;
  statement_descriptor_suffix: string | null;
  status: string;
  transfer_data: StripeTransferData | null;
  transfer_group: string | null;
}

export interface StripeCharge {
  id: string;
  object: 'charge';
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  application: string | null;
  application_fee: string | null;
  application_fee_amount: number | null;
  balance_transaction: string | null;
  billing_details: StripeBillingDetails;
  calculated_statement_descriptor: string | null;
  captured: boolean;
  created: number;
  currency: string;
  customer: string | null;
  description: string | null;
  destination: string | null;
  dispute: string | null;
  disputed: boolean;
  failure_balance_transaction: string | null;
  failure_code: string | null;
  failure_message: string | null;
  fraud_details: Record<string, any>;
  invoice: string | null;
  livemode: boolean;
  metadata: Record<string, string>;
  on_behalf_of: string | null;
  order: string | null;
  outcome: StripeOutcome | null;
  paid: boolean;
  payment_intent: string | null;
  payment_method: string | null;
  payment_method_details: StripePaymentMethodDetails;
  receipt_email: string | null;
  receipt_number: string | null;
  receipt_url: string | null;
  refunded: boolean;
  refunds: {
    object: string;
    data: StripeRefund[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  review: string | null;
  shipping: StripeShipping | null;
  source: string | null;
  source_transfer: string | null;
  statement_descriptor: string | null;
  statement_descriptor_suffix: string | null;
  status: string;
  transfer: string | null;
  transfer_data: StripeTransferData | null;
  transfer_group: string | null;
}

export interface StripePaymentMethod {
  id: string;
  object: 'payment_method';
  billing_details: StripeBillingDetails;
  card: StripeCard | null;
  created: number;
  customer: string | null;
  livemode: boolean;
  metadata: Record<string, string>;
  type: string;
}

export interface StripeCard {
  brand: string;
  checks: {
    address_line1_check: string | null;
    address_postal_code_check: string | null;
    cvc_check: string | null;
  };
  country: string;
  exp_month: number;
  exp_year: number;
  fingerprint: string;
  funding: string;
  generated_from: string | null;
  last4: string;
  networks: {
    available: string[];
    preferred: string | null;
  };
  three_d_secure_usage: {
    supported: boolean;
  };
  wallet: string | null;
}

export interface StripeBillingDetails {
  address: {
    city: string | null;
    country: string | null;
    line1: string | null;
    line2: string | null;
    postal_code: string | null;
    state: string | null;
  };
  email: string | null;
  name: string | null;
  phone: string | null;
}

export interface StripePaymentError {
  code: string;
  decline_code: string | null;
  doc_url: string | null;
  message: string;
  param: string | null;
  payment_method: StripePaymentMethod | null;
  type: string;
}

export interface StripeNextAction {
  redirect_to_url: {
    return_url: string | null;
    url: string;
  } | null;
  type: string;
  use_stripe_sdk: {
    type: string;
  } | null;
}

export interface StripeProcessing {
  type: string;
}

export interface StripeShipping {
  address: {
    city: string | null;
    country: string | null;
    line1: string | null;
    line2: string | null;
    postal_code: string | null;
    state: string | null;
  };
  carrier: string | null;
  name: string;
  phone: string | null;
  tracking_number: string | null;
}

export interface StripeTransferData {
  amount: number | null;
  destination: string;
}

export interface StripeOutcome {
  network_status: string;
  reason: string | null;
  risk_level: string;
  risk_score: number;
  seller_message: string;
  type: string;
}

export interface StripePaymentMethodDetails {
  card: {
    brand: string;
    checks: {
      address_line1_check: string | null;
      address_postal_code_check: string | null;
      cvc_check: string | null;
    };
    country: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    installments: number | null;
    last4: string;
    mandate: string | null;
    network: string;
    three_d_secure: {
      authentication_flow: string | null;
      result: string | null;
      result_reason: string | null;
      version: string | null;
    } | null;
    wallet: string | null;
  } | null;
  type: string;
}

export interface StripeRefund {
  id: string;
  object: 'refund';
  amount: number;
  balance_transaction: string | null;
  charge: string;
  created: number;
  currency: string;
  description: string | null;
  failure_balance_transaction: string | null;
  failure_reason: string | null;
  metadata: Record<string, string>;
  next_action: StripeNextAction | null;
  payment_intent: string | null;
  reason: string | null;
  receipt_number: string | null;
  source_transfer_reversal: string | null;
  status: string;
  transfer_reversal: string | null;
}

export interface StripeCustomer {
  id: string;
  object: 'customer';
  address: {
    city: string | null;
    country: string | null;
    line1: string | null;
    line2: string | null;
    postal_code: string | null;
    state: string | null;
  } | null;
  balance: number;
  created: number;
  currency: string | null;
  default_source: string | null;
  delinquent: boolean;
  description: string | null;
  discount: string | null;
  email: string | null;
  invoice_prefix: string;
  invoice_settings: {
    custom_fields: any[] | null;
    default_payment_method: string | null;
    footer: string | null;
    rendering_options: any | null;
  };
  livemode: boolean;
  metadata: Record<string, string>;
  name: string | null;
  next_invoice_sequence: number;
  phone: string | null;
  preferred_locales: string[];
  shipping: StripeShipping | null;
  tax_exempt: string;
  test_clock: string | null;
}

export interface StripeSubscription {
  id: string;
  object: 'subscription';
  application: string | null;
  application_fee_percent: number | null;
  automatic_tax: {
    enabled: boolean;
  };
  billing_cycle_anchor: number;
  billing_thresholds: string | null;
  cancel_at: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  cancellation_details: {
    comment: string | null;
    feedback: string | null;
    reason: string | null;
  } | null;
  collection_method: string;
  created: number;
  current_period_end: number;
  current_period_start: number;
  customer: string;
  days_until_due: number | null;
  default_payment_method: string | null;
  default_source: string | null;
  default_tax_rates: any[];
  discount: string | null;
  ended_at: number | null;
  items: {
    object: string;
    data: StripeSubscriptionItem[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  latest_invoice: string | null;
  livemode: boolean;
  metadata: Record<string, string>;
  next_pending_invoice_item_invoice: number | null;
  pause_collection: string | null;
  pending_invoice_item_interval: string | null;
  pending_setup_intent: string | null;
  pending_update: string | null;
  quantity: number | null;
  schedule: string | null;
  start_date: number;
  status: string;
  transfer_data: StripeTransferData | null;
  trial_end: number | null;
  trial_start: number | null;
}

export interface StripeSubscriptionItem {
  id: string;
  object: 'subscription_item';
  billing_thresholds: string | null;
  created: number;
  metadata: Record<string, string>;
  price: {
    id: string;
    object: 'price';
    active: boolean;
    billing_scheme: string;
    created: number;
    currency: string;
    custom_unit_amount: string | null;
    livemode: boolean;
    lookup_key: string | null;
    metadata: Record<string, string>;
    nickname: string | null;
    product: string;
    recurring: {
      aggregate_usage: string | null;
      interval: string;
      interval_count: number;
      trial_period_days: number | null;
      usage_type: string;
    } | null;
    tax_behavior: string;
    tiers_mode: string | null;
    transform_quantity: string | null;
    type: string;
    unit_amount: number | null;
    unit_amount_decimal: string | null;
  };
  quantity: number | null;
  subscription: string;
  tax_rates: any[];
}

export interface StripeWebhookEvent {
  id: string;
  object: 'event';
  api_version: string;
  created: number;
  data: {
    object: StripePaymentIntent | StripeCharge | StripeCustomer | StripeSubscription | any;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string | null;
    idempotency_key: string | null;
  };
  type: string;
}

// @ts-nocheck
export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  apiVersion: string;
}

export interface StripeElementsOptions {
  clientSecret?: string;
  appearance?: {
    theme?: 'stripe' | 'night';
    variables?: {
      colorPrimary?: string;
      colorBackground?: string;
      colorText?: string;
      colorDanger?: string;
      fontFamily?: string;
      spacingUnit?: string;
      borderRadius?: string;
    };
    rules?: Record<string, any>;
  };
  loader?: 'auto' | 'always' | 'never';
  locale?: string;
}

export interface StripeConfirmPaymentOptions {
  payment_method?: string;
  payment_method_data?: {
    billing_details?: StripeBillingDetails;
    type?: string;
  };
  return_url?: string;
  setup_future_usage?: 'off_session' | 'on_session';
  shipping?: StripeShipping;
  use_stripe_sdk?: boolean;
}
