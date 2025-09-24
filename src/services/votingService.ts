
import { supabase } from '@/integrations/supabase/client';
import { PostVote, CommentVote, VoteRequest, VOTE_TYPES } from '@/types/community';
import { VoteValidation, AntiSpamMeasures } from '@/types/engagement';

export class VotingService {
  // Post Voting
  static async voteOnPost(postId: string, voteType: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate vote
      const validation = await this.validateVote(user.id, 'post', postId, voteType);
      if (!validation.is_valid) {
        throw new Error(validation.reason || 'Invalid vote');
      }

      // Check for existing vote
      const { data: existingVote, error: fetchError } = await supabase
        .from('post_votes')
        .select('vote_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      let finalVoteType = voteType;

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking the same button
          finalVoteType = VOTE_TYPES.NONE;
        }
        // Update existing vote
        const { error: updateError } = await supabase
          .from('post_votes')
          .update({ vote_type: finalVoteType })
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        // Create new vote
        const { error: insertError } = await supabase
          .from('post_votes')
          .insert({
            post_id: postId,
            user_id: user.id,
            vote_type: finalVoteType
          });

        if (insertError) throw insertError;
      }

      // Update post vote counts
      await this.updatePostVoteCounts(postId);

      return true;
    } catch (error) {
      console.error('Error voting on post:', error);
      return false;
    }
  }

  // Comment Voting
  static async voteOnComment(commentId: string, voteType: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate vote
      const validation = await this.validateVote(user.id, 'comment', commentId, voteType);
      if (!validation.is_valid) {
        throw new Error(validation.reason || 'Invalid vote');
      }

      // Check for existing vote
      const { data: existingVote, error: fetchError } = await supabase
        .from('comment_votes')
        .select('vote_type')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      let finalVoteType = voteType;

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking the same button
          finalVoteType = VOTE_TYPES.NONE;
        }
        // Update existing vote
        const { error: updateError } = await supabase
          .from('comment_votes')
          .update({ vote_type: finalVoteType })
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        // Create new vote
        const { error: insertError } = await supabase
          .from('comment_votes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            vote_type: finalVoteType
          });

        if (insertError) throw insertError;
      }

      // Update comment vote counts
      await this.updateCommentVoteCounts(commentId);

      return true;
    } catch (error) {
      console.error('Error voting on comment:', error);
      return false;
    }
  }

  // Get user's vote on a post
  static async getUserPostVote(postId: string): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return VOTE_TYPES.NONE;

      const { data, error } = await supabase
        .from('post_votes')
        .select('vote_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.vote_type || VOTE_TYPES.NONE;
    } catch (error) {
      console.error('Error getting user post vote:', error);
      return VOTE_TYPES.NONE;
    }
  }

  // Get user's vote on a comment
  static async getUserCommentVote(commentId: string): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return VOTE_TYPES.NONE;

      const { data, error } = await supabase
        .from('comment_votes')
        .select('vote_type')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.vote_type || VOTE_TYPES.NONE;
    } catch (error) {
      console.error('Error getting user comment vote:', error);
      return VOTE_TYPES.NONE;
    }
  }

  // Get vote statistics for a post
  static async getPostVoteStats(postId: string): Promise<{
    upvotes: number;
    downvotes: number;
    score: number;
    upvote_ratio: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('upvotes, downvotes, score')
        .eq('id', postId)
        .single();

      if (error) throw error;

      const totalVotes = (data.upvotes || 0) + (data.downvotes || 0);
      const upvoteRatio = totalVotes > 0 ? (data.upvotes || 0) / totalVotes : 0;

      return {
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        score: data.score || 0,
        upvote_ratio: upvoteRatio
      };
    } catch (error) {
      console.error('Error getting post vote stats:', error);
      return {
        upvotes: 0,
        downvotes: 0,
        score: 0,
        upvote_ratio: 0
      };
    }
  }

  // Get vote statistics for a comment
  static async getCommentVoteStats(commentId: string): Promise<{
    upvotes: number;
    downvotes: number;
    score: number;
    upvote_ratio: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('upvotes, downvotes, score')
        .eq('id', commentId)
        .single();

      if (error) throw error;

      const totalVotes = (data.upvotes || 0) + (data.downvotes || 0);
      const upvoteRatio = totalVotes > 0 ? (data.upvotes || 0) / totalVotes : 0;

      return {
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        score: data.score || 0,
        upvote_ratio: upvoteRatio
      };
    } catch (error) {
      console.error('Error getting comment vote stats:', error);
      return {
        upvotes: 0,
        downvotes: 0,
        score: 0,
        upvote_ratio: 0
      };
    }
  }

  // Vote validation
  private static async validateVote(
    userId: string, 
    targetType: 'post' | 'comment', 
    targetId: string, 
    voteType: number
  ): Promise<VoteValidation> {
    // Check if vote type is valid
    if (![VOTE_TYPES.UP, VOTE_TYPES.DOWN, VOTE_TYPES.NONE].includes(voteType)) {
      return {
        is_valid: false,
        reason: 'Invalid vote type'
      };
    }

    // Check anti-spam measures
    const antiSpam = await this.checkAntiSpamMeasures(userId);
    if (antiSpam.is_rate_limited) {
      return {
        is_valid: false,
        reason: `Rate limited. Please wait ${antiSpam.cooldown_remaining} seconds before voting again.`
      };
    }

    // Check if user is voting on their own content
    const isOwnContent = await this.isOwnContent(userId, targetType, targetId);
    if (isOwnContent) {
      return {
        is_valid: false,
        reason: 'You cannot vote on your own content'
      };
    }

    return {
      is_valid: true,
      user_reputation: 1, // Default reputation
      vote_weight: 1 // Default vote weight
    };
  }

  // Anti-spam measures
  private static async checkAntiSpamMeasures(userId: string): Promise<AntiSpamMeasures> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Count votes in last hour
      const { count: hourCount, error: hourError } = await supabase
        .from('post_votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneHourAgo.toISOString());

      if (hourError) throw hourError;

      // Count votes in last 24 hours
      const { count: dayCount, error: dayError } = await supabase
        .from('post_votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneDayAgo.toISOString());

      if (dayError) throw dayError;

      const isRateLimited = (hourCount || 0) > 50 || (dayCount || 0) > 500;
      const cooldownRemaining = isRateLimited ? 3600 : 0; // 1 hour cooldown

      return {
        user_id: userId,
        vote_count_24h: dayCount || 0,
        vote_count_1h: hourCount || 0,
        is_rate_limited: isRateLimited,
        cooldown_remaining: cooldownRemaining
      };
    } catch (error) {
      console.error('Error checking anti-spam measures:', error);
      return {
        user_id: userId,
        vote_count_24h: 0,
        vote_count_1h: 0,
        is_rate_limited: false,
        cooldown_remaining: 0
      };
    }
  }

  // Check if user is voting on their own content
  private static async isOwnContent(
    userId: string, 
    targetType: 'post' | 'comment', 
    targetId: string
  ): Promise<boolean> {
    try {
      if (targetType === 'post') {
        const { data, error } = await supabase
          .from('community_posts')
          .select('user_id')
          .eq('id', targetId)
          .single();

        if (error) throw error;
        return data.user_id === userId;
      } else {
        const { data, error } = await supabase
          .from('comments')
          .select('user_id')
          .eq('id', targetId)
          .single();

        if (error) throw error;
        return data.user_id === userId;
      }
    } catch (error) {
      console.error('Error checking if own content:', error);
      return false;
    }
  }

  // Update post vote counts
  private static async updatePostVoteCounts(postId: string): Promise<void> {
    try {
      const { data: upvotes, error: upError } = await supabase
        .from('post_votes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('vote_type', VOTE_TYPES.UP);

      if (upError) throw upError;

      const { data: downvotes, error: downError } = await supabase
        .from('post_votes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('vote_type', VOTE_TYPES.DOWN);

      if (downError) throw downError;

      const upvoteCount = upvotes || 0;
      const downvoteCount = downvotes || 0;
      const score = upvoteCount - downvoteCount;

      await supabase
        .from('community_posts')
        .update({
          upvotes: upvoteCount,
          downvotes: downvoteCount,
          score: score
        })
        .eq('id', postId);
    } catch (error) {
      console.error('Error updating post vote counts:', error);
    }
  }

  // Update comment vote counts
  private static async updateCommentVoteCounts(commentId: string): Promise<void> {
    try {
      const { data: upvotes, error: upError } = await supabase
        .from('comment_votes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', commentId)
        .eq('vote_type', VOTE_TYPES.UP);

      if (upError) throw upError;

      const { data: downvotes, error: downError } = await supabase
        .from('comment_votes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', commentId)
        .eq('vote_type', VOTE_TYPES.DOWN);

      if (downError) throw downError;

      const upvoteCount = upvotes || 0;
      const downvoteCount = downvotes || 0;
      const score = upvoteCount - downvoteCount;

      await supabase
        .from('comments')
        .update({
          upvotes: upvoteCount,
          downvotes: downvoteCount,
          score: score
        })
        .eq('id', commentId);
    } catch (error) {
      console.error('Error updating comment vote counts:', error);
    }
  }

  // Get voting history for a user
  static async getUserVoteHistory(userId: string, limit: number = 50): Promise<{
    post_votes: PostVote[];
    comment_votes: CommentVote[];
  }> {
    try {
      const [postVotes, commentVotes] = await Promise.all([
        supabase
          .from('post_votes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('comment_votes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
      ]);

      return {
        post_votes: postVotes.data || [],
        comment_votes: commentVotes.data || []
      };
    } catch (error) {
      console.error('Error getting user vote history:', error);
      return {
        post_votes: [],
        comment_votes: []
      };
    }
  }
}
