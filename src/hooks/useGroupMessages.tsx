import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  user_display_name: string;
  user_avatar_url?: string;
  likes_count: number;
  is_liked_by_user: boolean;
  replies_count: number;
  views_count: number;
}

export const useGroupMessages = (groupId: string) => {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_group_messages_with_details', {
        group_id_param: groupId
      });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, toast]);

  const postMessage = async (content: string, parentId?: string) => {
    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          content,
          parent_id: parentId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      
      await fetchMessages();
      toast({
        title: "Success",
        description: "Message posted successfully!"
      });
    } catch (error) {
      console.error('Error posting message:', error);
      toast({
        title: "Error",
        description: "Failed to post message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('group_messages')
        .update({ 
          content,
          is_edited: true
        })
        .eq('id', messageId);

      if (error) throw error;
      
      await fetchMessages();
      toast({
        title: "Success",
        description: "Message updated successfully!"
      });
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: "Error",
        description: "Failed to edit message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('group_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      
      await fetchMessages();
      toast({
        title: "Success",
        description: "Message deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleLike = async (messageId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('group_message_likes')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('group_message_likes')
          .insert({
            message_id: messageId,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });
        
        if (error) throw error;
      }
      
      await fetchMessages();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
    }
  };

  const markAsViewed = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('group_message_views')
        .upsert({
          message_id: messageId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as viewed:', error);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchMessages();
    }
  }, [groupId, fetchMessages]);

  // Set up real-time subscription
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel('group-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_message_likes'
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, fetchMessages]);

  return {
    messages,
    loading,
    postMessage,
    editMessage,
    deleteMessage,
    toggleLike,
    markAsViewed,
    refetch: fetchMessages
  };
};
