import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { EventOrganizerChatService, EventOrganizerChat, EventOrganizerMessage } from '@/services/eventOrganizerChatService';
import { 
  MessageCircle, 
  Send, 
  X, 
  Clock,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EventOrganizerChatProps {
  eventId: string;
  organizerId: string;
  organizerName?: string;
  organizerAvatar?: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const EventOrganizerChat: React.FC<EventOrganizerChatProps> = ({
  eventId,
  organizerId,
  organizerName = "Event Organizer",
  organizerAvatar,
  isOpen,
  onClose,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chat, setChat] = useState<EventOrganizerChat | null>(null);
  const [messages, setMessages] = useState<EventOrganizerMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && eventId && organizerId) {
      initializeChat();
    }
  }, [isOpen, eventId, organizerId, initializeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = useCallback(async () => {
    try {
      setLoading(true);
      const { chat: chatData, error } = await EventOrganizerChatService.getOrCreateChat(eventId, organizerId);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (chatData) {
        setChat(chatData);
        await loadMessages(chatData.id);
        await markMessagesAsRead(chatData.id);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, organizerId, toast, loadMessages]);

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const { messages: messagesData, error } = await EventOrganizerChatService.getChatMessages(chatId);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [toast]);

  const markMessagesAsRead = async (chatId: string) => {
    try {
      await EventOrganizerChatService.markMessagesAsRead(chatId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chat || sending) return;

    try {
      setSending(true);
      const { message, error } = await EventOrganizerChatService.sendMessage({
        chat_id: chat.id,
        message: newMessage.trim(),
        message_type: 'text'
      });

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}>
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={organizerAvatar} />
              <AvatarFallback>
                {organizerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{organizerName}</CardTitle>
              <p className="text-sm text-muted-foreground">Event Organizer</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
                <p className="text-muted-foreground">
                  Send a message to {organizerName} about this event.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender_id === user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.sender?.avatar_url} />
                        <AvatarFallback>
                          {message.sender?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg px-3 py-2 ${message.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${message.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[40px] max-h-[120px] resize-none"
                disabled={sending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                size="sm"
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventOrganizerChat;
