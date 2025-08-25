// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { 
  CommunityGroup, 
  GroupMember, 
  CreateGroupRequest 
} from '@/types/community';

export class CommunityService {
  // Group Management
  static async createGroup(groupData: CreateGroupRequest): Promise<CommunityGroup | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('community_groups')
        .insert({
          ...groupData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      await this.addGroupMember(data.id, user.id, 'admin');

      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      return null;
    }
  }

  static async getGroups(filters?: {
    category?: string;
    is_public?: boolean;
    location_city?: string;
    member_count_min?: number;
  }): Promise<CommunityGroup[]> {
    try {
      let query = supabase
        .from('community_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }
      if (filters?.location_city) {
        query = query.eq('location_city', filters.location_city);
      }
      if (filters?.member_count_min) {
        query = query.gte('member_count', filters.member_count_min);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }

  static async getGroupById(groupId: string): Promise<CommunityGroup | null> {
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching group:', error);
      return null;
    }
  }

  static async updateGroup(groupId: string, updates: Partial<CommunityGroup>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('community_groups')
        .update(updates)
        .eq('id', groupId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating group:', error);
      return false;
    }
  }

  static async deleteGroup(groupId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('community_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      return false;
    }
  }

  // Membership Management
  static async addGroupMember(groupId: string, userId: string, role: 'admin' | 'moderator' | 'member' = 'member'): Promise<boolean> {
    try {
      // Check if user is already a member
      const isMember = await this.isGroupMember(groupId, userId);
      if (isMember) {
        console.log('User is already a member of this group');
        return true; // Return true since they're already a member
      }

      const { error } = await supabase
        .from('community_group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role
        });

      if (error) throw error;

      // Update member count
      await this.updateGroupMemberCount(groupId);
      return true;
    } catch (error) {
      console.error('Error adding group member:', error);
      return false;
    }
  }

  static async removeGroupMember(groupId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('community_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update member count
      await this.updateGroupMemberCount(groupId);
      return true;
    } catch (error) {
      console.error('Error removing group member:', error);
      return false;
    }
  }

  static async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const { data, error } = await supabase
        .from('community_group_members')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(member => ({
        ...member,
        user_name: member.profiles?.display_name,
        user_avatar: member.profiles?.avatar_url
      }));
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  }

  static async getUserGroups(userId: string): Promise<CommunityGroup[]> {
    try {
      const { data, error } = await supabase
        .from('community_group_members')
        .select(`
          community_groups (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map(item => item.community_groups);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return [];
    }
  }

  static async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('community_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking group membership:', error);
      return false;
    }
  }

  static async getUserRole(groupId: string, userId: string): Promise<'admin' | 'moderator' | 'member' | null> {
    try {
      const { data, error } = await supabase
        .from('community_group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  // Helper methods
  private static async updateGroupMemberCount(groupId: string): Promise<void> {
    try {
      const { count, error } = await supabase
        .from('community_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      if (error) throw error;

      await supabase
        .from('community_groups')
        .update({ member_count: count || 0 })
        .eq('id', groupId);
    } catch (error) {
      console.error('Error updating member count:', error);
    }
  }

  // Search and Discovery
  static async searchGroups(query: string, filters?: {
    category?: string;
    location_city?: string;
  }): Promise<CommunityGroup[]> {
    try {
      let searchQuery = supabase
        .from('community_groups')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_public', true)
        .order('member_count', { ascending: false });

      if (filters?.category) {
        searchQuery = searchQuery.eq('category', filters.category);
      }
      if (filters?.location_city) {
        searchQuery = searchQuery.eq('location_city', filters.location_city);
      }

      const { data, error } = await searchQuery;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching groups:', error);
      return [];
    }
  }

  static async getTrendingGroups(limit: number = 10): Promise<CommunityGroup[]> {
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .select('*')
        .eq('is_public', true)
        .order('member_count', { ascending: false })
        .order('post_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trending groups:', error);
      return [];
    }
  }

  static async getGroupsByCategory(category: string): Promise<CommunityGroup[]> {
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .select('*')
        .eq('category', category)
        .eq('is_public', true)
        .order('member_count', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching groups by category:', error);
      return [];
    }
  }

  static async getGroupsByLocation(location: {
    city?: string;
    state?: string;
    country?: string;
  }): Promise<CommunityGroup[]> {
    try {
      let query = supabase
        .from('community_groups')
        .select('*')
        .eq('is_public', true);

      if (location.city) {
        query = query.eq('location_city', location.city);
      }
      if (location.state) {
        query = query.eq('location_state', location.state);
      }
      if (location.country) {
        query = query.eq('location_country', location.country);
      }

      const { data, error } = await query.order('member_count', { ascending: false });
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching groups by location:', error);
      return [];
    }
  }
}
