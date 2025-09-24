import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Check, Star, Crown, Zap } from 'lucide-react';
import { useStripe } from '../hooks/useStripe';
import { SubscriptionPlan } from '../types/payment';
import { paymentService } from '../services/paymentService';

interface SubscriptionPlansProps {
  onPlanSelect?: (plan: SubscriptionPlan) => void;
  onSubscribe?: (planId: string) => void;
  selectedPlanId?: string;
  showCurrentPlan?: boolean;
  className?: string;
}

export function SubscriptionPlans({
  onPlanSelect,
  onSubscribe,
  selectedPlanId,
  showCurrentPlan = false,
  className = ''
}: SubscriptionPlansProps) {
  const { subscriptionPlans, loadingPlans, createCheckoutSession } = useStripe();
  const [loading, setLoading] = useState(false);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    onPlanSelect?.(plan);
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      setLoading(true);
      
      const successUrl = `${window.location.origin}/subscription/success?plan=${plan.id}`;
      const cancelUrl = `${window.location.origin}/subscription/cancel`;
      
      const session = await createCheckoutSession(plan.id, successUrl, cancelUrl);
      
      if (session?.url) {
        window.location.href = session.url;
      }
      
      onSubscribe?.(plan.id);
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('premium') || name.includes('pro')) return <Crown className="h-5 w-5" />;
    if (name.includes('basic')) return <Star className="h-5 w-5" />;
    return <Zap className="h-5 w-5" />;
  };

  const getPlanColor = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('premium') || name.includes('pro')) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (name.includes('basic')) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    return 'bg-gradient-to-r from-green-500 to-emerald-500';
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    const formattedPrice = paymentService.formatAmount(price, currency);
    return `${formattedPrice}/${interval}`;
  };

  if (loadingPlans) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 bg-muted rounded w-full"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {subscriptionPlans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative transition-all duration-200 hover:shadow-lg ${
            selectedPlanId === plan.id ? 'ring-2 ring-primary' : ''
          }`}
        >
          {/* Popular Badge */}
          {plan.name.toLowerCase().includes('premium') && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Most Popular
            </Badge>
          )}

          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className={`p-3 rounded-full ${getPlanColor(plan.name)} text-white`}>
                {getPlanIcon(plan.name)}
              </div>
            </div>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Price */}
            <div className="text-center">
              <div className="text-3xl font-bold">
                {formatPrice(plan.price, plan.currency, plan.interval)}
              </div>
              {plan.interval === 'yearly' && (
                <div className="text-sm text-muted-foreground mt-1">
                  Save 20% compared to monthly
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={() => handlePlanSelect(plan)}
                variant={selectedPlanId === plan.id ? "default" : "outline"}
                className="w-full"
                disabled={loading}
              >
                {selectedPlanId === plan.id ? 'Selected' : 'Select Plan'}
              </Button>
              
              <Button
                onClick={() => handleSubscribe(plan)}
                className={`w-full ${getPlanColor(plan.name)} text-white hover:opacity-90`}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Subscribe Now'}
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-xs text-muted-foreground text-center">
              Cancel anytime. No setup fees.
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Individual Plan Card Component
interface PlanCardProps {
  plan: SubscriptionPlan;
  isSelected?: boolean;
  isCurrentPlan?: boolean;
  onSelect?: () => void;
  onSubscribe?: () => void;
  loading?: boolean;
}

export function PlanCard({
  plan,
  isSelected = false,
  isCurrentPlan = false,
  onSelect,
  onSubscribe,
  loading = false
}: PlanCardProps) {
  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('premium') || name.includes('pro')) return <Crown className="h-5 w-5" />;
    if (name.includes('basic')) return <Star className="h-5 w-5" />;
    return <Zap className="h-5 w-5" />;
  };

  const getPlanColor = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('premium') || name.includes('pro')) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (name.includes('basic')) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    return 'bg-gradient-to-r from-green-500 to-emerald-500';
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    const formattedPrice = paymentService.formatAmount(price, currency);
    return `${formattedPrice}/${interval}`;
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
          Current Plan
        </Badge>
      )}

      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className={`p-3 rounded-full ${getPlanColor(plan.name)} text-white`}>
            {getPlanIcon(plan.name)}
          </div>
        </div>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price */}
        <div className="text-center">
          <div className="text-3xl font-bold">
            {formatPrice(plan.price, plan.currency, plan.interval)}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isCurrentPlan && (
            <>
              <Button
                onClick={onSelect}
                variant={isSelected ? "default" : "outline"}
                className="w-full"
                disabled={loading}
              >
                {isSelected ? 'Selected' : 'Select Plan'}
              </Button>
              
              <Button
                onClick={onSubscribe}
                className={`w-full ${getPlanColor(plan.name)} text-white hover:opacity-90`}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Subscribe Now'}
              </Button>
            </>
          )}
          
          {isCurrentPlan && (
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
