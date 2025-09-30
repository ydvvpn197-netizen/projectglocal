import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FollowButton } from "@/components/FollowButton";
import { ArtistSkillsForm, ArtistSkillsData } from "@/components/ArtistSkillsForm";
import { BookingRequestsPanel } from "@/components/BookingRequestsPanel";
import { AcceptedBookingsPanel } from "@/components/AcceptedBookingsPanel";
import { ActiveChatsPanel } from "@/components/ActiveChatsPanel";
import { EarningsPanel } from "@/components/EarningsPanel";
import { ArtistModerationPanel } from "@/components/ArtistModerationPanel";
import { 
  Star, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Heart, 
  Calendar as CalendarIcon, 
  Users,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Settings,
  CheckCircle,
  User,
  Eye,
  Activity,
  Trophy,
  Zap,
  ArrowLeft,
  Plus,
  Edit,
  Save,
  X,
  Bell,
  Shield,
  Target,
  Award,
  Crown,
  Sparkles,
  BarChart3,
  MessageSquare,
  CreditCard,
  Headphones,
  Palette,
  Camera,
  Mic,
  BookOpen,
  Music,
  Coffee,
  Car,
  Building,
  Leaf,
  Mountain,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Search,
  MoreHorizontal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFollows } from "@/hooks/useFollows";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/services/notificationService";
import { ChatService, ChatConversationDetails } from "@/services/chatService";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { sanitizeText, sanitizeEmail } from "@/lib/sanitize";

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

interface ArtistStats {
  totalBookings: number;
  pendingRequests: number;
  totalEarnings: number;
  averageRating: number;
  completedBookings: number;
  cancelledBookings: number;
  activeChats: number;
  totalReviews: number;
}

interface BookingRequest {
  id: string;
  user_id: string;
  artist_id: string;
  event_date: string;
  event_location: string;
  event_description: string;
  budget_min: number;
  budget_max?: number;
  contact_info: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  created_at: string;
  user_display_name?: string;
  user_avatar_url?: string;
}

