import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, CreditCard, Star, ArrowRight } from 'lucide-react';
import { PaymentButton } from '@/components/payments/PaymentButton';
import { UserPaymentStatus } from '@/components/payments/UserPaymentStatus';
import { Button } from '@/components/ui/button';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new Public Square subscription page
    navigate('/public-square-subscription', { replace: true });
  }, [navigate]);
  const features = [
    'Unlimited event creation',
    'Premium artist profiles',
    'Advanced analytics',
    'Priority support',
    'Custom branding',
    'API access',
  ];

  const subscriptionFeatures = [
    'All free features',
    'Monthly premium access',
    'Cancel anytime',
    'Automatic renewals',
    'Email support',
  ];

  const oneTimeFeatures = [
    'All free features',
    'Lifetime premium access',
    'No recurring charges',
    'One-time payment',
    'Priority support',
  ];

  return (
    <ResponsiveLayout showNewsFeed={false}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock premium features and support the platform. Choose between a monthly subscription 
            or a one-time lifetime payment.
          </p>
        </div>

        {/* Current Status */}
        <div className="mb-12 max-w-md mx-auto">
          <UserPaymentStatus showUpgradeButton={false} />
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-4xl font-bold">$0</div>
              <div className="text-sm text-gray-500">forever</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm">Basic event creation</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm">Community access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm">Basic profiles</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm">Standard support</span>
                </li>
              </ul>
              <div className="pt-4">
                <div className="text-center text-sm text-gray-500">
                  You're currently on this plan
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Subscription */}
          <Card className="relative border-blue-200">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center">
                <Crown className="w-5 h-5 mr-2 text-blue-600" />
                Premium
              </CardTitle>
              <CardDescription>Monthly subscription</CardDescription>
              <div className="text-4xl font-bold">$9.99</div>
              <div className="text-sm text-gray-500">per month</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {subscriptionFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <PaymentButton
                  priceId="price_premium_monthly" // Replace with your actual Stripe price ID
                  mode="subscription"
                  className="w-full"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Subscribe Now
                </PaymentButton>
              </div>
            </CardContent>
          </Card>

          {/* Lifetime Payment */}
          <Card className="relative border-green-200">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-green-600 text-white">
                Best Value
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Lifetime
              </CardTitle>
              <CardDescription>One-time payment</CardDescription>
              <div className="text-4xl font-bold">$99</div>
              <div className="text-sm text-gray-500">one-time</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {oneTimeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <PaymentButton
                  priceId="price_premium_lifetime" // Replace with your actual Stripe price ID
                  mode="payment"
                  className="w-full"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Once
                </PaymentButton>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">What's the difference between subscription and lifetime?</h3>
              <p className="text-gray-600 text-sm">
                The subscription gives you monthly access with automatic renewals, while the lifetime payment 
                gives you permanent access with no recurring charges.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel your subscription at any time. You'll continue to have access until 
                the end of your current billing period.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards through our secure Stripe payment processor.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default Pricing;
