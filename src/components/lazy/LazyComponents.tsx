import { lazy } from 'react';

// Lazy load heavy components
export const LazyAdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
export const LazyAdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
export const LazyAdminManagement = lazy(() => import('@/pages/admin/AdminManagement'));
export const LazyContentModeration = lazy(() => import('@/pages/admin/ContentModeration'));

// Lazy load monetization components
export const LazyMonetizationDashboard = lazy(() => import('@/components/monetization/MonetizationDashboard'));
export const LazySubscriptionManager = lazy(() => import('@/components/subscription/SubscriptionManager'));

// Lazy load heavy UI components
export const LazyEnhancedNavigation = lazy(() => import('@/components/ui/EnhancedNavigation'));
export const LazyVoiceControlPanel = lazy(() => import('@/components/voice/VoiceControlPanel'));
export const LazyLegalAssistant = lazy(() => import('@/components/legal/LegalAssistant'));
export const LazyLifeWish = lazy(() => import('@/components/lifeWish/LifeWish'));

// Lazy load chart components
export const LazyChart = lazy(() => import('@/components/ui/Chart'));
export const LazyAnalyticsChart = lazy(() => import('@/components/analytics/AnalyticsChart'));

// Lazy load heavy pages
export const LazyArtistDashboard = lazy(() => import('@/pages/ConsolidatedDashboard'));
export const LazyUserDashboard = lazy(() => import('@/pages/ConsolidatedDashboard'));
export const LazyCommunityInsights = lazy(() => import('@/pages/ConsolidatedCommunityInsights'));
export const LazyRealTimeNews = lazy(() => import('@/components/feed/EnhancedFeed'));
