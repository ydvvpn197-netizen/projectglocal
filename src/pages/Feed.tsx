import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Share, MapPin, Clock, Users, Star, Calendar, Phone, Mail } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { usePosts, Post } from "@/hooks/usePosts";
import { format } from 'date-fns';
import { useSampleData } from "@/hooks/useSampleData";
import { Link } from "react-router-dom";
import { DistanceFilter } from "@/components/DistanceFilter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Feed = () => {
  const { posts, loading, toggleLike } = usePosts();
  const { createSamplePosts, loading: sampleLoading } = useSampleData();
  const [distanceFilter, setDistanceFilter] = useState(50);
  const [localNews, setLocalNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const { user } = useAuth();

  // Fetch local news when component mounts
  useEffect(() => {
    fetchLocalNews();
  }, []);

  const fetchLocalNews = async () => {
    setLoadingNews(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-local-news', {
        body: { location: 'Your Area' }
      });
      
      if (error) throw error;
      setLocalNews(data.news || []);
    } catch (error) {
      console.error('Error fetching local news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  const PostCard = ({ post }: { post: Post }) => {
    const getInitials = (name?: string) => {
      if (!name) return 'U';
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getTimeAgo = (dateString: string) => {
      try {
        return format(new Date(dateString), 'MMM d, yyyy');
      } catch {
        return 'Unknown date';
      }
    };

    return (
    <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.profiles?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(post.profiles?.display_name || post.profiles?.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {post.profiles?.display_name || post.profiles?.username || 'Anonymous'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {getTimeAgo(post.created_at)}
                {(post.location_city || post.event_location) && (
                  <>
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    {post.event_location || `${post.location_city}, ${post.location_state}`}
                  </>
                )}
              </div>
            </div>
          </div>
          <Badge variant={
            post.type === "event" ? "default" : 
            post.type === "service" ? "secondary" :
            post.type === "discussion" ? "outline" : "secondary"
          }>
            {post.type === "event" ? "Event" : 
             post.type === "service" ? "Service" :
             post.type === "discussion" ? "Discussion" : "Post"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
          <p className="text-muted-foreground">{post.content}</p>
        </div>

        {/* Event specific info */}
        {post.type === "event" && post.event_date && (
          <div className="flex items-center gap-2 text-sm bg-primary/5 p-3 rounded-lg">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">
              {format(new Date(post.event_date), 'PPP p')}
            </span>
          </div>
        )}

        {/* Service specific info */}
        {post.type === "service" && post.price_range && (
          <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Service Available</span>
            </div>
            <span className="text-sm font-medium text-primary">{post.price_range}</span>
          </div>
        )}

        {/* Discussion specific info */}
        {post.type === "discussion" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Community discussion</span>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Contact Information - Only shown for user's own posts */}
        {post.contact_info && post.user_id === user?.id && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Contact Information</span>
            </div>
            <p className="text-sm text-amber-700">{post.contact_info}</p>
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ This contact information is only visible to you
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => toggleLike(post.id)}
            >
              <Heart className="h-4 w-4" />
              {post.likes_count || 0}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              {post.comments_count || 0}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share className="h-4 w-4" />
              Share
            </Button>
          </div>
          
          {post.type === "event" && (
            <Button size="sm">Interested</Button>
          )}
          {post.type === "service" && (
            <Button size="sm">Book Now</Button>
          )}
          {post.type === "discussion" && (
            <Button size="sm" variant="outline">Join</Button>
          )}
        </div>
      </CardContent>
    </Card>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
      <div className="container max-w-4xl mx-auto p-6">
        {/* Feed Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Your Local Feed</h1>
              <p className="text-muted-foreground">Discover what's happening in your community</p>
            </div>
            <div className="flex items-center gap-3">
              <DistanceFilter 
                currentDistance={distanceFilter}
                onDistanceChange={setDistanceFilter}
              />
              {posts.length === 0 && !loading && (
                <Button 
                  onClick={createSamplePosts} 
                  disabled={sampleLoading}
                  variant="outline"
                >
                  {sampleLoading ? "Creating..." : "Add Sample Data"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Local News Section */}
        {!loadingNews && localNews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Local News & Updates</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {localNews.slice(0, 3).map((news, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <Badge variant="secondary" className="w-fit mb-2">{news.category}</Badge>
                    <CardTitle className="text-base leading-tight">{news.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{news.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(news.publishedAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Feed Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-0">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No posts yet. Be the first to share!</p>
                  <Button asChild>
                    <Link to="/create">Create Your First Post</Link>
                  </Button>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="space-y-0">
              {posts.filter(post => post.type === "event").map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <div className="space-y-0">
              {posts.filter(post => post.type === "service").map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="mt-6">
            <div className="space-y-0">
              {posts.filter(post => post.type === "discussion").map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-0">
              {posts.filter(post => post.type === "post").map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
    </ProtectedRoute>
  );
};

export default Feed;