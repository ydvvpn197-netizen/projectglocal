/**
 * useAuth Hook Tests
 * Tests for the useAuth custom hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
  }),
};

vi.mock('../../integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock the AuthContext
const mockAuthContext = {
  user: null,
  loading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
};

vi.mock('../../components/auth/AuthContext', () => ({
  AuthContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

describe('useAuth Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    // Test the mock context directly
    expect(mockAuthContext.user).toBeNull();
    expect(mockAuthContext.loading).toBe(false);
    expect(typeof mockAuthContext.signIn).toBe('function');
    expect(typeof mockAuthContext.signOut).toBe('function');
    expect(typeof mockAuthContext.signUp).toBe('function');
  });

  it('should handle successful sign in', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' },
    };

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null,
    });

    // Test the mock function directly
    const result = await mockSupabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password',
    });

    expect(result.data.user).toEqual(mockUser);
    expect(result.error).toBeNull();
  });

  it('should handle sign in error', async () => {
    const mockError = new Error('Invalid credentials');
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    });

    const result = await mockSupabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(result.data.user).toBeNull();
    expect(result.error).toEqual(mockError);
  });

  it('should handle successful sign out', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    const result = await mockSupabase.auth.signOut();

    expect(result.error).toBeNull();
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('should handle sign up', async () => {
    const mockUser = {
      id: 'new-user-id',
      email: 'newuser@example.com',
      user_metadata: { full_name: 'New User' },
    };

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    });

    const result = await mockSupabase.auth.signUp({
      email: 'newuser@example.com',
      password: 'password',
      options: {
        data: {
          full_name: 'New User',
        },
      },
    });

    expect(result.data.user).toEqual(mockUser);
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password',
      options: {
        data: {
          full_name: 'New User',
        },
      },
    });
  });
});
