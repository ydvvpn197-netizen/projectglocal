import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  MessageCircle,
  Shield,
  Star,
  CreditCard,
  Banknote,
  Wallet
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ServiceBooking {
  id: string;
  service_id: string;
  user_id: string;
  provider_id: string;
  booking_date: string;
  booking_time: string;
  duration: string;
  location: string;
  special_requests: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
}

interface ServiceBookingSystemProps {
  serviceId: string;
  serviceTitle: string;
  servicePrice: number;
  serviceCurrency: string;
  serviceDuration: string;
  serviceLocationType: 'remote' | 'on-site' | 'both';
  providerId: string;
  providerName: string;
  onBookingSubmit?: (bookingData: BookingData) => Promise<void>;
  compact?: boolean;
}

interface BookingData {
  booking_date: string;
  booking_time: string;
  location: string;
  special_requests: string;
  contact_email: string;
  contact_phone: string;
  payment_method: 'cash' | 'online' | 'bank_transfer';
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
];

export const ServiceBookingSystem: React.FC<ServiceBookingSystemProps> = ({
  serviceId,
  serviceTitle,
  servicePrice,
  serviceCurrency,
  serviceDuration,
  serviceLocationType,
  providerId,
  providerName,
  onBookingSubmit,
  compact = false
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    booking_date: '',
    booking_time: '',
    location: '',
    special_requests: '',
    contact_email: '',
    contact_phone: '',
    payment_method: 'online'
  });

  const handleInputChange = (field: keyof BookingData, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      handleInputChange('booking_date', date.toISOString().split('T')[0]);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    handleInputChange('booking_time', time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to book services.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a booking date.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTime) {
      toast({
        title: "Time Required",
        description: "Please select a booking time.",
        variant: "destructive",
      });
      return;
    }

    if (!bookingData.location.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter the service location.",
        variant: "destructive",
      });
      return;
    }

    if (!bookingData.contact_email.trim()) {
      toast({
        title: "Contact Required",
        description: "Please enter your contact email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (onBookingSubmit) {
        await onBookingSubmit(bookingData);
      }
      
      toast({
        title: "Booking Request Sent",
        description: "Your booking request has been submitted to the provider.",
      });
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setBookingData({
        booking_date: '',
        booking_time: '',
        location: '',
        special_requests: '',
        contact_email: '',
        contact_phone: '',
        payment_method: 'online'
      });
      setIsBookingOpen(false);
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Error",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Book This Service</h4>
            <p className="text-sm text-muted-foreground">
              {formatPrice(servicePrice, serviceCurrency)} • {serviceDuration}
            </p>
          </div>
          <Button
            onClick={() => setIsBookingOpen(!isBookingOpen)}
            className="bg-primary text-primary-foreground"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Book Now
          </Button>
        </div>

        {isBookingOpen && (
          <Card className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal text-sm",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-sm font-medium">Time</Label>
                  <Select value={selectedTime} onValueChange={handleTimeSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Location</Label>
                <Input
                  value={bookingData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter service location"
                  className="text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Booking...' : 'Submit Request'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBookingOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Book Service
        </CardTitle>
        <CardDescription>
          Book {serviceTitle} with {providerName}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Service Summary */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{serviceTitle}</h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{formatPrice(servicePrice, serviceCurrency)}</span>
              <Badge variant="secondary">{serviceDuration}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {serviceLocationType === 'remote' ? 'Remote' : 
               serviceLocationType === 'on-site' ? 'On-site' : 'Remote or On-site'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {serviceDuration}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Secure booking
            </span>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-medium">Select Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-2",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-base font-medium">Select Time *</Label>
              <Select value={selectedTime} onValueChange={handleTimeSelect}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-base font-medium">Service Location *</Label>
            <Input
              id="location"
              value={bookingData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder={
                serviceLocationType === 'remote' ? 'Enter meeting link or remote location' :
                serviceLocationType === 'on-site' ? 'Enter physical address' :
                'Enter location (remote or physical address)'
              }
              className="mt-2"
              required
            />
          </div>

          {/* Special Requests */}
          <div>
            <Label htmlFor="special_requests" className="text-base font-medium">Special Requests</Label>
            <Textarea
              id="special_requests"
              value={bookingData.special_requests}
              onChange={(e) => handleInputChange('special_requests', e.target.value)}
              placeholder="Any special requirements or requests for the service..."
              className="mt-2"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email" className="text-base font-medium">Contact Email *</Label>
              <Input
                id="contact_email"
                type="email"
                value={bookingData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="your@email.com"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="contact_phone" className="text-base font-medium">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={bookingData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="+91 9876543210"
                className="mt-2"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="text-base font-medium">Payment Method</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button
                type="button"
                variant={bookingData.payment_method === 'online' ? 'default' : 'outline'}
                onClick={() => handleInputChange('payment_method', 'online')}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Online
              </Button>
              <Button
                type="button"
                variant={bookingData.payment_method === 'cash' ? 'default' : 'outline'}
                onClick={() => handleInputChange('payment_method', 'cash')}
                className="flex items-center gap-2"
              >
                <Banknote className="h-4 w-4" />
                Cash
              </Button>
              <Button
                type="button"
                variant={bookingData.payment_method === 'bank_transfer' ? 'default' : 'outline'}
                onClick={() => handleInputChange('payment_method', 'bank_transfer')}
                className="flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                Transfer
              </Button>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-2">Booking Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Service:</span>
                <span>{serviceTitle}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{serviceDuration}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{selectedDate ? format(selectedDate, "PPP") : 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{selectedTime || 'Not selected'}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatPrice(servicePrice, serviceCurrency)}</span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              By booking this service, you agree to the provider's terms and conditions. 
              Payment will be processed according to the selected payment method.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !selectedDate || !selectedTime}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Submit Booking Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
