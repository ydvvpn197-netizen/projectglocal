import { supabase } from '@/integrations/supabase/client';

export interface NotificationData {
  user_id: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_declined' | 'message_request' | 'new_follower' | 'event_reminder' | 'poll_result' | 'review_reply' | 'group_invite' | 'event_update' | 'discussion_request' | 'discussion_approved' | 'discussion_rejected' | 'event_created' | 'event_updated' | 'event_cancelled' | 'payment_received' | 'payment_failed' | 'system_announcement';
  title: string;
  message: string;
  data?: any;
}

export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Create a notification for a user
   */
  async createNotification(notificationData: NotificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create booking request notification
   */
  async createBookingRequestNotification(artistId: string, clientId: string, bookingData: any) {
    const { data: artistProfile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('user_id', artistId)
      .single();

    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('user_id', clientId)
      .single();

    const clientName = clientProfile?.display_name || clientProfile?.username || 'A user';
    const artistName = artistProfile?.display_name || artistProfile?.username || 'Artist';

    // Notify artist about booking request
    await this.createNotification({
      user_id: artistId,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `${clientName} has requested to book you for an event.`,
      data: {
        booking_id: bookingData.id,
        client_id: clientId,
        client_name: clientName,
        event_type: bookingData.event_type,
        event_date: bookingData.event_date,
        event_location: bookingData.event_location,
        budget_min: bookingData.budget_min,
        budget_max: bookingData.budget_max
      }
    });

    // Notify client that request was sent
    await this.createNotification({
      user_id: clientId,
      type: 'booking_request',
      title: 'Booking Request Sent',
      message: `Your booking request has been sent to ${artistName}.`,
      data: {
        booking_id: bookingData.id,
        artist_id: artistId,
        artist_name: artistName,
        event_type: bookingData.event_type,
        event_date: bookingData.event_date
      }
    });
  }

  /**
   * Create booking response notification
   */
  async createBookingResponseNotification(bookingId: string, status: 'accepted' | 'declined') {
    const { data: booking } = await supabase
      .from('artist_bookings')
      .select(`
        id,
        user_id,
        artist_id,
        event_date,
        event_location,
        event_description,
        profiles!artist_bookings_artist_id_fkey(display_name, username),
        profiles!artist_bookings_user_id_fkey(display_name, username)
      `)
      .eq('id', bookingId)
      .single();

    if (!booking) return;

    const artistName = booking.profiles?.display_name || booking.profiles?.username || 'Artist';
    const clientName = booking.profiles?.display_name || booking.profiles?.username || 'Client';

    const notificationType = status === 'accepted' ? 'booking_accepted' : 'booking_declined';
    const title = status === 'accepted' ? 'Booking Accepted' : 'Booking Declined';
    const message = status === 'accepted' 
      ? `${artistName} has accepted your booking request.`
      : `${artistName} has declined your booking request.`;

    // Notify client about booking response
    await this.createNotification({
      user_id: booking.user_id,
      type: notificationType,
      title,
      message,
      data: {
        booking_id: bookingId,
        artist_id: booking.artist_id,
        artist_name: artistName,
        event_date: booking.event_date,
        event_location: booking.event_location,
        status
      }
    });
  }

  /**
   * Create new follower notification
   */
  async createNewFollowerNotification(followerId: string, followingId: string) {
    const { data: followerProfile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('user_id', followerId)
      .single();

    const followerName = followerProfile?.display_name || followerProfile?.username || 'Someone';

    await this.createNotification({
      user_id: followingId,
      type: 'new_follower',
      title: 'New Follower',
      message: `${followerName} started following you.`,
      data: {
        follower_id: followerId,
        follower_name: followerName
      }
    });
  }

  /**
   * Create message request notification
   */
  async createMessageRequestNotification(senderId: string, recipientId: string, conversationId: string) {
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('user_id', senderId)
      .single();

    const senderName = senderProfile?.display_name || senderProfile?.username || 'Someone';

    await this.createNotification({
      user_id: recipientId,
      type: 'message_request',
      title: 'New Message Request',
      message: `${senderName} wants to start a conversation with you.`,
      data: {
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: senderName
      }
    });
  }

  /**
   * Create event reminder notification
   */
  async createEventReminderNotification(userId: string, eventData: any) {
    await this.createNotification({
      user_id: userId,
      type: 'event_reminder',
      title: 'Event Reminder',
      message: `Reminder: ${eventData.title} is happening soon.`,
      data: {
        event_id: eventData.id,
        event_title: eventData.title,
        event_date: eventData.event_date,
        event_location: eventData.location_name
      }
    });
  }

  /**
   * Create event update notification
   */
  async createEventUpdateNotification(eventId: string, updateType: 'created' | 'updated' | 'cancelled') {
    const { data: event } = await supabase
      .from('events')
      .select(`
        id,
        title,
        event_date,
        location_name,
        user_id,
        event_attendees(user_id)
      `)
      .eq('id', eventId)
      .single();

    if (!event) return;

    const title = updateType === 'created' ? 'New Event Created' : 
                  updateType === 'updated' ? 'Event Updated' : 'Event Cancelled';
    
    const message = updateType === 'created' ? `A new event "${event.title}" has been created.` :
                   updateType === 'updated' ? `The event "${event.title}" has been updated.` :
                   `The event "${event.title}" has been cancelled.`;

    // Notify event creator
    await this.createNotification({
      user_id: event.user_id,
      type: 'event_update',
      title,
      message,
      data: {
        event_id: eventId,
        event_title: event.title,
        update_type: updateType
      }
    });

    // Notify event attendees
    if (event.event_attendees) {
      for (const attendee of event.event_attendees) {
        if (attendee.user_id !== event.user_id) {
          await this.createNotification({
            user_id: attendee.user_id,
            type: 'event_update',
            title,
            message,
            data: {
              event_id: eventId,
              event_title: event.title,
              update_type: updateType
            }
          });
        }
      }
    }
  }

  /**
   * Create discussion request notification
   */
  async createDiscussionRequestNotification(artistId: string, discussionData: any) {
    const { data: artistProfile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('user_id', artistId)
      .single();

    const artistName = artistProfile?.display_name || artistProfile?.username || 'Artist';

    await this.createNotification({
      user_id: artistId,
      type: 'discussion_request',
      title: 'New Discussion Request',
      message: `Someone has requested to start a discussion with you.`,
      data: {
        discussion_id: discussionData.id,
        discussion_title: discussionData.title,
        artist_name: artistName
      }
    });
  }

  /**
   * Create discussion response notification
   */
  async createDiscussionResponseNotification(discussionId: string, status: 'approved' | 'rejected') {
    const { data: discussion } = await supabase
      .from('artist_discussions')
      .select(`
        id,
        user_id,
        artist_id,
        title,
        profiles!artist_discussions_user_id_fkey(display_name, username)
      `)
      .eq('id', discussionId)
      .single();

    if (!discussion) return;

    const userProfile = discussion.profiles;
    const userName = userProfile?.display_name || userProfile?.username || 'User';

    const notificationType = status === 'approved' ? 'discussion_approved' : 'discussion_rejected';
    const title = status === 'approved' ? 'Discussion Approved' : 'Discussion Rejected';
    const message = status === 'approved' 
      ? `Your discussion request "${discussion.title}" has been approved.`
      : `Your discussion request "${discussion.title}" has been rejected.`;

    await this.createNotification({
      user_id: discussion.user_id,
      type: notificationType,
      title,
      message,
      data: {
        discussion_id: discussionId,
        discussion_title: discussion.title,
        artist_id: discussion.artist_id,
        status
      }
    });
  }

  /**
   * Create system announcement notification
   */
  async createSystemAnnouncementNotification(userIds: string[], announcement: { title: string; message: string; data?: any }) {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: 'system_announcement' as const,
      title: announcement.title,
      message: announcement.message,
      data: announcement.data
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('Error creating system announcements:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

export const notificationService = NotificationService.getInstance();
