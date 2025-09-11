import { supabase } from '@/integrations/supabase/client';

export interface EventDiscussion {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  likes_count: number;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  replies?: EventDiscussion[];
  user_liked?: boolean;
}

export interface CreateDiscussionData {
  event_id: string;
  content: string;
  parent_id?: string;
  is_anonymous?: boolean;
}

export class EventDiscussionService {
  /**
   * Fetch discussions for a specific event
   */
  static async fetchEventDiscussions(eventId: string): Promise<{ discussions: EventDiscussion[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('event_discussions')
        .select(`
          *,
          profiles!event_discussions_user_id_fkey(display_name, avatar_url),
          discussion_likes!left(user_id)
        `)
        .eq('event_id', eventId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const discussions: EventDiscussion[] = (data || []).map((discussion: any) => ({
        id: discussion.id,
        event_id: discussion.event_id,
        user_id: discussion.user_id,
        content: discussion.content,
        parent_id: discussion.parent_id,
        likes_count: discussion.likes_count || 0,
        is_anonymous: discussion.is_anonymous,
        created_at: discussion.created_at,
        updated_at: discussion.updated_at,
        author_name: discussion.is_anonymous ? 'Anonymous' : discussion.profiles?.display_name,
        author_avatar: discussion.is_anonymous ? null : discussion.profiles?.avatar_url,
        user_liked: discussion.discussion_likes?.length > 0
      }));

      // Fetch replies for each discussion
      for (const discussion of discussions) {
        const { data: replies, error: repliesError } = await supabase
          .from('event_discussions')
          .select(`
            *,
            profiles!event_discussions_user_id_fkey(display_name, avatar_url),
            discussion_likes!left(user_id)
          `)
          .eq('parent_id', discussion.id)
          .order('created_at', { ascending: true });

        if (!repliesError && replies) {
          discussion.replies = replies.map((reply: any) => ({
            id: reply.id,
            event_id: reply.event_id,
            user_id: reply.user_id,
            content: reply.content,
            parent_id: reply.parent_id,
            likes_count: reply.likes_count || 0,
            is_anonymous: reply.is_anonymous,
            created_at: reply.created_at,
            updated_at: reply.updated_at,
            author_name: reply.is_anonymous ? 'Anonymous' : reply.profiles?.display_name,
            author_avatar: reply.is_anonymous ? null : reply.profiles?.avatar_url,
            user_liked: reply.discussion_likes?.length > 0
          }));
        }
      }

      return { discussions, error: null };
    } catch (error: any) {
      console.error('Error fetching event discussions:', error);
      return { discussions: [], error: error.message };
    }
  }

  /**
   * Create a new discussion
   */
  static async createDiscussion(discussionData: CreateDiscussionData): Promise<{ success: boolean; discussionId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('event_discussions')
        .insert({
          event_id: discussionData.event_id,
          content: discussionData.content,
          parent_id: discussionData.parent_id || null,
          is_anonymous: discussionData.is_anonymous || false
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, discussionId: data.id };
    } catch (error: any) {
      console.error('Error creating discussion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Like/unlike a discussion
   */
  static async toggleDiscussionLike(discussionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Check if user already liked
      const { data: existingLike } = await supabase
        .from('discussion_likes')
        .select('id')
        .eq('discussion_id', discussionId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('discussion_likes')
          .delete()
          .eq('discussion_id', discussionId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Decrease likes count
        const { error: updateError } = await supabase
          .from('event_discussions')
          .update({ likes_count: supabase.raw('likes_count - 1') })
          .eq('id', discussionId);

        if (updateError) throw updateError;
      } else {
        // Like
        const { error: insertError } = await supabase
          .from('discussion_likes')
          .insert({
            discussion_id: discussionId,
            user_id: user.id
          });

        if (insertError) throw insertError;

        // Increase likes count
        const { error: updateError } = await supabase
          .from('event_discussions')
          .update({ likes_count: supabase.raw('likes_count + 1') })
          .eq('id', discussionId);

        if (updateError) throw updateError;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error toggling discussion like:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a discussion (only by author)
   */
  static async deleteDiscussion(discussionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('event_discussions')
        .delete()
        .eq('id', discussionId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting discussion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a discussion (only by author)
   */
  static async updateDiscussion(discussionId: string, content: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('event_discussions')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', discussionId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating discussion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get discussion statistics for an event
   */
  static async getEventDiscussionStats(eventId: string): Promise<{ stats: any; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('event_discussions')
        .select('id, likes_count, created_at')
        .eq('event_id', eventId);

      if (error) throw error;

      const stats = {
        total_discussions: data.length,
        total_likes: data.reduce((sum, discussion) => sum + (discussion.likes_count || 0), 0),
        recent_discussions: data.filter(d => {
          const createdAt = new Date(d.created_at);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return createdAt > oneDayAgo;
        }).length
      };

      return { stats, error: null };
    } catch (error: any) {
      console.error('Error getting discussion stats:', error);
      return { stats: null, error: error.message };
    }
  }
}
