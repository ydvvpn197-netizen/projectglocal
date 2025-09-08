import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Star, User, Clock, MapPin, Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { stripeService } from '@/services/stripeService';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import type { Service } from '@/types/monetization';

interface ServiceBrowserProps {
  onServiceSelect?: (service: Service) => void;
}

export function ServiceBrowser({ onServiceSelect }: ServiceBrowserProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const activeServices = await stripeService.getActiveServices(50, 0);
      setServices(activeServices);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesPrice = priceRange === 'all' || checkPriceRange(service.price, priceRange);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const checkPriceRange = (price: number, range: string): boolean => {
    const priceInDollars = price / 100;
    switch (range) {
      case 'under-25': return priceInDollars < 25;
      case '25-50': return priceInDollars >= 25 && priceInDollars <= 50;
      case '50-100': return priceInDollars >= 50 && priceInDollars <= 100;
      case 'over-100': return priceInDollars > 100;
      default: return true;
    }
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsBookingDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Browse Services
          </CardTitle>
          <CardDescription>
            Discover and book services from verified providers in your community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="art">Art & Design</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="tutoring">Tutoring</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-25">Under $25</SelectItem>
                  <SelectItem value="25-50">$25 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="over-100">Over $100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="text-sm text-muted-foreground pt-2">
                {filteredServices.length} services found
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new services.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => handleServiceClick(service)}
            />
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      {selectedService && (
        <ServiceBookingDialog
          service={selectedService}
          isOpen={isBookingDialogOpen}
          onClose={() => {
            setIsBookingDialogOpen(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}

function ServiceCard({ service, onClick }: { service: Service; onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {service.description}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              ${(service.price / 100).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {service.currency.toUpperCase()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {service.provider?.display_name || 'Unknown Provider'}
            </span>
            {service.provider?.is_verified && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Star className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {service.provider?.is_premium && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Premium
              </Badge>
            )}
          </div>
          
          {service.category && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">{service.category}</Badge>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Max {service.max_bookings_per_day} bookings/day
            </span>
          </div>

          <Button className="w-full" onClick={onClick}>
            Book Service
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceBookingDialog({ 
  service, 
  isOpen, 
  onClose 
}: { 
  service: Service; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please sign in to book services');
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    setIsLoading(true);
    try {
      const bookingData = {
        service_id: service.id,
        booking_date: selectedDate.toISOString(),
        duration_minutes: duration,
        notes,
      };

      const booking = await stripeService.bookService(bookingData);
      toast.success('Service booked successfully!');
      onClose();
    } catch (error) {
      console.error('Error booking service:', error);
      toast.error('Failed to book service');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Book Service: {service.title}</DialogTitle>
          <DialogDescription>
            Complete your booking details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Details */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h4 className="font-medium">{service.title}</h4>
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{service.provider?.display_name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">${(service.price / 100).toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">per session</div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Notes (Optional)</label>
            <textarea
              className="w-full p-3 border rounded-md resize-none"
              rows={3}
              placeholder="Any special requirements or notes for the provider..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Booking Summary */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Booking Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Service:</span>
                <span>{service.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Provider:</span>
                <span>{service.provider?.display_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{selectedDate ? format(selectedDate, "PPP") : "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{duration} minutes</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>${(service.price / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleBooking}
              disabled={isLoading || !selectedDate}
              className="flex-1"
            >
              {isLoading ? 'Processing...' : 'Book Service'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Secure payment will be processed after booking confirmation.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
