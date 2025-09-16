import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ServiceListingCard } from '@/components/ServiceListingCard';
import { ServiceCreationForm } from '@/components/ServiceCreationForm';
import { ServiceBookingSystem } from '@/components/ServiceBookingSystem';
import { 
  Search, 
  Plus, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  TrendingUp,
  Users,
  Award,
  Shield,
  Clock,
  MapPin,
  DollarSign,
  Music,
  Camera,
  Palette,
  Mic,
  Video,
  BookOpen,
  Heart,
  Share2,
  MessageCircle,
  Calendar,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ServiceProvider {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url?: string;
  location_city: string;
  location_state: string;
  is_verified: boolean;
  is_premium: boolean;
  rating: number;
  review_count: number;
  response_time: string;
  completion_rate: number;
}

interface ServiceListing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string;
  duration: string;
  location_type: 'remote' | 'on-site' | 'both';
  availability_schedule: Record<string, unknown>;
  is_active: boolean;
  max_bookings_per_day: number;
  requires_approval: boolean;
  cancellation_policy: string;
  tags: string[];
  images: string[];
  created_at: string;
  updated_at: string;
  provider: ServiceProvider;
  booking_count: number;
  average_rating: number;
  is_featured: boolean;
}

const serviceCategories = [
  { value: 'all', label: 'All Categories', icon: <Award className="h-4 w-4" /> },
  { value: 'music', label: 'Music & Audio', icon: <Music className="h-4 w-4" /> },
  { value: 'photography', label: 'Photography', icon: <Camera className="h-4 w-4" /> },
  { value: 'art', label: 'Art & Design', icon: <Palette className="h-4 w-4" /> },
  { value: 'voice', label: 'Voice & Audio', icon: <Mic className="h-4 w-4" /> },
  { value: 'video', label: 'Video Production', icon: <Video className="h-4 w-4" /> },
  { value: 'education', label: 'Education & Training', icon: <BookOpen className="h-4 w-4" /> }
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' }
];

