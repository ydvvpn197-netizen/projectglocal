import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { registerServiceWorker } from '@/utils/serviceWorker';
import { ComprehensiveErrorBoundary } from '@/components/error/ComprehensiveErrorBoundary';
import { initializePerformanceMonitoring } from '@/utils/performanceOptimizer';
import { initializeSecurityAudit } from '@/utils/securityAudit';
import { performanceMonitor } from '@/utils/performance';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { EnhancedThemeProvider } from '@/components/ui/EnhancedThemeProvider';

// Simplified lazy loading to avoid initialization errors
const OnboardingFlow = lazy(() => import('@/components/onboarding/OnboardingFlow'));
const VoiceControlPanel = lazy(() => import('@/components/voice/VoiceControlPanel'));
const AppRoutes = lazy(() => import('@/routes/AppRoutes'));
const ConsolidatedLayout = lazy(() => import('@/components/layout/ConsolidatedLayout'));

// Import hooks normally (hooks can't be lazy loaded)
import { useCommonVoiceCommands } from '@/hooks/useVoiceControl';

// Simple error boundary for component initialization
const ComponentErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Please refresh the page to try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// Inner App component that uses auth
function AppContent() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Register voice commands
  useCommonVoiceCommands();

  // Initialize monitoring and security systems
  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring();
    
    // Initialize security audit
    initializeSecurityAudit().catch(console.error);
    
    // Initialize performance monitoring dashboard
    performanceMonitor.reportToAnalytics();
  }, []);

  // Service Worker registration
  useEffect(() => {
    const registerSW = async () => {
      try {
        const registration = await registerServiceWorker({
          onUpdate: (registration) => {
            console.log('New content available, reloading...');
            toast({
              title: "Update Available",
              description: "A new version is available. The page will reload.",
              duration: 5000
            });
            setTimeout(() => window.location.reload(), 2000);
          },
          onSuccess: (registration) => {
            console.log('Service Worker registered successfully');
          },
          onError: (error) => {
            console.error('Service Worker registration failed:', error);
            toast({
              title: "Service Worker Error",
              description: "Some offline features may not be available.",
              variant: "destructive"
            });
          }
        });
      } catch (error) {
        console.error('Error registering Service Worker:', error);
      }
    };

    registerSW();
  }, [toast]);

  // Check if user needs onboarding
  useEffect(() => {
    if (user && !isLoading) {
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user, isLoading]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  // Show onboarding for new users
  if (showOnboarding) {
    return (
      <ComprehensiveErrorBoundary level="page" showDetails={import.meta.env.DEV}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading onboarding...</div>}>
          <OnboardingFlow 
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        </Suspense>
      </ComprehensiveErrorBoundary>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading TheGlocal</h2>
          <p className="text-gray-600">Setting up your community experience...</p>
        </div>
      </div>
    );
  }

  return (
    <ComprehensiveErrorBoundary level="critical" showDetails={import.meta.env.DEV}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading app...</div>}>
        <Router>
          <div className="min-h-screen bg-background">
                   {/* Consolidated App Layout */}
                   <ComponentErrorBoundary>
                     <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                       <ConsolidatedLayout>
                         <Routes>
                           <Route path="/*" element={<AppRoutes />} />
                         </Routes>
                       </ConsolidatedLayout>
                     </Suspense>
                   </ComponentErrorBoundary>

            {/* Voice Control Panel - Desktop only */}
            <div className="hidden md:block fixed bottom-4 right-4 z-40">
              <Suspense fallback={<div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>}>
                <VoiceControlPanel compact />
              </Suspense>
            </div>

            {/* Toast Notifications */}
            <Toaster />
          </div>
        </Router>
      </Suspense>
    </ComprehensiveErrorBoundary>
  );
}

// Main App component with providers
function App() {
  return (
    <QueryProvider>
      <LayoutProvider>
        <EnhancedThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </EnhancedThemeProvider>
      </LayoutProvider>
    </QueryProvider>
  );
}

export default App;
