import { useState, useEffect, useCallback } from "react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { UnifiedButton } from "@/components/ui/UnifiedButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Filter,
  TrendingUp,
  Flame,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Image,
  Video,
  Award,
  Trophy,
  Crown,
  Shield,
  Zap,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Reply,
  Send,
  Smile,
  Camera,
  Mic,
  Paperclip
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SocialPostService } from "@/services/socialPostService";
import { supabase } from "@/integrations/supabase/client";

interface FeedPost {
  id: string;
  type: 'post' | 'event' | 'service' | 'discussion';
  title?: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  post_type?: string;
  event_date?: string;
  event_location?: string;
  price_range?: string;
  tags?: string[];
  image_urls?: string[];
  is_anonymous?: boolean;
  author?: {
    display_name?: string;
    avatar_url?: string;
    username?: string;
  };
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
}

const Feed = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'trending';
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingTopics, setTrendingTopics] = useState<Array<{name: string, count: number, trending: boolean}>>([]);
  const [sidebarHighlights, setSidebarHighlights] = useState<Array<{
    id: string;
    type: 'event' | 'community' | 'discussion';
    title: string;
    image: string;
    date?: string;
    attendees?: number;
    members?: number;
    description?: string;
    author?: string;
    replies?: number;
  }>>([]);

  // Fetch posts from database
  const fetchPosts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Use community_posts table instead of social_posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles!user_id (
            display_name,
            avatar_url,
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      const postsWithAuthors = (postsData || []).map((post) => ({
        ...post,
        author: post.profiles || { display_name: 'Anonymous', avatar_url: null }
      }));

      setPosts(postsWithAuthors);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: "Failed to load posts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Fetch trending topics
  const fetchTrendingTopics = async () => {
    try {
      const { data } = await supabase
        .from('community_posts')
        .select('tags')
        .not('tags', 'is', null);
      
      const tagCounts: Record<string, number> = {};
      data?.forEach(post => {
        if (post.tags) {
          post.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      const trending = Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count, trending: count > 5 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTrendingTopics(trending);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    }
  };

  // Fetch sidebar highlights (events and communities)
  const fetchSidebarHighlights = async () => {
    try {
      // Fetch recent events
      const { data: events } = await supabase
        .from('events')
        .select('id, title, event_date, image_url, max_attendees')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(2);

      // Fetch popular communities
      const { data: communities } = await supabase
        .from('community_groups')
        .select('id, name, description, member_count')
        .order('member_count', { ascending: false })
        .limit(1);

      const highlights = [
        ...(events?.map(event => ({
          id: event.id,
          type: "event",
          title: event.title,
          image: event.image_url || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=150&fit=crop",
          date: new Date(event.event_date).toLocaleDateString(),
          attendees: event.max_attendees || 0
        })) || []),
        ...(communities?.map(community => ({
          id: community.id,
          type: "community",
          title: community.name,
          image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=150&fit=crop",
          members: community.member_count || 0,
          description: community.description
        })) || [])
      ];

      setSidebarHighlights(highlights);
    } catch (error) {
      console.error('Error fetching sidebar highlights:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPosts();
    fetchTrendingTopics();
    fetchSidebarHighlights();
  }, [fetchPosts]);

  // Update active tab when URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['trending', 'latest', 'following', 'local'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      return post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (post.author?.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
             (post.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "hot":
        return (b.likes_count || 0) - (a.likes_count || 0);
      case "new":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "top":
        return (b.likes_count || 0) - (a.likes_count || 0);
      default:
        return 0;
    }
  });

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const renderPostContent = (post: FeedPost) => {
    switch (post.type) {
      case "event":
        return (
          <div className="space-y-3">
            <p>{post.content}</p>
            <Card className="event-card">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img 
                    src={post.image_urls?.[0] || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"} 
                    alt={post.title || 'Event'}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{post.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      {post.event_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.event_date).toLocaleDateString()}
                        </span>
                      )}
                      {post.event_location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {post.event_location}
                        </span>
                      )}
                    </div>
                    {post.price_range && (
                      <Badge className="badge-event">{post.price_range}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return (
          <div className="space-y-3">
            {post.title && <h3 className="font-semibold text-lg">{post.title}</h3>}
            <p>{post.content}</p>
            {post.image_urls && post.image_urls.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {post.image_urls.map((image: string, index: number) => (
                  <img 
                    key={index}
                    src={image} 
                    alt="Post content"
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gradient">Feed</h1>
            <p className="text-muted-foreground mt-1 lg:mt-2 text-sm lg:text-base">
              Discover and engage with community content
            </p>
          </div>
          <UnifiedButton 
            context="community"
            fullWidth
            className="sm:w-auto"
            onClick={() => navigate('/create')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Post
          </UnifiedButton>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts, topics, or people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Feed */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Feed Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="trending" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                  <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Trending</span>
                  <span className="sm:hidden">Hot</span>
                </TabsTrigger>
                <TabsTrigger value="latest" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                  <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Latest</span>
                  <span className="sm:hidden">New</span>
                </TabsTrigger>
                <TabsTrigger value="following" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                  <Users className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Following</span>
                  <span className="sm:hidden">Follow</span>
                </TabsTrigger>
                <TabsTrigger value="local" className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                  <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Local</span>
                  <span className="sm:hidden">Near</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="trending" className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading posts...</p>
                  </div>
                ) : sortedPosts.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No trending posts yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to create a trending post in your community!
                      </p>
                      <Button onClick={() => navigate('/create')} className="btn-community">
                        Create Post
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  sortedPosts.filter(post => (post.likes_count || 0) > 5).map((post) => (
                    <Card key={post.id} className="discussion-card">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={post.author?.avatar_url || undefined} />
                              <AvatarFallback>
                                {post.author?.display_name?.[0] || 'A'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {post.is_anonymous ? 'Anonymous' : (post.author?.display_name || 'Unknown')}
                                </h3>
                                {(post.likes_count || 0) > 5 && (
                                  <Badge className="badge-trending">
                                    <Flame className="w-3 h-3 mr-1" />
                                    Trending
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{formatTimeAgo(post.created_at)}</span>
                                <span>•</span>
                                <span>{post.type}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {renderPostContent(post)}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <ArrowUp className="w-4 h-4" />
                              {post.likes_count || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <MessageCircle className="w-4 h-4" />
                              {post.comments_count || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Share2 className="w-4 h-4" />
                              Share
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                              {post.views_count || 0}
                            </Button>
                          </div>
                        </div>
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {post.tags.map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="latest" className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading posts...</p>
                  </div>
                ) : sortedPosts.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to share something with your community!
                      </p>
                      <Button onClick={() => navigate('/create')} className="btn-community">
                        Create Post
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  sortedPosts.map((post) => (
                    <Card key={post.id} className="discussion-card">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={post.author?.avatar_url || undefined} />
                              <AvatarFallback>
                                {post.author?.display_name?.[0] || 'A'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {post.is_anonymous ? 'Anonymous' : (post.author?.display_name || 'Unknown')}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{formatTimeAgo(post.created_at)}</span>
                                <span>•</span>
                                <span>{post.type}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {renderPostContent(post)}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <ArrowUp className="w-4 h-4" />
                              {post.likes_count || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <MessageCircle className="w-4 h-4" />
                              {post.comments_count || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Share2 className="w-4 h-4" />
                              Share
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                              {post.views_count || 0}
                            </Button>
                          </div>
                        </div>
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {post.tags.map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="following" className="space-y-4">
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Follow people to see their posts</h3>
                    <p className="text-muted-foreground mb-4">
                      Start following community members to see their latest posts here
                    </p>
                    <Button className="btn-community">
                      Discover People
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="local" className="space-y-4">
                <Card className="community-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-500" />
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
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card className="trending-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-500" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">#{topic.name}</span>
                      {topic.trending && (
                        <Badge className="badge-trending text-xs">
                          <Flame className="w-3 h-3 mr-1" />
                          Hot
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{topic.count} posts</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sidebar Highlights */}
            <Card className="community-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sidebarHighlights.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      {item.type === "event" && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>{item.attendees} attending</span>
                        </div>
                      )}
                      {item.type === "community" && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{item.members} members</span>
                        </div>
                      )}
                      {item.type === "discussion" && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>by {item.author}</span>
                          <span>•</span>
                          <span>{item.replies} replies</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Posts Created</span>
                    <span className="font-semibold">{posts.filter(p => p.user_id === user.id).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Posts</span>
                    <span className="font-semibold">{posts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Trending Topics</span>
                    <span className="font-semibold">{trendingTopics.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Community Highlights</span>
                    <span className="font-semibold text-primary">{sidebarHighlights.length}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default Feed;
