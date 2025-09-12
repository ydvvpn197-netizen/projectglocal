import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  MessageCircle,
  UserPlus,
  UserCheck,
  Star,
  Phone,
  Mail,
  Globe,
  Clock,
  Heart,
  Share2,
  ExternalLink,
  Settings,
  Edit,
  Camera,
  Crown,
  Shield,
  Zap,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Bell,
  BellOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ProfileService, UserProfile, SubscriptionStatus } from '@/services/profileService';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';
import { PaymentButton } from '@/components/payments/PaymentButton';
import { format } from 'date-fns';

const EnhancedProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ is_pro: false });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId, loadProfile]);

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const [profileData, subscriptionData, followStatus] = await Promise.all([
        ProfileService.getUserProfile(userId),
        ProfileService.getSubscriptionStatus(userId),
        currentUser ? ProfileService.isFollowing(currentUser.id, userId) : Promise.resolve(false)
      ]);

      setProfile(profileData);
      setSubscriptionStatus(subscriptionData);
      setIsFollowing(followStatus);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentUser, toast]);

  const handleFollow = async () => {
    if (!currentUser || !userId) return;

    try {
      if (isFollowing) {
        await ProfileService.unfollowUser(currentUser.id, userId);
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: "You've unfollowed this user",
        });
      } else {
        await ProfileService.followUser(currentUser.id, userId);
        setIsFollowing(true);
        toast({
          title: "Following",
          description: "You're now following this user",
        });
      }
      // Reload profile to update follower count
      loadProfile();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser || !userId) return;
    
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('id')
        .or(`and(client_id.eq.${currentUser.id},artist_id.eq.${userId}),and(client_id.eq.${userId},artist_id.eq.${currentUser.id})`)
        .single();

      let conversationId = existing?.id;

      if (!conversationId) {
        // Create new conversation
        const { data: created, error: createErr } = await supabase
          .from('chat_conversations')
          .insert({
            client_id: currentUser.id,
            artist_id: userId,
            status: 'pending'
          })
          .select()
          .single();
        
        if (createErr) throw createErr;
        conversationId = created.id;
      }

      // Send the initial message
      const { error: messageErr } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          message: message.trim(),
          message_type: 'text'
        });

      if (messageErr) throw messageErr;

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      });
      
      setMessage("");
      setIsChatModalOpen(false);
      
      // Navigate to the chat
      navigate(`/chat/${conversationId}`);
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = () => {
    setIsUpgradeModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM yyyy');
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-muted rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!profile) {
    return (
      <ResponsiveLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/discover')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discover
          </Button>
        </div>
      </ResponsiveLayout>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-4 relative">
            {profile.cover_url && (
              <img 
                src={profile.cover_url} 
                alt="Cover" 
                className="w-full h-full object-cover rounded-lg"
              />
            )}
            {isOwnProfile && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4"
                onClick={() => {/* TODO: Implement cover upload */}}
              >
                <Camera className="w-4 h-4 mr-2" />
                Edit Cover
              </Button>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-24 h-24 -mt-12 border-4 border-background">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile.display_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">
                    {profile.display_name || profile.username || 'Anonymous User'}
                  </h1>
                  {profile.is_verified && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                  {profile.is_premium && (
                    <Badge variant="default" className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500">
                      <Crown className="w-3 h-3" />
                      Premium
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-2">
                  @{profile.username || 'anonymous'}
                </p>
                
                {profile.bio && (
                  <p className="text-sm text-muted-foreground max-w-md">
                    {profile.bio}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  {profile.location_city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location_city}, {profile.location_state}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDate(profile.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 md:ml-auto">
              {!isOwnProfile && (
                <>
                  <div className="flex gap-2">
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      onClick={handleFollow}
                      className="flex items-center gap-2"
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setIsChatModalOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.share?.({
                          title: `${profile.display_name}'s Profile`,
                          text: `Check out ${profile.display_name}'s profile on Glocal`,
                          url: window.location.href
                        });
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
              
              {isOwnProfile && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </Button>
                  
                  {!subscriptionStatus.is_pro && (
                    <Button
                      onClick={handleUpgrade}
                      className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Crown className="w-4 h-4" />
                      Upgrade
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{profile.followers_count}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{profile.following_count}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{profile.posts_count}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{profile.events_count}</div>
              <div className="text-sm text-muted-foreground">Events</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Display Name</Label>
                    <p className="text-sm">{profile.display_name || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                    <p className="text-sm">@{profile.username || 'anonymous'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                    <p className="text-sm">
                      {profile.location_city && profile.location_state 
                        ? `${profile.location_city}, ${profile.location_state}`
                        : 'Not set'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                    <p className="text-sm">{formatDate(profile.created_at)}</p>
                  </div>
                </div>
                
                {profile.bio && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                    <p className="text-sm mt-1">{profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Posts Coming Soon</h3>
                  <p>User posts will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Events Coming Soon</h3>
                  <p>User events will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            {isOwnProfile ? (
              <SubscriptionManager userType="user" />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Private Information</h3>
                    <p>Subscription details are private</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Chat Modal */}
        <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Message to {profile.display_name}</DialogTitle>
              <DialogDescription>
                Send a direct message to this user. They will need to accept your message request before you can start chatting.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsChatModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upgrade Modal */}
        <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Upgrade Your Account</DialogTitle>
              <DialogDescription>
                Choose a plan that fits your needs and unlock premium features
              </DialogDescription>
            </DialogHeader>
            
            <SubscriptionManager userType="user" />
          </DialogContent>
        </Dialog>
      </div>
    </ResponsiveLayout>
  );
};

export default EnhancedProfile;
