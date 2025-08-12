import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from './useLocation';

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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_events_with_attendance');
      
      if (error) throw error;
      
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: CreateEventData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create events",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase.from('events').insert({
        user_id: user.id,
        title: eventData.title,
        description: eventData.description,
        event_date: eventData.event_date,
        event_time: eventData.event_time,
        location_name: eventData.location_name,
        location_city: undefined, // Will be populated from user's profile
        location_state: undefined, // Will be populated from user's profile
        location_country: undefined, // Will be populated from user's profile
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        category: eventData.category,
        max_attendees: eventData.max_attendees,
        price: eventData.price || 0,
        image_url: eventData.image_url,
        tags: eventData.tags,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully!",
      });

      fetchEvents(); // Refresh events
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
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
  }, [user]);

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
  }, []);

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
    } catch (error: any) {
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