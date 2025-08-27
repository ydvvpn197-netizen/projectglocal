import { supabase } from '@/integrations/supabase/client';

export interface GeneralNotification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'event' | 'community' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  target_audience?: 'all' | 'new_users' | 'existing_users';
  action_url?: string;
  action_text?: string;
}

export interface PersonalNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_declined' | 'message_request' | 'new_follower' | 'event_reminder' | 'event_update' | 'event_created' | 'event_updated' | 'event_cancelled' | 'poll_result' | 'review_reply' | 'group_invite' | 'discussion_request' | 'discussion_approved' | 'discussion_rejected' | 'payment_received' | 'payment_failed' | 'system_announcement';
  read: boolean;
  created_at: string;
  data?: Record<string, any>;
  action_url?: string;
  action_text?: string;
}

export interface NotificationCounts {
  general: number;
  personal: number;
  total: number;
}

// Fallback notifications for when database is not available
const fallbackGeneralNotifications: GeneralNotification[] = [
  {
    id: 'fallback-1',
    title: 'Welcome to The Glocal! 🎉',
    message: 'Join our community to discover amazing local events, connect with artists, and build meaningful relationships with your neighbors.',
    type: 'announcement',
    priority: 'high',
    created_at: new Date().toISOString(),
    is_active: true,
    target_audience: 'all',
    action_url: '/signin',
    action_text: 'Get Started'
  },
  {
    id: 'fallback-2',
    title: 'New Feature: Artist Booking System',
    message: 'You can now book local artists directly through our platform. Support local talent and make your events unforgettable!',
    type: 'system',
    priority: 'medium',
    created_at: new Date().toISOString(),
    is_active: true,
    target_audience: 'all',
    action_url: '/book-artist',
    action_text: 'Book an Artist'
  }
];

class NotificationService {
  private isDatabaseAvailable = true;

  // Check if database tables exist
  private async checkDatabaseAvailability(): Promise<boolean> {
    if (!this.isDatabaseAvailable) return false;
    
    try {
      const { error } = await supabase
        .from('general_notifications')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') { // Table doesn't exist
        this.isDatabaseAvailable = false;
        return false;
      }
      return true;
    } catch (error) {
      this.isDatabaseAvailable = false;
      return false;
    }
  }

  // General notifications for non-logged-in users
  async getGeneralNotifications(limit = 10): Promise<GeneralNotification[]> {
    try {
      const isAvailable = await this.checkDatabaseAvailability();
      if (!isAvailable) {
        return fallbackGeneralNotifications.slice(0, limit);
      }

      const { data, error } = await supabase
        .from('general_notifications')
        .select('*')
        .eq('is_active', true)
        .lte('created_at', new Date().toISOString())
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('Error fetching general notifications, using fallback:', error);
        return fallbackGeneralNotifications.slice(0, limit);
      }
      return data || fallbackGeneralNotifications.slice(0, limit);
    } catch (error) {
      console.warn('Error fetching general notifications, using fallback:', error);
      return fallbackGeneralNotifications.slice(0, limit);
    }
  }

  // Personal notifications for logged-in users
  async getPersonalNotifications(userId: string, limit = 20): Promise<PersonalNotification[]> {
    try {
      const isAvailable = await this.checkDatabaseAvailability();
      if (!isAvailable) {
        return [];
      }

      const { data, error } = await supabase
        .from('personal_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('Error fetching personal notifications:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.warn('Error fetching personal notifications:', error);
      return [];
    }
  }

  // Get unread counts for both types
  async getNotificationCounts(userId?: string): Promise<NotificationCounts> {
    try {
      const isAvailable = await this.checkDatabaseAvailability();
      if (!isAvailable) {
        return {
          general: fallbackGeneralNotifications.length,
          personal: 0,
          total: fallbackGeneralNotifications.length
        };
      }

      let generalCount = 0;
      let personalCount = 0;

      // Get general notification count (active notifications)
      try {
        const { count: generalCountResult } = await supabase
          .from('general_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .lte('created_at', new Date().toISOString())
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

        generalCount = generalCountResult || 0;
      } catch (error) {
        console.warn('Error counting general notifications:', error);
        generalCount = fallbackGeneralNotifications.length;
      }

      // Get personal notification count if user is logged in
      if (userId) {
        try {
          const { count: personalCountResult } = await supabase
            .from('personal_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false);

          personalCount = personalCountResult || 0;
        } catch (error) {
          console.warn('Error counting personal notifications:', error);
          personalCount = 0;
        }
      }

      return {
        general: generalCount,
        personal: personalCount,
        total: generalCount + personalCount
      };
    } catch (error) {
      console.warn('Error getting notification counts:', error);
      return {
        general: fallbackGeneralNotifications.length,
        personal: 0,
        total: fallbackGeneralNotifications.length
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const isAvailable = await this.checkDatabaseAvailability();
      if (!isAvailable) {
        return true; // Pretend success for fallback
      }

      const { error } = await supabase
        .from('personal_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.warn('Error marking notification as read:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.warn('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const isAvailable = await this.checkDatabaseAvailability();
      if (!isAvailable) {
        return true; // Pretend success for fallback
      }

      const { error } = await supabase
        .from('personal_notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.warn('Error marking all notifications as read:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.warn('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const isAvailable = await this.checkDatabaseAvailability();
      if (!isAvailable) {
        return true; // Pretend success for fallback
      }

      const { error } = await supabase
        .from('personal_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.warn('Error deleting notification:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.warn('Error deleting notification:', error);
      return false;
    }
  }

  // Create personal notification
  async createPersonalNotification(
    userId: string,
    title: string,
    message: string,
    type: PersonalNotification['type'],
    data?: Record<string, any>,
    actionUrl?: string,
    actionText?: string
  ): Promise<string | null> {
    try {
      const isAvailable = await this.checkDatabaseAvailability();
      if (!isAvailable) {
        console.warn('Database not available, notification not created');
        return null;
      }

      const { data: notification, error } = await supabase
        .from('personal_notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          data,
          action_url: actionUrl,
          action_text: actionText
        })
        .select('id')
        .single();

      if (error) {
        console.warn('Error creating personal notification:', error);
        return null;
      }
      return notification.id;
    } catch (error) {
      console.warn('Error creating personal notification:', error);
      return null;
    }
  }

  // Subscribe to real-time updates
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    try {
      const isAvailable = this.isDatabaseAvailable;
      if (!isAvailable) {
        console.warn('Database not available, real-time subscription disabled');
        return () => {}; // Return empty unsubscribe function
      }

      const personalSubscription = supabase
        .channel(`personal_notifications_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'personal_notifications',
            filter: `user_id=eq.${userId}`
          },
          callback
        )
        .subscribe();

      const generalSubscription = supabase
        .channel('general_notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'general_notifications'
          },
          callback
        )
        .subscribe();

      return () => {
        personalSubscription.unsubscribe();
        generalSubscription.unsubscribe();
      };
    } catch (error) {
      console.warn('Error setting up notification subscriptions:', error);
      return () => {}; // Return empty unsubscribe function
    }
  }
}

export const notificationService = new NotificationService();
