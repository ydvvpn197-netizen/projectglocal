import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  MessageCircle,
  Heart,
  Users,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle,
  X,
  Settings,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'event' | 'system' | 'mention';
  title: string;
  message: string;
  avatar?: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
}

interface UnifiedNotificationSystemProps {
  className?: string;
  showLabel?: boolean;
}

export const UnifiedNotificationSystem: React.FC<UnifiedNotificationSystemProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { user } = useAuth();
  const { counts, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock notifications - replace with real data
  useEffect(() => {
    if (user) {
      setNotifications([
        {
          id: '1',
          type: 'like',
          title: 'New Like',
          message: 'Sarah Chen liked your post about the community garden',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&',
          timestamp: '2 minutes ago',
          read: false,
          actionUrl: '/feed',
          priority: 'medium',
        },
        {
          id: '2',
          type: 'comment',
          title: 'New Comment',
          message: 'Mike Johnson commented on your event: "Looking forward to this!"',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&',
          timestamp: '15 minutes ago',
          read: false,
          actionUrl: '/events',
          priority: 'high',
        },
        {
          id: '3',
          type: 'follow',
          title: 'New Follower',
          message: 'Emma Wilson started following you',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&',
          timestamp: '1 hour ago',
          read: true,
          actionUrl: '/profile',
          priority: 'low',
        },
        {
          id: '4',
          type: 'event',
          title: 'Event Reminder',
          message: 'Local Music Festival starts in 2 hours',
          timestamp: '2 hours ago',
          read: false,
          actionUrl: '/events',
          priority: 'high',
        },
        {
          id: '5',
          type: 'system',
          title: 'System Update',
          message: 'New features are now available in your community',
          timestamp: '1 day ago',
          read: true,
          actionUrl: '/settings',
          priority: 'medium',
        },
      ]);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'system':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'mention':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationCategory = (type: string) => {
    switch (type) {
      case 'like':
      case 'comment':
      case 'mention':
        return 'Social';
      case 'follow':
        return 'Community';
      case 'event':
        return 'Events';
      case 'system':
        return 'System';
      default:
        return 'Other';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-blue-500';
      case 'low':
        return 'border-l-gray-300';
      default:
        return 'border-l-gray-300';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  if (!user) {
    return (
      <Button variant="ghost" size="sm" onClick={() => navigate('/signin')}>
        <Bell className="h-4 w-4" />
        {showLabel && <span className="ml-2">Notifications</span>}
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          {showLabel && <span className="ml-2">Notifications</span>}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
                className="text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View all
              </Button>
            </div>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {Object.entries(
                notifications.reduce((acc, notification) => {
                  const category = getNotificationCategory(notification.type);
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(notification);
                  return acc;
                }, {} as Record<string, typeof notifications>)
              ).map(([category, categoryNotifications]) => (
                <div key={category}>
                  <div className="px-4 py-2 bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {category}
                    </p>
                  </div>
                  {categoryNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                        !notification.read ? 'bg-muted/50' : ''
                      } hover:bg-muted/50 transition-colors cursor-pointer group`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {notification.avatar ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={notification.avatar} />
                              <AvatarFallback>
                                {notification.title.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.timestamp}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/notification-settings')}
              className="text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
            <div className="text-xs text-muted-foreground">
              {unreadCount} unread
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UnifiedNotificationSystem;
