import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ExternalLink, RefreshCw, Calendar, Clock } from "lucide-react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "@/hooks/useLocation";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

export default function NewsFeed() {
  const { toast } = useToast();
  const { currentLocation, isEnabled: locationEnabled } = useLocation();
  const [localNews, setLocalNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNews();
  }, [currentLocation, locationEnabled]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      
      // Fetch local news from Supabase Edge Function
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
          },
          {
            title: "Local Business Spotlight",
            description: "Discover amazing local businesses and support your community economy.",
            url: "#",
            source: "Business News",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            category: "Business"
          },
          {
            title: "Arts & Culture in Your Area",
            description: "Explore local art exhibitions, cultural events, and creative community initiatives.",
            url: "#",
            source: "Arts & Culture",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            category: "Arts"
          },
          {
            title: "Community Development Projects",
            description: "Learn about new infrastructure projects and community improvements in your area.",
            url: "#",
            source: "Development News",
            publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            category: "Development"
          }
        ]);
      } else if (newsData && newsData.news) {
        setLocalNews(newsData.news);
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
          },
          {
            title: "Local Business Spotlight",
            description: "Discover amazing local businesses and support your community economy.",
            url: "#",
            source: "Business News",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            category: "Business"
          },
          {
            title: "Arts & Culture in Your Area",
            description: "Explore local art exhibitions, cultural events, and creative community initiatives.",
            url: "#",
            source: "Arts & Culture",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            category: "Arts"
          },
          {
            title: "Community Development Projects",
            description: "Learn about new infrastructure projects and community improvements in your area.",
            url: "#",
            source: "Development News",
            publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            category: "Development"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to load news",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "News refreshed successfully",
    });
  };

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Local News Feed</h1>
              <p className="text-muted-foreground">
                Stay updated with the latest local news and community updates
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={loading || refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline" onClick={() => window.open('https://news.google.com', '_blank')}>
                More News
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-5 bg-muted rounded w-16"></div>
                        <div className="h-4 bg-muted rounded w-24"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-muted rounded w-full mb-3"></div>
                      <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
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
          <div className="space-y-6">
            {localNews.map((news, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {news.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{news.source}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(news.publishedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{news.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {news.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>Local Area</span>
                        </div>
                        <Button variant="outline" onClick={() => window.open(news.url, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read Full Article
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
                onClick={fetchNews}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Try Again'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveLayout>
  );
}
