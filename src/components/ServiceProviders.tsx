import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { 
  Users, 
  MapPin, 
  Star, 
  MessageCircle, 
  Heart, 
  Share2, 
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  DollarSign,
  Award,
  Shield,
  UserCheck,
  Globe,
  Target,
  Zap,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
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
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ServiceProvidersProps {
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
  created_at: string;
  updated_at: string;
}

const ServiceProviders: React.FC<ServiceProvidersProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useLocation();
  
  const [activeTab, setActiveTab] = useState<'all' | 'artists' | 'services' | 'trending'>('all');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

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
          )
        `)
        .eq('user_type', 'artist')
        .not('display_name', 'is', null)
        .not('bio', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedProviders = data?.map(profile => {
        const artistData = profile.artists?.[0];
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

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

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
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', providerId);
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: providerId
          });
      }

      // Update local state
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

  const handleBookmark = async (providerId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark providers",
        variant: "destructive",
      });
      return;
    }

    try {
      const provider = providers.find(p => p.id === providerId);
      const isBookmarked = provider?.is_bookmarked;

      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('bookmarkable_id', providerId)
          .eq('bookmarkable_type', 'service_provider');
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            bookmarkable_id: providerId,
            bookmarkable_type: 'service_provider'
          });
      }

      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, is_bookmarked: !isBookmarked }
          : provider
      ));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleBookProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowBookingDialog(true);
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.artist_skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || provider.artist_skills.some(skill => skill.toLowerCase().includes(filterCategory.toLowerCase()));
    const matchesLocation = filterLocation === 'all' || provider.location_city.toLowerCase().includes(filterLocation.toLowerCase());
    const matchesTab = 
      (activeTab === 'all') ||
      (activeTab === 'artists' && provider.artist_skills.some(skill => ['musician', 'painter', 'photographer', 'performer', 'dj'].includes(skill.toLowerCase()))) ||
      (activeTab === 'services' && provider.artist_skills.some(skill => ['consultant', 'coach', 'instructor', 'trainer', 'advisor'].includes(skill.toLowerCase()))) ||
      (activeTab === 'trending' && provider.community_impact_score > 70);
    
    return matchesSearch && matchesCategory && matchesLocation && matchesTab;
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Service Providers
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect with local artists, consultants, and service providers in your community
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
            placeholder="Search providers by name, skills, or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="music">Music</SelectItem>
            <SelectItem value="art">Art</SelectItem>
            <SelectItem value="photo">Photography</SelectItem>
            <SelectItem value="tech">Technology</SelectItem>
            <SelectItem value="coach">Coaching</SelectItem>
            <SelectItem value="consultant">Consulting</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterLocation} onValueChange={setFilterLocation}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="delhi">Delhi</SelectItem>
            <SelectItem value="mumbai">Mumbai</SelectItem>
            <SelectItem value="bangalore">Bangalore</SelectItem>
            <SelectItem value="chennai">Chennai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'verified' | 'local' | 'my-services')}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="artists" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Artists
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
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
              {filteredProviders.map((provider) => (
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
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookmark(provider.id)}
                            className={`${provider.is_bookmarked ? 'text-blue-600' : 'text-muted-foreground'}`}
                          >
                            <Bookmark className={`h-4 w-4 ${provider.is_bookmarked ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {provider.bio.substring(0, 120)}...
                      </CardDescription>
                      
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
                      
                      {/* Pricing */}
                      {provider.hourly_rate_min > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            ₹{provider.hourly_rate_min} - ₹{provider.hourly_rate_max}/hour
                          </span>
                        </div>
                      )}
                      
                      {/* Availability */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${provider.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-muted-foreground">
                          {provider.is_available ? 'Available' : 'Busy'}
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
                          onClick={() => handleBookProvider(provider)}
                          disabled={!provider.is_available}
                          className="flex items-center gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          Book
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Service Provider</DialogTitle>
            <DialogDescription>
              {selectedProvider?.display_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Service Details</h4>
              <p className="text-sm text-muted-foreground">
                {selectedProvider?.bio}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedProvider?.artist_skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Booking Feature Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                We're working on a comprehensive booking system for service providers.
              </p>
              <Button onClick={() => setShowBookingDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceProviders;
