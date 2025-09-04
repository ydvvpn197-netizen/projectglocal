import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { EnhancedThemeProvider } from "@/components/ui/EnhancedThemeProvider";
import { LazyLoader, PageLoader } from "./components/LazyLoader";
import { AppRoutes } from "./routes/AppRoutes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { appConfig } from '@/config/environment';
import { isSupabaseConfigured } from '@/integrations/supabase/client';

// App configuration and setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Retry failed queries up to 3 times, but not for 4xx errors
        if (failureCount >= 3) return false;
        
        // Don't retry client errors (4xx)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) return false;
        }
        
        return true;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Retry failed mutations up to 2 times, but not for 4xx errors
        if (failureCount >= 2) return false;
        
        // Don't retry client errors (4xx)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) return false;
        }
        
        return true;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

const App = () => {
  // Check configuration on app start
  React.useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.error('❌ Supabase is not properly configured!');
      console.error('Please create a .env file with your Supabase credentials.');
      console.error('Visit /config-status to see detailed configuration information.');
    } else {
      console.log('✅ Supabase configuration is valid');
    }
  }, []);

  return (
    <ErrorBoundary>
      <EnhancedThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <LazyLoader fallback={<PageLoader />}>
                  <AppRoutes />
                </LazyLoader>
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </EnhancedThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
