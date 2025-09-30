/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use ConsolidatedBooking.tsx instead.
 * Category: booking
 * 
 * This page has been consolidated to provide a better, more consistent user experience.
 * All functionality from this page is available in the consolidated version.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notificationService";
import { Star, Users, MapPin, Clock } from "lucide-react";
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
  rating?: number;
  artist_skills?: string[];
}

const BookArtistSimple = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    eventType: "",
    duration: "",
    budget: "",
    location: "",
    description: "",
    contactEmail: "",
    contactPhone: ""
  });

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

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const handleArtistClick = (artist: Artist) => {
    navigate(`/artist/${artist.user_id}`);
  };

  const handleBooking = async () => {
    if (!selectedArtist || !user) return;

    try {
      const { error } = await supabase
        .from('artist_bookings')
        .insert({
          user_id: user.id,
          artist_id: selectedArtist.user_id,
          event_date: new Date().toISOString(),
          event_location: bookingData.location,
          event_description: bookingData.description,
          budget_min: bookingData.budget ? parseInt(bookingData.budget) : null,
          budget_max: bookingData.budget ? parseInt(bookingData.budget) + 1000 : null,
          contact_info: bookingData.contactEmail || bookingData.contactPhone,
          status: 'pending'
        });

      if (error) throw error;

      // Send notification to artist
      await notificationService.createNotification({
        user_id: selectedArtist.user_id,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `You have a new booking request from ${user.user_metadata?.display_name || 'a user'}`,
        data: {
          booking_id: selectedArtist.id,
          client_id: user.id
        }
      });

      toast({
        title: "Booking Request Sent",
        description: "Your booking request has been sent to the artist.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to send booking request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading artists...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Book an Artist</h1>
          <p className="text-gray-600">Find and book local artists for your events</p>
        </div>

        {!selectedArtist ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <Card 
                key={artist.id} 
                className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                onClick={() => handleArtistClick(artist)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {artist.display_name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{artist.display_name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">
                          {artist.rating?.toFixed(1) || '4.5'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{artist.bio}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{artist.location_city}, {artist.location_state}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArtist(artist);
                      }}
                      className="flex-1"
                    >
                      Book Now
                    </Button>
                    <div onClick={(e) => e.stopPropagation()}>
                      <FollowButton userId={artist.user_id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Book {selectedArtist.display_name}</CardTitle>
                    <CardDescription>Fill out the details for your booking request</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedArtist(null)}
                  >
                    Back to Artists
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select value={bookingData.eventType} onValueChange={(value) => setBookingData({...bookingData, eventType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="birthday">Birthday Party</SelectItem>
                        <SelectItem value="concert">Concert</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="2"
                      value={bookingData.duration}
                      onChange={(e) => setBookingData({...bookingData, duration: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Event Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter event location"
                    value={bookingData.location}
                    onChange={(e) => setBookingData({...bookingData, location: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Budget (₹)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="5000"
                    value={bookingData.budget}
                    onChange={(e) => setBookingData({...bookingData, budget: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Event Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event and what you're looking for..."
                    value={bookingData.description}
                    onChange={(e) => setBookingData({...bookingData, description: e.target.value})}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={bookingData.contactEmail}
                      onChange={(e) => setBookingData({...bookingData, contactEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={bookingData.contactPhone}
                      onChange={(e) => setBookingData({...bookingData, contactPhone: e.target.value})}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleBooking}
                  className="w-full"
                  disabled={!bookingData.eventType || !bookingData.location || !bookingData.description}
                >
                  Send Booking Request
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default BookArtistSimple;
