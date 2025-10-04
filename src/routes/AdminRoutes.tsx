/**
 * Admin Routes Component
 * Routes for admin-only pages
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AdminRoute } from '@/components/AdminRoute';

// Lazy load admin pages
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminManagement = lazy(() => import('@/pages/admin/AdminManagement'));
const AdminSetup = lazy(() => import('@/pages/admin/AdminSetup'));
const ContentModeration = lazy(() => import('@/pages/admin/ContentModeration'));
const SystemSettings = lazy(() => import('@/pages/admin/SystemSettings'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const UserModeration = lazy(() => import('@/pages/admin/UserModeration'));
const CommunityInsights = lazy(() => import('@/pages/ConsolidatedCommunityInsights'));

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/analytics" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading admin analytics...</div>}>
            <AdminAnalytics />
          </Suspense>
        </AdminRoute>
      } />
      
      <Route path="/management" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading admin management...</div>}>
            <AdminManagement />
          </Suspense>
        </AdminRoute>
      } />
      
      <Route path="/setup" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading admin setup...</div>}>
            <AdminSetup />
          </Suspense>
        </AdminRoute>
      } />
      
      <Route path="/content-moderation" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading content moderation...</div>}>
            <ContentModeration />
          </Suspense>
        </AdminRoute>
      } />
      
      <Route path="/system-settings" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading system settings...</div>}>
            <SystemSettings />
          </Suspense>
        </AdminRoute>
      } />
      
      <Route path="/user-management" element={
        <AdminRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading user management...</div>}>
            <UserManagement />
          </Suspense>
        </AdminRoute>
      } />
      
      <Route path="/user-moderation" element={
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
      
      {/* Redirect unknown admin routes to main admin dashboard */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};
