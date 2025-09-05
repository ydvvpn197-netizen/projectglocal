import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MapPin, DollarSign, User, MessageCircle, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ChatService } from "@/services/chatService";

interface AcceptedBooking {
  id: string;
  user_id: string;
  artist_id: string;
  event_date: string;
  event_location: string;
  event_description: string;
  budget_min: number;
  budget_max?: number;
  contact_info?: string;
  status: string;
  created_at: string;
  updated_at: string;
  client_name: string;
  client_avatar: string;
  chat_conversation_id?: string;
}

export const AcceptedBookingsPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [acceptedBookings, setAcceptedBookings] = useState<AcceptedBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAcceptedBookings = useCallback(async () => {
    if (!user) return;

    try {
      // First, get the artist record to get the correct artist_id
      const { data: artistRecord, error: artistError } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (artistError) {
        console.error('Error fetching artist record:', artistError);
        console.error('Artist error details:', {
          message: artistError.message,
          details: artistError.details,
          hint: artistError.hint,
          code: artistError.code
        });
        setAcceptedBookings([]);
        return;
      }

      console.log('Artist record found:', artistRecord);

      // Fetch accepted bookings
      const { data, error } = await supabase
        .from('artist_bookings')
        .select('*')
        .eq('artist_id', artistRecord.id)
        .eq('status', 'accepted')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      console.log('Bookings data:', data);

      // Fetch profile data and chat conversation for each booking
      const transformedBookings = await Promise.all(
        (data || []).map(async (booking) => {
          const [profileResult, chatResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('user_id', booking.user_id)
              .maybeSingle(), // Use maybeSingle() to handle missing profiles gracefully
            supabase
              .from('chat_conversations')
              .select('id')
              .eq('booking_id', booking.id)
              .maybeSingle() // Use maybeSingle() instead of single() to handle missing records gracefully
          ]);

          return {
            ...booking,
            client_name: profileResult.data?.display_name || 'Unknown User',
            client_avatar: profileResult.data?.avatar_url || '',
            chat_conversation_id: chatResult.data?.id
          };
        })
      );

      setAcceptedBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching accepted bookings:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast({
        title: "Error",
        description: "Failed to load accepted bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchAcceptedBookings();
      
      // Subscribe to real-time updates for accepted bookings
      const setupRealtimeSubscription = async () => {
        // Get the artist record to get the correct artist_id
        const { data: artistRecord, error: artistError } = await supabase
          .from('artists')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (artistError) {
          console.error('Error fetching artist record for realtime:', artistError);
          return;
        }

        const channel = supabase
          .channel('accepted-bookings')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'artist_bookings',
              filter: `artist_id=eq.${artistRecord.id}`
            },
            (payload) => {
              // Only refresh if status changed to accepted
              if (payload.new.status === 'accepted') {
                fetchAcceptedBookings();
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      };

      setupRealtimeSubscription();
    }
  }, [user, fetchAcceptedBookings]);

  const handleStartChat = async (bookingId: string) => {
    try {
      // Get or create conversation for this booking
      const conversationId = await ChatService.getOrCreateConversationForBooking(bookingId);
      
      if (conversationId) {
        navigate(`/chat/${conversationId}`);
      } else {
        toast({
          title: "Error",
          description: "Unable to start chat. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Error",
        description: "Unable to start chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accepted Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
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
          <CheckCircle className="h-5 w-5" />
          Accepted Bookings
        </CardTitle>
        <CardDescription>
          Manage your accepted booking requests and communicate with clients
        </CardDescription>
      </CardHeader>
      <CardContent>
        {acceptedBookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No accepted bookings yet</p>
            <p className="text-sm">Accepted booking requests will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {acceptedBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{booking.client_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Accepted {format(new Date(booking.updated_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(booking.event_date), 'PPp')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.event_location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${booking.budget_min} - ${booking.budget_max || 'No limit'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Created {format(new Date(booking.created_at), 'PPp')}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">Event Description:</p>
                    <p className="text-muted-foreground">{booking.event_description}</p>
                  </div>

                  {booking.contact_info && (
                    <div className="text-sm">
                      <p className="font-medium">Contact Information:</p>
                      <p className="text-muted-foreground whitespace-pre-line">{booking.contact_info}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleStartChat(booking.id)}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {booking.chat_conversation_id ? 'Continue Chat' : 'Start Chat'}
                    </Button>
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
