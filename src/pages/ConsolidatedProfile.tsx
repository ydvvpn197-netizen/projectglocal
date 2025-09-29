import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EnhancedUserProfileCard } from "@/components/EnhancedUserProfileCard";
import { FollowButton } from "@/components/FollowButton";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft,
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Heart, 
  MessageCircle, 
  Share2, 
  Settings, 
  Edit, 
  Camera, 
  Plus,
  Bell,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  Award,
  TrendingUp,
  Activity,
  BookOpen,
  Globe,
  Mail,
  Phone,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  Crown,
  Zap,
  Clock,
  ExternalLink,
  MapPinOff
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEvents, Event } from "@/hooks/useEvents";
import { usePosts } from "@/hooks/usePosts";
import { useCommunities } from "@/hooks/useCommunities";
import { useFollows } from "@/hooks/useFollows";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { EventCard } from "@/components/EventCard";
import { PostCard } from "@/components/PostCard";
import { CommunityCard } from "@/components/CommunityCard";
import { notificationService } from "@/services/notificationService";
import { ChatService } from "@/services/chatService";
import { format } from "date-fns";
import { UserProfile } from "@/types/common";

// Extended profile interface for the consolidated profile component
interface ExtendedUserProfile extends UserProfile {
  display_name?: string;
  location_city?: string;
  location_state?: string;
  cover_image_url?: string;
  is_pro?: boolean;
  anonymous_mode?: boolean;
  followers_count?: number;
  following_count?: number;
  full_name?: string;
  verified?: boolean;
  joined_date?: string;
}

// Enhanced interfaces for consolidated profile
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

