import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
  imageUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    console.log('Fetching local news for location:', location);

    // For now, we'll provide curated local news data
    // In production, you would integrate with APIs like:
    // - NewsAPI
    // - Guardian API
    // - Reddit API for local subreddits
    // - Local news websites RSS feeds
    
    const localNews: NewsItem[] = [
      {
        title: `New Community Development Project Approved for ${location}`,
        description: "Local council approves new mixed-use development that will include affordable housing, retail spaces, and a community center.",
        url: "#",
        source: "Local Development News",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        category: "Development",
        imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300&h=200&fit=crop"
      },
      {
        title: `${location} Farmers Market Returns for Summer Season`,
        description: "The popular farmers market will return next weekend featuring over 50 local vendors, live music, and family activities.",
        url: "#",
        source: "Community Events",
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        category: "Events",
        imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=300&h=200&fit=crop"
      },
      {
        title: "Local Artists Collaborate for Public Mural Project",
        description: "Five local artists have been selected to create a new mural celebrating community diversity and local history.",
        url: "#",
        source: "Arts & Culture Today",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        category: "Arts",
        imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop"
      },
      {
        title: `${location} Library Launches Digital Learning Initiative`,
        description: "The library introduces new computer classes, digital literacy programs, and free Wi-Fi hotspot lending.",
        url: "#",
        source: "Education Weekly",
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        category: "Education",
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop"
      },
      {
        title: "New Bike Share Program Launches Downtown",
        description: "Eco-friendly bike sharing stations are now available at 10 locations throughout the downtown area.",
        url: "#",
        source: "Transportation News",
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        category: "Transportation",
        imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop"
      }
    ];

    // Add some randomization to make it feel more dynamic
    const shuffledNews = localNews.sort(() => Math.random() - 0.5);
    
    return new Response(JSON.stringify({ 
      news: shuffledNews,
      location: location,
      lastUpdated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-local-news function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      news: [],
      location: "Unknown"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});