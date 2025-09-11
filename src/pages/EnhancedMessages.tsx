import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle,
  Search,
  Plus,
  Clock,
  Check,
  CheckCheck,
  UserPlus,
  Archive,
  MoreVertical,
  Filter,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChatService, ChatConversationDetails } from '@/services/chatService';
import { format } from 'date-fns';

const EnhancedMessages: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<ChatConversationDetails[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ChatConversationDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);

  const loadConversations = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const [allConversations, pending] = await Promise.all([
        ChatService.getUserConversations(currentUser.id),
        ChatService.getPendingRequests(currentUser.id)
      ]);

      setConversations(allConversations);
      setPendingRequests(pending);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (conversationId: string) => {
    try {
      const success = await ChatService.acceptConversation(conversationId, currentUser!.id);
      if (success) {
        toast({
          title: "Request Accepted",
          description: "You can now chat with this user",
        });
        loadConversations();
      } else {
        throw new Error('Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (conversationId: string) => {
    try {
      const success = await ChatService.blockConversation(conversationId, currentUser!.id);
      if (success) {
        toast({
          title: "Request Blocked",
          description: "This conversation has been blocked",
        });
        loadConversations();
      } else {
        throw new Error('Failed to block request');
      }
    } catch (error) {
      console.error('Error blocking request:', error);
      toast({
        title: "Error",
        description: "Failed to block request",
        variant: "destructive",
      });
    }
  };

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return format(date, 'HH:mm');
      } else if (diffInHours < 24) {
        return format(date, 'HH:mm');
      } else if (diffInHours < 168) { // 7 days
        return format(date, 'EEE');
      } else {
        return format(date, 'MMM dd');
      }
    } catch {
      return '';
    }
  };

  const getStatusIcon = (conversation: ChatConversationDetails) => {
    if (conversation.status === 'pending') {
      return <UserPlus className="w-4 h-4 text-orange-500" />;
    }
    
    if (conversation.last_message) {
      if (conversation.last_message.sender_id === currentUser?.id) {
        return conversation.last_message.is_read ? (
          <CheckCheck className="w-4 h-4 text-blue-500" />
        ) : (
          <Check className="w-4 h-4 text-muted-foreground" />
        );
      } else if (conversation.unread_count && conversation.unread_count > 0) {
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      }
    }
    
    return null;
  };

  const filteredConversations = conversations.filter(conversation => {
    if (activeTab === 'unread') {
      return conversation.unread_count && conversation.unread_count > 0;
    }
    if (activeTab === 'pending') {
      return conversation.status === 'pending';
    }
    if (activeTab === 'active') {
      return conversation.status === 'active';
    }
    return true;
  });

  const searchFilteredConversations = filteredConversations.filter(conversation => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conversation.other_user?.display_name?.toLowerCase().includes(query) ||
      conversation.other_user?.username?.toLowerCase().includes(query) ||
      conversation.last_message?.message.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Messages</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {conversations.some(c => c.unread_count && c.unread_count > 0) && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {conversations.filter(c => c.unread_count && c.unread_count > 0).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {activeTab === 'pending' ? (
              // Pending Requests
              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                      <p className="text-muted-foreground">
                        You don't have any pending conversation requests
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingRequests.map((conversation) => (
                    <Card key={conversation.id} className="border-orange-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={conversation.other_user?.avatar_url || undefined} />
                              <AvatarFallback>
                                {conversation.other_user?.display_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {conversation.other_user?.display_name || 'Unknown User'}
                                </h3>
                                {conversation.other_user?.is_verified && (
                                  <Badge variant="secondary" size="sm">Verified</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                @{conversation.other_user?.username || 'anonymous'}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Wants to start a conversation with you
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              Pending
                            </Badge>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptRequest(conversation.id)}
                                className="h-8"
                              >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectRequest(conversation.id)}
                                className="h-8"
                              >
                                Block
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              // Regular Conversations
              <div className="space-y-4">
                {searchFilteredConversations.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Conversations</h3>
                      <p className="text-muted-foreground">
                        {searchQuery 
                          ? 'No conversations match your search'
                          : 'Start a conversation with someone!'
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  searchFilteredConversations.map((conversation) => (
                    <Card 
                      key={conversation.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/chat/${conversation.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={conversation.other_user?.avatar_url || undefined} />
                              <AvatarFallback>
                                {conversation.other_user?.display_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.other_user?.is_verified && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold truncate">
                                {conversation.other_user?.display_name || 'Unknown User'}
                              </h3>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(conversation)}
                                <span className="text-xs text-muted-foreground">
                                  {formatLastMessageTime(conversation.last_message_at)}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.last_message?.message || 'No messages yet'}
                            </p>
                            
                            {conversation.unread_count && conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="mt-1 h-5 text-xs">
                                {conversation.unread_count} unread
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default EnhancedMessages;
