import { describe, it, expect } from 'vitest';
import { 
  snakeToCamel, 
  camelToSnake, 
  transformSupabaseResponse, 
  transformForSupabase,
  transformers 
} from '@/utils/dataTransformation';

describe('Data Transformation Utils', () => {
  describe('snakeToCamel', () => {
    it('should transform snake_case keys to camelCase', () => {
      const input = {
        user_id: '123',
        display_name: 'John Doe',
        created_at: '2023-01-01T00:00:00Z',
        profile_data: {
          avatar_url: 'https://example.com/avatar.jpg',
          bio_text: 'Hello world'
        }
      };

      const expected = {
        userId: '123',
        displayName: 'John Doe',
        createdAt: '2023-01-01T00:00:00Z',
        profileData: {
          avatarUrl: 'https://example.com/avatar.jpg',
          bioText: 'Hello world'
        }
      };

      expect(snakeToCamel(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = [
        { user_id: '1', display_name: 'User 1' },
        { user_id: '2', display_name: 'User 2' }
      ];

      const expected = [
        { userId: '1', displayName: 'User 1' },
        { userId: '2', displayName: 'User 2' }
      ];

      expect(snakeToCamel(input)).toEqual(expected);
    });

    it('should handle null and non-objects', () => {
      expect(snakeToCamel(null)).toBeNull();
      expect(snakeToCamel('string')).toBe('string');
      expect(snakeToCamel(123)).toBe(123);
    });

    it('should exclude specified keys', () => {
      const input = {
        user_id: '123',
        password: 'secret',
        display_name: 'John'
      };

      const result = snakeToCamel(input, { excludeKeys: ['password'] });

      expect(result).toEqual({
        userId: '123',
        displayName: 'John'
      });
      expect(result.password).toBeUndefined();
    });

    it('should transform dates when option is enabled', () => {
      const input = {
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
      };

      const result = snakeToCamel(input, { transformDates: true });

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('camelToSnake', () => {
    it('should transform camelCase keys to snake_case', () => {
      const input = {
        userId: '123',
        displayName: 'John Doe',
        createdAt: '2023-01-01T00:00:00Z',
        profileData: {
          avatarUrl: 'https://example.com/avatar.jpg',
          bioText: 'Hello world'
        }
      };

      const expected = {
        user_id: '123',
        display_name: 'John Doe',
        created_at: '2023-01-01T00:00:00Z',
        profile_data: {
          avatar_url: 'https://example.com/avatar.jpg',
          bio_text: 'Hello world'
        }
      };

      expect(camelToSnake(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = [
        { userId: '1', displayName: 'User 1' },
        { userId: '2', displayName: 'User 2' }
      ];

      const expected = [
        { user_id: '1', display_name: 'User 1' },
        { user_id: '2', display_name: 'User 2' }
      ];

      expect(camelToSnake(input)).toEqual(expected);
    });

    it('should transform dates to ISO strings when option is enabled', () => {
      const input = {
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z')
      };

      const result = camelToSnake(input, { transformDates: true });

      expect(result.created_at).toBe('2023-01-01T00:00:00.000Z');
      expect(result.updated_at).toBe('2023-01-02T00:00:00.000Z');
    });
  });

  describe('transformSupabaseResponse', () => {
    it('should transform Supabase response format', () => {
      const response = {
        data: {
          user_id: '123',
          display_name: 'John Doe'
        },
        error: null
      };

      const result = transformSupabaseResponse(response);

      expect(result).toEqual({
        data: {
          userId: '123',
          displayName: 'John Doe'
        },
        error: null
      });
    });

    it('should handle direct data', () => {
      const data = {
        user_id: '123',
        display_name: 'John Doe'
      };

      const result = transformSupabaseResponse(data);

      expect(result).toEqual({
        userId: '123',
        displayName: 'John Doe'
      });
    });

    it('should handle null response', () => {
      expect(transformSupabaseResponse(null)).toBeNull();
    });
  });

  describe('transformForSupabase', () => {
    it('should transform frontend data for Supabase', () => {
      const data = {
        userId: '123',
        displayName: 'John Doe',
        createdAt: new Date('2023-01-01T00:00:00Z')
      };

      const result = transformForSupabase(data, { transformDates: true });

      expect(result).toEqual({
        user_id: '123',
        display_name: 'John Doe',
        created_at: '2023-01-01T00:00:00.000Z'
      });
    });
  });

  describe('transformers', () => {
    it('should provide type-safe transformation functions', () => {
      const userData = {
        user_id: '123',
        display_name: 'John Doe',
        password: 'secret'
      };

      const frontendData = transformers.user.toFrontend(userData);
      expect(frontendData.userId).toBe('123');
      expect(frontendData.displayName).toBe('John Doe');
      expect(frontendData.password).toBeUndefined(); // Should be excluded

      const supabaseData = transformers.user.toSupabase(frontendData);
      expect(supabaseData.user_id).toBe('123');
      expect(supabaseData.display_name).toBe('John Doe');
      expect(supabaseData.password).toBeUndefined();
    });

    it('should handle community data transformations', () => {
      const communityData = {
        group_id: '456',
        group_name: 'Test Group',
        created_at: '2023-01-01T00:00:00Z'
      };

      const frontendData = transformers.community.toFrontend(communityData);
      expect(frontendData.groupId).toBe('456');
      expect(frontendData.groupName).toBe('Test Group');
      expect(frontendData.createdAt).toBeInstanceOf(Date);
    });
  });
});
