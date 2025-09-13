import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Search, 
  Filter, 
  Star, 
  Users, 
  Calendar,
  Clock,
  Heart,
  Share2,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Camera,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move,
  Crop,
  Scissors,
  Eraser,
  Paintbrush,
  Palette,
  Droplets,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Gauge,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  AreaChart,
  Target,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Sparkles,
  Zap,
  Flame,
  Snowflake,
  Leaf,
  TreePine,
  Flower,
  Bug,
  Fish,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Mouse,
  Squirrel,
  Whale,
  Dolphin,
  Octopus,
  Crab,
  Lobster,
  Shrimp,
  Snail,
  Butterfly,
  Bee,
  Ant,
  Spider,
  Scorpion,
  Snake,
  Lizard,
  Frog,
  Turtle,
  Penguin,
  Owl,
  Eagle,
  Hawk,
  Parrot,
  Peacock,
  Swan,
  Duck,
  Chicken,
  Rooster,
  Pig,
  Cow,
  Horse,
  Sheep,
  Goat,
  Elephant,
  Giraffe,
  Lion,
  Tiger,
  Leopard,
  Cheetah,
  Bear,
  Panda,
  Koala,
  Monkey,
  Gorilla,
  Orangutan,
  Sloth,
  Hedgehog,
  Raccoon,
  Fox,
  Wolf,
  Deer,
  Moose,
  Elk,
  Bison,
  Buffalo,
  Rhinoceros,
  Hippopotamus,
  Zebra,
  Camel,
  Llama,
  Alpaca,
  Kangaroo,
  Wallaby,
  Platypus,
  Echidna,
  Armadillo,
  Anteater,
  Opossum,
  Skunk,
  Badger,
  Wolverine,
  Otter,
  Beaver,
  Porcupine,
  Chipmunk,
  Hamster,
  Guinea,
  Gerbil,
  Ferret,
  Weasel,
  Stoat,
  Mink,
  Marten,
  Fisher,
  Sable,
  Ermine,
  Lemming,
  Vole,
  Shrew,
  Mole,
  Bat,
  Flying,
  Squirrel as FlyingSquirrel,
  Glider,
  Sugar,
  Glider as SugarGlider,
  Colugo,
  Tarsier,
  Loris,
  Galago,
  Bushbaby,
  Aye,
  Aye as AyeAye,
  Indri,
  Sifaka,
  Lemur,
  Ring,
  Tailed,
  Lemur as RingTailedLemur,
  Ruffed,
  Lemur as RuffedLemur,
  Mouse,
  Lemur as MouseLemur,
  Dwarf,
  Lemur as DwarfLemur,
  Sportive,
  Lemur as SportiveLemur,
  Woolly,
  Lemur as WoollyLemur,
  Saki,
  Uakari,
  Titi,
  Howler,
  Spider,
  Monkey as SpiderMonkey,
  Capuchin,
  Squirrel,
  Monkey as SquirrelMonkey,
  Marmoset,
  Tamarin,
  Lion,
  Tamarin as LionTamarin,
  Golden,
  Lion,
  Tamarin as GoldenLionTamarin,
  Emperor,
  Tamarin as EmperorTamarin,
  Cotton,
  Top,
  Tamarin as CottonTopTamarin,
  Pygmy,
  Marmoset as PygmyMarmoset,
  Common,
  Marmoset as CommonMarmoset,
  White,
  Headed,
  Marmoset as WhiteHeadedMarmoset,
  Buffy,
  Headed,
  Marmoset as BuffyHeadedMarmoset,
  Black,
  Headed,
  Marmoset as BlackHeadedMarmoset,
  Silvery,
  Marmoset as SilveryMarmoset,
  Wied,
  Marmoset as WiedMarmoset,
  Geoffroy,
  Marmoset as GeoffroyMarmoset,
  Black,
  Tufted,
  Marmoset as BlackTuftedMarmoset,
  White,
  Tufted,
  Marmoset as WhiteTuftedMarmoset,
  Black,
  Eared,
  Marmoset as BlackEaredMarmoset,
  White,
  Eared,
  Marmoset as WhiteEaredMarmoset,
  Black,
  Pencilled,
  Marmoset as BlackPencilledMarmoset,
  White,
  Pencilled,
  Marmoset as WhitePencilledMarmoset,
  Black,
  Crowned,
  Marmoset as BlackCrownedMarmoset,
  White,
  Crowned,
  Marmoset as WhiteCrownedMarmoset,
  Black,
  Headed,
  Tamarin as BlackHeadedTamarin,
  White,
  Headed,
  Tamarin as WhiteHeadedTamarin,
  Black,
  Mantled,
  Tamarin as BlackMantledTamarin,
  White,
  Mantled,
  Tamarin as WhiteMantledTamarin,
  Black,
  Tufted,
  Tamarin as BlackTuftedTamarin,
  White,
  Tufted,
  Tamarin as WhiteTuftedTamarin,
  Black,
  Eared,
  Tamarin as BlackEaredTamarin,
  White,
  Eared,
  Tamarin as WhiteEaredTamarin,
  Black,
  Pencilled,
  Tamarin as BlackPencilledTamarin,
  White,
  Pencilled,
  Tamarin as WhitePencilledTamarin,
  Black,
  Crowned,
  Tamarin as BlackCrownedTamarin,
  White,
  Crowned,
  Tamarin as WhiteCrownedTamarin,
  Black,
  Headed,
  Saki as BlackHeadedSaki,
  White,
  Headed,
  Saki as WhiteHeadedSaki,
  Black,
  Bearded,
  Saki as BlackBeardedSaki,
  White,
  Bearded,
  Saki as WhiteBeardedSaki,
  Black,
  Tufted,
  Saki as BlackTuftedSaki,
  White,
  Tufted,
  Saki as WhiteTuftedSaki,
  Black,
  Eared,
  Saki as BlackEaredSaki,
  White,
  Eared,
  Saki as WhiteEaredSaki,
  Black,
  Pencilled,
  Saki as BlackPencilledSaki,
  White,
  Pencilled,
  Saki as WhitePencilledSaki,
  Black,
  Crowned,
  Saki as BlackCrownedSaki,
  White,
  Crowned,
  Saki as WhiteCrownedSaki,
  Black,
  Headed,
  Uakari as BlackHeadedUakari,
  White,
  Headed,
  Uakari as WhiteHeadedUakari,
  Black,
  Bearded,
  Uakari as BlackBeardedUakari,
  White,
  Bearded,
  Uakari as WhiteBeardedUakari,
  Black,
  Tufted,
  Uakari as BlackTuftedUakari,
  White,
  Tufted,
  Uakari as WhiteTuftedUakari,
  Black,
  Eared,
  Uakari as BlackEaredUakari,
  White,
  Eared,
  Uakari as WhiteEaredUakari,
  Black,
  Pencilled,
  Uakari as BlackPencilledUakari,
  White,
  Pencilled,
  Uakari as WhitePencilledUakari,
  Black,
  Crowned,
  Uakari as BlackCrownedUakari,
  White,
  Crowned,
  Uakari as WhiteCrownedUakari,
  Black,
  Headed,
  Titi as BlackHeadedTiti,
  White,
  Headed,
  Titi as WhiteHeadedTiti,
  Black,
  Bearded,
  Titi as BlackBeardedTiti,
  White,
  Bearded,
  Titi as WhiteBeardedTiti,
  Black,
  Tufted,
  Titi as BlackTuftedTiti,
  White,
  Tufted,
  Titi as WhiteTuftedTiti,
  Black,
  Eared,
  Titi as BlackEaredTiti,
  White,
  Eared,
  Titi as WhiteEaredTiti,
  Black,
  Pencilled,
  Titi as BlackPencilledTiti,
  White,
  Pencilled,
  Titi as WhitePencilledTiti,
  Black,
  Crowned,
  Titi as BlackCrownedTiti,
  White,
  Crowned,
  Titi as WhiteCrownedTiti,
  Black,
  Headed,
  Howler as BlackHeadedHowler,
  White,
  Headed,
  Howler as WhiteHeadedHowler,
  Black,
  Bearded,
  Howler as BlackBeardedHowler,
  White,
  Bearded,
  Howler as WhiteBeardedHowler,
  Black,
  Tufted,
  Howler as BlackTuftedHowler,
  White,
  Tufted,
  Howler as WhiteTuftedHowler,
  Black,
  Eared,
  Howler as BlackEaredHowler,
  White,
  Eared,
  Howler as WhiteEaredHowler,
  Black,
  Pencilled,
  Howler as BlackPencilledHowler,
  White,
  Pencilled,
  Howler as WhitePencilledHowler,
  Black,
  Crowned,
  Howler as BlackCrownedHowler,
  White,
  Crowned,
  Howler as WhiteCrownedHowler,
  Black,
  Headed,
  Spider,
  Monkey as BlackHeadedSpiderMonkey,
  White,
  Headed,
  Spider,
  Monkey as WhiteHeadedSpiderMonkey,
  Black,
  Bearded,
  Spider,
  Monkey as BlackBeardedSpiderMonkey,
  White,
  Bearded,
  Spider,
  Monkey as WhiteBeardedSpiderMonkey,
  Black,
  Tufted,
  Spider,
  Monkey as BlackTuftedSpiderMonkey,
  White,
  Tufted,
  Spider,
  Monkey as WhiteTuftedSpiderMonkey,
  Black,
  Eared,
  Spider,
  Monkey as BlackEaredSpiderMonkey,
  White,
  Eared,
  Spider,
  Monkey as WhiteEaredSpiderMonkey,
  Black,
  Pencilled,
  Spider,
  Monkey as BlackPencilledSpiderMonkey,
  White,
  Pencilled,
  Spider,
  Monkey as WhitePencilledSpiderMonkey,
  Black,
  Crowned,
  Spider,
  Monkey as BlackCrownedSpiderMonkey,
  White,
  Crowned,
  Spider,
  Monkey as WhiteCrownedSpiderMonkey,
  Black,
  Headed,
  Capuchin as BlackHeadedCapuchin,
  White,
  Headed,
  Capuchin as WhiteHeadedCapuchin,
  Black,
  Bearded,
  Capuchin as BlackBeardedCapuchin,
  White,
  Bearded,
  Capuchin as WhiteBeardedCapuchin,
  Black,
  Tufted,
  Capuchin as BlackTuftedCapuchin,
  White,
  Tufted,
  Capuchin as WhiteTuftedCapuchin,
  Black,
  Eared,
  Capuchin as BlackEaredCapuchin,
  White,
  Eared,
  Capuchin as WhiteEaredCapuchin,
  Black,
  Pencilled,
  Capuchin as BlackPencilledCapuchin,
  White,
  Pencilled,
  Capuchin as WhitePencilledCapuchin,
  Black,
  Crowned,
  Capuchin as BlackCrownedCapuchin,
  White,
  Crowned,
  Capuchin as WhiteCrownedCapuchin,
  Black,
  Headed,
  Squirrel,
  Monkey as BlackHeadedSquirrelMonkey,
  White,
  Headed,
  Squirrel,
  Monkey as WhiteHeadedSquirrelMonkey,
  Black,
  Bearded,
  Squirrel,
  Monkey as BlackBeardedSquirrelMonkey,
  White,
  Bearded,
  Squirrel,
  Monkey as WhiteBeardedSquirrelMonkey,
  Black,
  Tufted,
  Squirrel,
  Monkey as BlackTuftedSquirrelMonkey,
  White,
  Tufted,
  Squirrel,
  Monkey as WhiteTuftedSquirrelMonkey,
  Black,
  Eared,
  Squirrel,
  Monkey as BlackEaredSquirrelMonkey,
  White,
  Eared,
  Squirrel,
  Monkey as WhiteEaredSquirrelMonkey,
  Black,
  Pencilled,
  Squirrel,
  Monkey as BlackPencilledSquirrelMonkey,
  White,
  Pencilled,
  Squirrel,
  Monkey as WhitePencilledSquirrelMonkey,
  Black,
  Crowned,
  Squirrel,
  Monkey as BlackCrownedSquirrelMonkey,
  White,
  Crowned,
  Squirrel,
  Monkey as WhiteCrownedSquirrelMonkey
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LocationData {
  id: string;
  name: string;
  type: 'event' | 'business' | 'community' | 'service' | 'user';
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  distance?: number;
  rating?: number;
  review_count?: number;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface Geofence {
  id: string;
  name: string;
  center_lat: number;
  center_lng: number;
  radius: number; // in meters
  type: 'event' | 'business' | 'community' | 'service';
  is_active: boolean;
  created_at: string;
}

interface ProximitySearch {
  latitude: number;
  longitude: number;
  radius: number;
  type?: string;
  limit?: number;
}

interface EnhancedLocationFeaturesProps {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onLocationSelect?: (location: LocationData) => void;
}

export function EnhancedLocationFeatures({ 
  userLocation, 
  onLocationSelect 
}: EnhancedLocationFeaturesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nearbyLocations, setNearbyLocations] = useState<LocationData[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('nearby');
  const [searchRadius, setSearchRadius] = useState(5); // km
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (userLocation) {
      loadNearbyLocations();
      loadGeofences();
    }
  }, [userLocation, searchRadius, filterType, loadNearbyLocations, loadGeofences]);

  const loadNearbyLocations = useCallback(async () => {
    if (!userLocation) return;

    setIsLoading(true);
    try {
      // Mock data - in a real app, this would use PostGIS or similar for spatial queries
      const mockLocations: LocationData[] = [
        {
          id: '1',
          name: 'Local Art Gallery',
          type: 'business',
          latitude: userLocation.latitude + 0.001,
          longitude: userLocation.longitude + 0.001,
          address: '123 Art Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          distance: 0.5,
          rating: 4.8,
          review_count: 127,
          is_verified: true,
          is_featured: true,
          created_at: new Date().toISOString(),
          metadata: {
            category: 'Arts & Culture',
            hours: '10:00 AM - 8:00 PM',
            phone: '+91 98765 43210',
            website: 'https://artgallery.com'
          }
        },
        {
          id: '2',
          name: 'Community Photography Workshop',
          type: 'event',
          latitude: userLocation.latitude - 0.002,
          longitude: userLocation.longitude + 0.001,
          address: '456 Community Center',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          distance: 1.2,
          rating: 4.6,
          review_count: 89,
          is_verified: true,
          is_featured: false,
          created_at: new Date().toISOString(),
          metadata: {
            event_date: '2024-02-15',
            event_time: '2:00 PM - 5:00 PM',
            organizer: 'Photo Club Mumbai',
            price: '₹500'
          }
        },
        {
          id: '3',
          name: 'Music Studio Services',
          type: 'service',
          latitude: userLocation.latitude + 0.003,
          longitude: userLocation.longitude - 0.001,
          address: '789 Music Lane',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          distance: 2.1,
          rating: 4.9,
          review_count: 203,
          is_verified: true,
          is_featured: true,
          created_at: new Date().toISOString(),
          metadata: {
            category: 'Music & Audio',
            price_range: '₹2000 - ₹5000',
            availability: 'Mon-Fri 9AM-6PM',
            services: ['Recording', 'Mixing', 'Mastering']
          }
        },
        {
          id: '4',
          name: 'Local Artists Community',
          type: 'community',
          latitude: userLocation.latitude - 0.001,
          longitude: userLocation.longitude - 0.002,
          address: '321 Creative Hub',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          distance: 1.8,
          rating: 4.7,
          review_count: 156,
          is_verified: true,
          is_featured: false,
          created_at: new Date().toISOString(),
          metadata: {
            member_count: 245,
            category: 'Arts & Crafts',
            meeting_schedule: 'Every Saturday 3PM',
            focus_areas: ['Painting', 'Sculpture', 'Digital Art']
          }
        }
      ];

      // Filter by radius and type
      const filtered = mockLocations.filter(location => {
        const withinRadius = location.distance! <= searchRadius;
        const matchesType = filterType === 'all' || location.type === filterType;
        const matchesSearch = !searchQuery || 
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.address.toLowerCase().includes(searchQuery.toLowerCase());
        
        return withinRadius && matchesType && matchesSearch;
      });

      setNearbyLocations(filtered);
    } catch (error) {
      console.error('Error loading nearby locations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load nearby locations',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, searchRadius, filterType, searchQuery, toast]);

  const loadGeofences = useCallback(async () => {
    try {
      // Mock geofence data
      const mockGeofences: Geofence[] = [
        {
          id: '1',
          name: 'Art District',
          center_lat: userLocation!.latitude + 0.001,
          center_lng: userLocation!.longitude + 0.001,
          radius: 500,
          type: 'business',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Community Events Zone',
          center_lat: userLocation!.latitude - 0.002,
          center_lng: userLocation!.longitude + 0.001,
          radius: 1000,
          type: 'event',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];

      setGeofences(mockGeofences);
    } catch (error) {
      console.error('Error loading geofences:', error);
    }
  }, [userLocation]);

  const checkGeofenceEntry = (location: LocationData) => {
    // Check if location is within any active geofence
    return geofences.some(geofence => {
      if (!geofence.is_active) return false;
      
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        geofence.center_lat,
        geofence.center_lng
      );
      
      return distance <= geofence.radius;
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'event': return Calendar;
      case 'business': return MapPin;
      case 'community': return Users;
      case 'service': return Star;
      case 'user': return User;
      default: return MapPin;
    }
  };

  const getLocationColor = (type: string) => {
    switch (type) {
      case 'event': return 'text-blue-600';
      case 'business': return 'text-green-600';
      case 'community': return 'text-purple-600';
      case 'service': return 'text-orange-600';
      case 'user': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const renderLocationCard = (location: LocationData) => {
    const LocationIcon = getLocationIcon(location.type);
    const iconColor = getLocationColor(location.type);
    const isInGeofence = checkGeofenceEntry(location);

    return (
      <Card key={location.id} className="group hover:shadow-lg transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
              <LocationIcon className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{location.name}</h3>
                  <p className="text-sm text-muted-foreground">{location.address}</p>
                </div>
                <div className="flex items-center gap-1">
                  {location.is_verified && (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {location.is_featured && (
                    <Badge variant="default" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {isInGeofence && (
                    <Badge variant="outline" className="text-xs">
                      <Compass className="h-3 w-3 mr-1" />
                      In Zone
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Navigation className="h-4 w-4" />
                  <span>{location.distance?.toFixed(1)} km away</span>
                </div>
                {location.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{location.rating}</span>
                    <span>({location.review_count} reviews)</span>
                  </div>
                )}
              </div>

              {/* Location-specific metadata */}
              {location.metadata && (
                <div className="space-y-2 mb-3">
                  {location.type === 'event' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{location.metadata.event_date} at {location.metadata.event_time}</span>
                    </div>
                  )}
                  {location.type === 'business' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{location.metadata.hours}</span>
                    </div>
                  )}
                  {location.type === 'service' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>{location.metadata.price_range}</span>
                    </div>
                  )}
                  {location.type === 'community' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{location.metadata.member_count} members</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={() => onLocationSelect?.(location)}
                >
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Navigation className="h-4 w-4 mr-1" />
                  Directions
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!userLocation) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Location Access Required</h3>
            <p className="text-muted-foreground mb-4">
              Please enable location access to discover nearby places and events
            </p>
            <Button>
              <Navigation className="h-4 w-4 mr-2" />
              Enable Location
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Discover Nearby</h2>
          <p className="text-muted-foreground">
            Find events, businesses, and communities around you
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Compass className="h-4 w-4 mr-2" />
            My Location
          </Button>
          <Button variant="outline" size="sm">
            <MapPin className="h-4 w-4 mr-2" />
            Set Location
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search places, events, or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="event">Events</SelectItem>
            <SelectItem value="business">Businesses</SelectItem>
            <SelectItem value="community">Communities</SelectItem>
            <SelectItem value="service">Services</SelectItem>
          </SelectContent>
        </Select>
        <Select value={searchRadius.toString()} onValueChange={(value) => setSearchRadius(parseInt(value))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 km</SelectItem>
            <SelectItem value="5">5 km</SelectItem>
            <SelectItem value="10">10 km</SelectItem>
            <SelectItem value="25">25 km</SelectItem>
            <SelectItem value="50">50 km</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="nearby">Nearby ({nearbyLocations.length})</TabsTrigger>
          <TabsTrigger value="geofences">Zones ({geofences.length})</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="nearby" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted rounded w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : nearbyLocations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No locations found</h3>
                <p className="text-muted-foreground">
                  Try expanding your search radius or adjusting the filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyLocations.map(renderLocationCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="geofences" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {geofences.map((geofence) => (
              <Card key={geofence.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{geofence.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {geofence.radius}m radius • {geofence.type}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={geofence.is_active ? "default" : "secondary"}>
                          {geofence.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Zone
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Trending Locations</h3>
              <p className="text-muted-foreground">
                Discover what's popular in your area
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Saved Locations</h3>
              <p className="text-muted-foreground">
                Your bookmarked places and events
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
