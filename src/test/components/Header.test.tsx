/**
 * Header Component Tests
 * Tests for the Header component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UniformHeader } from '../../components/UniformHeader';

// Mock the AuthContext
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
};

const mockAuthContext = {
  user: mockUser,
  loading: false,
  signOut: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
};

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock the notification components
vi.mock('../../components/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell">Notification Bell</div>,
}));

vi.mock('../../components/NotificationButton', () => ({
  NotificationButton: () => <div data-testid="notification-button">Notification Button</div>,
}));

describe('Header Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it('should render the header with logo', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <UniformHeader />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Glocal')).toBeInTheDocument();
  });

  it('should render navigation links when user is authenticated', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <UniformHeader />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.getByText('Book Artists')).toBeInTheDocument();
  });

  it('should render notification bell when user is authenticated', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <UniformHeader />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });

  it('should render search input when user is authenticated', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <UniformHeader />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByPlaceholderText('Search artists, events, posts...')).toBeInTheDocument();
  });

  it('should render user menu button when user is authenticated', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <UniformHeader />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Look for the user menu button (it has a user icon)
    const userButtons = screen.getAllByRole('button');
    expect(userButtons.length).toBeGreaterThan(0);
  });
});
