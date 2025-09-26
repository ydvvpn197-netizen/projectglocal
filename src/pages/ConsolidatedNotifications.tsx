import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Settings, Megaphone, User, Filter, Search, RefreshCw, CheckCircle, Clock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';

// Enhanced Notification item component
const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  onNavigate,
  isGeneral = false
}: {
  notification: Record<string, unknown>;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
  onNavigate: (notification: Record<string, unknown>) => void;
  isGeneral?: boolean;
}) => {
  const handleClick = () => {
    onNavigate(notification);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isGeneral) {
      onDelete(notification.id as string);
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
          ? `bg-card ${getPriorityColor(notification.priority as string)} border-l-4`
          : notification.read 
            ? 'bg-muted/50' 
            : 'bg-primary/5 border-l-4 border-l-primary'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl">
          {getTypeIcon(notification.type as string, isGeneral)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                {notification.title as string}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                {notification.message as string}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {format(new Date(notification.created_at as string), 'MMM d, h:mm a')}
                </span>
                {notification.priority && (
                  <Badge variant="outline" className="text-xs">
                    {notification.priority as string}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {!notification.read && !isGeneral && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id as string);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              
              {!isGeneral && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function ConsolidatedNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    generalNotifications,
    personalNotifications,
    allNotifications,
    counts,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    isAuthenticated
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Filter notifications based on search term and type
  const filteredNotifications = useMemo(() => {
    let filtered = allNotifications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        (notification.title as string).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notification.message as string).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    return filtered;
  }, [allNotifications, searchTerm, filterType]);

  const filteredPersonalNotifications = useMemo(() => {
    let filtered = personalNotifications;

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        (notification.title as string).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notification.message as string).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    return filtered;
  }, [personalNotifications, searchTerm, filterType]);

  const filteredGeneralNotifications = useMemo(() => {
    let filtered = generalNotifications;

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        (notification.title as string).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notification.message as string).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    return filtered;
  }, [generalNotifications, searchTerm, filterType]);

  // Get unique notification types for filter dropdown
  const notificationTypes = useMemo(() => {
    const types = new Set(allNotifications.map(n => n.type));
    return Array.from(types);
  }, [allNotifications]);

  const handleNotificationClick = (notification: Record<string, unknown>) => {
    // Mark as read if not already read
    if (!notification.read) {
      markAsRead(notification.id as string);
    }

    // Navigate based on notification type
    const type = notification.type as string;
    switch (type) {
      case 'booking_request':
      case 'booking_accepted':
      case 'booking_declined':
        navigate('/bookings');
        break;
      case 'message_request':
        navigate('/messages');
        break;
      case 'event_reminder':
      case 'event_created':
      case 'event_updated':
        navigate('/events');
        break;
      case 'new_follower':
        navigate('/profile');
        break;
      case 'discussion_request':
      case 'discussion_approved':
      case 'discussion_rejected':
        navigate('/discussions');
        break;
      default:
        navigate('/');
    }
  };

  if (!isAuthenticated) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to view your notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/signin')}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    );
  }

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Loading Notifications...</h2>
            <p className="text-muted-foreground">Getting your latest updates</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <CardTitle>Error Loading Notifications</CardTitle>
              <CardDescription>
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={refresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your latest activities and announcements
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {counts.unread > 0 && (
              <Button onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter by Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterType('all')}>
                All Types
              </DropdownMenuItem>
              {notificationTypes.map(type => (
                <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Notification Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{counts.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Read</p>
                  <p className="text-2xl font-bold">{counts.read}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Unread</p>
                  <p className="text-2xl font-bold">{counts.unread}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              All ({counts.total})
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal ({counts.personal})
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              General ({counts.general})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <ScrollArea className="h-[600px]">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    onNavigate={handleNotificationClick}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterType !== 'all' 
                        ? 'No notifications match your current filters.'
                        : 'You\'re all caught up! No new notifications.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="personal" className="space-y-4">
            <ScrollArea className="h-[600px]">
              {filteredPersonalNotifications.length > 0 ? (
                filteredPersonalNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    onNavigate={handleNotificationClick}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Personal Notifications</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterType !== 'all' 
                        ? 'No personal notifications match your current filters.'
                        : 'No personal notifications yet.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <ScrollArea className="h-[600px]">
              {filteredGeneralNotifications.length > 0 ? (
                filteredGeneralNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    onNavigate={handleNotificationClick}
                    isGeneral={true}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No General Notifications</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterType !== 'all' 
                        ? 'No general notifications match your current filters.'
                        : 'No general announcements at the moment.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
}
