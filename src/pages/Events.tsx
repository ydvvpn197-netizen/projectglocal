import { useState } from "react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  EyeOff
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents, Event } from "@/hooks/useEvents";
import { EventCard } from "@/components/EventCard";
import { useToast } from "@/hooks/use-toast";

// Sample event data for fallback
const sampleEvents = [
  {
    id: 1,
    title: "Local Music Festival 2024",
    description: "A three-day celebration of local music talent featuring over 50 artists across multiple stages. Experience the best of our local music scene with food trucks, art installations, and family-friendly activities.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
    date: "Dec 15-17, 2024",
    time: "12:00 PM - 11:00 PM",
    location: "Central Park, Downtown",
    organizer: {
      name: "SoundWave Productions",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      verified: true
    },
    category: "Music",
    price: "$45",
    attendees: 1250,
    maxAttendees: 2000,
    featured: true,
    tags: ["music", "festival", "local", "live"],
    highlights: ["3 stages", "Food trucks", "Art installations", "Family friendly"],
    contact: {
      phone: "+1 (555) 123-4567",
      email: "info@soundwavefest.com",
      website: "www.soundwavefest.com"
    }
  },
  {
    id: 2,
    title: "Art Exhibition Opening",
    description: "Join us for the grand opening of our latest contemporary art exhibition featuring works from local and international artists.",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop",
    date: "Dec 10, 2024",
    time: "6:00 PM - 9:00 PM",
    location: "Downtown Gallery",
    organizer: {
      name: "Contemporary Arts Collective",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      verified: false
    },
    category: "Art",
    price: "Free",
    attendees: 89,
    maxAttendees: 150,
    featured: false,
    tags: ["art", "exhibition", "opening", "contemporary"],
    highlights: ["Wine reception", "Artist talks", "Live music"],
    contact: {
      phone: "+1 (555) 987-6543",
      email: "info@contemporaryarts.com",
      website: "www.contemporaryarts.com"
    }
  },
  {
    id: 3,
    title: "Community Garden Workshop",
    description: "Learn sustainable gardening techniques and help maintain our community garden. Perfect for beginners and experienced gardeners alike.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop",
    date: "Dec 12, 2024",
    time: "2:00 PM - 5:00 PM",
    location: "Community Center",
    organizer: {
      name: "Green Thumbs Collective",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      verified: true
    },
    category: "Community",
    price: "$15",
    attendees: 45,
    maxAttendees: 60,
    featured: false,
    tags: ["gardening", "community", "sustainability", "workshop"],
    highlights: ["Hands-on learning", "Take-home plants", "Expert guidance"],
    contact: {
      phone: "+1 (555) 456-7890",
      email: "info@greenthumbs.org",
      website: "www.greenthumbs.org"
    }
  },
  {
    id: 4,
    title: "Local Food Market",
    description: "Weekly farmers market featuring fresh local produce, artisanal goods, and delicious street food from the best local vendors.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop",
    date: "Dec 14, 2024",
    time: "10:00 AM - 4:00 PM",
    location: "Farmers Market Square",
    organizer: {
      name: "Farm Fresh Collective",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      verified: true
    },
    category: "Food",
    price: "Free",
    attendees: 156,
    maxAttendees: 500,
    featured: false,
    tags: ["food", "market", "local", "fresh"],
    highlights: ["Fresh produce", "Artisanal goods", "Street food", "Live music"],
    contact: {
      phone: "+1 (555) 321-0987",
      email: "info@farmfreshmarket.com",
      website: "www.farmfreshmarket.com"
    }
  },
  {
    id: 5,
    title: "Tech Startup Meetup",
    description: "Network with local entrepreneurs, investors, and tech professionals. Share ideas, find collaborators, and learn from industry experts.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop",
    date: "Dec 18, 2024",
    time: "7:00 PM - 9:00 PM",
    location: "Innovation Hub",
    organizer: {
      name: "Tech Entrepreneurs Network",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      verified: true
    },
    category: "Technology",
    price: "$25",
    attendees: 78,
    maxAttendees: 100,
    featured: false,
    tags: ["tech", "startup", "networking", "entrepreneurs"],
    highlights: ["Networking", "Pitch competition", "Expert panel"],
    contact: {
      phone: "+1 (555) 654-3210",
      email: "info@techentrepreneurs.com",
      website: "www.techentrepreneurs.com"
    }
  },
  {
    id: 6,
    title: "Yoga in the Park",
    description: "Join us for a relaxing outdoor yoga session suitable for all levels. Bring your own mat and enjoy the fresh air and peaceful surroundings.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    date: "Dec 20, 2024",
    time: "8:00 AM - 9:30 AM",
    location: "Riverside Park",
    organizer: {
      name: "Wellness Collective",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      verified: false
    },
    category: "Health & Wellness",
    price: "$10",
    attendees: 34,
    maxAttendees: 50,
    featured: false,
    tags: ["yoga", "wellness", "outdoor", "fitness"],
    highlights: ["All levels welcome", "Outdoor setting", "Professional instructor"],
    contact: {
      phone: "+1 (555) 789-0123",
      email: "info@wellnesscollective.com",
      website: "www.wellnesscollective.com"
    }
  }
];

const categories = [
  "All Categories",
  "Music",
  "Art",
  "Community",
  "Food",
  "Technology",
  "Health & Wellness",
  "Sports",
  "Education",
  "Business",
  "Entertainment"
];

