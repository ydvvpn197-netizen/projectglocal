import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { EnhancedThemeProvider } from "@/components/ui/EnhancedThemeProvider";
import { LazyLoader, PageLoader } from "./components/LazyLoader";
import { SPARouter } from "./components/SPARouter";
import { AppRoutes } from "./routes/AppRoutes";
import { appConfig } from '@/config/environment';

// import { useRoutePreloader } from "./hooks/useRoutePreloader";

// App configuration and setup

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// SPA Router component is now imported from separate file

const App = () => {
  // Initialize route preloader - temporarily disabled to fix infinite reload
  // useRoutePreloader();

  return (
    <EnhancedThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={appConfig.baseUrl}>
              <SPARouter>
                <LazyLoader fallback={<PageLoader />}>
                  <AppRoutes />
                </LazyLoader>
              </SPARouter>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </EnhancedThemeProvider>
  );
};

export default App;
