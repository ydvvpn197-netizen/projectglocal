import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Settings,
  ArrowLeft,
  Send,
  UserX,
  Block,
  Phone,
  Video,
  Image,
  File,
  Smile,
  Paperclip,
  MoreHorizontal,
  Star,
  Flag,
  Reply,
  Forward,
  Copy,
  Trash2,
  Edit3,
  Heart,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Shield,
  Crown,
  Zap,
  Activity,
  TrendingUp,
  Users,
  Globe,
  MapPin,
  Calendar,
  Bell,
  Home,
  Navigation,
  Compass,
  Flag as FlagIcon,
  Hash,
  AtSign,
  ExternalLink,
  BookOpen,
  Music,
  Camera,
  Mic,
  Coffee,
  Car,
  Building,
  Leaf,
  Mountain,
  Globe as GlobeIcon,
  UserPlus as UserPlusIcon,
  Crown as CrownIcon,
  Sparkles,
  TrendingUp as TrendingUpIcon,
  TrendingDown,
  Activity as ActivityIcon,
  BarChart3,
  MessageSquare,
  Navigation as NavigationIcon,
  Compass as CompassIcon,
  Flag as FlagIcon2,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  ExternalLink as ExternalLinkIcon,
  BookOpen as BookOpenIcon,
  Music as MusicIcon,
  Camera as CameraIcon,
  Mic as MicIcon,
  Coffee as CoffeeIcon,
  Car as CarIcon,
  Building as BuildingIcon,
  Leaf as LeafIcon,
  Mountain as MountainIcon,
  Globe as GlobeIcon2,
  UserPlus as UserPlusIcon2,
  Crown as CrownIcon2,
  Sparkles as SparklesIcon,
  TrendingUp as TrendingUpIcon2,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon2,
  BarChart3 as BarChart3Icon,
  MessageSquare as MessageSquareIcon,
  Navigation as NavigationIcon2,
  Compass as CompassIcon2,
  Flag as FlagIcon3,
  Hash as HashIcon2,
  AtSign as AtSignIcon2,
  ExternalLink as ExternalLinkIcon2,
  BookOpen as BookOpenIcon2,
  Music as MusicIcon2,
  Camera as CameraIcon2,
  Mic as MicIcon2,
  Coffee as CoffeeIcon2,
  Car as CarIcon2,
  Building as BuildingIcon2,
  Leaf as LeafIcon2,
  Mountain as MountainIcon2,
  Globe as GlobeIcon3,
  UserPlus as UserPlusIcon3,
  Crown as CrownIcon3,
  Sparkles as SparklesIcon2,
  TrendingUp as TrendingUpIcon3,
  TrendingDown as TrendingDownIcon2,
  Activity as ActivityIcon3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/hooks/useChat';
import { ChatService, ChatConversationDetails, ChatMessage } from '@/services/chatService';
import { format } from 'date-fns';

interface ChatConversation {
  id: string;
  title: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: string;
  }>;
  lastMessage?: {
    content: string;
    timestamp: string;
    sender: string;
  };
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  type: 'direct' | 'group' | 'channel';
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
  timestamp: string;
  isRead: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  reactions: Array<{
    emoji: string;
    users: string[];
  }>;
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
  attachments?: Array<{
    id: string;
    type: 'image' | 'file' | 'video' | 'audio';
    url: string;
    name: string;
    size: number;
  }>;
}

