import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Search, Users, Calendar, Star, ExternalLink, Clock, Filter, TrendingUp, Heart, Map, Sparkles, UserPlus } from "lucide-react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "@/hooks/useLocation";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { TrendingContent } from "@/components/TrendingContent";
import { RecommendationFeed } from "@/components/RecommendationFeed";
import { FollowSuggestions } from "@/components/FollowSuggestions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

interface LocalEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  category: string;
  price?: string;
  attendees?: number;
}

interface TrendingItem {
  id: string;
  type: 'event' | 'artist' | 'post' | 'group';
  title: string;
  description: string;
  engagement: number;
  image?: string;
}

const Discover = () => {
  const { toast } = useToast();
  const { currentLocation, isEnabled: locationEnabled } = useLocation();
  const [activeTab, setActiveTab] = useState("search");
  const [localNews, setLocalNews] = useState<NewsItem[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<LocalEvent[]>([]);
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocalContent();
    fetchTrendingContent();
  }, [currentLocation, locationEnabled]);

  const fetchLocalContent = async () => {
    try {
      setLoading(true);
      
      // Fetch local news from Supabase Edge Function
      // Always try to fetch news, even without location
      const { data: newsData, error: newsError } = await supabase.functions.invoke('fetch-local-news', {
        body: {
          location: currentLocation ? 'Your Area' : 'Local Area',
          latitude: currentLocation?.latitude,
          longitude: currentLocation?.longitude,
          radius: 50 // 50km radius
        }
      });
      
      if (newsError) {
        console.error('Error fetching news:', newsError);
        // Set mock news as fallback
        setLocalNews([
          {
            title: "Local Community Updates",
            description: "Stay connected with your local community and discover what's happening around you.",
            url: "#",
            source: "Local News",
            publishedAt: new Date().toISOString(),
            category: "General"
          },
          {
            title: "Community Events This Week",
            description: "Find exciting events and activities happening in your neighborhood this week.",
            url: "#",
            source: "Community Events",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            category: "Events"
          }
        ]);
      } else if (newsData && newsData.news) {
        setLocalNews(newsData.news.slice(0, 5)); // Show top 5 news items
      } else {
        // Fallback to mock news
        setLocalNews([
          {
            title: "Local Community Updates",
            description: "Stay connected with your local community and discover what's happening around you.",
            url: "#",
            source: "Local News",
            publishedAt: new Date().toISOString(),
            category: "General"
          },
          {
            title: "Community Events This Week",
            description: "Find exciting events and activities happening in your neighborhood this week.",
            url: "#",
            source: "Community Events",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            category: "Events"
          }
        ]);
      }

      // Fetch nearby events
      try {
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .gte('event_date', new Date().toISOString().split('T')[0])
          .order('event_date', { ascending: true })
          .limit(6);

        if (events) {
          setNearbyEvents(events.map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location_name,
            date: event.event_date,
            category: event.category,
            price: event.price ? `$${event.price}` : 'Free'
          })));
        }
      } catch (eventError) {
        console.error('Error fetching events:', eventError);
        // Set mock events as fallback
        setNearbyEvents([
          {
            id: '1',
            title: 'Community Meetup',
            description: 'Join us for a friendly community gathering',
            location: 'Local Community Center',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'Community',
            price: 'Free'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching local content:', error);
      toast({
        title: "Error",
        description: "Failed to load local content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingContent = async () => {
    try {
      // Fetch trending events (most attendees)
      const { data: trendingEvents } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          category,
          max_attendees,
          event_date,
          image_url
        `)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('max_attendees', { ascending: false })
        .limit(3);

      // Fetch trending artists (most bookings)
      const { data: trendingArtists } = await supabase
        .from('artists')
        .select(`
          id,
          user_id,
          specialty,
          bio
        `)
        .eq('is_available', true)
        .limit(3);

      // Fetch trending posts (most likes)
      const { data: trendingPosts } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          title,
          content,
          type,
          likes_count
        `)
        .eq('status', 'active')
        .order('likes_count', { ascending: false })
        .limit(3);

      const trending: TrendingItem[] = [
        ...(trendingEvents?.map(event => ({
          id: event.id,
          type: 'event' as const,
          title: event.title,
          description: event.description,
          engagement: event.max_attendees || 0,
          image: event.image_url
        })) || []),
        ...(trendingArtists?.map(artist => ({
          id: artist.id,
          type: 'artist' as const,
          title: 'Artist Profile',
          description: artist.bio || artist.specialty?.join(', ') || '',
          engagement: 0, // Could be calculated from booking count
          image: undefined // Will be fetched separately if needed
        })) || []),
        ...(trendingPosts?.map(post => ({
          id: post.id,
          type: 'post' as const,
          title: post.title || 'Untitled Post',
          description: post.content.substring(0, 100) + '...',
          engagement: post.likes_count || 0,
          image: undefined // Will be fetched separately if needed
        })) || [])
      ];

      setTrendingItems(trending);
    } catch (error) {
      console.error('Error fetching trending content:', error);
    }
  };

  const getTrendingIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'artist': return <Star className="h-4 w-4" />;
      case 'post': return <Users className="h-4 w-4" />;
      case 'group': return <Users className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Local</h1>
          <p className="text-muted-foreground">
            Explore what's happening in your area and connect with your community
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="recommendations">For You</TabsTrigger>
            <TabsTrigger value="follow">People</TabsTrigger>
            <TabsTrigger value="events">Local Events</TabsTrigger>
            <TabsTrigger value="news">Local News</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <AdvancedSearch />
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <TrendingContent />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <RecommendationFeed />
          </TabsContent>

          <TabsContent value="follow" className="space-y-6">
            <FollowSuggestions />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Nearby Events</h2>
              <Button variant="outline" onClick={() => window.location.href = '/events'}>
                View All Events
              </Button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{event.category}</Badge>
                        <span className="text-sm font-medium text-green-600">{event.price}</span>
                      </div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Local News</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={fetchLocalContent}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
                <Button variant="outline" onClick={() => window.open('https://news.google.com', '_blank')}>
                  More News
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-5 bg-muted rounded w-16"></div>
                            <div className="h-4 bg-muted rounded w-20"></div>
                          </div>
                          <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-full mb-3"></div>
                          <div className="flex items-center justify-between">
                            <div className="h-4 bg-muted rounded w-20"></div>
                            <div className="h-8 bg-muted rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : localNews.length > 0 ? (
              <div className="space-y-4">
                {localNews.map((news, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {news.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{news.source}</span>
                          </div>
                          <h3 className="font-semibold mb-2">{news.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {news.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(news.publishedAt), 'MMM dd, yyyy')}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => window.open(news.url, '_blank')}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Read
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Local News Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Enable location services to get personalized local news, or check back later for updates.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={fetchLocalContent}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Refresh News'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default Discover;
