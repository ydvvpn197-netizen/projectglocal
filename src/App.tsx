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
import { LayoutProvider } from '@/contexts/LayoutContext.provider';
import { EnhancedThemeProvider } from '@/components/ui/EnhancedThemeProvider';

// Import components directly to avoid lazy loading issues
import { AppRoutes } from '@/routes/AppRoutes';
import { ConsolidatedLayout } from '@/components/layout/ConsolidatedLayout';
import { AdminRoute } from '@/components/AdminRoute';

const VoiceControlPanel = lazy(() => 
  import('@/components/VoiceControlPanel').catch(error => {
    console.error('Failed to load VoiceControlPanel:', error);
    return { default: () => null };
  })
);

const OnboardingFlow = lazy(() => 
  import('@/components/onboarding/OnboardingFlow').catch(error => {
    console.error('Failed to load OnboardingFlow:', error);
    return { 
      default: ({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) => (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Onboarding Error</h2>
            <p className="text-gray-600 mb-4">Unable to load onboarding flow.</p>
            <button 
              onClick={onSkip}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Continue
            </button>
          </div>
        </div>
      )
    };
  })
);

const ConsolidatedAuth = lazy(() => import('@/pages/ConsolidatedAuth'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminRoutes = lazy(() => import('@/routes/AdminRoutes'));

// Import hooks normally (hooks can't be lazy loaded)
// import { useCommonVoiceCommands } from '@/hooks/useVoiceControl';

// Simple error boundary for component initialization
class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Ensure error is properly serialized
    let serializedError: Error;
    try {
      if (error instanceof Error) {
        serializedError = error;
      } else {
        serializedError = new Error(String(error));
      }
    } catch (e) {
      serializedError = new Error('Unknown error occurred');
    }
    return { hasError: true, error: serializedError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ComponentErrorBoundary caught an error:', error, errorInfo);
    
    // Handle specific primitive conversion errors
    if (error.message && error.message.includes('Cannot convert object to primitive value')) {
      console.error('Primitive conversion error detected. This is likely a lazy loading issue.');
      console.warn('Please refresh the page manually if the error persists');
    }
  }

  render() {
    if (this.state.hasError) {
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

    return this.props.children;
  }
}

// Inner App component that uses auth
function AppContent() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Register voice commands
  // useCommonVoiceCommands();

  // Initialize monitoring and security systems
  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring();
    
    // Initialize security audit (only in production to avoid dev issues)
    if (process.env.NODE_ENV === 'production') {
      initializeSecurityAudit().catch(console.error);
    }
    
    // Initialize performance monitoring dashboard
    performanceMonitor.reportToAnalytics();
  }, []);

  // Service Worker registration
  useEffect(() => {
    const registerSW = async () => {
      try {
        const registration = await registerServiceWorker({
          onUpdate: (registration) => {
            console.log('New content available, manual reload required');
            toast({
              title: "Update Available",
              description: "A new version is available. Please refresh manually.",
              duration: 10000,
              action: (
                <button 
                  onClick={() => window.location.reload()}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  Refresh
                </button>
              )
            });
            // Remove auto-reload - let user decide when to refresh
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
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="min-h-screen bg-background">
          {/* Consolidated App Layout */}
          <ComponentErrorBoundary>
            <Routes>
              <Route path="/admin-login" element={
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                  <AdminLogin />
                </Suspense>
              } />
              <Route path="/admin" element={
                <AdminRoute>
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading admin dashboard...</div>}>
                    <AdminDashboard />
                  </Suspense>
                </AdminRoute>
              } />
              <Route path="/admin/*" element={
                <AdminRoute>
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading admin...</div>}>
                    <AdminRoutes />
                  </Suspense>
                </AdminRoute>
              } />
              <Route path="/*" element={
                <ConsolidatedLayout 
                  variant="main"
                  showHeader={true}
                  showSidebar={true}
                  showFooter={true}
                  showMobileNav={true}
                >
                  <AppRoutes />
                </ConsolidatedLayout>
              } />
            </Routes>
          </ComponentErrorBoundary>

            {/* Voice Control Panel - Desktop only - Temporarily disabled for debugging */}
            {/* <div className="hidden md:block fixed bottom-4 right-4 z-40">
              <Suspense fallback={<div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>}>
                <VoiceControlPanel compact />
              </Suspense>
            </div> */}

            {/* Toast Notifications */}
            <Toaster />
          </div>
        </Router>
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
