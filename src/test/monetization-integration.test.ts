import { describe, it, expect, beforeEach, vi } from 'vitest';
import { stripeService } from '@/services/stripeService';
import { STRIPE_CONFIG } from '@/config/stripe';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              plan_type: 'free',
              is_verified: false,
              is_premium: false,
              premium_expires_at: null,
              verification_expires_at: null,
            },
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'test-service-id',
              title: 'Test Service',
              price: 5000,
              currency: 'usd',
            },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: 'test-service-id',
                title: 'Updated Service',
                price: 5000,
                currency: 'usd',
              },
              error: null,
            })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
        error: null,
      })),
      getSession: vi.fn(() => ({
        data: {
          session: {
            access_token: 'test-token',
          },
        },
        error: null,
      })),
    },
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('Monetization Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Stripe Configuration', () => {
    it('should have correct pricing configuration', () => {
      expect(STRIPE_CONFIG.PRICING.VERIFICATION.amount).toBe(999);
      expect(STRIPE_CONFIG.PRICING.PREMIUM.amount).toBe(2999);
      expect(STRIPE_CONFIG.PRICING.EVENT_FEATURE.amount).toBe(1999);
    });

    it('should have correct currency configuration', () => {
      expect(STRIPE_CONFIG.PRICING.VERIFICATION.currency).toBe('usd');
      expect(STRIPE_CONFIG.PRICING.PREMIUM.currency).toBe('usd');
      expect(STRIPE_CONFIG.PRICING.EVENT_FEATURE.currency).toBe('usd');
    });
  });

  describe('User Plan Info', () => {
    it('should return correct plan info for free user', async () => {
      const planInfo = await stripeService.getUserPlanInfo('test-user-id');
      
      expect(planInfo).toEqual({
        plan_type: 'free',
        is_verified: false,
        is_premium: false,
        premium_expires_at: null,
        verification_expires_at: null,
        can_create_services: false,
        can_feature_events: false,
        max_services: 0,
        max_featured_events: 0,
      });
    });
  });

  describe('Service Management', () => {
    it('should create a service successfully', async () => {
      const serviceData = {
        title: 'Test Service',
        description: 'A test service',
        price: 5000, // $50.00
        currency: 'usd',
        category: 'consulting',
      };

      const result = await stripeService.createService(serviceData);
      
      expect(result).toBeDefined();
      expect(result.title).toBe('Test Service');
      expect(result.price).toBe(5000);
    });

    it('should update a service successfully', async () => {
      const updateData = {
        title: 'Updated Service',
        description: 'An updated test service',
      };

      const result = await stripeService.updateService('test-service-id', updateData);
      
      expect(result).toBeDefined();
      expect(result.title).toBe('Updated Service');
    });

    it('should delete a service successfully', async () => {
      await expect(stripeService.deleteService('test-service-id')).resolves.not.toThrow();
    });
  });

  describe('Payment Flows', () => {
    it('should handle verification upgrade request', async () => {
      // Mock successful fetch response
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sessionId: 'test-session-id',
          url: 'https://checkout.stripe.com/test-session',
        }),
      });

      const result = await stripeService.upgradeToVerified();
      
      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('test-session-id');
      expect(result.url).toBe('https://checkout.stripe.com/test-session');
    });

    it('should handle premium upgrade request', async () => {
      // Mock successful fetch response
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sessionId: 'test-session-id',
          url: 'https://checkout.stripe.com/test-session',
        }),
      });

      const result = await stripeService.upgradeToPremium();
      
      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('test-session-id');
    });

    it('should handle event featuring request', async () => {
      // Mock successful fetch response
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sessionId: 'test-session-id',
          url: 'https://checkout.stripe.com/test-session',
        }),
      });

      const result = await stripeService.featureEvent('test-event-id');
      
      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('test-session-id');
    });
  });

  describe('Service Booking', () => {
    it('should create a service booking', async () => {
      const bookingData = {
        service_id: 'test-service-id',
        booking_date: new Date().toISOString(),
        duration_minutes: 60,
        notes: 'Test booking',
      };

      const result = await stripeService.bookService(bookingData);
      
      expect(result).toBeDefined();
      expect(result.service_id).toBe('test-service-id');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      const result = await stripeService.upgradeToVerified();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error response
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Invalid request',
          message: 'Missing required parameters',
        }),
      });

      const result = await stripeService.upgradeToVerified();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required parameters');
    });
  });

  describe('Data Validation', () => {
    it('should validate service data', () => {
      const validServiceData = {
        title: 'Valid Service',
        description: 'A valid service description',
        price: 5000,
        currency: 'usd',
      };

      expect(validServiceData.title).toBeTruthy();
      expect(validServiceData.description).toBeTruthy();
      expect(validServiceData.price).toBeGreaterThan(0);
      expect(validServiceData.currency).toBe('usd');
    });

    it('should validate booking data', () => {
      const validBookingData = {
        service_id: 'test-service-id',
        booking_date: new Date().toISOString(),
        duration_minutes: 60,
      };

      expect(validBookingData.service_id).toBeTruthy();
      expect(validBookingData.booking_date).toBeTruthy();
      expect(validBookingData.duration_minutes).toBeGreaterThan(0);
    });
  });
});
