import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Search, Users, Calendar, Star, ExternalLink, Clock, Filter, TrendingUp, Heart, Map, Sparkles, UserPlus, GripVertical, BarChart3 } from "lucide-react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "@/hooks/useLocation";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { TrendingContent } from "@/components/TrendingContent";
import { RecommendationFeed } from "@/components/RecommendationFeed";
import { FollowSuggestions } from "@/components/FollowSuggestions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EnhancedUserProfileCard, EnhancedUserProfile } from "@/components/EnhancedUserProfileCard";
import { UserList } from "@/components/UserList";
import DraggableUserList from "@/components/DraggableUserList";
import VirtualizedUserList from "@/components/VirtualizedUserList";
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
  description: string | null;
  location: string;
  date: string;
  category: string | null;
  price?: string;
  attendees?: number;
}

interface TrendingItem {
  id: string;
  type: 'event' | 'artist' | 'post' | 'group';
  title: string;
  description: string | null;
  engagement: number;
  image?: string | null;
}

const Discover = () => {
  const { toast } = useToast();
  const { currentLocation, isEnabled: locationEnabled } = useLocation();
  const [activeTab, setActiveTab] = useState("search");
  const [localNews, setLocalNews] = useState<NewsItem[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<LocalEvent[]>([]);
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [discoveredUsers, setDiscoveredUsers] = useState<EnhancedUserProfile[]>([]);

  const fetchLocalContent = useCallback(async () => {
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
  }, [currentLocation, toast]);

  const fetchTrendingContent = useCallback(async () => {
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
  }, []);

  const fetchDiscoveredUsers = useCallback(async () => {
    try {
      // Mock data for demonstration - in real app, fetch from API
      const mockUsers: EnhancedUserProfile[] = [
        {
          id: 'user-1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&',
          bio: 'Event organizer and community builder passionate about bringing people together',
          location: 'San Francisco, CA',
          verified: true,
          followersCount: 2341,
          followingCount: 189,
          isFollowing: false,
          isOnline: true,
          badges: ['trending'],
          skills: ['Event Planning', 'Community Management', 'Marketing'],
          interests: ['Community', 'Events', 'Networking'],
          joinDate: '2021-08-15',
          eventsCount: 23,
          projectsCount: 12,
          isPremium: true,
          isFeatured: false
        },
        {
          id: 'user-2',
          name: 'Michael Chen',
          email: 'michael@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&',
          bio: 'Tech entrepreneur and startup mentor helping others build successful businesses',
          location: 'Austin, TX',
          verified: true,
          followersCount: 5678,
          followingCount: 234,
          isFollowing: true,
          isOnline: false,
          badges: ['trending'],
          skills: ['Startup Strategy', 'Product Development', 'Investor Relations'],
          interests: ['Technology', 'Business', 'Innovation'],
          joinDate: '2020-12-01',
          eventsCount: 45,
          projectsCount: 18,
          isPremium: true,
          isFeatured: true
        },
        {
          id: 'user-3',
          name: 'Emma Rodriguez',
          email: 'emma@example.com',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&',
          bio: 'Creative designer and artist exploring the intersection of art and technology',
          location: 'Portland, OR',
          verified: false,
          followersCount: 892,
          followingCount: 456,
          isFollowing: false,
          isOnline: true,
          badges: [],
          skills: ['UI/UX Design', 'Digital Art', 'Creative Direction'],
          interests: ['Art', 'Design', 'Technology'],
          joinDate: '2023-01-20',
          eventsCount: 8,
          projectsCount: 5,
          isPremium: false,
          isFeatured: false
        },
        {
          id: 'user-4',
          name: 'David Kim',
          email: 'david@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&',
          bio: 'Fitness coach and wellness advocate promoting healthy lifestyles',
          location: 'Miami, FL',
          verified: true,
          followersCount: 3456,
          followingCount: 123,
          isFollowing: false,
          isOnline: false,
          badges: ['trending'],
          skills: ['Personal Training', 'Nutrition', 'Wellness Coaching'],
          interests: ['Fitness', 'Health', 'Wellness'],
          joinDate: '2022-06-10',
          eventsCount: 32,
          projectsCount: 14,
          isPremium: true,
          isFeatured: false
        }
      ];

      setDiscoveredUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching discovered users:', error);
      toast({
        title: "Error",
        description: "Failed to load discovered users",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Move useEffect after function definitions
  useEffect(() => {
    fetchLocalContent();
    fetchTrendingContent();
    fetchDiscoveredUsers();
  }, [fetchLocalContent, fetchTrendingContent, fetchDiscoveredUsers]);

  const getTrendingIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'artist': return <Star className="h-4 w-4" />;
      case 'post': return <Users className="h-4 w-4" />;
      case 'group': return <Users className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const handleUserAction = useCallback(async (userId: string, action: string, data?: Record<string, unknown>) => {
    console.log(`User action: ${action} for user ${userId}`, data);
    
    switch (action) {
      case 'follow':
        toast({
          title: "Success",
          description: "You are now following this user",
        });
        break;
      case 'message':
        toast({
          title: "Message",
          description: "Opening message composer...",
        });
        break;
      case 'view_profile':
        toast({
          title: "Profile",
          description: "Navigating to user profile...",
        });
        break;
      case 'share':
        toast({
          title: "Share",
          description: "Sharing user profile...",
        });
        break;
      case 'edit':
        toast({
          title: "Edit",
          description: "Opening profile editor...",
        });
        break;
      case 'contact':
        toast({
          title: "Contact",
          description: "Opening contact options...",
        });
        break;
      default:
        break;
    }
  }, [toast]);

  const handleFollow = useCallback(async (userId: string) => {
    try {
      // Update local state
      setDiscoveredUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );
      
      toast({
        title: "Success",
        description: "Follow status updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleMessage = useCallback(async (userId: string) => {
    toast({
      title: "Message",
      description: "Opening message composer...",
    });
  }, [toast]);

  const handleViewProfile = useCallback(async (userId: string) => {
    toast({
      title: "Profile",
      description: "Navigating to user profile...",
    });
  }, [toast]);

  const handleShare = useCallback(async (userId: string) => {
    toast({
      title: "Share",
      description: "Sharing user profile...",
    });
  }, [toast]);

  const handleEdit = useCallback(async (userId: string) => {
    toast({
      title: "Edit",
      description: "Opening profile editor...",
    });
  }, [toast]);

  const handleContact = useCallback(async (userId: string) => {
    toast({
      title: "Contact",
      description: "Opening contact options...",
    });
  }, [toast]);

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            Discover Your Community
          </h1>
          <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto">
            Connect with amazing people, discover local events, and explore trending content in your area
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">People</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="draggable">Draggable</TabsTrigger>
            <TabsTrigger value="virtualized">Virtualized</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <AdvancedSearch />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Discover Amazing People</h2>
              <p className="text-muted-foreground">
                Connect with verified professionals, creators, and community leaders
              </p>
            </div>

            {/* Featured Users Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Featured Users
                </CardTitle>
                <CardDescription>
                  Premium and verified users you might want to connect with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {discoveredUsers.filter(user => user.isPremium || user.isFeatured).map((user) => (
                    <EnhancedUserProfileCard
                      key={user.id}
                      user={user}
                      variant={user.isFeatured ? 'featured' : 'premium'}
                      onFollow={handleFollow}
                      onMessage={handleMessage}
                      onViewProfile={handleViewProfile}
                      onShare={handleShare}
                      onEdit={handleEdit}
                      onContact={handleContact}
                      showActions={true}
                      showStats={true}
                      showSocialLinks={true}
                      showSkills={true}
                      showInterests={true}
                      animate={true}
                      interactive={true}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* All Users Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Users
                </CardTitle>
                <CardDescription>
                  Browse and discover users in your community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserList
                  users={discoveredUsers}
                  variant="compact"
                  layout="grid"
                  showSearch={true}
                  showFilters={true}
                  showTabs={true}
                  onUserAction={handleUserAction}
                  onFollow={handleFollow}
                  onMessage={handleMessage}
                  onViewProfile={handleViewProfile}
                  onShare={handleShare}
                  onEdit={handleEdit}
                  onContact={handleContact}
                />
              </CardContent>
            </Card>
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

          <TabsContent value="trending" className="space-y-6">
            <TrendingContent />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <RecommendationFeed />
            <FollowSuggestions />
          </TabsContent>

          {/* Draggable Users Tab */}
          <TabsContent value="draggable" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Interactive User List</h2>
                <p className="text-muted-foreground">
                  Drag and drop users to reorder them. Use the shuffle button to randomize the order.
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-blue-500" />
                    Draggable Users
                  </CardTitle>
                  <CardDescription>
                    Drag users to reorder them. Click shuffle to randomize the order.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DraggableUserList
                    users={discoveredUsers}
                    variant="compact"
                    onReorder={(newOrder) => {
                      setDiscoveredUsers(newOrder);
                      toast({
                        title: "Users Reordered",
                        description: "The user list has been updated with the new order.",
                      });
                    }}
                    onFollow={handleFollow}
                    onMessage={handleMessage}
                    onViewProfile={handleViewProfile}
                    onShare={handleShare}
                    onEdit={handleEdit}
                    onContact={handleContact}
                    showDragHandles={true}
                    allowReordering={true}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Virtualized Users Tab */}
          <TabsContent value="virtualized" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">High-Performance User List</h2>
                <p className="text-muted-foreground">
                  This list uses virtualization to handle large datasets efficiently. Only visible items are rendered.
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    Virtualized Users
                  </CardTitle>
                  <CardDescription>
                    High-performance list with search, filtering, and sorting capabilities.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VirtualizedUserList
                    users={discoveredUsers}
                    variant="dark"
                    height={600}
                    itemHeight={120}
                    onFollow={handleFollow}
                    onMessage={handleMessage}
                    onViewProfile={handleViewProfile}
                    onShare={handleShare}
                    onEdit={handleEdit}
                    onContact={handleContact}
                    showSearch={true}
                    showFilters={true}
                    showSorting={true}
                    enableVirtualization={true}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default Discover;
