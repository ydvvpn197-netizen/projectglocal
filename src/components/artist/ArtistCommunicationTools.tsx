import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Send, 
  Bell, 
  BellOff, 
  Users, 
  Calendar,
  Clock,
  Star,
  Heart,
  Reply,
  MoreVertical,
  Search,
  Filter,
  Archive,
  Trash2,
  Pin,
  Volume2,
  VolumeX,
  Video,
  Phone,
  Mail,
  Share2,
  Copy,
  Flag,
  Shield,
  Eye,
  EyeOff,
  Camera,
  Image,
  File,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  PhoneCall,
  VideoCall,
  MessageCircle,
  MessageCircleIcon,
  Chat,
  ChatIcon,
  Comments,
  CommentsIcon,
  Discussion,
  DiscussionIcon,
  Forum,
  ForumIcon,
  Thread,
  ThreadIcon,
  Conversation,
  ConversationIcon,
  Dialogue,
  DialogueIcon,
  Talk,
  TalkIcon,
  Speak,
  SpeakIcon,
  Voice,
  VoiceIcon,
  Audio,
  AudioIcon,
  Sound,
  SoundIcon,
  Music,
  MusicIcon,
  Play,
  PlayIcon,
  Pause,
  PauseIcon,
  Stop,
  StopIcon,
  Record,
  RecordIcon,
  Recording,
  RecordingIcon,
  Live,
  LiveIcon,
  Broadcast,
  BroadcastIcon,
  Stream,
  StreamIcon,
  Podcast,
  PodcastIcon,
  Radio,
  RadioIcon,
  Tv,
  TvIcon,
  Monitor,
  MonitorIcon,
  Laptop,
  LaptopIcon,
  Desktop,
  DesktopIcon,
  Tablet,
  TabletIcon,
  Smartphone,
  SmartphoneIcon,
  Mobile,
  MobileIcon,
  Device,
  DeviceIcon,
  Gadget,
  GadgetIcon,
  Tool,
  ToolIcon,
  Wrench,
  WrenchIcon,
  Settings,
  SettingsIcon,
  Cog,
  CogIcon,
  Gear,
  GearIcon,
  Sliders,
  SlidersIcon,
  Toggle,
  ToggleIcon,
  Switch,
  SwitchIcon,
  Button as ButtonIcon,
  ButtonIcon as ButtonIcon2,
  Click,
  ClickIcon,
  Tap,
  TapIcon,
  Touch,
  TouchIcon,
  Gesture,
  GestureIcon,
  Move,
  MoveIcon,
  Drag,
  DragIcon,
  Drop,
  DropIcon,
  Upload,
  UploadIcon,
  Download,
  DownloadIcon,
  Import,
  ImportIcon,
  Export,
  ExportIcon,
  Sync,
  SyncIcon,
  Refresh,
  RefreshIcon,
  Update,
  UpdateIcon,
  Upgrade,
  UpgradeIcon,
  Downgrade,
  DowngradeIcon,
  Install,
  InstallIcon,
  Uninstall,
  UninstallIcon,
  Setup,
  SetupIcon,
  Configure,
  ConfigureIcon,
  Customize,
  CustomizeIcon,
  Personalize,
  PersonalizeIcon,
  Modify,
  ModifyIcon,
  Change,
  ChangeIcon,
  Edit,
  EditIcon,
  Update as UpdateIcon2,
  UpdateIcon as UpdateIcon3,
  Upgrade as UpgradeIcon2,
  UpgradeIcon as UpgradeIcon3,
  Downgrade as DowngradeIcon2,
  DowngradeIcon as DowngradeIcon3,
  Install as InstallIcon2,
  InstallIcon as InstallIcon3,
  Uninstall as UninstallIcon2,
  UninstallIcon as UninstallIcon3,
  Setup as SetupIcon2,
  SetupIcon as SetupIcon3,
  Configure as ConfigureIcon2,
  ConfigureIcon as ConfigureIcon3,
  Customize as CustomizeIcon2,
  CustomizeIcon as CustomizeIcon3,
  Personalize as PersonalizeIcon2,
  PersonalizeIcon as PersonalizeIcon3,
  Modify as ModifyIcon2,
  ModifyIcon as ModifyIcon3,
  Change as ChangeIcon2,
  ChangeIcon as ChangeIcon3,
  Edit as EditIcon2,
  EditIcon as EditIcon3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ArtistCommunicationToolsProps {
  artistId: string;
  isOwnProfile?: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'booking_request' | 'system';
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
  metadata?: Record<string, unknown>;
}

interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message?: Message;
  unread_count: number;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'booking' | 'follow' | 'like' | 'comment' | 'system';
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface CommunicationSettings {
  allow_direct_messages: boolean;
  allow_booking_requests: boolean;
  allow_follow_notifications: boolean;
  allow_engagement_notifications: boolean;
  message_notifications: boolean;
  email_notifications: boolean;
  auto_reply_enabled: boolean;
  auto_reply_message: string;
  business_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
    timezone: string;
    days: string[];
  };
}

export function ArtistCommunicationTools({ artistId, isOwnProfile = false }: ArtistCommunicationToolsProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<CommunicationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('messages');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (user) {
      loadCommunicationData();
    }
  }, [user, artistId, loadCommunicationData]);

  const loadCommunicationData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadConversations(),
        loadNotifications(),
        loadSettings()
      ]);
    } catch (error) {
      console.error('Error loading communication data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadConversations, loadNotifications, loadSettings]);

  const loadConversations = useCallback(async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        profiles!conversations_participant_id_fkey(display_name, avatar_url)
      `)
      .or(`user1_id.eq.${artistId},user2_id.eq.${artistId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const formattedConversations: Conversation[] = (data || []).map(conv => ({
      id: conv.id,
      participant_id: conv.user1_id === artistId ? conv.user2_id : conv.user1_id,
      participant_name: conv.profiles?.display_name || 'Unknown User',
      participant_avatar: conv.profiles?.avatar_url,
      last_message: conv.last_message,
      unread_count: conv.unread_count || 0,
      is_pinned: conv.is_pinned || false,
      is_archived: conv.is_archived || false,
      created_at: conv.created_at,
      updated_at: conv.updated_at
    }));

    setConversations(formattedConversations);
  }, [artistId]);

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_sender_id_fkey(display_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const formattedMessages: Message[] = (data || []).map(msg => ({
      id: msg.id,
      sender_id: msg.sender_id,
      recipient_id: msg.recipient_id,
      content: msg.content,
      type: msg.type,
      is_read: msg.is_read,
      created_at: msg.created_at,
      sender_name: msg.profiles?.display_name,
      sender_avatar: msg.profiles?.avatar_url,
      metadata: msg.metadata
    }));

    setMessages(formattedMessages);
  };

  const loadNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', artistId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    setNotifications(data || []);
  }, [artistId]);

  const loadSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from('communication_settings')
      .select('*')
      .eq('user_id', artistId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    setSettings(data || {
      allow_direct_messages: true,
      allow_booking_requests: true,
      allow_follow_notifications: true,
      allow_engagement_notifications: true,
      message_notifications: true,
      email_notifications: false,
      auto_reply_enabled: false,
      auto_reply_message: '',
      business_hours: {
        enabled: false,
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'Asia/Kolkata',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    });
  }, [artistId]);

  const sendMessage = async (conversationId: string, content: string) => {
    if (!content.trim()) return;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user?.id,
        content: content.trim(),
        type: 'text'
      })
      .select()
      .single();

    if (error) throw error;

    // Update local state
    const newMessage: Message = {
      id: data.id,
      sender_id: data.sender_id,
      recipient_id: data.recipient_id,
      content: data.content,
      type: data.type,
      is_read: data.is_read,
      created_at: data.created_at,
      sender_name: user?.user_metadata?.display_name,
      sender_avatar: user?.user_metadata?.avatar_url
    };

    setMessages(prev => [...prev, newMessage]);
    setNewMessage('');
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    );
  };

  const updateSettings = async (newSettings: Partial<CommunicationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    
    const { error } = await supabase
      .from('communication_settings')
      .upsert({
        user_id: artistId,
        ...updatedSettings
      });

    if (error) throw error;
    setSettings(updatedSettings);
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participant_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'unread' && conv.unread_count > 0) ||
      (filterType === 'pinned' && conv.is_pinned) ||
      (filterType === 'archived' && conv.is_archived);
    
    return matchesSearch && matchesFilter;
  });

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notif.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'unread' && !notif.is_read) ||
      (filterType === 'message' && notif.type === 'message') ||
      (filterType === 'booking' && notif.type === 'booking');
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading communication tools...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Communication Tools</h2>
          <p className="text-muted-foreground">Manage messages, notifications, and communication settings</p>
        </div>
        {isOwnProfile && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send New Message</DialogTitle>
                <DialogDescription>
                  Start a conversation with another user
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Recipient</label>
                  <Input placeholder="Search for a user..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea placeholder="Type your message..." rows={4} />
                </div>
                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Communication Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="pinned">Pinned</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={`cursor-pointer transition-colors ${
                      activeConversation?.id === conversation.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setActiveConversation(conversation);
                      loadMessages(conversation.id);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {conversation.participant_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conversation.participant_name}</p>
                            <div className="flex items-center gap-1">
                              {conversation.is_pinned && <Pin className="h-3 w-3 text-muted-foreground" />}
                              {conversation.unread_count > 0 && (
                                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {conversation.last_message && (
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.last_message.content}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(conversation.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="lg:col-span-2">
              {activeConversation ? (
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {activeConversation.participant_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{activeConversation.participant_name}</h3>
                          <p className="text-sm text-muted-foreground">Online</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${message.sender_id === user?.id ? 'order-2' : 'order-1'}`}>
                          <div className={`rounded-lg p-3 ${
                            message.sender_id === user?.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            sendMessage(activeConversation.id, newMessage);
                          }
                        }}
                      />
                      <Button
                        onClick={() => sendMessage(activeConversation.id, newMessage)}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                    <p className="text-muted-foreground">Choose a conversation to start messaging</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="booking">Bookings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card key={notification.id} className={!notification.is_read ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {notification.type === 'message' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                      {notification.type === 'booking' && <Calendar className="h-5 w-5 text-green-600" />}
                      {notification.type === 'follow' && <Users className="h-5 w-5 text-purple-600" />}
                      {notification.type === 'like' && <Heart className="h-5 w-5 text-red-600" />}
                      {notification.type === 'comment' && <Reply className="h-5 w-5 text-orange-600" />}
                      {notification.type === 'system' && <Bell className="h-5 w-5 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <Badge variant="destructive" className="h-2 w-2 p-0" />
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-1">{notification.content}</p>
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {settings && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Message Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Allow Direct Messages</h4>
                      <p className="text-sm text-muted-foreground">Let other users send you direct messages</p>
                    </div>
                    <Button
                      variant={settings.allow_direct_messages ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ allow_direct_messages: !settings.allow_direct_messages })}
                    >
                      {settings.allow_direct_messages ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Allow Booking Requests</h4>
                      <p className="text-sm text-muted-foreground">Let users send booking requests through messages</p>
                    </div>
                    <Button
                      variant={settings.allow_booking_requests ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ allow_booking_requests: !settings.allow_booking_requests })}
                    >
                      {settings.allow_booking_requests ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto Reply</h4>
                      <p className="text-sm text-muted-foreground">Automatically reply to messages when you're away</p>
                    </div>
                    <Button
                      variant={settings.auto_reply_enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ auto_reply_enabled: !settings.auto_reply_enabled })}
                    >
                      {settings.auto_reply_enabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  {settings.auto_reply_enabled && (
                    <div>
                      <label className="text-sm font-medium">Auto Reply Message</label>
                      <Textarea
                        value={settings.auto_reply_message}
                        onChange={(e) => updateSettings({ auto_reply_message: e.target.value })}
                        placeholder="Thank you for your message. I'll get back to you soon!"
                        rows={3}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Message Notifications</h4>
                      <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
                    </div>
                    <Button
                      variant={settings.message_notifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ message_notifications: !settings.message_notifications })}
                    >
                      {settings.message_notifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                    </div>
                    <Button
                      variant={settings.email_notifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ email_notifications: !settings.email_notifications })}
                    >
                      {settings.email_notifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Follow Notifications</h4>
                      <p className="text-sm text-muted-foreground">Get notified when someone follows you</p>
                    </div>
                    <Button
                      variant={settings.allow_follow_notifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ allow_follow_notifications: !settings.allow_follow_notifications })}
                    >
                      {settings.allow_follow_notifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Engagement Notifications</h4>
                      <p className="text-sm text-muted-foreground">Get notified for likes, comments, and shares</p>
                    </div>
                    <Button
                      variant={settings.allow_engagement_notifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ allow_engagement_notifications: !settings.allow_engagement_notifications })}
                    >
                      {settings.allow_engagement_notifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
