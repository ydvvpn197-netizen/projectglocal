import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { PollService, Poll, CreatePollData, GovernmentPoll, GovernmentAuthority } from '@/services/pollService';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage?: number;
}

export const usePolls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [governmentPolls, setGovernmentPolls] = useState<GovernmentPoll[]>([]);
  const [authorities, setAuthorities] = useState<GovernmentAuthority[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [voting, setVoting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPolls = useCallback(async (params: {
    limit?: number;
    offset?: number;
    location_city?: string;
    category?: string;
  } = {}) => {
    try {
      setLoading(true);
      const { polls: fetchedPolls, error } = await PollService.fetchPolls(params);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      setPolls(fetchedPolls);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: "Error",
        description: "Failed to load polls.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchGovernmentPolls = useCallback(async (params: {
    limit?: number;
    offset?: number;
    location?: string;
    category?: string;
  } = {}) => {
    try {
      setLoading(true);
      const { polls: fetchedPolls, error } = await PollService.fetchGovernmentPolls(params);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      setGovernmentPolls(fetchedPolls);
    } catch (error) {
      console.error('Error fetching government polls:', error);
      toast({
        title: "Error",
        description: "Failed to load government polls.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchAuthorities = useCallback(async () => {
    try {
      const { authorities: fetchedAuthorities, error } = await PollService.fetchGovernmentAuthorities();
      
      if (error) {
        console.error('Error fetching authorities:', error);
        return;
      }
      
      setAuthorities(fetchedAuthorities);
    } catch (error) {
      console.error('Error fetching authorities:', error);
    }
  }, []);

  const createPoll = async (pollData: CreatePollData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create polls.",
        variant: "destructive",
      });
      return { success: false, error: "Not authenticated" };
    }

    try {
      setCreating(true);
      const result = await PollService.createPoll(pollData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Poll created successfully!",
        });
        fetchPolls(); // Refresh polls
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create poll.",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create poll';
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setCreating(false);
    }
  };

  const createGovernmentPoll = async (pollData: {
    title: string;
    description: string;
    location?: string;
    category?: string;
    expires_at: string;
    is_anonymous?: boolean;
    tagged_authorities: string[];
    options: { text: string }[];
  }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create government polls.",
        variant: "destructive",
      });
      return { success: false, error: "Not authenticated" };
    }

    try {
      setCreating(true);
      const result = await PollService.createGovernmentPoll(pollData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Government poll created successfully!",
        });
        fetchGovernmentPolls(); // Refresh government polls
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create government poll.",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create government poll';
      console.error('Error creating government poll:', error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setCreating(false);
    }
  };

  const votePoll = async (pollId: string, optionIndex: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }

    try {
      setVoting(true);
      const result = await PollService.voteOnPoll(pollId, optionIndex);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Your vote has been recorded!",
        });
        fetchPolls(); // Refresh polls to show updated vote counts
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to record vote.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record vote.",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  const voteGovernmentPoll = async (pollId: string, optionIndex: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }

    try {
      setVoting(true);
      const result = await PollService.voteOnGovernmentPoll(pollId, optionIndex);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Your vote has been recorded!",
        });
        fetchGovernmentPolls(); // Refresh government polls
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to record vote.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error('Error voting on government poll:', error);
      toast({
        title: "Error",
        description: "Failed to record vote.",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  const deletePoll = async (pollId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete polls.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await PollService.deletePoll(pollId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Poll deleted successfully!",
        });
        fetchPolls(); // Refresh polls
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete poll.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error('Error deleting poll:', error);
      toast({
        title: "Error",
        description: "Failed to delete poll.",
        variant: "destructive",
      });
    }
  };

  const sharePoll = async (pollId: string, platform?: string) => {
    try {
      const result = await PollService.sharePoll(pollId, platform);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Poll shared successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to share poll.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sharing poll:', error);
      toast({
        title: "Error",
        description: "Failed to share poll.",
        variant: "destructive",
      });
    }
  };

  // Load initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const [pollsResult, governmentPollsResult, authoritiesResult] = await Promise.allSettled([
          PollService.fetchPolls(),
          PollService.fetchGovernmentPolls(),
          PollService.fetchGovernmentAuthorities()
        ]);

        // Handle polls result
        if (pollsResult.status === 'fulfilled' && !pollsResult.value.error) {
          setPolls(pollsResult.value.polls);
        } else if (pollsResult.status === 'rejected') {
          console.error('Error fetching polls:', pollsResult.reason);
          toast({
            title: "Error",
            description: "Failed to load polls.",
            variant: "destructive",
          });
        }

        // Handle government polls result
        if (governmentPollsResult.status === 'fulfilled' && !governmentPollsResult.value.error) {
          setGovernmentPolls(governmentPollsResult.value.polls);
        } else if (governmentPollsResult.status === 'rejected') {
          console.error('Error fetching government polls:', governmentPollsResult.reason);
        }

        // Handle authorities result
        if (authoritiesResult.status === 'fulfilled' && !authoritiesResult.value.error) {
          setAuthorities(authoritiesResult.value.authorities);
        } else if (authoritiesResult.status === 'rejected') {
          console.error('Error fetching authorities:', authoritiesResult.reason);
        }
      } catch (error) {
        console.error('Error initializing polls data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [toast]);

  return {
    polls,
    governmentPolls,
    authorities,
    loading,
    creating,
    voting,
    createPoll,
    createGovernmentPoll,
    votePoll,
    voteGovernmentPoll,
    deletePoll,
    sharePoll,
    fetchPolls,
    fetchGovernmentPolls,
    fetchAuthorities
  };
};
