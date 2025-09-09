import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Crown, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PaymentButton } from './PaymentButton';

interface UserPaymentStatusProps {
  userId?: string;
  showUpgradeButton?: boolean;
  className?: string;
}

export const UserPaymentStatus: React.FC<UserPaymentStatusProps> = ({
  userId,
  showUpgradeButton = true,
  className = '',
}) => {
  const { user } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<{
    isAuthorized: boolean;
    subscriptionStatus: string;
    stripeCustomerId: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = userId || user?.id;

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!currentUserId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_authorized, subscription_status, stripe_customer_id')
          .eq('user_id', currentUserId)
          .single();

        if (error) {
          console.error('Error fetching payment status:', error);
        } else {
          setPaymentStatus(data);
        }
      } catch (error) {
        console.error('Error fetching payment status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [currentUserId, supabase]);

  const getStatusIcon = () => {
    if (!paymentStatus) return <AlertCircle className="h-4 w-4" />;
    
    if (paymentStatus.isAuthorized) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    
    if (paymentStatus.subscriptionStatus === 'past_due') {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    }
    
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = () => {
    if (!paymentStatus) {
      return <Badge variant="secondary">Unknown</Badge>;
    }

    if (paymentStatus.isAuthorized) {
      if (paymentStatus.subscriptionStatus === 'active') {
        return <Badge className="bg-green-100 text-green-800 border-green-200">Premium Active</Badge>;
      } else if (paymentStatus.subscriptionStatus === 'trialing') {
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Trial Active</Badge>;
      } else {
        return <Badge className="bg-green-100 text-green-800 border-green-200">Authorized</Badge>;
      }
    }

    if (paymentStatus.subscriptionStatus === 'past_due') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Payment Due</Badge>;
    }

    if (paymentStatus.subscriptionStatus === 'canceled') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Canceled</Badge>;
    }

    return <Badge variant="secondary">Free Plan</Badge>;
  };

  const getStatusDescription = () => {
    if (!paymentStatus) {
      return 'Unable to load payment status';
    }

    if (paymentStatus.isAuthorized) {
      if (paymentStatus.subscriptionStatus === 'active') {
        return 'You have an active premium subscription with full access to all features.';
      } else if (paymentStatus.subscriptionStatus === 'trialing') {
        return 'You are currently on a free trial with premium access.';
      } else {
        return 'You have completed a one-time payment and have premium access.';
      }
    }

    if (paymentStatus.subscriptionStatus === 'past_due') {
      return 'Your subscription payment is overdue. Please update your payment method.';
    }

    if (paymentStatus.subscriptionStatus === 'canceled') {
      return 'Your subscription has been canceled. You can resubscribe anytime.';
    }

    return 'You are currently on the free plan. Upgrade to unlock premium features.';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading payment status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>Payment Status</span>
        </CardTitle>
        <CardDescription>
          Your current subscription and payment status
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge()}
        </div>
        
        <div className="text-sm text-gray-600">
          {getStatusDescription()}
        </div>
        
        {paymentStatus?.stripeCustomerId && (
          <div className="text-xs text-gray-500">
            Customer ID: {paymentStatus.stripeCustomerId}
          </div>
        )}
        
        {showUpgradeButton && !paymentStatus?.isAuthorized && (
          <div className="pt-4 border-t">
            <div className="space-y-2">
              <p className="text-sm font-medium">Upgrade to Premium</p>
              <div className="flex space-x-2">
                <PaymentButton
                  priceId="price_premium_monthly" // Replace with your actual price ID
                  mode="subscription"
                  className="flex-1"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Subscribe
                </PaymentButton>
                <PaymentButton
                  priceId="price_premium_lifetime" // Replace with your actual price ID
                  mode="payment"
                  className="flex-1"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  One-time
                </PaymentButton>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPaymentStatus;