const ConsolidatedChat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'conversations' | 'chat'>('conversations');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'archived'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [forwardToConversations, setForwardToConversations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await ChatService.getConversations();
        if (response.success) {
          setConversations(response.data || []);
        } else {
          setError(response.error || 'Failed to load conversations');
        }
      } catch (err) {
        setError('Failed to load conversations');
        console.error('Error loading conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const loadMessages = async () => {
        try {
          setLoading(true);
          const response = await ChatService.getMessages(selectedConversation.id);
          if (response.success) {
            setMessages(response.data || []);
          } else {
            setError(response.error || 'Failed to load messages');
          }
        } catch (err) {
          setError('Failed to load messages');
          console.error('Error loading messages:', err);
        } finally {
          setLoading(false);
        }
      };

      loadMessages();
    }
  }, [selectedConversation]);

  // Handle conversation selection
  const handleConversationSelect = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    setActiveTab('chat');
    setReplyToMessage(null);
    setForwardMessage(null);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        conversationId: selectedConversation.id,
        replyTo: replyToMessage?.id,
        attachments: []
      };

      const response = await ChatService.sendMessage(messageData);
      if (response.success) {
        setNewMessage('');
        setReplyToMessage(null);
        // Refresh messages
        const messagesResponse = await ChatService.getMessages(selectedConversation.id);
        if (messagesResponse.success) {
          setMessages(messagesResponse.data || []);
        }
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to send message",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      console.error('Error sending message:', err);
    }
  };

  // Handle key press for sending message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Handle file upload logic here
      console.log('Files selected:', files);
    }
  };

  // Handle message reaction
  const handleMessageReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await ChatService.addReaction(messageId, emoji);
      if (response.success) {
        // Refresh messages to show updated reactions
        if (selectedConversation) {
          const messagesResponse = await ChatService.getMessages(selectedConversation.id);
          if (messagesResponse.success) {
            setMessages(messagesResponse.data || []);
          }
        }
      }
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };

  // Handle message reply
  const handleMessageReply = (message: Message) => {
    setReplyToMessage(message);
    textareaRef.current?.focus();
  };

  // Handle message forward
  const handleMessageForward = (message: Message) => {
    setForwardMessage(message);
    setShowForwardDialog(true);
  };

  // Handle message edit
  const handleMessageEdit = (message: Message) => {
    setSelectedMessage(message);
    setNewMessage(message.content);
    textareaRef.current?.focus();
  };

  // Handle message delete
  const handleMessageDelete = async (messageId: string) => {
    try {
      const response = await ChatService.deleteMessage(messageId);
      if (response.success) {
        // Refresh messages
        if (selectedConversation) {
          const messagesResponse = await ChatService.getMessages(selectedConversation.id);
          if (messagesResponse.success) {
            setMessages(messagesResponse.data || []);
          }
        }
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  // Filter conversations based on search and filter
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'unread' && conversation.unreadCount > 0) ||
                         (filterType === 'archived' && conversation.isArchived);
    return matchesSearch && matchesFilter;
  });

  // Render conversation list
  const renderConversationList = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('all')}
        >
          All
        </Button>
        <Button
          variant={filterType === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('unread')}
        >
          Unread
        </Button>
        <Button
          variant={filterType === 'archived' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('archived')}
        >
          Archived
        </Button>
      </div>

      <div className="space-y-2">
        {filteredConversations.map((conversation) => (
          <Card
            key={conversation.id}
            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => handleConversationSelect(conversation)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversation.participants[0]?.avatar} />
                    <AvatarFallback>
                      {conversation.participants[0]?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.participants[0]?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm truncate">
                      {conversation.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      {conversation.isPinned && (
                        <Star className="w-3 h-3 text-yellow-500" />
                      )}
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {conversation.lastMessage?.timestamp && 
                      format(new Date(conversation.lastMessage.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render chat interface
  const renderChatInterface = () => {
    if (!selectedConversation) return null;

    return (
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab('conversations')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src={selectedConversation.participants[0]?.avatar} />
              <AvatarFallback>
                {selectedConversation.participants[0]?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{selectedConversation.title}</h3>
              <p className="text-sm text-gray-600">
                {selectedConversation.participants.length} participants
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender.id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${message.sender.id === currentUser?.id ? 'order-2' : 'order-1'}`}>
                <div className="flex items-end gap-2">
                  {message.sender.id !== currentUser?.id && (
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback>
                        {message.sender.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.sender.id === currentUser?.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-70">
                        {format(new Date(message.timestamp), 'h:mm a')}
                      </span>
                      {message.sender.id === currentUser?.id && (
                        <div className="flex items-center gap-1">
                          {message.isRead ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          {replyToMessage && (
            <div className="mb-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Replying to {replyToMessage.sender.name}</p>
                  <p className="text-xs text-gray-600">{replyToMessage.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyToMessage(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="min-h-[40px] max-h-32 resize-none"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveLayout>
      <div className="h-screen flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-white">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Messages</h2>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
          <div className="p-4">
            {renderConversationList()}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'conversations' ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the sidebar to start chatting
                </p>
              </div>
            </div>
          ) : (
            renderChatInterface()
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedChat;
