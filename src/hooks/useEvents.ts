import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location_name: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  max_attendees?: number;
  price?: number;
  user_id: string;
  attendees_count?: number;
  featured?: boolean;
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export const useEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select(`
          *,
          attendees:event_attendees(count)
        `)
        .order('event_date', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to include attendee count
      const transformedEvents = data?.map(event => ({
        ...event,
        attendees_count: event.attendees?.[0]?.count || 0
      })) || [];

      setEvents(transformedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      
      // Fallback to sample data
      const sampleEvents: Event[] = [
        {
          id: '1',
          title: 'Local Music Festival 2024',
          description: 'A three-day celebration of local music talent featuring over 50 artists',
          event_date: '2024-12-15',
          event_time: '18:00',
          location_name: 'Central Park',
          location_city: 'Downtown',
          location_state: 'CA',
          location_country: 'USA',
          latitude: 37.7749,
          longitude: -122.4194,
          image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
          max_attendees: 1000,
          price: 25,
          user_id: 'sample-user',
          attendees_count: 1250,
          featured: true,
          category: 'Music',
          tags: ['music', 'festival', 'local'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Art Exhibition Opening',
          description: 'Join us for the grand opening of our latest contemporary art exhibition',
          event_date: '2024-12-10',
          event_time: '19:00',
          location_name: 'Downtown Gallery',
          location_city: 'Downtown',
          location_state: 'CA',
          location_country: 'USA',
          latitude: 37.7849,
          longitude: -122.4094,
          image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop',
          max_attendees: 100,
          price: 0,
          user_id: 'sample-user',
          attendees_count: 89,
          featured: false,
          category: 'Art',
          tags: ['art', 'exhibition', 'culture'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setEvents(sampleEvents);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create event
  const createEvent = useCallback(async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'attendees_count'>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create events.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error: createError } = await supabase
        .from('events')
        .insert({
          ...eventData,
          user_id: user.id
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Add to local state
      const newEvent: Event = {
        ...data,
        attendees_count: 0
      };

      setEvents(prev => [newEvent, ...prev]);

      toast({
        title: "Event Created",
        description: "Your event has been created successfully!",
      });

      return newEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      toast({
        title: "Creation Failed",
        description: "Unable to create event. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Attend event
  const attendEvent = useCallback(async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to attend events.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error: attendError } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'confirmed'
        });

      if (attendError) {
        throw attendError;
      }

      // Update local state
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, attendees_count: (event.attendees_count || 0) + 1 }
            : event
        )
      );

      toast({
        title: "Event Attended!",
        description: "You're now attending this event.",
      });
    } catch (err) {
      console.error('Error attending event:', err);
      toast({
        title: "Attendance Failed",
        description: "Unable to attend event. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    attendEvent
  };
};
