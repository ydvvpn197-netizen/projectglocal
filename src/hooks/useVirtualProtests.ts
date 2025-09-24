import { useState, useEffect, useCallback } from 'react';
import { 
  virtualProtestService, 
  VirtualProtest, 
  ProtestParticipant, 
  ProtestUpdate, 
  ProtestMobilization,
  ProtestAnalytics 
} from '@/services/virtualProtestService';

export interface UseVirtualProtestsReturn {
  protests: VirtualProtest[];
  analytics: ProtestAnalytics | null;
  isLoading: boolean;
  error: string | null;
  createProtest: (protestData: {
    title: string;
    description: string;
    cause: string;
    target_authority?: string;
    location_city?: string;
    location_state?: string;
    location_country?: string;
    latitude?: number;
    longitude?: number;
    start_date: string;
    end_date: string;
    is_virtual: boolean;
    is_physical: boolean;
    virtual_platform?: string;
    virtual_link?: string;
    physical_address?: string;
    expected_participants: number;
    visibility: 'public' | 'private' | 'invite_only';
    tags: string[];
  }) => Promise<VirtualProtest>;
  getProtestById: (protestId: string) => Promise<VirtualProtest>;
  joinProtest: (protestId: string, participationType: 'virtual' | 'physical' | 'both', commitmentLevel: 'low' | 'medium' | 'high') => Promise<ProtestParticipant>;
  leaveProtest: (protestId: string) => Promise<void>;
  addProtestUpdate: (protestId: string, updateData: {
    title: string;
    content: string;
    update_type: 'announcement' | 'milestone' | 'call_to_action' | 'result';
    media_urls?: string[];
  }) => Promise<ProtestUpdate>;
  createMobilization: (protestId: string, mobilizationData: {
    mobilization_type: 'email' | 'social_media' | 'sms' | 'push_notification';
    target_audience: 'participants' | 'supporters' | 'general_public';
    message: string;
    scheduled_at?: string;
  }) => Promise<ProtestMobilization>;
  searchProtests: (searchTerm: string, filters?: {
    cause?: string;
    location?: string;
    status?: 'planning' | 'active' | 'completed' | 'cancelled';
  }) => Promise<VirtualProtest[]>;
  loadProtests: (filters?: {
    status?: 'planning' | 'active' | 'completed' | 'cancelled';
    cause?: string;
    location?: string;
    is_virtual?: boolean;
    is_physical?: boolean;
    visibility?: 'public' | 'private' | 'invite_only';
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  loadAnalytics: () => Promise<void>;
  clearError: () => void;
}

export const useVirtualProtests = (): UseVirtualProtestsReturn => {
  const [protests, setProtests] = useState<VirtualProtest[]>([]);
  const [analytics, setAnalytics] = useState<ProtestAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load protests
  const loadProtests = useCallback(async (filters: {
    status?: 'planning' | 'active' | 'completed' | 'cancelled';
    cause?: string;
    location?: string;
    is_virtual?: boolean;
    is_physical?: boolean;
    visibility?: 'public' | 'private' | 'invite_only';
    limit?: number;
    offset?: number;
  } = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const protestsData = await virtualProtestService.getProtests(filters);
      setProtests(protestsData);
    } catch (err) {
      console.error('Error loading protests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load protests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load analytics
  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const analyticsData = await virtualProtestService.getProtestAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create protest
  const createProtest = useCallback(async (protestData: {
    title: string;
    description: string;
    cause: string;
    target_authority?: string;
    location_city?: string;
    location_state?: string;
    location_country?: string;
    latitude?: number;
    longitude?: number;
    start_date: string;
    end_date: string;
    is_virtual: boolean;
    is_physical: boolean;
    virtual_platform?: string;
    virtual_link?: string;
    physical_address?: string;
    expected_participants: number;
    visibility: 'public' | 'private' | 'invite_only';
    tags: string[];
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newProtest = await virtualProtestService.createProtest(protestData);
      
      // Add to local state
      setProtests(prev => [newProtest, ...prev]);
      
      return newProtest;
    } catch (err) {
      console.error('Error creating protest:', err);
      setError(err instanceof Error ? err.message : 'Failed to create protest');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get protest by ID
  const getProtestById = useCallback(async (protestId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const protest = await virtualProtestService.getProtestById(protestId);
      return protest;
    } catch (err) {
      console.error('Error getting protest:', err);
      setError(err instanceof Error ? err.message : 'Failed to get protest');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Join protest
  const joinProtest = useCallback(async (protestId: string, participationType: 'virtual' | 'physical' | 'both', commitmentLevel: 'low' | 'medium' | 'high') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const participant = await virtualProtestService.joinProtest(protestId, participationType, commitmentLevel);
      
      // Update local state
      setProtests(prev => prev.map(protest => {
        if (protest.id === protestId) {
          return {
            ...protest,
            current_participants: protest.current_participants + 1,
            participants: [...(protest.participants || []), participant]
          };
        }
        return protest;
      }));
      
      return participant;
    } catch (err) {
      console.error('Error joining protest:', err);
      setError(err instanceof Error ? err.message : 'Failed to join protest');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Leave protest
  const leaveProtest = useCallback(async (protestId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await virtualProtestService.leaveProtest(protestId);
      
      // Update local state
      setProtests(prev => prev.map(protest => {
        if (protest.id === protestId) {
          return {
            ...protest,
            current_participants: Math.max(0, protest.current_participants - 1),
            participants: protest.participants?.filter(p => p.user_id !== 'current_user_id') || []
          };
        }
        return protest;
      }));
    } catch (err) {
      console.error('Error leaving protest:', err);
      setError(err instanceof Error ? err.message : 'Failed to leave protest');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add protest update
  const addProtestUpdate = useCallback(async (protestId: string, updateData: {
    title: string;
    content: string;
    update_type: 'announcement' | 'milestone' | 'call_to_action' | 'result';
    media_urls?: string[];
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const update = await virtualProtestService.addProtestUpdate(protestId, updateData);
      
      // Update local state
      setProtests(prev => prev.map(protest => {
        if (protest.id === protestId) {
          return {
            ...protest,
            updates: [...(protest.updates || []), update]
          };
        }
        return protest;
      }));
      
      return update;
    } catch (err) {
      console.error('Error adding protest update:', err);
      setError(err instanceof Error ? err.message : 'Failed to add protest update');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create mobilization
  const createMobilization = useCallback(async (protestId: string, mobilizationData: {
    mobilization_type: 'email' | 'social_media' | 'sms' | 'push_notification';
    target_audience: 'participants' | 'supporters' | 'general_public';
    message: string;
    scheduled_at?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mobilization = await virtualProtestService.createMobilization(protestId, mobilizationData);
      return mobilization;
    } catch (err) {
      console.error('Error creating mobilization:', err);
      setError(err instanceof Error ? err.message : 'Failed to create mobilization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search protests
  const searchProtests = useCallback(async (searchTerm: string, filters: {
    cause?: string;
    location?: string;
    status?: 'planning' | 'active' | 'completed' | 'cancelled';
  } = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchResults = await virtualProtestService.searchProtests(searchTerm, filters);
      return searchResults;
    } catch (err) {
      console.error('Error searching protests:', err);
      setError(err instanceof Error ? err.message : 'Failed to search protests');
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
    loadProtests();
    loadAnalytics();
  }, [loadProtests, loadAnalytics]);

  return {
    protests,
    analytics,
    isLoading,
    error,
    createProtest,
    getProtestById,
    joinProtest,
    leaveProtest,
    addProtestUpdate,
    createMobilization,
    searchProtests,
    loadProtests,
    loadAnalytics,
    clearError
  };
};
