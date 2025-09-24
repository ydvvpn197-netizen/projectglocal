import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Home, Crown } from 'lucide-react';

export function SubscriptionCancel() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-orange-100 p-3">
              <XCircle className="h-12 w-12 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-orange-800">
            Subscription Cancelled
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-lg text-orange-700">
              Your subscription process was cancelled.
            </p>
            <p className="text-sm text-orange-600">
              No charges have been made to your account. You can try again anytime.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-orange-800">Pro Features Available</span>
            </div>
            <p className="text-sm text-orange-700">
              Upgrade to Pro to unlock premium features like news commenting and priority support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/subscription')}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
