import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentButtonProps {
  priceId: string;
  mode: 'payment' | 'subscription';
  children?: React.ReactNode;
  className?: string;
  successUrl?: string;
  cancelUrl?: string;
  disabled?: boolean;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  priceId,
  mode,
  children,
  className = '',
  successUrl,
  cancelUrl,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in to make a payment');
      return;
    }

    setIsLoading(true);

    try {
      // Call the create-checkout-session edge function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          mode,
          userId: user.id,
          successUrl,
          cancelUrl,
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast.error('Failed to create checkout session. Please try again.');
        return;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast.error('No checkout URL received. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      );
    }

    if (children) {
      return children;
    }

    return (
      <>
        {mode === 'subscription' ? (
          <Crown className="w-4 h-4 mr-2" />
        ) : (
          <CreditCard className="w-4 h-4 mr-2" />
        )}
        {mode === 'subscription' ? 'Subscribe' : 'Pay Now'}
      </>
    );
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading || !user}
      className={`${className} ${isLoading ? 'opacity-75' : ''}`}
      variant={mode === 'subscription' ? 'default' : 'outline'}
    >
      {getButtonContent()}
    </Button>
  );
};

export default PaymentButton;
