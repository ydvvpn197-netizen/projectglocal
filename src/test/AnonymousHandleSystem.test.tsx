/**
 * Anonymous Handle System Tests
 * Tests for privacy-first anonymous handle functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnonymitySettings } from '@/components/privacy/AnonymitySettings';
import { useAnonymousHandle } from '@/hooks/useAnonymousHandle';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              anonymous_handle: 'SilentObserver1234',
              is_anonymous: true,
              real_name_visibility: false,
              handle_generated_at: '2025-01-28T10:00:00Z'
            },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null
        }))
      }))
    })),
    rpc: vi.fn(() => ({
      data: 'NewSilentObserver5678',
      error: null
    }))
  }
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' }
  })
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

describe('Anonymous Handle System', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('AnonymitySettings Component', () => {
    it('should render anonymity settings with current handle', async () => {
      renderWithQueryClient(<AnonymitySettings />);

      await waitFor(() => {
        expect(screen.getByText('SilentObserver1234')).toBeInTheDocument();
      });

      expect(screen.getByText('Privacy & Anonymity Settings')).toBeInTheDocument();
      expect(screen.getByText('Anonymous Mode')).toBeInTheDocument();
      expect(screen.getByText('Show Real Name')).toBeInTheDocument();
    });

    it('should show regenerate handle button', async () => {
      renderWithQueryClient(<AnonymitySettings />);

      await waitFor(() => {
        expect(screen.getByText('Regenerate')).toBeInTheDocument();
      });
    });

    it('should display current anonymity status', async () => {
      renderWithQueryClient(<AnonymitySettings />);

      await waitFor(() => {
        expect(screen.getByText('Anonymous')).toBeInTheDocument();
      });
    });

    it('should handle regenerate handle click', async () => {
      renderWithQueryClient(<AnonymitySettings />);

      await waitFor(() => {
        const regenerateButton = screen.getByText('Regenerate');
        fireEvent.click(regenerateButton);
      });

      // Should call the regenerate function
      expect(supabase.rpc).toHaveBeenCalledWith('generate_anonymous_handle');
    });

    it('should handle anonymity toggle', async () => {
      renderWithQueryClient(<AnonymitySettings />);

      await waitFor(() => {
        const toggle = screen.getByRole('switch', { name: /anonymous mode/i });
        fireEvent.click(toggle);
      });

      // Should call update function
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  describe('useAnonymousHandle Hook', () => {
    it('should load handle data on mount', async () => {
      const { result } = renderHook(() => useAnonymousHandle(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        )
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.anonymousHandle).toBe('SilentObserver1234');
      expect(result.current.isAnonymous).toBe(true);
      expect(result.current.realNameVisibility).toBe(false);
    });

    it('should handle update anonymity settings', async () => {
      const { result } = renderHook(() => useAnonymousHandle(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        )
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateAnonymitySettings(false, true);
      });

      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should handle regenerate handle', async () => {
      const { result } = renderHook(() => useAnonymousHandle(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        )
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.regenerateHandle();
      });

      expect(supabase.rpc).toHaveBeenCalledWith('generate_anonymous_handle');
    });

    it('should get user display name', async () => {
      const { result } = renderHook(() => useAnonymousHandle(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        )
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const displayInfo = await result.current.getUserDisplayName('test-user-id');
      
      expect(displayInfo.display_name).toBeDefined();
      expect(typeof displayInfo.is_anonymous).toBe('boolean');
      expect(typeof displayInfo.can_see_real_name).toBe('boolean');
    });
  });

  describe('Database Functions', () => {
    it('should generate unique anonymous handles', async () => {
      // Test that the generate_anonymous_handle function is called
      const mockGenerate = vi.fn(() => Promise.resolve({ data: 'UniqueHandle123', error: null }));
      supabase.rpc = mockGenerate;

      const { result } = renderHook(() => useAnonymousHandle(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        )
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.regenerateHandle();
      });

      expect(mockGenerate).toHaveBeenCalledWith('generate_anonymous_handle');
    });

    it('should handle errors gracefully', async () => {
      // Mock error response
      supabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: { message: 'Database error' }
            }))
          }))
        }))
      }));

      const { result } = renderHook(() => useAnonymousHandle(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        )
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toContain('Database error');
    });
  });

  describe('Privacy Controls', () => {
    it('should respect anonymity settings', async () => {
      renderWithQueryClient(<AnonymitySettings />);

      await waitFor(() => {
        expect(screen.getByText('Anonymous')).toBeInTheDocument();
      });

      // When anonymous, real name visibility should be disabled
      const realNameToggle = screen.getByRole('switch', { name: /show real name/i });
      expect(realNameToggle).toBeDisabled();
    });

    it('should show privacy information', async () => {
      renderWithQueryClient(<AnonymitySettings />);

      await waitFor(() => {
        expect(screen.getByText('Privacy Information')).toBeInTheDocument();
        expect(screen.getByText(/Your anonymous handle is unique/)).toBeInTheDocument();
        expect(screen.getByText(/Anonymous mode protects your identity/)).toBeInTheDocument();
      });
    });
  });
});

// Helper function for renderHook (if not available in test environment)
function renderHook<T>(hook: () => T, options?: { wrapper?: React.ComponentType }) {
  const result = { current: null as T };
  const TestComponent = () => {
    result.current = hook();
    return null;
  };

  const Wrapper = options?.wrapper || React.Fragment;
  
  render(
    <Wrapper>
      <TestComponent />
    </Wrapper>
  );

  return { result };
}

// Helper function for act (if not available in test environment)
async function act(callback: () => Promise<void>) {
  await callback();
}
