import { supabase } from '@/integrations/supabase/client';

export interface ChatConversation {
  id: string;
  client_id: string;
  artist_id: string;
  booking_id?: string;
  status: 'pending' | 'active' | 'blocked' | 'archived';
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  metadata?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface ChatParticipantProfile {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  is_verified: boolean;
  is_premium: boolean;
}

export interface ChatConversationDetails extends ChatConversation {
  client?: ChatParticipantProfile;
  artist?: ChatParticipantProfile;
  other_user?: ChatParticipantProfile;
  last_message?: ChatMessage;
  unread_count?: number;
}

export class ChatService {
  /**
   * Get or create a chat conversation between two users
   */
  static async getOrCreateConversation(clientId: string, artistId: string): Promise<string | null> {
    try {
      // First, check if a conversation already exists
      const { data: existingConversation, error: existingError } = await supabase
        .from('chat_conversations')
        .select('id')
        .or(`and(client_id.eq.${clientId},artist_id.eq.${artistId}),and(client_id.eq.${artistId},artist_id.eq.${clientId})`)
        .single();

      if (existingConversation) {
        return existingConversation.id;
      }

      // Create new conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('chat_conversations')
        .insert({
          client_id: clientId,
          artist_id: artistId,
          status: 'pending'
        })
        .select('id')
        .single();

      if (conversationError) {
        console.error('Error creating conversation:', conversationError);
        return null;
      }

      return conversation.id;
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      return null;
    }
  }

  /**
   * Get conversation details with participant information
   */
  static async getConversationDetails(conversationId: string, userId: string): Promise<ChatConversationDetails | null> {
    try {
      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          client:profiles!client_id(id, user_id, display_name, username, avatar_url, is_verified, is_premium),
          artist:profiles!artist_id(id, user_id, display_name, username, avatar_url, is_verified, is_premium)
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      // Get the other user's profile
      const otherUserId = conversation.client_id === userId ? conversation.artist_id : conversation.client_id;
      const otherUser = conversation.client_id === userId ? conversation.artist : conversation.client;

      // Get last message
      const { data: lastMessage } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', userId);

      return {
        ...conversation,
        other_user: otherUser,
        last_message: lastMessage,
        unread_count: unreadCount || 0
      };
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      return null;
    }
  }

  /**
   * Get all conversations for a user
   */
  static async getUserConversations(userId: string): Promise<ChatConversationDetails[]> {
    try {
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          client:profiles!client_id(id, user_id, display_name, username, avatar_url, is_verified, is_premium),
          artist:profiles!artist_id(id, user_id, display_name, username, avatar_url, is_verified, is_premium)
        `)
        .or(`client_id.eq.${userId},artist_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Get last messages and unread counts for each conversation
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conversation) => {
          const otherUserId = conversation.client_id === userId ? conversation.artist_id : conversation.client_id;
          const otherUser = conversation.client_id === userId ? conversation.artist : conversation.client;

          const [lastMessageResult, unreadCountResult] = await Promise.all([
            supabase
              .from('chat_messages')
              .select('*')
              .eq('conversation_id', conversation.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single(),
            supabase
              .from('chat_messages')
              .select('*', { count: 'exact' })
              .eq('conversation_id', conversation.id)
              .eq('is_read', false)
              .neq('sender_id', userId)
          ]);

          return {
            ...conversation,
            other_user: otherUser,
            last_message: lastMessageResult.data,
            unread_count: unreadCountResult.count || 0
          };
        })
      );

      return conversationsWithDetails;
    } catch (error) {
        console.error('Error fetching user conversations:', error);
        return [];
      }
  }

  /**
   * Get messages for a conversation
   */
  static async getConversationMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Send a message
   */
  static async sendMessage(conversationId: string, senderId: string, message: string, messageType: 'text' | 'image' | 'file' = 'text'): Promise<ChatMessage | null> {
    try {
      const { data: newMessage, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          message,
          message_type: messageType
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last_message_at
      await supabase
        .from('chat_conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  /**
   * Accept a conversation request
   */
  static async acceptConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .or(`client_id.eq.${userId},artist_id.eq.${userId}`);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error accepting conversation:', error);
      return false;
    }
  }

  /**
   * Reject/block a conversation
   */
  static async blockConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ 
          status: 'blocked',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .or(`client_id.eq.${userId},artist_id.eq.${userId}`);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error blocking conversation:', error);
      return false;
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
        return false;
      }
  }

  /**
   * Get pending conversation requests
   */
  static async getPendingRequests(userId: string): Promise<ChatConversationDetails[]> {
    try {
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          client:profiles!client_id(id, user_id, display_name, username, avatar_url, is_verified, is_premium),
          artist:profiles!artist_id(id, user_id, display_name, username, avatar_url, is_verified, is_premium)
        `)
        .eq('status', 'pending')
        .or(`client_id.eq.${userId},artist_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return conversations.map(conversation => {
        const otherUserId = conversation.client_id === userId ? conversation.artist_id : conversation.client_id;
        const otherUser = conversation.client_id === userId ? conversation.artist : conversation.client;

        return {
          ...conversation,
          other_user: otherUser
        };
      });
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  }

  /**
   * Archive a conversation
   */
  static async archiveConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .or(`client_id.eq.${userId},artist_id.eq.${userId}`);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error archiving conversation:', error);
      return false;
    }
  }
}
