import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { resilientSupabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { clearAuthData, checkForStaleAuthData } from '@/utils/clearAuthData';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        
        // Check if we're online
        if (!navigator.onLine) {
          console.warn('Network is offline, using cached session');
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
          }
          return;
        }

        // Test Supabase connection first
        try {
          const { data: { session }, error } = await resilientSupabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            // Clear any stale session data
            if (isMounted) {
              setSession(null);
              setUser(null);
              setLoading(false);
            }
            return;
          }
          
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
          }
        } catch (connectionError) {
          console.error('Supabase connection error during auth initialization:', connectionError);
          // Set loading to false so the app can continue without auth
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
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = resilientSupabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, userType?: 'user' | 'artist') => {
    try {
      if (!navigator.onLine) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return { error: new Error('Network offline') };
      }

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

      if (error) {
        const errorMessage = error.message || 'An unexpected error occurred';
        console.error('Sign up error:', error);
        toast({
          title: "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: new Error(errorMessage) };
      }

      if (data.user && !data.session) {
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
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!navigator.onLine) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return { error: new Error('Network offline') };
      }

      const { data, error } = await resilientSupabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errorMessage = error.message || 'An unexpected error occurred';
        console.error('Sign in error:', error);
        toast({
          title: "Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: new Error(errorMessage) };
      }

      if (data.user) {
        toast({
          title: "Welcome Back!",
          description: `Signed in as ${data.user.email}`,
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
  };

  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    try {
      if (!navigator.onLine) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return { error: new Error('Network offline') };
      }

      const { data, error } = await resilientSupabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        const errorMessage = error.message || 'An unexpected error occurred';
        console.error('OAuth sign in error:', error);
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
  };

  const signOut = async () => {
    try {
      const { error } = await resilientSupabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
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
  };

  const requestPasswordReset = async (email: string) => {
    try {
      if (!navigator.onLine) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return { error: new Error('Network offline') };
      }

      const { error } = await resilientSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        const errorMessage = error.message || 'An unexpected error occurred';
        console.error('Password reset request error:', error);
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
  };

  const resetPassword = async (token: string, newPassword: string) => {
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
  };

  const handleClearAuthData = () => {
    clearAuthData();
    setUser(null);
    setSession(null);
    toast({
      title: "Auth Data Cleared",
      description: "Authentication data has been cleared. Please sign in again.",
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithOAuth,
      signOut,
      requestPasswordReset,
      resetPassword,
      clearAuthData: handleClearAuthData
    }}>
      {children}
    </AuthContext.Provider>
  );
};
