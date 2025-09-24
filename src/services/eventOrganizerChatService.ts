import { supabase } from '@/integrations/supabase/client';

export interface EventOrganizerChat {
  id: string;
  event_id: string;
  attendee_id: string;
  organizer_id: string;
  status: 'active' | 'closed' | 'blocked';
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  event?: {
    id: string;
    title: string;
    image_url?: string;
  };
  attendee?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
  organizer?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
  unread_count?: number;
}

export interface EventOrganizerMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export interface CreateChatData {
  event_id: string;
  attendee_id: string;
  organizer_id: string;
}

export interface SendMessageData {
  chat_id: string;
  message: string;
  message_type?: 'text' | 'image' | 'file';
}

export class EventOrganizerChatService {
  /**
   * Get or create a chat session between attendee and organizer
   */
  static async getOrCreateChat(eventId: string, organizerId: string): Promise<{ chat: EventOrganizerChat | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { chat: null, error: 'Not authenticated' };
      }

      // Check if chat already exists
      const { data: existingChat, error: fetchError } = await supabase
        .from('event_organizer_chat')
        .select(`
          *,
          event:events(id, title, image_url),
          attendee:profiles!event_organizer_chat_attendee_id_fkey(id, display_name, avatar_url),
          organizer:profiles!event_organizer_chat_organizer_id_fkey(id, display_name, avatar_url)
        `)
        .eq('event_id', eventId)
        .eq('attendee_id', user.id)
        .eq('organizer_id', organizerId)
        .single();

      if (existingChat && !fetchError) {
        // Get unread count
        const { count: unreadCount } = await supabase
          .from('event_organizer_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', existingChat.id)
          .eq('is_read', false)
          .neq('sender_id', user.id);

        return { 
          chat: { 
            ...existingChat, 
            unread_count: unreadCount || 0 
          }, 
          error: null 
        };
      }

      // Create new chat
      const { data: newChat, error: createError } = await supabase
        .from('event_organizer_chat')
        .insert({
          event_id: eventId,
          attendee_id: user.id,
          organizer_id: organizerId
        })
        .select(`
          *,
          event:events(id, title, image_url),
          attendee:profiles!event_organizer_chat_attendee_id_fkey(id, display_name, avatar_url),
          organizer:profiles!event_organizer_chat_organizer_id_fkey(id, display_name, avatar_url)
        `)
        .single();

      if (createError) throw createError;

      return { chat: { ...newChat, unread_count: 0 }, error: null };
    } catch (error: unknown) {
      console.error('Error getting or creating chat:', error);
      return { chat: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get all chats for a user (as attendee or organizer)
   */
  static async getUserChats(): Promise<{ chats: EventOrganizerChat[]; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { chats: [], error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('event_organizer_chat')
        .select(`
          *,
          event:events(id, title, image_url),
          attendee:profiles!event_organizer_chat_attendee_id_fkey(id, display_name, avatar_url),
          organizer:profiles!event_organizer_chat_organizer_id_fkey(id, display_name, avatar_url)
        `)
        .or(`attendee_id.eq.${user.id},organizer_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Get unread counts for each chat
      const chatsWithUnreadCounts = await Promise.all(
        (data || []).map(async (chat) => {
          const { count: unreadCount } = await supabase
            .from('event_organizer_messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return { ...chat, unread_count: unreadCount || 0 };
        })
      );

      return { chats: chatsWithUnreadCounts, error: null };
    } catch (error: unknown) {
      console.error('Error getting user chats:', error);
      return { chats: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get messages for a specific chat
   */
  static async getChatMessages(chatId: string): Promise<{ messages: EventOrganizerMessage[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('event_organizer_messages')
        .select(`
          *,
          sender:profiles!event_organizer_messages_sender_id_fkey(id, display_name, avatar_url)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { messages: data || [], error: null };
    } catch (error: unknown) {
      console.error('Error getting chat messages:', error);
      return { messages: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send a message in a chat
   */
  static async sendMessage(messageData: SendMessageData): Promise<{ message: EventOrganizerMessage | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { message: null, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('event_organizer_messages')
        .insert({
          chat_id: messageData.chat_id,
          sender_id: user.id,
          message: messageData.message,
          message_type: messageData.message_type || 'text'
        })
        .select(`
          *,
          sender:profiles!event_organizer_messages_sender_id_fkey(id, display_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      return { message: data, error: null };
    } catch (error: unknown) {
      console.error('Error sending message:', error);
      return { message: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(chatId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('event_organizer_messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: unknown) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Close a chat session
   */
  static async closeChat(chatId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('event_organizer_chat')
        .update({ status: 'closed' })
        .eq('id', chatId)
        .or(`attendee_id.eq.${user.id},organizer_id.eq.${user.id}`);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: unknown) {
      console.error('Error closing chat:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get chat statistics
   */
  static async getChatStats(): Promise<{ stats: { total_chats: number; unread_messages: number; active_chats: number } | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { stats: null, error: 'Not authenticated' };
      }

      // Get total chats
      const { count: totalChats } = await supabase
        .from('event_organizer_chat')
        .select('*', { count: 'exact', head: true })
        .or(`attendee_id.eq.${user.id},organizer_id.eq.${user.id}`);

      // Get active chats
      const { count: activeChats } = await supabase
        .from('event_organizer_chat')
        .select('*', { count: 'exact', head: true })
        .or(`attendee_id.eq.${user.id},organizer_id.eq.${user.id}`)
        .eq('status', 'active');

      // Get unread messages
      const { data: chats } = await supabase
        .from('event_organizer_chat')
        .select('id')
        .or(`attendee_id.eq.${user.id},organizer_id.eq.${user.id}`);

      let unreadMessages = 0;
      if (chats && chats.length > 0) {
        const chatIds = chats.map(chat => chat.id);
        const { count } = await supabase
          .from('event_organizer_messages')
          .select('*', { count: 'exact', head: true })
          .in('chat_id', chatIds)
          .eq('is_read', false)
          .neq('sender_id', user.id);
        
        unreadMessages = count || 0;
      }

      return {
        stats: {
          total_chats: totalChats || 0,
          unread_messages: unreadMessages,
          active_chats: activeChats || 0
        },
        error: null
      };
    } catch (error: unknown) {
      console.error('Error getting chat stats:', error);
      return { stats: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
