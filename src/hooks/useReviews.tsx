import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Review {
  id: string;
  user_id: string;
  business_name: string;
  business_category: string;
  rating: number;
  review_text: string;
  location?: string;
  helpful_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  is_helpful?: boolean;
}

export interface ReviewReply {
  id: string;
  review_id: string;
  user_id: string;
  reply_text: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
}

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user's helpful votes
      const { data: userVotes } = await supabase
        .from('review_votes')
        .select('review_id')
        .eq('user_id', user?.id);

      const userVoteMap = new Map(userVotes?.map(vote => [vote.review_id, true]) || []);

      const reviewsWithAuthor = data?.map(review => ({
        ...review,
        author_name: review.profiles?.full_name || 'Anonymous',
        author_avatar: review.profiles?.avatar_url,
        is_helpful: userVoteMap.has(review.id)
      })) || [];

      setReviews(reviewsWithAuthor);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: {
    business_name: string;
    business_category: string;
    rating: number;
    review_text: string;
    location?: string;
  }) => {
    try {
      setCreating(true);
      
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user?.id,
          ...reviewData
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Review Posted",
        description: "Your review has been posted successfully.",
      });

      // Refresh reviews
      await fetchReviews();
      
      return { success: true, review: data };
    } catch (error: any) {
      console.error('Error creating review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to post review.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setCreating(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const existingVote = await supabase
        .from('review_votes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user?.id)
        .single();

      if (existingVote.data) {
        // Remove vote
        const { error } = await supabase
          .from('review_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user?.id);

        if (error) throw error;

        toast({
          title: "Vote Removed",
          description: "Your helpful vote has been removed.",
        });
      } else {
        // Add vote
        const { error } = await supabase
          .from('review_votes')
          .insert({
            review_id: reviewId,
            user_id: user?.id,
            is_helpful: true
          });

        if (error) throw error;

        toast({
          title: "Marked as Helpful",
          description: "Your vote has been recorded.",
        });
      }

      // Refresh reviews to update counts
      await fetchReviews();
    } catch (error: any) {
      console.error('Error marking helpful:', error);
      toast({
        title: "Error",
        description: "Failed to update vote.",
        variant: "destructive",
      });
    }
  };

  const addReply = async (reviewId: string, replyText: string) => {
    try {
      const { data, error } = await supabase
        .from('review_replies')
        .insert({
          review_id: reviewId,
          user_id: user?.id,
          reply_text: replyText
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Reply Posted",
        description: "Your reply has been posted successfully.",
      });

      return { success: true, reply: data };
    } catch (error: any) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to post reply.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Review Deleted",
        description: "Your review has been deleted.",
      });

      // Refresh reviews
      await fetchReviews();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  return {
    reviews,
    loading,
    creating,
    createReview,
    markHelpful,
    addReply,
    deleteReview,
    fetchReviews
  };
};
