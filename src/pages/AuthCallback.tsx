import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * AuthCallback component handles OAuth callback from providers like Google
 * This component processes the authentication response and redirects users appropriately
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current URL and parse the hash/fragment for auth data
        const hash = window.location.hash;
        const search = window.location.search;
        
        // Check if we have auth data in the URL
        if (hash.includes('access_token') || search.includes('code')) {
          // Wait a moment for Supabase to process the auth state
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if user is now authenticated
          if (user) {
            setStatus('success');
            setMessage('Authentication successful! Redirecting...');
            
            // Redirect to feed after successful authentication
            setTimeout(() => {
              navigate('/feed', { replace: true });
            }, 1500);
          } else {
            // If no user after processing, there might be an error
            setStatus('error');
            setMessage('Authentication failed. Please try again.');
            
            // Redirect to sign-in after error
            setTimeout(() => {
              navigate('/signin', { replace: true });
            }, 3000);
          }
        } else {
          // No auth data in URL, redirect to sign-in
          setStatus('error');
          setMessage('No authentication data found. Redirecting to sign-in...');
          
          setTimeout(() => {
            navigate('/signin', { replace: true });
          }, 2000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An error occurred during authentication. Please try again.');
        
        setTimeout(() => {
          navigate('/signin', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, user]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            {getStatusIcon()}
            <h1 className={`text-2xl font-semibold ${getStatusColor()}`}>
              {status === 'loading' && 'Authenticating...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Authentication Failed'}
            </h1>
            <p className="text-muted-foreground">
              {message}
            </p>
            {status === 'loading' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
