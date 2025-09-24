import { useState, useCallback } from 'react';
import { VotingService } from '@/services/votingService';
import { VOTE_TYPES } from '@/types/community';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useVoting = () => {
  const [voting, setVoting] = useState<{
    postId?: string;
    commentId?: string;
    voteType: number;
  } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Vote on a post
  const voteOnPost = useCallback(async (postId: string, voteType: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        variant: "destructive",
      });
      return false;
    }

    try {
      setVoting({ postId, voteType });
      const success = await VotingService.voteOnPost(postId, voteType);
      
      if (success) {
        const voteText = voteType === VOTE_TYPES.UP ? 'upvoted' : 
                        voteType === VOTE_TYPES.DOWN ? 'downvoted' : 'removed vote from';
        toast({
          title: "Success",
          description: `Successfully ${voteText} post`,
        });
        return true;
      } else {
        throw new Error('Failed to vote on post');
      }
    } catch (error) {
      console.error('Error voting on post:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to vote on post",
        variant: "destructive",
      });
      return false;
    } finally {
      setVoting(null);
    }
  }, [user, toast]);

  // Vote on a comment
  const voteOnComment = useCallback(async (commentId: string, voteType: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        variant: "destructive",
      });
      return false;
    }

    try {
      setVoting({ commentId, voteType });
      const success = await VotingService.voteOnComment(commentId, voteType);
      
      if (success) {
        const voteText = voteType === VOTE_TYPES.UP ? 'upvoted' : 
                        voteType === VOTE_TYPES.DOWN ? 'downvoted' : 'removed vote from';
        toast({
          title: "Success",
          description: `Successfully ${voteText} comment`,
        });
        return true;
      } else {
        throw new Error('Failed to vote on comment');
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to vote on comment",
        variant: "destructive",
      });
      return false;
    } finally {
      setVoting(null);
    }
  }, [user, toast]);

  // Get user's vote on a post
  const getUserPostVote = useCallback(async (postId: string): Promise<number> => {
    if (!user) return VOTE_TYPES.NONE;

    try {
      return await VotingService.getUserPostVote(postId);
    } catch (error) {
      console.error('Error getting user post vote:', error);
      return VOTE_TYPES.NONE;
    }
  }, [user]);

  // Get user's vote on a comment
  const getUserCommentVote = useCallback(async (commentId: string): Promise<number> => {
    if (!user) return VOTE_TYPES.NONE;

    try {
      return await VotingService.getUserCommentVote(commentId);
    } catch (error) {
      console.error('Error getting user comment vote:', error);
      return VOTE_TYPES.NONE;
    }
  }, [user]);

  // Get vote statistics for a post
  const getPostVoteStats = useCallback(async (postId: string) => {
    try {
      return await VotingService.getPostVoteStats(postId);
    } catch (error) {
      console.error('Error getting post vote stats:', error);
      return {
        upvotes: 0,
        downvotes: 0,
        score: 0,
        upvote_ratio: 0
      };
    }
  }, []);

  // Get vote statistics for a comment
  const getCommentVoteStats = useCallback(async (commentId: string) => {
    try {
      return await VotingService.getCommentVoteStats(commentId);
    } catch (error) {
      console.error('Error getting comment vote stats:', error);
      return {
        upvotes: 0,
        downvotes: 0,
        score: 0,
        upvote_ratio: 0
      };
    }
  }, []);

  // Get user's voting history
  const getUserVoteHistory = useCallback(async (limit: number = 50) => {
    if (!user) return { post_votes: [], comment_votes: [] };

    try {
      return await VotingService.getUserVoteHistory(user.id, limit);
    } catch (error) {
      console.error('Error getting user vote history:', error);
      return { post_votes: [], comment_votes: [] };
    }
  }, [user]);

  // Handle vote toggle (upvote -> remove -> downvote -> remove)
  const handleVoteToggle = useCallback(async (
    targetId: string, 
    currentVote: number, 
    newVoteType: number,
    targetType: 'post' | 'comment' = 'post'
  ): Promise<boolean> => {
    let finalVoteType = newVoteType;
    
    // If clicking the same vote type, remove the vote
    if (currentVote === newVoteType) {
      finalVoteType = VOTE_TYPES.NONE;
    }

    if (targetType === 'post') {
      return await voteOnPost(targetId, finalVoteType);
    } else {
      return await voteOnComment(targetId, finalVoteType);
    }
  }, [voteOnPost, voteOnComment]);

  // Check if user is currently voting on a specific target
  const isVotingOn = useCallback((targetId: string, targetType: 'post' | 'comment' = 'post'): boolean => {
    if (!voting) return false;
    
    if (targetType === 'post') {
      return voting.postId === targetId;
    } else {
      return voting.commentId === targetId;
    }
  }, [voting]);

  // Get current voting state
  const getVotingState = useCallback(() => {
    return voting;
  }, [voting]);

  return {
    // State
    voting,
    
    // Actions
    voteOnPost,
    voteOnComment,
    getUserPostVote,
    getUserCommentVote,
    getPostVoteStats,
    getCommentVoteStats,
    getUserVoteHistory,
    handleVoteToggle,
    isVotingOn,
    getVotingState,
    
    // Constants
    VOTE_TYPES,
  };
};
