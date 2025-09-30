/**
 * App Routes Component
 * Main routing configuration
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AdminRoute } from '@/components/AdminRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load pages for better performance - Using consolidated versions
// Main Pages
const Index = lazy(() => import('@/pages/ConsolidatedIndex'));
const Feed = lazy(() => import('@/pages/ConsolidatedFeed'));
const Dashboard = lazy(() => import('@/pages/ConsolidatedDashboard'));
const Discover = lazy(() => import('@/pages/Discover'));
const News = lazy(() => import('@/pages/News'));

// User Pages - Consolidated
const ConsolidatedProfile = lazy(() => import('@/pages/ConsolidatedProfile'));
const ConsolidatedSettings = lazy(() => import('@/pages/ConsolidatedSettings'));
const ConsolidatedNotifications = lazy(() => import('@/pages/ConsolidatedNotifications'));
const ConsolidatedChat = lazy(() => import('@/pages/ConsolidatedChat'));

// Content Creation - Consolidated
const ConsolidatedCreate = lazy(() => import('@/pages/ConsolidatedCreate'));

// Events
const Events = lazy(() => import('@/pages/ConsolidatedEvents'));
const EventDetails = lazy(() => import('@/pages/EventDetails'));

// Community - Consolidated
const Community = lazy(() => import('@/pages/ConsolidatedCommunity'));
const CommunityInsights = lazy(() => import('@/pages/ConsolidatedCommunityInsights'));

// Auth - Consolidated
const ConsolidatedAuth = lazy(() => import('@/pages/ConsolidatedAuth'));

// Features
const LegalAssistant = lazy(() => import('@/pages/LegalAssistant'));
const LifeWish = lazy(() => import('@/pages/LifeWish'));

// Static Pages
const About = lazy(() => import('@/pages/About'));

// Additional pages that need integration
// Booking & Artist - Consolidated
const ConsolidatedBooking = lazy(() => import('@/pages/ConsolidatedBooking'));
const ConsolidatedArtist = lazy(() => import('@/pages/ConsolidatedArtist'));

// Subscription - Consolidated
const ConsolidatedSubscription = lazy(() => import('@/pages/ConsolidatedSubscription'));
const SubscriptionSuccess = lazy(() => import('@/pages/SubscriptionSuccess'));
const SubscriptionCancel = lazy(() => import('@/pages/SubscriptionCancel'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('@/pages/PaymentCancel'));

// Onboarding - Consolidated
const ConsolidatedOnboarding = lazy(() => import('@/pages/ConsolidatedOnboarding'));

// Auth Utility Pages
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));

// Feature Pages
const PublicSquare = lazy(() => import('@/pages/PublicSquare'));
const Polls = lazy(() => import('@/pages/Polls'));
const LocalBusinesses = lazy(() => import('@/pages/LocalBusinesses'));
const LocalCommunities = lazy(() => import('@/pages/LocalCommunities'));
const CivicEngagementTest = lazy(() => import('@/pages/CivicEngagementTest'));
const TestButtons = lazy(() => import('@/pages/TestButtons'));
const PerformancePage = lazy(() => import('@/pages/PerformancePage'));
const EnhancedSearchDemo = lazy(() => import('@/pages/EnhancedSearchDemo'));

// Utility Pages
const NotFound = lazy(() => import('@/pages/NotFound'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const LocationSetup = lazy(() => import('@/pages/LocationSetup'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminAnalytics = lazy(() => import('@/pages/admin/Analytics'));
const AdminManagement = lazy(() => import('@/pages/admin/AdminManagement'));
const AdminSetup = lazy(() => import('@/pages/admin/AdminSetup'));
const ContentModeration = lazy(() => import('@/pages/admin/ContentModeration'));
const SystemSettings = lazy(() => import('@/pages/admin/SystemSettings'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const UserModeration = lazy(() => import('@/pages/admin/UserModeration'));

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main Routes */}
      <Route path="/" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <Index />
        </Suspense>
      } />
      <Route path="/feed" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading feed...</div>}>
          <Feed />
        </Suspense>
      } />
      <Route path="/dashboard" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>}>
          <Dashboard />
        </Suspense>
      } />
      
      {/* Event Routes */}
      <Route path="/events" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading events...</div>}>
          <Events />
        </Suspense>
      } />
      <Route path="/events/:eventId" element={
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading event...</div>}>
            <EventDetails />
          </Suspense>
        </ErrorBoundary>
      } />
      <Route path="/event/:eventId" element={<Navigate to="/events/:eventId" replace />} />
      
      {/* Create Routes - Consolidated */}
      <Route path="/create" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <ConsolidatedCreate />
        </Suspense>
      } />
      {/* Redirects for old create routes */}
      <Route path="/create-post" element={<Navigate to="/create?type=post" replace />} />
      <Route path="/create-event" element={<Navigate to="/create?type=event" replace />} />
      <Route path="/create-group" element={<Navigate to="/create?type=group" replace />} />
      <Route path="/create-discussion" element={<Navigate to="/create?type=discussion" replace />} />
      
      {/* Community Routes - Consolidated */}
      <Route path="/communities" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading communities...</div>}>
          <Community />
        </Suspense>
      } />
      <Route path="/communities/:id" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading community...</div>}>
          <Community />
        </Suspense>
      } />
      {/* Redirects for old community routes */}
      <Route path="/community" element={<Navigate to="/communities" replace />} />
      <Route path="/community/:id" element={<Navigate to="/communities/:id" replace />} />
      
      {/* User Routes - Consolidated */}
      <Route path="/profile/:userId?" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading profile...</div>}>
          <ConsolidatedProfile />
        </Suspense>
      } />
      <Route path="/chat" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading chat...</div>}>
          <ConsolidatedChat />
        </Suspense>
      } />
      <Route path="/chat/:conversationId" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading chat...</div>}>
          <ConsolidatedChat />
        </Suspense>
      } />
      <Route path="/messages" element={<Navigate to="/chat" replace />} />
      <Route path="/notifications" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading notifications...</div>}>
          <ConsolidatedNotifications />
        </Suspense>
      } />
      <Route path="/settings" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading settings...</div>}>
          <ConsolidatedSettings />
        </Suspense>
      } />
      
      {/* Discovery Routes */}
      <Route path="/discover" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading discover...</div>}>
          <Discover />
        </Suspense>
      } />
      <Route path="/news" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading news...</div>}>
          <News />
        </Suspense>
      } />
      
      {/* Auth Routes - Consolidated */}
      <Route path="/auth" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <ConsolidatedAuth />
        </Suspense>
      } />
      {/* Redirects for old auth routes */}
      <Route path="/signin" element={<Navigate to="/auth?tab=signin" replace />} />
      <Route path="/signup" element={<Navigate to="/auth?tab=signup" replace />} />
      
      {/* About Route */}
      <Route path="/about" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading about...</div>}>
          <About />
        </Suspense>
      } />
      
      {/* Feature Routes */}
      <Route path="/legal-assistant" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading legal assistant...</div>}>
          <LegalAssistant />
        </Suspense>
      } />
      
      <Route path="/life-wish" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading life wishes...</div>}>
          <LifeWish />
        </Suspense>
      } />
      
      {/* Public Square & Civic Engagement */}
      <Route path="/public-square" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading public square...</div>}>
          <PublicSquare />
        </Suspense>
      } />
      
      <Route path="/polls" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading polls...</div>}>
          <Polls />
        </Suspense>
      } />
      
      <Route path="/civic-engagement" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading civic engagement...</div>}>
          <CivicEngagementTest />
        </Suspense>
      } />
      
      {/* Booking Routes - Consolidated */}
      <Route path="/booking" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading booking...</div>}>
          <ConsolidatedBooking />
        </Suspense>
      } />
      <Route path="/booking/:artistId" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading booking...</div>}>
          <ConsolidatedBooking />
        </Suspense>
      } />
      {/* Redirects for old booking routes */}
      <Route path="/book-artist" element={<Navigate to="/booking" replace />} />
      <Route path="/book-artist-simple" element={<Navigate to="/booking" replace />} />
      <Route path="/book-artist-test" element={<Navigate to="/booking" replace />} />
      
      {/* Artist Routes - Consolidated */}
      <Route path="/artist" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading artist...</div>}>
          <ConsolidatedArtist />
        </Suspense>
      } />
      <Route path="/artist/:artistId" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading artist...</div>}>
          <ConsolidatedArtist />
        </Suspense>
      } />
      {/* Redirects for old artist routes */}
      <Route path="/artist-dashboard" element={<Navigate to="/artist?view=dashboard" replace />} />
      <Route path="/artist-profile" element={<Navigate to="/artist" replace />} />
      <Route path="/artist-onboarding" element={<Navigate to="/artist?view=onboarding" replace />} />
      
      {/* Local Services */}
      <Route path="/businesses" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading local businesses...</div>}>
          <LocalBusinesses />
        </Suspense>
      } />
      
      <Route path="/communities" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading local communities...</div>}>
          <LocalCommunities />
        </Suspense>
      } />
      
      {/* Subscription & Payment Routes - Consolidated */}
      <Route path="/subscription" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading subscription...</div>}>
          <ConsolidatedSubscription />
        </Suspense>
      } />
      <Route path="/subscription-plans" element={<Navigate to="/subscription?view=plans" replace />} />
      <Route path="/subscription-success" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <SubscriptionSuccess />
        </Suspense>
      } />
      <Route path="/subscription-cancel" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <SubscriptionCancel />
        </Suspense>
      } />
      <Route path="/payment-success" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <PaymentSuccess />
        </Suspense>
      } />
      <Route path="/payment-cancel" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <PaymentCancel />
        </Suspense>
      } />
      
      {/* Auth Routes */}
      <Route path="/forgot-password" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <ForgotPassword />
        </Suspense>
      } />
      
      <Route path="/reset-password" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <ResetPassword />
        </Suspense>
      } />
      
      <Route path="/auth/callback" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <AuthCallback />
        </Suspense>
      } />
      
      {/* Onboarding Routes - Consolidated */}
      <Route path="/onboarding" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading onboarding...</div>}>
          <ConsolidatedOnboarding />
        </Suspense>
      } />
      <Route path="/privacy-first-onboarding" element={<Navigate to="/onboarding?focus=privacy" replace />} />
      <Route path="/location-setup" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading location setup...</div>}>
          <LocationSetup />
        </Suspense>
      } />
      
      {/* Utility & Test Routes */}
      <Route path="/test-buttons" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading test buttons...</div>}>
          <TestButtons />
        </Suspense>
      } />
      
      <Route path="/performance" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading performance page...</div>}>
          <PerformancePage />
        </Suspense>
      } />
      
      <Route path="/enhanced-search-demo" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading enhanced search demo...</div>}>
          <EnhancedSearchDemo />
        </Suspense>
      } />
      
      <Route path="/voice-control-demo" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading voice control demo...</div>}>
          <VoiceControlDemo />
        </Suspense>
      } />
      
      <Route path="/monetization-test" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading monetization test...</div>}>
          <MonetizationTest />
        </Suspense>
      } />
      
      {/* Legal & Privacy Routes */}
      <Route path="/privacy" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading privacy...</div>}>
          <Privacy />
        </Suspense>
      } />
      
      <Route path="/pricing" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading pricing...</div>}>
          <Pricing />
        </Suspense>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin-login" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading admin login...</div>}>
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
      
      <Route path="/admin/analytics" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading admin analytics...</div>}>
            <AdminAnalytics />
          </Suspense>
        </AdminRoute>
      } />
      
      <Route path="/admin/management" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading admin management...</div>}>
            <AdminManagement />
          </Suspense>
        </AdminRoute>
      } />
      
      <Route path="/admin/setup" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading admin setup...</div>}>
            <AdminSetup />
          </Suspense>
        </AdminRoute>
      } />
      
      <Route path="/admin/content-moderation" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading content moderation...</div>}>
            <ContentModeration />
          </Suspense>
        </AdminRoute>
      } />
      
      <Route path="/admin/system-settings" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading system settings...</div>}>
            <SystemSettings />
          </Suspense>
        </AdminRoute>
      } />
      
      <Route path="/admin/user-management" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading user management...</div>}>
            <UserManagement />
          </Suspense>
        </AdminRoute>
      } />
      
      <Route path="/admin/user-moderation" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading user moderation...</div>}>
            <UserModeration />
          </Suspense>
        </AdminRoute>
      } />
      
      <Route path="/community-insights" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading community insights...</div>}>
            <CommunityInsights />
          </Suspense>
        </AdminRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <NotFound />
        </Suspense>
      } />
    </Routes>
  );
};
