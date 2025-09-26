import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { registerServiceWorker } from '@/utils/serviceWorker';
import { ComprehensiveErrorBoundary } from '@/components/error/ComprehensiveErrorBoundary';
import { initializePerformanceMonitoring } from '@/utils/performanceOptimizer';
import { initializeSecurityAudit } from '@/utils/securityAudit';
import { AuthProvider } from '@/components/auth/AuthProvider';

// Lazy load components for better performance
const OnboardingFlow = lazy(() => import('@/components/onboarding/OnboardingFlow'));
const MobileLayout = lazy(() => import('@/components/navigation/MobileBottomNavigation'));
const VoiceControlPanel = lazy(() => import('@/components/voice/VoiceControlPanel'));
const AppRoutes = lazy(() => import('@/routes/AppRoutes'));
const ResponsiveLayout = lazy(() => import('@/components/ResponsiveLayout'));
const LazyLoader = lazy(() => import('@/components/LazyLoader'));

// Import hooks normally (hooks can't be lazy loaded)
import { useCommonVoiceCommands } from '@/hooks/useVoiceControl';

// Inner App component that uses auth
function AppContent() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] = useState(false);

  // Register voice commands
  useCommonVoiceCommands();

  // Initialize monitoring and security systems
  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring();
    
    // Initialize security audit
    initializeSecurityAudit();
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
            setIsServiceWorkerRegistered(true);
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

        if (registration) {
          setIsServiceWorkerRegistered(true);
        }
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
          <div className="min-h-screen bg-gray-50">
            {/* Main App Layout */}
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading layout...</div>}>
              <ResponsiveLayout>
                <Routes>
                  <Route path="/*" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading routes...</div>}>
                      <AppRoutes />
                    </Suspense>
                  } />
                </Routes>
              </ResponsiveLayout>
            </Suspense>

            {/* Voice Control Panel - Desktop only */}
            <div className="hidden md:block fixed bottom-4 right-4 z-40">
              <Suspense fallback={<div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>}>
                <VoiceControlPanel compact />
              </Suspense>
            </div>

            {/* Service Worker Status Indicator */}
            {isServiceWorkerRegistered && (
              <div className="fixed top-4 right-4 z-50">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  Offline Ready
                </div>
              </div>
            )}

            {/* Toast Notifications */}
            <Toaster />
          </div>
        </Router>
      </Suspense>
    </ComprehensiveErrorBoundary>
  );
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;