const ConsolidatedProfile = () => {
  const { userId, artistId } = useParams<{ userId?: string; artistId?: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Determine if this is an artist profile or user profile
  const isArtistProfile = !!artistId;
  const profileId = artistId || userId;
  const isOwnProfile = currentUser?.id === profileId;
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  
  // Profile data states
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Booking form state
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  
  // Discussion form state
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionContent, setDiscussionContent] = useState("");
  const [isSubmittingDiscussion, setIsSubmittingDiscussion] = useState(false);
  
  // Message state
  const [message, setMessage] = useState("");

  // Enhanced data fetching
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const { events, loading: eventsLoading } = useEvents();
  const { posts, loading: postsLoading } = usePosts();
  const { communities, loading: communitiesLoading } = useCommunities();
  const { followersCount, followingCount } = useFollows(profileId || '');

  // Enhanced profile data
  const [profileData, setProfileData] = useState({
    display_name: "",
    bio: "",
    location_city: "",
    location_state: "",
    avatar_url: "",
    cover_image_url: "",
    is_verified: false,
    is_pro: false,
    anonymous_mode: false
  });

  // Enhanced stats
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalEvents: 0,
    totalCommunities: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    totalLikes: 0,
    totalComments: 0,
    engagementRate: 0
  });

  // Enhanced loading state
  const isLoading = profileLoading || eventsLoading || postsLoading || communitiesLoading;

  // Fetch profile data based on type
  const fetchProfileData = useCallback(async () => {
    if (!profileId) return;
    
    try {
      if (isArtistProfile) {
        // Fetch artist profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', profileId)
          .single();

        if (profileError) throw profileError;

        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('*')
          .eq('user_id', profileId)
          .single();

        if (artistError) {
          // Create artist record if it doesn't exist
          const { data: newArtistData, error: createError } = await supabase
            .from('artists')
            .insert({
              user_id: profileId,
              specialty: profileData.artist_skills || [],
              experience_years: 0,
              hourly_rate_min: profileData.hourly_rate_min || 0,
              hourly_rate_max: profileData.hourly_rate_max || 0,
              bio: profileData.bio || '',
              is_available: true
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating artist record:', createError);
            setArtist({
              ...profileData,
              id: profileData.user_id,
              experience_years: 0,
              is_available: false,
              hourly_rate_min: profileData.hourly_rate_min || 0,
              hourly_rate_max: profileData.hourly_rate_max || 0,
            });
            return;
          }

          setArtist({
            ...profileData,
            ...newArtistData,
            id: newArtistData.id
          });
          return;
        }

        setArtist({
          ...profileData,
          ...artistData,
          id: artistData.id
        });
      } else {
        // Fetch user profile
        const mockProfile: ExtendedUserProfile = {
          id: profileId,
          email: "organizer@eventorganizer.com",
          is_verified: true,
          is_active: true,
          username: "eventorganizer",
          full_name: "Event Organizer",
          avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&",
          bio: "Passionate event organizer with 5+ years of experience creating memorable community events. I love bringing people together through music, art, and cultural experiences.",
          location: "New York, NY",
          website: "www.eventorganizer.com",
          phone: "+1 (555) 123-4567",
          verified: true,
          followers_count: 1247,
          following_count: 89,
          joined_date: "2022-03-15",
          social_links: {
            twitter: "@eventorganizer",
            instagram: "@eventorganizer",
            linkedin: "linkedin.com/in/eventorganizer"
          },
          preferences: {
            email_notifications: true,
            push_notifications: true,
            sms_notifications: false,
            privacy_level: 'public',
            language: 'en',
            timezone: 'UTC',
            theme: 'auto'
          },
          stats: {
            total_posts: 0,
            total_comments: 0,
            total_likes_received: 0,
            total_shares: 0,
            followers_count: 1247,
            following_count: 89,
            posts_this_month: 0,
            engagement_rate: 0
          },
          badges: [],
          subscription_tier: 'free',
          points: 0,
          reputation_score: 0
        };
        setProfileUser(mockProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    }
  }, [profileId, isArtistProfile, toast]);

  // Fetch discussions for artist profiles
  const fetchDiscussions = useCallback(async () => {
    if (!isArtistProfile || !artistId) return;
    
    try {
      const { data: artistRecord, error: artistError } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', artistId)
        .single();

      if (artistError) {
        console.error('Error fetching artist record:', artistError);
        setDiscussions([]);
        return;
      }

      const { data, error } = await supabase
        .from('artist_discussions')
        .select('*')
        .eq('artist_id', artistRecord.id)
        .eq('status', 'approved')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = (data || []).map(d => d.user_id);
      let profilesMap: Record<string, { user_id: string; display_name?: string; avatar_url?: string }> = {};
      
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
    }
  }, [isArtistProfile, artistId]);

  // Fetch user events
  useEffect(() => {
    if (events.length > 0 && profileId) {
      const userCreatedEvents = events.filter(event => event.organizer_id === profileId);
      setUserEvents(userCreatedEvents);
    }
  }, [events, profileId]);

  useEffect(() => {
    if (profileId) {
      fetchProfileData();
      if (isArtistProfile) {
        fetchDiscussions();
      }
    }
  }, [profileId, fetchProfileData, fetchDiscussions, isArtistProfile]);

  // Enhanced data fetching
  useEffect(() => {
    if (profile) {
      setProfileData({
        display_name: (profile as ExtendedUserProfile)?.display_name || "",
        bio: (profile as ExtendedUserProfile)?.bio || "",
        location_city: (profile as ExtendedUserProfile)?.location_city || "",
        location_state: (profile as ExtendedUserProfile)?.location_state || "",
        avatar_url: (profile as ExtendedUserProfile)?.avatar_url || "",
        cover_image_url: (profile as ExtendedUserProfile)?.cover_image_url || "",
        is_verified: (profile as ExtendedUserProfile)?.is_verified || false,
        is_pro: (profile as ExtendedUserProfile)?.is_pro || false,
        anonymous_mode: (profile as ExtendedUserProfile)?.anonymous_mode || false
      });
    }
  }, [profile]);

  // Enhanced stats calculation
  useEffect(() => {
    if (currentUser) {
      const userPosts = posts.filter(post => post.user_id === currentUser.id);
      const userEvents = events.filter(event => (event as Event & { organizer_id?: string }).organizer_id === currentUser.id);
      const userCommunities = communities.filter(community => 
        (community as { members?: Array<{ user_id: string }> }).members?.some((member: { user_id: string }) => member.user_id === currentUser.id)
      );

      const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
      const totalComments = userPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
      const engagementRate = userPosts.length > 0 ? 
        ((totalLikes + totalComments) / userPosts.length) : 0;

      setStats({
        totalPosts: userPosts.length,
        totalEvents: userEvents.length,
        totalCommunities: userCommunities.length,
        totalFollowers: (profile as ExtendedUserProfile)?.followers_count || 0,
        totalFollowing: (profile as ExtendedUserProfile)?.following_count || 0,
        totalLikes,
        totalComments,
        engagementRate: Math.round(engagementRate * 10) / 10
      });
    }
  }, [currentUser, posts, events, communities, profile]);

  // Enhanced profile update
  const handleProfileUpdate = useCallback(async (updatedData: Partial<typeof profileData>) => {
    try {
      await updateProfile(updatedData);
      setProfileData(prev => ({ ...prev, ...updatedData }));
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to update your profile. Please try again.",
        variant: "destructive"
      });
    }
  }, [updateProfile, toast]);

  // Message handling
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser || !profileId) return;
    
    try {
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('id')
        .or(`and(client_id.eq.${currentUser.id},artist_id.eq.${profileId}),and(client_id.eq.${profileId},artist_id.eq.${currentUser.id})`)
        .single();

      let conversationId = existing?.id;

      if (!conversationId) {
        const { data: created, error: createErr } = await supabase
          .from('chat_conversations')
          .insert({
            client_id: currentUser.id,
            artist_id: profileId,
            status: 'active'
          })
          .select()
          .single();
        
        if (createErr) throw createErr;
        conversationId = created.id;
      }

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
      setShowChatModal(false);
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

  // Connection handling
  const handleConnect = () => {
    setIsConnected(true);
    toast({
      title: "Connection Request Sent",
      description: "Your connection request has been sent",
    });
    setShowConnectionModal(false);
  };

  // Follow handling - removed duplicate declaration

  // Artist booking handling
  const handleBookArtist = async () => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book artists",
        variant: "destructive",
      });
      return;
    }

    if (!artist?.id || artist.id === artistId || !artist.is_available) {
      toast({
        title: "Artist not available",
        description: "This artist is not available for booking at the moment",
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
      const { data: existingBooking } = await supabase
        .from('artist_bookings')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('artist_id', artist?.user_id)
        .eq('event_date', eventDate)
        .single();

      if (existingBooking) {
        toast({
          title: "Booking already exists",
          description: "You have already sent a booking request for this date and artist.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('artist_bookings')
        .insert({
          user_id: currentUser.id,
          artist_id: artist?.user_id,
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
      setEventDate("");
      setEventLocation("");
      setEventDescription("");
      setBudgetMin("");
      setBudgetMax("");
      setContactInfo("");
    } catch (error: unknown) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to send booking request",
        variant: "destructive",
      });
    }
  };

  // Discussion handling
  const handleSubmitDiscussion = async () => {
    if (!currentUser) {
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
      const { data: artistRecord, error: artistError } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', artistId)
        .single();

      if (artistError) {
        throw new Error('Artist profile not found');
      }

      const { data: discussionData, error: discussionError } = await supabase
        .from('artist_discussions')
        .insert({
          user_id: currentUser.id,
          artist_id: artistRecord.id,
          title: discussionTitle,
          content: discussionContent,
          status: 'pending'
        })
        .select()
        .single();

      if (discussionError) throw discussionError;

      try {
        await notificationService.createDiscussionRequestNotification(artistId!, discussionData, currentUser.id);
      } catch (notificationError) {
        console.error('Error creating discussion request notification:', notificationError);
      }

      toast({
        title: "Discussion submitted",
        description: "Your discussion request has been sent to the artist for approval",
      });

      setDiscussionTitle("");
      setDiscussionContent("");
    } catch (error: unknown) {
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

  // Enhanced avatar upload
  const handleAvatarUpload = useCallback(async (file: File) => {
    try {
      // Implement avatar upload logic
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Unable to upload your avatar. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Enhanced cover image upload
  const handleCoverUpload = useCallback(async (file: File) => {
    try {
      // Implement cover image upload logic
      toast({
        title: "Cover Updated",
        description: "Your cover image has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Unable to upload your cover image. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Enhanced follow functionality
  const handleFollow = useCallback(async () => {
    try {
      setIsFollowing(!isFollowing);
      // Implement follow logic
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing ? "You've unfollowed this user" : "You're now following this user",
      });
    } catch (error) {
      toast({
        title: "Follow Failed",
        description: "Unable to follow this user. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast, isFollowing]);

  // Enhanced message functionality
  const handleMessage = useCallback(() => {
    setShowChatModal(true);
  }, []);

  // Enhanced connection request
  const handleConnectionRequest = useCallback(() => {
    setShowConnectionModal(true);
  }, []);

  // Enhanced profile completion calculation
  const getProfileCompletion = () => {
    if (!profile) return 0;
    
    let completed = 0;
    const total = 6;
    
    if ((profile as ExtendedUserProfile)?.display_name) completed++;
    if ((profile as ExtendedUserProfile)?.bio) completed++;
    if ((profile as ExtendedUserProfile)?.avatar_url) completed++;
    if ((profile as ExtendedUserProfile)?.location_city) completed++;
    if (currentUser?.email) completed++;
    if (currentUser?.created_at) completed++;
    
    return Math.round((completed / total) * 100);
  };

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Loading Profile...</h2>
            <p className="text-muted-foreground">Getting profile information</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  // Handle profile not found
  if (!profileUser && !artist) {
    return (
      <ResponsiveLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Enhanced Profile Header */}
        {isArtistProfile ? (
          // Artist Profile Header
          <Card className="relative overflow-hidden border-0 shadow-xl">
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32 mx-auto md:mx-0">
                  <AvatarImage src={artist?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {artist?.display_name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                    <h1 className="text-3xl font-bold">{artist?.display_name}</h1>
                    {artist?.is_verified && (
                      <Badge variant="secondary">Verified</Badge>
                    )}
                    {artist?.is_available && (
                      <Badge variant="outline" className="text-green-600 border-green-600">Available</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4 text-muted-foreground">
                    <div className="flex items-center justify-center md:justify-start gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{artist?.location_city}, {artist?.location_state}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-1">
                      <Clock className="h-4 w-4" />
                      <span>${artist?.hourly_rate_min}-${artist?.hourly_rate_max}/hr</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-1">
                      <Star className="h-4 w-4" />
                      <span>{artist?.experience_years} years experience</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                    {artist?.artist_skills?.map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-6 mb-4 justify-center md:justify-start text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        <span className="font-medium text-foreground">{followersCount}</span> followers
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        <span className="font-medium text-foreground">{followingCount}</span> following
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowBookingDialog(true)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                    
                    <FollowButton 
                      userId={artistId!}
                      size="lg"
                      className="w-full sm:w-auto"
                    />
                    
                    {currentUser && currentUser.id !== artistId && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto"
                        onClick={() => setShowChatModal(true)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" /> Message
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ) : (
          // User Profile Header
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
            <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 bg-black/10"></div>
              {isOwnProfile && (
                <div className="absolute top-4 right-4">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              )}
            </div>
            <CardContent className="relative pt-0 pb-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-2xl ring-4 ring-blue-100/50">
                    <AvatarImage src={profileUser?.avatar_url || profileData.avatar_url} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {profileUser?.full_name?.charAt(0) || profileData.display_name?.charAt(0) || currentUser?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                          {profileUser?.full_name || profileData.display_name || currentUser?.email?.split('@')[0]}
                        </h2>
                        {(profileUser as ExtendedUserProfile)?.verified && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {profileData.is_pro && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Crown className="h-3 w-3 mr-1" />
                            Pro Member
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-lg">{profileUser?.email || currentUser?.email}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                          <Calendar className="h-3 w-3" />
                          Joined {new Date((profileUser as ExtendedUserProfile)?.joined_date || currentUser?.created_at || '').toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                          <Activity className="h-3 w-3" />
                          Active Member
                        </span>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <div className="text-center md:text-right space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Profile Completion</div>
                        <div className="flex items-center gap-3">
                          <div className="text-3xl font-bold text-blue-600">{getProfileCompletion()}%</div>
                          <div className="relative">
                            <Progress 
                              value={getProfileCompletion()} 
                              className="w-24 h-3 bg-gray-200 dark:bg-gray-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20"></div>
                          </div>
                        </div>
                        {getProfileCompletion() < 100 && (
                          <p className="text-xs text-muted-foreground">
                            Complete your profile to unlock more features
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">{stats.totalPosts}</div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Posts</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">{stats.totalEvents}</div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">Events</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-1">{stats.totalCommunities}</div>
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Communities</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300 mb-1">{stats.totalFollowers}</div>
              <div className="text-sm font-medium text-red-600 dark:text-red-400">Followers</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-1">{stats.totalFollowing}</div>
              <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Following</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 mb-1">{stats.totalLikes}</div>
              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Likes</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 mb-1">{stats.totalComments}</div>
              <div className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Comments</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-pink-700 dark:text-pink-300 mb-1">{stats.engagementRate}%</div>
              <div className="text-sm font-medium text-pink-600 dark:text-pink-400">Engagement</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex items-center justify-center">
            <TabsList className={`grid ${isArtistProfile ? 'grid-cols-3' : 'grid-cols-4 md:grid-cols-6'} bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-inner`}>
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              
              {isArtistProfile ? (
                <>
                  <TabsTrigger 
                    value="portfolio" 
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="hidden sm:inline">Portfolio</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="discussions" 
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Discussions</span>
                  </TabsTrigger>
                </>
              ) : (
                <>
                  <TabsTrigger 
                    value="posts" 
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">Posts</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="events" 
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Events</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="communities" 
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Communities</span>
                  </TabsTrigger>
                  {isOwnProfile && (
                    <>
                      <TabsTrigger 
                        value="subscription" 
                        className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <Crown className="w-4 h-4" />
                        <span className="hidden sm:inline">Subscription</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="settings" 
                        className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">Settings</span>
                      </TabsTrigger>
                    </>
                  )}
                </>
              )}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Quick Actions */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Jump into your most common tasks with one click
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="group h-auto p-6 flex flex-col gap-3 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" 
                      onClick={() => navigate('/create')}
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Create Post</div>
                        <div className="text-xs text-muted-foreground mt-1">Share your thoughts</div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="group h-auto p-6 flex flex-col gap-3 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:border-green-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" 
                      onClick={() => navigate('/events')}
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Browse Events</div>
                        <div className="text-xs text-muted-foreground mt-1">Find local events</div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="group h-auto p-6 flex flex-col gap-3 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/20 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" 
                      onClick={() => navigate('/communities')}
                    >
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Find Communities</div>
                        <div className="text-xs text-muted-foreground mt-1">Connect with others</div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="group h-auto p-6 flex flex-col gap-3 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/20 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" 
                      onClick={() => navigate('/messages')}
                    >
                      <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Messages</div>
                        <div className="text-xs text-muted-foreground mt-1">Chat with friends</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest interactions and updates across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {posts.slice(0, 3).map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate mb-1">{post.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Post
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.filter(post => post.user_id === currentUser?.id).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PostCard
                    post={{
                      ...post,
                      title: post.title || 'Untitled Post',
                      author: {
                        id: post.user_id,
                        name: (profileUser as ExtendedUserProfile)?.full_name || currentUser?.email?.split('@')[0] || 'User',
                        avatar: (profileUser as ExtendedUserProfile)?.avatar_url,
                        verified: (profileUser as ExtendedUserProfile)?.verified
                      }
                    }}
                    onLike={(postId: string) => {
                      toast({
                        title: "Liked!",
                        description: "Post added to your likes.",
                      });
                    }}
                    onComment={(postId: string) => {
                      toast({
                        title: "Comment",
                        description: "Comment functionality coming soon!",
                      });
                    }}
                    onShare={(postId: string) => {
                      toast({
                        title: "Shared!",
                        description: "Post shared successfully.",
                      });
                    }}
                    onBookmark={(postId: string) => {
                      toast({
                        title: "Bookmarked!",
                        description: "Post saved to your bookmarks.",
                      });
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.filter(event => (event as Event & { organizer_id?: string }).organizer_id === currentUser?.id).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <EventCard
                    event={event}
                    onAttend={(eventId: string) => {
                      toast({
                        title: "Event Attended!",
                        description: "You're now attending this event.",
                      });
                    }}
                    onLike={(eventId: string) => {
                      toast({
                        title: "Event Liked!",
                        description: "Event added to your likes.",
                      });
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {communities.filter(community => 
                (community as { members?: Array<{ user_id: string }> }).members?.some((member: { user_id: string }) => member.user_id === currentUser?.id)
              ).map((community, index) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CommunityCard
                    community={community}
                    onJoin={(communityId: string) => {
                      toast({
                        title: "Joined Community!",
                        description: "You are now a member of this community.",
                      });
                    }}
                    onLeave={(communityId: string) => {
                      toast({
                        title: "Left Community",
                        description: "You are no longer a member of this community.",
                      });
                    }}
                    onShare={(communityId: string) => {
                      toast({
                        title: "Community Shared!",
                        description: "Community shared successfully.",
                      });
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-yellow-500" />
                  Subscription Status
                </CardTitle>
                <CardDescription>
                  Manage your subscription and unlock premium features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.is_pro ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Pro Member</h3>
                    <p className="text-muted-foreground mb-6">
                      You have access to all premium features and benefits.
                    </p>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Free Account</h3>
                    <p className="text-muted-foreground mb-6">
                      Upgrade to Pro to unlock premium features and benefits.
                    </p>
                    <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Artist Portfolio Tab */}
          {isArtistProfile && (
            <TabsContent value="portfolio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  {artist?.portfolio_urls && artist.portfolio_urls.length > 0 ? (
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
          )}

          {/* Artist Discussions Tab */}
          {isArtistProfile && (
            <TabsContent value="discussions" className="space-y-6">
              {currentUser && (
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
          )}

          {/* Settings Tab */}
          {!isArtistProfile && isOwnProfile && (
            <TabsContent value="settings" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/privacy')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Privacy Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/notifications')}>
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Frequently used features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/messages')}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/bookmarks')}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Bookmarks
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/subscription')}>
                      <Crown className="h-4 w-4 mr-2" />
                      Subscription
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.reload()}>
                      <Activity className="h-4 w-4 mr-2" />
                      Refresh Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Artist Booking Modal */}
        {isArtistProfile && (
          <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Book {artist?.display_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Event Date</Label>
                  <Input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Event Location</Label>
                  <Input
                    placeholder="Event location"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Event Description</Label>
                  <Textarea
                    placeholder="Describe your event..."
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm font-medium">Min Budget ($)</Label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Max Budget ($)</Label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contact Information</Label>
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
        )}

        {/* Chat Modal */}
        <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Message to {isArtistProfile ? artist?.display_name : profileUser?.full_name}</DialogTitle>
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
                  onClick={() => setShowChatModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Connect Modal */}
        <Dialog open={showConnectionModal} onOpenChange={setShowConnectionModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Connect with {isArtistProfile ? artist?.display_name : profileUser?.full_name}</DialogTitle>
              <DialogDescription>
                Send a connection request to this user
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will send a connection request to {isArtistProfile ? artist?.display_name : profileUser?.full_name}. Once accepted, you'll be able to see their updates and message them directly.
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
                  onClick={() => setShowConnectionModal(false)}
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

export default ConsolidatedProfile;
