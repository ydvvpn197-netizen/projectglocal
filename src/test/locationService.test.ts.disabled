
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocationService } from '../services/locationService';
import { createUserPreferencesFallback } from '../utils/databaseUtils';

// Mock the database utils
vi.mock('../utils/databaseUtils', () => ({
  createUserPreferencesFallback: vi.fn(() => ({
    location_radius_km: 10,
    location_notifications: true,
    email_notifications: true,
    push_notifications: true,
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    category: 'general'
  })),
  checkTableExists: vi.fn()
}));

describe('LocationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserLocationPreferences', () => {
    it('should return fallback preferences when table is not available', async () => {
      // Mock the checkTableExists function to return false
      const { checkTableExists } = await import('../utils/databaseUtils');
      vi.mocked(checkTableExists).mockResolvedValue({ exists: false });

      const preferences = await LocationService.getUserLocationPreferences();
      const fallback = createUserPreferencesFallback();
      
      expect(preferences).toEqual(fallback);
    });

    it('should return fallback preferences structure', () => {
      const fallback = createUserPreferencesFallback();
      
      expect(fallback).toHaveProperty('location_radius_km');
      expect(fallback).toHaveProperty('location_notifications');
      expect(fallback).toHaveProperty('email_notifications');
      expect(fallback).toHaveProperty('push_notifications');
      expect(fallback).toHaveProperty('theme');
      expect(fallback).toHaveProperty('language');
      expect(fallback).toHaveProperty('timezone');
      expect(fallback).toHaveProperty('category');
      
      expect(typeof fallback.location_radius_km).toBe('number');
      expect(typeof fallback.location_notifications).toBe('boolean');
      expect(typeof fallback.email_notifications).toBe('boolean');
      expect(typeof fallback.push_notifications).toBe('boolean');
      expect(typeof fallback.theme).toBe('string');
      expect(typeof fallback.language).toBe('string');
      expect(typeof fallback.timezone).toBe('string');
      expect(typeof fallback.category).toBe('string');
    });
  });
});
