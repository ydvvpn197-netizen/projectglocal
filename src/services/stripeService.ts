/**
 * Stripe Service
 * Mock implementation for payment functionality
 */

import type { UserPlanInfo } from '@/types/monetization';

export const stripeService = {
  async getUserPlanInfo(userId: string): Promise<UserPlanInfo> {
    // Mock implementation
    return {
      is_premium: false,
      plan_type: 'free',
      can_create_services: false,
      can_feature_events: false,
      features: []
    };
  }
};