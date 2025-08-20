import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, Shield, Lock } from 'lucide-react';
import { usePayment } from '../hooks/usePayment';
import { PaymentFormData } from '../types/payment';
import { paymentService } from '../services/paymentService';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function PaymentForm({
  amount,
  currency = 'usd',
  description,
  metadata = {},
  onSuccess,
  onError,
  onCancel,
  className = ''
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { createPaymentIntent, confirmPayment, loading, error, clearError } = usePayment();
  
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string>('');

  // Create payment intent when component mounts
  useEffect(() => {
    const initializePayment = async () => {
      try {
        const paymentData: PaymentFormData = {
          amount,
          currency,
          description,
          metadata,
          payment_method_types: ['card']
        };

        const intent = await createPaymentIntent(paymentData);
        if (intent) {
          setPaymentIntent(intent);
          setClientSecret(intent.client_secret || '');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
        setFormError(errorMessage);
        onError?.(errorMessage);
      }
    };

    if (amount > 0) {
      initializePayment();
    }
  }, [amount, currency, description, metadata, createPaymentIntent, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setFormError('Payment system not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setFormError('');
    clearError();

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setFormError(submitError.message || 'Payment submission failed');
        onError?.(submitError.message || 'Payment submission failed');
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
          payment_method_data: {
            billing_details: {
              name: 'Customer Name', // You can collect this from a form
              email: 'customer@example.com' // You can collect this from a form
            }
          }
        }
      });

      if (confirmError) {
        setFormError(confirmError.message || 'Payment confirmation failed');
        onError?.(confirmError.message || 'Payment confirmation failed');
      } else {
        // Payment succeeded
        onSuccess?.({ status: 'succeeded' });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setFormError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return paymentService.formatAmount(amount, currency);
  };

  if (!stripe || !elements) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading payment form...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          Complete your payment of {formatAmount(amount, currency)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount:</span>
              <span className="text-lg font-bold">{formatAmount(amount, currency)}</span>
            </div>
            {description && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">Description:</span>
                <span className="text-sm">{description}</span>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your payment information is encrypted and secure. We never store your card details.
            </AlertDescription>
          </Alert>

          {/* Payment Element */}
          <div className="space-y-4">
            <Label htmlFor="payment-element">Payment Information</Label>
            <div className="border rounded-md p-3">
              <PaymentElement 
                id="payment-element"
                options={{
                  layout: 'tabs',
                  fields: {
                    billingDetails: {
                      name: 'auto',
                      email: 'auto',
                      phone: 'auto',
                      address: 'auto'
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Error Display */}
          {(error || formError) && (
            <Alert variant="destructive">
              <AlertDescription>
                {error || formError}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing || loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || !elements || isProcessing || loading}
              className="flex-1"
            >
              {isProcessing || loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Pay {formatAmount(amount, currency)}
                </>
              )}
            </Button>
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>PCI Compliant</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
