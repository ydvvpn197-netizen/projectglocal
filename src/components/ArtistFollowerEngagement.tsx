import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Star, 
  Calendar,
  MapPin,
  Clock,
  Plus,
  Edit,
  Trash2,
  Send,
  Image,
  Video,
  Music,
  Camera,
  Palette,
  MoreHorizontal,
  Share2,
  Bookmark
} from 'lucide-react';

interface Follower {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  location_city?: string;
  followed_at: string;
  is_online: boolean;
  last_seen?: string;
}

interface ArtistPost {
  id: string;
  content: string;
  media_urls?: string[];
  media_type?: 'image' | 'video' | 'audio';
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  duration_hours?: number;
  is_available: boolean;
  created_at: string;
  bookings_count: number;
  rating: number;
  reviews_count: number;
}

interface ArtistFollowerEngagementProps {
  artistId: string;
  className?: string;
}

export const ArtistFollowerEngagement: React.FC<ArtistFollowerEngagementProps> = ({
  artistId,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [posts, setPosts] = useState<ArtistPost[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('followers');
  
  // Post creation state
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    media_urls: [] as string[],
    media_type: 'image' as 'image' | 'video' | 'audio'
  });

  // Service creation state
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: 0,
    currency: 'INR',
    category: '',
    duration_hours: 1
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadFollowers(),
          loadPosts(),
          loadServices()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (artistId) {
      loadData();
    }
  }, [artistId, loadFollowers, loadPosts, loadServices]);

  const loadFollowers = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('artist_followers')
        .select(`
          *,
          follower:profiles!artist_followers_follower_id_fkey(
            user_id,
            display_name,
            avatar_url,
            bio,
            location_city,
            is_online,
            last_seen
          )
        `)
        .eq('artist_id', artistId)
        .order('followed_at', { ascending: false });

      if (error) throw error;

      const followersData = data?.map(item => ({
        id: item.id,
        user_id: item.follower.user_id,
        display_name: item.follower.display_name,
        avatar_url: item.follower.avatar_url,
        bio: item.follower.bio,
        location_city: item.follower.location_city,
        followed_at: item.followed_at,
        is_online: item.follower.is_online,
        last_seen: item.follower.last_seen
      })) || [];

      setFollowers(followersData);
    } catch (error) {
      console.error('Error loading followers:', error);
    }
  }, [artistId]);

  const loadPosts = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('artist_posts')
        .select(`
          *,
          post_likes(user_id),
          post_comments(id),
          post_shares(user_id)
        `)
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsData = data?.map(post => ({
        id: post.id,
        content: post.content,
        media_urls: post.media_urls || [],
        media_type: post.media_type,
        created_at: post.created_at,
        likes_count: post.post_likes?.length || 0,
        comments_count: post.post_comments?.length || 0,
        shares_count: post.post_shares?.length || 0,
        is_liked: post.post_likes?.some((like: { user_id: string }) => like.user_id === user?.id) || false,
        is_bookmarked: false // TODO: Implement bookmarks
      })) || [];

      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }, [artistId, user?.id]);

  const loadServices = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('artist_services')
        .select(`
          *,
          service_bookings(id),
          service_reviews(rating)
        `)
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const servicesData = data?.map(service => {
        const reviews = service.service_reviews || [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / reviews.length
          : 0;

        return {
          id: service.id,
          title: service.title,
          description: service.description,
          price: service.price,
          currency: service.currency,
          category: service.category,
          duration_hours: service.duration_hours,
          is_available: service.is_available,
          created_at: service.created_at,
          bookings_count: service.service_bookings?.length || 0,
          rating: Math.round(avgRating * 10) / 10,
          reviews_count: reviews.length
        };
      }) || [];

      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }, [artistId]);

  const handleCreatePost = async () => {
    if (!user || !newPost.content.trim()) return;

    try {
      const { error } = await supabase
        .from('artist_posts')
        .insert({
          artist_id: artistId,
          content: newPost.content,
          media_urls: newPost.media_urls,
          media_type: newPost.media_type
        });

      if (error) throw error;

      toast({
        title: "Post Created",
        description: "Your post has been shared with your followers",
      });

      setNewPost({ content: '', media_urls: [], media_type: 'image' });
      setIsCreatingPost(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const handleCreateService = async () => {
    if (!user || !newService.title.trim() || !newService.description.trim()) return;

    try {
      const { error } = await supabase
        .from('artist_services')
        .insert({
          artist_id: artistId,
          ...newService
        });

      if (error) throw error;

      toast({
        title: "Service Created",
        description: "Your service has been added to your offerings",
      });

      setNewService({
        title: '',
        description: '',
        price: 0,
        currency: 'INR',
        category: '',
        duration_hours: 1
      });
      setIsCreatingService(false);
      loadServices();
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive",
      });
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
      }

      loadPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      default:
        return <Image className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'photography':
        return <Camera className="h-4 w-4" />;
      case 'music':
        return <Music className="h-4 w-4" />;
      case 'art':
        return <Palette className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Follower Engagement
        </CardTitle>
        <CardDescription>
          Connect with your followers and showcase your work
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Followers</h3>
              <Badge variant="outline">{followers.length} followers</Badge>
            </div>
            
            <div className="space-y-3">
              {followers.map((follower) => (
                <div key={follower.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={follower.avatar_url} />
                    <AvatarFallback>
                      {follower.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{follower.display_name}</p>
                      {follower.is_online && (
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    {follower.bio && (
                      <p className="text-sm text-muted-foreground truncate">{follower.bio}</p>
                    )}
                    {follower.location_city && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {follower.location_city}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(follower.followed_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {followers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No followers yet</p>
                  <p className="text-sm">Share your work to attract followers</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Posts</h3>
              <Button onClick={() => setIsCreatingPost(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>

            {isCreatingPost && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Create New Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Share something with your followers..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreatePost} size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreatingPost(false)} 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <p className="mb-3">{post.content}</p>
                    
                    {post.media_urls.length > 0 && (
                      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                        {getMediaIcon(post.media_type || 'image')}
                        <span>{post.media_urls.length} media file(s)</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikePost(post.id)}
                          className={post.is_liked ? 'text-red-500' : ''}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                          {post.likes_count}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments_count}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          {post.shares_count}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {posts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No posts yet</p>
                  <p className="text-sm">Create your first post to engage with followers</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Services</h3>
              <Button onClick={() => setIsCreatingService(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>

            {isCreatingService && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add New Service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Service Title</label>
                      <Input
                        placeholder="e.g., Portrait Photography"
                        value={newService.title}
                        onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Input
                        placeholder="e.g., Photography"
                        value={newService.category}
                        onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe your service..."
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Price (₹)</label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={newService.price}
                        onChange={(e) => setNewService({ ...newService, price: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Duration (hours)</label>
                      <Input
                        type="number"
                        placeholder="2"
                        value={newService.duration_hours}
                        onChange={(e) => setNewService({ ...newService, duration_hours: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateService} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreatingService(false)} 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(service.category)}
                        <h4 className="font-medium">{service.title}</h4>
                        <Badge variant="outline">{service.category}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{service.rating}</span>
                        <span className="text-xs text-muted-foreground">({service.reviews_count})</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">₹{service.price}</span>
                        <span>{service.duration_hours}h duration</span>
                        <span>{service.bookings_count} bookings</span>
                      </div>
                      <Badge variant={service.is_available ? "default" : "secondary"}>
                        {service.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {services.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No services yet</p>
                  <p className="text-sm">Add services to start earning from your skills</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ArtistFollowerEngagement;
