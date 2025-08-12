import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Clock, Users, Plus } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { useState, useEffect, useMemo } from "react";
import { useEvents } from "@/hooks/useEvents";
import { EventFiltersComponent, EventFilters } from "@/components/EventFilters";
import { CreateEventButton } from "@/components/CreateEventButton";

const Events = () => {
  const { events: upcomingEvents, loading, toggleAttendance } = useEvents();
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


  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    return upcomingEvents.filter(event => {
      // Event type filter
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.category || '')) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const eventDate = new Date(event.event_date);
        if (filters.dateRange.from && eventDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && eventDate > filters.dateRange.to) return false;
      }

      // Time range filter
      if (filters.timeRange.startTime !== "00:00" || filters.timeRange.endTime !== "23:59") {
        const eventTime = event.event_time;
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
      if (filters.area && !event.location_name.toLowerCase().includes(filters.area.toLowerCase())) {
        return false;
      }

      // Free events filter
      if (filters.freeOnly && event.price && event.price > 0) {
        return false;
      }

      return true;
    });
  }, [upcomingEvents, filters]);

  const myEvents = filteredEvents.filter(event => event.user_attending);

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

  const getEventEmoji = (category?: string) => {
    const emojiMap: { [key: string]: string } = {
      'Art & Culture': '🎨',
      'Music': '🎵',
      'Food & Drink': '🍕',
      'Sports & Fitness': '⚽',
      'Technology': '💻',
      'Business': '💼',
      'Education': '📚',
      'Health & Wellness': '🌿',
      'Community': '🏘️',
      'Entertainment': '🎭',
    };
    return emojiMap[category || ''] || '🌟';
  };

  const EventCard = ({ event }: { event: typeof upcomingEvents[0] }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="text-4xl">{getEventEmoji(event.category)}</div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </div>
          {event.category && <Badge variant="secondary">{event.category}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(event.event_date)}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {event.event_time}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {event.location_name}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {event.attendees_count} attending
            </div>
            {event.price > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold">${event.price}</span>
              </div>
            )}
          </div>
          <Button 
            className="w-full" 
            variant={event.user_attending ? "secondary" : "default"}
            onClick={() => toggleAttendance(event.id)}
          >
            {event.user_attending ? "Going" : "Attend Event"}
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
            <CreateEventButton />
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