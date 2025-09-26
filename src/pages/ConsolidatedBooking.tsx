import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notificationService";
import { 
  CalendarIcon, 
  Star, 
  Users, 
  MapPin, 
  Clock,
  DollarSign,
  MessageCircle,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Bell,
  Shield,
  Target,
  Award,
  Crown,
  Sparkles,
  BarChart3,
  Activity,
  TrendingUp,
  Heart,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Settings,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Home,
  Building,
  Car,
  Music,
  Camera,
  Mic,
  Palette,
  Coffee,
  Headphones,
  BookOpen,
  Zap,
  Globe,
  Navigation,
  Compass,
  Flag,
  Hash,
  AtSign,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingDown,
  Activity as ActivityIcon
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { sanitizeText, sanitizeEmail } from "@/lib/sanitize";
import { FollowButton } from "@/components/FollowButton";

interface Artist {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url?: string;
  location_city: string;
  location_state: string;
  is_verified: boolean;
  rating?: number;
  artist_skills?: string[];
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  is_available?: boolean;
  experience_years?: number;
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
  updated_at?: string;
  user_display_name?: string;
  user_avatar_url?: string;
  artist_display_name?: string;
  artist_avatar_url?: string;
}

interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  averageRating: number;
}

const ConsolidatedBooking: React.FC = () => {
  const { artistId } = useParams<{ artistId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("browse");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkill, setFilterSkill] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  
  // Data states
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    pendingBookings: 0,
    acceptedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalSpent: 0,
    averageRating: 0
  });
  
  // Booking form states
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Fetch artists
  const fetchArtists = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('artists')
        .select(`
          *,
          profiles!artists_user_id_fkey (
            user_id,
            display_name,
            avatar_url,
            location_city,
            location_state,
            is_verified
          )
        `)
        .eq('is_available', true);

      // Apply filters
      if (filterSkill !== "all") {
        query = query.contains('specialty', [filterSkill]);
      }
      
      if (filterLocation !== "all") {
        query = query.eq('location_city', filterLocation);
      }
      
      if (filterPrice !== "all") {
        const [min, max] = filterPrice.split('-').map(Number);
        if (min !== undefined) {
          query = query.gte('hourly_rate_min', min);
        }
        if (max !== undefined) {
          query = query.lte('hourly_rate_max', max);
        }
      }

      // Apply search
      if (searchTerm) {
        query = query.or(`display_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,specialty.cs.{${searchTerm}}`);
      }

      // Apply sorting
      switch (sortBy) {
        case "rating":
          query = query.order('rating', { ascending: false });
          break;
        case "price_low":
          query = query.order('hourly_rate_min', { ascending: true });
          break;
        case "price_high":
          query = query.order('hourly_rate_max', { ascending: false });
          break;
        case "experience":
          query = query.order('experience_years', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedArtists = (data || []).map((artist: any) => ({
        id: artist.id,
        user_id: artist.user_id,
        display_name: artist.profiles?.display_name || artist.display_name,
        bio: artist.bio,
        avatar_url: artist.profiles?.avatar_url || artist.avatar_url,
        location_city: artist.profiles?.location_city || artist.location_city,
        location_state: artist.profiles?.location_state || artist.location_state,
        is_verified: artist.profiles?.is_verified || artist.is_verified,
        rating: artist.rating || 0,
        artist_skills: artist.specialty || [],
        hourly_rate_min: artist.hourly_rate_min || 0,
        hourly_rate_max: artist.hourly_rate_max || 0,
        is_available: artist.is_available,
        experience_years: artist.experience_years || 0
      }));

      setArtists(formattedArtists);
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast({
        title: "Error",
        description: "Failed to load artists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterSkill, filterLocation, filterPrice, sortBy, toast]);

  // Fetch user bookings
  const fetchBookings = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('artist_bookings')
        .select(`
          *,
          profiles!artist_bookings_user_id_fkey (
            user_id,
            display_name,
            avatar_url
          ),
          artists!artist_bookings_artist_id_fkey (
            user_id,
            profiles!artists_user_id_fkey (
              user_id,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBookings = (data || []).map((booking: any) => ({
        id: booking.id,
        user_id: booking.user_id,
        artist_id: booking.artist_id,
        event_date: booking.event_date,
        event_location: booking.event_location,
        event_description: booking.event_description,
        budget_min: booking.budget_min,
        budget_max: booking.budget_max,
        contact_info: booking.contact_info,
        status: booking.status,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        user_display_name: booking.profiles?.display_name,
        user_avatar_url: booking.profiles?.avatar_url,
        artist_display_name: booking.artists?.profiles?.display_name,
        artist_avatar_url: booking.artists?.profiles?.avatar_url
      }));

      setBookings(formattedBookings);

      // Calculate stats
      const totalBookings = formattedBookings.length;
      const pendingBookings = formattedBookings.filter((b: any) => b.status === 'pending').length;
      const acceptedBookings = formattedBookings.filter((b: any) => b.status === 'accepted').length;
      const completedBookings = formattedBookings.filter((b: any) => b.status === 'completed').length;
      const cancelledBookings = formattedBookings.filter((b: any) => b.status === 'cancelled').length;
      const totalSpent = formattedBookings
        .filter((b: any) => b.status === 'completed')
        .reduce((sum: number, b: any) => sum + (b.budget_min || 0), 0);

      setStats({
        totalBookings,
        pendingBookings,
        acceptedBookings,
        completedBookings,
        cancelledBookings,
        totalSpent,
        averageRating: 4.5 // Mock data
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchArtists();
    fetchBookings();
  }, [fetchArtists, fetchBookings]);

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!user || !selectedArtist) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book an artist.",
        variant: "destructive",
      });
      return;
    }

    if (!eventDate || !eventLocation || !eventDescription || !budgetMin || !contactInfo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('artist_bookings')
        .insert({
          user_id: user.id,
          artist_id: selectedArtist.user_id,
          event_date: eventDate,
          event_location: eventLocation,
          event_description: eventDescription,
          budget_min: parseFloat(budgetMin),
          budget_max: budgetMax ? parseFloat(budgetMax) : null,
          contact_info: contactInfo,
          status: 'pending'
        });

      if (error) throw error;

      // Send notification to artist
      try {
        await notificationService.createBookingRequestNotification(
          selectedArtist.user_id,
          {
            booking_id: '', // Will be set by the service
            user_id: user.id,
            artist_id: selectedArtist.user_id,
            event_date: eventDate,
            event_location: eventLocation,
            event_description: eventDescription,
            budget_min: parseFloat(budgetMin),
            budget_max: budgetMax ? parseFloat(budgetMax) : null,
            contact_info: contactInfo
          }
        );
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
      }

      toast({
        title: "Booking Request Sent",
        description: "Your booking request has been sent to the artist.",
      });

      setShowBookingDialog(false);
      setEventDate("");
      setEventLocation("");
      setEventDescription("");
      setBudgetMin("");
      setBudgetMax("");
      setContactInfo("");
      setEventType("");
      setGuestCount("");
      setSpecialRequirements("");

      // Refresh bookings
      fetchBookings();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to send booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('artist_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled.",
      });

      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'declined':
        return <X className="w-4 h-4" />;
      case 'completed':
        return <Award className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
                Book an Artist
              </h1>
              <p className="text-gray-600 mt-2">
                Find and book talented artists for your events
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Browse Artists
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Browse Artists Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Find Your Perfect Artist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search artists, skills, or locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterSkill} onValueChange={setFilterSkill}>
                    <SelectTrigger>
                      <SelectValue placeholder="Skill Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skills</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Art">Art</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Dance">Dance</SelectItem>
                      <SelectItem value="Comedy">Comedy</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                      <SelectItem value="Los Angeles">Los Angeles</SelectItem>
                      <SelectItem value="Chicago">Chicago</SelectItem>
                      <SelectItem value="Miami">Miami</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="experience">Experience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Artists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                artists.map((artist) => (
                  <Card key={artist.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={artist.avatar_url} />
                          <AvatarFallback>
                            {artist.display_name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{artist.display_name}</h3>
                            {artist.is_verified && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{artist.location_city}, {artist.location_state}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{artist.rating?.toFixed(1) || '4.5'}</span>
                            <span className="text-gray-400">•</span>
                            <span>{artist.experience_years} years exp</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{artist.bio}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {artist.artist_skills?.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {artist.artist_skills && artist.artist_skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{artist.artist_skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-medium text-green-600">
                            ${artist.hourly_rate_min}
                            {artist.hourly_rate_max && artist.hourly_rate_max !== artist.hourly_rate_min && 
                              `-${artist.hourly_rate_max}`
                            }/hr
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/artist/${artist.user_id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedArtist(artist);
                              setShowBookingDialog(true);
                            }}
                          >
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            Book
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            {/* Booking Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Bookings</p>
                      <p className="text-3xl font-bold text-blue-900">{stats.totalBookings}</p>
                    </div>
                    <CalendarIcon className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Pending</p>
                      <p className="text-3xl font-bold text-yellow-900">{stats.pendingBookings}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Accepted</p>
                      <p className="text-3xl font-bold text-green-900">{stats.acceptedBookings}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Total Spent</p>
                      <p className="text-3xl font-bold text-purple-900">${stats.totalSpent.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bookings List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={booking.artist_avatar_url} />
                            <AvatarFallback>
                              {booking.artist_display_name?.charAt(0) || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{booking.artist_display_name}</h3>
                            <p className="text-sm text-gray-600">{booking.event_description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(booking.event_date).toLocaleDateString()} • {booking.event_location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </Badge>
                          <div className="text-right">
                            <p className="font-medium">${booking.budget_min}</p>
                            {booking.budget_max && (
                              <p className="text-sm text-gray-500">- ${booking.budget_max}</p>
                            )}
                          </div>
                          {booking.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                      <p className="text-gray-600 mb-4">Start by browsing and booking an artist for your event.</p>
                      <Button onClick={() => setActiveTab("browse")}>
                        Browse Artists
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').length > 0 ? (
                    bookings
                      .filter(b => b.status === 'completed' || b.status === 'cancelled')
                      .map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={booking.artist_avatar_url} />
                              <AvatarFallback>
                                {booking.artist_display_name?.charAt(0) || 'A'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{booking.artist_display_name}</h3>
                              <p className="text-sm text-gray-600">{booking.event_description}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(booking.event_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">{booking.status}</span>
                            </Badge>
                            <div className="text-right">
                              <p className="font-medium">${booking.budget_min}</p>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Yet</h3>
                      <p className="text-gray-600">Your completed and cancelled bookings will appear here.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Booking Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Book {selectedArtist?.display_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-date">Event Date *</Label>
                  <Input
                    id="event-date"
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="anniversary">Anniversary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="event-location">Event Location *</Label>
                <Input
                  id="event-location"
                  placeholder="Event location"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="event-description">Event Description *</Label>
                <Textarea
                  id="event-description"
                  placeholder="Describe your event..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guest-count">Guest Count</Label>
                  <Input
                    id="guest-count"
                    type="number"
                    placeholder="Number of guests"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="budget-min">Budget Range *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="budget-min"
                      type="number"
                      placeholder="Min budget"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max budget"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="special-requirements">Special Requirements</Label>
                <Textarea
                  id="special-requirements"
                  placeholder="Any special requirements or requests..."
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="contact-info">Contact Information *</Label>
                <Textarea
                  id="contact-info"
                  placeholder="Your phone number, email, or other contact details"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBookingSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Send Booking Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedBooking;
