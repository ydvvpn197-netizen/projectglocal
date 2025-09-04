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
import { appConfig } from '@/config/environment';
import { isSupabaseConfigured } from '@/integrations/supabase/client';

// App configuration and setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
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
  );
};

export default App;
