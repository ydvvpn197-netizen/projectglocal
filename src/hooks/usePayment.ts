import { useState, useCallback } from 'react';
import { paymentService } from '../services/paymentService';
import { 
  PaymentIntent, 
  PaymentFormData, 
  PaymentSuccess, 
  PaymentError,
  PaymentMethod,
  Transaction,
  BillingProfile
} from '../types/payment';
import { useToast } from './use-toast';

interface UsePaymentReturn {
  // Payment intent management
  createPaymentIntent: (data: PaymentFormData) => Promise<PaymentIntent | null>;
  confirmPayment: (paymentIntentId: string, paymentMethodId: string) => Promise<PaymentSuccess | null>;
  
  // Payment methods management
  paymentMethods: PaymentMethod[];
  loadingPaymentMethods: boolean;
  addPaymentMethod: (paymentMethodId: string) => Promise<PaymentMethod | null>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  refreshPaymentMethods: () => Promise<void>;
  
  // Billing profile management
  billingProfile: BillingProfile | null;
  loadingBillingProfile: boolean;
  updateBillingProfile: (profile: Partial<BillingProfile>) => Promise<BillingProfile | null>;
  refreshBillingProfile: () => Promise<void>;
  
  // Transaction management
  transactions: Transaction[];
  loadingTransactions: boolean;
  refreshTransactions: () => Promise<void>;
  processRefund: (transactionId: string, amount?: number, reason?: string) => Promise<void>;
  
  // Loading states
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function usePayment(): UsePaymentReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  
  // Billing profile state
  const [billingProfile, setBillingProfile] = useState<BillingProfile | null>(null);
  const [loadingBillingProfile, setLoadingBillingProfile] = useState(false);
  
  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown, message?: string) => {
    const errorMessage = message || (error instanceof Error ? error.message : 'An error occurred');
    setError(errorMessage);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive"
    });
  }, [toast]);

  const createPaymentIntent = useCallback(async (data: PaymentFormData): Promise<PaymentIntent | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate payment amount
      if (!paymentService.validatePaymentAmount(data.amount, data.currency)) {
        throw new Error('Invalid payment amount');
      }
      
      const paymentIntent = await paymentService.createPaymentIntent(data);
      
      toast({
        title: "Payment Intent Created",
        description: "Payment intent has been created successfully.",
      });
      
      return paymentIntent;
    } catch (error) {
      handleError(error, 'Failed to create payment intent');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, toast]);

  const confirmPayment = useCallback(async (paymentIntentId: string, paymentMethodId: string): Promise<PaymentSuccess | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await paymentService.confirmPayment(paymentIntentId, paymentMethodId);
      
      toast({
        title: "Payment Successful",
        description: `Payment of ${paymentService.formatAmount(result.amount, result.currency)} completed successfully.`,
      });
      
      // Refresh transactions after successful payment
      await refreshTransactions();
      
      return result;
    } catch (error) {
      handleError(error, 'Payment failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, toast, refreshTransactions]);

  const refreshPaymentMethods = useCallback(async () => {
    try {
      setLoadingPaymentMethods(true);
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      handleError(error, 'Failed to load payment methods');
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, [handleError]);

  const addPaymentMethod = useCallback(async (paymentMethodId: string): Promise<PaymentMethod | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const paymentMethod = await paymentService.addPaymentMethod(paymentMethodId);
      
      // Refresh payment methods
      await refreshPaymentMethods();
      
      toast({
        title: "Payment Method Added",
        description: "Payment method has been added successfully.",
      });
      
      return paymentMethod;
    } catch (error) {
      handleError(error, 'Failed to add payment method');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, toast, refreshPaymentMethods]);

  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await paymentService.setDefaultPaymentMethod(paymentMethodId);
      
      // Refresh payment methods
      await refreshPaymentMethods();
      
      toast({
        title: "Default Payment Method Updated",
        description: "Default payment method has been updated successfully.",
      });
    } catch (error) {
      handleError(error, 'Failed to set default payment method');
    } finally {
      setLoading(false);
    }
  }, [handleError, toast, refreshPaymentMethods]);

  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await paymentService.removePaymentMethod(paymentMethodId);
      
      // Refresh payment methods
      await refreshPaymentMethods();
      
      toast({
        title: "Payment Method Removed",
        description: "Payment method has been removed successfully.",
      });
    } catch (error) {
      handleError(error, 'Failed to remove payment method');
    } finally {
      setLoading(false);
    }
  }, [handleError, toast, refreshPaymentMethods]);

  const refreshBillingProfile = useCallback(async () => {
    try {
      setLoadingBillingProfile(true);
      const profile = await paymentService.getBillingProfile();
      setBillingProfile(profile);
    } catch (error) {
      handleError(error, 'Failed to load billing profile');
    } finally {
      setLoadingBillingProfile(false);
    }
  }, [handleError]);

  const updateBillingProfile = useCallback(async (profile: Partial<BillingProfile>): Promise<BillingProfile | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedProfile = await paymentService.updateBillingProfile(profile);
      setBillingProfile(updatedProfile);
      
      toast({
        title: "Billing Profile Updated",
        description: "Billing profile has been updated successfully.",
      });
      
      return updatedProfile;
    } catch (error) {
      handleError(error, 'Failed to update billing profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, toast]);

  const refreshTransactions = useCallback(async () => {
    try {
      setLoadingTransactions(true);
      const transactionList = await paymentService.getTransactions();
      setTransactions(transactionList);
    } catch (error) {
      handleError(error, 'Failed to load transactions');
    } finally {
      setLoadingTransactions(false);
    }
  }, [handleError]);

  const processRefund = useCallback(async (transactionId: string, amount?: number, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await paymentService.processRefund(transactionId, amount, reason);
      
      // Refresh transactions after refund
      await refreshTransactions();
      
      toast({
        title: "Refund Processed",
        description: "Refund has been processed successfully.",
      });
    } catch (error) {
      handleError(error, 'Failed to process refund');
    } finally {
      setLoading(false);
    }
  }, [handleError, toast, refreshTransactions]);

  return {
    // Payment intent management
    createPaymentIntent,
    confirmPayment,
    
    // Payment methods management
    paymentMethods,
    loadingPaymentMethods,
    addPaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod,
    refreshPaymentMethods,
    
    // Billing profile management
    billingProfile,
    loadingBillingProfile,
    updateBillingProfile,
    refreshBillingProfile,
    
    // Transaction management
    transactions,
    loadingTransactions,
    refreshTransactions,
    processRefund,
    
    // Loading states
    loading,
    error,
    clearError
  };
}
