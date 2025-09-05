import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Clock, 
  MoreHorizontal, 
  Send,
  Search,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface ConversationRow {
  id: string;
  client_id: string;
  artist_id: string;
  status: 'pending' | 'active' | 'declined';
  created_at: string;
  updated_at: string;
  last_message?: {
    id: string;
    message: string;
    created_at: string;
    sender_id: string;
  };
  other_user?: {
    user_id: string;
    display_name: string;
    avatar_url?: string;
  };
  unread_count?: number;
}

interface MessagesTabContentProps {
  userId: string;
}

export const MessagesTabContent = ({ userId }: MessagesTabContentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user?.id]);

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch conversations where user is either client or artist
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('chat_conversations')
        .select('*')
        .or(`client_id.eq.${user.id},artist_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      const conversationRows = (conversationsData as ConversationRow[]) || [];

      // Fetch last messages for each conversation
      const conversationIds = conversationRows.map(c => c.id);
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('id, conversation_id, message, created_at, sender_id')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Group messages by conversation and get the latest one
      const latestMessages = new Map();
      (messagesData || []).forEach(msg => {
        if (!latestMessages.has(msg.conversation_id)) {
          latestMessages.set(msg.conversation_id, msg);
        }
      });

      // Fetch profiles for counterpart users
      const otherUserIds = conversationRows.map(r => 
        r.client_id === user.id ? r.artist_id : r.client_id
      );
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', otherUserIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      // Combine all data
      const decoratedConversations = conversationRows.map(conversation => ({
        ...conversation,
        last_message: latestMessages.get(conversation.id),
        other_user: profileMap.get(
          conversation.client_id === user.id 
            ? conversation.artist_id 
            : conversation.client_id
        )
      }));

      setConversations(decoratedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    const otherUserName = conversation.other_user?.display_name || '';
    const lastMessage = conversation.last_message?.message || '';
    return otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Messages</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/messages')}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            View All
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Start a conversation with other users to see your messages here'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/messages')}>
                <Send className="w-4 h-4 mr-2" />
                Start Messaging
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleConversationClick(conversation.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={conversation.other_user?.avatar_url} 
                        alt={conversation.other_user?.display_name}
                      />
                      <AvatarFallback>
                        {conversation.other_user?.display_name 
                          ? getInitials(conversation.other_user.display_name)
                          : 'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                    {conversation.status === 'pending' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.other_user?.display_name || 'Unknown User'}
                      </h3>
                      <div className="flex items-center gap-2">
                        {conversation.last_message && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatLastMessageTime(conversation.last_message.created_at)}
                          </span>
                        )}
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message 
                          ? truncateMessage(conversation.last_message.message)
                          : 'No messages yet'
                        }
                      </p>
                      <div className="flex items-center gap-1">
                        {conversation.status === 'pending' && (
                          <Badge variant="outline" className="text-xs">
                            Pending
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Show more conversations if there are many */}
      {conversations.length > 5 && (
        <div className="text-center pt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/messages')}
            className="w-full"
          >
            View All Messages ({conversations.length})
          </Button>
        </div>
      )}
    </div>
  );
};
