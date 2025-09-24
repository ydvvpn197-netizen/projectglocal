import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, 
  Star, 
  Check, 
  Users,
  Palette,
  MessageSquare,
  Shield,
  Globe,
  Vote,
  Megaphone,
  Calendar,
  Heart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionService, SubscriptionPlan } from '@/services/subscriptionService';
import { toast } from 'sonner';

export function PublicSquareSubscription() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const userType = user?.user_metadata?.user_type || 'user';

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const availablePlans = await subscriptionService.getSubscriptionPlans(userType);
      setPlans(availablePlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  }, [userType]);

  const handleSubscribe = async (planId: string) => {
    if (!user?.id) {
      toast.error('Please log in to subscribe');
      return;
    }

    try {
      setProcessing(planId);
      const result = await subscriptionService.createSubscriptionCheckout(planId, user.id);

      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
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
      { icon: MessageSquare, text: 'Comment on news articles' },
      { icon: Shield, text: 'Priority customer support' },
      { icon: Globe, text: 'Advanced search filters' },
      { icon: Users, text: 'Unlimited community participation' },
      { icon: Vote, text: 'Create and vote on polls' },
      { icon: Megaphone, text: 'Organize virtual protests' },
      { icon: Calendar, text: 'Create community events' }
    ];

    if (userType === 'artist') {
      return [
        ...baseFeatures,
        { icon: Star, text: 'Featured listing in search results' },
        { icon: Palette, text: 'Enhanced artist profile' },
        { icon: Heart, text: 'Priority event promotion' },
        { icon: Crown, text: 'Advanced analytics dashboard' },
        { icon: Users, text: 'Follower engagement tools' },
        { icon: Globe, text: 'Service marketplace access' }
      ];
    }

    return baseFeatures;
  };

  const getRelevantPlans = () => {
    if (userType === 'artist') {
      return plans.filter(plan => plan.user_type === 'artist');
    }
    return plans.filter(plan => plan.user_type === 'user');
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
    if (planType === 'monthly') {
      return <Badge className="bg-blue-600 text-white">Most Popular</Badge>;
    }
    return <Badge className="bg-green-600 text-white">Best Value</Badge>;
  };

  const features = getFeaturesForUserType(userType);
  const relevantPlans = getRelevantPlans();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading subscription plans...</p>
          </div>
        </div>
      </div>
    );
  }

  if (relevantPlans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Subscription Plans Available</h1>
            <p className="text-gray-600">Subscription plans are currently being set up. Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join the Digital Public Square
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Support your local community and unlock premium features for enhanced engagement, 
            privacy protection, and community building.
          </p>
        </div>

        {/* User Type Info */}
        <div className="mb-8 text-center">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {userType === 'artist' ? (
              <>
                <Palette className="w-4 h-4 mr-2" />
                Artist & Service Provider
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Community Member
              </>
            )}
          </Badge>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {relevantPlans.map((plan) => (
            <Card key={plan.id} className="relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                {getPlanBadge(plan.plan_type)}
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center">
                  {getPlanIcon(plan.plan_type)}
                  <span className="ml-2">{plan.name}</span>
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-4xl font-bold text-blue-600">
                  {formatPrice(plan.price_in_cents)}
                </div>
                <div className="text-sm text-gray-500">
                  per {plan.plan_type === 'monthly' ? 'month' : 'year'}
                </div>
                {plan.plan_type === 'yearly' && (
                  <div className="text-sm text-green-600 font-medium">
                    Save 2 months (₹{userType === 'artist' ? '200' : '40'} off)
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <feature.icon className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Separator />
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processing === plan.id}
                  className="w-full"
                  size="lg"
                >
                  {processing === plan.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            What You Get with Pro Access
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">News Engagement</h3>
              <p className="text-sm text-gray-600">
                Comment on news articles and engage in community discussions
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Vote className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Community Polls</h3>
              <p className="text-sm text-gray-600">
                Create and vote on local issues with government tagging
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Megaphone className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Virtual Protests</h3>
              <p className="text-sm text-gray-600">
                Organize and participate in community problem raising
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Event Creation</h3>
              <p className="text-sm text-gray-600">
                Create and manage local community events
              </p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">Privacy Protection</h3>
              <p className="text-sm text-gray-600">
                Enhanced privacy controls and identity protection
              </p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold mb-2">Community Support</h3>
              <p className="text-sm text-gray-600">
                Priority support and community building tools
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Why should I subscribe to the Public Square?</h3>
              <p className="text-gray-600 text-sm">
                Your subscription supports the platform's development and helps maintain a vibrant, 
                privacy-focused community space. You get enhanced features for better community engagement 
                and identity protection.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-2">What's the difference between user and artist plans?</h3>
              <p className="text-gray-600 text-sm">
                Community members (₹20/month) get full access to news, polls, protests, and events. 
                Artists & service providers (₹100/month) get additional features like service marketplace, 
                enhanced profiles, and advanced analytics.
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
              <h3 className="font-semibold mb-2">How does the privacy protection work?</h3>
              <p className="text-gray-600 text-sm">
                Pro users get enhanced privacy controls including identity masking, selective visibility, 
                and advanced security features to protect their personal information while engaging with the community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
