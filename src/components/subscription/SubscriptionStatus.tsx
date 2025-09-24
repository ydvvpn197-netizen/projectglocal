import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Calendar, CreditCard, Settings } from 'lucide-react';
import { subscriptionService, SubscriptionStatus as SubscriptionStatusType } from '@/services/subscriptionService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SubscriptionStatusProps {
  onUpgradeClick?: () => void;
  showUpgradeButton?: boolean;
}

export function SubscriptionStatus({ onUpgradeClick, showUpgradeButton = true }: SubscriptionStatusProps) {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusType | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSubscriptionStatus = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const status = await subscriptionService.getUserSubscriptionStatus(user.id);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error loading subscription status:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadSubscriptionStatus();
    }
  }, [user?.id, loadSubscriptionStatus]);

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      // Default behavior - scroll to subscription section or navigate
      const subscriptionSection = document.getElementById('subscription-plans');
      if (subscriptionSection) {
        subscriptionSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading subscription status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionStatus) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {subscriptionStatus.is_pro ? (
            <Crown className="h-5 w-5 text-yellow-500" />
          ) : (
            <Star className="h-5 w-5 text-gray-400" />
          )}
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge 
            variant={subscriptionStatus.is_pro ? "default" : "secondary"}
            className={subscriptionStatus.is_pro ? "bg-gradient-to-r from-yellow-400 to-orange-500" : ""}
          >
            {subscriptionStatus.is_pro ? 'Pro' : 'Free'}
          </Badge>
          {subscriptionStatus.plan && (
            <span className="text-sm text-gray-600">
              {subscriptionStatus.plan.name}
            </span>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Available Features:</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${subscriptionStatus.can_comment_news ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Comment on news articles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${subscriptionStatus.has_priority_support ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Priority customer support</span>
            </div>
            {subscriptionStatus.can_feature_listing && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm">Featured listing</span>
              </div>
            )}
          </div>
        </div>

        {/* Expiry Date */}
        {subscriptionStatus.expires_at && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {subscriptionStatus.is_pro ? 'Renews' : 'Expires'} on{' '}
              {new Date(subscriptionStatus.expires_at).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!subscriptionStatus.is_pro && showUpgradeButton && (
            <Button 
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-200 hover:shadow-lg"
              size="sm"
            >
              <Crown className="h-4 w-4 mr-1" />
              Upgrade to Pro
            </Button>
          )}
          
          {subscriptionStatus.is_pro && (
            <Button 
              variant="outline" 
              size="sm"
              className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              onClick={() => {
                // Navigate to subscription management
                window.location.href = '/subscription/manage';
              }}
            >
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Button>
          )}
        </div>

        {/* Upgrade Benefits */}
        {!subscriptionStatus.is_pro && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium mb-2 flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              Upgrade to Pro and unlock:
            </p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li className="flex items-center">
                <Check className="h-3 w-3 mr-1 text-green-600" />
                Comment on news articles
              </li>
              <li className="flex items-center">
                <Check className="h-3 w-3 mr-1 text-green-600" />
                Priority customer support
              </li>
              {user?.user_metadata?.user_type === 'artist' && (
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-600" />
                  Featured listing in search results
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
