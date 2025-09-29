import { lazy, Suspense } from 'react';

export const lazyRoutes = {
  Home: lazy(() => import('../pages/Home')),
  About: lazy(() => import('../pages/About')),
  Events: lazy(() => import('../pages/Events')),
  Community: lazy(() => import('../pages/Community')),
  Profile: lazy(() => import('../pages/Profile')),
  Settings: lazy(() => import('../pages/Settings')),
  Admin: lazy(() => import('../pages/Admin'))
};

export const lazyComponents = {
  ChartComponent: lazy(() => import('../components/ChartComponent')),
  AdminPanel: lazy(() => import('../components/AdminPanel')),
  VoiceControl: lazy(() => import('../components/VoiceControlPanel')),
  Onboarding: lazy(() => import('../components/OnboardingFlow'))
};

export const LazyWrapper = ({ children, fallback }) => (
  <Suspense fallback={fallback || <div>Loading...</div>}>
    {children}
  </Suspense>
);