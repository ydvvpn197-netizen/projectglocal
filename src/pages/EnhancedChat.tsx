import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft,
  Send,
  Check,
  CheckCheck,
  Clock,
  UserPlus,
  UserX,
  MoreVertical,
  Archive,
  Block,
  Phone,
  Video,
  Image,
  File,
  Smile,
  Paperclip
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChatService, ChatConversationDetails, ChatMessage } from '@/services/chatService';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const EnhancedChat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [conversation, setConversation] = useState<ChatConversationDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (conversationId && currentUser) {
      loadConversation();
      setupRealtimeSubscription();
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [conversationId, currentUser, loadConversation, setupRealtimeSubscription]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = useCallback(async () => {
    if (!conversationId || !currentUser) return;

    setIsLoading(true);
    try {
      const [conversationData, messagesData] = await Promise.all([
        ChatService.getConversationDetails(conversationId, currentUser.id),
        ChatService.getConversationMessages(conversationId)
      ]);

      setConversation(conversationData);
      setMessages(messagesData.reverse()); // Reverse to show oldest first

      // Mark messages as read
      if (conversationData) {
        await ChatService.markMessagesAsRead(conversationId, currentUser.id);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, currentUser, toast]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat_messages_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
          
          // Mark as read if it's not from current user
          if (newMessage.sender_id !== currentUser?.id) {
            ChatService.markMessagesAsRead(conversationId!, currentUser!.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_conversations',
          filter: `id=eq.${conversationId}`
        },
        (payload) => {
          const updatedConversation = payload.new as ChatConversationDetails;
          setConversation(prev => prev ? { ...prev, ...updatedConversation } : null);
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, [conversationId, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !currentUser || isSending) return;

    setIsSending(true);
    try {
      const message = await ChatService.sendMessage(
        conversationId,
        currentUser.id,
        newMessage.trim()
      );

      if (message) {
        setNewMessage('');
        setMessages(prev => [...prev, message]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleAcceptConversation = async () => {
    if (!conversationId) return;

    try {
      const success = await ChatService.acceptConversation(conversationId, currentUser!.id);
      if (success) {
        setShowAcceptDialog(false);
        toast({
          title: "Conversation Accepted",
          description: "You can now chat with this user",
        });
        loadConversation();
      } else {
        throw new Error('Failed to accept conversation');
      }
    } catch (error) {
      console.error('Error accepting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to accept conversation",
        variant: "destructive",
      });
    }
  };

  const handleRejectConversation = async () => {
    if (!conversationId) return;

    try {
      const success = await ChatService.blockConversation(conversationId, currentUser!.id);
      if (success) {
        toast({
          title: "Conversation Blocked",
          description: "This conversation has been blocked",
        });
        navigate('/messages');
      } else {
        throw new Error('Failed to block conversation');
      }
    } catch (error) {
      console.error('Error blocking conversation:', error);
      toast({
        title: "Error",
        description: "Failed to block conversation",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return timestamp;
    }
  };

  const formatMessageDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM dd, yyyy');
      }
    } catch {
      return timestamp;
    }
  };

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!conversation) {
    return (
      <ResponsiveLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Conversation Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This conversation doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/messages')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Messages
          </Button>
        </div>
      </ResponsiveLayout>
    );
  }

  const isOwnMessage = (senderId: string) => senderId === currentUser?.id;
  const canSendMessages = conversation.status === 'active';

  return (
    <ResponsiveLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/messages')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <Avatar className="w-10 h-10">
              <AvatarImage src={conversation.other_user?.avatar_url || undefined} />
              <AvatarFallback>
                {conversation.other_user?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {conversation.other_user?.display_name || 'Unknown User'}
                </h3>
                {conversation.other_user?.is_verified && (
                  <Badge variant="secondary" size="sm">Verified</Badge>
                )}
                {conversation.other_user?.is_premium && (
                  <Badge variant="default" size="sm">Premium</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                @{conversation.other_user?.username || 'anonymous'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {conversation.status === 'pending' && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Pending
              </Badge>
            )}
            {conversation.status === 'active' && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Active
              </Badge>
            )}
            {conversation.status === 'blocked' && (
              <Badge variant="outline" className="text-red-600 border-red-600">
                Blocked
              </Badge>
            )}
            
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {conversation.status === 'pending' 
                  ? 'This conversation is pending approval'
                  : 'No messages yet. Start the conversation!'
                }
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const showDate = index === 0 || 
                formatMessageDate(messages[index - 1].created_at) !== formatMessageDate(message.created_at);
              
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center py-2">
                      <Badge variant="secondary" className="text-xs">
                        {formatMessageDate(message.created_at)}
                      </Badge>
                    </div>
                  )}
                  
                  <div className={`flex gap-3 ${isOwnMessage(message.sender_id) ? 'flex-row-reverse' : ''}`}>
                    {!isOwnMessage(message.sender_id) && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={conversation.other_user?.avatar_url || undefined} />
                        <AvatarFallback>
                          {conversation.other_user?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[70%] ${isOwnMessage(message.sender_id) ? 'text-right' : ''}`}>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isOwnMessage(message.sender_id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                      </div>
                      
                      <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                        isOwnMessage(message.sender_id) ? 'justify-end' : ''
                      }`}>
                        <span>{formatMessageTime(message.created_at)}</span>
                        {isOwnMessage(message.sender_id) && (
                          <span>
                            {message.is_read ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        {conversation.status === 'pending' ? (
          <div className="p-4 border-t bg-muted/50">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                This user wants to start a conversation with you
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => setShowAcceptDialog(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRejectConversation}
                  className="flex items-center gap-2"
                >
                  <UserX className="w-4 h-4" />
                  Block
                </Button>
              </div>
            </div>
          </div>
        ) : canSendMessages ? (
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="min-h-[40px] max-h-32 resize-none pr-12"
                  disabled={isSending}
                />
                <div className="absolute right-2 bottom-2 flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t bg-muted/50">
            <p className="text-center text-sm text-muted-foreground">
              This conversation is blocked or archived
            </p>
          </div>
        )}

        {/* Accept Conversation Dialog */}
        <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accept Conversation Request</DialogTitle>
              <DialogDescription>
                Do you want to allow {conversation.other_user?.display_name} to start a conversation with you?
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex gap-3">
              <Button
                onClick={handleAcceptConversation}
                className="flex-1"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAcceptDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ResponsiveLayout>
  );
};

export default EnhancedChat;
