import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, resilientSupabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, userType?: 'user' | 'artist') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: any }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
            }
          }
          return;
        }

        const { data: { session }, error } = await resilientSupabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Don't throw, just continue without session
        }
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state listener with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (isMounted) {
          try {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            
            // Handle specific auth events
            if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed successfully');
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              // Clear any cached data
              localStorage.removeItem('supabase.auth.token');
            }
          } catch (error) {
            console.error('Error handling auth state change:', error);
            setLoading(false);
          }
        }
      }
    );

    // Add network status listener
    const handleOnline = () => {
      console.log('Network is back online, reinitializing auth...');
      initializeAuth();
    };

    const handleOffline = () => {
      console.log('Network is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, userType: 'user' | 'artist' = 'user') => {
    try {
      // Check network connectivity
      if (!navigator.onLine) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return { error: new Error('Network offline') };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await resilientSupabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: email.split('@')[0],
            display_name: firstName && lastName ? `${firstName} ${lastName}` : email.split('@')[0],
            first_name: firstName,
            last_name: lastName,
            user_type: userType || 'user'
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // If user is created and we have a session, create/update profile
      if (data?.user && data?.session) {
        try {
          const { error: profileError } = await resilientSupabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              username: email.split('@')[0],
              display_name: firstName && lastName ? `${firstName} ${lastName}` : email.split('@')[0],
              user_type: userType,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
        } catch (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      if (data?.user && !data?.session) {
        toast({
          title: "Check your email",
          description: "Please check your email and click the confirmation link to complete registration.",
        });
      } else {
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check network connectivity
      if (!navigator.onLine) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return { error: new Error('Network offline') };
      }

      const { error } = await resilientSupabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in."
        });
      }

      return { error };
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    try {
      // Check network connectivity
      if (!navigator.onLine) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return { error: new Error('Network offline') };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/feed`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('OAuth error:', error);
        toast({
          title: "Authentication Error", 
          description: error.message || `${provider} authentication failed. Please ensure ${provider} login is enabled in your Supabase project settings.`,
          variant: "destructive",
        });
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('OAuth catch error:', error);
      const errorMessage = error.message || "An unexpected error occurred during authentication";
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await resilientSupabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out."
        });
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
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

      const response = await fetch(`https://tepvzhbgobckybyhryuj.supabase.co/functions/v1/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcHZ6aGJnb2Jja3lieWhyeXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODIzNzQsImV4cCI6MjA2OTk1ODM3NH0.RBtDkdzRu-rgRs-kYHj9zlChhqO7lLvrnnVR2vBwji4`,
        },
        body: JSON.stringify({
          action: 'request',
          email: email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Password Reset Failed",
          description: data.error || "Failed to send password reset email",
          variant: "destructive",
        });
        return { error: new Error(data.error) };
      }

      toast({
        title: "Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Password reset request error:', error);
      toast({
        title: "Password Reset Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
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
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Password Reset Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
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
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};