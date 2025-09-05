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
  data?: Record<string, unknown>;
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
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds
  private retryAttempts = new Map<string, number>();
  private readonly MAX_RETRY_ATTEMPTS = 3;

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

  // Cache management
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  private clearUserCache(userId: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Retry mechanism for failed operations
  private async withRetry<T>(
    operation: () => Promise<T>,
    operationKey: string,
    maxAttempts: number = this.MAX_RETRY_ATTEMPTS
  ): Promise<T> {
    let attempts = this.retryAttempts.get(operationKey) || 0;
    
    try {
      const result = await operation();
      this.retryAttempts.delete(operationKey);
      return result;
    } catch (error) {
      attempts++;
      this.retryAttempts.set(operationKey, attempts);
      
      if (attempts >= maxAttempts) {
        this.retryAttempts.delete(operationKey);
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempts) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.withRetry(operation, operationKey, maxAttempts);
    }
  }

  // General notifications - only for authenticated users
  async getGeneralNotifications(limit = 10): Promise<GeneralNotification[]> {
    const cacheKey = `general_notifications_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const isAvailable = await this.checkDatabaseAvailability();
      if (!isAvailable) {
        return fallbackGeneralNotifications;
      }

      const result = await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('general_notifications')
          .select('*')
          .eq('is_active', true)
          .lte('created_at', new Date().toISOString())
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          throw error;
        }

        return data || fallbackGeneralNotifications;
      }, `getGeneralNotifications_${limit}`);

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('Error fetching general notifications:', error);
      return fallbackGeneralNotifications;
    }
  }

  // Personal notifications for logged-in users only
  async getPersonalNotifications(userId: string, limit = 20): Promise<PersonalNotification[]> {
    if (!userId) {
      return [];
    }

    const cacheKey = `personal_notifications_${userId}_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const isAvailable = await this.checkDatabaseAvailability();
      if (!isAvailable) {
        return [];
      }

      const result = await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('personal_notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          throw error;
        }
        return data || [];
      }, `getPersonalNotifications_${userId}_${limit}`);

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('Error fetching personal notifications:', error);
      return [];
    }
  }

  // Get unread counts - return zero for non-authenticated users
  async getNotificationCounts(userId?: string): Promise<NotificationCounts> {
    // For non-authenticated users, return zero counts
    if (!userId) {
      return {
        general: 0,
        personal: 0,
        total: 0
      };
    }

    try {
      const isAvailable = await this.checkDatabaseAvailability();
      if (!isAvailable) {
        return {
          general: 0,
          personal: 0,
          total: 0
        };
      }

      let generalCount = 0;
      let personalCount = 0;

      // Get general notification count (active notifications) - only for authenticated users
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
        generalCount = 0;
      }

      // Get personal notification count for logged-in users
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

      return {
        general: generalCount,
        personal: personalCount,
        total: generalCount + personalCount
      };
    } catch (error) {
      console.warn('Error getting notification counts:', error);
      return {
        general: 0,
        personal: 0,
        total: 0
      };
    }
  }

  // Mark notification as read (only for logged-in users)
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

    try {
      const isAvailable = await this.checkDatabaseAvailability();
      if (!isAvailable) {
        return true; // Pretend success for fallback
      }

      const result = await this.withRetry(async () => {
        const { error } = await supabase
          .from('personal_notifications')
          .update({ read: true })
          .eq('id', notificationId)
          .eq('user_id', userId);

        if (error) {
          throw error;
        }
        return true;
      }, `markAsRead_${notificationId}_${userId}`);

      // Clear cache for this user's notifications
      this.clearUserCache(userId);
      return result;
    } catch (error) {
      console.warn('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read (only for logged-in users)
  async markAllAsRead(userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

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

  // Delete notification (only for logged-in users)
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

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

  // Create personal notification (only for logged-in users)
  async createPersonalNotification(
    userId: string,
    title: string,
    message: string,
    type: PersonalNotification['type'],
    data?: Record<string, unknown>,
    actionUrl?: string,
    actionText?: string
  ): Promise<string | null> {
    if (!userId) {
      console.warn('Cannot create notification: no user ID provided');
      return null;
    }

    try {
      const isAvailable = await this.checkDatabaseAvailability();
      if (!isAvailable) {
        console.warn('Database not available, notification not created');
        return null;
      }

      const result = await this.withRetry(async () => {
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
          throw error;
        }
        return notification.id;
      }, `createPersonalNotification_${userId}`);

      // Clear cache for this user's notifications
      this.clearUserCache(userId);
      return result;
    } catch (error) {
      console.warn('Error creating personal notification:', error);
      return null;
    }
  }

  // Subscribe to real-time updates (only for logged-in users)
  subscribeToNotifications(userId: string, callback: (payload: Record<string, unknown>) => void) {
    if (!userId) {
      console.warn('Cannot subscribe to notifications: no user ID provided');
      return () => {}; // Return empty unsubscribe function
    }

    try {
      const isAvailable = this.isDatabaseAvailable;
      if (!isAvailable) {
        console.warn('Database not available, real-time subscription disabled');
        return () => {}; // Return empty unsubscribe function
      }

      // Enhanced subscription with better error handling and reconnection
      const personalSubscription = supabase
        .channel(`personal_notifications_${userId}`, {
          config: {
            broadcast: { self: false },
            presence: { key: userId }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'personal_notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            try {
              // Add metadata to payload for better handling
              const enhancedPayload = {
                ...payload,
                eventType: payload.eventType,
                table: payload.table,
                timestamp: new Date().toISOString(),
                userId: userId
              };
              callback(enhancedPayload);
            } catch (error) {
              console.error('Error processing real-time notification:', error);
            }
          }
        )
        .on('system', {}, (status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('Personal notifications subscription error, attempting reconnection...');
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Personal notifications subscription active');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Personal notifications subscription failed');
          }
        });

      const generalSubscription = supabase
        .channel('general_notifications', {
          config: {
            broadcast: { self: false }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'general_notifications'
          },
          (payload) => {
            try {
              const enhancedPayload = {
                ...payload,
                eventType: payload.eventType,
                table: payload.table,
                timestamp: new Date().toISOString()
              };
              callback(enhancedPayload);
            } catch (error) {
              console.error('Error processing real-time general notification:', error);
            }
          }
        )
        .on('system', {}, (status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('General notifications subscription error, attempting reconnection...');
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ General notifications subscription active');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ General notifications subscription failed');
          }
        });

      return () => {
        try {
          personalSubscription.unsubscribe();
          generalSubscription.unsubscribe();
          console.log('🔌 Notification subscriptions unsubscribed');
        } catch (error) {
          console.error('Error unsubscribing from notifications:', error);
        }
      };
    } catch (error) {
      console.warn('Error setting up notification subscriptions:', error);
      return () => {}; // Return empty unsubscribe function
    }
  }

  // Create a personal notification (for test notifications and general use)
  async createNotification(notificationData: {
    user_id: string;
    type: PersonalNotification['type'];
    title: string;
    message: string;
    data?: Record<string, unknown>;
    action_url?: string;
    action_text?: string;
  }): Promise<string | null> {
    return this.createPersonalNotification(
      notificationData.user_id,
      notificationData.title,
      notificationData.message,
      notificationData.type,
      notificationData.data,
      notificationData.action_url,
      notificationData.action_text
    );
  }

  // Convenience methods for creating specific types of notifications
  async createBookingRequestNotification(artistId: string, clientId: string, bookingData: Record<string, unknown>): Promise<string | null> {
    return this.createPersonalNotification(
      artistId,
      'New Booking Request',
      `You have a new booking request for ${bookingData.event_type} on ${new Date(bookingData.event_date).toLocaleDateString()}`,
      'booking_request',
      { bookingData, clientId },
      '/artist-dashboard',
      'View Request'
    );
  }

  async createBookingResponseNotification(bookingId: string, status: 'accepted' | 'declined'): Promise<string | null> {
    // First, get the booking details and client information
    const { data: booking, error: bookingError } = await supabase
      .from('artist_bookings')
      .select(`
        *,
        profiles!artist_bookings_user_id_fkey(display_name, avatar_url)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Error fetching booking details for notification:', bookingError);
      return null;
    }

    const action = status === 'accepted' ? 'accepted' : 'declined';
    const eventType = booking.event_description || 'your event';
    
    return this.createPersonalNotification(
      booking.user_id, // client user ID
      `Booking ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      `Your booking request for ${eventType} has been ${action} by the artist.`,
      `booking_${status}` as PersonalNotification['type'],
      { 
        bookingId,
        bookingData: {
          event_date: booking.event_date,
          event_location: booking.event_location,
          event_description: booking.event_description,
          budget_min: booking.budget_min,
          budget_max: booking.budget_max
        }
      },
      status === 'accepted' ? '/messages' : '/bookings',
      status === 'accepted' ? 'Start Chat' : 'View Details'
    );
  }

  async createNewFollowerNotification(userId: string, followerId: string): Promise<string | null> {
    return this.createPersonalNotification(
      userId,
      'New Follower',
      'You have a new follower!',
      'new_follower',
      { followerId },
      '/profile',
      'View Profile'
    );
  }

  async createMessageRequestNotification(userId: string, senderId: string, conversationId: string): Promise<string | null> {
    return this.createPersonalNotification(
      userId,
      'New Message',
      'You have received a new message',
      'message_request',
      { senderId, conversationId },
      '/messages',
      'View Message'
    );
  }

  async createEventReminderNotification(userId: string, eventData: Record<string, unknown>): Promise<string | null> {
    return this.createPersonalNotification(
      userId,
      'Event Reminder',
      `Don't forget about ${eventData.title} tomorrow!`,
      'event_reminder',
      { eventData },
      `/events/${eventData.id}`,
      'View Event'
    );
  }

  async createDiscussionRequestNotification(artistId: string, userId: string, discussionData: Record<string, unknown>): Promise<string | null> {
    return this.createPersonalNotification(
      artistId,
      'New Discussion Request',
      'Someone has requested to start a discussion with you',
      'discussion_request',
      { discussionData, userId },
      '/artist-dashboard',
      'Review Request'
    );
  }
}

export const notificationService = new NotificationService();
