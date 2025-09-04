import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  MapPinOff,
  Clock,
  Heart,
  Share2,
  ExternalLink,
  Settings,
  Edit,
  Camera
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEvents, Event } from "@/hooks/useEvents";
import { useToast } from "@/hooks/use-toast";
import { EventCard } from "@/components/EventCard";
import { format } from "date-fns";
import { UserProfile } from "@/types/common";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { events, loading } = useEvents();
  const { toast } = useToast();
  
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (userId) {
      // In a real app, you would fetch user profile data from the database
      // For now, we'll create a mock profile
      const mockProfile = {
        id: userId,
        username: "eventorganizer",
        full_name: "Event Organizer",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
        bio: "Passionate event organizer with 5+ years of experience creating memorable community events. I love bringing people together through music, art, and cultural experiences.",
        location: "New York, NY",
        website: "www.eventorganizer.com",
        phone: "+1 (555) 123-4567",
        email: "organizer@eventorganizer.com",
        verified: true,
        followers_count: 1247,
        following_count: 89,
        events_count: 23,
        joined_date: "2022-03-15",
        interests: ["Music", "Art", "Community", "Technology", "Food"],
        social_links: {
          twitter: "@eventorganizer",
          instagram: "@eventorganizer",
          linkedin: "linkedin.com/in/eventorganizer"
        }
      };
      setProfileUser(mockProfile);
    }
  }, [userId]);

  useEffect(() => {
    if (events.length > 0 && userId) {
      // Filter events created by this user
      const userCreatedEvents = events.filter(event => event.user_id === userId);
      setUserEvents(userCreatedEvents);
    }
  }, [events, userId]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the user",
    });
    setMessage("");
    setIsChatModalOpen(false);
  };

  const handleConnect = () => {
    setIsConnected(true);
    toast({
      title: "Connection Request Sent",
      description: "Your connection request has been sent",
    });
    setIsConnectModalOpen(false);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing ? "You've unfollowed this user" : "You're now following this user",
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) {
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

  if (!profileUser) {
    return (
      <ResponsiveLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/events')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
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
          <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-4"></div>
          
          {/* Profile Info */}
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="relative -mt-16 ml-6">
              <Avatar className="w-32 h-32 border-4 border-white">
                <AvatarImage src={profileUser.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {profileUser.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {profileUser.verified && (
                <div className="absolute -bottom-2 -right-2">
                  <Badge className="bg-blue-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex-1 px-6 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{profileUser.full_name}</h1>
                  <p className="text-muted-foreground mb-2">@{profileUser.username}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profileUser.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(profileUser.joined_date)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!isOwnProfile && (
                    <>
                      <Button 
                        variant={isFollowing ? "default" : "outline"}
                        onClick={handleFollow}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                      
                      <Button 
                        variant={isConnected ? "default" : "outline"}
                        onClick={() => setIsConnectModalOpen(true)}
                        disabled={isConnected}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        {isConnected ? "Connected" : "Connect"}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => setIsChatModalOpen(true)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                  
                  {isOwnProfile && (
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{profileUser.events_count}</div>
              <div className="text-sm text-muted-foreground">Events Created</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{profileUser.followers_count}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{profileUser.following_count}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {profileUser.bio}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileUser.interests.map((interest: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(profileUser.social_links).map(([platform, link]) => (
                    <div key={platform} className="flex items-center gap-3">
                      <span className="font-medium capitalize w-20">{platform}:</span>
                      <a 
                        href={`https://${link}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {link}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Events Created</h3>
              <span className="text-muted-foreground">{userEvents.length} events</span>
            </div>
            
            {userEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onAttend={() => {}} // Will be handled by the EventCard component
                    onBook={() => {}} // Will be handled by the EventCard component
                    onLike={() => {}} // Will be handled by the EventCard component
                    onChat={() => {}} // Will be handled by the EventCard component
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
                  <p className="text-muted-foreground">
                    This user hasn't created any events yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href={`mailto:${profileUser.email}`}
                      className="text-primary hover:underline"
                    >
                      {profileUser.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a 
                      href={`tel:${profileUser.phone}`}
                      className="text-primary hover:underline"
                    >
                      {profileUser.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Website</p>
                    <a 
                      href={`https://${profileUser.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {profileUser.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isOwnProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Send Message</CardTitle>
                  <CardDescription>
                    Send a direct message to {profileUser.full_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => setIsChatModalOpen(true)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Chat Modal */}
        <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Message to {profileUser.full_name}</DialogTitle>
              <DialogDescription>
                Send a direct message to this user
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

        {/* Connect Modal */}
        <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Connect with {profileUser.full_name}</DialogTitle>
              <DialogDescription>
                Send a connection request to this user
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will send a connection request to {profileUser.full_name}. Once accepted, you'll be able to see their updates and message them directly.
              </p>
              
              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  onClick={handleConnect}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send Request
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsConnectModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ResponsiveLayout>
  );
};

export default UserProfile;
