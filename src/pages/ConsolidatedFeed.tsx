import { useState, useEffect, useCallback } from "react";
import { FeedPageTemplate } from "@/components/layout/UnifiedPageTemplate";
import { RedditStyleFeed } from "@/components/feed/RedditStyleFeed";
import { VoiceControlPanel } from "@/components/VoiceControlPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  Users, 
  MapPin, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Plus,
  Bell,
  Settings,
  Globe,
  Star
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { useEvents } from "@/hooks/useEvents";
import { useCommunities } from "@/hooks/useCommunities";
import { useToast } from "@/hooks/use-toast";
import { PostCard } from "@/components/PostCard";
import { EventCard } from "@/components/EventCard";
import { CommunityCard } from "@/components/CommunityCard";
import { EnhancedFeed } from "@/components/feed/EnhancedFeed";
import { motion } from "framer-motion";

interface TrendingTopic {
  id: string;
  name: string;
  count: number;
  category: string;
}

interface SidebarHighlight {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'community' | 'post';
  image?: string;
  date?: string;
  location?: string;
}

const ConsolidatedFeed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showVoiceControl, setShowVoiceControl] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Enhanced data fetching
  const { posts, loading: postsLoading, refetch: refreshPosts } = usePosts();
  const { events, loading: eventsLoading, refetch: refreshEvents } = useEvents();
  const { communities, loading: communitiesLoading, fetchCommunities: refreshCommunities } = useCommunities();

  // Enhanced trending topics
  const trendingTopics: TrendingTopic[] = [
    { id: '1', name: 'Local Music Festival', count: 245, category: 'Music' },
    { id: '2', name: 'Community Garden', count: 189, category: 'Environment' },
    { id: '3', name: 'Tech Meetup', count: 156, category: 'Technology' },
    { id: '4', name: 'Art Exhibition', count: 134, category: 'Arts' },
    { id: '5', name: 'Food Truck Rally', count: 98, category: 'Food' }
  ];

  // Enhanced sidebar highlights
  const sidebarHighlights: SidebarHighlight[] = [
    {
      id: '1',
      title: 'Local Music Festival 2024',
      description: 'Three days of amazing local music',
      type: 'event',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
      date: 'Dec 15-17, 2024',
      location: 'Central Park'
    },
    {
      id: '2',
      title: 'Green Thumbs Collective',
      description: 'Join our sustainable gardening community',
      type: 'community',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop'
    },
    {
      id: '3',
      title: 'Amazing sunset at the beach',
      description: 'The colors were absolutely breathtaking',
      type: 'post',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop'
    }
  ];

  // Enhanced filtering and search with defensive programming
  const filteredPosts = (posts || []).filter(post => {
    if (!searchQuery) return true;
    return post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const filteredEvents = (events || []).filter(event => {
    if (!searchQuery) return true;
    return event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           event.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredCommunities = (communities || []).filter(community => {
    if (!searchQuery) return true;
    return community.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           community.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Enhanced refresh functionality
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshPosts(),
        refreshEvents(),
        refreshCommunities()
      ]);
      toast({
        title: "Feed Refreshed",
        description: "Your feed has been updated with the latest content.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh your feed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshPosts, refreshEvents, refreshCommunities, toast]);

  // Enhanced voice control
  const handleVoiceCommand = useCallback((command: string) => {
    setSearchQuery(command);
    toast({
      title: "Voice Search",
      description: `Searching for: ${command}`,
    });
  }, [toast]);

  // Enhanced mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced loading state
  if (postsLoading && eventsLoading && communitiesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Loading Feed...</h2>
            <p className="text-muted-foreground">Getting the latest content for you</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - if there's a critical error, show a fallback
  if (!posts && !events && !communities && !postsLoading && !eventsLoading && !communitiesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Unable to load feed</h2>
            <p className="text-muted-foreground mb-4">There was an issue loading your feed content.</p>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const FeedContent = () => (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Feed</h1>
          <p className="text-muted-foreground mt-2">
            Stay connected with your local community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts, events, communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="lg:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Enhanced Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="latest" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Latest
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Following
              </TabsTrigger>
              <TabsTrigger value="local" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Local
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="space-y-4">
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No trending posts found. Be the first to share something!</p>
                  </div>
                ) : filteredPosts
                  .filter(post => (post.likes_count || 0) > 10)
                  .slice(0, 10)
                  .map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <PostCard
                        post={{
                          ...post,
                          author: {
                            id: post.user_id,
                            name: post.profiles?.display_name || post.profiles?.username || 'Anonymous',
                            avatar: post.profiles?.avatar_url,
                            verified: false
                          }
                        }}
                        onLike={(postId) => {
                          toast({
                            title: "Liked!",
                            description: "Post added to your likes.",
                          });
                        }}
                        onComment={(postId) => {
                          toast({
                            title: "Comment",
                            description: "Comment functionality coming soon!",
                          });
                        }}
                        onShare={(postId) => {
                          toast({
                            title: "Shared!",
                            description: "Post shared successfully.",
                          });
                        }}
                        onBookmark={(postId) => {
                          toast({
                            title: "Bookmarked!",
                            description: "Post saved to your bookmarks.",
                          });
                        }}
                      />
                    </motion.div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="latest" className="space-y-4">
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No posts found. Be the first to share something!</p>
                  </div>
                ) : filteredPosts
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 10)
                  .map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <PostCard
                        post={{
                          ...post,
                          author: {
                            id: post.user_id,
                            name: post.profiles?.display_name || post.profiles?.username || 'Anonymous',
                            avatar: post.profiles?.avatar_url,
                            verified: false
                          }
                        }}
                        onLike={(postId) => {
                          toast({
                            title: "Liked!",
                            description: "Post added to your likes.",
                          });
                        }}
                        onComment={(postId) => {
                          toast({
                            title: "Comment",
                            description: "Comment functionality coming soon!",
                          });
                        }}
                        onShare={(postId) => {
                          toast({
                            title: "Shared!",
                            description: "Post shared successfully.",
                          });
                        }}
                        onBookmark={(postId) => {
                          toast({
                            title: "Bookmarked!",
                            description: "Post saved to your bookmarks.",
                          });
                        }}
                      />
                    </motion.div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="following" className="space-y-4">
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No posts from people you follow yet.</p>
                  </div>
                ) : filteredPosts
                  .filter(post => post.user_id === user?.id)
                  .slice(0, 10)
                  .map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <PostCard
                        post={{
                          ...post,
                          author: {
                            id: post.user_id,
                            name: post.profiles?.display_name || post.profiles?.username || 'Anonymous',
                            avatar: post.profiles?.avatar_url,
                            verified: false
                          }
                        }}
                        onLike={(postId) => {
                          toast({
                            title: "Liked!",
                            description: "Post added to your likes.",
                          });
                        }}
                        onComment={(postId) => {
                          toast({
                            title: "Comment",
                            description: "Comment functionality coming soon!",
                          });
                        }}
                        onShare={(postId) => {
                          toast({
                            title: "Shared!",
                            description: "Post shared successfully.",
                          });
                        }}
                        onBookmark={(postId) => {
                          toast({
                            title: "Bookmarked!",
                            description: "Post saved to your bookmarks.",
                          });
                        }}
                      />
                    </motion.div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="local" className="space-y-4">
              <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No local events found. Check back later!</p>
                  </div>
                ) : filteredEvents
                  .slice(0, 5)
                  .map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <EventCard
                        event={event}
                        onAttend={(eventId) => {
                          toast({
                            title: "Event Attended!",
                            description: "You're now attending this event.",
                          });
                        }}
                        onLike={(eventId) => {
                          toast({
                            title: "Event Liked!",
                            description: "Event added to your likes.",
                          });
                        }}
                        onShare={(eventId) => {
                          toast({
                            title: "Event Shared!",
                            description: "Event shared successfully.",
                          });
                        }}
                      />
                    </motion.div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSearchQuery(topic.name)}
                >
                  <div>
                    <p className="font-medium text-sm">{topic.name}</p>
                    <p className="text-xs text-muted-foreground">{topic.category}</p>
                  </div>
                  <Badge variant="secondary">{topic.count}</Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Sidebar Highlights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sidebarHighlights.map((highlight, index) => (
                <motion.div
                  key={highlight.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <img
                    src={highlight.image}
                    alt={highlight.title}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-semibold text-sm">{highlight.title}</h4>
                    <p className="text-xs text-muted-foreground">{highlight.description}</p>
                    {highlight.date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {highlight.date} • {highlight.location}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <FeedContent />
      
      {/* Voice Control Panel */}
      {showVoiceControl && (
        <VoiceControlPanel
          onCommand={handleVoiceCommand}
          onClose={() => setShowVoiceControl(false)}
        />
      )}
    </>
  );
};

export default ConsolidatedFeed;
