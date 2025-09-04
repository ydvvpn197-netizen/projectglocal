import { useState, useCallback, useEffect } from 'react';
import { stripeService } from '../services/stripeService';
import { paymentService } from '../services/paymentService';
import { 
  Subscription, 
  SubscriptionPlan,
  PaymentFormData 
} from '../types/payment';
import { StripeElementsOptions, StripeConfirmPaymentOptions } from '../types/stripe';
import { useToast } from './use-toast';

interface UseStripeReturn {
  // Stripe instance
  stripe: Stripe | null;
  loading: boolean;
  
  // Payment intent management
  createStripePaymentIntent: (data: PaymentFormData) => Promise<PaymentIntent | null>;
  confirmStripePayment: (paymentIntentId: string, options?: StripeConfirmPaymentOptions) => Promise<PaymentIntent | null>;
  
  // Subscription management
  subscriptions: Subscription[];
  loadingSubscriptions: boolean;
  createSubscription: (planId: string, paymentMethodId: string) => Promise<Subscription | null>;
  cancelSubscription: (subscriptionId: string, cancelAtPeriodEnd?: boolean) => Promise<void>;
  updateSubscriptionPaymentMethod: (subscriptionId: string, paymentMethodId: string) => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
  
  // Subscription plans
  subscriptionPlans: SubscriptionPlan[];
  loadingPlans: boolean;
  refreshSubscriptionPlans: () => Promise<void>;
  
  // Checkout sessions
  createCheckoutSession: (planId: string, successUrl: string, cancelUrl: string) => Promise<{ url: string } | null>;
  createBillingPortalSession: (returnUrl: string) => Promise<{ url: string } | null>;
  
  // Customer management
  customerId: string | null;
  loadingCustomer: boolean;
  refreshCustomer: () => Promise<void>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export function useStripe(): UseStripeReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Stripe instance
  const [stripe, setStripe] = useState<Stripe | null>(null);
  
  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  
  // Subscription plans state
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  
  // Customer state
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  
  const { toast } = useToast();

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = paymentService.getStripe();
        if (stripeInstance) {
          setStripe(stripeInstance);
        }
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
      }
    };

    initializeStripe();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown, message?: string) => {
    const errorMessage = message || error.message || 'An error occurred';
    setError(errorMessage);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive"
    });
  }, [toast]);

  const createStripePaymentIntent = useCallback(async (data: PaymentFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const paymentIntent = await stripeService.createStripePaymentIntent(data);
      
      toast({
        title: "Payment Intent Created",
        description: "Stripe payment intent has been created successfully.",
      });
      
      return paymentIntent;
    } catch (error) {
      handleError(error, 'Failed to create Stripe payment intent');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, toast]);

  const confirmStripePayment = useCallback(async (paymentIntentId: string, options?: StripeConfirmPaymentOptions) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }
      
      const result = await stripe.confirmPayment({
        clientSecret: paymentIntentId,
        ...options
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast({
        title: "Payment Confirmed",
        description: "Payment has been confirmed successfully.",
      });
      
      return result;
    } catch (error) {
      handleError(error, 'Payment confirmation failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [stripe, handleError, toast]);

  const refreshSubscriptions = useCallback(async () => {
    try {
      setLoadingSubscriptions(true);
      // This would typically fetch from your database
      // For now, we'll use a placeholder
      setSubscriptions([]);
    } catch (error) {
      handleError(error, 'Failed to load subscriptions');
    } finally {
      setLoadingSubscriptions(false);
    }
  }, [handleError]);

  const createSubscription = useCallback(async (planId: string, paymentMethodId: string): Promise<Subscription | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const subscription = await stripeService.createSubscription(planId, paymentMethodId);
      
      // Refresh subscriptions
      await refreshSubscriptions();
      
      toast({
        title: "Subscription Created",
        description: "Subscription has been created successfully.",
      });
      
      return subscription;
    } catch (error) {
      handleError(error, 'Failed to create subscription');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, toast, refreshSubscriptions]);

  const cancelSubscription = useCallback(async (subscriptionId: string, cancelAtPeriodEnd = true) => {
    try {
      setLoading(true);
      setError(null);
      
      await stripeService.cancelSubscription(subscriptionId, cancelAtPeriodEnd);
      
      // Refresh subscriptions
      await refreshSubscriptions();
      
      toast({
        title: "Subscription Cancelled",
        description: cancelAtPeriodEnd 
          ? "Subscription will be cancelled at the end of the current period."
          : "Subscription has been cancelled immediately.",
      });
    } catch (error) {
      handleError(error, 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  }, [handleError, toast, refreshSubscriptions]);

  const updateSubscriptionPaymentMethod = useCallback(async (subscriptionId: string, paymentMethodId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await stripeService.updateSubscriptionPaymentMethod(subscriptionId, paymentMethodId);
      
      toast({
        title: "Payment Method Updated",
        description: "Subscription payment method has been updated successfully.",
      });
    } catch (error) {
      handleError(error, 'Failed to update subscription payment method');
    } finally {
      setLoading(false);
    }
  }, [handleError, toast]);

  const refreshSubscriptionPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      const plans = await stripeService.getSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (error) {
      handleError(error, 'Failed to load subscription plans');
    } finally {
      setLoadingPlans(false);
    }
  }, [handleError]);

  const createCheckoutSession = useCallback(async (planId: string, successUrl: string, cancelUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const session = await stripeService.createCheckoutSession(planId, successUrl, cancelUrl);
      
      return session;
    } catch (error) {
      handleError(error, 'Failed to create checkout session');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createBillingPortalSession = useCallback(async (returnUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const session = await stripeService.createBillingPortalSession(returnUrl);
      
      return session;
    } catch (error) {
      handleError(error, 'Failed to create billing portal session');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const refreshCustomer = useCallback(async () => {
    try {
      setLoadingCustomer(true);
      // This would typically fetch customer ID from your database
      // For now, we'll use a placeholder
      setCustomerId(null);
    } catch (error) {
      handleError(error, 'Failed to load customer information');
    } finally {
      setLoadingCustomer(false);
    }
  }, [handleError]);

  // Load initial data
  useEffect(() => {
    refreshSubscriptionPlans();
    refreshSubscriptions();
    refreshCustomer();
  }, [refreshSubscriptionPlans, refreshSubscriptions, refreshCustomer]);

  return {
    // Stripe instance
    stripe,
    loading,
    
    // Payment intent management
    createStripePaymentIntent,
    confirmStripePayment,
    
    // Subscription management
    subscriptions,
    loadingSubscriptions,
    createSubscription,
    cancelSubscription,
    updateSubscriptionPaymentMethod,
    refreshSubscriptions,
    
    // Subscription plans
    subscriptionPlans,
    loadingPlans,
    refreshSubscriptionPlans,
    
    // Checkout sessions
    createCheckoutSession,
    createBillingPortalSession,
    
    // Customer management
    customerId,
    loadingCustomer,
    refreshCustomer,
    
    // Error handling
    error,
    clearError
  };
}
