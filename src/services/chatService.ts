import { supabase } from '@/integrations/supabase/client';

export interface ChatConversation {
  id: string;
  booking_id: string | null;
  client_id: string;
  artist_id: string;
  status: 'active' | 'closed' | 'pending';
  created_at: string;
  updated_at: string;
}

export class ChatService {
  /**
   * Get or create a chat conversation for an accepted booking
   */
  static async getOrCreateConversationForBooking(bookingId: string): Promise<string | null> {
    try {
      // First, check if a conversation already exists for this booking
      const { data: existingConversation, error: existingError } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('booking_id', bookingId)
        .single();

      if (existingConversation) {
        return existingConversation.id;
      }

      // If no conversation exists, get the booking details
      const { data: booking, error: bookingError } = await supabase
        .from('artist_bookings')
        .select(`
          id,
          user_id,
          artist_id,
          status
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        console.error('Error fetching booking details:', bookingError);
        return null;
      }

      // Only create conversation for accepted bookings
      if (booking.status !== 'accepted') {
        console.warn('Cannot create chat conversation for non-accepted booking');
        return null;
      }

      // Get the artist's user_id
      const { data: artist, error: artistError } = await supabase
        .from('artists')
        .select('user_id')
        .eq('id', booking.artist_id)
        .single();

      if (artistError || !artist) {
        console.error('Error fetching artist details:', artistError);
        return null;
      }

      // Create the conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('chat_conversations')
        .insert({
          booking_id: bookingId,
          client_id: booking.user_id,
          artist_id: artist.user_id,
          status: 'active'
        })
        .select('id')
        .single();

      if (conversationError) {
        console.error('Error creating chat conversation:', conversationError);
        return null;
      }

      return conversation.id;
    } catch (error) {
      console.error('Error in getOrCreateConversationForBooking:', error);
      return null;
    }
  }

  /**
   * Check if a user can chat with an artist based on booking status
   * @param userId - The user ID of the client
   * @param artistUserId - The user ID of the artist (not the artists.id)
   */
  static async canUserChatWithArtist(userId: string, artistUserId: string): Promise<boolean> {
    try {
      // First, get the artist's record ID from their user ID
      const { data: artist, error: artistError } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', artistUserId)
        .single();

      if (artistError || !artist) {
        console.error('Error fetching artist record:', artistError);
        return false;
      }

      // Check if there's an accepted booking between the user and artist
      const { data: booking, error } = await supabase
        .from('artist_bookings')
        .select('id, status')
        .eq('user_id', userId)
        .eq('artist_id', artist.id) // Use the artists.id, not user_id
        .eq('status', 'accepted')
        .single();

      if (error || !booking) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking chat permissions:', error);
      return false;
    }
  }

  /**
   * Get all chat conversations for a user
   */
  static async getUserConversations(userId: string): Promise<ChatConversation[]> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .or(`client_id.eq.${userId},artist_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching user conversations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserConversations:', error);
      return [];
    }
  }

  /**
   * Create a welcome message for a new conversation
   */
  static async createWelcomeMessage(conversationId: string, senderId: string, bookingDescription: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          message: `Hello! I've accepted your booking request for ${bookingDescription}. Let's discuss the details!`,
          message_type: 'text'
        });

      if (error) {
        console.error('Error creating welcome message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createWelcomeMessage:', error);
      return false;
    }
  }
}
