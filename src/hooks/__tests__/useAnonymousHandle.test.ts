/**
 * Tests for useAnonymousHandle hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAnonymousHandle } from '../useAnonymousHandle';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock useAuth hook
jest.mock('../useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    isLoading: false,
  }),
}));

describe('useAnonymousHandle', () => {
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;
  const mockFrom = jest.fn();
  const mockSelect = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();
  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockFrom as jest.MockedFunction<typeof mockFrom>);
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
  });

  it('should load existing anonymous handle', async () => {
    const mockHandle = {
      id: 'profile-id',
      anonymous_handle: 'MysteriousObserver1234',
      anonymous_display_name: 'Anonymous MysteriousObserver1234',
      is_anonymous: true,
      can_reveal_identity: false,
      created_at: '2025-01-28T00:00:00Z',
    };

    mockSingle.mockResolvedValue({
      data: mockHandle,
      error: null,
    });

    const { result } = renderHook(() => useAnonymousHandle());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.anonymousHandle).toEqual({
      id: 'profile-id',
      handle: 'MysteriousObserver1234',
      displayName: 'Anonymous MysteriousObserver1234',
      isAnonymous: true,
      canRevealIdentity: false,
      createdAt: '2025-01-28T00:00:00Z',
    });
  });

  it('should create new anonymous handle if none exists', async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'No rows found' },
    });

    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'profile-id',
        anonymous_handle: 'SilentWatcher5678',
        anonymous_display_name: 'Anonymous SilentWatcher5678',
        is_anonymous: true,
        can_reveal_identity: false,
        created_at: '2025-01-28T00:00:00Z',
      },
      error: null,
    });

    const { result } = renderHook(() => useAnonymousHandle());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.anonymousHandle).toBeDefined();
    expect(result.current.anonymousHandle?.handle).toBe('SilentWatcher5678');
  });

  it('should toggle anonymity', async () => {
    const mockHandle = {
      id: 'profile-id',
      anonymous_handle: 'MysteriousObserver1234',
      anonymous_display_name: 'Anonymous MysteriousObserver1234',
      is_anonymous: true,
      can_reveal_identity: false,
      created_at: '2025-01-28T00:00:00Z',
    };

    mockSingle.mockResolvedValue({
      data: mockHandle,
      error: null,
    });

    mockEq.mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useAnonymousHandle());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleAnonymity(false);
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      is_anonymous: false,
    });
  });

  it('should update display name', async () => {
    const mockHandle = {
      id: 'profile-id',
      anonymous_handle: 'MysteriousObserver1234',
      anonymous_display_name: 'Anonymous MysteriousObserver1234',
      is_anonymous: true,
      can_reveal_identity: false,
      created_at: '2025-01-28T00:00:00Z',
    };

    mockSingle.mockResolvedValue({
      data: mockHandle,
      error: null,
    });

    mockEq.mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useAnonymousHandle());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateDisplayName('My Custom Name');
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      anonymous_display_name: 'My Custom Name',
    });
  });

  it('should reveal identity', async () => {
    const mockHandle = {
      id: 'profile-id',
      anonymous_handle: 'MysteriousObserver1234',
      anonymous_display_name: 'Anonymous MysteriousObserver1234',
      is_anonymous: true,
      can_reveal_identity: false,
      created_at: '2025-01-28T00:00:00Z',
    };

    mockSingle.mockResolvedValue({
      data: mockHandle,
      error: null,
    });

    mockEq.mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useAnonymousHandle());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.revealIdentity();
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      can_reveal_identity: true,
      is_anonymous: false,
    });
  });

  it('should handle errors gracefully', async () => {
    mockSingle.mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useAnonymousHandle());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Database error');
    expect(result.current.anonymousHandle).toBeNull();
  });

  it('should generate unique anonymous handles', async () => {
    const { result } = renderHook(() => useAnonymousHandle());

    // Test handle generation (this would be tested in the actual function)
    const handle1 = await result.current.createAnonymousHandle();
    const handle2 = await result.current.createAnonymousHandle();

    expect(handle1.handle).not.toBe(handle2.handle);
    expect(handle1.handle).toMatch(/^[A-Za-z]+[A-Za-z]+\d+$/);
  });
});
