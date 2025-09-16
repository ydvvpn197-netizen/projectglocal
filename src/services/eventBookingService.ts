import { supabase } from '@/integrations/supabase/client';

export interface EventBooking {
  id: string;
  event_id: string;
  user_id: string;
  tickets_count: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  payment_intent_id?: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
  event?: {
    id: string;
    title: string;
    event_date: string;
    event_time: string;
    location_name: string;
    price: number;
    image_url?: string;
  };
  user?: {
    id: string;
    display_name?: string;
    email?: string;
  };
}

export interface CreateBookingData {
  event_id: string;
  tickets_count: number;
  total_amount: number;
  payment_intent_id?: string;
}

export interface BookingStats {
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  total_revenue: number;
}

export class EventBookingService {
  /**
   * Create a new event booking
   */
  static async createBooking(bookingData: CreateBookingData): Promise<{ booking: EventBooking | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { booking: null, error: 'Not authenticated' };
      }

      // Check if user already has a booking for this event
      const { data: existingBooking } = await supabase
        .from('event_bookings')
        .select('id')
        .eq('event_id', bookingData.event_id)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .single();

      if (existingBooking) {
        return { booking: null, error: 'You already have a booking for this event' };
      }

      // Check event capacity
      const { data: event } = await supabase
        .from('events')
        .select('max_attendees, attendees_count')
        .eq('id', bookingData.event_id)
        .single();

      if (event && event.max_attendees) {
        const availableSpots = event.max_attendees - (event.attendees_count || 0);
        if (bookingData.tickets_count > availableSpots) {
          return { booking: null, error: `Only ${availableSpots} spots available` };
        }
      }

      // Generate QR code (simple implementation)
      const qrCode = `EVENT_${bookingData.event_id}_${user.id}_${Date.now()}`;

      const { data, error } = await supabase
        .from('event_bookings')
        .insert({
          event_id: bookingData.event_id,
          user_id: user.id,
          tickets_count: bookingData.tickets_count,
          total_amount: bookingData.total_amount,
          payment_intent_id: bookingData.payment_intent_id,
          qr_code: qrCode,
          status: 'pending'
        })
        .select(`
          *,
          event:events(id, title, event_date, event_time, location_name, price, image_url),
          user:profiles!event_bookings_user_id_fkey(id, display_name)
        `)
        .single();

      if (error) throw error;

      // Update event attendees count
      await supabase
        .from('events')
        .update({ 
          attendees_count: supabase.raw('attendees_count + ?', [bookingData.tickets_count])
        })
        .eq('id', bookingData.event_id);

      return { booking: data, error: null };
    } catch (error: unknown) {
      console.error('Error creating booking:', error);
      return { booking: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get user's bookings
   */
  static async getUserBookings(): Promise<{ bookings: EventBooking[]; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { bookings: [], error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('event_bookings')
        .select(`
          *,
          event:events(id, title, event_date, event_time, location_name, price, image_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { bookings: data || [], error: null };
    } catch (error: unknown) {
      console.error('Error getting user bookings:', error);
      return { bookings: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get bookings for an event (organizer view)
   */
  static async getEventBookings(eventId: string): Promise<{ bookings: EventBooking[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('event_bookings')
        .select(`
          *,
          user:profiles!event_bookings_user_id_fkey(id, display_name, email)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { bookings: data || [], error: null };
    } catch (error: unknown) {
      console.error('Error getting event bookings:', error);
      return { bookings: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'refunded'): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('event_bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: unknown) {
      console.error('Error updating booking status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(bookingId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Get booking details
      const { data: booking, error: fetchError } = await supabase
        .from('event_bookings')
        .select('event_id, tickets_count, status')
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (!booking) {
        return { success: false, error: 'Booking not found' };
      }

      if (booking.status === 'cancelled') {
        return { success: false, error: 'Booking is already cancelled' };
      }

      // Update booking status
      const { error: updateError } = await supabase
        .from('event_bookings')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Update event attendees count
      await supabase
        .from('events')
        .update({ 
          attendees_count: supabase.raw('attendees_count - ?', [booking.tickets_count])
        })
        .eq('id', booking.event_id);

      return { success: true, error: null };
    } catch (error: unknown) {
      console.error('Error cancelling booking:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get booking statistics for an event
   */
  static async getEventBookingStats(eventId: string): Promise<{ stats: BookingStats | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('event_bookings')
        .select('status, total_amount')
        .eq('event_id', eventId);

      if (error) throw error;

      const stats: BookingStats = {
        total_bookings: data.length,
        confirmed_bookings: data.filter(b => b.status === 'confirmed').length,
        pending_bookings: data.filter(b => b.status === 'pending').length,
        total_revenue: data
          .filter(b => b.status === 'confirmed')
          .reduce((sum, b) => sum + (b.total_amount || 0), 0)
      };

      return { stats, error: null };
    } catch (error: unknown) {
      console.error('Error getting booking stats:', error);
      return { stats: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Check if user has booked an event
   */
  static async hasUserBookedEvent(eventId: string): Promise<{ hasBooked: boolean; booking: EventBooking | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { hasBooked: false, booking: null, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('event_bookings')
        .select(`
          *,
          event:events(id, title, event_date, event_time, location_name, price, image_url)
        `)
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      return { 
        hasBooked: !!data, 
        booking: data || null, 
        error: null 
      };
    } catch (error: unknown) {
      console.error('Error checking user booking:', error);
      return { hasBooked: false, booking: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
