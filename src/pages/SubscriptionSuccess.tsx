import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionService } from '@/services/subscriptionService';
import { toast } from 'sonner';

export function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifySubscription = async () => {
      if (!user?.id || !sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const status = await subscriptionService.getUserSubscriptionStatus(user.id);
        setSubscriptionStatus(status);
        
        if (status.is_pro) {
          toast.success('Welcome to Pro! Your subscription is now active.');
        }
      } catch (error) {
        console.error('Error verifying subscription:', error);
        toast.error('Error verifying subscription status');
      } finally {
        setLoading(false);
      }
    };

    verifySubscription();
  }, [user?.id, sessionId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-800">
            Subscription Successful!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-lg text-green-700">
              Welcome to Pro! Your subscription is now active.
            </p>
            <p className="text-sm text-green-600">
              You can now enjoy all Pro features including news commenting and priority support.
            </p>
          </div>

          {subscriptionStatus?.is_pro && (
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-green-800">Pro Features Unlocked</span>
              </div>
              <div className="space-y-1 text-sm text-green-700">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Comment on news articles</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Priority customer support</span>
                </div>
                {user?.user_metadata?.user_type === 'artist' && (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Featured listing in search results</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/subscription')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Manage Subscription
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>

          {sessionId && (
            <div className="text-xs text-gray-500 pt-4 border-t border-green-200">
              Session ID: {sessionId}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
