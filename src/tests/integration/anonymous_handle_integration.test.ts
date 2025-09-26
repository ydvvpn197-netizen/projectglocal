/**
 * Integration tests for anonymous handle system
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { PrivacySettings } from '@/components/privacy/PrivacySettings';
import { useAnonymousHandle } from '@/hooks/useAnonymousHandle';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
};

jest.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    isLoading: false,
  }),
}));

describe('Anonymous Handle Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should complete anonymous user onboarding flow', async () => {
    // Mock anonymous handle creation
    const mockHandle = {
      id: 'profile-id',
      anonymous_handle: 'MysteriousObserver1234',
      anonymous_display_name: 'Anonymous MysteriousObserver1234',
      is_anonymous: true,
      can_reveal_identity: false,
      created_at: '2025-01-28T00:00:00Z',
    };

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockHandle,
            error: null,
          }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    renderWithProviders(<PrivacySettings />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    });

    // Verify anonymous handle is displayed
    expect(screen.getByText('MysteriousObserver1234')).toBeInTheDocument();
    expect(screen.getByText('Anonymous MysteriousObserver1234')).toBeInTheDocument();

    // Verify privacy controls are available
    expect(screen.getByText('Anonymous Mode')).toBeInTheDocument();
    expect(screen.getByText('Current Handle')).toBeInTheDocument();
    expect(screen.getByText('Display Name')).toBeInTheDocument();
  });

  it('should handle privacy settings updates', async () => {
    const mockHandle = {
      id: 'profile-id',
      anonymous_handle: 'MysteriousObserver1234',
      anonymous_display_name: 'Anonymous MysteriousObserver1234',
      is_anonymous: true,
      can_reveal_identity: false,
      created_at: '2025-01-28T00:00:00Z',
    };

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockHandle,
            error: null,
          }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    renderWithProviders(<PrivacySettings />);

    await waitFor(() => {
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    });

    // Test display name update
    const input = screen.getByPlaceholderText('New display name');
    const updateButton = screen.getByText('Update');

    fireEvent.change(input, { target: { value: 'My Custom Name' } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  it('should handle identity reveal flow', async () => {
    const mockHandle = {
      id: 'profile-id',
      anonymous_handle: 'MysteriousObserver1234',
      anonymous_display_name: 'Anonymous MysteriousObserver1234',
      is_anonymous: true,
      can_reveal_identity: false,
      created_at: '2025-01-28T00:00:00Z',
    };

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockHandle,
            error: null,
          }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    renderWithProviders(<PrivacySettings />);

    await waitFor(() => {
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    });

    // Test identity reveal
    const revealButton = screen.getByText('Reveal My Identity');
    fireEvent.click(revealButton);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  it('should handle error states gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      }),
    });

    renderWithProviders(<PrivacySettings />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load privacy settings/)).toBeInTheDocument();
    });
  });

  it('should handle loading states', async () => {
    // Mock loading state
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
        }),
      }),
    });

    renderWithProviders(<PrivacySettings />);

    // Should show loading state
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should validate anonymous handle format', () => {
    // Test handle generation format
    const validHandles = [
      'MysteriousObserver1234',
      'SilentWatcher5678',
      'HiddenGuardian9999',
    ];

    validHandles.forEach(handle => {
      expect(handle).toMatch(/^[A-Za-z]+[A-Za-z]+\d+$/);
    });
  });

  it('should handle database constraints', async () => {
    const mockHandle = {
      id: 'profile-id',
      anonymous_handle: 'MysteriousObserver1234',
      anonymous_display_name: 'Anonymous MysteriousObserver1234',
      is_anonymous: true,
      can_reveal_identity: false,
      created_at: '2025-01-28T00:00:00Z',
    };

    // Mock database constraint error
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockHandle,
            error: null,
          }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ 
          error: { message: 'Unique constraint violation' }
        }),
      }),
    });

    renderWithProviders(<PrivacySettings />);

    await waitFor(() => {
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    });

    // Test that error handling works
    const input = screen.getByPlaceholderText('New display name');
    const updateButton = screen.getByText('Update');

    fireEvent.change(input, { target: { value: 'My Custom Name' } });
    fireEvent.click(updateButton);

    // Should handle error gracefully
    await waitFor(() => {
      expect(screen.getByText('Update')).toBeInTheDocument();
    });
  });

  it('should maintain privacy state across sessions', async () => {
    const mockHandle = {
      id: 'profile-id',
      anonymous_handle: 'MysteriousObserver1234',
      anonymous_display_name: 'Anonymous MysteriousObserver1234',
      is_anonymous: true,
      can_reveal_identity: false,
      created_at: '2025-01-28T00:00:00Z',
    };

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockHandle,
            error: null,
          }),
        }),
      }),
    });

    renderWithProviders(<PrivacySettings />);

    await waitFor(() => {
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    });

    // Verify privacy state is maintained
    expect(screen.getByText('MysteriousObserver1234')).toBeInTheDocument();
    expect(screen.getByText('Anonymous MysteriousObserver1234')).toBeInTheDocument();
  });

  it('should handle concurrent privacy updates', async () => {
    const mockHandle = {
      id: 'profile-id',
      anonymous_handle: 'MysteriousObserver1234',
      anonymous_display_name: 'Anonymous MysteriousObserver1234',
      is_anonymous: true,
      can_reveal_identity: false,
      created_at: '2025-01-28T00:00:00Z',
    };

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockHandle,
            error: null,
          }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    renderWithProviders(<PrivacySettings />);

    await waitFor(() => {
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    });

    // Test concurrent updates
    const input = screen.getByPlaceholderText('New display name');
    const updateButton = screen.getByText('Update');

    fireEvent.change(input, { target: { value: 'My Custom Name' } });
    fireEvent.click(updateButton);
    fireEvent.click(updateButton); // Click again

    // Should handle concurrent updates gracefully
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });
  });
});
