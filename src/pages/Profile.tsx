import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Edit, 
  Settings, 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Trophy,
  Award,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Camera,
  Mail,
  Phone,
  Globe,
  Plus,
  BookOpen,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  Flame,
  Crown,
  Shield,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { UserPointsDisplay } from "@/components/UserPointsDisplay";
import { MessagesTabContent } from "@/components/MessagesTabContent";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { SubscriptionManager } from "@/components/subscription/SubscriptionManager";
import { useProPermissions } from "@/hooks/useProPermissions";
import { subscriptionService, UserSubscription } from "@/services/subscriptionService";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    profile,
    stats,
    posts,
    bookings,
    communities,
    badges,
    loading,
    updating,
    updateProfile,
    uploadAvatar,
    refreshAll
  } = useUserProfile();

  const { isPro, loading: proLoading } = useProPermissions();

  // Subscription state
  const [subscriptionHistory, setSubscriptionHistory] = useState<UserSubscription[]>([]);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState("overview");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    location_city: '',
    location_state: '',
    location_country: '',
    website_url: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    artist_skills: [] as string[],
    hourly_rate_min: '',
    hourly_rate_max: '',
    portfolio_urls: [] as string[],
    real_time_location_enabled: false
  });

  // Update edit form when profile data changes
  useEffect(() => {
    if (profile) {
      setEditForm({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location_city: profile.location_city || '',
        location_state: profile.location_state || '',
        location_country: profile.location_country || '',
        website_url: profile.website_url || '',
        phone_number: profile.phone_number || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        artist_skills: profile.artist_skills || [],
        hourly_rate_min: profile.hourly_rate_min?.toString() || '',
        hourly_rate_max: profile.hourly_rate_max?.toString() || '',
        portfolio_urls: profile.portfolio_urls || [],
        real_time_location_enabled: profile.real_time_location_enabled || false
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    // Convert form data to proper types
    const updateData = {
      ...editForm,
      hourly_rate_min: editForm.hourly_rate_min ? parseInt(editForm.hourly_rate_min) : undefined,
      hourly_rate_max: editForm.hourly_rate_max ? parseInt(editForm.hourly_rate_max) : undefined,
    };

    const result = await updateProfile(updateData);
    if (result.success) {
      setIsEditModalOpen(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    await uploadAvatar(file);
  };

  const handleCreatePost = () => {
    navigate('/create');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-blue-100 text-blue-800";
      case "member":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBadgeIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      'Crown': Crown,
      'Shield': Shield,
      'Zap': Zap,
      'Trophy': Trophy,
      'Calendar': Calendar,
      'Users': Users,
      'Star': Star,
      'Flame': Flame,
      'TrendingUp': TrendingUp
    };
    return iconMap[iconName] || Star;
  };

  const formatJoinedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch {
      return 'Unknown';
    }
  };

  // Subscription functions
  const loadSubscriptionHistory = useCallback(async () => {
    if (!user?.id) return;

    try {
      setSubscriptionLoading(true);
      const history = await subscriptionService.getUserSubscriptionHistory(user.id);
      setSubscriptionHistory(history);
    } catch (error) {
      console.error('Error loading subscription history:', error);
      toast.error('Failed to load subscription history');
    } finally {
      setSubscriptionLoading(false);
    }
  }, [user?.id, toast]);

  const handleCancelSubscription = async () => {
    if (!user?.id) return;

    try {
      const result = await subscriptionService.cancelSubscription(user.id);
      if (result.success) {
        toast.success('Subscription canceled successfully');
        // Refresh the page to update status
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSubscriptionStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Load subscription history when component mounts
  useEffect(() => {
    if (user?.id) {
      loadSubscriptionHistory();
    }
  }, [user?.id, loadSubscriptionHistory]);

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!profile) {
    return (
      <ResponsiveLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-muted-foreground mb-6">
            Unable to load profile data. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </ResponsiveLayout>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const location = profile ? ([profile.location_city, profile.location_state, profile.location_country]
    .filter(Boolean)
    .join(', ') || 'Location not set') : 'Location not set';

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <Card className="relative overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="relative -mt-16">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={updating}
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {formatJoinedDate(profile?.created_at || '')}
                      </span>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">
                      {profile?.bio || 'No bio available'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Profile
                    </Button>
                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                          <DialogDescription>
                            Update your profile information and settings
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="display_name">Display Name</Label>
                            <Input
                              id="display_name"
                              value={editForm.display_name}
                              onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                              placeholder="Enter your display name"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={editForm.bio}
                              onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                              rows={4}
                              placeholder="Tell us about yourself..."
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="location_city">City</Label>
                              <Input
                                id="location_city"
                                value={editForm.location_city}
                                onChange={(e) => setEditForm({...editForm, location_city: e.target.value})}
                                placeholder="City"
                              />
                            </div>
                            <div>
                              <Label htmlFor="location_state">State</Label>
                              <Input
                                id="location_state"
                                value={editForm.location_state}
                                onChange={(e) => setEditForm({...editForm, location_state: e.target.value})}
                                placeholder="State"
                              />
                            </div>
                            <div>
                              <Label htmlFor="location_country">Country</Label>
                              <Input
                                id="location_country"
                                value={editForm.location_country}
                                onChange={(e) => setEditForm({...editForm, location_country: e.target.value})}
                                placeholder="Country"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSaveProfile} disabled={updating}>
                              {updating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.eventsCreated}</div>
                <div className="text-sm text-muted-foreground">Events Created</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.postsCreated}</div>
                <div className="text-sm text-muted-foreground">Posts Created</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.communitiesJoined}</div>
                <div className="text-sm text-muted-foreground">Communities</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <UserPointsDisplay compact={true} showDetails={false} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="communities" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Communities
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest interactions and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {posts.slice(0, 3).map((post) => (
                      <div key={post.id} className="flex gap-3 p-3 rounded-lg border">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{post.title}</h4>
                          <p className="text-xs text-muted-foreground">{post.createdAt}</p>
                        </div>
                      </div>
                    ))}
                    {posts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No recent activity</p>
                        <Button size="sm" className="mt-2" onClick={handleCreatePost}>
                          Create Your First Post
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" onClick={handleCreatePost}>
                      <Plus className="w-5 h-5" />
                      <span className="text-sm">Create Post</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" asChild>
                      <a href="/events">
                        <Calendar className="w-5 h-5" />
                        <span className="text-sm">Browse Events</span>
                      </a>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" asChild>
                      <a href="/community">
                        <Users className="w-5 h-5" />
                        <span className="text-sm">Join Community</span>
                      </a>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" asChild>
                      <a href="/settings">
                        <Settings className="w-5 h-5" />
                        <span className="text-sm">Settings</span>
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
                <CardDescription>
                  A complete overview of your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Display Name</Label>
                      <p className="text-sm text-muted-foreground">{profile?.display_name || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <p className="text-sm text-muted-foreground">{location}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Bio</Label>
                      <p className="text-sm text-muted-foreground">{profile?.bio || 'No bio added yet'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Member Since</Label>
                      <p className="text-sm text-muted-foreground">{formatJoinedDate(profile?.created_at || '')}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Account Status</Label>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            {user && <MessagesTabContent userId={user.id} />}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Upcoming Bookings</h2>
              <Button className="btn-event" asChild>
                <a href="/events">Browse Events</a>
              </Button>
            </div>
            
            {bookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="event-card">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {booking.eventImage && (
                          <img 
                            src={booking.eventImage} 
                            alt={booking.eventTitle}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{booking.eventTitle}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {booking.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {booking.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {booking.location}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">{booking.status}</span>
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {booking.tickets} ticket{booking.tickets > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start exploring events and make your first booking!
                  </p>
                  <Button asChild>
                    <a href="/events">Browse Events</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Communities</h2>
              <Button className="btn-community" asChild>
                <a href="/community">Discover Communities</a>
              </Button>
            </div>
            
            {communities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communities.map((community) => (
                  <Card key={community.id} className="community-card">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <img 
                          src={community.image} 
                          alt={community.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{community.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getRoleColor(community.role)}>
                              {community.role}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {community.members} members
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Joined {community.joinedDate}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Communities Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Join communities to connect with like-minded people!
                  </p>
                  <Button asChild>
                    <a href="/community">Discover Communities</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Subscription Management</h2>
            </div>
            
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="plans">Plans</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Current Status */}
                  <SubscriptionStatus showUpgradeButton={false} />
                  
                  {/* Pro Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Pro Features
                      </CardTitle>
                      <CardDescription>
                        Features available with Pro subscription
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isPro ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm">Comment on news articles</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isPro ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm">Priority customer support</span>
                        </div>
                        {user?.user_metadata?.user_type === 'artist' && (
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isPro ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-sm">Featured listing in search results</span>
                          </div>
                        )}
                      </div>
                      
                      {!isPro && (
                        <div className="pt-4 border-t">
                          <Button 
                            onClick={() => navigate('/subscription/plans')}
                            className="w-full"
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade to Pro
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Current Subscription Details */}
                {isPro && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Current Subscription
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Pro Subscription Active</p>
                          <p className="text-sm text-gray-600">
                            Enjoying all Pro features
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleCancelSubscription}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Subscription
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Plans Tab */}
              <TabsContent value="plans">
                <SubscriptionManager userType={user?.user_metadata?.user_type || 'user'} />
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Subscription History
                    </CardTitle>
                    <CardDescription>
                      Your subscription history and billing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subscriptionLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading subscription history...</p>
                      </div>
                    ) : subscriptionHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No subscription history found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {subscriptionHistory.map((subscription) => (
                          <div
                            key={subscription.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              {getSubscriptionStatusIcon(subscription.status)}
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">
                                    {subscription.plan?.name || 'Unknown Plan'}
                                  </span>
                                  <Badge className={getSubscriptionStatusColor(subscription.status)}>
                                    {subscription.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {subscription.plan?.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Created: {formatDate(subscription.created_at)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-medium">
                                {subscription.plan?.price_in_cents 
                                  ? `₹${(subscription.plan.price_in_cents / 100).toFixed(0)}`
                                  : 'N/A'
                                }
                              </p>
                              <p className="text-sm text-gray-600">
                                {subscription.plan?.plan_type === 'monthly' ? 'Monthly' : 'Yearly'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Achievement Badges</h2>
              <span className="text-sm text-muted-foreground">
                {badges.length} badges earned
              </span>
            </div>
            
            {badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => {
                  const BadgeIcon = getBadgeIcon(badge.icon);
                  return (
                    <Card key={badge.id} className="trending-card">
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 ${badge.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                          <BadgeIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {badge.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Badges Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start engaging with the community to earn badges!
                  </p>
                  <Button onClick={handleCreatePost}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Post
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Input value={user?.email || ''} disabled />
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Two-Factor Authentication</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Add an extra layer of security</span>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Control your privacy and visibility
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Make your profile public</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Email</Label>
                      <p className="text-sm text-muted-foreground">Display email on profile</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <EyeOff className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Activity Status</Label>
                      <p className="text-sm text-muted-foreground">Show when you're online</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Manage your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified in real-time</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive promotional content</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                  <CardDescription>
                    Manage your data and account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download My Data
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>

                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Advanced configuration options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Theme Preference</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Light</Button>
                      <Button variant="outline" size="sm">Dark</Button>
                      <Button variant="outline" size="sm">System</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Button variant="outline" className="w-full justify-start">
                      English (US)
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <Button variant="outline" className="w-full justify-start">
                      UTC-8 (Pacific Time)
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Refresh Data</Label>
                    <Button variant="outline" className="w-full justify-start" onClick={refreshAll}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh All Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default Profile;
