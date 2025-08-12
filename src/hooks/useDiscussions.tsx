import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from './useLocation';

export interface Discussion {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  is_anonymous: boolean;
  group_id?: string;
  group_name?: string;
  author_name: string;
  author_avatar?: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDiscussionData {
  title: string;
  content: string;
  category?: string;
  is_anonymous?: boolean;
  group_id?: string;
}

export const useDiscussions = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentLocation } = useLocation();

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_discussions_with_details');
      
      if (error) throw error;
      
      setDiscussions(data || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch discussions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDiscussion = async (discussionData: CreateDiscussionData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create discussions",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase.from('discussions').insert({
        user_id: user.id,
        title: discussionData.title,
        content: discussionData.content,
        category: discussionData.category || 'general',
        is_anonymous: discussionData.is_anonymous || false,
        group_id: discussionData.group_id || null,
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discussion created successfully!",
      });

      fetchDiscussions(); // Refresh discussions
      return true;
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to create discussion",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchDiscussions();
    }
  }, [user]);

  return {
    discussions,
    loading,
    createDiscussion,
    refetch: fetchDiscussions,
  };
};