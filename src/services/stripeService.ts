import { supabase } from '../integrations/supabase/client';
import { 
  PaymentIntent, 
  PaymentFormData, 
  PaymentSuccess, 
  PaymentError,
  Subscription,
  SubscriptionPlan
} from '../types/payment';
import { 
  StripePaymentIntent, 
  StripeConfig, 
  StripeWebhookEvent,
  StripeCustomer,
  StripeSubscription
} from '../types/stripe';

export class StripeService {
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    this.config = config;
  }

  /**
   * Create a payment intent directly with Stripe
   */
  async createStripePaymentIntent(data: PaymentFormData): Promise<StripePaymentIntent> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get or create customer
      const customer = await this.getOrCreateCustomer(user.id, user.email || '');

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          customer_id: customer.stripe_customer_id,
          description: data.description,
          metadata: data.metadata,
          payment_method_types: data.payment_method_types || ['card']
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const paymentIntent = await response.json();
      return paymentIntent;
    } catch (error) {
      console.error('Error creating Stripe payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment intent with Stripe
   */
  async confirmStripePayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentSuccess> {
    try {
      const response = await fetch('/api/stripe/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          payment_method_id: paymentMethodId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment confirmation failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error confirming Stripe payment:', error);
      throw error;
    }
  }

  /**
   * Get or create a Stripe customer
   */
  async getOrCreateCustomer(userId: string, email: string): Promise<StripeCustomer> {
    try {
      // Check if customer exists in database
      const { data: existingCustomer, error: fetchError } = await supabase
        .from('billing_profiles')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (existingCustomer?.stripe_customer_id) {
        // Get customer from Stripe
        const response = await fetch(`/api/stripe/customers/${existingCustomer.stripe_customer_id}`);
        if (response.ok) {
          return await response.json();
        }
      }

      // Create new customer
      const response = await fetch('/api/stripe/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          email: email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      const customer = await response.json();

      // Save customer ID to database
      await supabase
        .from('billing_profiles')
        .upsert({
          user_id: userId,
          stripe_customer_id: customer.id,
          email: email
        });

      return customer;
    } catch (error) {
      console.error('Error getting or creating customer:', error);
      throw error;
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(planId: string, paymentMethodId: string): Promise<Subscription> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const customer = await this.getOrCreateCustomer(user.id, user.email || '');

      const response = await fetch('/api/stripe/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customer.id,
          price_id: planId,
          payment_method_id: paymentMethodId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subscription');
      }

      const stripeSubscription = await response.json();

      // Save subscription to database
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .insert({
          stripe_subscription_id: stripeSubscription.id,
          user_id: user.id,
          stripe_customer_id: customer.id,
          status: stripeSubscription.status,
          plan_id: planId,
          plan_name: stripeSubscription.items.data[0]?.price.nickname || 'Unknown Plan',
          plan_price: stripeSubscription.items.data[0]?.price.unit_amount || 0,
          currency: stripeSubscription.currency,
          interval: stripeSubscription.items.data[0]?.price.recurring?.interval || 'monthly',
          current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          metadata: stripeSubscription.metadata
        })
        .select()
        .single();

      if (error) throw error;

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<void> {
    try {
      const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancel_at_period_end: cancelAtPeriodEnd
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Update subscription in database
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: cancelAtPeriodEnd ? 'active' : 'canceled',
          cancel_at_period_end: cancelAtPeriodEnd
        })
        .eq('stripe_subscription_id', subscriptionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription payment method
   */
  async updateSubscriptionPaymentMethod(subscriptionId: string, paymentMethodId: string): Promise<void> {
    try {
      const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}/payment-method`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethodId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription payment method');
      }
    } catch (error) {
      console.error('Error updating subscription payment method:', error);
      throw error;
    }
  }

  /**
   * Get subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await fetch('/api/stripe/prices');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }

      const prices = await response.json();
      
      return prices.data
        .filter((price: any) => price.active && price.type === 'recurring')
        .map((price: any) => ({
          id: price.id,
          name: price.nickname || 'Unknown Plan',
          description: price.metadata?.description || '',
          price: price.unit_amount || 0,
          currency: price.currency,
          interval: price.recurring?.interval || 'monthly',
          features: price.metadata?.features ? JSON.parse(price.metadata.features) : [],
          stripe_price_id: price.id
        }));
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(planId: string, successUrl: string, cancelUrl: string): Promise<{ url: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const customer = await this.getOrCreateCustomer(user.id, user.email || '');

      const response = await fetch('/api/stripe/checkout-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customer.id,
          price_id: planId,
          success_url: successUrl,
          cancel_url: cancelUrl,
          mode: 'subscription'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const session = await response.json();
      return { url: session.url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Create a billing portal session
   */
  async createBillingPortalSession(returnUrl: string): Promise<{ url: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const customer = await this.getOrCreateCustomer(user.id, user.email || '');

      const response = await fetch('/api/stripe/billing-portal/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customer.id,
          return_url: returnUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create billing portal session');
      }

      const session = await response.json();
      return { url: session.url };
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw error;
    }
  }

  /**
   * Process webhook events
   */
  async processWebhookEvent(event: StripeWebhookEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as StripePaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as StripePaymentIntent);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as StripeSubscription);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as StripeSubscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as StripeSubscription);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error processing webhook event:', error);
      throw error;
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: StripePaymentIntent): Promise<void> {
    // Update payment intent status in database
    await supabase
      .from('payment_intents')
      .update({ status: paymentIntent.status })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    // Create transaction record if not exists
    const { data: existingTransaction } = await supabase
      .from('transactions')
      .select('id')
      .eq('stripe_charge_id', paymentIntent.latest_charge)
      .single();

    if (!existingTransaction) {
      await supabase
        .from('transactions')
        .insert({
          stripe_charge_id: paymentIntent.latest_charge,
          payment_intent_id: paymentIntent.id,
          user_id: paymentIntent.customer,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'succeeded',
          description: paymentIntent.description,
          metadata: paymentIntent.metadata
        });
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: StripePaymentIntent): Promise<void> {
    await supabase
      .from('payment_intents')
      .update({ status: paymentIntent.status })
      .eq('stripe_payment_intent_id', paymentIntent.id);
  }

  private async handleSubscriptionCreated(subscription: StripeSubscription): Promise<void> {
    // Subscription creation is handled in createSubscription method
    console.log('Subscription created:', subscription.id);
  }

  private async handleSubscriptionUpdated(subscription: StripeSubscription): Promise<void> {
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  private async handleSubscriptionDeleted(subscription: StripeSubscription): Promise<void> {
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', subscription.id);
  }

  private async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    // Handle successful invoice payment
    console.log('Invoice payment succeeded:', invoice.id);
  }

  private async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    // Handle failed invoice payment
    console.log('Invoice payment failed:', invoice.id);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // This should be implemented with crypto to verify the webhook signature
    // For now, we'll return true (implement proper verification in production)
    return true;
  }
}

import { stripe } from '@/config/environment';

// Export singleton instance
export const stripeService = new StripeService({
  publishableKey: stripe.publishableKey,
  secretKey: stripe.secretKey,
  webhookSecret: stripe.webhookSecret,
  apiVersion: '2023-10-16'
});
