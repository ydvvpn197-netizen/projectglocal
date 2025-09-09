import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Home, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/pricing');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Cancelled
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your payment was cancelled. No charges have been made to your account.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <CreditCard className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Payment Not Completed
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You can try again anytime. Your account remains unchanged and no payment was processed.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleTryAgain}
              className="w-full"
              size="lg"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Try Payment Again
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleGoBack}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
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
              Having trouble? Contact our{' '}
              <a href="/support" className="text-blue-600 hover:text-blue-500">
                support team
              </a>{' '}
              for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancel;
