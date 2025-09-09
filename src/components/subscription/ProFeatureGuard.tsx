import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { subscriptionService, SubscriptionStatus } from '@/services/subscriptionService';
import { useAuth } from '@/hooks/useAuth';

interface ProFeatureGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  feature?: string;
  onUpgradeClick?: () => void;
}

export function ProFeatureGuard({ 
  children, 
  fallback, 
  feature = 'this feature',
  onUpgradeClick 
}: ProFeatureGuardProps) {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkAccess();
    }
  }, [user?.id, feature, checkAccess]);

  const checkAccess = useCallback(async () => {
    if (!user?.id) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const status = await subscriptionService.getUserSubscriptionStatus(user.id);
      setSubscriptionStatus(status);
      
      // Check specific feature access
      let access = false;
      switch (feature) {
        case 'news_comments':
          access = status.can_comment_news;
          break;
        case 'featured_listing':
          access = status.can_feature_listing;
          break;
        case 'priority_support':
          access = status.has_priority_support;
          break;
        default:
          access = status.is_pro;
      }
      
      setHasAccess(access);
    } catch (error) {
      console.error('Error checking Pro access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id, feature]);

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      // Default behavior - scroll to subscription section
      const subscriptionSection = document.getElementById('subscription-plans');
      if (subscriptionSection) {
        subscriptionSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <Crown className="h-6 w-6 text-yellow-600" />
        </div>
        <CardTitle className="text-lg">Pro Feature</CardTitle>
        <CardDescription>
          {feature === 'news_comments' && 'Comment on news articles'}
          {feature === 'featured_listing' && 'Featured listing in search results'}
          {feature === 'priority_support' && 'Priority customer support'}
          {!['news_comments', 'featured_listing', 'priority_support'].includes(feature) && 
            `Access to ${feature}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            This feature is available to Pro subscribers only.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Lock className="h-4 w-4" />
            <span>Upgrade to unlock</span>
          </div>
        </div>
        
        <Button 
          onClick={handleUpgrade}
          className="w-full"
        >
          <Crown className="h-4 w-4 mr-2" />
          Upgrade to Pro
        </Button>
        
        <div className="text-xs text-gray-500">
          Starting from ₹20/month for users, ₹500/year for artists
        </div>
      </CardContent>
    </Card>
  );
}

// Specific feature guards
export function NewsCommentGuard({ children, fallback, onUpgradeClick }: Omit<ProFeatureGuardProps, 'feature'>) {
  return (
    <ProFeatureGuard 
      feature="news_comments" 
      fallback={fallback}
      onUpgradeClick={onUpgradeClick}
    >
      {children}
    </ProFeatureGuard>
  );
}

export function FeaturedListingGuard({ children, fallback, onUpgradeClick }: Omit<ProFeatureGuardProps, 'feature'>) {
  return (
    <ProFeatureGuard 
      feature="featured_listing" 
      fallback={fallback}
      onUpgradeClick={onUpgradeClick}
    >
      {children}
    </ProFeatureGuard>
  );
}

export function PrioritySupportGuard({ children, fallback, onUpgradeClick }: Omit<ProFeatureGuardProps, 'feature'>) {
  return (
    <ProFeatureGuard 
      feature="priority_support" 
      fallback={fallback}
      onUpgradeClick={onUpgradeClick}
    >
      {children}
    </ProFeatureGuard>
  );
}
