import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { subscriptionService, SubscriptionPlan, SubscriptionStatus } from '@/services/subscriptionService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SubscriptionManagerProps {
  userType: 'user' | 'artist';
}

export function SubscriptionManager({ userType }: SubscriptionManagerProps) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const [plansData, statusData] = await Promise.all([
        subscriptionService.getSubscriptionPlans(userType),
        subscriptionService.getUserSubscriptionStatus(user.id)
      ]);
      
      setPlans(plansData);
      setSubscriptionStatus(statusData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  }, [user?.id, userType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubscribe = async (planId: string) => {
    if (!user?.id) return;
    
    try {
      setProcessing(planId);
      const result = await subscriptionService.createSubscriptionCheckout(planId, user.id);
      
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setProcessing(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.id) return;
    
    try {
      setProcessing('cancel');
      const result = await subscriptionService.cancelSubscription(user.id);
      
      if (result.success) {
        toast.success('Subscription canceled successfully');
        await loadData(); // Reload data
      } else {
        toast.error(result.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setProcessing(null);
    }
  };

  const formatPrice = (priceInCents: number, currency: string) => {
    const amount = priceInCents / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'monthly':
        return <Star className="h-5 w-5" />;
      case 'yearly':
        return <Crown className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'yearly':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {subscriptionStatus && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-blue-600" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={subscriptionStatus.is_pro ? "default" : "secondary"}>
                    {subscriptionStatus.is_pro ? 'Pro' : 'Free'}
                  </Badge>
                  {subscriptionStatus.plan && (
                    <span className="text-sm text-gray-600">
                      {subscriptionStatus.plan.name}
                    </span>
                  )}
                </div>
                {subscriptionStatus.expires_at && (
                  <p className="text-sm text-gray-600">
                    Expires: {new Date(subscriptionStatus.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              {subscriptionStatus.is_pro && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelSubscription}
                  disabled={processing === 'cancel'}
                >
                  {processing === 'cancel' ? 'Canceling...' : 'Cancel Subscription'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.plan_type === 'yearly' 
                ? 'border-2 border-yellow-400 shadow-lg' 
                : 'border border-gray-200'
            }`}
          >
            {plan.plan_type === 'yearly' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className={getPlanBadgeColor(plan.plan_type)}>
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.plan_type)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {formatPrice(plan.price_in_cents, plan.currency)}
                </span>
                <span className="text-gray-600 ml-1">
                  /{plan.plan_type === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3 mb-6">
                {Object.entries(plan.features).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
              
              <Button
                className="w-full"
                variant={plan.plan_type === 'yearly' ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.id)}
                disabled={processing === plan.id || subscriptionStatus?.is_pro}
              >
                {processing === plan.id ? (
                  'Processing...'
                ) : subscriptionStatus?.is_pro ? (
                  'Current Plan'
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Pro Features</CardTitle>
          <CardDescription>
            Unlock premium features with a Pro subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">Pro Users & Artists</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Comment on news articles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Priority customer support</span>
                </div>
              </div>
            </div>
            
            {userType === 'artist' && (
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-600">Artist Pro Features</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Featured listing in search results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Enhanced profile visibility</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
