import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { resilientSupabase, withErrorHandling, getConnectionStatus, forceReconnection } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { clearAuthData, checkForStaleAuthData } from '@/utils/clearAuthData';
import { AuthContext } from './AuthContext';
import { UserService } from '@/services/userService';
import { anonymousHandleService } from '@/services/anonymousHandleService';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
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

      // If user was created successfully, the database trigger will automatically create the profile
      if (result?.user) {
        // For immediate session users, ensure profile exists and is properly configured
        if (result.session) {
          try {
            // Wait a moment for the trigger to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const profileResult = await UserService.getUserProfile(result.user.id);
            if (!profileResult.profile) {
              // Fallback: manually create profile if trigger didn't work
              console.log('Profile not found, creating manually...');
              await UserService.createUserProfile({
                user_id: result.user.id,
                user_type: userType || 'user',
                display_name: `${firstName || ''} ${lastName || ''}`.trim() || email,
                first_name: firstName,
                last_name: lastName,
              });
            } else {
              // Enforce anonymous-by-default: Create anonymous handle and set privacy settings
              console.log('Enforcing anonymous-by-default for new user...');
              
              // Generate proper anonymous handle using the service
              const handleResult = await anonymousHandleService.createAnonymousHandleForUser(
                result.user.id,
                {
                  format: 'random',
                  includeNumbers: true,
                  maxLength: 20
                }
              );
              
              const anonymousHandle = handleResult.success ? 
                handleResult.handle?.username : 
                `Anonymous_${Math.random().toString(36).substr(2, 8)}`;
              
              // Update profile to be anonymous by default
              const { error: privacyError } = await resilientSupabase
                .from('profiles')
                .update({
                  is_anonymous: true,
                  privacy_level: 'anonymous',
                  real_name_visibility: false,
                  anonymous_handle: anonymousHandle,
                  anonymous_display_name: `Anonymous ${anonymousHandle}`
                })
                .eq('user_id', result.user.id);
                
              if (privacyError) {
                console.error('Error setting anonymous defaults:', privacyError);
              }
              
              if (handleResult.success) {
                console.log('Anonymous handle created:', handleResult.handle?.username);
              } else {
                console.warn('Failed to create anonymous handle:', handleResult.error);
              }
              
              // Create privacy settings with anonymous defaults
              const { error: privacySettingsError } = await resilientSupabase
                .from('privacy_settings')
                .insert({
                  user_id: result.user.id,
                  profile_visibility: 'private',
                  show_email: false,
                  show_phone: false,
                  show_location: false,
                  anonymous_mode: true,
                  anonymous_posts: true,
                  anonymous_comments: true,
                  anonymous_votes: true,
                  location_sharing: false,
                  precise_location: false
                });
                
              if (privacySettingsError) {
                console.error('Error creating privacy settings:', privacySettingsError);
              }
              // Check if profile needs updates (e.g., user_type wasn't set correctly)
              const needsUpdate = 
                profileResult.profile.user_type !== (userType || 'user') ||
                !profileResult.profile.first_name ||
                !profileResult.profile.last_name ||
                !profileResult.profile.display_name;
                
              if (needsUpdate) {
                console.log('Updating profile with missing fields...');
                const { error: updateError } = await resilientSupabase
                  .from('profiles')
                  .update({
                    user_type: userType || 'user',
                    first_name: firstName || profileResult.profile.first_name,
                    last_name: lastName || profileResult.profile.last_name,
                    display_name: profileResult.profile.display_name || 
                      `${firstName || ''} ${lastName || ''}`.trim() || email,
                  })
                  .eq('user_id', result.user.id);
                  
                if (updateError) {
                  console.error('Error updating profile:', updateError);
                }
              }
              
              // For artists, ensure artist record exists
              if ((userType || 'user') === 'artist' && !profileResult.artistProfile) {
                console.log('Creating artist profile...');
                const { error: artistError } = await resilientSupabase
                  .from('artists')
                  .insert({
                    user_id: result.user.id,
                    specialty: [],
                    experience_years: 0,
                    portfolio_urls: [],
                    bio: 'Professional artist - completing profile setup...',
                    is_available: true,
                  });
                  
                if (artistError) {
                  console.error('Error creating artist profile:', artistError);
                }
              }
            }
          } catch (profileError) {
            console.error('Error ensuring profile exists:', profileError);
            // Don't fail the signup for profile creation issues
          }
        }

        if (!result.session) {
          toast({
            title: "Sign Up Successful",
            description: "Please check your email to verify your account.",
          });
        } else {
          toast({
            title: "Welcome!",
            description: `Your anonymous account is ready! You can reveal your identity anytime in settings.`,
          });
        }
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

      // Validate password strength
      if (newPassword.length < 12) {
        toast({
          title: "Password Too Weak",
          description: "Password must be at least 12 characters long.",
          variant: "destructive",
        });
        return { error: new Error('Password too weak') };
      }

      // Use Supabase's built-in password reset instead of custom endpoint
      const { error } = await resilientSupabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Password Reset Failed",
          description: error.message || "Failed to reset password",
          variant: "destructive",
        });
        return { error: new Error(error.message) };
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
});
