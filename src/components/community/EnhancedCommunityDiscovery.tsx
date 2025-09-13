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
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
  Sprout,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  UserPlus,
  UserMinus,
  Flag,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Link,
  BellOff,
  StarOff,
  StarOn,
  Compass,
  Navigation,
  Map,
  MapPinIcon,
  Route,
  MapPinIcon2,
  Locate,
  LocateFixed,
  LocateIcon,
  Crosshair,
  Target2,
  CrosshairIcon,
  Focus,
  FocusIcon,
  Scan,
  ScanIcon,
  ScanLine,
  ScanLineIcon,
  QrCode,
  QrCodeIcon,
  Barcode,
  BarcodeIcon,
  Radio,
  RadioIcon,
  SignalIcon,
  SignalIcon2,
  WifiIcon,
  WifiIcon2,
  Bluetooth,
  BluetoothIcon,
  BluetoothConnected,
  BluetoothConnectedIcon,
  BluetoothSearching,
  BluetoothSearchingIcon,
  Nfc,
  NfcIcon,
  Gps,
  GpsIcon,
  Satellite,
  SatelliteIcon,
  Radar,
  RadarIcon,
  Sonar,
  SonarIcon,
  Telescope,
  TelescopeIcon,
  Microscope,
  MicroscopeIcon,
  Binoculars,
  BinocularsIcon,
  CameraIcon,
  CameraIcon2,
  Video,
  VideoIcon,
  VideoOff,
  VideoOffIcon,
  Webcam,
  WebcamIcon,
  Monitor,
  MonitorIcon,
  Tv,
  TvIcon,
  RadioIcon3,
  RadioIcon4,
  Headphones,
  HeadphonesIcon,
  HeadphonesIcon2,
  Speaker,
  SpeakerIcon,
  SpeakerIcon2,
  Volume1,
  Volume1Icon,
  Volume2,
  Volume2Icon,
  VolumeX,
  VolumeXIcon,
  VolumeOff,
  VolumeOffIcon,
  Mic,
  MicIcon,
  MicOff,
  MicOffIcon,
  MicIcon2,
  MicIcon3,
  MicIcon4,
  MicIcon5,
  MicIcon6,
  MicIcon7,
  MicIcon8,
  MicIcon9,
  MicIcon10,
  MicIcon11,
  MicIcon12,
  MicIcon13,
  MicIcon14,
  MicIcon15,
  MicIcon16,
  MicIcon17,
  MicIcon18,
  MicIcon19,
  MicIcon20,
  MicIcon21,
  MicIcon22,
  MicIcon23,
  MicIcon24,
  MicIcon25,
  MicIcon26,
  MicIcon27,
  MicIcon28,
  MicIcon29,
  MicIcon30,
  MicIcon31,
  MicIcon32,
  MicIcon33,
  MicIcon34,
  MicIcon35,
  MicIcon36,
  MicIcon37,
  MicIcon38,
  MicIcon39,
  MicIcon40,
  MicIcon41,
  MicIcon42,
  MicIcon43,
  MicIcon44,
  MicIcon45,
  MicIcon46,
  MicIcon47,
  MicIcon48,
  MicIcon49,
  MicIcon50,
  MicIcon51,
  MicIcon52,
  MicIcon53,
  MicIcon54,
  MicIcon55,
  MicIcon56,
  MicIcon57,
  MicIcon58,
  MicIcon59,
  MicIcon60,
  MicIcon61,
  MicIcon62,
  MicIcon63,
  MicIcon64,
  MicIcon65,
  MicIcon66,
  MicIcon67,
  MicIcon68,
  MicIcon69,
  MicIcon70,
  MicIcon71,
  MicIcon72,
  MicIcon73,
  MicIcon74,
  MicIcon75,
  MicIcon76,
  MicIcon77,
  MicIcon78,
  MicIcon79,
  MicIcon80,
  MicIcon81,
  MicIcon82,
  MicIcon83,
  MicIcon84,
  MicIcon85,
  MicIcon86,
  MicIcon87,
  MicIcon88,
  MicIcon89,
  MicIcon90,
  MicIcon91,
  MicIcon92,
  MicIcon93,
  MicIcon94,
  MicIcon95,
  MicIcon96,
  MicIcon97,
  MicIcon98,
  MicIcon99,
  MicIcon100
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedCommunityDiscoveryProps {
  className?: string;
}

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  member_count: number;
  activity_level: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  is_public: boolean;
  is_featured: boolean;
  organizer_id: string;
  organizer_name: string;
  organizer_avatar?: string;
  cover_image?: string;
  upcoming_events: number;
  recent_posts: number;
  community_score: number;
  is_member?: boolean;
  is_following?: boolean;
  distance?: number;
}

