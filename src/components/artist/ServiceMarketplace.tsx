import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { 
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Star,
  Users,
  MapPin,
  MessageCircle,
  Heart,
  Share2,
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Shield,
  UserCheck,
  Globe,
  Target,
  Zap,
  BarChart3,
  Activity,
  Eye,
  ExternalLink,
  Phone,
  Mail,
  Camera,
  Music,
  Palette,
  Code,
  Coffee,
  Car,
  Building,
  Leaf,
  Mountain,
  HeartHandshake,
  Lightbulb,
  Rocket,
  Info,
  Bell,
  Bookmark,
  BookmarkCheck,
  Archive,
  ArchiveRestore,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  RefreshCcw,
  RotateCw,
  RotateCcw2,
  Move,
  Move3D,
  Layers,
  Layers3,
  Box,
  Package,
  Database,
  Server,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Signal,
  SignalZero,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  BatteryFull,
  Plug,
  PlugZap,
  ZapOff,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudHail,
  Wind,
  Thermometer,
  Droplets,
  Umbrella,
  Snowflake,
  TreePine,
  TreeDeciduous,
  Flower,
  Flower2,
  LeafIcon,
  LeafyGreen,
  Sprout
} from 'lucide-react';
import { formatDistanceToNow, format, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ServiceMarketplaceProps {
  artistId?: string;
  className?: string;
}

interface ServiceProvider {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url?: string;
  artist_skills: string[];
  hourly_rate_min: number;
  hourly_rate_max: number;
  location_city: string;
  location_state: string;
  is_verified: boolean;
  experience_years: number;
  is_available: boolean;
  rating: number;
  reviews_count: number;
  portfolio_urls: string[];
  community_impact_score: number;
  followers_count: number;
  is_following?: boolean;
  is_bookmarked?: boolean;
  services: Service[];
  availability: AvailabilitySlot[];
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  category: string;
  base_price: number;
  duration_hours: number;
  is_available: boolean;
  requirements: string[];
  deliverables: string[];
  tags: string[];
  created_at: string;
}

interface AvailabilitySlot {
  id: string;
  provider_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  booking_type: 'in_person' | 'virtual' | 'hybrid';
  location?: string;
  max_bookings: number;
  current_bookings: number;
}

interface BookingRequest {
  id: string;
  client_id: string;
  provider_id: string;
  service_id: string;
  availability_slot_id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'disputed';
  total_amount: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  special_requirements?: string;
  created_at: string;
  updated_at: string;
}

const ServiceMarketplace: React.FC<ServiceMarketplaceProps> = ({ artistId, className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useLocation();
  
  const [activeTab, setActiveTab] = useState<'browse' | 'my-bookings' | 'my-services' | 'analytics'>('browse');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [myBookings, setMyBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterPriceRange, setFilterPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [bookingForm, setBookingForm] = useState({
    special_requirements: '',
    contact_preference: 'message',
    budget_range: ''
  });

  // Load service providers
  const loadProviders = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          artists!left(
            id,
            specialty,
            experience_years,
            hourly_rate_min,
            hourly_rate_max,
            is_available,
            portfolio_urls
          ),
          services!left(
            id,
            title,
            description,
            category,
            base_price,
            duration_hours,
            is_available,
            requirements,
            deliverables,
            tags
          ),
          availability_slots!left(
            id,
            date,
            start_time,
            end_time,
            is_available,
            booking_type,
            location,
            max_bookings,
            current_bookings
          )
        `)
        .eq('user_type', 'artist')
        .not('display_name', 'is', null)
        .not('bio', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedProviders = data?.map(profile => {
        const artistData = profile.artists?.[0];
        const services = profile.services || [];
        const availability = profile.availability_slots || [];
        const skills = profile.artist_skills || artistData?.specialty || [];
        const rating = 4.0 + Math.random() * 1.0; // Mock rating for now
        const reviewsCount = Math.floor(Math.random() * 50) + 5; // Mock reviews count
        
        return {
          ...profile,
          id: profile.user_id,
          artist_skills: skills,
          hourly_rate_min: artistData?.hourly_rate_min || profile.hourly_rate_min || 0,
          hourly_rate_max: artistData?.hourly_rate_max || profile.hourly_rate_max || 0,
          experience_years: artistData?.experience_years || 0,
          is_available: artistData?.is_available ?? true,
          portfolio_urls: artistData?.portfolio_urls || [],
          rating,
          reviews_count: reviewsCount,
          community_impact_score: Math.floor(Math.random() * 100),
          followers_count: Math.floor(Math.random() * 1000) + 10,
          services,
          availability
        };
      }) || [];

      setProviders(processedProviders);
    } catch (error) {
      console.error('Error loading providers:', error);
      toast({
        title: "Error",
        description: "Failed to load service providers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load user's bookings
  const loadMyBookings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          services!inner(
            title,
            description,
            category
          ),
          profiles!service_bookings_provider_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  }, [user]);

  useEffect(() => {
    loadProviders();
    loadMyBookings();
  }, [loadProviders, loadMyBookings]);

  const handleFollow = async (providerId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow providers",
        variant: "destructive",
      });
      return;
    }

    try {
      const provider = providers.find(p => p.id === providerId);
      const isFollowing = provider?.is_following;

      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', providerId);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: providerId
          });
      }

      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { 
              ...provider, 
              is_following: !isFollowing,
              followers_count: isFollowing ? provider.followers_count - 1 : provider.followers_count + 1
            }
          : provider
      ));

      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing ? "You've unfollowed this provider" : "You're now following this provider",
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handleBookService = async () => {
    if (!user || !selectedProvider || !selectedService || !selectedSlot) {
      toast({
        title: "Invalid booking",
        description: "Please select a provider, service, and time slot",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('service_bookings')
        .insert({
          client_id: user.id,
          provider_id: selectedProvider.id,
          service_id: selectedService.id,
          availability_slot_id: selectedSlot.id,
          status: 'pending',
          total_amount: selectedService.base_price * 100, // Convert to cents
          booking_date: selectedDate?.toISOString().split('T')[0],
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          special_requirements: bookingForm.special_requirements,
          contact_preference: bookingForm.contact_preference
        });

      if (error) throw error;

      setShowBookingDialog(false);
      loadMyBookings();
      
      toast({
        title: "Booking requested",
        description: "Your booking request has been sent to the provider",
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking request",
        variant: "destructive",
      });
    }
  };

  const handleViewProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowServiceDialog(true);
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.artist_skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         provider.services.some(service => service.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || 
                           provider.services.some(service => service.category === filterCategory);
    
    const matchesLocation = filterLocation === 'all' || 
                           provider.location_city.toLowerCase().includes(filterLocation.toLowerCase());
    
    const matchesPrice = filterPriceRange === 'all' || (
      filterPriceRange === 'budget' && provider.hourly_rate_min < 1000 ||
      filterPriceRange === 'mid' && provider.hourly_rate_min >= 1000 && provider.hourly_rate_max <= 5000 ||
      filterPriceRange === 'premium' && provider.hourly_rate_min > 5000
    );
    
    return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
  });

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price_low':
        return a.hourly_rate_min - b.hourly_rate_min;
      case 'price_high':
        return b.hourly_rate_max - a.hourly_rate_max;
      case 'experience':
        return b.experience_years - a.experience_years;
      case 'followers':
        return b.followers_count - a.followers_count;
      default:
        return 0;
    }
  });

  const getSkillIcon = (skill: string) => {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes('music') || skillLower.includes('musician')) return Music;
    if (skillLower.includes('art') || skillLower.includes('painter')) return Palette;
    if (skillLower.includes('photo') || skillLower.includes('camera')) return Camera;
    if (skillLower.includes('tech') || skillLower.includes('developer')) return Code;
    if (skillLower.includes('coach') || skillLower.includes('trainer')) return Target;
    if (skillLower.includes('consultant') || skillLower.includes('advisor')) return Lightbulb;
    return Users;
  };

  const getSkillColor = (skill: string) => {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes('music')) return 'bg-purple-100 text-purple-800';
    if (skillLower.includes('art') || skillLower.includes('painter')) return 'bg-pink-100 text-pink-800';
    if (skillLower.includes('photo')) return 'bg-blue-100 text-blue-800';
    if (skillLower.includes('tech') || skillLower.includes('developer')) return 'bg-indigo-100 text-indigo-800';
    if (skillLower.includes('coach') || skillLower.includes('trainer')) return 'bg-green-100 text-green-800';
    if (skillLower.includes('consultant') || skillLower.includes('advisor')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800',
      'disputed': 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Service Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and book services from local artists and professionals
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location?.city || 'Your City'}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {providers.length} Providers
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search services, providers, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="music">Music</SelectItem>
            <SelectItem value="art">Art & Design</SelectItem>
            <SelectItem value="photo">Photography</SelectItem>
            <SelectItem value="tech">Technology</SelectItem>
            <SelectItem value="coaching">Coaching</SelectItem>
            <SelectItem value="consulting">Consulting</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterLocation} onValueChange={setFilterLocation}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="delhi">Delhi</SelectItem>
            <SelectItem value="mumbai">Mumbai</SelectItem>
            <SelectItem value="bangalore">Bangalore</SelectItem>
            <SelectItem value="chennai">Chennai</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterPriceRange} onValueChange={setFilterPriceRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="budget">Budget (Under ₹1000/hr)</SelectItem>
            <SelectItem value="mid">Mid Range (₹1000-5000/hr)</SelectItem>
            <SelectItem value="premium">Premium (Above ₹5000/hr)</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="experience">Experience</SelectItem>
            <SelectItem value="followers">Followers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Browse Services
          </TabsTrigger>
          <TabsTrigger value="my-bookings" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            My Bookings
          </TabsTrigger>
          <TabsTrigger value="my-services" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            My Services
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProviders.map((provider) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={provider.avatar_url} />
                            <AvatarFallback>
                              {provider.display_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{provider.display_name}</h3>
                              {provider.is_verified && (
                                <Badge variant="default" className="bg-blue-100 text-blue-800">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {provider.location_city}, {provider.location_state}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {provider.bio.substring(0, 120)}...
                      </CardDescription>
                      
                      {/* Services */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Available Services:</h4>
                        <div className="space-y-1">
                          {provider.services.slice(0, 2).map((service) => (
                            <div key={service.id} className="flex items-center justify-between text-sm">
                              <span className="font-medium">{service.title}</span>
                              <span className="text-green-600">₹{service.base_price}/hr</span>
                            </div>
                          ))}
                          {provider.services.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{provider.services.length - 2} more services
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Skills */}
                      <div className="flex flex-wrap gap-2">
                        {provider.artist_skills.slice(0, 3).map((skill, index) => {
                          const Icon = getSkillIcon(skill);
                          return (
                            <Badge key={index} className={getSkillColor(skill)}>
                              <Icon className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          );
                        })}
                        {provider.artist_skills.length > 3 && (
                          <Badge variant="secondary">
                            +{provider.artist_skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      {/* Rating and Reviews */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{provider.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({provider.reviews_count})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{provider.followers_count} followers</span>
                        </div>
                      </div>
                      
                      {/* Availability */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${provider.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-muted-foreground">
                          {provider.is_available ? 'Available for booking' : 'Currently busy'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFollow(provider.id)}
                            className={`flex items-center gap-2 ${provider.is_following ? 'text-blue-600' : 'text-muted-foreground'}`}
                          >
                            <Heart className={`h-4 w-4 ${provider.is_following ? 'fill-current' : ''}`} />
                            {provider.is_following ? 'Following' : 'Follow'}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Message
                          </Button>
                        </div>
                        
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleViewProvider(provider)}
                          disabled={!provider.is_available}
                          className="flex items-center gap-2"
                        >
                          <CalendarIcon className="h-4 w-4" />
                          View Services
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-bookings" className="space-y-4">
          <div className="space-y-4">
            {myBookings.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start exploring services and book your first appointment.
                  </p>
                  <Button onClick={() => setActiveTab('browse')}>
                    Browse Services
                  </Button>
                </CardContent>
              </Card>
            ) : (
              myBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <span className="font-medium">{booking.services?.title}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.start_time} - {booking.end_time}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ₹{(booking.total_amount / 100).toFixed(2)}
                          </div>
                        </div>
                        
                        {booking.special_requirements && (
                          <div className="text-sm">
                            <span className="font-medium">Special Requirements:</span>
                            <p className="text-muted-foreground">{booking.special_requirements}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.profiles?.avatar_url} />
                          <AvatarFallback>
                            {booking.profiles?.display_name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-right text-sm">
                          <div className="font-medium">{booking.profiles?.display_name}</div>
                          <div className="text-muted-foreground">{booking.services?.category}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-services" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Service Management</h3>
              <p className="text-muted-foreground mb-4">
                Manage your services, availability, and bookings from here.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Service Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Track your service performance, bookings, and earnings.
              </p>
              <Button>
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Service Provider Details Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedProvider?.display_name}</DialogTitle>
            <DialogDescription>
              {selectedProvider?.bio}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6">
              {/* Services */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Available Services</h3>
                <div className="grid gap-4">
                  {selectedProvider?.services.map((service) => (
                    <Card key={service.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium">{service.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {service.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">₹{service.base_price}/hr</div>
                            <div className="text-sm text-muted-foreground">{service.duration_hours}h duration</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Availability */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Available Time Slots</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedProvider?.availability
                    .filter(slot => slot.is_available && new Date(slot.date) >= new Date())
                    .slice(0, 6)
                    .map((slot) => (
                      <Card 
                        key={slot.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedSlot?.id === slot.id ? 'ring-2 ring-blue-500' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <CardContent className="p-3 text-center">
                          <div className="text-sm font-medium">{format(new Date(slot.date), 'MMM dd')}</div>
                          <div className="text-xs text-muted-foreground">{slot.start_time} - {slot.end_time}</div>
                          <div className="text-xs text-muted-foreground">{slot.booking_type}</div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowServiceDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setSelectedService(selectedProvider?.services[0] || null);
                setShowBookingDialog(true);
              }}
              disabled={!selectedProvider?.is_available}
            >
              Book Service
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Service</DialogTitle>
            <DialogDescription>
              {selectedProvider?.display_name} - {selectedService?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Service Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-medium">{selectedService?.duration_hours} hours</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Price:</span>
                  <span className="ml-2 font-medium">₹{selectedService?.base_price}/hour</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <span className="ml-2 font-medium">
                    {selectedSlot && format(new Date(selectedSlot.date), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span>
                  <span className="ml-2 font-medium">
                    {selectedSlot?.start_time} - {selectedSlot?.end_time}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Special Requirements (Optional)</Label>
                <Textarea
                  placeholder="Any specific requirements or notes for the service provider..."
                  value={bookingForm.special_requirements}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, special_requirements: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Preferred Contact Method</Label>
                <Select value={bookingForm.contact_preference} onValueChange={(value) => setBookingForm(prev => ({ ...prev, contact_preference: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">In-app Message</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-lg font-bold">
                Total: ₹{(selectedService?.base_price || 0) * (selectedService?.duration_hours || 0)}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBookService}>
                  Request Booking
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceMarketplace;
