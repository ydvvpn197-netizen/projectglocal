import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Settings, Megaphone, User, Filter, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';

// Notification item component
const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  onNavigate,
  isGeneral = false
}: {
  notification: any;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
  onNavigate: (notification: any) => void;
  isGeneral?: boolean;
}) => {
  const handleClick = () => {
    onNavigate(notification);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isGeneral) {
      onDelete(notification.id);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-primary';
    }
  };

  const getTypeIcon = (type: string, isGeneral: boolean) => {
    if (isGeneral) {
      const generalIcons: Record<string, string> = {
        announcement: '📢',
        event: '📅',
        community: '👥',
        system: '⚙️',
      };
      return generalIcons[type] || '📢';
    } else {
      const personalIcons: Record<string, string> = {
        booking_request: '🎯',
        booking_accepted: '✅',
        booking_declined: '❌',
        message_request: '💬',
        new_follower: '👥',
        event_reminder: '📅',
        poll_result: '📊',
        review_reply: '💭',
        group_invite: '👋',
        event_update: '🔄',
        discussion_request: '💭',
        discussion_approved: '✅',
        discussion_rejected: '❌',
        event_created: '📅',
        event_updated: '🔄',
        event_cancelled: '❌',
        payment_received: '💰',
        payment_failed: '⚠️',
        system_announcement: '📢',
      };
      return personalIcons[type] || '🔔';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-lg mb-4 cursor-pointer transition-all hover:shadow-md ${
        isGeneral 
          ? `bg-card ${getPriorityColor(notification.priority)} border-l-4`
          : notification.read 
            ? 'bg-muted/50' 
            : 'bg-primary/5 border-l-4 border-l-primary'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0">
          {getTypeIcon(notification.type, isGeneral)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{notification.title}</h3>
            <div className="flex items-center gap-2">
              {!isGeneral && !notification.read && (
                <Badge variant="default" className="text-xs">
                  New
                </Badge>
              )}
              {isGeneral && notification.priority && (
                <Badge variant="outline" className="text-xs">
                  {notification.priority}
                </Badge>
              )}
              {!isGeneral && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {format(new Date(notification.created_at), 'MMM dd, yyyy • HH:mm')}
            </p>
            {notification.action_text && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(notification);
                }}
              >
                {notification.action_text}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const NotificationsPage: React.FC = () => {
  const { 
    generalNotifications, 
    personalNotifications, 
    counts, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refresh
  } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isGeneral) {
      await markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      navigate(notification.action_url);
      return;
    }

    const routeMap: Record<string, string> = {
      booking_request: '/artist-dashboard',
      booking_accepted: '/artist-dashboard',
      booking_declined: '/artist-dashboard',
      message_request: '/messages',
      new_follower: '/profile',
      event_reminder: '/events',
      event_update: '/events',
      event_created: '/events',
      event_updated: '/events',
      event_cancelled: '/events',
      poll_result: '/community',
      review_reply: '/community',
      group_invite: '/community',
      discussion_request: '/artist-dashboard',
      discussion_approved: '/community',
      discussion_rejected: '/community',
      payment_received: '/artist-dashboard',
      payment_failed: '/artist-dashboard',
      system_announcement: '/',
      announcement: '/',
      event: '/events',
      community: '/community',
      system: '/',
    };
    
    const route = routeMap[notification.type];
    if (route) {
      navigate(route);
    }
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
  };

  const filteredGeneralNotifications = generalNotifications.filter(notification =>
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPersonalNotifications = personalNotifications.filter(notification =>
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allNotifications = [
    ...filteredGeneralNotifications.map(n => ({ ...n, isGeneral: true })),
    ...filteredPersonalNotifications.map(n => ({ ...n, isGeneral: false }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <ResponsiveLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              Notifications
            </h1>
            <p className="text-muted-foreground mt-2">
              Stay updated with the latest news and activities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {user && counts.personal > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/notification-settings')}>
                  Notification Preferences
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/privacy-settings')}>
                  Privacy Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSearchQuery('')}>
                All notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery('event')}>
                Events
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery('booking')}>
                Bookings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery('message')}>
                Messages
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Notification Counts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{counts.total}</p>
              </div>
            </div>
          </div>
          {user && (
            <div className="bg-card p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Personal</p>
                  <p className="text-2xl font-bold">{counts.personal}</p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Megaphone className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">General</p>
                <p className="text-2xl font-bold">{counts.general}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">
              All ({allNotifications.length})
            </TabsTrigger>
            {user && (
              <TabsTrigger value="personal">
                Personal ({filteredPersonalNotifications.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="general">
              General ({filteredGeneralNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading notifications...</p>
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms.' : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                {allNotifications.map((notification) => (
                  <NotificationItem
                    key={`${notification.isGeneral ? 'general' : 'personal'}-${notification.id}`}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={handleDelete}
                    onNavigate={handleNotificationClick}
                    isGeneral={notification.isGeneral}
                  />
                ))}
              </ScrollArea>
            )}
          </TabsContent>

          {user && (
            <TabsContent value="personal" className="space-y-4">
              {filteredPersonalNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No personal notifications</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Try adjusting your search terms.' : 'You\'re all caught up with personal notifications!'}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  {filteredPersonalNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={handleDelete}
                      onNavigate={handleNotificationClick}
                      isGeneral={false}
                    />
                  ))}
                </ScrollArea>
              )}
            </TabsContent>
          )}

          <TabsContent value="general" className="space-y-4">
            {filteredGeneralNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No general notifications</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms.' : 'No general announcements at the moment.'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                {filteredGeneralNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={handleDelete}
                    onNavigate={handleNotificationClick}
                    isGeneral={true}
                  />
                ))}
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};
