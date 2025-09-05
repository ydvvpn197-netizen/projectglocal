import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { UserPointsDisplay } from "@/components/UserPointsDisplay";
import { MessagesTabContent } from "@/components/MessagesTabContent";

const Profile = () => {
  const navigate = useNavigate();
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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    location_city: '',
    location_state: '',
    location_country: ''
  });

  // Update edit form when profile data changes
  useEffect(() => {
    if (profile) {
      setEditForm({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location_city: profile.location_city || '',
        location_state: profile.location_state || '',
        location_country: profile.location_country || ''
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    const result = await updateProfile(editForm);
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
  const location = profile ? [profile.location_city, profile.location_state, profile.location_country]
    .filter(Boolean)
    .join(', ') || 'Location not set' : 'Location not set';

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
        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Badges
            </TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default Profile;
