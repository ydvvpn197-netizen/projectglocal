import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LocalEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  category: string;
  price?: string;
  organizer: string;
  attendees?: number;
  imageUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    console.log('Fetching local events for location:', location);

    // Generate events for the next 30 days
    const events: LocalEvent[] = [];
    const categories = ['Music', 'Art', 'Food', 'Sports', 'Workshop', 'Market', 'Community', 'Business'];
    const venues = [
      'Community Center', 'Downtown Plaza', 'City Park', 'Library', 'Cultural Center',
      'Main Street', 'Riverside Park', 'Town Hall', 'Local Theater', 'Arts District'
    ];

    // Create events for the next 30 days
    for (let i = 0; i < 20; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1);
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      const venue = venues[Math.floor(Math.random() * venues.length)];
      
      const eventTemplates = {
        Music: [
          "Live Jazz Night", "Open Mic Evening", "Local Band Showcase", "Classical Concert",
          "Folk Music Session", "DJ Night", "Acoustic Performance"
        ],
        Art: [
          "Art Gallery Opening", "Painting Workshop", "Sculpture Exhibition", "Photography Show",
          "Artist Meet & Greet", "Art Supply Swap", "Creative Arts Fair"
        ],
        Food: [
          "Food Truck Festival", "Cooking Class", "Wine Tasting", "Farmers Market",
          "Bake Sale", "Restaurant Week", "Food & Culture Fair"
        ],
        Sports: [
          "Community Run", "Yoga in the Park", "Basketball Tournament", "Soccer Match",
          "Fitness Bootcamp", "Tennis Tournament", "Cycling Event"
        ],
        Workshop: [
          "Digital Skills Workshop", "Crafting Circle", "Business Seminar", "Language Exchange",
          "Photography Workshop", "Writing Group", "Tech Meetup"
        ],
        Market: [
          "Farmers Market", "Artisan Market", "Vintage Sale", "Book Fair",
          "Craft Market", "Holiday Market", "Flea Market"
        ],
        Community: [
          "Town Hall Meeting", "Volunteer Day", "Community Clean-up", "Neighborhood BBQ",
          "Cultural Festival", "Charity Drive", "Public Forum"
        ],
        Business: [
          "Networking Event", "Startup Pitch", "Business Fair", "Job Fair",
          "Industry Meetup", "Professional Development", "Trade Show"
        ]
      };

      const titles = eventTemplates[category as keyof typeof eventTemplates];
      const title = titles[Math.floor(Math.random() * titles.length)];
      
      events.push({
        id: `event-${i + 1}`,
        title: title,
        description: `Join us for ${title.toLowerCase()} at ${venue}. Great opportunity to connect with the local ${category.toLowerCase()} community.`,
        location: `${venue}, ${location}`,
        date: futureDate.toISOString().split('T')[0],
        time: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'PM' : 'AM'}`,
        category: category,
        price: Math.random() > 0.6 ? `$${Math.floor(Math.random() * 50) + 5}` : 'Free',
        organizer: `${location} ${category} Society`,
        attendees: Math.floor(Math.random() * 200) + 10,
        imageUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=300&h=200&fit=crop`
      });
    }

    // Sort events by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return new Response(JSON.stringify({ 
      events: events,
      location: location,
      lastUpdated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-local-events function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      events: [],
      location: "Unknown"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});