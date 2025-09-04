import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notificationService";
import { CalendarIcon, Star, Users, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { sanitizeText, sanitizeEmail } from "@/lib/sanitize";
import { FollowButton } from "@/components/FollowButton";

interface Artist {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url?: string;
  location_city: string;
  location_state: string;
  is_verified: boolean;
  specialty?: string;
  rating?: number;
  artist_skills?: string[];
}

const BookArtist = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [bookingData, setBookingData] = useState({
    eventType: "",
    duration: "",
    budget: "",
    location: "",
    description: "",
    contactEmail: "",
    contactPhone: ""
  });

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const fetchArtists = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'artist')
        .not('display_name', 'is', null)
        .not('bio', 'is', null)
        .limit(20);

      if (error) throw error;

      // Transform data to use real artist skills or fallback to mock data
      const transformedArtists = data.map(profile => ({
        ...profile,
        specialty: profile.artist_skills?.[0] || ['Musician', 'Photographer', 'Painter', 'Performer', 'DJ'][Math.floor(Math.random() * 5)],
        rating: 4.2 + Math.random() * 0.8
      }));

      setArtists(transformedArtists);
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast({
        title: "Error",
        description: "Failed to load artists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleBooking = async () => {
    if (!selectedArtist || !bookingDate) {
      toast({
        title: "Missing Information",
        description: "Please select an artist and booking date.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a booking request.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Sanitize all input data
      const sanitizedData = {
        eventType: sanitizeText(bookingData.eventType, 100),
        duration: sanitizeText(bookingData.duration, 50),
        budget: sanitizeText(bookingData.budget, 50),
        location: sanitizeText(bookingData.location, 500),
        description: sanitizeText(bookingData.description, 2000),
        contactEmail: sanitizeEmail(bookingData.contactEmail),
        contactPhone: sanitizeText(bookingData.contactPhone, 20)
      };

      // Parse budget range like "$100-$300" or "$1000+"
      const parseBudget = (budget: string): { min: number | null; max: number | null } => {
        if (!budget) return { min: null, max: null };
        const cleaned = budget.replace(/\$/g, '').replace(/,/g, '').trim();
        if (cleaned.endsWith('+')) {
          const min = parseFloat(cleaned.slice(0, -1));
          return { min: isNaN(min) ? null : min, max: null };
        }
        if (cleaned.includes('-')) {
          const [minStr, maxStr] = cleaned.split('-').map(s => s.trim());
          const min = parseFloat(minStr);
          const max = parseFloat(maxStr);
          return { min: isNaN(min) ? null : min, max: isNaN(max) ? null : max };
        }
        const value = parseFloat(cleaned);
        return { min: isNaN(value) ? null : value, max: null };
      };

      const { min: budgetMinParsed, max: budgetMaxParsed } = parseBudget(sanitizedData.budget);

      // Find the artists.id for the selected profile user
      const { data: artistRow, error: artistLookupError } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', selectedArtist.user_id)
        .single();

      if (artistLookupError || !artistRow?.id) {
        throw artistLookupError || new Error('Artist profile not found');
      }

      // Create a booking request (NOT a feed post)
      const { data: bookingRow, error: bookingError } = await supabase
        .from('artist_bookings')
        .insert({
          user_id: user.id,
          artist_id: artistRow.id,
          event_date: bookingDate.toISOString(),
          event_location: sanitizedData.location,
          event_description: sanitizedData.description,
          budget_min: budgetMinParsed,
          budget_max: budgetMaxParsed,
          contact_info: `Email: ${sanitizedData.contactEmail}\nPhone: ${sanitizedData.contactPhone}`,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Notify the artist using the notification service
      try {
        await notificationService.createBookingRequestNotification(
          selectedArtist.user_id,
          user.id,
          {
            id: bookingRow.id,
            event_type: sanitizedData.eventType,
            event_date: bookingDate.toISOString(),
            event_location: sanitizedData.location,
            budget_min: budgetMinParsed,
            budget_max: budgetMaxParsed
          }
        );
      } catch (notificationError) {
        console.error('Error creating booking notification:', notificationError);
        // Don't fail the booking if notification fails
      }

      toast({
        title: "Booking Request Sent!",
        description: "Your booking request has been submitted. The artist will be notified.",
      });

      // Reset form
      setSelectedArtist(null);
      setBookingDate(undefined);
      setBookingData({
        eventType: "",
        duration: "",
        budget: "",
        location: "",
        description: "",
        contactEmail: "",
        contactPhone: ""
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Book Local Artists</h1>
          </div>
          <p className="text-muted-foreground">
            Find and book talented local artists for your events and special occasions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Artist Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Available Artists</h2>
            <div className="grid gap-4 max-h-[600px] overflow-y-auto">
              {artists.map((artist) => (
                <Card 
                  key={artist.id} 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedArtist?.id === artist.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedArtist(artist)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{artist.display_name}</CardTitle>
                          {artist.is_verified && (
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-xs text-primary-foreground">✓</span>
                            </div>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span>{artist.specialty}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{artist.rating?.toFixed(1)}</span>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{artist.bio}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {artist.location_city}, {artist.location_state}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/artist/${artist.user_id}`, '_blank');
                          }}
                        >
                          View Profile
                        </Button>
                        <FollowButton 
                          userId={artist.user_id}
                          size="sm"
                          className=""
                        />
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedArtist(artist);
                          }}
                        >
                          Quick Book
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Booking Details</h2>
            {selectedArtist ? (
              <Card>
                <CardHeader>
                  <CardTitle>Book {selectedArtist.display_name}</CardTitle>
                  <CardDescription>
                    Fill out the details for your booking request
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select value={bookingData.eventType} onValueChange={(value) => setBookingData({...bookingData, eventType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="birthday">Birthday Party</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="festival">Festival</SelectItem>
                        <SelectItem value="private">Private Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Event Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !bookingDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bookingDate ? format(bookingDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={bookingDate}
                          onSelect={setBookingDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select value={bookingData.duration} onValueChange={(value) => setBookingData({...bookingData, duration: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                          <SelectItem value="3-4 hours">3-4 hours</SelectItem>
                          <SelectItem value="full-day">Full day</SelectItem>
                          <SelectItem value="multiple-days">Multiple days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Range</Label>
                      <Select value={bookingData.budget} onValueChange={(value) => setBookingData({...bookingData, budget: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Budget" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="$100-$300">$100-$300</SelectItem>
                          <SelectItem value="$300-$500">$300-$500</SelectItem>
                          <SelectItem value="$500-$1000">$500-$1000</SelectItem>
                          <SelectItem value="$1000+">$1000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Event Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter event location"
                      value={bookingData.location}
                      onChange={(e) => setBookingData({...bookingData, location: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Event Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your event and any specific requirements..."
                      value={bookingData.description}
                      onChange={(e) => setBookingData({...bookingData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Contact Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={bookingData.contactEmail}
                        onChange={(e) => setBookingData({...bookingData, contactEmail: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Contact Phone</Label>
                      <Input
                        id="phone"
                        placeholder="(555) 123-4567"
                        value={bookingData.contactPhone}
                        onChange={(e) => setBookingData({...bookingData, contactPhone: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button onClick={handleBooking} className="w-full">
                    Send Booking Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      Select an artist to start your booking request
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default BookArtist;
