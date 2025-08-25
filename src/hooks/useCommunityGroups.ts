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
    if (!user) return;

    try {
      const data = await CommunityService.getUserGroups(user.id);
      setUserGroups(data);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your groups",
        variant: "destructive",
      });
    }
  }, [user, toast]);

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
      // Check if user is already a member
      const isMember = await CommunityService.isGroupMember(groupId, user.id);
      if (isMember) {
        toast({
          title: "Already a member",
          description: "You are already a member of this group",
          variant: "default",
        });
        return true;
      }

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
    } catch (error: any) {
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

  // Get groups by category
  const getGroupsByCategory = useCallback(async (category: string): Promise<CommunityGroup[]> => {
    try {
      return await CommunityService.getGroupsByCategory(category);
    } catch (error) {
      console.error('Error fetching groups by category:', error);
      return [];
    }
  }, []);

  // Get groups by location
  const getGroupsByLocation = useCallback(async (location: {
    city?: string;
    state?: string;
    country?: string;
  }): Promise<CommunityGroup[]> => {
    try {
      return await CommunityService.getGroupsByLocation(location);
    } catch (error) {
      console.error('Error fetching groups by location:', error);
      return [];
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchGroups();
    fetchTrendingGroups();
  }, [fetchGroups, fetchTrendingGroups]);

  useEffect(() => {
    fetchUserGroups();
  }, [fetchUserGroups]);

  return {
    // State
    groups,
    userGroups,
    trendingGroups,
    loading,
    creating,
    
    // Actions
    fetchGroups,
    fetchUserGroups,
    fetchTrendingGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    isGroupMember,
    getUserRole,
    searchGroups,
    getGroupsByCategory,
    getGroupsByLocation,
  };
};
