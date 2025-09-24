import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  MapPin, 
  Users, 
  Calendar, 
  Zap, 
  Sparkles,
  TrendingUp,
  Flame,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Tag,
  Award,
  Trophy,
  Globe,
  Home,
  Search,
  Plus,
  Bell,
  Settings,
  Ticket
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { EventCard } from "@/components/EventCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

// Sample data for the enhanced homepage
const trendingEvent = {
  id: 1,
  title: "Local Music Festival 2024",
  description: "A three-day celebration of local music talent featuring over 50 artists across multiple stages.",
  image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
  date: "Dec 15-17, 2024",
  location: "Central Park, Downtown",
  attendees: 1250,
  maxAttendees: 2000,
  category: "Music",
  featured: true,
  organizer: {
    name: "SoundWave Productions",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  }
};

const trendingDiscussions = [
  {
    id: 1,
    title: "Best local coffee shops in the area?",
    author: "CoffeeLover",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    category: "Food & Drink",
    replies: 47,
    views: 1234,
    trending: true,
    tags: ["coffee", "local", "recommendations"]
  },
  {
    id: 2,
    title: "Weekend hiking trails near the city",
    author: "NatureExplorer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    category: "Outdoors",
    replies: 32,
    views: 856,
    trending: true,
    tags: ["hiking", "outdoors", "weekend"]
  }
];

const communitySpotlight = [
  {
    id: 1,
    name: "Local Artists Collective",
    members: 234,
    description: "Supporting and promoting local artists in our community",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop",
    category: "Arts",
    featured: true
  },
  {
    id: 2,
    name: "Tech Enthusiasts",
    members: 189,
    description: "Discussing the latest in technology and innovation",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop",
    category: "Technology",
    featured: false
  }
];

