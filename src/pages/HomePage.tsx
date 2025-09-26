/**
 * HomePage - Consolidated home page component
 * Replaces ConsolidatedIndex and Index components
 */

import React, { Suspense, lazy } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePerformanceMetrics } from '@/utils/performanceMonitor';
import { ErrorBoundary } from '@/components/error/ComprehensiveErrorBoundary';
import { LazyLoader } from '@/components/LazyLoader';

// Lazy load heavy components
const NewsFeed = lazy(() => import('@/components/news/EnhancedNewsFeed'));
const CommunityHighlights = lazy(() => import('@/components/community/CommunityHighlights'));
const EventCarousel = lazy(() => import('@/components/events/EventCarousel'));
const CreatorSpotlight = lazy(() => import('@/components/artist/CreatorSpotlight'));
const LocalBusinesses = lazy(() => import('@/components/business/LocalBusinesses'));
const CivicEngagement = lazy(() => import('@/components/government/CivicEngagement'));

// Lazy load layout components
const Header = lazy(() => import('@/components/layout/Header'));
const Footer = lazy(() => import('@/components/layout/Footer'));
const MobileNavigation = lazy(() => import('@/components/navigation/MobileBottomNavigation'));

export const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { score, isGood, recommendations } = usePerformanceMetrics();

  if (isLoading) {
    return <LazyLoader message="Loading your community..." />;
  }

  return (
    <ErrorBoundary level="page" showDetails={import.meta.env.DEV}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Performance Monitor (Development only) */}
        {import.meta.env.DEV && (
          <div className="fixed top-4 left-4 z-50 bg-black/80 text-white p-2 rounded text-xs">
            <div>Performance Score: {score}/100</div>
            <div>Status: {isGood ? '✅ Good' : '⚠️ Needs Improvement'}</div>
            {recommendations.length > 0 && (
              <div className="mt-1">
                <div className="text-yellow-400">Recommendations:</div>
                <ul className="text-xs">
                  {recommendations.slice(0, 2).map((rec, i) => (
                    <li key={i}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <Suspense fallback={<div className="h-16 bg-white shadow-sm animate-pulse" />}>
          <Header />
        </Suspense>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 space-y-8">
          {/* Hero Section */}
          <section className="text-center py-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-blue-600">TheGlocal</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your privacy-first digital public square. Connect with your local community, 
              discover events, and engage in meaningful discussions.
            </p>
            
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Join Your Community
                </button>
                <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Learn More
                </button>
              </div>
            )}
          </section>

          {/* News Feed */}
          <Suspense fallback={<div className="h-64 bg-white rounded-lg shadow-sm animate-pulse" />}>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Local News & Updates</h2>
              <NewsFeed />
            </section>
          </Suspense>

          {/* Community Highlights */}
          <Suspense fallback={<div className="h-48 bg-white rounded-lg shadow-sm animate-pulse" />}>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Highlights</h2>
              <CommunityHighlights />
            </section>
          </Suspense>

          {/* Events Carousel */}
          <Suspense fallback={<div className="h-48 bg-white rounded-lg shadow-sm animate-pulse" />}>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
              <EventCarousel />
            </section>
          </Suspense>

          {/* Creator Spotlight */}
          <Suspense fallback={<div className="h-48 bg-white rounded-lg shadow-sm animate-pulse" />}>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Local Creators</h2>
              <CreatorSpotlight />
            </section>
          </Suspense>

          {/* Local Businesses */}
          <Suspense fallback={<div className="h-48 bg-white rounded-lg shadow-sm animate-pulse" />}>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Local Businesses</h2>
              <LocalBusinesses />
            </section>
          </Suspense>

          {/* Civic Engagement */}
          <Suspense fallback={<div className="h-48 bg-white rounded-lg shadow-sm animate-pulse" />}>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Civic Engagement</h2>
              <CivicEngagement />
            </section>
          </Suspense>
        </main>

        {/* Footer */}
        <Suspense fallback={<div className="h-32 bg-gray-900 animate-pulse" />}>
          <Footer />
        </Suspense>

        {/* Mobile Navigation */}
        <Suspense fallback={<div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t animate-pulse" />}>
          <MobileNavigation />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default HomePage;
