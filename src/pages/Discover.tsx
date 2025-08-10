import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Users, Calendar, Star, ExternalLink, Clock } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { useToast } from "@/components/ui/use-toast";

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
}

const Discover = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [localNews, setLocalNews] = useState<NewsItem[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<LocalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - in production, replace with real API calls
  const featuredEvents = [
    {
      id: 1,
      title: "Local Art Exhibition",
      location: "Downtown Gallery",
      date: "Tomorrow, 7:00 PM",
      attendees: 24,
      image: "🎨",
      category: "Art"
    },
    {
      id: 2,
      title: "Community Food Festival",
      location: "Central Park",
      date: "This Weekend",
      attendees: 156,
      image: "🍕",
      category: "Food"
    },
    {
      id: 3,
      title: "Live Jazz Night",
      location: "Blue Note Cafe",
      date: "Friday, 8:30 PM",
      attendees: 42,
      image: "🎷",
      category: "Music"
    }
  ];

  const localArtists = [
    {
      id: 1,
      name: "Sarah Chen",
      type: "Photographer",
      rating: 4.9,
      image: "📸"
    },
    {
      id: 2,
      name: "Mike Johnson",
      type: "Musician",
      rating: 4.8,
      image: "🎸"
    },
    {
      id: 3,
      name: "Emma Davis",
      type: "Painter",
      rating: 4.7,
      image: "🎨"
    }
  ];

  useEffect(() => {
    fetchLocalContent();
  }, []);

  const fetchLocalContent = async () => {
    try {
      // Simulate API calls for local content
      // In production, integrate with services like:
      // - Eventbrite API
      // - Meetup API
      // - NewsAPI
      // - Yelp API
      
      setTimeout(() => {
        // Mock local news
        setLocalNews([
          {
            title: "New Community Center Opens Downtown",
            description: "The new community center will feature art studios, meeting spaces, and a performance hall.",
            url: "#",
            source: "Local News Today",
            publishedAt: "2 hours ago",
            category: "Community"
          },
          {
            title: "Summer Festival Registration Now Open",
            description: "Local artists and vendors can now register for the annual summer festival happening next month.",
            url: "#",
            source: "City Events",
            publishedAt: "5 hours ago",
            category: "Events"
          },
          {
            title: "Local Business Spotlight: Green Garden Cafe",
            description: "Discover the story behind the neighborhood's newest eco-friendly restaurant.",
            url: "#",
            source: "Business Weekly",
            publishedAt: "1 day ago",
            category: "Business"
          }
        ]);

        // Mock nearby events
        setNearbyEvents([
          {
            id: "1",
            title: "Yoga in the Park",
            description: "Free morning yoga session for all skill levels",
            location: "Riverside Park",
            date: "Tomorrow, 8:00 AM",
            category: "Wellness",
            price: "Free"
          },
          {
            id: "2",
            title: "Local Farmers Market",
            description: "Fresh produce and handmade goods from local vendors",
            location: "Main Street Square",
            date: "Saturday, 9:00 AM",
            category: "Market"
          },
          {
            id: "3",
            title: "Photography Workshop",
            description: "Learn street photography techniques with local experts",
            location: "Creative Space Studio",
            date: "Sunday, 2:00 PM",
            category: "Workshop",
            price: "$35"
          }
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching local content:', error);
      toast({
        title: "Error",
        description: "Failed to load local content. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const filteredEvents = featuredEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNews = localNews.filter(news =>
    news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    news.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Local Discovery</h1>
          </div>
          <p className="text-muted-foreground">
            Discover amazing events, artists, and experiences in your area.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search for events, news, or venues..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Local News */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Local News & Updates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((news, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="mb-2">
                          {news.category}
                        </Badge>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg leading-tight">{news.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {news.publishedAt} • {news.source}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{news.description}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Read More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Nearby Events */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Happening Nearby</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="outline">{event.category}</Badge>
                        {event.price && (
                          <Badge variant={event.price === "Free" ? "secondary" : "default"}>
                            {event.price}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4" />
                        {event.date}
                      </div>
                      <Button className="w-full" variant="outline">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}

        {!loading && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Featured Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="text-4xl mb-2">{event.image}</div>
                      <Badge variant="outline">{event.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {event.attendees}
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Local Artists */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Local Artists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localArtists.map((artist) => (
              <Card key={artist.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{artist.image}</div>
                  <CardTitle className="text-lg">{artist.name}</CardTitle>
                  <CardDescription>{artist.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{artist.rating}</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Discover;