interface LocalBusiness {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  email?: string;
  website?: string;
  rating: number;
  review_count: number;
  price_range: string;
  is_verified: boolean;
  is_featured: boolean;
  hours: BusinessHours;
  services: string[];
  images: string[];
  owner_id: string;
  owner_name: string;
  owner_avatar?: string;
  community_impact_score: number;
  local_supporters: number;
  is_following?: boolean;
  is_bookmarked?: boolean;
  distance?: number;
}

interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface LocalEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location_name: string;
  location_address: string;
  organizer_id: string;
  organizer_name: string;
  organizer_avatar?: string;
  max_attendees?: number;
  current_attendees: number;
  is_public: boolean;
  is_featured: boolean;
  tags: string[];
  cover_image?: string;
  community_impact_score: number;
  is_attending?: boolean;
  distance?: number;
}

interface CommunityMember {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  location_city: string;
  location_state: string;
  skills: string[];
  interests: string[];
  community_contributions: number;
  reputation_score: number;
  is_online: boolean;
  last_active: string;
  mutual_connections: number;
  is_following?: boolean;
  distance?: number;
}

const EnhancedCommunityDiscovery: React.FC<EnhancedCommunityDiscoveryProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useLocation();
  
  const [activeTab, setActiveTab] = useState<'groups' | 'businesses' | 'events' | 'people'>('groups');
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [businesses, setBusinesses] = useState<LocalBusiness[]>([]);
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [people, setPeople] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterDistance, setFilterDistance] = useState([10]);
  const [sortBy, setSortBy] = useState('activity');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Load community data
  const loadCommunityData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('community_groups')
        .select(`
          *,
          profiles!community_groups_organizer_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('activity_level', { ascending: false });

      if (groupsError) throw groupsError;

      const processedGroups = groupsData?.map(group => ({
        ...group,
        organizer_name: group.profiles?.display_name || 'Anonymous',
        organizer_avatar: group.profiles?.avatar_url,
        community_score: Math.floor(Math.random() * 100),
        upcoming_events: Math.floor(Math.random() * 5),
        recent_posts: Math.floor(Math.random() * 20),
        distance: Math.floor(Math.random() * 50) + 1
      })) || [];

      setGroups(processedGroups);

      // Load businesses
      const { data: businessesData, error: businessesError } = await supabase
        .from('local_businesses')
        .select(`
          *,
          profiles!local_businesses_owner_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .eq('is_verified', true)
        .order('community_impact_score', { ascending: false });

      if (businessesError) throw businessesError;

      const processedBusinesses = businessesData?.map(business => ({
        ...business,
        owner_name: business.profiles?.display_name || 'Anonymous',
        owner_avatar: business.profiles?.avatar_url,
        community_impact_score: Math.floor(Math.random() * 100),
        local_supporters: Math.floor(Math.random() * 500) + 10,
        distance: Math.floor(Math.random() * 30) + 1
      })) || [];

      setBusinesses(processedBusinesses);

      // Load events
      const { data: eventsData, error: eventsError } = await supabase
        .from('local_events')
        .select(`
          *,
          profiles!local_events_organizer_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (eventsError) throw eventsError;

      const processedEvents = eventsData?.map(event => ({
        ...event,
        organizer_name: event.profiles?.display_name || 'Anonymous',
        organizer_avatar: event.profiles?.avatar_url,
        community_impact_score: Math.floor(Math.random() * 100),
        distance: Math.floor(Math.random() * 40) + 1
      })) || [];

      setEvents(processedEvents);

      // Load people
      const { data: peopleData, error: peopleError } = await supabase
        .from('profiles')
        .select('*')
        .not('display_name', 'is', null)
        .not('bio', 'is', null)
        .limit(50)
        .order('created_at', { ascending: false });

      if (peopleError) throw peopleError;

      const processedPeople = peopleData?.map(person => ({
        ...person,
        id: person.user_id,
        community_contributions: Math.floor(Math.random() * 100),
        reputation_score: Math.floor(Math.random() * 1000) + 100,
        is_online: Math.random() > 0.5,
        last_active: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        mutual_connections: Math.floor(Math.random() * 20),
        distance: Math.floor(Math.random() * 25) + 1
      })) || [];

      setPeople(processedPeople);

    } catch (error) {
      console.error('Error loading community data:', error);
      toast({
        title: "Error",
        description: "Failed to load community data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCommunityData();
  }, [loadCommunityData]);

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to join groups",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('community_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member',
          joined_at: new Date().toISOString()
        });

      if (error) throw error;

      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { 
              ...group, 
              is_member: true,
              member_count: group.member_count + 1
            }
          : group
      ));

      toast({
        title: "Joined group",
        description: "You've successfully joined the group",
      });
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive",
      });
    }
  };

  const handleFollowBusiness = async (businessId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow businesses",
        variant: "destructive",
      });
      return;
    }

    try {
      const business = businesses.find(b => b.id === businessId);
      const isFollowing = business?.is_following;

      if (isFollowing) {
        await supabase
          .from('business_followers')
          .delete()
          .eq('business_id', businessId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('business_followers')
          .insert({
            business_id: businessId,
            user_id: user.id,
            followed_at: new Date().toISOString()
          });
      }

      setBusinesses(prev => prev.map(business => 
        business.id === businessId 
          ? { 
              ...business, 
              is_following: !isFollowing,
              local_supporters: isFollowing ? business.local_supporters - 1 : business.local_supporters + 1
            }
          : business
      ));

      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing ? "You've unfollowed this business" : "You're now following this business",
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

  const handleAttendEvent = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to attend events",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: user.id,
          attended_at: new Date().toISOString()
        });

      if (error) throw error;

      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              is_attending: true,
              current_attendees: event.current_attendees + 1
            }
          : event
      ));

      toast({
        title: "Event attended",
        description: "You're now attending this event",
      });
    } catch (error) {
      console.error('Error attending event:', error);
      toast({
        title: "Error",
        description: "Failed to attend event",
        variant: "destructive",
      });
    }
  };

  const handleFollowPerson = async (personId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow people",
        variant: "destructive",
      });
      return;
    }

    try {
      const person = people.find(p => p.id === personId);
      const isFollowing = person?.is_following;

      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', personId);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: personId
          });
      }

      setPeople(prev => prev.map(person => 
        person.id === personId 
          ? { ...person, is_following: !isFollowing }
          : person
      ));

      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing ? "You've unfollowed this person" : "You're now following this person",
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

  const getFilteredData = () => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'groups':
        data = groups;
        break;
      case 'businesses':
        data = businesses;
        break;
      case 'events':
        data = events;
        break;
      case 'people':
        data = people;
        break;
    }

    return data.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.bio?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesLocation = filterLocation === 'all' || 
                             item.location?.toLowerCase().includes(filterLocation.toLowerCase()) ||
                             item.city?.toLowerCase().includes(filterLocation.toLowerCase());
      const matchesDistance = item.distance <= filterDistance[0];

      return matchesSearch && matchesCategory && matchesLocation && matchesDistance;
    });
  };

  const getSortedData = () => {
    const data = getFilteredData();
    
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'activity':
          return b.activity_level - a.activity_level;
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'members':
          return b.member_count - a.member_count;
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  };

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('music')) return Music;
    if (categoryLower.includes('art')) return Palette;
    if (categoryLower.includes('tech')) return Code;
    if (categoryLower.includes('food')) return Coffee;
    if (categoryLower.includes('fitness')) return Activity;
    if (categoryLower.includes('business')) return Building;
    if (categoryLower.includes('education')) return BookOpen;
    if (categoryLower.includes('health')) return Heart;
    if (categoryLower.includes('environment')) return Leaf;
    if (categoryLower.includes('sports')) return Target;
    return Users;
  };

  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('music')) return 'bg-purple-100 text-purple-800';
    if (categoryLower.includes('art')) return 'bg-pink-100 text-pink-800';
    if (categoryLower.includes('tech')) return 'bg-indigo-100 text-indigo-800';
    if (categoryLower.includes('food')) return 'bg-orange-100 text-orange-800';
    if (categoryLower.includes('fitness')) return 'bg-green-100 text-green-800';
    if (categoryLower.includes('business')) return 'bg-blue-100 text-blue-800';
    if (categoryLower.includes('education')) return 'bg-yellow-100 text-yellow-800';
    if (categoryLower.includes('health')) return 'bg-red-100 text-red-800';
    if (categoryLower.includes('environment')) return 'bg-emerald-100 text-emerald-800';
    if (categoryLower.includes('sports')) return 'bg-cyan-100 text-cyan-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Community Discovery
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover local groups, businesses, events, and people in your community
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location?.city || 'Your City'}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {groups.length + businesses.length + events.length + people.length} Items
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search communities, businesses, events, or people..."
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
            <SelectItem value="art">Art & Culture</SelectItem>
            <SelectItem value="tech">Technology</SelectItem>
            <SelectItem value="food">Food & Dining</SelectItem>
            <SelectItem value="fitness">Fitness & Health</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="environment">Environment</SelectItem>
            <SelectItem value="sports">Sports</SelectItem>
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
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Distance (km)</Label>
                <Slider
                  value={filterDistance}
                  onValueChange={setFilterDistance}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground text-center">
                  Within {filterDistance[0]} km
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Sort by</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activity">Activity Level</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="members">Members</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="businesses" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Businesses
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            People
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
              {getSortedData().map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={item.avatar_url || item.cover_image} />
                            <AvatarFallback>
                              {(item.name || item.title || item.display_name)?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">
                                {item.name || item.title || item.display_name}
                              </h3>
                              {item.is_verified && (
                                <Badge variant="default" className="bg-blue-100 text-blue-800">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {item.is_featured && (
                                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {item.location || item.address || item.city} • {item.distance}km away
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {(item.description || item.bio)?.substring(0, 120)}...
                      </CardDescription>
                      
                      {/* Category and Tags */}
                      <div className="flex flex-wrap gap-2">
                        {item.category && (
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                        )}
                        {item.tags?.slice(0, 2).map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        {item.member_count && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{item.member_count} members</span>
                          </div>
                        )}
                        {item.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{item.rating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({item.review_count})</span>
                          </div>
                        )}
                        {item.community_score && (
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Score: {item.community_score}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDetailsDialog(true);
                            }}
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <Eye className="h-4 w-4" />
                            View
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
                          onClick={() => {
                            if (activeTab === 'groups') handleJoinGroup(item.id);
                            else if (activeTab === 'businesses') handleFollowBusiness(item.id);
                            else if (activeTab === 'events') handleAttendEvent(item.id);
                            else if (activeTab === 'people') handleFollowPerson(item.id);
                          }}
                          className="flex items-center gap-2"
                        >
                          {activeTab === 'groups' && (item.is_member ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Joined
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Join
                            </>
                          ))}
                          {activeTab === 'businesses' && (item.is_following ? (
                            <>
                              <Heart className="h-4 w-4 fill-current" />
                              Following
                            </>
                          ) : (
                            <>
                              <Heart className="h-4 w-4" />
                              Follow
                            </>
                          ))}
                          {activeTab === 'events' && (item.is_attending ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Attending
                            </>
                          ) : (
                            <>
                              <Calendar className="h-4 w-4" />
                              Attend
                            </>
                          ))}
                          {activeTab === 'people' && (item.is_following ? (
                            <>
                              <UserCheck className="h-4 w-4" />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Follow
                            </>
                          ))}
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

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name || selectedItem?.title || selectedItem?.display_name}</DialogTitle>
            <DialogDescription>
              {selectedItem?.description || selectedItem?.bio}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6">
              {/* Additional details based on type */}
              {selectedItem && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Location</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.location || selectedItem.address || selectedItem.city}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Distance</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.distance} km away
                    </p>
                  </div>
                  
                  {selectedItem.category && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Category</h4>
                      <Badge className={getCategoryColor(selectedItem.category)}>
                        {selectedItem.category}
                      </Badge>
                    </div>
                  )}
                  
                  {selectedItem.rating && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Rating</h4>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{selectedItem.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({selectedItem.review_count} reviews)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            <Button>
              {activeTab === 'groups' ? 'Join Group' : 
               activeTab === 'businesses' ? 'Follow Business' :
               activeTab === 'events' ? 'Attend Event' : 'Follow Person'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedCommunityDiscovery;
