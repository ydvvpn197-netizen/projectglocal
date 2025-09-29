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
const Index = lazy(() => import('@/pages/ConsolidatedIndex'));
const Events = lazy(() => import('@/pages/ConsolidatedEvents'));
const EventDetails = lazy(() => import('@/pages/EventDetails'));
const CreateEvent = lazy(() => import('@/pages/CreateEvent'));
const Community = lazy(() => import('@/pages/ConsolidatedCommunity'));
const Profile = lazy(() => import('@/pages/ConsolidatedProfile'));
const Messages = lazy(() => import('@/pages/EnhancedMessages'));
const Notifications = lazy(() => import('@/pages/NotificationsPage'));
const Settings = lazy(() => import('@/pages/ConsolidatedSettings'));
const About = lazy(() => import('@/pages/About'));
const Discover = lazy(() => import('@/pages/Discover'));
const News = lazy(() => import('@/pages/News'));
const Feed = lazy(() => import('@/pages/ConsolidatedFeed'));
const Dashboard = lazy(() => import('@/pages/ConsolidatedDashboard'));
const SignIn = lazy(() => import('@/pages/SignIn'));
const SignUp = lazy(() => import('@/pages/SignUp'));
const CommunityInsights = lazy(() => import('@/pages/ConsolidatedCommunityInsights'));
const LegalAssistant = lazy(() => import('@/pages/LegalAssistant'));
const LifeWish = lazy(() => import('@/pages/LifeWish'));

// Additional pages that need integration
const PublicSquare = lazy(() => import('@/pages/PublicSquare'));
const Polls = lazy(() => import('@/pages/Polls'));
const CivicEngagementTest = lazy(() => import('@/pages/CivicEngagementTest'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const BookArtist = lazy(() => import('@/pages/BookArtist'));
const BookArtistSimple = lazy(() => import('@/pages/BookArtistSimple'));
const BookArtistTest = lazy(() => import('@/pages/BookArtistTest'));
const ArtistDashboard = lazy(() => import('@/pages/ArtistDashboard'));
const ArtistProfile = lazy(() => import('@/pages/ArtistProfile'));
const ArtistOnboarding = lazy(() => import('@/pages/ArtistOnboarding'));
const LocalBusinesses = lazy(() => import('@/pages/LocalBusinesses'));
const LocalCommunities = lazy(() => import('@/pages/LocalCommunities'));
const TestButtons = lazy(() => import('@/pages/TestButtons'));
const PerformancePage = lazy(() => import('@/pages/PerformancePage'));
const EnhancedSearchDemo = lazy(() => import('@/pages/EnhancedSearchDemo'));
const VoiceControlDemo = lazy(() => import('@/pages/VoiceControlDemo'));
const MonetizationTest = lazy(() => import('@/pages/MonetizationTest'));
const SubscriptionPage = lazy(() => import('@/pages/SubscriptionPage'));
const SubscriptionPlansPage = lazy(() => import('@/pages/SubscriptionPlansPage'));
const SubscriptionSuccess = lazy(() => import('@/pages/SubscriptionSuccess'));
const SubscriptionCancel = lazy(() => import('@/pages/SubscriptionCancel'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('@/pages/PaymentCancel'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const PrivacyFirstOnboarding = lazy(() => import('@/pages/PrivacyFirstOnboarding'));
const LocationSetup = lazy(() => import('@/pages/LocationSetup'));
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
      <Route path="/event/:eventId" element={
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading event...</div>}>
            <EventDetails />
          </Suspense>
        </ErrorBoundary>
      } />
      <Route path="/create-event" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <CreateEvent />
        </Suspense>
      } />
      
      {/* Community Routes */}
      <Route path="/community" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading community...</div>}>
          <Community />
        </Suspense>
      } />
      
      {/* User Routes */}
      <Route path="/profile/:userId?" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading profile...</div>}>
          <Profile />
        </Suspense>
      } />
      <Route path="/messages" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading messages...</div>}>
          <Messages />
        </Suspense>
      } />
      <Route path="/notifications" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading notifications...</div>}>
          <Notifications />
        </Suspense>
      } />
      <Route path="/settings" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading settings...</div>}>
          <Settings />
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
      
      {/* Auth Routes */}
      <Route path="/signin" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <SignIn />
        </Suspense>
      } />
      <Route path="/signup" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <SignUp />
        </Suspense>
      } />
      
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
      
      {/* Artist & Booking Routes */}
      <Route path="/book-artist" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading book artist...</div>}>
          <BookArtist />
        </Suspense>
      } />
      
      <Route path="/book-artist-simple" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading book artist...</div>}>
          <BookArtistSimple />
        </Suspense>
      } />
      
      <Route path="/book-artist-test" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading book artist test...</div>}>
          <BookArtistTest />
        </Suspense>
      } />
      
      <Route path="/artist-dashboard" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading artist dashboard...</div>}>
          <ArtistDashboard />
        </Suspense>
      } />
      
      <Route path="/artist-profile" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading artist profile...</div>}>
          <ArtistProfile />
        </Suspense>
      } />
      
      <Route path="/artist-onboarding" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading artist onboarding...</div>}>
          <ArtistOnboarding />
        </Suspense>
      } />
      
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
      
      {/* Subscription & Payment Routes */}
      <Route path="/subscription" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading subscription...</div>}>
          <SubscriptionPage />
        </Suspense>
      } />
      
      <Route path="/subscription-plans" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading subscription plans...</div>}>
          <SubscriptionPlansPage />
        </Suspense>
      } />
      
      <Route path="/subscription-success" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading subscription success...</div>}>
          <SubscriptionSuccess />
        </Suspense>
      } />
      
      <Route path="/subscription-cancel" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading subscription cancel...</div>}>
          <SubscriptionCancel />
        </Suspense>
      } />
      
      <Route path="/payment-success" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading payment success...</div>}>
          <PaymentSuccess />
        </Suspense>
      } />
      
      <Route path="/payment-cancel" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading payment cancel...</div>}>
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
      
      {/* Onboarding Routes */}
      <Route path="/onboarding" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading onboarding...</div>}>
          <Onboarding />
        </Suspense>
      } />
      
      <Route path="/privacy-first-onboarding" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading privacy first onboarding...</div>}>
          <PrivacyFirstOnboarding />
        </Suspense>
      } />
      
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
