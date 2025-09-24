import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2, Crown, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionService, SubscriptionPlan, SubscriptionStatus } from '@/services/subscriptionService';
import { toast } from 'sonner';

interface TestResult {
  test: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  details?: Record<string, unknown>;
}

export function SubscriptionFlowTest() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  const tests = [
    {
      name: 'User Authentication',
      test: async () => {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        return { userId: user.id, userType: user.user_metadata?.user_type };
      }
    },
    {
      name: 'Load Subscription Plans',
      test: async () => {
        const userType = user?.user_metadata?.user_type || 'user';
        const plansData = await subscriptionService.getSubscriptionPlans(userType as 'user' | 'artist');
        if (!plansData || plansData.length === 0) {
          throw new Error('No subscription plans found');
        }
        return { plansCount: plansData.length, plans: plansData };
      }
    },
    {
      name: 'Check Current Subscription Status',
      test: async () => {
        if (!user?.id) throw new Error('User not authenticated');
        const status = await subscriptionService.getUserSubscriptionStatus(user.id);
        return { isPro: status.is_pro, features: status };
      }
    },
    {
      name: 'Validate Plan Pricing',
      test: async () => {
        const userType = user?.user_metadata?.user_type || 'user';
        const plansData = await subscriptionService.getSubscriptionPlans(userType as 'user' | 'artist');
        
        for (const plan of plansData) {
          if (plan.price_in_cents <= 0) {
            throw new Error(`Invalid price for plan ${plan.name}: ${plan.price_in_cents}`);
          }
          if (!plan.currency || plan.currency !== 'inr') {
            throw new Error(`Invalid currency for plan ${plan.name}: ${plan.currency}`);
          }
        }
        
        return { 
          validPlans: plansData.length,
          pricing: plansData.map(p => ({ name: p.name, price: p.price_in_cents, currency: p.currency }))
        };
      }
    },
    {
      name: 'Test Checkout Session Creation (Dry Run)',
      test: async () => {
        if (!user?.id) throw new Error('User not authenticated');
        const userType = user?.user_metadata?.user_type || 'user';
        const plansData = await subscriptionService.getSubscriptionPlans(userType as 'user' | 'artist');
        
        if (plansData.length === 0) {
          throw new Error('No plans available for checkout test');
        }
        
        // Test with first plan (don't actually create checkout)
        const plan = plansData[0];
        return { 
          planId: plan.id, 
          planName: plan.name,
          price: plan.price_in_cents,
          currency: plan.currency,
          note: 'Checkout session creation would be tested here'
        };
      }
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    for (const test of tests) {
      const testResult: TestResult = {
        test: test.name,
        status: 'running'
      };
      
      setTestResults(prev => [...prev, testResult]);

      try {
        const result = await test.test();
        setTestResults(prev => 
          prev.map(t => 
            t.test === test.name 
              ? { ...t, status: 'passed' as const, message: 'Test passed', details: result }
              : t
          )
        );
      } catch (error) {
        setTestResults(prev => 
          prev.map(t => 
            t.test === test.name 
              ? { ...t, status: 'failed' as const, message: error.message, details: error }
              : t
          )
        );
      }
    }

    setIsRunning(false);
  };

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const userType = user?.user_metadata?.user_type || 'user';
      const [plansData, statusData] = await Promise.all([
        subscriptionService.getSubscriptionPlans(userType as 'user' | 'artist'),
        subscriptionService.getUserSubscriptionStatus(user.id)
      ]);
      
      setPlans(plansData);
      setSubscriptionStatus(statusData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Failed to load subscription data');
    }
  }, [user?.id, user?.user_metadata?.user_type]);

  useEffect(() => {
    loadData();
  }, [user?.id, loadData]);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Subscription Flow Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This test verifies that the subscription system is working correctly.
          </p>
          
          <Button 
            onClick={runTests} 
            disabled={isRunning || !user}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Subscription Tests'
            )}
          </Button>

          {!user && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">Please sign in to run tests</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Status */}
      {subscriptionStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500" />
              Current Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant={subscriptionStatus.is_pro ? "default" : "secondary"}>
                  {subscriptionStatus.is_pro ? 'Pro' : 'Free'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Can Comment on News:</span>
                <Badge variant={subscriptionStatus.can_comment_news ? "default" : "secondary"}>
                  {subscriptionStatus.can_comment_news ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Priority Support:</span>
                <Badge variant={subscriptionStatus.has_priority_support ? "default" : "secondary"}>
                  {subscriptionStatus.has_priority_support ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      {plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-sm text-gray-600">{plan.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{(plan.price_in_cents / 100).toFixed(0)}</div>
                    <div className="text-sm text-gray-600">/{plan.plan_type}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
