/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use ConsolidatedSubscription.tsx instead.
 * Category: subscription
 * 
 * This page has been consolidated to provide a better, more consistent user experience.
 * All functionality from this page is available in the consolidated version.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, 
  Star, 
  Check, 
  ArrowLeft,
  Users,
  Palette,
  MessageSquare,
  Headphones
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProPermissions } from '@/hooks/useProPermissions';
import { subscriptionService, SubscriptionPlan } from '@/services/subscriptionService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function SubscriptionPlansPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isPro, loading: permissionsLoading } = useProPermissions();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const userType = user?.user_metadata?.user_type || 'user';

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const availablePlans = await subscriptionService.getSubscriptionPlans();
      setPlans(availablePlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user?.id) {
      toast.error('Please log in to subscribe');
      return;
    }

    try {
      setProcessing(planId);
      const result = await subscriptionService.createSubscriptionCheckoutSession(
        user.id,
        planId
      );

      if (result.success && result.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = result.checkoutUrl;
      } else {
        toast.error(result.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setProcessing(null);
    }
  };

  const getFeaturesForUserType = (userType: string) => {
    const baseFeatures = [
      'Comment on news articles',
      'Priority customer support',
      'Advanced search filters',
      'Unlimited community participation'
    ];

    if (userType === 'artist') {
      return [
        ...baseFeatures,
        'Featured listing in search results',
        'Enhanced artist profile',
        'Priority event promotion',
        'Advanced analytics dashboard'
      ];
    }

    return baseFeatures;
  };

  const getRelevantPlans = () => {
    if (userType === 'artist') {
      return plans.filter(plan => plan.target_user_type === 'artist');
    }
    return plans.filter(plan => plan.target_user_type === 'user');
  };

  const formatPrice = (priceInCents: number) => {
    return `₹${(priceInCents / 100).toFixed(0)}`;
  };

  const getPlanIcon = (planType: string) => {
    if (userType === 'artist') {
      return <Palette className="h-6 w-6" />;
    }
    return planType === 'monthly' ? <Users className="h-6 w-6" /> : <Crown className="h-6 w-6" />;
  };

  const getPlanBadge = (planType: string) => {
    if (userType === 'artist') {
      return <Badge className="bg-purple-100 text-purple-800">Artist Plan</Badge>;
    }
    
    if (planType === 'yearly') {
      return <Badge className="bg-green-100 text-green-800">Best Value</Badge>;
    }
    
    return <Badge variant="outline">Monthly</Badge>;
  };

  if (permissionsLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  const relevantPlans = getRelevantPlans();
  const features = getFeaturesForUserType(userType);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="h-10 w-10 text-yellow-500" />
            <h1 className="text-4xl font-bold">Upgrade to Pro</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock premium features and get the most out of your {userType === 'artist' ? 'artist' : 'community'} experience
          </p>
        </div>
      </div>

      {/* Current Status */}
      {isPro && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Check className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">You're already a Pro member!</h3>
                <p className="text-green-700">
                  You have access to all premium features. 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-green-700 underline"
                    onClick={() => navigate('/subscription')}
                  >
                    Manage your subscription
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Pro Features
          </CardTitle>
          <CardDescription>
            What you get with a Pro subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {relevantPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.plan_type === 'yearly' && userType === 'user' 
                ? 'border-blue-500 shadow-lg scale-105' 
                : 'border-gray-200'
            }`}
          >
            {plan.plan_type === 'yearly' && userType === 'user' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Most Popular</Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getPlanIcon(plan.plan_type)}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                {getPlanBadge(plan.plan_type)}
              </div>
              <div className="text-3xl font-bold">
                {formatPrice(plan.price_in_cents)}
                <span className="text-lg font-normal text-gray-600">
                  /{plan.plan_type === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              <CardDescription className="mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {features.length > 4 && (
                  <div className="text-sm text-gray-600">
                    +{features.length - 4} more features
                  </div>
                )}
              </div>
              
              <Separator />
              
              <Button 
                className="w-full"
                onClick={() => handleSubscribe(plan.id)}
                disabled={processing === plan.id || isPro}
              >
                {processing === plan.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : isPro ? (
                  'Current Plan'
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
            <p className="text-sm text-gray-600">
              Yes, you can cancel your subscription at any time. You'll continue to have Pro access until the end of your current billing period.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
            <p className="text-sm text-gray-600">
              We accept all major credit cards, debit cards, and UPI payments through our secure Stripe integration.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Is there a free trial?</h4>
            <p className="text-sm text-gray-600">
              Currently, we don't offer a free trial, but you can cancel anytime if you're not satisfied with the Pro features.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">How do I manage my subscription?</h4>
            <p className="text-sm text-gray-600">
              You can manage your subscription, update payment methods, and view billing history in your profile settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
