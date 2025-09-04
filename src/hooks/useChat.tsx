import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/services/notificationService";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export interface ChatParticipantProfile {
  user_id: string;
  display_name?: string;
  avatar_url?: string;
}

export interface ChatConversationDetails {
  id: string;
  booking_id?: string | null;
  client_id: string;
  artist_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  other_user?: ChatParticipantProfile;
}

export const useChat = (conversationId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversation, setConversation] = useState<ChatConversationDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!conversationId || !user) return;
    setLoading(true);
    fetchConversation();
    fetchMessages();

    // Subscribe to realtime messages for this conversation
    const channel = supabase
      .channel(`chat_messages_${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload: { new: ChatMessage }) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, user?.id]);

  const fetchConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      // Identify the other user
      const otherUserId = data.client_id === user?.id ? data.artist_id : data.client_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .eq('user_id', otherUserId)
        .single();

      setConversation({ ...data, other_user: profile || undefined });
    } catch (err: unknown) {
      console.error('Error fetching conversation:', err);
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to load conversation', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as ChatMessage[]) || []);
    } catch (err: unknown) {
      console.error('Error fetching messages:', err);
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to load messages', variant: 'destructive' });
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !conversationId) return;

    // Insert the message
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message: content,
        message_type: 'text'
      });
    if (error) throw error;

    // If conversation is pending and the recipient hasn't accepted yet, send an approval notification
    if (conversation?.status === 'pending') {
      const recipientId = user.id === conversation?.client_id ? conversation?.artist_id : conversation?.client_id;
      if (recipientId) {
        try {
          await notificationService.createMessageRequestNotification(user.id, recipientId, conversationId);
        } catch (notificationError) {
          console.error('Error creating message request notification:', notificationError);
          // Don't fail the message if notification fails
        }
      }
    }
  };

  const isOwnMessage = useMemo(() => {
    return (senderId: string) => senderId === user?.id;
  }, [user?.id]);

  return {
    loading,
    conversation,
    messages,
    sendMessage,
    isOwnMessage
  };
};


