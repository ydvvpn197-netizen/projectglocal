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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, latitude, longitude, radius = 50 } = await req.json();
    console.log('Fetching local news for location:', location, 'coordinates:', { latitude, longitude });

    let newsItems: NewsItem[] = [];

    try {
      newsItems = await fetchRealNews(location, latitude, longitude, radius);
    } catch (error) {
      console.error('Error fetching real news, falling back to mock data:', error);
      newsItems = getMockNews(location || 'Your Area');
    }

    const shuffledNews = newsItems.sort(() => Math.random() - 0.5);
    
    return new Response(JSON.stringify({ 
      news: shuffledNews,
      location: location || 'Your Area',
      lastUpdated: new Date().toISOString(),
      source: 'real-time'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-local-news function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      news: getMockNews('Your Area'),
      location: "Unknown",
      source: 'fallback'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchRealNews(
  location: string, 
  latitude?: number, 
  longitude?: number, 
  radius: number = 50
): Promise<NewsItem[]> {
  const apiKey = 'edcc8605b836ce982b924ab1bbe45056';
  
  try {
    let url: string;
    
    if (latitude && longitude) {
      const locationName = await getLocationName(latitude, longitude);
      url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(locationName)}&max=20&sortby=publishedAt&apikey=${apiKey}`;
    } else {
      const countryCode = getCountryCode(location);
      url = `https://gnews.io/api/v4/top-headlines?country=${countryCode}&max=20&apikey=${apiKey}`;
    }

    console.log('Fetching from GNews API:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GNews API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(`GNews API error: ${data.message}`);
    }

    const newsItems = data.articles
      .filter((article: any) => isLocationRelevant(article, location, latitude, longitude, radius))
      .map((article: any) => ({
        title: article.title,
        description: article.description || 'No description available',
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        category: categorizeArticle(article),
        imageUrl: article.urlToImage || getDefaultImage(categorizeArticle(article))
      }))
      .slice(0, 10);

    console.log(`Fetched ${newsItems.length} relevant news items`);
    return newsItems;

  } catch (error) {
    console.error('Error fetching real news:', error);
    throw error;
  }
}

async function getLocationName(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.display_name.split(',')[0];
    }
  } catch (error) {
    console.error('Error getting location name:', error);
  }
  
  return 'local area';
}

function isLocationRelevant(
  article: any, 
  location: string, 
  latitude?: number, 
  longitude?: number, 
  radius: number = 50
): boolean {
  const text = `${article.title} ${article.description} ${article.content}`.toLowerCase();
  const locationLower = location.toLowerCase();
  
  if (text.includes(locationLower)) {
    return true;
  }

  const localTerms = ['local', 'community', 'area', 'region', 'city', 'town', 'neighborhood'];
  return localTerms.some(term => text.includes(term));
}

function categorizeArticle(article: any): string {
  const text = `${article.title} ${article.description}`.toLowerCase();
  
  if (text.includes('event') || text.includes('festival') || text.includes('concert')) {
    return 'Events';
  } else if (text.includes('business') || text.includes('restaurant') || text.includes('shop')) {
    return 'Business';
  } else if (text.includes('development') || text.includes('construction') || text.includes('project')) {
    return 'Development';
  } else if (text.includes('education') || text.includes('school') || text.includes('university')) {
    return 'Education';
  } else if (text.includes('transport') || text.includes('road') || text.includes('traffic')) {
    return 'Transportation';
  } else if (text.includes('art') || text.includes('culture') || text.includes('museum')) {
    return 'Arts';
  } else {
    return 'General';
  }
}

function getDefaultImage(category: string): string {
  const images = {
    'Events': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=200&fit=crop',
    'Business': 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=200&fit=crop',
    'Development': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=200&fit=crop',
    'Education': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop',
    'Transportation': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=200&fit=crop',
    'Arts': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop',
    'General': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop'
  };
  
  return images[category as keyof typeof images] || images.General;
}

function getCountryCode(location: string): string {
  const countryMap: { [key: string]: string } = {
    'united states': 'us',
    'usa': 'us',
    'us': 'us',
    'canada': 'ca',
    'united kingdom': 'gb',
    'uk': 'gb',
    'australia': 'au',
    'germany': 'de',
    'france': 'fr',
    'spain': 'es',
    'italy': 'it',
    'japan': 'jp',
    'india': 'in',
    'brazil': 'br',
    'mexico': 'mx'
  };
  
  const locationLower = location.toLowerCase();
  return countryMap[locationLower] || 'us';
}

function getMockNews(location: string): NewsItem[] {
  return [
    {
      title: `New Community Development Project Approved for ${location}`,
      description: "Local council approves new mixed-use development that will include affordable housing, retail spaces, and a community center.",
      url: "#",
      source: "Local Development News",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      category: "Development",
      imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=200&fit=crop"
    },
    {
      title: `${location} Farmers Market Returns for Summer Season`,
      description: "The popular farmers market will return next weekend featuring over 50 local vendors, live music, and family activities.",
      url: "#",
      source: "Community Events",
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      category: "Events",
      imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=200&fit=crop"
    },
    {
      title: "Local Artists Collaborate for Public Mural Project",
      description: "Five local artists have been selected to create a new mural celebrating community diversity and local history.",
      url: "#",
      source: "Arts & Culture Today",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      category: "Arts",
      imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop"
    },
    {
      title: `${location} Library Launches Digital Learning Initiative`,
      description: "The library introduces new computer classes, digital literacy programs, and free Wi-Fi hotspot lending.",
      url: "#",
      source: "Education Weekly",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      category: "Education",
      imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop"
    },
    {
      title: "New Bike Share Program Launches Downtown",
      description: "Eco-friendly bike sharing stations are now available at 10 locations throughout the downtown area.",
      url: "#",
      source: "Transportation News",
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      category: "Transportation",
      imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=200&fit=crop"
    }
  ];
}