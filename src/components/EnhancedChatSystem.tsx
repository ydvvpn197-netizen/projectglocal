import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Plus,
  Search,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  Settings,
  Shield,
  Eye,
  EyeOff,
  Clock,
  Check,
  CheckCheck,
  Image,
  File,
  Smile,
  Mic,
  MicOff
} from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id?: string;
  chat_room_id?: string;
  message_type: 'text' | 'image' | 'file' | 'audio';
  media_url?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    display_name: string;
    avatar_url?: string;
  };
  is_read: boolean;
  read_at?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  is_group: boolean;
  is_public: boolean;
  created_by: string;
  created_at: string;
  last_message?: ChatMessage;
  unread_count: number;
  participants: ChatParticipant[];
}

interface ChatParticipant {
  id: string;
  user_id: string;
  chat_room_id: string;
  joined_at: string;
  role: 'admin' | 'member';
  user: {
    display_name: string;
    avatar_url?: string;
    is_online: boolean;
  };
}

interface EnhancedChatSystemProps {
  className?: string;
}

export const EnhancedChatSystem: React.FC<EnhancedChatSystemProps> = ({
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('direct');
  
  // Message state
  const [newMessage, setNewMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadChatRooms();
  }, [loadChatRooms]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      subscribeToMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatRooms = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          participants(
            id,
            user_id,
            role,
            joined_at,
            user:profiles!chat_room_participants_user_id_fkey(
              display_name,
              avatar_url,
              is_online
            )
          ),
          last_message:chat_messages(
            id,
            content,
            sender_id,
            created_at,
            sender:profiles!chat_messages_sender_id_fkey(
              display_name
            )
          )
        `)
        .contains('participants', [{ user_id: user?.id }])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const roomsData = data?.map(room => ({
        ...room,
        unread_count: 0, // TODO: Calculate unread count
        participants: room.participants || []
      })) || [];

      setChatRooms(roomsData);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load chat rooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const loadMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = (roomId: string) => {
    const subscription = supabase
      .channel(`chat_room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${roomId}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${roomId}`
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage;
          setMessages(prev => 
            prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
        }
      )
      .subscribe();

    return subscription;
  };

  const handleSendMessage = async () => {
    if (!selectedRoom || !newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: selectedRoom.id,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text',
          is_anonymous: isAnonymous
        });

      if (error) throw error;

      setNewMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleCreateRoom = async () => {
    if (!user || !newRoomName.trim()) return;

    try {
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: newRoomName.trim(),
          description: newRoomDescription.trim() || null,
          is_group: isGroupChat,
          is_public: false,
          created_by: user.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as participant
      const { error: participantError } = await supabase
        .from('chat_room_participants')
        .insert({
          chat_room_id: roomData.id,
          user_id: user.id,
          role: 'admin'
        });

      if (participantError) throw participantError;

      toast({
        title: "Room Created",
        description: "Your chat room has been created successfully",
      });

      setNewRoomName('');
      setNewRoomDescription('');
      setIsGroupChat(false);
      setShowCreateRoom(false);
      loadChatRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create chat room",
        variant: "destructive",
      });
    }
  };

  const handleTyping = () => {
    setIsTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const getMessageStatusIcon = (message: ChatMessage) => {
    if (message.is_read) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    return <Check className="h-3 w-3 text-muted-foreground" />;
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredRooms = chatRooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Community Chat
        </CardTitle>
        <CardDescription>
          Connect and chat with your community members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Direct Messages</TabsTrigger>
            <TabsTrigger value="rooms">Chat Rooms</TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button size="sm" onClick={() => setShowCreateRoom(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {filteredRooms.filter(room => !room.is_group).map((room) => (
                <div
                  key={room.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                    selectedRoom?.id === room.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={room.participants.find(p => p.user_id !== user?.id)?.user.avatar_url} />
                    <AvatarFallback>
                      {room.participants.find(p => p.user_id !== user?.id)?.user.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {room.participants.find(p => p.user_id !== user?.id)?.user.display_name || 'Unknown User'}
                      </p>
                      {room.participants.find(p => p.user_id !== user?.id)?.user.is_online && (
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    {room.last_message && (
                      <p className="text-sm text-muted-foreground truncate">
                        {room.last_message.sender?.display_name}: {room.last_message.content}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {room.last_message && formatMessageTime(room.last_message.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search chat rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button size="sm" onClick={() => setShowCreateRoom(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {filteredRooms.filter(room => room.is_group).map((room) => (
                <div
                  key={room.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                    selectedRoom?.id === room.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {room.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{room.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {room.participants.length} members
                      </Badge>
                    </div>
                    {room.description && (
                      <p className="text-sm text-muted-foreground truncate">{room.description}</p>
                    )}
                    {room.last_message && (
                      <p className="text-sm text-muted-foreground truncate">
                        {room.last_message.sender?.display_name}: {room.last_message.content}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {room.last_message && formatMessageTime(room.last_message.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Chat Interface */}
        {selectedRoom && (
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedRoom.participants.find(p => p.user_id !== user?.id)?.user.avatar_url} />
                  <AvatarFallback>
                    {selectedRoom.is_group 
                      ? selectedRoom.name.charAt(0).toUpperCase()
                      : selectedRoom.participants.find(p => p.user_id !== user?.id)?.user.display_name?.charAt(0) || 'U'
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedRoom.is_group 
                      ? selectedRoom.name
                      : selectedRoom.participants.find(p => p.user_id !== user?.id)?.user.display_name || 'Unknown User'
                    }
                  </p>
                  {selectedRoom.is_group && (
                    <p className="text-sm text-muted-foreground">
                      {selectedRoom.participants.length} members
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="h-96 border rounded-lg p-4 mb-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender_id !== user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender?.avatar_url} />
                        <AvatarFallback>
                          {message.is_anonymous ? '?' : message.sender?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {message.is_anonymous ? 'Anonymous' : message.sender?.display_name}
                        </span>
                        <span className="text-xs opacity-70">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      {message.sender_id === user?.id && (
                        <div className="flex justify-end mt-1">
                          {getMessageStatusIcon(message)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(!!checked)}
                />
                <Label htmlFor="anonymous" className="text-sm flex items-center gap-1">
                  {isAnonymous ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  Send anonymously
                </Label>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create Chat Room</CardTitle>
                <CardDescription>
                  Create a new chat room for your community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="room_name">Room Name</Label>
                  <Input
                    id="room_name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Enter room name"
                  />
                </div>
                <div>
                  <Label htmlFor="room_description">Description (Optional)</Label>
                  <Textarea
                    id="room_description"
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    placeholder="Enter room description"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_group"
                    checked={isGroupChat}
                    onCheckedChange={(checked) => setIsGroupChat(!!checked)}
                  />
                  <Label htmlFor="is_group">Group chat</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateRoom} className="flex-1">
                    Create Room
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateRoom(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedChatSystem;
