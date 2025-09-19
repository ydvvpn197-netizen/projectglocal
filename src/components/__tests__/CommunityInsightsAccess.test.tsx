/**
 * Test suite for Community Insights access control
 * Verifies that only admins and super admins can access the insights page
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CommunityInsights from '../../pages/CommunityInsights';
import { AdminRoute } from '../AdminRoute';

// Mock the hooks
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../hooks/useRBAC', () => ({
  useIsAdmin: vi.fn(),
  useRole: vi.fn(() => ({
    role: 'user',
    loading: false
  })),
  useHasRole: vi.fn(() => false)
}));

vi.mock('../../hooks/useSecurityAudit', () => ({
  useSecurityAudit: vi.fn(() => ({
    logAccessAttempt: vi.fn()
  }))
}));

// Mock the CommunityInsightsDashboard component
vi.mock('../../components/CommunityInsightsDashboard', () => ({
  default: () => <div data-testid="community-insights-dashboard">Community Insights Dashboard</div>
}));

import { useAuth } from '../../hooks/useAuth';
import { useIsAdmin } from '../../hooks/useRBAC';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseIsAdmin = useIsAdmin as ReturnType<typeof vi.fn>;

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    {children}
  </BrowserRouter>
);

describe('Community Insights Access Control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CommunityInsights Component', () => {
    it('should show loading state while checking admin status', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', email: 'user@example.com' },
        loading: false
      });
      
      mockUseIsAdmin.mockReturnValue({
        isAdmin: false,
        loading: true
      });

      render(
        <TestWrapper>
          <CommunityInsights />
        </TestWrapper>
      );

      expect(screen.getByText('Verifying access permissions...')).toBeInTheDocument();
    });

    it('should show access denied for non-admin users', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', email: 'user@example.com' },
        loading: false
      });
      
      mockUseIsAdmin.mockReturnValue({
        isAdmin: false,
        loading: false
      });

      render(
        <TestWrapper>
          <CommunityInsights />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Restricted')).toBeInTheDocument();
        expect(screen.getByText(/This page contains sensitive community insights/)).toBeInTheDocument();
        expect(screen.getByText('Admin privileges required')).toBeInTheDocument();
      });

      // Should not show the dashboard
      expect(screen.queryByTestId('community-insights-dashboard')).not.toBeInTheDocument();
    });

    it('should show dashboard for admin users', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'admin-1', email: 'admin@example.com' },
        loading: false
      });
      
      mockUseIsAdmin.mockReturnValue({
        isAdmin: true,
        loading: false
      });

      render(
        <TestWrapper>
          <CommunityInsights />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('community-insights-dashboard')).toBeInTheDocument();
      });

      // Should not show access denied message
      expect(screen.queryByText('Access Restricted')).not.toBeInTheDocument();
    });

    it('should show dashboard for super admin users', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'superadmin-1', email: 'superadmin@example.com' },
        loading: false
      });
      
      mockUseIsAdmin.mockReturnValue({
        isAdmin: true, // Super admins are also considered admins
        loading: false
      });

      render(
        <TestWrapper>
          <CommunityInsights />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('community-insights-dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('AdminRoute Component', () => {
    it('should redirect unauthenticated users to signin', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false
      });
      
      mockUseIsAdmin.mockReturnValue({
        isAdmin: false,
        loading: false
      });

      render(
        <TestWrapper>
          <AdminRoute>
            <div data-testid="protected-content">Protected Content</div>
          </AdminRoute>
        </TestWrapper>
      );

      // Should not show protected content
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should show access denied for authenticated non-admin users', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', email: 'user@example.com' },
        loading: false
      });
      
      mockUseIsAdmin.mockReturnValue({
        isAdmin: false,
        loading: false
      });

      render(
        <TestWrapper>
          <AdminRoute>
            <div data-testid="protected-content">Protected Content</div>
          </AdminRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Administrator Access Required')).toBeInTheDocument();
        expect(screen.getByText(/Admin or Super Admin role required/)).toBeInTheDocument();
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should show protected content for admin users', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'admin-1', email: 'admin@example.com' },
        loading: false
      });
      
      mockUseIsAdmin.mockReturnValue({
        isAdmin: true,
        loading: false
      });

      render(
        <TestWrapper>
          <AdminRoute>
            <div data-testid="protected-content">Protected Content</div>
          </AdminRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      expect(screen.queryByText('Administrator Access Required')).not.toBeInTheDocument();
    });

    it('should show loading state while checking authentication', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true
      });
      
      mockUseIsAdmin.mockReturnValue({
        isAdmin: false,
        loading: true
      });

      render(
        <TestWrapper>
          <AdminRoute>
            <div data-testid="protected-content">Protected Content</div>
          </AdminRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Verifying admin access...')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });
});