const EventBookingModal = ({ event, isOpen, onClose }: { event: Record<string, unknown>; isOpen: boolean; onClose: () => void }) => {
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
          {/* Event Details */}
          <div className="flex gap-4">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-32 h-24 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{event.date}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{event.time}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{event.attendees} / {event.maxAttendees} attending</span>
              </div>
            </div>
          </div>

          {/* Ticket Selection */}
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
                  onClick={() => setTickets(Math.min(event.maxAttendees - event.attendees, tickets + 1))}
                  disabled={tickets >= event.maxAttendees - event.attendees}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">
              {event.price === "Free" ? "Free" : `$${totalPrice}`}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              className="flex-1 btn-event"
              onClick={() => {
                // Handle booking logic
                console.log(`Booking ${tickets} tickets for ${event.title}`);
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

          {/* Contact Information */}
          {showContact && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold">Contact Information</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{event.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{event.contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{event.contact.website}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("date");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const { events, loading, toggleAttendance } = useEvents();
  const { toast } = useToast();

  // Use real events if available, otherwise fall back to sample events
  const allEvents = events.length > 0 ? events : sampleEvents;

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCategory = selectedCategory === "All Categories" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        try {
          const dateA = new Date(a.event_date || a.date);
          const dateB = new Date(b.event_date || b.date);
          return dateA.getTime() - dateB.getTime();
        } catch {
          return 0;
        }
      case "popularity":
        return (b.attendees_count || b.attendees || 0) - (a.attendees_count || a.attendees || 0);
      case "price": {
        const priceA = a.price === "Free" ? 0 : (typeof a.price === 'string' ? parseInt(a.price.replace("$", "")) : a.price);
        const priceB = b.price === "Free" ? 0 : (typeof b.price === 'string' ? parseInt(b.price.replace("$", "")) : b.price);
        return priceA - priceB;
      }
      default:
        return 0;
    }
  });

  // For now, we'll use the first event as featured if it exists
  const featuredEvent = sortedEvents.length > 0 ? sortedEvents[0] : null;
  const upcomingEvents = sortedEvents.slice(1); // All events except the featured one

  const handleBookEvent = (event: Record<string, unknown>) => {
    setSelectedEvent(event);
    setIsBookingModalOpen(true);
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Events</h1>
            <p className="text-muted-foreground mt-2">
              Discover and book amazing local events
            </p>
          </div>
          <Button className="btn-event" asChild>
            <Link to="/create-event">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Featured Event Banner */}
        {featuredEvent && (
          <section className="hero-section rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
            <div className="relative p-8 md:p-12 text-white">
              <div className="max-w-4xl">
                <Badge className="mb-4 bg-orange-500 hover:bg-orange-600">
                  <Flame className="w-3 h-3 mr-1" />
                  Featured Event
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  {featuredEvent.title}
                </h2>
                <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl">
                  {featuredEvent.description}
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{featuredEvent.event_date || featuredEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{featuredEvent.event_time || featuredEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{featuredEvent.location_name || featuredEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{(featuredEvent.attendees_count || featuredEvent.attendees || 0)} attending</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="btn-event"
                    onClick={() => toggleAttendance(featuredEvent.id)}
                  >
                    <Ticket className="w-5 h-5 mr-2" />
                    {featuredEvent.price === 0 || featuredEvent.price === "Free" ? "Free" : `$${featuredEvent.price}`}
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                    <Heart className="w-5 h-5 mr-2" />
                    Save Event
                  </Button>
                </div>
              </div>
            </div>
            <img 
              src={featuredEvent.image_url || featuredEvent.image || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop"} 
              alt={featuredEvent.title}
              className="absolute inset-0 w-full h-full object-cover -z-10"
            />
          </section>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
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
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
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

        {/* Events Grid/List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Upcoming Events ({upcomingEvents.length})
            </h2>
          </div>
          
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                // Loading skeleton
                [...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : upcomingEvents.length > 0 ? (
                                 upcomingEvents.map((event) => (
                   <EventCard
                     key={event.id}
                     event={event}
                     onAttend={toggleAttendance}
                     onBook={(eventId) => {
                       toast({
                         title: "Feature Coming Soon",
                         description: "Event booking functionality will be available soon!",
                       });
                     }}
                     onLike={(eventId) => {
                       toast({
                         title: "Feature Coming Soon",
                         description: "Event liking functionality will be available soon!",
                       });
                     }}
                     onChat={(eventId, organizerId) => {
                       toast({
                         title: "Feature Coming Soon",
                         description: "Chat functionality will be available soon!",
                       });
                     }}
                     verified={Math.random() > 0.7} // Randomly show some as verified for demo
                   />
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
                // Loading skeleton for list view
                [...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
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
                ))
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <Card key={event.id} className="event-card group cursor-pointer hover:shadow-event transition-all duration-300">
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
                              onClick={() => toggleAttendance(event.id)}
                            >
                              <Ticket className="w-4 h-4 mr-2" />
                              {event.price === 0 || event.price === "Free" ? "Free" : `$${event.price}`}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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

        {/* Empty State */}
        {upcomingEvents.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or create a new event
              </p>
              <Button className="btn-event">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Booking Modal */}
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

export default Events;
