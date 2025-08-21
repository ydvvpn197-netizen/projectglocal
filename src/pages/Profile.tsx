import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
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
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Sample user data
const userProfile = {
  id: 1,
  name: "Sarah Chen",
  email: "sarah.chen@example.com",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
  bio: "Passionate community organizer and local artist. Love connecting people through art, music, and meaningful conversations. Always excited to discover new local gems and support our community!",
  location: "Downtown, City",
  joinedDate: "March 2023",
  website: "www.sarahchen.com",
  phone: "+1 (555) 123-4567",
  stats: {
    eventsAttended: 24,
    eventsCreated: 8,
    communitiesJoined: 12,
    postsCreated: 45,
    followers: 234,
    following: 189,
    points: 2847
  },
  badges: [
    { id: 1, name: "Community Leader", icon: Crown, color: "bg-yellow-500", description: "Created 5+ successful events" },
    { id: 2, name: "Verified Organizer", icon: Shield, color: "bg-blue-500", description: "Verified event organizer" },
    { id: 3, name: "Early Adopter", icon: Zap, color: "bg-purple-500", description: "Joined in the first month" },
    { id: 4, name: "Top Contributor", icon: Trophy, color: "bg-orange-500", description: "Top 10% contributor" },
    { id: 5, name: "Event Master", icon: Calendar, color: "bg-green-500", description: "Organized 10+ events" },
    { id: 6, name: "Social Butterfly", icon: Users, color: "bg-pink-500", description: "500+ connections" }
  ],
  recentPosts: [
    {
      id: 1,
      title: "Amazing local art exhibition this weekend!",
      content: "Don't miss the incredible contemporary art showcase at Downtown Gallery. Some truly inspiring pieces from local artists.",
      likes: 23,
      comments: 8,
      date: "2 days ago",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Community garden update",
      content: "Our community garden is thriving! The tomatoes are almost ready to harvest. Thanks to everyone who helped with the planting.",
      likes: 15,
      comments: 12,
      date: "1 week ago",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop"
    }
  ],
  upcomingBookings: [
    {
      id: 1,
      eventTitle: "Local Music Festival 2024",
      eventImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=150&fit=crop",
      date: "Dec 15, 2024",
      time: "12:00 PM",
      location: "Central Park",
      status: "confirmed",
      tickets: 2
    },
    {
      id: 2,
      eventTitle: "Art Workshop",
      eventImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=150&fit=crop",
      date: "Dec 20, 2024",
      time: "2:00 PM",
      location: "Community Center",
      status: "pending",
      tickets: 1
    }
  ],
  communities: [
    {
      id: 1,
      name: "Local Artists Collective",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop",
      members: 234,
      role: "admin",
      joinedDate: "Jan 2024"
    },
    {
      id: 2,
      name: "Food Lovers United",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop",
      members: 456,
      role: "member",
      joinedDate: "Feb 2024"
    },
    {
      id: 3,
      name: "Tech Enthusiasts",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop",
      members: 189,
      role: "moderator",
      joinedDate: "Mar 2024"
    }
  ]
};

const Profile = () => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userProfile.name,
    bio: userProfile.bio,
    location: userProfile.location,
    website: userProfile.website,
    phone: userProfile.phone
  });

  const handleSaveProfile = () => {
    // Handle profile update logic
    console.log("Saving profile:", editForm);
    setIsEditModalOpen(false);
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

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <Card className="relative overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="relative -mt-16">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    {userProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute bottom-0 right-0 rounded-full">
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{userProfile.name}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {userProfile.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {userProfile.joinedDate}
                      </span>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">{userProfile.bio}</p>
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
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                value={editForm.location}
                                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={editForm.bio}
                              onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                              rows={4}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="website">Website</Label>
                              <Input
                                id="website"
                                value={editForm.website}
                                onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSaveProfile}>
                              Save Changes
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{userProfile.stats.eventsAttended}</div>
              <div className="text-sm text-muted-foreground">Events Attended</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{userProfile.stats.eventsCreated}</div>
              <div className="text-sm text-muted-foreground">Events Created</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{userProfile.stats.communitiesJoined}</div>
              <div className="text-sm text-muted-foreground">Communities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{userProfile.stats.points}</div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Posts
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

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Posts</h2>
              <Button className="btn-community">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
            
            <div className="space-y-4">
              {userProfile.recentPosts.map((post) => (
                <Card key={post.id} className="discussion-card">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {post.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {post.comments}
                            </span>
                            <span>{post.date}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Upcoming Bookings</h2>
              <Button className="btn-event" asChild>
                <a href="/events">Browse Events</a>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProfile.upcomingBookings.map((booking) => (
                <Card key={booking.id} className="event-card">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img 
                        src={booking.eventImage} 
                        alt={booking.eventTitle}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
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
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Communities</h2>
              <Button className="btn-community" asChild>
                <a href="/community">Discover Communities</a>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProfile.communities.map((community) => (
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
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Achievement Badges</h2>
              <span className="text-sm text-muted-foreground">
                {userProfile.badges.length} badges earned
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProfile.badges.map((badge) => (
                <Card key={badge.id} className="trending-card">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${badge.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <badge.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {badge.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;