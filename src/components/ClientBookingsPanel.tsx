import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, DollarSign, User, MessageCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ClientBooking {
  id: string;
  artist_id: string;
  event_date: string;
  event_location: string;
  event_description: string;
  budget_min: number;
  budget_max?: number;
  status: string;
  created_at: string;
  artist_name: string;
  artist_avatar: string;
  artist_specialty: string;
}

export const ClientBookingsPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClientBookings();
      
      // Subscribe to real-time updates for booking status changes
      const channel = supabase
        .channel('client-bookings')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'artist_bookings',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchClientBookings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchClientBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('artist_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch artist profile data for each booking
      const transformedBookings = await Promise.all(
        (data || []).map(async (booking) => {
          // Get artist profile
          const { data: artistProfile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, artist_skills')
            .eq('user_id', booking.artist_id)
            .single();

          return {
            ...booking,
            artist_name: artistProfile?.display_name || 'Unknown Artist',
            artist_avatar: artistProfile?.avatar_url || '',
            artist_specialty: artistProfile?.artist_skills?.[0] || 'Artist'
          };
        })
      );

      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching client bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load your bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-600">Accepted</Badge>;
      case 'declined':
        return <Badge variant="outline" className="text-red-600 border-red-600">Declined</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          My Bookings
        </CardTitle>
        <CardDescription>
          View and manage your booking requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No bookings yet</p>
            <p className="text-sm">Your booking requests will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{booking.artist_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {booking.artist_specialty} • {format(new Date(booking.created_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(booking.event_date), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{booking.event_location || 'Location TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {booking.budget_min && booking.budget_max 
                          ? `$${booking.budget_min} - $${booking.budget_max}`
                          : 'Budget TBD'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{booking.event_description}</p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Booking Details</DialogTitle>
                          <DialogDescription>
                            Full information about this booking
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Artist Information</h4>
                            <p>Name: {booking.artist_name}</p>
                            <p>Specialty: {booking.artist_specialty}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Event Details</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Date:</strong> {format(new Date(booking.event_date), 'PPP')}</p>
                              <p><strong>Location:</strong> {booking.event_location}</p>
                              <p><strong>Description:</strong> {booking.event_description}</p>
                              <p><strong>Budget:</strong> 
                                {booking.budget_min && booking.budget_max 
                                  ? ` $${booking.budget_min} - $${booking.budget_max}`
                                  : ' Not specified'
                                }
                              </p>
                              <p><strong>Status:</strong> <span className="capitalize">{booking.status}</span></p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <div className="flex gap-2">
                      {booking.status === 'accepted' && (
                        <Button 
                          size="sm"
                          onClick={() => window.location.href = `/chat/${booking.id}`}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat with Artist
                        </Button>
                      )}
                      {booking.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Cancel booking functionality could be added here
                            toast({
                              title: "Contact Support",
                              description: "Please contact support to cancel this booking",
                            });
                          }}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
