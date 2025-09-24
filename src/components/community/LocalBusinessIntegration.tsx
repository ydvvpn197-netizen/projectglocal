import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { 
  Building, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Users, 
  Heart, 
  Share2, 
  MessageCircle, 
  Calendar, 
  Award, 
  Shield, 
  UserCheck, 
  Target, 
  Zap, 
  BarChart3, 
  Activity, 
  Eye, 
  ExternalLink, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Camera,
  Music,
  Palette,
  Code,
  Coffee,
  Car,
  Leaf,
  Mountain,
  HeartHandshake,
  Lightbulb,
  Rocket,
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
  DollarSign,
  CreditCard,
  ShoppingCart,
  PackageIcon,
  Truck,
  Home,
  Store,
  StoreIcon,
  ShoppingBag,
  ShoppingBagIcon,
  Tag,
  Percent,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  Settings2,
  SettingsIcon,
  Cog,
  CogIcon,
  Wrench,
  WrenchIcon,
  Hammer,
  HammerIcon,
  Tool,
  ToolIcon,
  Screwdriver,
  ScrewdriverIcon,
  Nut,
  NutIcon,
  Bolt,
  BoltIcon,
  Key,
  KeyIcon,
  Lock,
  LockIcon,
  Unlock,
  UnlockIcon,
  LockIcon2,
  UnlockIcon2,
  ShieldIcon,
  ShieldCheck,
  ShieldCheckIcon,
  ShieldAlert,
  ShieldAlertIcon,
  ShieldOff,
  ShieldOffIcon,
  ShieldQuestion,
  ShieldQuestionIcon,
  ShieldX,
  ShieldXIcon,
  User,
  UserIcon,
  UserCheck,
  UserCheckIcon,
  UserX,
  UserXIcon,
  UserPlus,
  UserPlusIcon,
  UserMinus,
  UserMinusIcon,
  UserCog,
  UserCogIcon,
  UsersIcon,
  Users2,
  Users2Icon,
  UserGroup,
  UserGroupIcon,
  Crown,
  CrownIcon,
  Medal,
  MedalIcon,
  Trophy,
  TrophyIcon,
  AwardIcon,
  Badge as BadgeIcon,
  BadgeCheck,
  BadgeCheckIcon,
  Certificate,
  CertificateIcon,
  Diploma,
  DiplomaIcon,
  GraduationCap,
  GraduationCapIcon,
  School,
  SchoolIcon,
  University,
  UniversityIcon,
  Library,
  LibraryIcon,
  Book,
  BookIcon,
  BookOpen,
  BookOpenIcon,
  Notebook,
  NotebookIcon,
  FileText,
  FileTextIcon,
  File,
  FileIcon,
  Folder,
  FolderIcon,
  FolderOpen,
  FolderOpenIcon,
  Archive,
  ArchiveIcon,
  ArchiveBox,
  ArchiveBoxIcon,
  BoxIcon,
  PackageIcon as PackageIcon2,
  Package2,
  Package2Icon,
  Container,
  ContainerIcon,
  Crate,
  CrateIcon,
  Barrel,
  BarrelIcon,
  Bucket,
  BucketIcon,
  Basket,
  BasketIcon,
  Cart,
  CartIcon,
  ShoppingCartIcon,
  ShoppingBagIcon as ShoppingBagIcon2,
  ShoppingBasket,
  ShoppingBasketIcon,
  Handbag,
  HandbagIcon,
  Backpack,
  BackpackIcon,
  Suitcase,
  SuitcaseIcon,
  Briefcase,
  BriefcaseIcon,
  Luggage,
  LuggageIcon,
  Trash,
  TrashIcon,
  Trash2Icon,
  Recycle,
  RecycleIcon,
  Garbage,
  GarbageIcon,
  Waste,
  WasteIcon,
  Bin,
  BinIcon,
  Can,
  CanIcon,
  Jar,
  JarIcon,
  Bottle,
  BottleIcon,
  Cup,
  CupIcon,
  Mug,
  MugIcon,
  Glass,
  GlassIcon,
  Wine,
  WineIcon,
  Beer,
  BeerIcon,
  Coffee as CoffeeIcon,
  CoffeeIcon as CoffeeIcon2,
  Tea,
  TeaIcon,
  Milk,
  MilkIcon,
  Water,
  WaterIcon,
  Juice,
  JuiceIcon,
  Soda,
  SodaIcon,
  Energy,
  EnergyIcon,
  Battery as BatteryIcon,
  BatteryIcon as BatteryIcon2,
  Plug as PlugIcon,
  PlugIcon as PlugIcon2,
  Charger,
  ChargerIcon,
  Power,
  PowerIcon,
  Electricity,
  ElectricityIcon,
  Lightbulb as LightbulbIcon,
  LightbulbIcon as LightbulbIcon2,
  Lamp,
  LampIcon,
  Flashlight,
  FlashlightIcon,
  Torch,
  TorchIcon,
  Candle,
  CandleIcon,
  Fire,
  FireIcon,
  Flame,
  FlameIcon,
  Sparkles,
  SparklesIcon,
  Star as StarIcon,
  StarIcon as StarIcon2,
  Star2,
  Star2Icon,
  Star3,
  Star3Icon,
  Star4,
  Star4Icon,
  Star5,
  Star5Icon,
  Star6,
  Star6Icon,
  Star7,
  Star7Icon,
  Star8,
  Star8Icon,
  Star9,
  Star9Icon,
  Star10,
  Star10Icon,
  Moon as MoonIcon,
  MoonIcon as MoonIcon2,
  Sun as SunIcon,
  SunIcon as SunIcon2,
  Sunrise as SunriseIcon,
  SunriseIcon as SunriseIcon2,
  Sunset as SunsetIcon,
  SunsetIcon as SunsetIcon2,
  Cloud as CloudIcon,
  CloudIcon as CloudIcon2,
  CloudRain as CloudRainIcon,
  CloudRainIcon as CloudRainIcon2,
  CloudSnow as CloudSnowIcon,
  CloudSnowIcon as CloudSnowIcon2,
  CloudLightning as CloudLightningIcon,
  CloudLightningIcon as CloudLightningIcon2,
  CloudDrizzle as CloudDrizzleIcon,
  CloudDrizzleIcon as CloudDrizzleIcon2,
  CloudHail as CloudHailIcon,
  CloudHailIcon as CloudHailIcon2,
  Wind as WindIcon,
  WindIcon as WindIcon2,
  Thermometer as ThermometerIcon,
  ThermometerIcon as ThermometerIcon2,
  Droplets as DropletsIcon,
  DropletsIcon as DropletsIcon2,
  Umbrella as UmbrellaIcon,
  UmbrellaIcon as UmbrellaIcon2,
  Snowflake as SnowflakeIcon,
  SnowflakeIcon as SnowflakeIcon2,
  TreePine as TreePineIcon,
  TreePineIcon as TreePineIcon2,
  TreeDeciduous as TreeDeciduousIcon,
  TreeDeciduousIcon as TreeDeciduousIcon2,
  Flower as FlowerIcon,
  FlowerIcon as FlowerIcon2,
  Flower2 as Flower2Icon,
  Flower2Icon as Flower2Icon2,
  Leaf as LeafIcon,
  LeafIcon as LeafIcon2,
  LeafyGreen as LeafyGreenIcon,
  LeafyGreenIcon as LeafyGreenIcon2,
  Sprout as SproutIcon,
  SproutIcon as SproutIcon2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface LocalBusinessIntegrationProps {
  className?: string;
}

interface LocalBusiness {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  rating: number;
  review_count: number;
  price_range: string;
  is_verified: boolean;
  is_featured: boolean;
  is_sponsored: boolean;
  hours: BusinessHours;
  services: string[];
  products: string[];
  images: string[];
  cover_image?: string;
  logo_url?: string;
  owner_id: string;
  owner_name: string;
  owner_avatar?: string;
  community_impact_score: number;
  local_supporters: number;
  total_visits: number;
  last_visit?: string;
  is_following?: boolean;
  is_bookmarked?: boolean;
  distance?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  payment_methods: string[];
  accessibility_features: string[];
  created_at: string;
  updated_at: string;
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

interface BusinessEvent {
  id: string;
  business_id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  max_attendees?: number;
  current_attendees: number;
  price?: number;
  is_public: boolean;
  is_featured: boolean;
  cover_image?: string;
  tags: string[];
  organizer_id: string;
  organizer_name: string;
  organizer_avatar?: string;
  is_attending?: boolean;
  created_at: string;
}

interface BusinessOffer {
  id: string;
  business_id: string;
  title: string;
  description: string;
  offer_type: string;
  discount_percentage?: number;
  discount_amount?: number;
  original_price?: number;
  discounted_price?: number;
  valid_from: string;
  valid_until: string;
  terms_conditions: string;
  is_active: boolean;
  is_featured: boolean;
  usage_limit?: number;
  used_count: number;
  min_purchase_amount?: number;
  applicable_services: string[];
  applicable_products: string[];
  cover_image?: string;
  is_claimed?: boolean;
  created_at: string;
}

interface BusinessReview {
  id: string;
  business_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title: string;
  content: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  is_helpful?: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
}

const LocalBusinessIntegration: React.FC<LocalBusinessIntegrationProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useLocation();
  
  const [activeTab, setActiveTab] = useState<'businesses' | 'events' | 'offers' | 'reviews'>('businesses');
  const [businesses, setBusinesses] = useState<LocalBusiness[]>([]);
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [offers, setOffers] = useState<BusinessOffer[]>([]);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<LocalBusiness | null>(null);
  const [showBusinessDialog, setShowBusinessDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterPriceRange, setFilterPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  // Load business data
  const loadBusinessData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load businesses
      const { data: businessesData, error: businessesError } = await supabase
        .from('local_businesses')
        .select(`
          *,
          profiles!local_businesses_owner_id_fkey(
            display_name,
            avatar_url
          ),
          business_events!inner(
            id,
            title,
            description,
            event_type,
            start_date,
            end_date,
            start_time,
            end_time,
            location,
            max_attendees,
            current_attendees,
            price,
            is_public,
            is_featured,
            cover_image,
            tags,
            organizer_id,
            organizer_name,
            organizer_avatar
          ),
          business_offers!inner(
            id,
            title,
            description,
            offer_type,
            discount_percentage,
            discount_amount,
            original_price,
            discounted_price,
            valid_from,
            valid_until,
            terms_conditions,
            is_active,
            is_featured,
            usage_limit,
            used_count,
            min_purchase_amount,
            applicable_services,
            applicable_products,
            cover_image
          ),
          business_reviews!inner(
            id,
            user_id,
            user_name,
            user_avatar,
            rating,
            title,
            content,
            is_verified_purchase,
            helpful_count,
            images,
            created_at,
            updated_at
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
        total_visits: Math.floor(Math.random() * 1000) + 50,
        distance: Math.floor(Math.random() * 30) + 1
      })) || [];

      setBusinesses(processedBusinesses);

      // Extract events, offers, and reviews
      const allEvents: BusinessEvent[] = [];
      const allOffers: BusinessOffer[] = [];
      const allReviews: BusinessReview[] = [];

      processedBusinesses.forEach(business => {
        if (business.business_events) {
          allEvents.push(...business.business_events.map(event => ({
            ...event,
            business_id: business.id,
            organizer_name: business.owner_name,
            organizer_avatar: business.owner_avatar
          })));
        }
        if (business.business_offers) {
          allOffers.push(...business.business_offers.map(offer => ({
            ...offer,
            business_id: business.id
          })));
        }
        if (business.business_reviews) {
          allReviews.push(...business.business_reviews.map(review => ({
            ...review,
            business_id: business.id
          })));
        }
      });

      setEvents(allEvents);
      setOffers(allOffers);
      setReviews(allReviews);

    } catch (error) {
      console.error('Error loading business data:', error);
      toast({
        title: "Error",
        description: "Failed to load business data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadBusinessData();
  }, [loadBusinessData]);

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

  const handleClaimOffer = async (offerId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to claim offers",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('offer_claims')
        .insert({
          offer_id: offerId,
          user_id: user.id,
          claimed_at: new Date().toISOString()
        });

      if (error) throw error;

      setOffers(prev => prev.map(offer => 
        offer.id === offerId 
          ? { 
              ...offer, 
              is_claimed: true,
              used_count: offer.used_count + 1
            }
          : offer
      ));

      toast({
        title: "Offer claimed",
        description: "You've successfully claimed this offer",
      });
    } catch (error) {
      console.error('Error claiming offer:', error);
      toast({
        title: "Error",
        description: "Failed to claim offer",
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

  const getFilteredData = () => {
    let data: Array<{ id: string; name: string; type: string; [key: string]: unknown }> = [];
    
    switch (activeTab) {
      case 'businesses':
        data = businesses;
        break;
      case 'events':
        data = events;
        break;
      case 'offers':
        data = offers;
        break;
      case 'reviews':
        data = reviews;
        break;
    }

    return data.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      
      const matchesLocation = filterLocation === 'all' || 
                             item.city?.toLowerCase().includes(filterLocation.toLowerCase()) ||
                             item.address?.toLowerCase().includes(filterLocation.toLowerCase());
      
      const matchesPrice = filterPriceRange === 'all' || 
                          item.price_range === filterPriceRange ||
                          (filterPriceRange === 'free' && (!item.price || item.price === 0));

      return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
    });
  };

  const getSortedData = () => {
    const data = getFilteredData();
    
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return a.distance - b.distance;
        case 'popularity':
          return b.local_supporters - a.local_supporters;
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  };

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('restaurant') || categoryLower.includes('food')) return Coffee;
    if (categoryLower.includes('retail') || categoryLower.includes('shop')) return ShoppingBag;
    if (categoryLower.includes('health') || categoryLower.includes('medical')) return Heart;
    if (categoryLower.includes('beauty') || categoryLower.includes('salon')) return Sparkles;
    if (categoryLower.includes('fitness') || categoryLower.includes('gym')) return Activity;
    if (categoryLower.includes('education') || categoryLower.includes('school')) return BookOpen;
    if (categoryLower.includes('automotive') || categoryLower.includes('car')) return Car;
    if (categoryLower.includes('home') || categoryLower.includes('garden')) return Home;
    if (categoryLower.includes('entertainment') || categoryLower.includes('music')) return Music;
    if (categoryLower.includes('professional') || categoryLower.includes('office')) return Building;
    return Store;
  };

  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('restaurant') || categoryLower.includes('food')) return 'bg-orange-100 text-orange-800';
    if (categoryLower.includes('retail') || categoryLower.includes('shop')) return 'bg-blue-100 text-blue-800';
    if (categoryLower.includes('health') || categoryLower.includes('medical')) return 'bg-red-100 text-red-800';
    if (categoryLower.includes('beauty') || categoryLower.includes('salon')) return 'bg-pink-100 text-pink-800';
    if (categoryLower.includes('fitness') || categoryLower.includes('gym')) return 'bg-green-100 text-green-800';
    if (categoryLower.includes('education') || categoryLower.includes('school')) return 'bg-yellow-100 text-yellow-800';
    if (categoryLower.includes('automotive') || categoryLower.includes('car')) return 'bg-gray-100 text-gray-800';
    if (categoryLower.includes('home') || categoryLower.includes('garden')) return 'bg-emerald-100 text-emerald-800';
    if (categoryLower.includes('entertainment') || categoryLower.includes('music')) return 'bg-purple-100 text-purple-800';
    if (categoryLower.includes('professional') || categoryLower.includes('office')) return 'bg-indigo-100 text-indigo-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatBusinessHours = (hours: BusinessHours) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.map(day => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours[day as keyof BusinessHours]}`).join(', ');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Local Business Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and support local businesses in your community
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location?.city || 'Your City'}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            {businesses.length} Businesses
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search businesses, events, offers, or reviews..."
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
            <SelectItem value="restaurant">Restaurants</SelectItem>
            <SelectItem value="retail">Retail & Shopping</SelectItem>
            <SelectItem value="health">Health & Medical</SelectItem>
            <SelectItem value="beauty">Beauty & Wellness</SelectItem>
            <SelectItem value="fitness">Fitness & Sports</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="automotive">Automotive</SelectItem>
            <SelectItem value="home">Home & Garden</SelectItem>
            <SelectItem value="entertainment">Entertainment</SelectItem>
            <SelectItem value="professional">Professional Services</SelectItem>
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
            <SelectItem value="$">$ - Budget</SelectItem>
            <SelectItem value="$$">$$ - Moderate</SelectItem>
            <SelectItem value="$$$">$$$ - Expensive</SelectItem>
            <SelectItem value="$$$$">$$$$ - Very Expensive</SelectItem>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort by</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'businesses' | 'events' | 'services' | 'analytics')}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="businesses" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Businesses
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Offers
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Reviews
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
                            <AvatarImage src={item.logo_url || item.cover_image || item.owner_avatar} />
                            <AvatarFallback>
                              {(item.name || item.title)?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">
                                {item.name || item.title}
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
                              {item.is_sponsored && (
                                <Badge variant="default" className="bg-purple-100 text-purple-800">
                                  <Award className="h-3 w-3 mr-1" />
                                  Sponsored
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {item.address || item.location || item.city} • {item.distance}km away
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {item.description?.substring(0, 120)}...
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
                        {item.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{item.rating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({item.review_count})</span>
                          </div>
                        )}
                        {item.local_supporters && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{item.local_supporters} supporters</span>
                          </div>
                        )}
                        {item.price_range && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{item.price_range}</span>
                          </div>
                        )}
                        {item.price && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">₹{item.price}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Special info based on type */}
                      {activeTab === 'events' && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(item.start_date), 'MMM dd')} at {item.start_time}</span>
                        </div>
                      )}
                      
                      {activeTab === 'offers' && item.discount_percentage && (
                        <div className="flex items-center gap-2 text-sm">
                          <Percent className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">{item.discount_percentage}% OFF</span>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBusiness(businesses.find(b => b.id === item.business_id) || null);
                              setShowBusinessDialog(true);
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
                            Contact
                          </Button>
                        </div>
                        
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            if (activeTab === 'businesses') handleFollowBusiness(item.id);
                            else if (activeTab === 'events') handleAttendEvent(item.id);
                            else if (activeTab === 'offers') handleClaimOffer(item.id);
                          }}
                          className="flex items-center gap-2"
                        >
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
                          {activeTab === 'offers' && (item.is_claimed ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Claimed
                            </>
                          ) : (
                            <>
                              <Tag className="h-4 w-4" />
                              Claim
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

      {/* Business Details Dialog */}
      <Dialog open={showBusinessDialog} onOpenChange={setShowBusinessDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedBusiness?.name}</DialogTitle>
            <DialogDescription>
              {selectedBusiness?.description}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6">
              {/* Business Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    {selectedBusiness?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedBusiness.phone}</span>
                      </div>
                    )}
                    {selectedBusiness?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{selectedBusiness.email}</span>
                      </div>
                    )}
                    {selectedBusiness?.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Location</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedBusiness?.address}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {selectedBusiness?.city}, {selectedBusiness?.state} {selectedBusiness?.postal_code}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Business Hours */}
              {selectedBusiness?.hours && (
                <div className="space-y-2">
                  <h4 className="font-medium">Business Hours</h4>
                  <div className="text-sm">
                    {formatBusinessHours(selectedBusiness.hours)}
                  </div>
                </div>
              )}
              
              {/* Services */}
              {selectedBusiness?.services && selectedBusiness.services.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBusiness.services.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Amenities */}
              {selectedBusiness?.amenities && selectedBusiness.amenities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBusiness.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBusinessDialog(false)}>
              Close
            </Button>
            <Button onClick={() => selectedBusiness && handleFollowBusiness(selectedBusiness.id)}>
              {selectedBusiness?.is_following ? 'Unfollow' : 'Follow'} Business
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocalBusinessIntegration;