const ConsolidatedArtist: React.FC = () => {
  const { artistId } = useParams<{ artistId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Determine the mode based on URL or props
  const isOnboarding = location.pathname.includes('/onboarding');
  const isDashboard = location.pathname.includes('/dashboard');
  const isProfile = !isOnboarding && !isDashboard;
  
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<ArtistSkillsData | null>(null);
  
  // Profile data states
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [stats, setStats] = useState<ArtistStats>({
    totalBookings: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    averageRating: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    activeChats: 0,
    totalReviews: 0
  });
  
  // Booking states
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [acceptedBookings, setAcceptedBookings] = useState<BookingRequest[]>([]);
  const [activeChats, setActiveChats] = useState<ChatConversationDetails[]>([]);
  
  // Form states
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionContent, setDiscussionContent] = useState("");
  const [isSubmittingDiscussion, setIsSubmittingDiscussion] = useState(false);
  const [message, setMessage] = useState("");

  // Get artist data from sign-up form if available
  useEffect(() => {
    if (location.state?.artistData) {
      setInitialData(location.state.artistData);
    }
  }, [location.state]);

  // Fetch discussions
  const fetchDiscussions = useCallback(async () => {
    if (!artistId) return;
    
    try {
      const { data: artistRecord, error: artistError } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', artistId)
        .single();

      if (artistError) throw artistError;

      const { data, error } = await supabase
        .from('artist_discussions')
        .select('*')
        .eq('artist_id', artistRecord.id)
        .eq('status', 'approved')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = (data || []).map((d: { user_id: string }) => d.user_id);
      let profilesMap: Record<string, { user_id: string; display_name?: string; avatar_url?: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);

        profilesMap = Object.fromEntries(
          (profilesData || []).map((p: { user_id: string; display_name?: string; avatar_url?: string }) => [p.user_id, p])
        );
      }

      const discussionsWithUserData = (data || []).map((discussion: { user_id: string; [key: string]: unknown }) => ({
        ...discussion,
        user_display_name: profilesMap[discussion.user_id]?.display_name || 'Anonymous',
        user_avatar_url: profilesMap[discussion.user_id]?.avatar_url || ''
      }));

      setDiscussions(discussionsWithUserData);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  }, [artistId]);

  // Fetch artist profile data
  const fetchArtistData = useCallback(async () => {
    if (!artistId || !isProfile) return;
    
    try {
      setLoading(true);
      
      // Fetch artist profile
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

      if (artistError) {
        // Create artist record if it doesn't exist
        const { data: newArtistData, error: createError } = await supabase
          .from('artists')
          .insert({
            user_id: artistId,
            specialty: (profileData as ArtistProfile).artist_skills || [],
            experience_years: 0,
            hourly_rate_min: (profileData as ArtistProfile).hourly_rate_min || 0,
            hourly_rate_max: (profileData as ArtistProfile).hourly_rate_max || 0,
            bio: (profileData as ArtistProfile).bio || '',
            is_available: true
          })
          .select()
          .single();

        if (createError) throw createError;
        setArtist({ ...(profileData as ArtistProfile), ...(newArtistData as ArtistProfile) });
      } else {
        setArtist({ ...(profileData as ArtistProfile), ...(artistData as ArtistProfile) });
      }

      // Fetch discussions
      await fetchDiscussions();
    } catch (error) {
      console.error('Error fetching artist data:', error);
      toast({
        title: "Error",
        description: "Failed to load artist profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [artistId, isProfile, toast, fetchDiscussions]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user || !isDashboard) return;
    
    try {
      setLoading(true);
      
      // Fetch booking requests
      const { data: bookings, error: bookingsError } = await supabase
        .from('artist_bookings')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      const pendingRequests = (bookings || []).filter((b: { status: string }) => b.status === 'pending');
      const acceptedBookings = (bookings || []).filter((b: { status: string }) => b.status === 'accepted');

      setBookingRequests(pendingRequests);
      setAcceptedBookings(acceptedBookings);

      // Calculate stats
      const totalBookings = (bookings || []).length;
      const totalEarnings = (bookings || []).reduce((sum: number, b: { budget_min?: number }) => sum + (b.budget_min || 0), 0);
      const completedBookings = (bookings || []).filter((b: { status: string }) => b.status === 'completed').length;
      const cancelledBookings = (bookings || []).filter((b: { status: string }) => b.status === 'cancelled').length;

      setStats({
        totalBookings,
        pendingRequests: pendingRequests.length,
        totalEarnings,
        averageRating: 4.5, // Mock data
        completedBookings,
        cancelledBookings,
        activeChats: 0, // Mock data
        totalReviews: 0 // Mock data
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, isDashboard, toast]);

  useEffect(() => {
    if (isProfile) {
      fetchArtistData();
    } else if (isDashboard) {
      fetchDashboardData();
    }
  }, [fetchArtistData, fetchDashboardData, isProfile, isDashboard]);

  // Handle onboarding submission
  const handleOnboardingSubmit = async (data: ArtistSkillsData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your artist profile.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('artists')
        .upsert({
          user_id: user.id,
          specialty: data.skills,
          experience_years: data.experienceYears,
          hourly_rate_min: data.hourlyRateMin,
          hourly_rate_max: data.hourlyRateMax,
          bio: data.bio,
          is_available: data.isAvailable,
          portfolio_urls: data.portfolioUrls || [],
          location_city: data.locationCity,
          location_state: data.locationState
        });

      if (error) throw error;

      toast({
        title: "Profile Created",
        description: "Your artist profile has been created successfully!",
      });

      navigate('/artist/dashboard');
    } catch (error) {
      console.error('Error creating artist profile:', error);
      toast({
        title: "Error",
        description: "Failed to create artist profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle booking actions
  const handleBookingAction = async (bookingId: string, action: 'accept' | 'decline') => {
    try {
      const { error } = await supabase
        .from('artist_bookings')
        .update({ status: action === 'accept' ? 'accepted' : 'declined' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: `Booking ${action === 'accept' ? 'Accepted' : 'Declined'}`,
        description: `The booking request has been ${action === 'accept' ? 'accepted' : 'declined'}.`,
      });

      // Refresh data
      if (isDashboard) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle discussion submission
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
      const { data: artistRecord, error: artistError } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (artistError) throw artistError;

      const { error } = await supabase
        .from('artist_discussions')
        .insert({
          user_id: user.id,
          artist_id: artistRecord.id,
          title: discussionTitle,
          content: discussionContent,
          status: 'approved'
        });

      if (error) throw error;

      toast({
        title: "Discussion posted",
        description: "Your discussion has been posted successfully",
      });

      setDiscussionTitle("");
      setDiscussionContent("");
    } catch (error) {
      console.error('Error posting discussion:', error);
      toast({
        title: "Error",
        description: "Failed to post discussion",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingDiscussion(false);
    }
  };

  // Render onboarding mode
  if (isOnboarding) {
    return (
      <ResponsiveLayout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Complete Your Artist Profile</h1>
            <p className="text-gray-600 mt-2">
              Set up your artist profile to start receiving bookings and connecting with clients.
            </p>
          </div>
          
          <Card>
            <CardContent className="p-8">
              <ArtistSkillsForm
                initialData={initialData}
                onSubmit={handleOnboardingSubmit}
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    );
  }

  // Render dashboard mode
  if (isDashboard) {
    return (
      <ResponsiveLayout>
        <div className="max-w-7xl mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-600" />
              Artist Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your bookings, earnings, and artist profile
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Bookings</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.totalBookings}</p>
                    <p className="text-sm text-blue-600">{stats.completedBookings} completed</p>
                  </div>
                  <CalendarDays className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Pending Requests</p>
                    <p className="text-3xl font-bold text-green-900">{stats.pendingRequests}</p>
                    <p className="text-sm text-green-600">Awaiting response</p>
                  </div>
                  <Bell className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Earnings</p>
                    <p className="text-3xl font-bold text-purple-900">${stats.totalEarnings.toLocaleString()}</p>
                    <p className="text-sm text-purple-600">All time</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Average Rating</p>
                    <p className="text-3xl font-bold text-orange-900">{stats.averageRating}/5.0</p>
                    <p className="text-sm text-orange-600">{stats.totalReviews} reviews</p>
                  </div>
                  <Star className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="earnings" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Earnings
              </TabsTrigger>
              <TabsTrigger value="chats" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chats
              </TabsTrigger>
              <TabsTrigger value="moderation" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Moderation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BookingRequestsPanel 
                  requests={bookingRequests}
                  onAccept={(id) => handleBookingAction(id, 'accept')}
                  onDecline={(id) => handleBookingAction(id, 'decline')}
                />
                <AcceptedBookingsPanel bookings={acceptedBookings} />
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BookingRequestsPanel 
                  requests={bookingRequests}
                  onAccept={(id) => handleBookingAction(id, 'accept')}
                  onDecline={(id) => handleBookingAction(id, 'decline')}
                />
                <AcceptedBookingsPanel bookings={acceptedBookings} />
              </div>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-6">
              <EarningsPanel earnings={stats.totalEarnings} />
            </TabsContent>

            <TabsContent value="chats" className="space-y-6">
              <ActiveChatsPanel chats={activeChats} />
            </TabsContent>

            <TabsContent value="moderation" className="space-y-6">
              <ArtistModerationPanel />
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveLayout>
    );
  }

  // Render profile mode (default)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Loading Artist Profile...</h2>
          <p className="text-muted-foreground">Getting artist information</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Artist Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The artist profile you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
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

        {/* Artist Profile Header */}
        <Card className="relative overflow-hidden border-0 shadow-xl">
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
                  <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowBookingDialog(true)}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                  
                  <FollowButton 
                    userId={artistId!}
                    size="lg"
                    className="w-full sm:w-auto"
                  />
                  
                  {user && user.id !== artistId && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={() => navigate(`/chat/${artistId}`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" /> Message
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex items-center justify-center">
            <TabsList className="grid grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-inner">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              
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
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {artist.display_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{artist.bio}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                {artist.portfolio_urls && artist.portfolio_urls.length > 0 ? (
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

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-6">
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Start a Discussion</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Share your thoughts or ask questions about this artist's work.
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
                    {isSubmittingDiscussion ? "Posting..." : "Post Discussion"}
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

        {/* Booking Modal */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book {artist.display_name}</DialogTitle>
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
              <Button 
                onClick={() => {
                  // Handle booking logic here
                  setShowBookingDialog(false);
                  toast({
                    title: "Booking Request Sent",
                    description: "Your booking request has been sent to the artist",
                  });
                }} 
                className="w-full"
              >
                Send Booking Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default ConsolidatedArtist;
