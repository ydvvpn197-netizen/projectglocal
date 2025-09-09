import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  TestTube
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProPermissions } from '@/hooks/useProPermissions';
import { subscriptionService, SubscriptionPlan } from '@/services/subscriptionService';
import { toast } from 'sonner';

export function SubscriptionTest() {
  const { user } = useAuth();
  const { isPro, loading: permissionsLoading } = useProPermissions();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<{
    plansLoaded: boolean;
    permissionsWorking: boolean;
    userType: string;
    subscriptionStatus: string;
  }>({
    plansLoaded: false,
    permissionsWorking: false,
    userType: 'unknown',
    subscriptionStatus: 'unknown'
  });

  useEffect(() => {
    if (user?.id) {
      runTests();
    }
  }, [user?.id, isPro]);

  const runTests = async () => {
    try {
      setLoading(true);
      
      // Test 1: Load subscription plans
      const availablePlans = await subscriptionService.getSubscriptionPlans();
      setPlans(availablePlans);
      
      // Test 2: Check user subscription status
      const subscriptionStatus = await subscriptionService.getUserSubscriptionStatus(user?.id || '');
      
      setTestResults({
        plansLoaded: availablePlans.length > 0,
        permissionsWorking: !permissionsLoading,
        userType: user?.user_metadata?.user_type || 'user',
        subscriptionStatus: subscriptionStatus.isPro ? 'Pro' : 'Free'
      });
      
    } catch (error) {
      console.error('Error running tests:', error);
      toast.error('Failed to run subscription tests');
    } finally {
      setLoading(false);
    }
  };

  const testCheckoutSession = async (planId: string) => {
    if (!user?.id) {
      toast.error('Please log in to test checkout');
      return;
    }

    try {
      const result = await subscriptionService.createSubscriptionCheckoutSession(
        user.id,
        planId
      );

      if (result.success) {
        toast.success('Checkout session created successfully!');
        console.log('Checkout URL:', result.checkoutUrl);
      } else {
        toast.error(result.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error testing checkout:', error);
      toast.error('Failed to test checkout session');
    }
  };

  const getTestIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getTestColor = (passed: boolean) => {
    return passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading || permissionsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Running subscription tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TestTube className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Subscription System Test</h1>
        </div>
        <p className="text-gray-600">
          Test the Pro subscription system functionality
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Test Results
            </CardTitle>
            <CardDescription>
              Current system status and test outcomes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Subscription Plans Loaded</span>
                <Badge className={getTestColor(testResults.plansLoaded)}>
                  {getTestIcon(testResults.plansLoaded)}
                  {testResults.plansLoaded ? 'Passed' : 'Failed'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Permissions System</span>
                <Badge className={getTestColor(testResults.permissionsWorking)}>
                  {getTestIcon(testResults.permissionsWorking)}
                  {testResults.permissionsWorking ? 'Working' : 'Failed'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">User Type</span>
                <Badge variant="outline">
                  {testResults.userType}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Subscription Status</span>
                <Badge className={testResults.subscriptionStatus === 'Pro' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                  <Crown className="h-3 w-3 mr-1" />
                  {testResults.subscriptionStatus}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <Button onClick={runTests} className="w-full">
              <TestTube className="h-4 w-4 mr-2" />
              Re-run Tests
            </Button>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Available Plans
            </CardTitle>
            <CardDescription>
              Test subscription plan loading and checkout
            </CardDescription>
          </CardHeader>
          <CardContent>
            {plans.length === 0 ? (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No plans loaded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{plan.name}</h4>
                      <p className="text-sm text-gray-600">
                        ₹{(plan.price_in_cents / 100).toFixed(0)} / {plan.plan_type}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => testCheckoutSession(plan.id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Test Checkout'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pro Features Test */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pro Features Access Test</CardTitle>
          <CardDescription>
            Test if Pro features are properly restricted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">News Commenting</h4>
              <div className="flex items-center gap-2">
                {isPro ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Access granted</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Access restricted</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Priority Support</h4>
              <div className="flex items-center gap-2">
                {isPro ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Available</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Not available</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
