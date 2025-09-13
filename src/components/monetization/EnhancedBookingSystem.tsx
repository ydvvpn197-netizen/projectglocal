import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Star,
  MessageSquare,
  Video,
  Phone as PhoneIcon,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Share2,
  Download,
  Upload,
  Send,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  DollarSign,
  Users,
  Timer,
  Bell,
  BellOff,
  Bookmark,
  BookmarkCheck,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  SignalHigh,
  SignalLow,
  SignalZero,
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
  Move3d,
  MoveHorizontal,
  MoveVertical,
  RotateCcw as RotateCcwIcon,
  RotateCw as RotateCwIcon,
  FlipHorizontal,
  FlipVertical,
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

interface Booking {
  id: string;
  service_id: string;
  customer_id: string;
  provider_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  total_amount: number;
  currency: string;
  customer_notes?: string;
  provider_notes?: string;
  meeting_link?: string;
  meeting_id?: string;
  meeting_password?: string;
  created_at: string;
  updated_at: string;
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    provider: {
      id: string;
      display_name: string;
      avatar_url?: string;
      phone_number?: string;
      email?: string;
    };
  };
  customer: {
    id: string;
    display_name: string;
    avatar_url?: string;
    phone_number?: string;
    email?: string;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
  booked_by?: string;
}

interface Availability {
  date: string;
  timeSlots: TimeSlot[];
}

interface EnhancedBookingSystemProps {
  serviceId: string;
  providerId: string;
  onBookingComplete?: (booking: Booking) => void;
}

export function EnhancedBookingSystem({ 
  serviceId, 
  providerId, 
  onBookingComplete 
}: EnhancedBookingSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [service, setService] = useState<any>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>();
  const [bookingDetails, setBookingDetails] = useState({
    duration: 60,
    notes: '',
    meeting_preference: 'online',
    contact_method: 'message'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');

  useEffect(() => {
    loadServiceData();
    loadAvailability();
  }, [serviceId, providerId]);

  const loadServiceData = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles!services_user_id_fkey(
            id,
            display_name,
            avatar_url,
            phone_number,
            email
          )
        `)
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error) {
      console.error('Error loading service:', error);
      toast({
        title: 'Error',
        description: 'Failed to load service details',
        variant: 'destructive'
      });
    }
  };

  const loadAvailability = async () => {
    try {
      // Mock availability data - in a real app, this would come from the provider's calendar
      const mockAvailability: Availability[] = [];
      const startDate = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const timeSlots: TimeSlot[] = [];
        const startHour = 9;
        const endHour = 17;
        
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const isAvailable = Math.random() > 0.3; // 70% availability
            
            timeSlots.push({
              time: timeString,
              available: isAvailable,
              booked_by: isAvailable ? undefined : 'other_user'
            });
          }
        }
        
        mockAvailability.push({
          date: date.toISOString().split('T')[0],
          timeSlots
        });
      }
      
      setAvailability(mockAvailability);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableTimeSlots = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayAvailability = availability.find(day => day.date === dateString);
    return dayAvailability?.timeSlots.filter(slot => slot.available) || [];
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to book this service',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      toast({
        title: 'Selection Required',
        description: 'Please select a date and time for your booking',
        variant: 'destructive'
      });
      return;
    }

    setIsBooking(true);
    try {
      const startTime = new Date(selectedDate);
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + bookingDetails.duration);

      const { data, error } = await supabase
        .from('service_bookings')
        .insert({
          service_id: serviceId,
          customer_id: user.id,
          provider_id: providerId,
          booking_date: startTime.toISOString(),
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_minutes: bookingDetails.duration,
          status: 'pending',
          total_amount: service.price,
          currency: service.currency,
          customer_notes: bookingDetails.notes,
          meeting_preference: bookingDetails.meeting_preference,
          contact_method: bookingDetails.contact_method
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Booking Request Sent',
        description: 'Your booking request has been sent to the provider for confirmation',
      });

      onBookingComplete?.(data);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Booking Failed',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsBooking(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading booking system...</div>
        </CardContent>
      </Card>
    );
  }

  if (!service) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Service not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{service.title}</CardTitle>
              <p className="text-muted-foreground mt-2">{service.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                ₹{service.price.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">per session</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={service.profiles?.avatar_url} />
              <AvatarFallback>
                {service.profiles?.display_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{service.profiles?.display_name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.8 (127 reviews)</span>
                <span>•</span>
                <span>98% completion rate</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Book This Service</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calendar">Select Date & Time</TabsTrigger>
              <TabsTrigger value="details">Booking Details</TabsTrigger>
              <TabsTrigger value="payment">Payment & Confirm</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                  <h3 className="font-semibold mb-4">Select Date</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="font-semibold mb-4">Available Times</h3>
                  {selectedDate ? (
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Available slots for {selectedDate.toLocaleDateString()}
                      </div>
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                        {getAvailableTimeSlots(selectedDate).map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTimeSlot(slot.time)}
                            disabled={!slot.available}
                          >
                            {formatTime(slot.time)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a date to view available times</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select
                      value={bookingDetails.duration.toString()}
                      onValueChange={(value) => setBookingDetails(prev => ({ ...prev, duration: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="meeting_preference">Meeting Preference</Label>
                    <Select
                      value={bookingDetails.meeting_preference}
                      onValueChange={(value) => setBookingDetails(prev => ({ ...prev, meeting_preference: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online (Video Call)</SelectItem>
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="contact_method">Preferred Contact Method</Label>
                    <Select
                      value={bookingDetails.contact_method}
                      onValueChange={(value) => setBookingDetails(prev => ({ ...prev, contact_method: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="message">Platform Message</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Special Requirements or Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements, questions, or notes for the provider..."
                    value={bookingDetails.notes}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, notes: e.target.value }))}
                    rows={6}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Booking Summary</h3>
                
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-medium">{service.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provider:</span>
                    <span className="font-medium">{service.profiles?.display_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date & Time:</span>
                    <span className="font-medium">
                      {selectedDate?.toLocaleDateString()} at {selectedTimeSlot && formatTime(selectedTimeSlot)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{bookingDetails.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meeting Type:</span>
                    <span className="font-medium capitalize">{bookingDetails.meeting_preference.replace('_', ' ')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>₹{service.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your payment is protected. You'll only be charged after the service is completed.</span>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTimeSlot || isBooking}
                >
                  {isBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Book Now - ₹{service.price.toLocaleString()}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
