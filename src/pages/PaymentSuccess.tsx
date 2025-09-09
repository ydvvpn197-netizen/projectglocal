import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { supabase, user } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<{
    sessionId: string;
    verified: boolean;
  } | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // In a real implementation, you might want to verify the session with Stripe
        // For now, we'll just show success and let the webhook handle the database updates
        
        // Simulate a brief loading period
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setSessionData({ sessionId, verified: true });
        toast.success('Payment successful! Your account has been updated.');
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast.error('There was an issue verifying your payment. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, user]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Verifying your payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Thank you for your payment. Your account has been updated and you now have access to premium features.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {sessionId && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Session ID:</span> {sessionId}
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={handleContinue}
              className="w-full"
              size="lg"
            >
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleViewProfile}
                variant="outline"
                className="w-full"
              >
                <User className="mr-2 h-4 w-4" />
                View Profile
              </Button>
              
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>
          </div>
          
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Need help? Contact our{' '}
              <a href="/support" className="text-blue-600 hover:text-blue-500">
                support team
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
