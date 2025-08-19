import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FollowButton } from "@/components/FollowButton";
import { Star, MapPin, Clock, MessageCircle, Heart, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ArtistProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  artist_skills: string[];
  hourly_rate_min: number;
  hourly_rate_max: number;
  portfolio_urls: string[];
  location_city: string;
  location_state: string;
  is_verified: boolean;
  experience_years: number;
  is_available: boolean;
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  user_id: string;
  status: string;
  is_pinned: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  user_display_name?: string;
  user_avatar_url?: string;
}

const ArtistProfile = () => {
  const { artistId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  
  // Discussion form state
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionContent, setDiscussionContent] = useState("");
  const [isSubmittingDiscussion, setIsSubmittingDiscussion] = useState(false);
  
  // Booking form state
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  useEffect(() => {
    if (artistId) {
      fetchArtistProfile();
      fetchDiscussions();
    }
  }, [artistId, user]);

  const fetchArtistProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', artistId)
        .single();

      if (profileError) throw profileError;

      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .select('*')
        .eq('user_id', artistId)
        .single();

      if (artistError) throw artistError;

      setArtist({
        ...profileData,
        ...artistData,
        id: artistData.id
      });
    } catch (error) {
      console.error('Error fetching artist profile:', error);
      toast({
        title: "Error",
        description: "Failed to load artist profile",
        variant: "destructive",
      });
    }
  };

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('artist_discussions')
        .select('*')
        .eq('artist_id', artistId)
        .eq('status', 'approved')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = (data || []).map(d => d.user_id);
      let profilesMap: Record<string, any> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);

        profilesMap = Object.fromEntries(
          (profilesData || []).map(p => [p.user_id, p])
        );
      }

      const discussionsWithUserData = (data || []).map(discussion => ({
        ...discussion,
        user_display_name: profilesMap[discussion.user_id]?.display_name || 'Anonymous',
        user_avatar_url: profilesMap[discussion.user_id]?.avatar_url || ''
      }));

      setDiscussions(discussionsWithUserData);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDiscussion = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to post discussions",
        variant: "destructive",
      });
      return;
    }

    if (!discussionTitle.trim() || !discussionContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingDiscussion(true);

    try {
      // Create discussion request
      const { data: discussionData, error: discussionError } = await supabase
        .from('artist_discussions')
        .insert({
          user_id: user.id,
          artist_id: artistId,
          title: discussionTitle,
          content: discussionContent,
          status: 'pending'
        })
        .select()
        .single();

      if (discussionError) throw discussionError;

      // Create moderation notification for artist
      const { error: notificationError } = await supabase
        .from('artist_discussion_moderation_notifications')
        .insert({
          artist_id: artistId,
          discussion_id: discussionData.id,
          type: 'discussion_request'
        });

      if (notificationError) throw notificationError;

      toast({
        title: "Discussion submitted",
        description: "Your discussion request has been sent to the artist for approval",
      });

      setDiscussionTitle("");
      setDiscussionContent("");
    } catch (error) {
      console.error('Error submitting discussion:', error);
      toast({
        title: "Error",
        description: "Failed to submit discussion request",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingDiscussion(false);
    }
  };

  const handleBookArtist = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book artists",
        variant: "destructive",
      });
      return;
    }

    if (!eventDate || !eventLocation || !eventDescription || !budgetMin || !contactInfo) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('artist_bookings')
        .insert({
          user_id: user.id,
          artist_id: artist?.id,
          event_date: eventDate,
          event_location: eventLocation,
          event_description: eventDescription,
          budget_min: parseFloat(budgetMin),
          budget_max: budgetMax ? parseFloat(budgetMax) : null,
          contact_info: contactInfo,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Booking request sent",
        description: "Your booking request has been sent to the artist",
      });

      setShowBookingDialog(false);
      // Reset form
      setEventDate("");
      setEventLocation("");
      setEventDescription("");
      setBudgetMin("");
      setBudgetMax("");
      setContactInfo("");
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to send booking request",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!artist) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Artist not found</h2>
          <Button onClick={() => navigate('/book-artist')}>Browse Artists</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Artist Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-32 w-32 mx-auto md:mx-0">
                <AvatarImage src={artist.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {artist.display_name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                  <h1 className="text-3xl font-bold">{artist.display_name}</h1>
                  {artist.is_verified && (
                    <Badge variant="secondary">Verified</Badge>
                  )}
                  {artist.is_available && (
                    <Badge variant="outline" className="text-green-600 border-green-600">Available</Badge>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4 text-muted-foreground">
                  <div className="flex items-center justify-center md:justify-start gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{artist.location_city}, {artist.location_state}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1">
                    <Clock className="h-4 w-4" />
                    <span>${artist.hourly_rate_min}-${artist.hourly_rate_max}/hr</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1">
                    <Star className="h-4 w-4" />
                    <span>{artist.experience_years} years experience</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                  {artist.artist_skills?.map((skill) => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="w-full sm:w-auto">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Book {artist.display_name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Event Date</label>
                          <Input
                            type="datetime-local"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Event Location</label>
                          <Input
                            placeholder="Event location"
                            value={eventLocation}
                            onChange={(e) => setEventLocation(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Event Description</label>
                          <Textarea
                            placeholder="Describe your event..."
                            value={eventDescription}
                            onChange={(e) => setEventDescription(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-sm font-medium">Min Budget ($)</label>
                            <Input
                              type="number"
                              placeholder="500"
                              value={budgetMin}
                              onChange={(e) => setBudgetMin(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Max Budget ($)</label>
                            <Input
                              type="number"
                              placeholder="1000"
                              value={budgetMax}
                              onChange={(e) => setBudgetMax(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Contact Information</label>
                          <Textarea
                            placeholder="Your phone number, email, or other contact details"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleBookArtist} className="w-full">
                          Send Booking Request
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <FollowButton 
                    userId={artistId!}
                    size="lg"
                    className="w-full sm:w-auto"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{artist.bio || "No bio available."}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                {artist.portfolio_urls?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {artist.portfolio_urls.map((url, index) => (
                      <div key={index} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <img 
                          src={url} 
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No portfolio items available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussions" className="space-y-6">
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Start a Discussion</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your discussion will be sent to the artist for approval before being visible to others.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Discussion title"
                    value={discussionTitle}
                    onChange={(e) => setDiscussionTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="What would you like to discuss?"
                    value={discussionContent}
                    onChange={(e) => setDiscussionContent(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    onClick={handleSubmitDiscussion}
                    disabled={isSubmittingDiscussion}
                    className="w-full"
                  >
                    {isSubmittingDiscussion ? "Submitting..." : "Submit for Approval"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {discussions.length > 0 ? (
                discussions.map((discussion) => (
                  <Card key={discussion.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={discussion.user_avatar_url} />
                            <AvatarFallback>
                              {discussion.user_display_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{discussion.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              by {discussion.user_display_name} • {new Date(discussion.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {discussion.is_pinned && (
                          <Badge variant="secondary">Pinned</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{discussion.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{discussion.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{discussion.replies_count} replies</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No discussions yet. Be the first to start one!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ArtistProfile;
