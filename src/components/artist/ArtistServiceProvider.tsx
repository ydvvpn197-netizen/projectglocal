// Artist/Service Provider System for Project Glocal
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Star, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Heart, 
  Calendar, 
  Users,
  Award,
  Shield,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  DollarSign,
  BookOpen,
  Camera,
  Music,
  Paintbrush,
  Code,
  Wrench,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSecurity } from '@/hooks/useSecurity';

interface ArtistServiceProviderProps {
  className?: string;
  onServiceAction?: (action: string, data: Record<string, string | number | boolean>) => void;
}

interface ArtistProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatar: string;
  skills: string[];
  hourlyRate: {
    min: number;
    max: number;
  };
  portfolio: {
    images: string[];
    videos: string[];
    links: string[];
  };
  location: {
    city: string;
    state: string;
    country: string;
  };
  experience: {
    years: number;
    projects: number;
    clients: number;
  };
  rating: {
    average: number;
    count: number;
  };
  availability: {
    isAvailable: boolean;
    schedule: string[];
  };
  verification: {
    isVerified: boolean;
    documents: string[];
  };
  pricing: {
    type: 'hourly' | 'project' | 'package';
    rates: {
      hourly: number;
      project: number;
      package: number;
    };
  };
  services: Service[];
  createdAt: string;
  lastActive: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  isActive: boolean;
  tags: string[];
  requirements: string[];
  deliverables: string[];
}

interface Booking {
  id: string;
  serviceId: string;
  clientId: string;
  artistId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}

