import { Bell, Check, Trash2, Settings, Megaphone, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { memo, useCallback, useMemo, useState } from 'react';

// Memoized notification icon component
const NotificationIcon = memo(({ type, isGeneral }: { type: string; isGeneral: boolean }) => {
  const getIcon = () => {
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

  return <span className="text-2xl">{getIcon()}</span>;
});

NotificationIcon.displayName = 'NotificationIcon';

// Memoized notification item component
const NotificationItem = memo(({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  onNavigate,
  isGeneral = false,
  isAuthenticated = false
}: {
  notification: any;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
  onNavigate: (notification: any) => void;
  isGeneral?: boolean;
  isAuthenticated?: boolean;
}) => {
  const handleClick = () => {
    onNavigate(notification);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isGeneral && isAuthenticated) {
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

  return (
    <div
      className={`p-3 rounded-lg mb-2 cursor-pointer transition-all hover:bg-accent/50 ${
        isGeneral 
          ? `bg-card ${getPriorityColor(notification.priority)} border-l-4`
          : notification.read 
            ? 'bg-muted/50' 
            : 'bg-primary/5 border-l-4 border-l-primary'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={notification.type} isGeneral={isGeneral} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm truncate">{notification.title}</h4>
            <div className="flex items-center gap-1">
              {!isGeneral && !notification.read && isAuthenticated && (
                <Badge variant="default" className="text-xs px-1 py-0">
                  New
                </Badge>
              )}
              {!isGeneral && isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {format(new Date(notification.created_at), 'MMM dd • HH:mm')}
            </p>
            {notification.action_text && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
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
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

export const NotificationBell = memo(() => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshingCounts, setIsRefreshingCounts] = useState(false);
  
  // Use the notifications hook with error handling
  const {
    generalNotifications,
    personalNotifications,
    counts,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    refreshCounts,
    isAuthenticated
  } = useNotifications();

  // Handle notification click
  const handleNotificationClick = useCallback(async (notification: any) => {
    if (!notification.isGeneral && isAuthenticated) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.warn('Error marking notification as read:', error);
      }
    }
    
    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
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
    setIsOpen(false);
  }, [markAsRead, navigate, isAuthenticated]);

  // Handle delete notification
  const handleDelete = useCallback((id: string) => {
    if (!isAuthenticated) {
      console.warn('Cannot delete notification: user not authenticated');
      return;
    }

    try {
      deleteNotification(id);
    } catch (error) {
      console.warn('Error deleting notification:', error);
    }
  }, [deleteNotification, isAuthenticated]);

  // Get combined notifications for display
  const allNotifications = useMemo(() => {
    try {
      const combined = [
        ...generalNotifications.map(notification => ({
          ...notification,
          isGeneral: true,
          read: false // General notifications are never "read" in the traditional sense
        })),
        ...personalNotifications.map(notification => ({
          ...notification,
          isGeneral: false
        }))
      ];

      return combined.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.warn('Error combining notifications:', error);
      return [];
    }
  }, [generalNotifications, personalNotifications]);

  // Don't render anything for non-authenticated users
  if (!isAuthenticated) {
    return null;
  }

  // Ensure counts are valid numbers
  const validCounts = {
    general: Math.max(0, counts.general || 0),
    personal: Math.max(0, counts.personal || 0),
    total: Math.max(0, counts.total || 0)
  };

  // Refresh counts when popover opens
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open && isAuthenticated) {
      // Refresh counts when opening the notification dropdown
      setIsRefreshingCounts(true);
      refreshCounts().finally(() => setIsRefreshingCounts(false));
    }
  }, [isAuthenticated, refreshCounts]);

  // Handle manual count refresh
  const handleRefreshCounts = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsRefreshingCounts(true);
    try {
      await refreshCounts();
    } finally {
      setIsRefreshingCounts(false);
    }
  }, [isAuthenticated, refreshCounts]);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {validCounts.total > 0 && (
            <Badge
              variant="destructive"
              className={`absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs ${
                isRefreshingCounts ? 'animate-pulse' : ''
              }`}
            >
              {validCounts.total > 99 ? '99+' : validCounts.total}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="h-8 w-8 p-0"
                title="Refresh notifications and counts"
              >
                <span className="sr-only">Refresh</span>
                <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </Button>
              {isAuthenticated && validCounts.personal > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 w-8 p-0"
                  title="Mark all as read"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshCounts}
                disabled={isRefreshingCounts}
                className="h-8 w-8 p-0"
                title="Sync notification counts"
              >
                <svg className={`h-4 w-4 ${isRefreshingCounts ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/notification-settings')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/notifications')}>
                    View All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs">
              All ({allNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="personal" className="text-xs">
              Personal ({validCounts.personal})
            </TabsTrigger>
            <TabsTrigger value="general" className="text-xs">
              General ({validCounts.general})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">Unable to load notifications</p>
                <Button variant="outline" size="sm" onClick={refresh}>
                  Try Again
                </Button>
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                {allNotifications.map((notification) => (
                  <NotificationItem
                    key={`${notification.isGeneral ? 'general' : 'personal'}-${notification.id}`}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={handleDelete}
                    onNavigate={handleNotificationClick}
                    isGeneral={notification.isGeneral}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="personal" className="p-4">
            {personalNotifications.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No personal notifications</p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                {personalNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={handleDelete}
                    onNavigate={handleNotificationClick}
                    isGeneral={false}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="general" className="p-4">
            {generalNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Megaphone className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No general notifications</p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                {generalNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={handleDelete}
                    onNavigate={handleNotificationClick}
                    isGeneral={true}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
});

NotificationBell.displayName = 'NotificationBell';