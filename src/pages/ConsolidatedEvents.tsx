import { useState, useEffect, useCallback } from "react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Flame,
  Heart,
  Share2,
  MoreHorizontal,
  Ticket,
  DollarSign,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  Clock3,
  MapPinOff,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Bookmark,
  MessageCircle,
  Bell,
  Settings,
  Zap,
  Target,
  Award,
  Crown,
  Sparkles,
  Rocket,
  Lightbulb,
  BarChart3,
  TrendingDown,
  Activity,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Link,
  Navigation,
  Compass,
  Flag,
  Tag,
  Hash,
  AtSign,
  CreditCard,
  Wallet,
  PiggyBank,
  CalendarDays,
  Clock3 as Clock3Icon,
  Timer,
  Stopwatch,
  Hourglass,
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Move,
  Grip,
  Drag,
  MousePointer,
  Hand,
  Fingerprint,
  Scan,
  QrCode,
  Barcode,
  Camera,
  Video,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  Headphones,
  Speaker,
  Radio,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Battery,
  BatteryLow,
  BatteryCharging,
  Power,
  PowerOff,
  Zap as ZapIcon,
  Target as TargetIcon,
  Shield as ShieldIcon,
  Lightbulb as LightbulbIcon,
  Rocket as RocketIcon,
  CheckCircle as CheckCircleIcon,
  BarChart3 as BarChart3Icon,
  UserPlus as UserPlusIcon,
  BookOpen as BookOpenIcon,
  Megaphone as MegaphoneIcon,
  Building2 as Building2Icon,
  TreePine as TreePineIcon,
  Music as MusicIcon,
  Palette as PaletteIcon,
  Utensils as UtensilsIcon,
  Dumbbell as DumbbellIcon,
  GraduationCap as GraduationCapIcon,
  Briefcase as BriefcaseIcon,
  Gamepad2 as Gamepad2Icon,
  Camera as CameraIcon,
  Car as CarIcon,
  Home as HomeIcon,
  Wifi as WifiIcon,
  Smartphone as SmartphoneIcon,
  Laptop as LaptopIcon,
  Headphones as HeadphonesIcon,
  Coffee as CoffeeIcon,
  ShoppingBag as ShoppingBagIcon,
  Gift as GiftIcon,
  PartyPopper as PartyPopperIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Cloud as CloudIcon,
  CloudRain as CloudRainIcon,
  Snowflake as SnowflakeIcon,
  Wind as WindIcon,
  Droplets as DropletsIcon,
  Thermometer as ThermometerIcon,
  Eye as EyeIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Grid3X3 as Grid3X3Icon,
  List as ListIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Settings as SettingsIcon,
  Bell as BellIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Map as MapIcon,
  Navigation as NavigationIcon,
  Compass as CompassIcon,
  Flag as FlagIcon,
  Tag as TagIcon,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  DollarSign as DollarSignIcon,
  CreditCard as CreditCardIcon,
  Wallet as WalletIcon,
  PiggyBank as PiggyBankIcon,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEvents, Event } from "@/hooks/useEvents";
import { useCommunities } from "@/hooks/useCommunities";
import { EventCard } from "@/components/EventCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

interface EventCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  count: number;
}

interface EventFilter {
  category: string;
  dateRange: string;
  priceRange: string;
  location: string;
  sortBy: string;
}

const ConsolidatedEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { events, loading, toggleAttendance } = useEvents();
  const { communities } = useCommunities();

  // Enhanced state management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("date");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [showFilters, setShowFilters] = useState(false);
  const [voiceControl, setVoiceControl] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enhanced filters
  const [filters, setFilters] = useState<EventFilter>({
    category: "All Categories",
    dateRange: "All Time",
    priceRange: "Any Price",
    location: "Any Location",
    sortBy: "date"
  });

  // Enhanced categories with icons and colors
  const categories: EventCategory[] = [
    { id: "all", name: "All Categories", icon: Grid3X3, color: "bg-gray-500", count: events.length },
    { id: "music", name: "Music", icon: MusicIcon, color: "bg-purple-500", count: events.filter(e => e.category === "Music").length },
    { id: "art", name: "Art", icon: PaletteIcon, color: "bg-pink-500", count: events.filter(e => e.category === "Art").length },
    { id: "community", name: "Community", icon: Users, color: "bg-blue-500", count: events.filter(e => e.category === "Community").length },
    { id: "food", name: "Food", icon: UtensilsIcon, color: "bg-orange-500", count: events.filter(e => e.category === "Food").length },
    { id: "tech", name: "Technology", icon: LaptopIcon, color: "bg-indigo-500", count: events.filter(e => e.category === "Technology").length },
    { id: "wellness", name: "Health & Wellness", icon: DumbbellIcon, color: "bg-green-500", count: events.filter(e => e.category === "Health & Wellness").length },
    { id: "sports", name: "Sports", icon: TargetIcon, color: "bg-red-500", count: events.filter(e => e.category === "Sports").length },
    { id: "education", name: "Education", icon: GraduationCapIcon, color: "bg-yellow-500", count: events.filter(e => e.category === "Education").length },
    { id: "business", name: "Business", icon: BriefcaseIcon, color: "bg-gray-600", count: events.filter(e => e.category === "Business").length },
    { id: "entertainment", name: "Entertainment", icon: PartyPopperIcon, color: "bg-pink-600", count: events.filter(e => e.category === "Entertainment").length }
  ];

  // Enhanced data processing
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCategory = selectedCategory === "All Categories" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date": {
        try {
          const dateA = new Date(a.event_date || a.date);
          const dateB = new Date(b.event_date || b.date);
          return dateA.getTime() - dateB.getTime();
        } catch {
          return 0;
        }
      }
      case "popularity": {
        return (b.attendees_count || b.attendees || 0) - (a.attendees_count || a.attendees || 0);
      }
      case "price": {
        const priceA = a.price === "Free" ? 0 : (typeof a.price === 'string' ? parseInt(a.price.replace("$", "")) : a.price);
        const priceB = b.price === "Free" ? 0 : (typeof b.price === 'string' ? parseInt(b.price.replace("$", "")) : b.price);
        return priceA - priceB;
      }
      default:
        return 0;
    }
  });

  // Enhanced handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Events Refreshed",
        description: "Latest events have been loaded.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh events. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [toast]);

  const handleVoiceCommand = useCallback((command: string) => {
    // Enhanced voice control
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes("search")) {
      const searchTerm = command.replace(/search\s+/i, "");
      setSearchQuery(searchTerm);
      toast({
        title: "Voice Search",
        description: `Searching for: ${searchTerm}`,
      });
    } else if (lowerCommand.includes("filter")) {
      setShowFilters(prev => !prev);
      toast({
        title: "Voice Filter",
        description: "Opening filters panel",
      });
    } else if (lowerCommand.includes("refresh")) {
      handleRefresh();
    }
  }, [handleRefresh, toast]);

  const handleBookEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsBookingModalOpen(true);
  };

  // Enhanced booking modal
  const EventBookingModal = ({ event, isOpen, onClose }: { event: Event; isOpen: boolean; onClose: () => void }) => {
    const [tickets, setTickets] = useState(1);
    const [showContact, setShowContact] = useState(false);

    const totalPrice = event.price === "Free" ? 0 : parseInt(event.price.replace("$", "")) * tickets;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{event.title}</DialogTitle>
            <DialogDescription>
              Book your tickets for this amazing event
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Enhanced Event Details */}
            <div className="flex gap-4">
              <img 
                src={event.image_url || event.image || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop"} 
                alt={event.title}
                className="w-32 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{event.event_date || event.date}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{event.event_time || event.time}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{event.location_name || event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{event.attendees_count || event.attendees || 0} / {event.max_attendees || event.maxAttendees || '∞'} attending</span>
                </div>
              </div>
            </div>

            {/* Enhanced Ticket Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold">Select Tickets</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">General Admission</p>
                  <p className="text-sm text-muted-foreground">{event.price} per ticket</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTickets(Math.max(1, tickets - 1))}
                    disabled={tickets <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{tickets}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTickets(Math.min((event.max_attendees || event.maxAttendees || 100) - (event.attendees_count || event.attendees || 0), tickets + 1))}
                    disabled={tickets >= (event.max_attendees || event.maxAttendees || 100) - (event.attendees_count || event.attendees || 0)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Total */}
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">
                {event.price === "Free" ? "Free" : `$${totalPrice}`}
              </span>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-3">
              <Button 
                className="flex-1 btn-event"
                onClick={() => {
                  toast({
                    title: "Booking Successful",
                    description: `You've booked ${tickets} ticket(s) for ${event.title}`,
                  });
                  onClose();
                }}
              >
                <Ticket className="w-4 h-4 mr-2" />
                {event.price === "Free" ? "Reserve Spot" : "Book Tickets"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowContact(!showContact)}
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>

            {/* Enhanced Contact Information */}
            {showContact && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold">Contact Information</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>info@eventorganizer.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>www.eventorganizer.com</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Enhanced Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Events
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover and book amazing local events
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="btn-event" asChild>
              <Link to="/create-event">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Nearby
            </TabsTrigger>
            <TabsTrigger value="my-events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              My Events
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {/* Enhanced Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Enhanced Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events, organizers, or locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Enhanced Category Filter */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          <div className="flex items-center gap-2">
                            <category.icon className="w-4 h-4" />
                            {category.name} ({category.count})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Enhanced Sort By */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Enhanced View Mode Toggle */}
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

            {/* Enhanced Events Grid/List */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {selectedCategory === "All Categories" ? "All Events" : selectedCategory} ({sortedEvents.length})
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
              
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    // Enhanced loading skeleton
                    [...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <Card className="animate-pulse">
                          <div className="h-48 bg-muted rounded-t-lg"></div>
                          <CardContent className="p-4">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-full mb-2"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : sortedEvents.length > 0 ? (
                    sortedEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                      >
                        <EventCard
                          event={event}
                          onAttend={toggleAttendance}
                          onBook={handleBookEvent}
                          onLike={(eventId) => {
                            toast({
                              title: "Event Liked",
                              description: "You've liked this event!",
                            });
                          }}
                          onChat={(eventId, organizerId) => {
                            toast({
                              title: "Chat Started",
                              description: "Opening chat with organizer...",
                            });
                          }}
                          verified={Math.random() > 0.7}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                          <p className="text-muted-foreground mb-4">
                            {searchQuery || selectedCategory !== "All Categories" 
                              ? "No events match your search criteria." 
                              : "There are no events available at the moment."}
                          </p>
                          <Link to="/create-event">
                            <Button className="btn-event">
                              <Plus className="w-4 h-4 mr-2" />
                              Create Event
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {loading ? (
                    // Enhanced loading skeleton for list view
                    [...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <Card className="animate-pulse">
                          <CardContent className="p-6">
                            <div className="flex gap-6">
                              <div className="w-32 h-24 bg-muted rounded-lg flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                                <div className="h-3 bg-muted rounded w-2/3"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : sortedEvents.length > 0 ? (
                    sortedEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        <Card className="event-card group cursor-pointer hover:shadow-event transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex gap-6">
                              <img 
                                src={event.image_url || event.image || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop"} 
                                alt={event.title}
                                className="w-32 h-24 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                      {event.title}
                                      {Math.random() > 0.7 && (
                                        <Badge className="bg-blue-500 text-white text-xs">
                                          <Star className="w-3 h-3 mr-1" />
                                          Verified
                                        </Badge>
                                      )}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                      {event.description}
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {event.event_date || event.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {event.event_time || event.time}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {event.location_name || event.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {(event.attendees_count || event.attendees || 0)} / {(event.max_attendees || event.maxAttendees || '∞')}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarImage src={event.organizer_avatar || event.organizer?.avatar} />
                                        <AvatarFallback>{(event.organizer_name || event.organizer?.name || 'E')[0]}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm font-medium">{event.organizer_name || event.organizer?.name || 'Event Organizer'}</span>
                                    </div>
                                    <Badge className="badge-event">{event.category}</Badge>
                                  </div>
                                  <Button 
                                    className="btn-event"
                                    onClick={() => handleBookEvent(event)}
                                  >
                                    <Ticket className="w-4 h-4 mr-2" />
                                    {event.price === 0 || event.price === "Free" ? "Free" : `$${event.price}`}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery || selectedCategory !== "All Categories" 
                            ? "No events match your search criteria." 
                            : "There are no events available at the moment."}
                        </p>
                        <Link to="/create-event">
                          <Button className="btn-event">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Event
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </section>
          </TabsContent>

          {/* Other tabs content would go here */}
          <TabsContent value="trending" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Trending Events</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nearby" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nearby Events</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-events" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">My Events</h3>
                <p className="text-muted-foreground">Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Booking Modal */}
        {selectedEvent && (
          <EventBookingModal
            event={selectedEvent}
            isOpen={isBookingModalOpen}
            onClose={() => {
              setIsBookingModalOpen(false);
              setSelectedEvent(null);
            }}
          />
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedEvents;
