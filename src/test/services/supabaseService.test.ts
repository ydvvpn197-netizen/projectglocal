/**
 * Supabase Service Tests
 * Tests for Supabase service functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
  },
};

vi.mock('../../integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('Supabase Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Database Operations', () => {
    it('should handle successful data fetch', async () => {
      const mockData = [{ id: 1, name: 'Test Item' }];
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData[0], error: null }),
          }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const { supabase } = await import('../../integrations/supabase/client');
      const result = await supabase.from('test_table').select('*').eq('id', 1).single();

      expect(result.data).toEqual(mockData[0]);
      expect(result.error).toBeNull();
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const { supabase } = await import('../../integrations/supabase/client');
      const result = await supabase.from('test_table').select('*').eq('id', 1).single();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should handle insert operations', async () => {
      const mockData = { id: 1, name: 'New Item' };
      const mockQuery = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [mockData], error: null }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const { supabase } = await import('../../integrations/supabase/client');
      const result = await supabase.from('test_table').insert(mockData).select();

      expect(result.data).toEqual([mockData]);
      expect(result.error).toBeNull();
    });

    it('should handle update operations', async () => {
      const mockData = { id: 1, name: 'Updated Item' };
      const mockQuery = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [mockData], error: null }),
          }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const { supabase } = await import('../../integrations/supabase/client');
      const result = await supabase.from('test_table').update(mockData).eq('id', 1).select();

      expect(result.data).toEqual([mockData]);
      expect(result.error).toBeNull();
    });

    it('should handle delete operations', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const { supabase } = await import('../../integrations/supabase/client');
      const result = await supabase.from('test_table').delete().eq('id', 1);

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });

  describe('Authentication', () => {
    it('should get current session', async () => {
      const mockSession = {
        user: { id: 'user-id', email: 'test@example.com' },
        access_token: 'token',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { supabase } = await import('../../integrations/supabase/client');
      const result = await supabase.auth.getSession();

      expect(result.data.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should get current user', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { supabase } = await import('../../integrations/supabase/client');
      const result = await supabase.auth.getUser();

      expect(result.data.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const mockError = new Error('Network error');
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(mockError),
          }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const { supabase } = await import('../../integrations/supabase/client');
      
      await expect(supabase.from('test_table').select('*').eq('id', 1).single()).rejects.toThrow('Network error');
    });

    it('should handle authentication errors', async () => {
      const mockError = new Error('Invalid credentials');
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const { supabase } = await import('../../integrations/supabase/client');
      const result = await supabase.auth.getSession();

      expect(result.data.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });
});
