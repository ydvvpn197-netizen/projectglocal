import { useState, useEffect } from "react";
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

// Sample feed data
const feedPosts = [
  {
    id: 1,
    type: "post",
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      verified: true,
      role: "Community Leader"
    },
    content: "Just finished setting up the community garden! 🌱 The tomatoes are looking great and we have some amazing volunteers helping out. Can't wait to see everyone at the harvest party next month!",
    images: ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop"],
    likes: 45,
    dislikes: 2,
    comments: 12,
    shares: 8,
    views: 234,
    timestamp: "2 hours ago",
    category: "Community",
    tags: ["gardening", "community", "volunteers"],
    trending: true
  },
  {
    id: 2,
    type: "poll",
    author: {
      name: "Mike Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      verified: false,
      role: "Member"
    },
    question: "What's your favorite local coffee shop?",
    options: [
      { id: 1, text: "Downtown Brew", votes: 23, percentage: 46 },
      { id: 2, text: "Corner Cafe", votes: 15, percentage: 30 },
      { id: 3, text: "Artisan Roasters", votes: 8, percentage: 16 },
      { id: 4, text: "Other", votes: 4, percentage: 8 }
    ],
    totalVotes: 50,
    likes: 18,
    dislikes: 1,
    comments: 8,
    shares: 3,
    views: 156,
    timestamp: "4 hours ago",
    category: "Food & Drink",
    tags: ["coffee", "local", "poll"],
    trending: false
  },
  {
    id: 3,
    type: "event",
    author: {
      name: "Emma Wilson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      verified: true,
      role: "Event Organizer"
    },
    content: "🎵 Local Music Festival is back! This year we're featuring over 30 local artists across 3 stages. Early bird tickets are now available!",
    event: {
      title: "Local Music Festival 2024",
      date: "Dec 15-17, 2024",
      time: "12:00 PM - 11:00 PM",
      location: "Central Park",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
      attendees: 1250,
      maxAttendees: 2000,
      price: "$45"
    },
    likes: 67,
    dislikes: 3,
    comments: 24,
    shares: 15,
    views: 456,
    timestamp: "6 hours ago",
    category: "Music",
    tags: ["festival", "music", "local"],
    trending: true
  },
  {
    id: 4,
    type: "post",
    author: {
      name: "Alex Rodriguez",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      verified: false,
      role: "Member"
    },
    content: "Just discovered this amazing street art mural downtown! The artist really captured the spirit of our community. Has anyone else seen it?",
    images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=400&fit=crop"],
    likes: 32,
    dislikes: 1,
    comments: 9,
    shares: 5,
    views: 189,
    timestamp: "8 hours ago",
    category: "Art",
    tags: ["street art", "mural", "downtown"],
    trending: false
  }
];

const trendingTopics = [
  { name: "Local Events", count: 156, trending: true },
  { name: "Community Garden", count: 89, trending: true },
  { name: "Street Art", count: 67, trending: false },
  { name: "Coffee Shops", count: 45, trending: false },
  { name: "Music Festival", count: 123, trending: true }
];

const sidebarHighlights = [
  {
    id: 1,
    type: "event",
    title: "Art Exhibition Opening",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=150&fit=crop",
    date: "Dec 10, 2024",
    attendees: 89
  },
  {
    id: 2,
    type: "community",
    title: "Local Artists Collective",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=150&fit=crop",
    members: 234,
    description: "Supporting local artists"
  },
  {
    id: 3,
    type: "discussion",
    title: "Best hiking trails near the city?",
    author: "NatureExplorer",
    replies: 32,
    views: 856
  }
];

const Feed = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'trending';
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("hot");
  const [searchQuery, setSearchQuery] = useState("");

  // Update active tab when URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['trending', 'latest', 'following', 'local'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const filteredPosts = feedPosts.filter(post => {
    if (searchQuery) {
      return post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
             post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "hot":
        return (b.likes - b.dislikes) - (a.likes - a.dislikes);
      case "new":
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case "top":
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  const renderPostContent = (post: Record<string, unknown>) => {
    switch (post.type) {
      case "poll":
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{post.question}</h3>
            <div className="space-y-2">
              {post.options.map((option: Record<string, unknown>) => (
                <div key={option.id} className="relative">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <span>{option.text}</span>
                    <span className="text-sm text-muted-foreground">
                      {option.votes} votes ({option.percentage}%)
                    </span>
                  </div>
                  <div 
                    className="absolute inset-0 bg-primary/10 rounded-lg pointer-events-none"
                    style={{ width: `${option.percentage}%` }}
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {post.totalVotes} total votes
            </p>
          </div>
        );
      
      case "event":
        return (
          <div className="space-y-3">
            <p>{post.content}</p>
            <Card className="event-card">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img 
                    src={post.event.image} 
                    alt={post.event.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{post.event.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.event.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {post.event.attendees} attending
                      </span>
                      <Badge className="badge-event">{post.event.price}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return (
          <div className="space-y-3">
            <p>{post.content}</p>
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {post.images.map((image: string, index: number) => (
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
                {sortedPosts.filter(post => post.trending).map((post) => (
                  <Card key={post.id} className="discussion-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{post.author.name}</h3>
                              {post.author.verified && (
                                <Badge className="bg-blue-500 text-white text-xs">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {post.trending && (
                                <Badge className="badge-trending">
                                  <Flame className="w-3 h-3 mr-1" />
                                  Trending
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{post.author.role}</span>
                              <span>•</span>
                              <span>{post.timestamp}</span>
                              <span>•</span>
                              <span>{post.category}</span>
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
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowDown className="w-4 h-4" />
                            {post.dislikes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Share2 className="w-4 h-4" />
                            {post.shares}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Bookmark className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {post.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="latest" className="space-y-4">
                {sortedPosts.map((post) => (
                  <Card key={post.id} className="discussion-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{post.author.name}</h3>
                              {post.author.verified && (
                                <Badge className="bg-blue-500 text-white text-xs">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{post.author.role}</span>
                              <span>•</span>
                              <span>{post.timestamp}</span>
                              <span>•</span>
                              <span>{post.category}</span>
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
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowDown className="w-4 h-4" />
                            {post.dislikes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Share2 className="w-4 h-4" />
                            {post.shares}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Bookmark className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {post.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Posts Created</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Comments Made</span>
                  <span className="font-semibold">45</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Posts Liked</span>
                  <span className="font-semibold">89</span>
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

export default Feed;
