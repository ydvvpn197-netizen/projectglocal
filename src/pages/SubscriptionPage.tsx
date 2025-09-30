/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use ConsolidatedSubscription.tsx instead.
 * Category: subscription
 * 
 * This page has been consolidated to provide a better, more consistent user experience.
 * All functionality from this page is available in the consolidated version.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Star, 
  Calendar, 
  CreditCard, 
  Settings, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProPermissions } from '@/hooks/useProPermissions';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { subscriptionService, UserSubscription } from '@/services/subscriptionService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function SubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isPro, loading: permissionsLoading } = useProPermissions();
  const [subscriptionHistory, setSubscriptionHistory] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubscriptionHistory = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const history = await subscriptionService.getUserSubscriptionHistory(user.id);
      setSubscriptionHistory(history);
    } catch (error) {
      console.error('Error loading subscription history:', error);
      toast.error('Failed to load subscription history');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadSubscriptionHistory();
    }
  }, [user?.id, loadSubscriptionHistory]);

  const handleCancelSubscription = async () => {
    if (!user?.id) return;

    try {
      const result = await subscriptionService.cancelSubscription(user.id);
      if (result.success) {
        toast.success('Subscription canceled successfully');
        // Refresh the page to update status
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (permissionsLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

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
        
        <div className="flex items-center gap-3 mb-2">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Subscription Management</h1>
        </div>
        <p className="text-gray-600">
          Manage your Pro subscription and unlock premium features
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Current Status */}
            <SubscriptionStatus showUpgradeButton={false} />
            
            {/* Pro Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Pro Features
                </CardTitle>
                <CardDescription>
                  Features available with Pro subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isPro ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Comment on news articles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isPro ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">Priority customer support</span>
                  </div>
                  {user?.user_metadata?.user_type === 'artist' && (
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isPro ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Featured listing in search results</span>
                    </div>
                  )}
                </div>
                
                {!isPro && (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={() => navigate('/subscription/plans')}
                      className="w-full"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current Subscription Details */}
          {isPro && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pro Subscription Active</p>
                    <p className="text-sm text-gray-600">
                      Enjoying all Pro features
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <SubscriptionManager userType={user?.user_metadata?.user_type || 'user'} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Subscription History
              </CardTitle>
              <CardDescription>
                Your subscription history and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No subscription history found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptionHistory.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(subscription.status)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {subscription.plan?.name || 'Unknown Plan'}
                            </span>
                            <Badge className={getStatusColor(subscription.status)}>
                              {subscription.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {subscription.plan?.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created: {formatDate(subscription.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">
                          {subscription.plan?.price_in_cents 
                            ? `₹${(subscription.plan.price_in_cents / 100).toFixed(0)}`
                            : 'N/A'
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          {subscription.plan?.plan_type === 'monthly' ? 'Monthly' : 'Yearly'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
