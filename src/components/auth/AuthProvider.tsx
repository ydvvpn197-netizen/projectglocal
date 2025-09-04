import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { resilientSupabase, withErrorHandling, getConnectionStatus, forceReconnection } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { clearAuthData, checkForStaleAuthData } from '@/utils/clearAuthData';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'failed' | 'offline'>('connecting');
  const { toast } = useToast();

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionStatus('connecting');
      // Attempt to reconnect when coming back online
      forceReconnection().then((success) => {
        if (success) {
          setConnectionStatus('connected');
          // Re-initialize auth when connection is restored
          initializeAuth();
        } else {
          setConnectionStatus('failed');
        }
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Connection status monitoring
  useEffect(() => {
    const checkConnection = () => {
      const status = getConnectionStatus();
      setConnectionStatus(status);
    };

    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Check for existing session first with better error handling
    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        
        // Check for stale auth data and clear it if necessary
        if (checkForStaleAuthData()) {
          console.log('Stale authentication data detected, clearing...');
          clearAuthData();
          if (isMounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        // Check if we're offline
        if (!navigator.onLine) {
          console.warn('Network is offline, using cached session');
          setConnectionStatus('offline');
          // Try to get session from localStorage as fallback
          const cachedSession = localStorage.getItem('supabase.auth.token');
          if (cachedSession) {
            try {
              const parsedSession = JSON.parse(cachedSession);
              if (isMounted) {
                setSession(parsedSession);
                setUser(parsedSession?.user ?? null);
                setLoading(false);
              }
            } catch (e) {
              console.error('Failed to parse cached session:', e);
              // Clear invalid cached data
              clearAuthData();
            }
          } else {
            setLoading(false);
          }
          return;
        }

        // Test Supabase connection first with enhanced error handling
        const { data: connectionResult, error: connectionError } = await withErrorHandling(
          async () => {
            const { data: { session }, error } = await resilientSupabase.auth.getSession();
            if (error) throw error;
            return session;
          },
          null,
          'Failed to get session during initialization'
        );
        
        if (connectionError) {
          console.error('Error getting session:', connectionError);
          setConnectionStatus('failed');
          // Clear any stale session data
          if (isMounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          
          // Show a toast notification about the connection issue
          toast({
            title: "Connection Issue",
            description: "Unable to connect to authentication service. Some features may be limited.",
            variant: "destructive",
          });
          return;
        }
        
        const session = connectionResult;
        
        // Validate session is still valid
        if (session && session.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          if (expiresAt < new Date()) {
            console.log('Session has expired, clearing auth state');
            if (isMounted) {
              setSession(null);
              setUser(null);
              setLoading(false);
            }
            return;
          }
        }
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          setConnectionStatus('connected');
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setConnectionStatus('failed');
        if (isMounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
        
        // Show error toast
        toast({
          title: "Authentication Error",
          description: "Failed to initialize authentication. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    initializeAuth();

    // Set up auth state change listener with error handling
    const { data: { subscription } } = resilientSupabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Update connection status based on auth state
          if (session) {
            setConnectionStatus('connected');
          } else if (!navigator.onLine) {
            setConnectionStatus('offline');
          } else {
            setConnectionStatus('failed');
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string, firstName?: string, lastName?: string, userType?: 'user' | 'artist') => {
    try {
      if (!navigator.onLine) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return { error: new Error('Network offline') };
      }

      const { data: result, error: operationError } = await withErrorHandling(
        async () => {
          const { data, error } = await resilientSupabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
                user_type: userType || 'user',
              }
            }
          });
          if (error) throw error;
          return data;
        },
        null,
        'Sign up failed'
      );

      if (operationError) {
        const errorMessage = operationError.message || 'An unexpected error occurred';
        console.error('Sign up error:', operationError);
        toast({
          title: "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: new Error(errorMessage) };
      }

      if (result?.user && !result?.session) {
        toast({
          title: "Sign Up Successful",
          description: "Please check your email to verify your account.",
        });
      }

      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Sign up error:', error);
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: new Error(errorMessage) };
    }
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      if (!navigator.onLine) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return { error: new Error('Network offline') };
      }

      const { data: result, error: operationError } = await withErrorHandling(
        async () => {
          const { data, error } = await resilientSupabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          return data;
        },
        null,
        'Sign in failed'
      );

      if (operationError) {
        const errorMessage = operationError.message || 'An unexpected error occurred';
        console.error('Sign in error:', operationError);
        toast({
          title: "Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: new Error(errorMessage) };
      }

      if (result?.user) {
        toast({
          title: "Welcome Back!",
          description: `Signed in as ${result.user.email}`,
        });
      }

      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Sign in error:', error);
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: new Error(errorMessage) };
    }
  }, [toast]);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'facebook') => {
    try {
      if (!navigator.onLine) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return { error: new Error('Network offline') };
      }

      const { data: result, error: operationError } = await withErrorHandling(
        async () => {
          const { data, error } = await resilientSupabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          });
          if (error) throw error;
          return data;
        },
        null,
        'OAuth sign in failed'
      );

      if (operationError) {
        const errorMessage = operationError.message || 'An unexpected error occurred';
        console.error('OAuth sign in error:', operationError);
        toast({
          title: "OAuth Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: new Error(errorMessage) };
      }

      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('OAuth sign in error:', error);
      toast({
        title: "OAuth Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: new Error(errorMessage) };
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      const { error: operationError } = await withErrorHandling(
        async () => {
          const { error } = await resilientSupabase.auth.signOut();
          if (error) throw error;
          return { success: true };
        },
        { success: false },
        'Sign out failed'
      );
      
      if (operationError) {
        console.error('Sign out error:', operationError);
        toast({
          title: "Sign Out Failed",
          description: "There was an error signing you out.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign Out Failed",
        description: "There was an error signing you out.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      if (!navigator.onLine) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return { error: new Error('Network offline') };
      }

      const { error: operationError } = await withErrorHandling(
        async () => {
          const { error } = await resilientSupabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });
          if (error) throw error;
          return { success: true };
        },
        { success: false },
        'Password reset request failed'
      );

      if (operationError) {
        const errorMessage = operationError.message || 'An unexpected error occurred';
        console.error('Password reset request error:', operationError);
        toast({
          title: "Password Reset Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: new Error(errorMessage) };
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });

      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Password reset request error:', error);
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: new Error(errorMessage) };
    }
  }, [toast]);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      if (!navigator.onLine) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return { error: new Error('Network offline') };
      }

      const response = await fetch(`https://tepvzhbgobckybyhryuj.supabase.co/functions/v1/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcHZ6aGJnb2Jja3lieWhyeXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODIzNzQsImV4cCI6MjA2OTk1ODM3NH0.RBtDkdzRu-rgRs-kYHj9zlChhqO7lLvrnnVR2vBwji4`,
        },
        body: JSON.stringify({
          action: 'reset',
          token: token,
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Password Reset Failed",
          description: data.error || "Failed to reset password",
          variant: "destructive",
        });
        return { error: new Error(data.error) };
      }

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });

      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Password reset error:', error);
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: new Error(errorMessage) };
    }
  }, [toast]);

  const handleClearAuthData = useCallback(() => {
    clearAuthData();
    setUser(null);
    setSession(null);
    toast({
      title: "Auth Data Cleared",
      description: "Authentication data has been cleared. Please sign in again.",
    });
  }, [toast]);

  // Enhanced auth context value with connection status
  const authContextValue = useMemo(() => ({
    user,
    session,
    loading,
    isOnline,
    connectionStatus,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    requestPasswordReset,
    resetPassword,
    clearAuthData: handleClearAuthData
  }), [user, session, loading, isOnline, connectionStatus, signUp, signIn, signInWithOAuth, signOut, requestPasswordReset, resetPassword, handleClearAuthData]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
