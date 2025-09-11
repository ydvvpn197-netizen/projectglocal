import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Heart, 
  Share2, 
  MessageCircle, 
  Star,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  ExternalLink,
  Building2,
  Megaphone,
  Vote,
  Tag,
  Send,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Award,
  Shield,
  UserCheck,
  Globe,
  Target,
  Zap,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  Lock,
  Unlock,
  Ticket,
  DollarSign,
  Phone,
  Mail,
  Camera,
  Image,
  Video,
  Music,
  Palette,
  Code,
  Coffee,
  Car,
  Building,
  Leaf,
  Mountain,
  HeartHandshake,
  Lightbulb,
  Rocket,
  ArrowUpRight,
  Info,
  Bell,
  BellOff,
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
  Sprout
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface CommunityEventsProps {
  className?: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  event_date: string;
  event_time: string;
  end_date?: string;
  end_time?: string;
  created_by: string;
  organizer_name: string;
  organizer_avatar?: string;
  image_url?: string;
  price: number;
  max_attendees?: number;
  attendees_count: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  visibility: 'public' | 'community' | 'private';
  government_tagged: boolean;
  government_authority?: string;
  community_impact_score: number;
  discussion_count: number;
  share_count: number;
  is_attending?: boolean;
  is_bookmarked?: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface EventDiscussion {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  likes_count: number;
  is_liked?: boolean;
}

const CommunityEvents: React.FC<CommunityEventsProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useLocation();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'trending' | 'community' | 'my-events'>('upcoming');
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [discussions, setDiscussions] = useState<EventDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Create event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    event_date: '',
    event_time: '',
    end_date: '',
    end_time: '',
    price: 0,
    max_attendees: '',
    visibility: 'public' as 'public' | 'community' | 'private',
    tags: [] as string[],
    government_tagged: false,
    government_authority: ''
  });

  // Load events
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles!left(
            full_name,
            avatar_url
          ),
          event_attendees!left(
            user_id,
            status
          )
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;

      const processedEvents = data?.map(event => {
        const isAttending = event.event_attendees?.some(
          (attendee: any) => attendee.user_id === user?.id && attendee.status === 'attending'
        );
        const isBookmarked = event.event_attendees?.some(
          (attendee: any) => attendee.user_id === user?.id && attendee.status === 'bookmarked'
        );
        
        const attendeesCount = event.event_attendees?.filter(
          (attendee: any) => attendee.status === 'attending'
        ).length || 0;

        return {
          ...event,
          organizer_name: event.profiles?.full_name || 'Anonymous',
          organizer_avatar: event.profiles?.avatar_url,
          is_attending: isAttending,
          is_bookmarked: isBookmarked,
          attendees_count: attendeesCount,
        };
      }) || [];

      setEvents(processedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Load event discussions
  const loadDiscussions = useCallback(async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_discussions')
        .select(`
          *,
          profiles!left(
            full_name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedDiscussions = data?.map(discussion => ({
        ...discussion,
        user_name: discussion.profiles?.full_name || 'Anonymous',
        user_avatar: discussion.profiles?.avatar_url,
      })) || [];

      setDiscussions(processedDiscussions);
    } catch (error) {
      console.error('Error loading discussions:', error);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

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
      const event = events.find(e => e.id === eventId);
      const isAttending = event?.is_attending;

      if (isAttending) {
        // Remove attendance
        await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .eq('status', 'attending');
      } else {
        // Add attendance
        await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'attending'
          });
      }

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              is_attending: !isAttending,
              attendees_count: isAttending ? event.attendees_count - 1 : event.attendees_count + 1
            }
          : event
      ));

      toast({
        title: isAttending ? "Left event" : "Joined event",
        description: isAttending ? "You've left the event" : "You're now attending this event",
      });
    } catch (error) {
      console.error('Error toggling attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    }
  };

  const handleBookmarkEvent = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark events",
        variant: "destructive",
      });
      return;
    }

    try {
      const event = events.find(e => e.id === eventId);
      const isBookmarked = event?.is_bookmarked;

      if (isBookmarked) {
        await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .eq('status', 'bookmarked');
      } else {
        await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'bookmarked'
          });
      }

      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, is_bookmarked: !isBookmarked }
          : event
      ));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleCreateEvent = async () => {
    if (!user || !newEvent.title.trim() || !newEvent.description.trim()) {
      toast({
        title: "Invalid event",
        description: "Please provide a title and description",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .insert({
          title: newEvent.title.trim(),
          description: newEvent.description.trim(),
          category: newEvent.category,
          location: newEvent.location.trim(),
          event_date: newEvent.event_date,
          event_time: newEvent.event_time,
          end_date: newEvent.end_date || null,
          end_time: newEvent.end_time || null,
          price: newEvent.price,
          max_attendees: newEvent.max_attendees ? parseInt(newEvent.max_attendees) : null,
          created_by: user.id,
          visibility: newEvent.visibility,
          government_tagged: newEvent.government_tagged,
          government_authority: newEvent.government_authority || null,
          tags: newEvent.tags
        });

      if (error) throw error;

      // Reset form
      setNewEvent({
        title: '',
        description: '',
        category: '',
        location: '',
        event_date: '',
        event_time: '',
        end_date: '',
        end_time: '',
        price: 0,
        max_attendees: '',
        visibility: 'public',
        tags: [],
        government_tagged: false,
        government_authority: ''
      });

      setShowCreateEvent(false);
      loadEvents();

      toast({
        title: "Event created",
        description: "Your event has been created successfully",
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleStartDiscussion = async () => {
    if (!user || !selectedEvent || !newDiscussion.trim()) {
      return;
    }

    try {
      const { error } = await supabase
        .from('event_discussions')
        .insert({
          event_id: selectedEvent.id,
          user_id: user.id,
          content: newDiscussion.trim()
        });

      if (error) throw error;

      setNewDiscussion('');
      loadDiscussions(selectedEvent.id);
      toast({
        title: "Discussion started",
        description: "Your discussion has been posted",
      });
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to start discussion",
        variant: "destructive",
      });
    }
  };

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    const matchesTab = 
      (activeTab === 'upcoming' && event.status === 'upcoming') ||
      (activeTab === 'trending' && event.attendees_count > 20) ||
      (activeTab === 'community' && event.visibility === 'community') ||
      (activeTab === 'my-events' && event.created_by === user?.id);
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'music': 'bg-purple-100 text-purple-800',
      'art': 'bg-pink-100 text-pink-800',
      'community': 'bg-blue-100 text-blue-800',
      'food': 'bg-orange-100 text-orange-800',
      'technology': 'bg-indigo-100 text-indigo-800',
      'health': 'bg-green-100 text-green-800',
      'sports': 'bg-red-100 text-red-800',
      'education': 'bg-yellow-100 text-yellow-800',
      'business': 'bg-gray-100 text-gray-800',
      'entertainment': 'bg-cyan-100 text-cyan-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'upcoming': 'bg-green-100 text-green-800',
      'ongoing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isEventExpired = (eventDate: string, eventTime: string) => {
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    return eventDateTime < new Date();
  };

  const getEventStatus = (event: CommunityEvent) => {
    const eventDateTime = new Date(`${event.event_date}T${event.event_time}`);
    const now = new Date();
    
    if (event.status === 'cancelled') return 'cancelled';
    if (eventDateTime < now) return 'completed';
    if (eventDateTime.toDateString() === now.toDateString()) return 'ongoing';
    return 'upcoming';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Community Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and participate in local community events and gatherings
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location?.city || 'Your City'}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {events.length} Events
          </Badge>
          <Button onClick={() => setShowCreateEvent(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search events by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="music">Music</SelectItem>
            <SelectItem value="art">Art</SelectItem>
            <SelectItem value="community">Community</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="sports">Sports</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="entertainment">Entertainment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community
          </TabsTrigger>
          <TabsTrigger value="my-events" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            My Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
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
            <div className="grid gap-4">
              {filteredEvents.map((event) => {
                const eventStatus = getEventStatus(event);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getCategoryColor(event.category)}>
                                {event.category}
                              </Badge>
                              <Badge className={getStatusColor(eventStatus)}>
                                {eventStatus}
                              </Badge>
                              {event.government_tagged && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  Government Tagged
                                </Badge>
                              )}
                              {event.price > 0 && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ₹{event.price}
                                </Badge>
                              )}
                            </div>
                            
                            <CardTitle className="text-lg leading-tight">
                              {event.title}
                            </CardTitle>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(event.event_date), 'MMM dd, yyyy')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.event_time}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.attendees_count} attending
                              </div>
                            </div>
                          </div>
                          
                          {event.image_url && (
                            <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted">
                              <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <CardDescription className="text-base">
                          {expandedEvents.has(event.id) ? event.description : event.description.substring(0, 200) + '...'}
                        </CardDescription>
                        
                        {event.description.length > 200 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleEventExpansion(event.id)}
                            className="p-0 h-auto text-blue-600 hover:text-blue-800"
                          >
                            {expandedEvents.has(event.id) ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Read more
                              </>
                            )}
                          </Button>
                        )}
                        
                        {/* Event Tags */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {event.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowDiscussion(true);
                                loadDiscussions(event.id);
                              }}
                              className="flex items-center gap-2 text-muted-foreground"
                            >
                              <MessageCircle className="h-4 w-4" />
                              {event.discussion_count}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-2 text-muted-foreground"
                            >
                              <Share2 className="h-4 w-4" />
                              {event.share_count}
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBookmarkEvent(event.id)}
                              className={`flex items-center gap-2 ${event.is_bookmarked ? 'text-blue-600' : 'text-muted-foreground'}`}
                            >
                              <Bookmark className={`h-4 w-4 ${event.is_bookmarked ? 'fill-current' : ''}`} />
                            </Button>
                            
                            {eventStatus === 'upcoming' && (
                              <Button
                                variant={event.is_attending ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleAttendEvent(event.id)}
                                className="flex items-center gap-2"
                              >
                                {event.is_attending ? (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    Attending
                                  </>
                                ) : (
                                  <>
                                    <Ticket className="h-4 w-4" />
                                    Attend
                                  </>
                                )}
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowDiscussion(true);
                                loadDiscussions(event.id);
                              }}
                              className="flex items-center gap-2"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Discuss
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Event Dialog */}
      <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Create Community Event</DialogTitle>
            <DialogDescription>
              Create an event to bring your community together
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Title *</label>
                <Input
                  placeholder="What's your event about?"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Describe your event, what attendees can expect..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={newEvent.category} onValueChange={(value) => setNewEvent(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="art">Art</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location *</label>
                  <Input
                    placeholder="Where is the event?"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Date *</label>
                  <Input
                    type="date"
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, event_date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Time *</label>
                  <Input
                    type="time"
                    value={newEvent.event_time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, event_time: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date (Optional)</label>
                  <Input
                    type="date"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time (Optional)</label>
                  <Input
                    type="time"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (₹)</label>
                  <Input
                    type="number"
                    placeholder="0 for free"
                    value={newEvent.price}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Attendees (Optional)</label>
                  <Input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={newEvent.max_attendees}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, max_attendees: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <Select value={newEvent.visibility} onValueChange={(value) => setNewEvent(prev => ({ ...prev, visibility: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="community">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Community Only
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Private
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} disabled={!newEvent.title.trim() || !newEvent.description.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discussion Dialog */}
      <Dialog open={showDiscussion} onOpenChange={setShowDiscussion}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Event Discussion</DialogTitle>
            <DialogDescription>
              {selectedEvent?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* New Discussion Form */}
            <div className="space-y-2">
              <Textarea
                placeholder="Share your thoughts, ask questions, or discuss the event..."
                value={newDiscussion}
                onChange={(e) => setNewDiscussion(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleStartDiscussion} disabled={!newDiscussion.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Post Discussion
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Existing Discussions */}
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <Card key={discussion.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={discussion.user_avatar} />
                          <AvatarFallback>
                            {discussion.user_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {discussion.user_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <p className="text-sm">{discussion.content}</p>
                          
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {discussion.likes_count}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityEvents;
