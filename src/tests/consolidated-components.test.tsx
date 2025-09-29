/**
 * Consolidated Components Tests
 * Tests for consolidated dashboard, feed, and layout components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import consolidated components
import ConsolidatedDashboard from '@/pages/ConsolidatedDashboard';
import ConsolidatedFeed from '@/pages/ConsolidatedFeed';
import ConsolidatedIndex from '@/pages/ConsolidatedIndex';
import { MainLayout } from '@/components/MainLayout';

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Consolidated Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ConsolidatedDashboard', () => {
    it('renders dashboard for regular users', async () => {
      render(
        <TestWrapper>
          <ConsolidatedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/My Dashboard|Artist Dashboard/)).toBeInTheDocument();
      });
    });

    it('shows user profile information', async () => {
      render(
        <TestWrapper>
          <ConsolidatedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });

    it('displays stats cards', async () => {
      render(
        <TestWrapper>
          <ConsolidatedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Posts Created|Total Bookings|Communities/)).toBeInTheDocument();
      });
    });

    it('has navigation tabs', async () => {
      render(
        <TestWrapper>
          <ConsolidatedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Activity')).toBeInTheDocument();
        expect(screen.getByText('Bookings')).toBeInTheDocument();
      });
    });
  });

  describe('ConsolidatedFeed', () => {
    it('renders feed component', async () => {
      render(
        <TestWrapper>
          <ConsolidatedFeed />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Trending|Latest|Following|Local/)).toBeInTheDocument();
      });
    });

    it('has search functionality', async () => {
      render(
        <TestWrapper>
          <ConsolidatedFeed />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: 'test search' } });
      expect(searchInput).toHaveValue('test search');
    });

    it('shows trending topics', async () => {
      render(
        <TestWrapper>
          <ConsolidatedFeed />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Local Music Festival|Community Garden/)).toBeInTheDocument();
      });
    });
  });

  describe('ConsolidatedIndex', () => {
    it('renders home page', async () => {
      render(
        <TestWrapper>
          <ConsolidatedIndex />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Welcome|Discover|Connect/)).toBeInTheDocument();
      });
    });

    it('has navigation elements', async () => {
      render(
        <TestWrapper>
          <ConsolidatedIndex />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
    });
  });

  describe('MainLayout', () => {
    it('renders layout with children', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div data-testid="test-content">Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('shows header by default', () => {
      render(
        <TestWrapper>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Header should be present (mocked)
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('can hide header when specified', () => {
      render(
        <TestWrapper>
          <MainLayout showHeader={false}>
            <div>Test Content</div>
          </MainLayout>
        </TestWrapper>
      );

      // Header should not be present
      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('dashboard integrates with layout', async () => {
      render(
        <TestWrapper>
          <MainLayout>
            <ConsolidatedDashboard />
          </MainLayout>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
        expect(screen.getByTestId('test-content') || screen.getByText(/Posts Created/)).toBeInTheDocument();
      });
    });

    it('feed integrates with layout', async () => {
      render(
        <TestWrapper>
          <MainLayout>
            <ConsolidatedFeed />
          </MainLayout>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Trending/)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <MainLayout>
            <ConsolidatedDashboard />
          </MainLayout>
        </TestWrapper>
      );

      // Should render without errors on mobile
      expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
    });

    it('adapts to desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(
        <TestWrapper>
          <MainLayout>
            <ConsolidatedDashboard />
          </MainLayout>
        </TestWrapper>
      );

      // Should render without errors on desktop
      expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing user gracefully', () => {
      // Mock no user
      vi.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({
          user: null,
          isLoading: false
        })
      }));

      render(
        <TestWrapper>
          <ConsolidatedDashboard />
        </TestWrapper>
      );

      // Should redirect or show appropriate message
      expect(screen.getByText(/signin|login/i)).toBeInTheDocument();
    });

    it('handles loading states', () => {
      // Mock loading state
      vi.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({
          user: null,
          isLoading: true
        })
      }));

      render(
        <TestWrapper>
          <ConsolidatedDashboard />
        </TestWrapper>
      );

      expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });
  });
});
