import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Heart,
  Share2,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  SortAsc,
  SortDesc,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Check,
  Award,
  Shield,
  Zap,
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Camera,
  Music,
  Palette,
  Code,
  Briefcase,
  GraduationCap,
  Dumbbell,
  Utensils,
  Car,
  Home,
  Wrench,
  Scissors,
  Stethoscope,
  Scale,
  Calculator,
  BookOpen,
  Mic,
  Video,
  Image as ImageIcon,
  FileText,
  Download,
  Upload,
  Link,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  MoreHorizontal,
  Settings,
  HelpCircle,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  User,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Users as UsersIcon,
  UserCog,
  UserEdit,
  UserSearch,
  UserCheck as UserCheckIcon,
  UserX as UserXIcon,
  UserPlus as UserPlusIcon,
  UserMinus as UserMinusIcon,
  Users as UsersIcon2,
  UserCog as UserCogIcon,
  UserEdit as UserEditIcon,
  UserSearch as UserSearchIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Service {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string;
  tags: string[];
  location_city?: string;
  location_state?: string;
  location_country?: string;
  is_active: boolean;
  is_featured: boolean;
  is_verified: boolean;
  rating: number;
  review_count: number;
  booking_count: number;
  created_at: string;
  updated_at: string;
  provider: {
    id: string;
    display_name: string;
    avatar_url?: string;
    is_verified: boolean;
    is_premium: boolean;
    location_city?: string;
    location_state?: string;
    response_time?: string;
    completion_rate?: number;
  };
  images?: string[];
  availability?: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
    timezone: string;
  };
  requirements?: string[];
  deliverables?: string[];
  cancellation_policy?: string;
  response_time?: string;
  completion_rate?: number;
}

