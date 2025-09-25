/**
 * App Routes Component
 * Main routing configuration
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AdminRoute } from '@/components/AdminRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load pages for better performance
const Index = lazy(() => import('@/pages/Index'));
const Events = lazy(() => import('@/pages/Events'));
const EventDetails = lazy(() => import('@/pages/EventDetails'));
const CreateEvent = lazy(() => import('@/pages/CreateEvent'));
const Community = lazy(() => import('@/pages/Community'));
const Profile = lazy(() => import('@/pages/Profile'));
const Messages = lazy(() => import('@/pages/Messages'));
const Notifications = lazy(() => import('@/pages/NotificationsPage'));
const Settings = lazy(() => import('@/pages/Settings'));
const About = lazy(() => import('@/pages/About'));
const Discover = lazy(() => import('@/pages/Discover'));
const News = lazy(() => import('@/pages/News'));
const SignIn = lazy(() => import('@/pages/SignIn'));
const SignUp = lazy(() => import('@/pages/SignUp'));
const CommunityInsights = lazy(() => import('@/pages/CommunityInsights'));
const LegalAssistant = lazy(() => import('@/pages/LegalAssistant'));
const LifeWish = lazy(() => import('@/pages/LifeWish'));

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main Routes */}
      <Route path="/" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <Index />
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
      
      {/* Admin Routes */}
      <Route path="/community-insights" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading community insights...</div>}>
            <CommunityInsights />
          </Suspense>
        </AdminRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};