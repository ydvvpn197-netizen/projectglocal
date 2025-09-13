import { useState, useEffect, useCallback } from 'react';
import { 
  governmentPollsService, 
  GovernmentPoll, 
  GovernmentAuthority, 
  PollVote, 
  GovernmentResponse,
  CivicEngagementAnalytics 
} from '@/services/governmentPollsService';

export interface UseGovernmentPollsReturn {
  polls: GovernmentPoll[];
  authorities: GovernmentAuthority[];
  analytics: CivicEngagementAnalytics | null;
  isLoading: boolean;
  error: string | null;
  createPoll: (pollData: {
    title: string;
    description: string;
    location?: string;
    category?: string;
    expires_at: string;
    is_anonymous?: boolean;
    tagged_authorities: string[];
    options: string[];
  }) => Promise<GovernmentPoll>;
  getPollById: (pollId: string) => Promise<GovernmentPoll>;
  voteOnPoll: (pollId: string, optionIndex: number, isAnonymous?: boolean) => Promise<PollVote>;
  getUserVote: (pollId: string) => Promise<PollVote | null>;
  submitGovernmentResponse: (responseData: {
    poll_id: string;
    authority_id: string;
    response_text: string;
    response_type: 'acknowledgment' | 'detailed_response' | 'action_plan' | 'rejection';
  }) => Promise<GovernmentResponse>;
  getPollResponses: (pollId: string) => Promise<GovernmentResponse[]>;
  searchPolls: (searchTerm: string, filters?: {
    category?: string;
    location?: string;
    level?: 'local' | 'state' | 'national';
  }) => Promise<GovernmentPoll[]>;
  loadPolls: (filters?: {
    category?: string;
    location?: string;
    level?: 'local' | 'state' | 'national';
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  loadAuthorities: (level?: 'local' | 'state' | 'national') => Promise<void>;
  loadAnalytics: () => Promise<void>;
  clearError: () => void;
}

export const useGovernmentPolls = (): UseGovernmentPollsReturn => {
  const [polls, setPolls] = useState<GovernmentPoll[]>([]);
  const [authorities, setAuthorities] = useState<GovernmentAuthority[]>([]);
  const [analytics, setAnalytics] = useState<CivicEngagementAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load polls
  const loadPolls = useCallback(async (filters: {
    category?: string;
    location?: string;
    level?: 'local' | 'state' | 'national';
    is_active?: boolean;
    limit?: number;
    offset?: number;
  } = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const pollsData = await governmentPollsService.getPolls(filters);
      setPolls(pollsData);
    } catch (err) {
      console.error('Error loading polls:', err);
      setError(err instanceof Error ? err.message : 'Failed to load polls');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load authorities
  const loadAuthorities = useCallback(async (level?: 'local' | 'state' | 'national') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authoritiesData = await governmentPollsService.getAuthorities(level);
      setAuthorities(authoritiesData);
    } catch (err) {
      console.error('Error loading authorities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load authorities');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load analytics
  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const analyticsData = await governmentPollsService.getCivicEngagementAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create poll
  const createPoll = useCallback(async (pollData: {
    title: string;
    description: string;
    location?: string;
    category?: string;
    expires_at: string;
    is_anonymous?: boolean;
    tagged_authorities: string[];
    options: string[];
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newPoll = await governmentPollsService.createPoll(pollData);
      
      // Add to local state
      setPolls(prev => [newPoll, ...prev]);
      
      return newPoll;
    } catch (err) {
      console.error('Error creating poll:', err);
      setError(err instanceof Error ? err.message : 'Failed to create poll');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get poll by ID
  const getPollById = useCallback(async (pollId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const poll = await governmentPollsService.getPollById(pollId);
      return poll;
    } catch (err) {
      console.error('Error getting poll:', err);
      setError(err instanceof Error ? err.message : 'Failed to get poll');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Vote on poll
  const voteOnPoll = useCallback(async (pollId: string, optionIndex: number, isAnonymous: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const vote = await governmentPollsService.voteOnPoll(pollId, optionIndex, isAnonymous);
      
      // Update local state
      setPolls(prev => prev.map(poll => {
        if (poll.id === pollId) {
          return {
            ...poll,
            total_votes: poll.total_votes + 1,
            options: poll.options?.map(option => 
              option.option_index === optionIndex 
                ? { ...option, votes: option.votes + 1 }
                : option
            ),
            user_vote: vote
          };
        }
        return poll;
      }));
      
      return vote;
    } catch (err) {
      console.error('Error voting on poll:', err);
      setError(err instanceof Error ? err.message : 'Failed to vote on poll');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get user vote
  const getUserVote = useCallback(async (pollId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const vote = await governmentPollsService.getUserVote(pollId);
      return vote;
    } catch (err) {
      console.error('Error getting user vote:', err);
      setError(err instanceof Error ? err.message : 'Failed to get user vote');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Submit government response
  const submitGovernmentResponse = useCallback(async (responseData: {
    poll_id: string;
    authority_id: string;
    response_text: string;
    response_type: 'acknowledgment' | 'detailed_response' | 'action_plan' | 'rejection';
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await governmentPollsService.submitGovernmentResponse(responseData);
      return response;
    } catch (err) {
      console.error('Error submitting government response:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit government response');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get poll responses
  const getPollResponses = useCallback(async (pollId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const responses = await governmentPollsService.getPollResponses(pollId);
      return responses;
    } catch (err) {
      console.error('Error getting poll responses:', err);
      setError(err instanceof Error ? err.message : 'Failed to get poll responses');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search polls
  const searchPolls = useCallback(async (searchTerm: string, filters: {
    category?: string;
    location?: string;
    level?: 'local' | 'state' | 'national';
  } = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchResults = await governmentPollsService.searchPolls(searchTerm, filters);
      return searchResults;
    } catch (err) {
      console.error('Error searching polls:', err);
      setError(err instanceof Error ? err.message : 'Failed to search polls');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load initial data
  useEffect(() => {
    loadPolls();
    loadAuthorities();
    loadAnalytics();
  }, [loadPolls, loadAuthorities, loadAnalytics]);

  return {
    polls,
    authorities,
    analytics,
    isLoading,
    error,
    createPoll,
    getPollById,
    voteOnPoll,
    getUserVote,
    submitGovernmentResponse,
    getPollResponses,
    searchPolls,
    loadPolls,
    loadAuthorities,
    loadAnalytics,
    clearError
  };
};