export const ArtistServiceProvider: React.FC<ArtistServiceProviderProps> = React.memo(({ 
  className,
  onServiceAction 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sanitizeText, validateInput } = useSecurity();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    skills: [] as string[],
    hourlyRateMin: '',
    hourlyRateMax: '',
    experience: '',
    location: {
      city: '',
      state: '',
      country: ''
    }
  });

  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    tags: [] as string[],
    requirements: [] as string[],
    deliverables: [] as string[]
  });

  const [bookingForm, setBookingForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    budget: ''
  });

  // Mock data - in production, this would come from Supabase
  const [artistProfile, setArtistProfile] = useState<ArtistProfile>({
    id: 'artist_1',
    userId: user?.id || 'user_1',
    displayName: 'Creative Artist',
    bio: 'Professional artist with 5+ years of experience in digital art and illustration',
    avatar: '',
    skills: ['Digital Art', 'Illustration', 'Graphic Design', 'UI/UX Design'],
    hourlyRate: {
      min: 25,
      max: 50
    },
    portfolio: {
      images: ['image1.jpg', 'image2.jpg'],
      videos: ['video1.mp4'],
      links: ['https://portfolio.example.com']
    },
    location: {
      city: 'Delhi',
      state: 'Delhi',
      country: 'India'
    },
    experience: {
      years: 5,
      projects: 150,
      clients: 75
    },
    rating: {
      average: 4.8,
      count: 45
    },
    availability: {
      isAvailable: true,
      schedule: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    verification: {
      isVerified: true,
      documents: ['id_proof.pdf', 'portfolio.pdf']
    },
    pricing: {
      type: 'hourly',
      rates: {
        hourly: 35,
        project: 500,
        package: 2000
      }
    },
    services: [],
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString()
  });

  const [services, setServices] = useState<Service[]>([
    {
      id: 'service_1',
      title: 'Digital Portrait',
      description: 'Custom digital portrait from your photo',
      category: 'Digital Art',
      price: 150,
      duration: '3-5 days',
      isActive: true,
      tags: ['portrait', 'digital', 'custom'],
      requirements: ['High-quality photo', 'Specific style preferences'],
      deliverables: ['High-res digital file', 'Print-ready version']
    },
    {
      id: 'service_2',
      title: 'Logo Design',
      description: 'Professional logo design for your business',
      category: 'Graphic Design',
      price: 300,
      duration: '5-7 days',
      isActive: true,
      tags: ['logo', 'branding', 'business'],
      requirements: ['Company name', 'Brand guidelines', 'Color preferences'],
      deliverables: ['Logo files (PNG, SVG, AI)', 'Brand guidelines']
    }
  ]);

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'booking_1',
      serviceId: 'service_1',
      clientId: 'client_1',
      artistId: 'artist_1',
      title: 'Digital Portrait',
      description: 'Portrait for social media profile',
      date: '2024-01-20',
      time: '14:00',
      duration: 3,
      price: 150,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2024-01-15'
    }
  ]);

  // Service categories
  const serviceCategories = [
    { value: 'digital_art', label: 'Digital Art', icon: Paintbrush },
    { value: 'graphic_design', label: 'Graphic Design', icon: Camera },
    { value: 'music', label: 'Music', icon: Music },
    { value: 'writing', label: 'Writing', icon: BookOpen },
    { value: 'programming', label: 'Programming', icon: Code },
    { value: 'consulting', label: 'Consulting', icon: GraduationCap },
    { value: 'repair', label: 'Repair Services', icon: Wrench }
  ];

  // Handle service creation
  const handleCreateService = useCallback(async () => {
    if (!validateInput(serviceForm.title, 'text') || !validateInput(serviceForm.description, 'text')) {
      toast({
        title: "Invalid Input",
        description: "Please check your input and try again",
        variant: "destructive"
      });
      return;
    }

    try {
      const newService: Service = {
        id: Date.now().toString(),
        title: sanitizeText(serviceForm.title),
        description: sanitizeText(serviceForm.description),
        category: serviceForm.category,
        price: parseFloat(serviceForm.price),
        duration: serviceForm.duration,
        isActive: true,
        tags: serviceForm.tags,
        requirements: serviceForm.requirements,
        deliverables: serviceForm.deliverables
      };

      setServices(prev => [newService, ...prev]);
      setServiceForm({
        title: '',
        description: '',
        category: '',
        price: '',
        duration: '',
        tags: [],
        requirements: [],
        deliverables: []
      });
      setShowServiceDialog(false);
      
      toast({
        title: "Service Created",
        description: "Your service has been created successfully"
      });
      
      onServiceAction?.('service_create', { serviceId: newService.id, userId: user?.id });
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create service. Please try again.",
        variant: "destructive"
      });
    }
  }, [serviceForm, validateInput, sanitizeText, toast, onServiceAction, user]);

  // Handle booking creation
  const handleCreateBooking = useCallback(async () => {
    if (!validateInput(bookingForm.title, 'text') || !validateInput(bookingForm.description, 'text')) {
      toast({
        title: "Invalid Input",
        description: "Please check your input and try again",
        variant: "destructive"
      });
      return;
    }

    try {
      const newBooking: Booking = {
        id: Date.now().toString(),
        serviceId: selectedService?.id || '',
        clientId: user?.id || '',
        artistId: artistProfile.userId,
        title: sanitizeText(bookingForm.title),
        description: sanitizeText(bookingForm.description),
        date: bookingForm.date,
        time: bookingForm.time,
        duration: parseInt(bookingForm.duration),
        price: selectedService?.price || 0,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      setBookings(prev => [newBooking, ...prev]);
      setBookingForm({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '',
        budget: ''
      });
      setShowBookingDialog(false);
      
      toast({
        title: "Booking Requested",
        description: "Your booking request has been submitted"
      });
      
      onServiceAction?.('booking_create', { bookingId: newBooking.id, userId: user?.id });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  }, [bookingForm, selectedService, user, artistProfile, validateInput, sanitizeText, toast, onServiceAction]);

  // Handle service toggle
  const handleToggleService = useCallback(async (serviceId: string) => {
    try {
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, isActive: !service.isActive }
          : service
      ));
      
      toast({
        title: "Service Updated",
        description: "Service status has been updated"
      });
    } catch (error) {
      console.error('Error toggling service:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update service. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Handle booking status update
  const handleUpdateBookingStatus = useCallback(async (bookingId: string, status: Booking['status']) => {
    try {
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status }
          : booking
      ));
      
      toast({
        title: "Booking Updated",
        description: `Booking status updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update booking. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Filter services by category
  const filteredServices = useMemo(() => {
    return services.filter(service => service.isActive);
  }, [services]);

  // Filter bookings by status
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => booking.status !== 'cancelled');
  }, [bookings]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Artist & Service Provider</h2>
          <p className="text-gray-600">Manage your services, bookings, and artist profile</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={artistProfile.verification.isVerified ? "default" : "outline"}
            className={artistProfile.verification.isVerified ? 'bg-green-100 text-green-800' : ''}
          >
            <Shield className="h-3 w-3 mr-1" />
            {artistProfile.verification.isVerified ? 'Verified' : 'Unverified'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowServiceDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Artist Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Artist Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <Paintbrush className="h-8 w-8 text-gray-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{artistProfile.displayName}</h3>
              <p className="text-gray-600">{artistProfile.bio}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{artistProfile.rating.average}</span>
                  <span className="text-sm text-gray-500">({artistProfile.rating.count} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {artistProfile.location.city}, {artistProfile.location.state}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {artistProfile.experience.years} years experience
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">
                ₹{artistProfile.hourlyRate.min}-{artistProfile.hourlyRate.max}/hr
              </div>
              <div className="text-sm text-gray-500">
                {artistProfile.experience.projects} projects completed
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Artist Information</CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={profileForm.displayName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Your artist name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={profileForm.experience}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                        placeholder="Years of experience"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about your artistic journey"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hourlyRateMin">Minimum Hourly Rate (₹)</Label>
                      <Input
                        id="hourlyRateMin"
                        type="number"
                        value={profileForm.hourlyRateMin}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, hourlyRateMin: e.target.value }))}
                        placeholder="Minimum rate"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourlyRateMax">Maximum Hourly Rate (₹)</Label>
                      <Input
                        id="hourlyRateMax"
                        type="number"
                        value={profileForm.hourlyRateMax}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, hourlyRateMax: e.target.value }))}
                        placeholder="Maximum rate"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileForm.location.city}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, city: e.target.value }
                        }))}
                        placeholder="Your city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profileForm.location.state}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, state: e.target.value }
                        }))}
                        placeholder="Your state"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={profileForm.location.country}
                        onChange={(e) => setProfileForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, country: e.target.value }
                        }))}
                        placeholder="Your country"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(false)}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Display Name:</span>
                      <span className="ml-2">{artistProfile.displayName}</span>
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span>
                      <span className="ml-2">{artistProfile.experience.years} years</span>
                    </div>
                    <div>
                      <span className="font-medium">Hourly Rate:</span>
                      <span className="ml-2">₹{artistProfile.hourlyRate.min}-{artistProfile.hourlyRate.max}</span>
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>
                      <span className="ml-2">
                        {artistProfile.location.city}, {artistProfile.location.state}, {artistProfile.location.country}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Bio:</span>
                    <p className="mt-1 text-gray-700">{artistProfile.bio}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Skills:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {artistProfile.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4">
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant="secondary">{service.category}</Badge>
                          <Badge variant={service.isActive ? "default" : "outline"}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleService(service.id)}
                        >
                          {service.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">₹{service.price}</span>
                        <span className="text-sm text-gray-500">{service.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {service.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{booking.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(booking.date).toLocaleDateString()}</span>
                          <Clock className="h-4 w-4" />
                          <span>{booking.time}</span>
                          <Badge variant={
                            booking.status === 'completed' ? 'default' :
                            booking.status === 'confirmed' ? 'secondary' :
                            booking.status === 'in_progress' ? 'outline' :
                            'destructive'
                          }>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{booking.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">₹{booking.price}</span>
                        <span className="text-sm text-gray-500">{booking.duration} hours</span>
                        <span className="text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{bookings.reduce((sum, booking) => sum + booking.price, 0)}</div>
                <p className="text-xs text-gray-500">This month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredServices.length}</div>
                <p className="text-xs text-gray-500">Currently available</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Completed Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bookings.filter(booking => booking.status === 'completed').length}
                </div>
                <p className="text-xs text-gray-500">This month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Service Creation Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Service</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceTitle">Service Title</Label>
                <Input
                  id="serviceTitle"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Digital Portrait"
                />
              </div>
              <div>
                <Label htmlFor="serviceCategory">Category</Label>
                <Select value={serviceForm.category} onValueChange={(value) => setServiceForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((category) => (
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
            </div>
            
            <div>
              <Label htmlFor="serviceDescription">Description</Label>
              <Textarea
                id="serviceDescription"
                value={serviceForm.description}
                onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your service in detail"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="servicePrice">Price (₹)</Label>
                <Input
                  id="servicePrice"
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Service price"
                />
              </div>
              <div>
                <Label htmlFor="serviceDuration">Duration</Label>
                <Input
                  id="serviceDuration"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 3-5 days"
                />
              </div>
            </div>
            
            <Button onClick={handleCreateService} className="w-full">
              Create Service
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Service</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bookingTitle">Booking Title</Label>
              <Input
                id="bookingTitle"
                value={bookingForm.title}
                onChange={(e) => setBookingForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of your request"
              />
            </div>
            
            <div>
              <Label htmlFor="bookingDescription">Description</Label>
              <Textarea
                id="bookingDescription"
                value={bookingForm.description}
                onChange={(e) => setBookingForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of what you need"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bookingDate">Preferred Date</Label>
                <Input
                  id="bookingDate"
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="bookingTime">Preferred Time</Label>
                <Input
                  id="bookingTime"
                  type="time"
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bookingDuration">Duration (hours)</Label>
                <Input
                  id="bookingDuration"
                  type="number"
                  value={bookingForm.duration}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="Estimated duration"
                />
              </div>
              <div>
                <Label htmlFor="bookingBudget">Budget (₹)</Label>
                <Input
                  id="bookingBudget"
                  type="number"
                  value={bookingForm.budget}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="Your budget"
                />
              </div>
            </div>
            
            <Button onClick={handleCreateBooking} className="w-full">
              Request Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

ArtistServiceProvider.displayName = 'ArtistServiceProvider';
