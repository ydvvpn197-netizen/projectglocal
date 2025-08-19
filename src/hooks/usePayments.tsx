import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface BookingPayment {
  booking_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_intent_id?: string;
  created_at: string;
  updated_at: string;
}

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          user_id: user?.id
        }
      });

      if (error) throw error;

      return data as PaymentIntent;
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create payment",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmBookingPayment = async (bookingId: string, paymentIntentId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('booking_payments')
        .insert({
          booking_id: bookingId,
          payment_intent_id: paymentIntentId,
          amount: 0, // Will be updated from payment intent
          currency: 'usd',
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      // Update booking status
      await supabase
        .from('artist_bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      toast({
        title: "Payment Successful",
        description: "Your booking has been confirmed!",
      });

      return data;
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to confirm payment",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const processEventTicketPayment = async (eventId: string, ticketType: string, quantity: number, amount: number) => {
    try {
      setLoading(true);
      
      // Create payment intent
      const paymentIntent = await createPaymentIntent(amount * quantity);
      
      // Create ticket order
      const { data: order, error: orderError } = await supabase
        .from('event_orders')
        .insert({
          event_id: eventId,
          user_id: user?.id,
          ticket_type: ticketType,
          quantity,
          total_amount: amount * quantity,
          payment_intent_id: paymentIntent.id,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      return {
        paymentIntent,
        order
      };
    } catch (error: any) {
      console.error('Error processing ticket payment:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process ticket payment",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_payments')
        .select(`
          *,
          artist_bookings!inner (
            event_description,
            event_date,
            artists!inner (
              profiles!inner (
                full_name,
                avatar_url
              )
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  };

  const requestRefund = async (paymentId: string, reason: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('request-refund', {
        body: {
          payment_intent_id: paymentId,
          reason,
          user_id: user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Refund Requested",
        description: "Your refund request has been submitted for review.",
      });

      return data;
    } catch (error: any) {
      console.error('Error requesting refund:', error);
      toast({
        title: "Refund Error",
        description: error.message || "Failed to request refund",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethods = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-payment-methods', {
        body: { user_id: user?.id }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  };

  const savePaymentMethod = async (paymentMethodId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('save-payment-method', {
        body: {
          payment_method_id: paymentMethodId,
          user_id: user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Payment Method Saved",
        description: "Your payment method has been saved for future use.",
      });

      return data;
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save payment method",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    loading,
    createPaymentIntent,
    confirmBookingPayment,
    processEventTicketPayment,
    getPaymentHistory,
    requestRefund,
    getPaymentMethods,
    savePaymentMethod
  };
};
