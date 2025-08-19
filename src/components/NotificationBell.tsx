import { Bell, Check, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { memo, useCallback, useMemo } from 'react';

// Memoized notification icon component
const NotificationIcon = memo(({ type }: { type: string }) => {
  const icon = useMemo(() => {
    const icons: Record<string, string> = {
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
    };
    return icons[type] || '🔔';
  }, [type]);

  return <span className="text-2xl">{icon}</span>;
});

NotificationIcon.displayName = 'NotificationIcon';

// Memoized notification item component
const NotificationItem = memo(({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  onNavigate 
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
  onNavigate: (notification: Notification) => void;
}) => {
  const handleClick = useCallback(() => {
    onNavigate(notification);
  }, [notification, onNavigate]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  }, [notification.id, onDelete]);

  return (
    <div
      className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors hover:bg-muted/50 ${
        notification.read ? 'bg-muted/30' : 'bg-primary/5 border-l-4 border-l-primary'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={notification.type} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            <div className="flex items-center gap-1">
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
          </p>
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

export const NotificationBell = memo(() => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    await markAsRead(notification.id);
    
    // Navigate based on notification type
    const routeMap: Record<string, string> = {
      booking_request: '/artist-dashboard',
      booking_accepted: '/artist-dashboard',
      booking_declined: '/artist-dashboard',
      message_request: '/messages',
      new_follower: '/profile',
      event_reminder: '/events',
      event_update: '/events',
      poll_result: '/community',
      review_reply: '/community',
      group_invite: '/community',
    };
    
    const route = routeMap[notification.type];
    if (route) {
      navigate(route);
    }
  }, [markAsRead, navigate]);

  const handleDelete = useCallback((id: string) => {
    deleteNotification(id);
  }, [deleteNotification]);

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  Notification Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={handleDelete}
                  onNavigate={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-3 border-t bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => navigate('/notifications')}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});

NotificationBell.displayName = 'NotificationBell';