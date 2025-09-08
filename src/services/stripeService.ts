import { supabase } from '@/integrations/supabase/client';
import { 
  STRIPE_CONFIG, 
  CheckoutSessionConfig, 
  PaymentResult, 
  PaymentType,
  validateStripeConfig 
} from '@/config/stripe';
import type { 
  Service, 
  ServiceBooking, 
  Subscription, 
  Payment,
  ServiceData,
  ServiceBookingData,
  UserPlanInfo
} from '@/types/monetization';

export class StripeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
    if (!validateStripeConfig()) {
      throw new Error('Stripe configuration is invalid');
    }
  }

  /**
   * Create a Stripe checkout session for payments
   */
  async createCheckoutSession(config: CheckoutSessionConfig): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const data = await response.json();
      return {
        success: true,
        sessionId: data.sessionId,
        url: data.url,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Redirect to Stripe checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await import('@stripe/stripe-js').then(m => m.loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY));
    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get user's current subscription status
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  /**
   * Get user's payment history
   */
  async getUserPayments(userId: string, limit = 10): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user payments:', error);
      return [];
    }
  }

  /**
   * Get user's plan information
   */
  async getUserPlanInfo(userId: string): Promise<UserPlanInfo> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          plan_type,
          is_verified,
          is_premium,
          premium_expires_at,
          verification_expires_at
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const now = new Date();
      const isVerified = data.is_verified && 
        (!data.verification_expires_at || new Date(data.verification_expires_at) > now);
      const isPremium = data.is_premium && 
        (!data.premium_expires_at || new Date(data.premium_expires_at) > now);

      return {
        plan_type: data.plan_type || 'free',
        is_verified: isVerified,
        is_premium: isPremium,
        premium_expires_at: data.premium_expires_at,
        verification_expires_at: data.verification_expires_at,
        can_create_services: isPremium,
        can_feature_events: isVerified || isPremium,
        max_services: isPremium ? 10 : 0,
        max_featured_events: isVerified || isPremium ? 5 : 0,
      };
    } catch (error) {
      console.error('Error fetching user plan info:', error);
      return {
        plan_type: 'free',
        is_verified: false,
        is_premium: false,
        premium_expires_at: null,
        verification_expires_at: null,
        can_create_services: false,
        can_feature_events: false,
        max_services: 0,
        max_featured_events: 0,
      };
    }
  }

  /**
   * Create a service (premium users only)
   */
  async createService(serviceData: ServiceData): Promise<Service> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user is premium
      const planInfo = await this.getUserPlanInfo(user.id);
      if (!planInfo.can_create_services) {
        throw new Error('Premium subscription required to create services');
      }

      const { data, error } = await supabase
        .from('services')
        .insert({
          user_id: user.id,
          ...serviceData,
          currency: serviceData.currency || 'usd',
        })
        .select(`
          *,
          provider:profiles!services_user_id_fkey(
            id,
            display_name,
            avatar_url,
            is_verified,
            is_premium
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  /**
   * Update a service
   */
  async updateService(serviceId: string, serviceData: Partial<ServiceData>): Promise<Service> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', serviceId)
        .eq('user_id', user.id)
        .select(`
          *,
          provider:profiles!services_user_id_fkey(
            id,
            display_name,
            avatar_url,
            is_verified,
            is_premium
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  /**
   * Delete a service
   */
  async deleteService(serviceId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  /**
   * Get user's services
   */
  async getUserServices(userId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          provider:profiles!services_user_id_fkey(
            id,
            display_name,
            avatar_url,
            is_verified,
            is_premium
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user services:', error);
      return [];
    }
  }

  /**
   * Get all active services
   */
  async getActiveServices(limit = 20, offset = 0): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          provider:profiles!services_user_id_fkey(
            id,
            display_name,
            avatar_url,
            is_verified,
            is_premium
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active services:', error);
      return [];
    }
  }

  /**
   * Book a service
   */
  async bookService(bookingData: ServiceBookingData): Promise<ServiceBooking> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get service details
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*, provider:profiles!services_user_id_fkey(*)')
        .eq('id', bookingData.service_id)
        .single();

      if (serviceError) throw serviceError;
      if (!service) throw new Error('Service not found');

      // Create booking
      const { data, error } = await supabase
        .from('service_bookings')
        .insert({
          service_id: bookingData.service_id,
          customer_id: user.id,
          provider_id: service.user_id,
          booking_date: bookingData.booking_date,
          duration_minutes: bookingData.duration_minutes || 60,
          total_amount: service.price,
          currency: service.currency,
          notes: bookingData.notes,
          customer_notes: bookingData.customer_notes,
        })
        .select(`
          *,
          service:services(*),
          customer:profiles!service_bookings_customer_id_fkey(
            id,
            display_name,
            avatar_url
          ),
          provider:profiles!service_bookings_provider_id_fkey(
            id,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error booking service:', error);
      throw error;
    }
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId: string, type: 'customer' | 'provider' = 'customer'): Promise<ServiceBooking[]> {
    try {
      const column = type === 'customer' ? 'customer_id' : 'provider_id';
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          service:services(*),
          customer:profiles!service_bookings_customer_id_fkey(
            id,
            display_name,
            avatar_url
          ),
          provider:profiles!service_bookings_provider_id_fkey(
            id,
            display_name,
            avatar_url
          )
        `)
        .eq(column, userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: string, notes?: string): Promise<ServiceBooking> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData: any = { status };
      if (notes) {
        updateData.provider_notes = notes;
      }

      const { data, error } = await supabase
        .from('service_bookings')
        .update(updateData)
        .eq('id', bookingId)
        .eq('provider_id', user.id)
        .select(`
          *,
          service:services(*),
          customer:profiles!service_bookings_customer_id_fkey(
            id,
            display_name,
            avatar_url
          ),
          provider:profiles!service_bookings_provider_id_fkey(
            id,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  /**
   * Feature an event
   */
  async featureEvent(eventId: string): Promise<PaymentResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const config: CheckoutSessionConfig = {
        type: 'event_feature',
        userId: user.id,
        eventId,
        successUrl: `${window.location.origin}/events/${eventId}?featured=true`,
        cancelUrl: `${window.location.origin}/events/${eventId}`,
        metadata: {
          event_id: eventId,
        },
      };

      return await this.createCheckoutSession(config);
    } catch (error) {
      console.error('Error featuring event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Upgrade to verified user
   */
  async upgradeToVerified(): Promise<PaymentResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const config: CheckoutSessionConfig = {
        type: 'verification',
        userId: user.id,
        successUrl: `${window.location.origin}/profile?verified=true`,
        cancelUrl: `${window.location.origin}/profile`,
      };

      return await this.createCheckoutSession(config);
    } catch (error) {
      console.error('Error upgrading to verified:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Upgrade to premium
   */
  async upgradeToPremium(): Promise<PaymentResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const config: CheckoutSessionConfig = {
        type: 'premium_subscription',
        userId: user.id,
        successUrl: `${window.location.origin}/profile?premium=true`,
        cancelUrl: `${window.location.origin}/profile`,
      };

      return await this.createCheckoutSession(config);
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  }
}

// Export singleton instance
export const stripeService = new StripeService();