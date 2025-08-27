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

class NotificationService {
  // General notifications for non-logged-in users
  async getGeneralNotifications(limit = 10): Promise<GeneralNotification[]> {
    try {
      const { data, error } = await supabase
        .from('general_notifications')
        .select('*')
        .eq('is_active', true)
        .lte('created_at', new Date().toISOString())
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching general notifications:', error);
      return [];
    }
  }

  // Personal notifications for logged-in users
  async getPersonalNotifications(userId: string, limit = 20): Promise<PersonalNotification[]> {
    try {
      const { data, error } = await supabase
        .from('personal_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching personal notifications:', error);
      return [];
    }
  }

  // Get unread counts for both types
  async getNotificationCounts(userId?: string): Promise<NotificationCounts> {
    try {
      let generalCount = 0;
      let personalCount = 0;

      // Get general notification count (active notifications)
      const { count: generalCountResult } = await supabase
        .from('general_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lte('created_at', new Date().toISOString())
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      generalCount = generalCountResult || 0;

      // Get personal notification count if user is logged in
      if (userId) {
        const { count: personalCountResult } = await supabase
          .from('personal_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('read', false);

        personalCount = personalCountResult || 0;
      }

      return {
        general: generalCount,
        personal: personalCount,
        total: generalCount + personalCount
      };
    } catch (error) {
      console.error('Error fetching notification counts:', error);
      return { general: 0, personal: 0, total: 0 };
    }
  }

  // Mark personal notification as read
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personal_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all personal notifications as read
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personal_notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete personal notification
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personal_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Create a personal notification (for internal use)
  async createPersonalNotification(
    userId: string,
    title: string,
    message: string,
    type: PersonalNotification['type'],
    data?: Record<string, any>,
    actionUrl?: string,
    actionText?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('personal_notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          read: false,
          data,
          action_url: actionUrl,
          action_text: actionText
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating personal notification:', error);
      return false;
    }
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    const personalChannel = supabase
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

    const generalChannel = supabase
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
      personalChannel.unsubscribe();
      generalChannel.unsubscribe();
    };
  }
}

export const notificationService = new NotificationService();
