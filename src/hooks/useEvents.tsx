import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from './useLocation';
import { PointsService } from '@/services/pointsService';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time: string;
  location_name: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  max_attendees?: number;
  price: number;
  image_url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  attendees_count: number;
  user_attending: boolean;
  organizer_name?: string;
  organizer_avatar?: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_date: string;
  event_time: string;
  location_name: string;
  category?: string;
  max_attendees?: number;
  price?: number;
  image_url?: string;
  tags?: string[];
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentLocation } = useLocation();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching events with function: get_events_with_attendance');
      console.log('Supabase client initialized:', !!supabase);
      console.log('Current user auth state:', user ? 'authenticated' : 'unauthenticated');
      
      const { data, error } = await supabase.rpc('get_events_with_attendance');
      
      if (error) {
        console.error('Supabase RPC error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Events fetched successfully:', data?.length || 0, 'events');
      setEvents(data || []);
    } catch (error: unknown) {
      console.error('Error fetching events - Full error object:', error);
      
      // Provide more specific error messages based on error type
      let errorMessage = "Failed to fetch events";
      
      if (error?.message?.includes('function') && error?.message?.includes('does not exist')) {
        errorMessage = "Database function not found. Please contact support.";
      } else if (error?.code === 'PGRST116') {
        errorMessage = "Database function error. Please try again.";
      } else if (error?.message?.includes('JWT')) {
        errorMessage = "Authentication issue. Please try signing in again.";
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch') || error?.message?.includes('NetworkError')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error?.code === '42883') {
        errorMessage = "Database configuration error. Please contact support.";
      } else if (error?.code === '42P01') {
        errorMessage = "Database table not found. Please contact support.";
      } else if (error?.message?.includes('404')) {
        errorMessage = "Service endpoint not found. Please contact support.";
      } else if (error?.message?.includes('500')) {
        errorMessage = "Server error. Please try again in a few moments.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Set empty array so UI doesn't break
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  const createEvent = async (eventData: CreateEventData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create events",
        variant: "destructive",
      });
      return false;
    }

    console.log('Creating event with data:', eventData);
    console.log('User ID:', user.id);

    try {
      // Validate required fields
      if (!eventData.title.trim()) {
        throw new Error('Event title is required');
      }
      if (!eventData.event_date) {
        throw new Error('Event date is required');
      }
      if (!eventData.event_time) {
        throw new Error('Event time is required');
      }
      if (!eventData.location_name.trim()) {
        throw new Error('Event location is required');
      }

      const insertData = {
        user_id: user.id,
        title: eventData.title.trim(),
        description: eventData.description?.trim() || null,
        event_date: eventData.event_date,
        event_time: eventData.event_time,
        location_name: eventData.location_name.trim(),
        location_city: currentLocation?.city || null,
        location_state: currentLocation?.state || null,
        location_country: currentLocation?.country || null,
        latitude: currentLocation?.latitude || null,
        longitude: currentLocation?.longitude || null,
        category: eventData.category || null,
        max_attendees: eventData.max_attendees || null,
        price: eventData.price || 0,
        image_url: eventData.image_url || null,
        tags: eventData.tags || null,
      };

      console.log('Inserting event data:', insertData);

      const { data: insertedData, error } = await supabase.from('events').insert(insertData).select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Event inserted successfully:', insertedData);

      // Award points for organizing event
      if (insertedData && insertedData.length > 0) {
        try {
          await PointsService.handleEventOrganization(insertedData[0].id, user.id);
        } catch (pointsError) {
          console.warn('Failed to award points for event creation:', pointsError);
          // Don't fail the entire operation if points fail
        }
      }

      toast({
        title: "Success",
        description: "Event created successfully!",
      });

      fetchEvents(); // Refresh events
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      
      let errorMessage = "Failed to create event";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleAttendance = async (eventId: string): Promise<void> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to attend events",
        variant: "destructive",
      });
      return;
    }

    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      if (event.user_attending) {
        // Remove attendance
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "You're no longer attending this event",
        });
      } else {
        // Add attendance
        const { error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'attending'
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "You're now attending this event!",
        });

        // Award points for attending event
        await PointsService.handleEventAttendance(eventId, user.id);
      }

      fetchEvents(); // Refresh events
    } catch (error) {
      console.error('Error toggling attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEvents(); // Fetch events even when not logged in
  }, [user, fetchEvents]);

  // Listen for real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' },
        () => {
          fetchEvents(); // Refetch when events change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents]);

  const deleteEvent = async (eventId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Event deleted",
        description: "Your event has been deleted successfully."
      });

      // Refresh events
      fetchEvents();

      return { error: null };
    } catch (error: unknown) {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  return {
    events,
    loading,
    createEvent,
    toggleAttendance,
    deleteEvent,
    refetch: fetchEvents,
  };
};
