import { useState, useEffect, useCallback } from 'react';
import { CommunityService } from '@/services/communityService';
import { CommunityGroup, CreateGroupRequest } from '@/types/community';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useCommunityGroups = () => {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [userGroups, setUserGroups] = useState<CommunityGroup[]>([]);
  const [trendingGroups, setTrendingGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch all groups
  const fetchGroups = useCallback(async (filters?: {
    category?: string;
    is_public?: boolean;
    location_city?: string;
    member_count_min?: number;
  }) => {
    try {
      setLoading(true);
      const data = await CommunityService.getGroups(filters);
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch user's groups
  const fetchUserGroups = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping user groups fetch');
      return;
    }

    try {
      console.log('Fetching user groups for user:', user.id);
      const data = await CommunityService.getUserGroups(user.id);
      setUserGroups(data);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      // Don't show toast for user groups fetch errors as they might be expected
      // when user is not authenticated or has no groups
    }
  }, [user]);

  // Fetch trending groups
  const fetchTrendingGroups = useCallback(async (limit: number = 10) => {
    try {
      const data = await CommunityService.getTrendingGroups(limit);
      setTrendingGroups(data);
    } catch (error) {
      console.error('Error fetching trending groups:', error);
    }
  }, []);

  // Create a new group
  const createGroup = useCallback(async (groupData: CreateGroupRequest): Promise<CommunityGroup | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create groups",
        variant: "destructive",
      });
      return null;
    }

    try {
      setCreating(true);
      const newGroup = await CommunityService.createGroup(groupData);
      
      if (newGroup) {
        toast({
          title: "Success",
          description: "Group created successfully!",
        });
        
        // Refresh groups
        await fetchGroups();
        await fetchUserGroups();
        
        return newGroup;
      } else {
        throw new Error('Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
      return null;
    } finally {
      setCreating(false);
    }
  }, [user, toast, fetchGroups, fetchUserGroups]);

  // Join a group
  const joinGroup = useCallback(async (groupId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to join groups",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('Attempting to join group:', groupId, 'for user:', user.id);
      const success = await CommunityService.addGroupMember(groupId, user.id);
      
      if (success) {
        toast({
          title: "Success",
          description: "Joined group successfully!",
        });
        
        // Refresh groups
        await fetchGroups();
        await fetchUserGroups();
        
        return true;
      } else {
        throw new Error('Failed to join group');
      }
    } catch (error: unknown) {
      console.error('Error joining group:', error);
      
      // Handle specific error cases
      let errorMessage = "Failed to join group";
      if (error?.code === '23505') {
        errorMessage = "You are already a member of this group";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, fetchGroups, fetchUserGroups]);

  // Leave a group
  const leaveGroup = useCallback(async (groupId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to leave groups",
        variant: "destructive",
      });
      return false;
    }

    try {
      const success = await CommunityService.removeGroupMember(groupId, user.id);
      
      if (success) {
        toast({
          title: "Success",
          description: "Left group successfully!",
        });
        
        // Refresh groups
        await fetchGroups();
        await fetchUserGroups();
        
        return true;
      } else {
        throw new Error('Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: "Error",
        description: "Failed to leave group",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, fetchGroups, fetchUserGroups]);

  // Check if user is a member of a group
  const isGroupMember = useCallback(async (groupId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      return await CommunityService.isGroupMember(groupId, user.id);
    } catch (error) {
      console.error('Error checking group membership:', error);
      return false;
    }
  }, [user]);

  // Get user's role in a group
  const getUserRole = useCallback(async (groupId: string): Promise<'admin' | 'moderator' | 'member' | null> => {
    if (!user) return null;

    try {
      return await CommunityService.getUserRole(groupId, user.id);
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }, [user]);

  // Search groups
  const searchGroups = useCallback(async (query: string, filters?: {
    category?: string;
    location_city?: string;
  }): Promise<CommunityGroup[]> => {
    try {
      return await CommunityService.searchGroups(query, filters);
    } catch (error) {
      console.error('Error searching groups:', error);
      toast({
        title: "Error",
        description: "Failed to search groups",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchGroups();
        await fetchUserGroups();
        await fetchTrendingGroups();
      } catch (error) {
        console.error('Error initializing community data:', error);
      }
    };

    initializeData();
  }, [fetchGroups, fetchUserGroups, fetchTrendingGroups]);

  return {
    groups,
    userGroups,
    trendingGroups,
    loading,
    creating,
    fetchGroups,
    fetchUserGroups,
    fetchTrendingGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    isGroupMember,
    getUserRole,
    searchGroups,
  };
};
