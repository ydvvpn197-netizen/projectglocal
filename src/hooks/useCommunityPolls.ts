import { useState, useEffect, useCallback } from 'react';
import { PollService } from '@/services/pollService';
import { PointsService } from '@/services/pointsService';
import { CommunityPoll, CreatePollRequest, PollVoteRequest } from '@/types/community';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useCommunityPolls = () => {
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [activePolls, setActivePolls] = useState<CommunityPoll[]>([]);
  const [expiredPolls, setExpiredPolls] = useState<CommunityPoll[]>([]);
  const [userPollVotes, setUserPollVotes] = useState<{
    poll_id: string;
    selected_options: string[];
    created_at: string;
    poll: CommunityPoll;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch polls
  const fetchPolls = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PollService.getActivePolls();
      setPolls(data);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: "Error",
        description: "Failed to fetch polls",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch active polls
  const fetchActivePolls = useCallback(async (limit: number = 20) => {
    try {
      const data = await PollService.getActivePolls(limit);
      setActivePolls(data);
    } catch (error) {
      console.error('Error fetching active polls:', error);
    }
  }, []);

  // Fetch expired polls
  const fetchExpiredPolls = useCallback(async (limit: number = 20) => {
    try {
      const data = await PollService.getExpiredPolls(limit);
      setExpiredPolls(data);
    } catch (error) {
      console.error('Error fetching expired polls:', error);
    }
  }, []);

  // Fetch user's poll votes
  const fetchUserPollVotes = useCallback(async (limit: number = 50) => {
    if (!user) return;

    try {
      const data = await PollService.getUserPollVotes(user.id, limit);
      setUserPollVotes(data);
    } catch (error) {
      console.error('Error fetching user poll votes:', error);
    }
  }, [user]);

  // Create a new poll
  const createPoll = useCallback(async (pollData: CreatePollRequest): Promise<CommunityPoll | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create polls",
        variant: "destructive",
      });
      return null;
    }

    try {
      setCreating(true);
      const newPoll = await PollService.createPoll(pollData);
      
      if (newPoll) {
        // Award points for creating poll
        await PointsService.handlePollCreation(newPoll.id, user.id);
        
        toast({
          title: "Success",
          description: "Poll created successfully!",
        });
        
        // Refresh polls
        await fetchPolls();
        await fetchActivePolls();
        
        return newPoll;
      } else {
        throw new Error('Failed to create poll');
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: "Failed to create poll",
        variant: "destructive",
      });
      return null;
    } finally {
      setCreating(false);
    }
  }, [user, toast, fetchPolls, fetchActivePolls]);

  // Get poll by post ID
  const getPollByPostId = useCallback(async (postId: string): Promise<CommunityPoll | null> => {
    try {
      return await PollService.getPollByPostId(postId);
    } catch (error) {
      console.error('Error fetching poll by post ID:', error);
      return null;
    }
  }, []);

  // Get poll by ID
  const getPollById = useCallback(async (pollId: string): Promise<CommunityPoll | null> => {
    try {
      return await PollService.getPollById(pollId);
    } catch (error) {
      console.error('Error fetching poll by ID:', error);
      return null;
    }
  }, []);

  // Vote on a poll
  const voteOnPoll = useCallback(async (pollId: string, voteData: PollVoteRequest): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        variant: "destructive",
      });
      return false;
    }

    try {
      setVoting(pollId);
      const success = await PollService.voteOnPoll(pollId, voteData);
      
      if (success) {
        toast({
          title: "Success",
          description: "Vote submitted successfully!",
        });
        
        // Refresh user poll votes
        await fetchUserPollVotes();
        
        return true;
      } else {
        throw new Error('Failed to vote on poll');
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to vote on poll",
        variant: "destructive",
      });
      return false;
    } finally {
      setVoting(null);
    }
  }, [user, toast, fetchUserPollVotes]);

  // Get poll results
  const getPollResults = useCallback(async (pollId: string) => {
    try {
      return await PollService.getPollResults(pollId);
    } catch (error) {
      console.error('Error getting poll results:', error);
      return null;
    }
  }, []);

  // Update a poll
  const updatePoll = useCallback(async (pollId: string, updates: Partial<CommunityPoll>): Promise<boolean> => {
    try {
      const success = await PollService.updatePoll(pollId, updates);
      
      if (success) {
        toast({
          title: "Success",
          description: "Poll updated successfully!",
        });
        
        // Refresh polls
        await fetchPolls();
        await fetchActivePolls();
        await fetchExpiredPolls();
        
        return true;
      } else {
        throw new Error('Failed to update poll');
      }
    } catch (error) {
      console.error('Error updating poll:', error);
      toast({
        title: "Error",
        description: "Failed to update poll",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchPolls, fetchActivePolls, fetchExpiredPolls]);

  // Delete a poll
  const deletePoll = useCallback(async (pollId: string): Promise<boolean> => {
    try {
      const success = await PollService.deletePoll(pollId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Poll deleted successfully!",
        });
        
        // Refresh polls
        await fetchPolls();
        await fetchActivePolls();
        await fetchExpiredPolls();
        
        return true;
      } else {
        throw new Error('Failed to delete poll');
      }
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast({
        title: "Error",
        description: "Failed to delete poll",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchPolls, fetchActivePolls, fetchExpiredPolls]);

  // Search polls
  const searchPolls = useCallback(async (query: string, filters?: {
    is_active?: boolean;
    is_anonymous?: boolean;
  }): Promise<CommunityPoll[]> => {
    try {
      return await PollService.searchPolls(query, filters);
    } catch (error) {
      console.error('Error searching polls:', error);
      toast({
        title: "Error",
        description: "Failed to search polls",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  // Check if poll is expired
  const isPollExpired = useCallback((poll: CommunityPoll): boolean => {
    return PollService.isPollExpired(poll);
  }, []);

  // Get time remaining until poll expires
  const getTimeRemaining = useCallback((poll: CommunityPoll) => {
    return PollService.getTimeRemaining(poll);
  }, []);

  // Initialize data
  useEffect(() => {
    fetchPolls();
    fetchActivePolls();
    fetchExpiredPolls();
  }, [fetchPolls, fetchActivePolls, fetchExpiredPolls]);

  useEffect(() => {
    fetchUserPollVotes();
  }, [fetchUserPollVotes]);

  return {
    // State
    polls,
    activePolls,
    expiredPolls,
    userPollVotes,
    loading,
    creating,
    voting,
    
    // Actions
    fetchPolls,
    fetchActivePolls,
    fetchExpiredPolls,
    fetchUserPollVotes,
    createPoll,
    getPollByPostId,
    getPollById,
    voteOnPoll,
    getPollResults,
    updatePoll,
    deletePoll,
    searchPolls,
    isPollExpired,
    getTimeRemaining,
  };
};