const leaderboard = [
  { rank: 1, name: "Sarah Chen", points: 2847, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face", badge: "🏆" },
  { rank: 2, name: "Mike Johnson", points: 2654, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", badge: "🥈" },
  { rank: 3, name: "Emma Wilson", points: 2432, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", badge: "🥉" },
  { rank: 4, name: "Alex Rodriguez", points: 2198, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", badge: "⭐" },
  { rank: 5, name: "Lisa Park", points: 1987, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face", badge: "⭐" }
];

const quickActions = [
  { icon: Plus, label: "Create Event", href: "/create-event", color: "btn-event" },
  { icon: MessageCircle, label: "Start Discussion", href: "/community/create-discussion", color: "btn-community" },
  { icon: Users, label: "Join Community", href: "/community", color: "btn-trending" },
  { icon: Calendar, label: "Browse Events", href: "/events", color: "btn-community" }
];

const Index = () => {
  const { user } = useAuth();
  const { events, loading, toggleAttendance } = useEvents();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Filter upcoming events (events with future dates)
  const upcomingEvents = events
    .filter(event => {
      try {
        const eventDate = new Date(event.event_date);
        const today = new Date();
        return eventDate >= today;
      } catch {
        return false;
      }
    })
    .sort((a, b) => {
      try {
        const dateA = new Date(a.event_date);
        const dateB = new Date(b.event_date);
        return dateA.getTime() - dateB.getTime();
      } catch {
        return 0;
      }
    })
    .slice(0, 5); // Show only the next 5 events

  const handleAttendEvent = async (eventId: string) => {
    await toggleAttendance(eventId);
  };

  const handleLikeEvent = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login required",
          description: "Please login to like events",
          variant: "destructive"
        });
        return;
      }

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('event_likes')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('event_likes')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
        
        toast({
          title: "Event unliked",
          description: "Removed from your liked events",
        });
      } else {
        // Like
        await supabase
          .from('event_likes')
          .insert({
            event_id: eventId,
            user_id: user.id
          });
        
        toast({
          title: "Event liked!",
          description: "Added to your liked events",
        });
      }

      // Refresh events to update like status
      loadEvents();
    } catch (error) {
      console.error('Error liking event:', error);
      toast({
        title: "Error",
        description: "Failed to like event",
        variant: "destructive"
      });
    }
  };

  const handleShareEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      const shareData = {
        title: event.title,
        text: `Join "${event.title}" on TheGlocal community platform!`,
        url: `${window.location.origin}/events/${eventId}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Event link copied!",
          description: "Share link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing event:', error);
      toast({
        title: "Share failed",
        description: "Unable to share event",
        variant: "destructive"
      });
    }
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Hero Banner - Featured Event */}
        <section className="hero-section rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
          <div className="relative p-8 md:p-12 text-white">
            <div className="max-w-4xl">
              <Badge className="mb-4 bg-orange-500 hover:bg-orange-600">
                <Flame className="w-3 h-3 mr-1" />
                Featured Event
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                {trendingEvent.title}
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-white/90 max-w-2xl">
                {trendingEvent.description}
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{trendingEvent.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{trendingEvent.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{trendingEvent.attendees} attending</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="btn-event">
                  <Ticket className="w-5 h-5 mr-2" />
                  Get Tickets
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                  <Heart className="w-5 h-5 mr-2" />
                  Save Event
                </Button>
              </div>
            </div>
          </div>
          <img 
            src={trendingEvent.image} 
            alt={trendingEvent.title}
            className="absolute inset-0 w-full h-full object-cover -z-10"
          />
        </section>

        {/* Quick Actions Bar */}
        <section className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <Button className={`w-full h-20 flex flex-col gap-2 ${action.color}`}>
                  <action.icon className="w-6 h-6" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trending vs Local Tabs */}
            <Tabs defaultValue="trending" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="local" className="flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Local
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="trending" className="space-y-4">
                {/* Trending Discussions */}
                <Card className="discussion-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={trendingDiscussions[0].avatar} />
                          <AvatarFallback>{trendingDiscussions[0].author[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{trendingDiscussions[0].title}</CardTitle>
                          <CardDescription>
                            by {trendingDiscussions[0].author} • {trendingDiscussions[0].replies} replies
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="badge-trending">
                        <Flame className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{trendingDiscussions[0].views} views</span>
                      <span>•</span>
                      <span>{trendingDiscussions[0].category}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {trendingDiscussions[0].tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Upcoming Events ({upcomingEvents.length})</h3>
                    <Link to="/events">
                      <Button variant="outline" size="sm">
                        View All Events
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <div className="h-48 bg-muted rounded-t-lg"></div>
                          <CardContent className="p-4">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-full mb-2"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcomingEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onAttend={handleAttendEvent}
                          onBook={(eventId) => {
                            toast({
                              title: "Feature Coming Soon",
                              description: "Event booking functionality will be available soon!",
                            });
                          }}
                          onLike={handleLikeEvent}
                          onChat={(eventId, organizerId) => {
                            toast({
                              title: "Feature Coming Soon",
                              description: "Chat functionality will be available soon!",
                            });
                          }}
                          verified={Math.random() > 0.7} // Randomly show some as verified for demo
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Upcoming Events</h3>
                        <p className="text-muted-foreground mb-4">
                          There are no upcoming events in your area. Be the first to create one!
                        </p>
                        <Link to="/create-event">
                          <Button className="btn-event">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Event
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="local" className="space-y-4">
                <Card className="community-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      Local Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Discover what's happening in your local community. Connect with neighbors, 
                      find local events, and stay updated with community news.
                    </p>
                    <Button className="mt-4 btn-community">
                      Explore Local
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Community Spotlight */}
            <Card className="community-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Community Spotlight
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {communitySpotlight.map((community) => (
                  <div key={community.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <img 
                      src={community.image} 
                      alt={community.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{community.name}</h4>
                      <p className="text-xs text-muted-foreground mb-1">{community.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{community.members} members</span>
                        <Badge className="badge-community text-xs">{community.category}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="trending-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Community Leaderboard
                </CardTitle>
                <CardDescription>Top contributors this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaderboard.map((user) => (
                  <div key={user.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <span className="text-lg">{user.badge}</span>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.points} points</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Events Attended</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Communities Joined</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Discussions Started</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Points Earned</span>
                  <span className="font-semibold text-primary">1,247</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default Index;
