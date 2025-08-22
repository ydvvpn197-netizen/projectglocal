// @ts-nocheck
import { supabase } from '../integrations/supabase/client';
import { 
  PaymentIntent, 
  PaymentFormData, 
  PaymentSuccess, 
  PaymentError,
  Transaction,
  PaymentMethod,
  BillingProfile
} from '../types/payment';
import { StripePaymentIntent, StripeConfig } from '../types/stripe';

export class PaymentService {
  private stripe: any;
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    this.config = config;
    this.initializeStripe();
  }

  private async initializeStripe() {
    // Dynamically import Stripe to avoid SSR issues
    const { loadStripe } = await import('@stripe/stripe-js');
    this.stripe = await loadStripe(this.config.publishableKey);
  }

  /**
   * Create a payment intent for a one-time payment
   */
  async createPaymentIntent(data: PaymentFormData): Promise<PaymentIntent> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create payment intent in database
      const { data: paymentIntent, error } = await supabase
        .from('payment_intents')
        .insert({
          user_id: user.id,
          amount: data.amount,
          currency: data.currency,
          status: 'requires_payment_method',
          payment_method_types: data.payment_method_types || ['card'],
          metadata: data.metadata || {},
          description: data.description
        })
        .select()
        .single();

      if (error) throw error;

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment with Stripe
   */
  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentSuccess> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get payment intent from database
      const { data: paymentIntent, error: intentError } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('id', paymentIntentId)
        .eq('user_id', user.id)
        .single();

      if (intentError || !paymentIntent) {
        throw new Error('Payment intent not found');
      }

      // Confirm payment with Stripe
      const { error: confirmError } = await supabase.functions.invoke('confirm-payment', {
        body: {
          payment_intent_id: paymentIntent.stripe_payment_intent_id,
          payment_method_id: paymentMethodId
        }
      });

      if (confirmError) throw confirmError;

      // Update payment intent status
      const { data: updatedIntent, error: updateError } = await supabase
        .from('payment_intents')
        .update({ status: 'succeeded' })
        .eq('id', paymentIntentId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          payment_intent_id: paymentIntentId,
          user_id: user.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'succeeded',
          description: paymentIntent.description,
          metadata: paymentIntent.metadata
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      return {
        payment_intent_id: paymentIntentId,
        transaction_id: transaction.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'succeeded'
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Get user's payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: paymentMethods, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return paymentMethods || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get payment method details from Stripe
      const { data: stripePaymentMethod, error: stripeError } = await supabase.functions.invoke('get-payment-method', {
        body: { payment_method_id: paymentMethodId }
      });

      if (stripeError) throw stripeError;

      // Save payment method to database
      const { data: paymentMethod, error } = await supabase
        .from('payment_methods')
        .insert({
          stripe_payment_method_id: paymentMethodId,
          user_id: user.id,
          type: stripePaymentMethod.type,
          card_brand: stripePaymentMethod.card?.brand,
          card_last4: stripePaymentMethod.card?.last4,
          card_exp_month: stripePaymentMethod.card?.exp_month,
          card_exp_year: stripePaymentMethod.card?.exp_year,
          billing_details: stripePaymentMethod.billing_details,
          is_default: false
        })
        .select()
        .single();

      if (error) throw error;

      return paymentMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Remove default from all payment methods
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Delete from Stripe
      await supabase.functions.invoke('delete-payment-method', {
        body: { payment_method_id: paymentMethodId }
      });

      // Delete from database
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  /**
   * Get user's billing profile
   */
  async getBillingProfile(): Promise<BillingProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: billingProfile, error } = await supabase
        .from('billing_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return billingProfile;
    } catch (error) {
      console.error('Error fetching billing profile:', error);
      throw error;
    }
  }

  /**
   * Update billing profile
   */
  async updateBillingProfile(profile: Partial<BillingProfile>): Promise<BillingProfile> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: billingProfile, error } = await supabase
        .from('billing_profiles')
        .upsert({
          user_id: user.id,
          ...profile
        })
        .select()
        .single();

      if (error) throw error;

      return billingProfile;
    } catch (error) {
      console.error('Error updating billing profile:', error);
      throw error;
    }
  }

  /**
   * Get user's transaction history
   */
  async getTransactions(limit = 20, offset = 0): Promise<Transaction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return transactions || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Process refund for a transaction
   */
  async processRefund(transactionId: string, amount?: number, reason?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .single();

      if (transactionError || !transaction) {
        throw new Error('Transaction not found');
      }

      // Process refund through Stripe
      const { error: refundError } = await supabase.functions.invoke('process-refund', {
        body: {
          charge_id: transaction.stripe_charge_id,
          amount: amount || transaction.amount,
          reason: reason || 'requested_by_customer'
        }
      });

      if (refundError) throw refundError;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Validate payment amount
   */
  validatePaymentAmount(amount: number, currency: string): boolean {
    if (amount <= 0) return false;
    if (currency === 'usd' && amount < 50) return false; // Minimum $0.50
    return true;
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  }

  /**
   * Get Stripe instance
   */
  getStripe() {
    return this.stripe;
  }
}

import { stripe } from '@/config/environment';

// Export singleton instance
export const paymentService = new PaymentService({
  publishableKey: stripe.publishableKey,
  secretKey: stripe.secretKey,
  webhookSecret: stripe.webhookSecret,
  apiVersion: '2023-10-16'
});
