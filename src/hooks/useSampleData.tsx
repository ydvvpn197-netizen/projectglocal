import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useSampleData = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createSamplePosts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const samplePosts = [
        {
          type: 'event' as const,
          title: 'Community Art Walk',
          content: 'Join us for a beautiful evening exploring local art installations and galleries in downtown. Perfect for art lovers and families!',
          event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
          event_location: 'Downtown Art District',
          location_city: 'Springfield',
          location_state: 'IL',
          location_country: 'USA',
          tags: ['art', 'community', 'walk', 'downtown'],
          user_id: user.id
        },
        {
          type: 'service' as const,
          title: 'Jazz Quartet Available for Events',
          content: 'Professional jazz quartet with 10+ years experience. Perfect for weddings, corporate events, and private parties. We play a mix of classic jazz, swing, and contemporary pieces.',
          price_range: '$200-400/hour',
          location_city: 'Springfield',
          location_state: 'IL',
          location_country: 'USA',
          tags: ['jazz', 'music', 'wedding', 'corporate'],
          user_id: user.id
        },
        {
          type: 'discussion' as const,
          title: 'Best Local Coffee Shops?',
          content: 'New to the area and looking for recommendations for great coffee shops with good WiFi for remote work. Any hidden gems?',
          location_city: 'Springfield',
          location_state: 'IL',
          location_country: 'USA',
          tags: ['coffee', 'recommendations', 'remote-work'],
          user_id: user.id
        },
        {
          type: 'post' as const,
          title: 'Farmers Market This Weekend',
          content: 'Reminder that the weekly farmers market is happening this Saturday from 8am-2pm at Central Park. Great selection of local produce, baked goods, and crafts!',
          location_city: 'Springfield',
          location_state: 'IL',
          location_country: 'USA',
          tags: ['farmers-market', 'local', 'produce'],
          user_id: user.id
        },
        {
          type: 'event' as const,
          title: 'Book Club Meeting',
          content: 'Monthly book club meeting to discuss "The Seven Husbands of Evelyn Hugo". New members welcome! We meet at the library and then usually grab coffee after.',
          event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
          event_location: 'Central Library, Room 201',
          location_city: 'Springfield',
          location_state: 'IL',
          location_country: 'USA',
          tags: ['books', 'reading', 'club', 'library'],
          user_id: user.id
        }
      ];

      for (const post of samplePosts) {
        const { error } = await supabase
          .from('posts')
          .insert(post);
        
        if (error) throw error;
      }

      toast({
        title: "Sample data created!",
        description: "Added 5 sample posts to help you explore the app."
      });
    } catch (error: any) {
      toast({
        title: "Error creating sample data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    createSamplePosts,
    loading
  };
};