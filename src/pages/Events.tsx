import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Clock, Users, Plus } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "@/hooks/useLocation";
import { EventFiltersComponent, EventFilters } from "@/components/EventFilters";

const Events = () => {
  const { currentLocation, isEnabled: locationEnabled } = useLocation();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({
    eventTypes: [],
    dateRange: {},
    timeRange: {
      startTime: "00:00",
      endTime: "23:59"
    },
    proximity: 50,
    area: "",
    priceRange: {
      min: 0,
      max: 10000
    },
    freeOnly: false
  });

  useEffect(() => {
    fetchEvents();
  }, [currentLocation, locationEnabled]);

  const fetchEvents = async () => {
    try {
      // Determine location to use
      let locationParam = 'Your Area';
      if (locationEnabled && currentLocation) {
        locationParam = `${currentLocation.latitude},${currentLocation.longitude}`;
      }

      const { data, error } = await supabase.functions.invoke('fetch-local-events', {
        body: { location: locationParam }
      });
      
      if (error) throw error;
      
      // Transform the events to match our current interface
      const transformedEvents = data.events?.map((event: any, index: number) => ({
        id: index + 1,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        attendees: event.attendees,
        category: event.category,
        isGoing: Math.random() > 0.8, // Randomly assign some as "going"
        image: ["🎨", "🍕", "🎷", "⚽", "🎭", "📚", "🌟", "🎪"][index % 8]
      })) || [];
      
      setUpcomingEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to static data
      setUpcomingEvents(staticEvents);
    } finally {
      setLoading(false);
    }
  };

  const staticEvents = [
    {
      id: 1,
      title: "Local Art Exhibition Opening",
      description: "Join us for the grand opening of our newest art exhibition featuring local artists.",
      date: "2024-01-15",
      time: "7:00 PM",
      location: "Downtown Gallery",
      attendees: 45,
      category: "Art",
      isGoing: false,
      image: "🎨"
    },
    {
      id: 2,
      title: "Community Food Festival",
      description: "Taste the best local cuisine from food trucks and restaurants around the city.",
      date: "2024-01-20",
      time: "12:00 PM",
      location: "Central Park",
      attendees: 234,
      category: "Food",
      isGoing: true,
      image: "🍕"
    },
    {
      id: 3,
      title: "Live Jazz Performance",
      description: "An intimate evening of live jazz music featuring local musicians.",
      date: "2024-01-18",
      time: "8:30 PM",
      location: "Blue Note Cafe",
      attendees: 67,
      category: "Music",
      isGoing: false,
      image: "🎷"
    }
  ];

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    return upcomingEvents.filter(event => {
      // Event type filter
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.category)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const eventDate = new Date(event.date);
        if (filters.dateRange.from && eventDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && eventDate > filters.dateRange.to) return false;
      }

      // Time range filter
      if (filters.timeRange.startTime !== "00:00" || filters.timeRange.endTime !== "23:59") {
        const eventTime = event.time.replace(/[^0-9:]/g, ''); // Extract time only
        const [hours, minutes] = eventTime.split(':').map(Number);
        const eventTimeMinutes = hours * 60 + minutes;
        
        const [startHours, startMinutes] = filters.timeRange.startTime.split(':').map(Number);
        const startTimeMinutes = startHours * 60 + startMinutes;
        
        const [endHours, endMinutes] = filters.timeRange.endTime.split(':').map(Number);
        const endTimeMinutes = endHours * 60 + endMinutes;
        
        if (eventTimeMinutes < startTimeMinutes || eventTimeMinutes > endTimeMinutes) {
          return false;
        }
      }

      // Area filter
      if (filters.area && !event.location.toLowerCase().includes(filters.area.toLowerCase())) {
        return false;
      }

      // Free events filter
      if (filters.freeOnly && event.price && event.price > 0) {
        return false;
      }

      return true;
    });
  }, [upcomingEvents, filters]);

  const myEvents = filteredEvents.filter(event => event.isGoing);

  const clearFilters = () => {
    setFilters({
      eventTypes: [],
      dateRange: {},
      timeRange: {
        startTime: "00:00",
        endTime: "23:59"
      },
      proximity: 50,
      area: "",
      priceRange: {
        min: 0,
        max: 10000
      },
      freeOnly: false
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const EventCard = ({ event }: { event: typeof upcomingEvents[0] }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="text-4xl">{event.image}</div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </div>
          <Badge variant="secondary">{event.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {event.time}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {event.attendees} attending
            </div>
          </div>
          <Button 
            className="w-full" 
            variant={event.isGoing ? "secondary" : "default"}
          >
            {event.isGoing ? "Going" : "Attend Event"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Events</h1>
            </div>
            <p className="text-muted-foreground">
              Discover and join amazing events happening in your community.
            </p>
          </div>
          <div className="flex gap-2">
            <EventFiltersComponent 
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
            />
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Events Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="my-events">My Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No events found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters to see more events.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-events" className="space-y-6">
            {myEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't joined any events yet. Browse upcoming events to find something interesting!
                  </p>
                  <Button>Browse Events</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            <Card className="text-center py-12">
              <CardContent>
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No past events</h3>
                <p className="text-muted-foreground">
                  Your attended events will appear here once you've joined some events.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Events;