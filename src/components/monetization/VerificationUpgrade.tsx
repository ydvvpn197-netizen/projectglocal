import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Shield, Star } from 'lucide-react';
import { stripeService } from '@/services/stripeService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface VerificationUpgradeProps {
  userPlanInfo?: {
    is_verified: boolean;
    is_premium: boolean;
    plan_type: string;
  };
  onUpgrade?: () => void;
}

export function VerificationUpgrade({ userPlanInfo, onUpgrade }: VerificationUpgradeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      return;
    }

    setIsLoading(true);
    try {
      const result = await stripeService.upgradeToVerified();
      
      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        toast.error(result.error || 'Failed to start verification process');
      }
    } catch (error) {
      console.error('Error upgrading to verified:', error);
      toast.error('An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  const isVerified = userPlanInfo?.is_verified || false;
  const isPremium = userPlanInfo?.is_premium || false;

  if (isVerified || isPremium) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Verified User</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-green-700">
            You are a verified user with enhanced credibility and features.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <CardTitle>Become a Verified User</CardTitle>
        </div>
        <CardDescription>
          Get verified and unlock premium features to enhance your profile credibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Verified badge on your profile</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Feature your events prominently</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Enhanced credibility in the community</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Priority support</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="space-y-1">
            <div className="text-2xl font-bold">$9.99</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </div>
          <Button 
            onClick={handleUpgrade}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Processing...' : 'Get Verified'}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Cancel anytime. Secure payment powered by Stripe.
        </div>
      </CardContent>
    </Card>
  );
}

export function PremiumUpgrade({ userPlanInfo, onUpgrade }: VerificationUpgradeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      return;
    }

    setIsLoading(true);
    try {
      const result = await stripeService.upgradeToPremium();
      
      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        toast.error(result.error || 'Failed to start premium upgrade');
      }
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      toast.error('An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  const isPremium = userPlanInfo?.is_premium || false;

  if (isPremium) {
    return (
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-purple-800">Premium User</CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-purple-700">
            You have access to all premium features including service marketplace.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-purple-600" />
          <CardTitle>Upgrade to Premium</CardTitle>
        </div>
        <CardDescription>
          Unlock the full potential of the platform with premium features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">All verified user benefits</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Create and sell services</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Advanced analytics dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Priority customer support</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Unlimited featured events</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Custom branding options</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="space-y-1">
            <div className="text-2xl font-bold">$29.99</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </div>
          <Button 
            onClick={handleUpgrade}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? 'Processing...' : 'Go Premium'}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Cancel anytime. Secure payment powered by Stripe.
        </div>
      </CardContent>
    </Card>
  );
}
