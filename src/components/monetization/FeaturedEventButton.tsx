import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, Zap, Check } from 'lucide-react';
import { stripeService } from '@/services/stripeService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface FeaturedEventButtonProps {
  eventId: string;
  eventTitle: string;
  isFeatured?: boolean;
  featuredUntil?: string;
  userPlanInfo?: {
    is_verified: boolean;
    is_premium: boolean;
    can_feature_events: boolean;
  };
  onFeatureSuccess?: () => void;
}

export function FeaturedEventButton({ 
  eventId, 
  eventTitle, 
  isFeatured, 
  featuredUntil,
  userPlanInfo,
  onFeatureSuccess 
}: FeaturedEventButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  const handleFeatureEvent = async () => {
    if (!user) {
      toast.error('Please sign in to feature events');
      return;
    }

    if (!userPlanInfo?.can_feature_events) {
      toast.error('You need to be verified or premium to feature events');
      return;
    }

    setIsLoading(true);
    try {
      const result = await stripeService.featureEvent(eventId);
      
      if (result.success && result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        toast.error(result.error || 'Failed to start featuring process');
      }
    } catch (error) {
      console.error('Error featuring event:', error);
      toast.error('An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if event is currently featured
  const isCurrentlyFeatured = isFeatured && featuredUntil && new Date(featuredUntil) > new Date();

  if (isCurrentlyFeatured) {
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Star className="h-3 w-3 mr-1" />
        Featured
      </Badge>
    );
  }

  if (!userPlanInfo?.can_feature_events) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-200 hover:bg-yellow-50">
            <Star className="h-4 w-4 mr-2" />
            Feature Event
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
            <DialogDescription>
              You need to be verified or premium to feature events.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Get Verified</h4>
              <p className="text-sm text-blue-700 mb-3">
                Become a verified user to feature your events and enhance your credibility.
              </p>
              <div className="text-lg font-bold text-blue-900">$9.99/month</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Go Premium</h4>
              <p className="text-sm text-purple-700 mb-3">
                Get premium access with unlimited featured events and service marketplace.
              </p>
              <div className="text-lg font-bold text-purple-900">$29.99/month</div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setIsDialogOpen(false);
                  // Navigate to profile page for upgrades
                  window.location.href = '/profile';
                }}
                className="flex-1"
              >
                View Plans
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-200 hover:bg-yellow-50">
          <Star className="h-4 w-4 mr-2" />
          Feature Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feature Your Event</DialogTitle>
          <DialogDescription>
            Make your event stand out with featured placement for 30 days.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-900">Featured Event Benefits</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-yellow-800">Prominent placement in event listings</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-yellow-800">Featured badge and highlighting</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-yellow-800">30 days of featured status</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-yellow-800">Increased visibility and engagement</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Event: {eventTitle}</div>
                <div className="text-sm text-gray-600">Featured for 30 days</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">$19.99</div>
                <div className="text-sm text-gray-600">one-time payment</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleFeatureEvent}
              disabled={isLoading}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
            >
              {isLoading ? 'Processing...' : 'Feature Event - $19.99'}
            </Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Secure payment powered by Stripe. Featured status will be active immediately after payment.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FeaturedEventBadge({ featuredUntil }: { featuredUntil?: string }) {
  if (!featuredUntil || new Date(featuredUntil) <= new Date()) {
    return null;
  }

  return (
    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
      <Star className="h-3 w-3 mr-1" />
      Featured
    </Badge>
  );
}