interface FilterOptions {
  category: string;
  subcategory: string;
  priceRange: [number, number];
  location: string;
  rating: number;
  availability: string[];
  features: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ServiceBrowserProps {
  onServiceSelect?: (service: Service) => void;
  showFilters?: boolean;
  limit?: number;
}

export function EnhancedServiceBrowser({ 
  onServiceSelect, 
  showFilters = true, 
  limit = 20 
}: ServiceBrowserProps) {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    subcategory: 'all',
    priceRange: [0, 10000],
    location: 'all',
    rating: 0,
    availability: [],
    features: [],
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  const categories = [
    { value: 'all', label: 'All Categories', icon: Grid },
    { value: 'photography', label: 'Photography', icon: Camera },
    { value: 'music', label: 'Music & Audio', icon: Music },
    { value: 'design', label: 'Design & Art', icon: Palette },
    { value: 'development', label: 'Development', icon: Code },
    { value: 'writing', label: 'Writing & Content', icon: FileText },
    { value: 'business', label: 'Business & Consulting', icon: Briefcase },
    { value: 'education', label: 'Education & Training', icon: GraduationCap },
    { value: 'fitness', label: 'Health & Fitness', icon: Dumbbell },
    { value: 'food', label: 'Food & Catering', icon: Utensils },
    { value: 'transport', label: 'Transportation', icon: Car },
    { value: 'home', label: 'Home & Garden', icon: Home },
    { value: 'automotive', label: 'Automotive', icon: Wrench },
    { value: 'beauty', label: 'Beauty & Wellness', icon: Scissors },
    { value: 'healthcare', label: 'Healthcare', icon: Stethoscope },
    { value: 'legal', label: 'Legal Services', icon: Scale },
    { value: 'accounting', label: 'Accounting & Finance', icon: Calculator },
    { value: 'other', label: 'Other Services', icon: MoreHorizontal }
  ];

  const features = [
    { value: 'verified', label: 'Verified Provider', icon: Shield },
    { value: 'featured', label: 'Featured Service', icon: Award },
    { value: 'instant', label: 'Instant Booking', icon: Zap },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'new', label: 'New Provider', icon: UserPlus },
    { value: 'premium', label: 'Premium Service', icon: Crown }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'distance', label: 'Nearest First' }
  ];

  useEffect(() => {
    loadServices();
    loadFavorites();
  }, [loadServices, loadFavorites]);

  useEffect(() => {
    applyFilters();
  }, [services, searchQuery, filters, applyFilters]);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles!services_user_id_fkey(
            id,
            display_name,
            avatar_url,
            is_verified,
            is_premium,
            location_city,
            location_state
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedServices: Service[] = (data || []).map(service => ({
        id: service.id,
        user_id: service.user_id,
        title: service.title,
        description: service.description,
        price: service.price,
        currency: service.currency,
        category: service.category,
        subcategory: service.subcategory,
        tags: service.tags || [],
        location_city: service.profiles?.location_city,
        location_state: service.profiles?.location_state,
        location_country: service.profiles?.location_country,
        is_active: service.is_active,
        is_featured: service.is_featured,
        is_verified: service.profiles?.is_verified || false,
        rating: 4.5, // Mock rating - would come from reviews table
        review_count: Math.floor(Math.random() * 50) + 5,
        booking_count: Math.floor(Math.random() * 100) + 10,
        created_at: service.created_at,
        updated_at: service.updated_at,
        provider: {
          id: service.profiles?.id,
          display_name: service.profiles?.display_name || 'Unknown',
          avatar_url: service.profiles?.avatar_url,
          is_verified: service.profiles?.is_verified || false,
          is_premium: service.profiles?.is_premium || false,
          location_city: service.profiles?.location_city,
          location_state: service.profiles?.location_state,
          response_time: '2 hours',
          completion_rate: 98
        },
        images: service.images || [],
        availability: service.availability,
        requirements: service.requirements || [],
        deliverables: service.deliverables || [],
        cancellation_policy: service.cancellation_policy,
        response_time: '2 hours',
        completion_rate: 98
      }));

      setServices(formattedServices);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('service_favorites')
        .select('service_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const favoriteIds = new Set(data?.map(fav => fav.service_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, [user]);

  const applyFilters = useCallback(() => {
    let filtered = [...services];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.tags.some(tag => tag.toLowerCase().includes(query)) ||
        service.provider.display_name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(service => service.category === filters.category);
    }

    // Subcategory filter
    if (filters.subcategory !== 'all') {
      filtered = filtered.filter(service => service.subcategory === filters.subcategory);
    }

    // Price range filter
    filtered = filtered.filter(service => 
      service.price >= filters.priceRange[0] && service.price <= filters.priceRange[1]
    );

    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(service => 
        service.location_city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        service.location_state?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(service => service.rating >= filters.rating);
    }

    // Features filter
    if (filters.features.length > 0) {
      filtered = filtered.filter(service => {
        return filters.features.every(feature => {
          switch (feature) {
            case 'verified': return service.is_verified;
            case 'featured': return service.is_featured;
            case 'instant': return service.availability?.days?.length > 0;
            case 'trending': return service.booking_count > 50;
            case 'new': return new Date(service.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            case 'premium': return service.provider.is_premium;
            default: return true;
          }
        });
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'price_low':
          comparison = a.price - b.price;
          break;
        case 'price_high':
          comparison = b.price - a.price;
          break;
        case 'newest':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'popular':
          comparison = b.booking_count - a.booking_count;
          break;
        case 'distance':
          // Mock distance calculation
          comparison = Math.random() - 0.5;
          break;
        default: // relevance
          comparison = (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) ||
                      b.rating - a.rating ||
                      b.booking_count - a.booking_count;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredServices(filtered);
  }, [services, searchQuery, filters]);

  const toggleFavorite = async (serviceId: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    try {
      const isFavorited = favorites.has(serviceId);
      
      if (isFavorited) {
        await supabase
          .from('service_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('service_id', serviceId);
        
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(serviceId);
          return newSet;
        });
        toast.success('Removed from favorites');
      } else {
        await supabase
          .from('service_favorites')
          .insert({
            user_id: user.id,
            service_id: serviceId
          });
        
        setFavorites(prev => new Set([...prev, serviceId]));
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.value === category);
    return categoryData?.icon || Grid;
  };

  const renderServiceCard = (service: Service) => {
    const CategoryIcon = getCategoryIcon(service.category);
    const isFavorited = favorites.has(service.id);

    return (
      <Card key={service.id} className="group hover:shadow-lg transition-all duration-200">
        <CardContent className="p-0">
          {/* Service Image */}
          <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
            {service.images && service.images.length > 0 ? (
              <img
                src={service.images[0]}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CategoryIcon className="h-16 w-16 text-purple-400" />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {service.is_featured && (
                <Badge className="bg-yellow-500 text-white">
                  <Award className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {service.is_verified && (
                <Badge className="bg-green-500 text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-3 right-3 bg-white/80 hover:bg-white"
              onClick={() => toggleFavorite(service.id)}
            >
              {isFavorited ? (
                <BookmarkCheck className="h-4 w-4 text-red-500" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Service Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{service.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{service.description}</p>
              </div>
            </div>

            {/* Provider Info */}
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={service.provider.avatar_url} />
                <AvatarFallback className="text-xs">
                  {service.provider.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{service.provider.display_name}</span>
              {service.provider.is_verified && (
                <Shield className="h-3 w-3 text-green-500" />
              )}
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{service.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">({service.review_count} reviews)</span>
              <div className="flex items-center gap-1 ml-auto">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{service.booking_count} bookings</span>
              </div>
            </div>

            {/* Price and Location */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-bold text-lg">₹{service.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{service.location_city}, {service.location_state}</span>
              </div>
            </div>

            {/* Tags */}
            {service.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {service.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {service.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{service.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={() => onServiceSelect?.(service)}
              >
                View Details
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderServiceListItem = (service: Service) => {
    const CategoryIcon = getCategoryIcon(service.category);
    const isFavorited = favorites.has(service.id);

    return (
      <Card key={service.id} className="group hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Service Image */}
            <div className="relative w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden flex-shrink-0">
              {service.images && service.images.length > 0 ? (
                <img
                  src={service.images[0]}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CategoryIcon className="h-8 w-8 text-purple-400" />
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg line-clamp-1">{service.title}</h3>
                    {service.is_featured && (
                      <Badge className="bg-yellow-500 text-white text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {service.is_verified && (
                      <Badge className="bg-green-500 text-white text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{service.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(service.id)}
                >
                  {isFavorited ? (
                    <BookmarkCheck className="h-4 w-4 text-red-500" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Provider and Rating */}
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={service.provider.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {service.provider.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{service.provider.display_name}</span>
                  {service.provider.is_verified && (
                    <Shield className="h-3 w-3 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{service.rating}</span>
                  <span className="text-sm text-muted-foreground">({service.review_count})</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{service.location_city}, {service.location_state}</span>
                </div>
              </div>

              {/* Tags */}
              {service.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {service.tags.slice(0, 5).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-bold text-lg">₹{service.price.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => onServiceSelect?.(service)}
                  >
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Browse Services</h2>
            <p className="text-muted-foreground">Discover amazing services from talented providers</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-0">
                <div className="h-48 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Browse Services</h2>
          <p className="text-muted-foreground">
            Discover amazing services from talented providers • {filteredServices.length} services found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services, providers, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {showFilters && (
          <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Filter Services</DialogTitle>
                <DialogDescription>
                  Refine your search to find the perfect service
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="h-4 w-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                  </label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                  <Select value={filters.rating.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any Rating</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Features */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Features</label>
                  <div className="grid grid-cols-2 gap-2">
                    {features.map((feature) => (
                      <div key={feature.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature.value}
                          checked={filters.features.includes(feature.value)}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              features: checked
                                ? [...prev.features, feature.value]
                                : prev.features.filter(f => f !== feature.value)
                            }));
                          }}
                        />
                        <label htmlFor={feature.value} className="text-sm flex items-center gap-2">
                          <feature.icon className="h-4 w-4" />
                          {feature.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Results */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No services found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all categories
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setFilters({
                category: 'all',
                subcategory: 'all',
                priceRange: [0, 10000],
                location: 'all',
                rating: 0,
                availability: [],
                features: [],
                sortBy: 'relevance',
                sortOrder: 'desc'
              });
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredServices.map(service => 
            viewMode === 'grid' ? renderServiceCard(service) : renderServiceListItem(service)
          )}
        </div>
      )}
    </div>
  );
}
