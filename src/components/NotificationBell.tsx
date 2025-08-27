import { Bell, Check, Trash2, Settings, Megaphone, User } from 'lucide-react';
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
import { memo, useCallback, useMemo } from 'react';

// Memoized notification icon component
const NotificationIcon = memo(({ type, isGeneral }: { type: string; isGeneral: boolean }) => {
  const icon = useMemo(() => {
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
  }, [type, isGeneral]);

  return <span className="text-2xl">{icon}</span>;
});

NotificationIcon.displayName = 'NotificationIcon';

// Memoized notification item component
const NotificationItem = memo(({ 
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
  const handleClick = useCallback(() => {
    onNavigate(notification);
  }, [notification, onNavigate]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isGeneral) {
      onDelete(notification.id);
    }
  }, [notification.id, onDelete, isGeneral]);

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
      className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors hover:bg-muted/50 ${
        isGeneral 
          ? `bg-muted/30 ${getPriorityColor(notification.priority)} border-l-4`
          : notification.read 
            ? 'bg-muted/30' 
            : 'bg-primary/5 border-l-4 border-l-primary'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={notification.type} isGeneral={isGeneral} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            <div className="flex items-center gap-1">
              {!isGeneral && !notification.read && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
              {!isGeneral && (
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
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
            </p>
            {isGeneral && notification.priority && (
              <Badge variant="outline" className="text-xs">
                {notification.priority}
              </Badge>
            )}
          </div>
          {notification.action_text && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
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
  );
});

NotificationItem.displayName = 'NotificationItem';

export const NotificationBell = memo(() => {
  const { 
    generalNotifications, 
    personalNotifications, 
    counts, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNotificationClick = useCallback(async (notification: any) => {
    if (!notification.isGeneral) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on notification type and action_url
    if (notification.action_url) {
      navigate(notification.action_url);
      return;
    }

    // Default navigation based on notification type
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
  }, [markAsRead, navigate]);

  const handleDelete = useCallback((id: string) => {
    deleteNotification(id);
  }, [deleteNotification]);

  const hasNotifications = generalNotifications.length > 0 || personalNotifications.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {counts.total > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {counts.total > 99 ? '99+' : counts.total}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {user && counts.personal > 0 && (
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
                <DropdownMenuItem onClick={() => navigate('/notification-settings')}>
                  Notification Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : !hasNotifications ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({counts.total})</TabsTrigger>
              {user && <TabsTrigger value="personal">Personal ({counts.personal})</TabsTrigger>}
              <TabsTrigger value="general">General ({counts.general})</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-96">
              <TabsContent value="all" className="p-2">
                {generalNotifications.map((notification) => (
                  <NotificationItem
                    key={`general-${notification.id}`}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={handleDelete}
                    onNavigate={handleNotificationClick}
                    isGeneral={true}
                  />
                ))}
                {personalNotifications.map((notification) => (
                  <NotificationItem
                    key={`personal-${notification.id}`}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={handleDelete}
                    onNavigate={handleNotificationClick}
                    isGeneral={false}
                  />
                ))}
              </TabsContent>
              
              {user && (
                <TabsContent value="personal" className="p-2">
                  {personalNotifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No personal notifications</p>
                    </div>
                  ) : (
                    personalNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={handleDelete}
                        onNavigate={handleNotificationClick}
                        isGeneral={false}
                      />
                    ))
                  )}
                </TabsContent>
              )}
              
              <TabsContent value="general" className="p-2">
                {generalNotifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No general notifications</p>
                  </div>
                ) : (
                  generalNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={handleDelete}
                      onNavigate={handleNotificationClick}
                      isGeneral={true}
                    />
                  ))
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
        
        {hasNotifications && (
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