const EnhancedArtistMarketplace = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Load services
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      
      // For now, we'll use mock data since the services table is empty
      const mockServices: ServiceListing[] = [
        {
          id: '1',
          user_id: 'user1',
          title: 'Professional Wedding Photography',
          description: 'Capture your special day with stunning photography. 8+ years experience, 200+ weddings completed.',
          price: 25000,
          currency: 'INR',
          category: 'photography',
          subcategory: 'Wedding',
          duration: '8 hours',
          location_type: 'on-site',
          availability_schedule: {},
          is_active: true,
          max_bookings_per_day: 2,
          requires_approval: false,
          cancellation_policy: 'Free cancellation up to 48 hours before service',
          tags: ['wedding', 'photography', 'professional'],
          images: ['https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=400&fit=crop'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          provider: {
            id: 'provider1',
            user_id: 'user1',
            display_name: 'Sarah Johnson',
            bio: 'Professional photographer with 8+ years experience',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
            location_city: 'Mumbai',
            location_state: 'Maharashtra',
            is_verified: true,
            is_premium: true,
            rating: 4.9,
            review_count: 127,
            response_time: '2 hours',
            completion_rate: 98
          },
          booking_count: 45,
          average_rating: 4.9,
          is_featured: true
        },
        {
          id: '2',
          user_id: 'user2',
          title: 'Live Music Performance',
          description: 'Professional musician available for events, parties, and special occasions. Guitar, vocals, and keyboard.',
          price: 15000,
          currency: 'INR',
          category: 'music',
          subcategory: 'Live Performance',
          duration: '4 hours',
          location_type: 'on-site',
          availability_schedule: {},
          is_active: true,
          max_bookings_per_day: 3,
          requires_approval: true,
          cancellation_policy: 'Free cancellation up to 24 hours before service',
          tags: ['music', 'live', 'performance', 'guitar'],
          images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          provider: {
            id: 'provider2',
            user_id: 'user2',
            display_name: 'Mike Chen',
            bio: 'Professional musician and performer',
            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            location_city: 'Delhi',
            location_state: 'Delhi',
            is_verified: true,
            is_premium: false,
            rating: 4.7,
            review_count: 89,
            response_time: '1 hour',
            completion_rate: 95
          },
          booking_count: 32,
          average_rating: 4.7,
          is_featured: false
        },
        {
          id: '3',
          user_id: 'user3',
          title: 'Digital Art Commission',
          description: 'Custom digital artwork for any purpose. Portraits, illustrations, logos, and more.',
          price: 5000,
          currency: 'INR',
          category: 'art',
          subcategory: 'Digital Art',
          duration: '3 days',
          location_type: 'remote',
          availability_schedule: {},
          is_active: true,
          max_bookings_per_day: 5,
          requires_approval: false,
          cancellation_policy: 'Free cancellation up to 1 week before service',
          tags: ['digital', 'art', 'illustration', 'custom'],
          images: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          provider: {
            id: 'provider3',
            user_id: 'user3',
            display_name: 'Alex Rivera',
            bio: 'Digital artist and illustrator',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            location_city: 'Bangalore',
            location_state: 'Karnataka',
            is_verified: false,
            is_premium: false,
            rating: 4.5,
            review_count: 56,
            response_time: '4 hours',
            completion_rate: 92
          },
          booking_count: 28,
          average_rating: 4.5,
          is_featured: false
        }
      ];

      // Filter by category
      let filteredServices = mockServices;
      if (selectedCategory !== 'all') {
        filteredServices = mockServices.filter(service => service.category === selectedCategory);
      }

      // Sort services
      filteredServices.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          case 'rating':
            return b.average_rating - a.average_rating;
          case 'popular':
            return b.booking_count - a.booking_count;
          default:
            return 0;
        }
      });

      setServices(filteredServices);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy, toast]);

  const handleServiceCreate = async (serviceData: ServiceListing) => {
    try {
      // Here you would typically save to the database
      console.log('Creating service:', serviceData);
      
      toast({
        title: "Service Created",
        description: "Your service listing has been created successfully.",
      });
      
      setShowCreateForm(false);
      loadServices(); // Refresh the list
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleServiceBook = async (bookingData: unknown) => {
    try {
      // Here you would typically save the booking to the database
      console.log('Booking service:', bookingData);
      
      toast({
        title: "Booking Request Sent",
        description: "Your booking request has been submitted to the provider.",
      });
      
      setShowBookingModal(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error booking service:', error);
      toast({
        title: "Error",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Artist Marketplace</h1>
            <p className="text-muted-foreground mt-2">
              Discover and book talented local artists and service providers
            </p>
          </div>
          {user && (
            <Button 
              className="btn-event" 
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Service
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services, artists, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid/List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Available Services ({filteredServices.length})
            </h2>
          </div>
          
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredServices.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceListingCard
                    key={service.id}
                    service={service}
                    onBook={(serviceId) => {
                      const service = filteredServices.find(s => s.id === serviceId);
                      if (service) {
                        setSelectedService(service);
                        setShowBookingModal(true);
                      }
                    }}
                    onLike={(serviceId) => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Service liking functionality will be available soon!",
                      });
                    }}
                    onShare={(serviceId) => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Service sharing functionality will be available soon!",
                      });
                    }}
                    onContact={(serviceId, providerId) => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Contact functionality will be available soon!",
                      });
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredServices.map((service) => (
                  <ServiceListingCard
                    key={service.id}
                    service={service}
                    compact={true}
                    onBook={(serviceId) => {
                      const service = filteredServices.find(s => s.id === serviceId);
                      if (service) {
                        setSelectedService(service);
                        setShowBookingModal(true);
                      }
                    }}
                    onLike={(serviceId) => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Service liking functionality will be available soon!",
                      });
                    }}
                    onShare={(serviceId) => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Service sharing functionality will be available soon!",
                      });
                    }}
                    onContact={(serviceId, providerId) => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Contact functionality will be available soon!",
                      });
                    }}
                  />
                ))}
              </div>
            )
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== 'all' 
                    ? "No services match your search criteria." 
                    : "There are no services available at the moment."}
                </p>
                {user && (
                  <Button 
                    className="btn-event"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Service
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </section>

        {/* Create Service Modal */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Service Listing</DialogTitle>
              <DialogDescription>
                Create a professional service listing to attract clients
              </DialogDescription>
            </DialogHeader>
            <ServiceCreationForm
              onSubmit={handleServiceCreate}
              onCancel={() => setShowCreateForm(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Booking Modal */}
        <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book Service</DialogTitle>
              <DialogDescription>
                Complete your booking request for {selectedService?.title}
              </DialogDescription>
            </DialogHeader>
            {selectedService && (
              <ServiceBookingSystem
                serviceId={selectedService.id}
                serviceTitle={selectedService.title}
                servicePrice={selectedService.price}
                serviceCurrency={selectedService.currency}
                serviceDuration={selectedService.duration}
                serviceLocationType={selectedService.location_type}
                providerId={selectedService.provider.id}
                providerName={selectedService.provider.display_name}
                onBookingSubmit={handleServiceBook}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ResponsiveLayout>
  );
};

export default EnhancedArtistMarketplace;
