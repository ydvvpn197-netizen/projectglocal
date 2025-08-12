import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, DollarSign, User, MessageCircle, Check, X, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BookingRequest {
  id: string;
  user_id: string;
  title: string;
  content: string;
  contact_info: string;
  event_date: string;
  event_location: string;
  price_range: string;
  created_at: string;
  client_name: string;
  client_avatar: string;
}

export const BookingRequestsPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookingRequests();
      
      // Subscribe to real-time updates for new booking requests
      const channel = supabase
        .channel('booking-requests')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'posts',
            filter: `type=eq.post`
          },
          () => {
            fetchBookingRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchBookingRequests = async () => {
    if (!user) return;

    try {
      // Find booking requests that mention this artist
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('type', 'post')
        .contains('tags', ['booking'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include client info
      const transformedRequests = data?.map(request => {
        // Handle the profiles data safely
        const profileData = Array.isArray(request.profiles) ? request.profiles[0] : request.profiles;
        return {
          ...request,
          client_name: profileData?.display_name || 'Unknown User',
          client_avatar: profileData?.avatar_url || ''
        };
      }) || [];

      setBookingRequests(transformedRequests);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      toast({
        title: "Error",
        description: "Failed to load booking requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (requestId: string, action: 'accept' | 'reject') => {
    setActionLoading(requestId);
    
    try {
      const request = bookingRequests.find(r => r.id === requestId);
      if (!request) return;

      // Create notification for the client
      await supabase
        .from('notifications')
        .insert({
          user_id: request.user_id,
          type: action === 'accept' ? 'booking_accepted' : 'booking_rejected',
          title: `Booking Request ${action === 'accept' ? 'Accepted' : 'Rejected'}`,
          message: `Your booking request has been ${action === 'accept' ? 'accepted' : 'rejected'} by the artist.`,
          data: { booking_id: requestId, artist_id: user?.id }
        });

      if (action === 'accept') {
        // Create a chat conversation for accepted bookings
        await supabase
          .from('chat_conversations')
          .insert({
            booking_id: requestId,
            client_id: request.user_id,
            artist_id: user?.id
          });

        toast({
          title: "Booking Accepted",
          description: "You've accepted the booking request. A chat has been started with the client.",
        });
      } else {
        toast({
          title: "Booking Rejected",
          description: "You've rejected the booking request.",
        });
      }

      // Remove the request from the local state
      setBookingRequests(prev => prev.filter(r => r.id !== requestId));
      
    } catch (error) {
      console.error('Error handling booking action:', error);
      toast({
        title: "Error",
        description: "Failed to process booking request",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const parseBookingContent = (content: string) => {
    const lines = content.split('\n');
    const details: Record<string, string> = {};
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        details[key.trim()] = valueParts.join(':').trim();
      }
    });
    
    return details;
  };

  if (!user) return null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
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
          Booking Requests
        </CardTitle>
        <CardDescription>
          Manage incoming booking requests from clients
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookingRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No booking requests yet</p>
            <p className="text-sm">Requests will appear here when clients book your services</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {bookingRequests.map((request) => {
                const details = parseBookingContent(request.content);
                return (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{request.client_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.created_at), 'PPp')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">New Request</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{details['Date'] || format(new Date(request.event_date), 'PPP')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{details['Duration'] || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{request.event_location || 'Location TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{request.price_range || 'Budget TBD'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Event Type: {details['Event Type'] || 'Not specified'}</p>
                      {details['Description'] && (
                        <p className="text-sm text-muted-foreground">{details['Description']}</p>
                      )}
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
                            <DialogTitle>Booking Request Details</DialogTitle>
                            <DialogDescription>
                              Full information about this booking request
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Client Information</h4>
                              <p>Name: {request.client_name}</p>
                              {request.contact_info && (
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {request.contact_info}
                                </p>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Event Details</h4>
                              <div className="space-y-1 text-sm">
                                {Object.entries(details).map(([key, value]) => (
                                  <p key={key}><strong>{key}:</strong> {value}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleBookingAction(request.id, 'reject')}
                          disabled={actionLoading === request.id}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleBookingAction(request.id, 'accept')}
                          disabled={actionLoading === request.id}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept & Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};