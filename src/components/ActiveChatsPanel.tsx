import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ChatConversation {
  id: string;
  booking_id: string;
  client_id: string;
  artist_id: string;
  status: string;
  created_at: string;
  client_name: string;
  client_avatar: string;
  event_date: string;
  event_location: string;
  unread_count: number;
}

export const ActiveChatsPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchConversations();
      
      // Subscribe to real-time updates for new messages
      const channel = supabase
        .channel('chat-conversations')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_conversations'
          },
          () => {
            fetchConversations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Fetch conversations where the current user is the artist
      const { data: conversationsData, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('artist_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch additional data for each conversation
      const enrichedConversations = await Promise.all(
        (conversationsData || []).map(async (conversation) => {
          // Get client profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', conversation.client_id)
            .single();

          // Get booking details
          const { data: bookingData } = await supabase
            .from('artist_bookings')
            .select('event_date, event_location')
            .eq('id', conversation.booking_id)
            .single();

          // Count unread messages (placeholder for now)
          const unread_count = 0;

          return {
            ...conversation,
            client_name: profileData?.display_name || 'Unknown User',
            client_avatar: profileData?.avatar_url || '',
            event_date: bookingData?.event_date || '',
            event_location: bookingData?.event_location || '',
            unread_count
          };
        })
      );

      setConversations(enrichedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openChat = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  if (!user) return null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Conversations</CardTitle>
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
          <MessageCircle className="h-5 w-5" />
          Active Conversations
        </CardTitle>
        <CardDescription>
          Chat with clients about accepted bookings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active conversations</p>
            <p className="text-sm">Conversations will appear here when you accept booking requests</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div 
                  key={conversation.id} 
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => openChat(conversation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.client_avatar} />
                        <AvatarFallback>
                          {conversation.client_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{conversation.client_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Started {format(new Date(conversation.created_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                    {conversation.unread_count > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{conversation.event_date ? format(new Date(conversation.event_date), 'PPP') : 'Date TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{conversation.event_location || 'Location TBD'}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button variant="outline" size="sm">
                      Open Chat
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
