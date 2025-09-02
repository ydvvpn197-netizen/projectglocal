
import { useEffect, useState } from "react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConversationRow {
  id: string;
  booking_id: string | null;
  client_id: string;
  artist_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  other_user?: {
    user_id: string;
    display_name?: string;
    avatar_url?: string;
  };
}

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ConversationRow[]>([]);
  const [requests, setRequests] = useState<ConversationRow[]>([]);

  useEffect(() => {
    if (user) fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .or(`client_id.eq.${user.id},artist_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const rows = (data as ConversationRow[]) || [];

      // Fetch profiles for counterpart users
      const otherUserIds = rows.map(r => (r.client_id === user.id ? r.artist_id : r.client_id));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', otherUserIds);
      const map = new Map((profiles || []).map(p => [p.user_id, p]));

      const decorated = rows.map(r => ({
        ...r,
        other_user: map.get(r.client_id === user.id ? r.artist_id : r.client_id)
      }));

      setActive(decorated.filter(r => r.status === 'active'));
      setRequests(decorated.filter(r => r.status === 'pending' && r.client_id !== user.id));
    } catch (err: any) {
      console.error('Error loading conversations:', err);
      toast({ title: 'Error', description: err.message || 'Failed to load messages', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (id: string) => {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to accept request', variant: 'destructive' });
    } else {
      fetchConversations();
      toast({ title: 'Request accepted' });
    }
  };

  const declineRequest = async (id: string) => {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to decline request', variant: 'destructive' });
    } else {
      fetchConversations();
      toast({ title: 'Request declined' });
    }
  };

  return (
    <ResponsiveLayout>
      <div className="container max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with your connections. Requests must be accepted before chatting.</p>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : active.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2" />
                  No active conversations
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {active.map(c => (
                  <Card key={c.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`/chat/${c.id}`)}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={c.other_user?.avatar_url} />
                        <AvatarFallback>{c.other_user?.display_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{c.other_user?.display_name || 'User'}</span>
                          {c.booking_id && <Badge variant="secondary">Booking</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">Started {format(new Date(c.created_at), 'PPp')}</div>
                      </div>
                      <Button variant="outline" size="sm">Open</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : requests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2" />
                  No pending requests
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {requests.map(c => (
                  <Card key={c.id}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={c.other_user?.avatar_url} />
                        <AvatarFallback>{c.other_user?.display_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{c.other_user?.display_name || 'User'}</div>
                        <div className="text-xs text-muted-foreground">Requested {format(new Date(c.created_at), 'PPp')}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => acceptRequest(c.id)}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => declineRequest(c.id)}>Decline</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default Messages;


