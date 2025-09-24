import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'event' | 'message' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
  user_id: string;
  from_user_id?: string;
  post_id?: string;
  event_id?: string;
}

interface NotificationCounts {
  total: number;
  unread: number;
  likes: number;
  comments: number;
  follows: number;
  events: number;
  messages: number;
}

interface UseNotificationsOptions {
  realtime?: boolean;
  autoMarkAsRead?: boolean;
  batchSize?: number;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    realtime = true,
    autoMarkAsRead = false,
    batchSize = 20
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({
    total: 0,
    unread: 0,
    likes: 0,
    comments: 0,
    follows: 0,
    events: 0,
    messages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 0) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(page * batchSize, (page + 1) * batchSize - 1);

      if (error) throw error;

      if (page === 0) {
        setNotifications(data || []);
      } else {
        setNotifications(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data || []).length === batchSize);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, batchSize, toast]);

  // Fetch notification counts
  const fetchCounts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('type, read')
        .eq('user_id', user.id);

      if (error) throw error;

      const counts = (data || []).reduce((acc, notification) => {
        acc.total++;
        if (!notification.read) acc.unread++;
        
        switch (notification.type) {
          case 'like': acc.likes++; break;
          case 'comment': acc.comments++; break;
          case 'follow': acc.follows++; break;
          case 'event': acc.events++; break;
          case 'message': acc.messages++; break;
        }
        
        return acc;
      }, {
        total: 0,
        unread: 0,
        likes: 0,
        comments: 0,
        follows: 0,
        events: 0,
        messages: 0
      });

      setCounts(counts);
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
      setCounts(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setCounts(prev => ({ ...prev, unread: 0 }));
      
      toast({
        title: "All caught up!",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setCounts(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        unread: Math.max(0, prev.unread - 1)
      }));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  // Create notification
  const createNotification = useCallback(async (
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: any
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data,
          read: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, []);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const currentPage = Math.floor(notifications.length / batchSize);
      fetchNotifications(currentPage);
    }
  }, [isLoading, hasMore, notifications.length, batchSize, fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!user || !realtime) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setCounts(prev => ({
            ...prev,
            total: prev.total + 1,
            unread: prev.unread + 1
          }));

          // Show toast for new notifications
          if (newNotification.type !== 'system') {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: 5000
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, realtime, toast]);

  // Auto-mark as read when viewing
  useEffect(() => {
    if (autoMarkAsRead && notifications.length > 0) {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length > 0) {
        // Mark as read after a delay
        const timer = setTimeout(() => {
          unreadNotifications.forEach(notification => {
            markAsRead(notification.id);
          });
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [autoMarkAsRead, notifications, markAsRead]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchNotifications(0);
      fetchCounts();
    }
  }, [user, fetchNotifications, fetchCounts]);

  return {
    notifications,
    counts,
    isLoading,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refetch: () => {
      fetchNotifications(0);
      fetchCounts();
    }
  };
};

export default useNotifications;
