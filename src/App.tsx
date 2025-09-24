import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { registerServiceWorker } from '@/utils/serviceWorker';
import { ComprehensiveErrorBoundary } from '@/components/error/ComprehensiveErrorBoundary';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { MobileLayout } from '@/components/navigation/MobileBottomNavigation';
import { VoiceControlPanel } from '@/components/voice/VoiceControlPanel';
import { useCommonVoiceCommands } from '@/hooks/useVoiceControl';
import { initializePerformanceMonitoring } from '@/utils/performanceMonitor';
import { initializeSecurityAudit } from '@/utils/securityAudit';

// Import your existing components
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AppRoutes } from '@/routes/AppRoutes';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { LazyLoader } from '@/components/LazyLoader';

function App() {
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
      <ComprehensiveErrorBoundary level="page" showDetails={process.env.NODE_ENV === 'development'}>
        <OnboardingFlow 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
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
    <ComprehensiveErrorBoundary level="critical" showDetails={process.env.NODE_ENV === 'development'}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* Main App Layout */}
            <ResponsiveLayout>
              <Routes>
                <Route path="/*" element={<AppRoutes />} />
              </Routes>
            </ResponsiveLayout>

            {/* Voice Control Panel - Desktop only */}
            <div className="hidden md:block fixed bottom-4 right-4 z-40">
              <VoiceControlPanel compact />
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
      </AuthProvider>
    </ComprehensiveErrorBoundary>
  );
}

export default App;