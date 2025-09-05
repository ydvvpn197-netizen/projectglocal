import { supabase } from '@/integrations/supabase/client';
import { 
  CommunityGroup, 
  GroupMember, 
  CreateGroupRequest 
} from '@/types/community';

export class CommunityService {
  // Helper method to ensure user is authenticated
  private static async ensureAuthenticated() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Auth error:', error);
        throw new Error('Authentication error');
      }
      if (!user) {
        throw new Error('User not authenticated');
      }
      return user;
    } catch (error) {
      console.error('Authentication check failed:', error);
      throw new Error('User not authenticated');
    }
  }

  // Helper method to retry operations
  private static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError;
  }

  // Group Management
  static async createGroup(groupData: CreateGroupRequest): Promise<CommunityGroup | null> {
    try {
      const user = await this.ensureAuthenticated();

      const { data, error } = await supabase
        .from('groups')
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

      // If no groups found, create some sample groups
      if (!data || data.length === 0) {
        console.log('No groups found, creating sample groups...');
        await this.createSampleGroups();
        // Try fetching again
        const { data: newData, error: newError } = await query;
        if (newError) throw newError;
        return newData || [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }

  // Create sample groups if none exist
  private static async createSampleGroups(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const creatorId = user?.id || '00000000-0000-0000-0000-000000000000';

      const sampleGroups = [
        {
          name: 'Local Artists Network',
          description: 'Connect with local artists and share your work',
          category: 'Arts & Culture',
          created_by: creatorId,
          location_city: 'New York',
          location_state: 'NY',
          location_country: 'USA',
          is_public: true,
          member_count: 0,
          post_count: 0
        },
        {
          name: 'Tech Enthusiasts',
          description: 'Discuss the latest in technology and innovation',
          category: 'Technology',
          created_by: creatorId,
          location_city: 'San Francisco',
          location_state: 'CA',
          location_country: 'USA',
          is_public: true,
          member_count: 0,
          post_count: 0
        },
        {
          name: 'Food Lovers',
          description: 'Share recipes and discover local restaurants',
          category: 'Food & Dining',
          created_by: creatorId,
          location_city: 'Chicago',
          location_state: 'IL',
          location_country: 'USA',
          is_public: true,
          member_count: 0,
          post_count: 0
        }
      ];

      for (const groupData of sampleGroups) {
        const { error } = await supabase
          .from('groups')
          .insert(groupData);
        
        if (error && error.code !== '23505') { // Ignore unique constraint violations
          console.error('Error creating sample group:', error);
        }
      }

      console.log('Sample groups created successfully');
    } catch (error) {
      console.error('Error creating sample groups:', error);
    }
  }

  static async getGroupById(groupId: string): Promise<CommunityGroup | null> {
    try {
      const { data, error } = await supabase
        .from('groups')
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
        .from('groups')
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
        .from('groups')
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
    return this.retryOperation(async () => {
      try {
        console.log('=== DEBUG: addGroupMember ===');
        console.log('Group ID:', groupId);
        console.log('User ID:', userId);
        console.log('Role:', role);

        // Ensure user is authenticated
        const user = await this.ensureAuthenticated();
        console.log('Authenticated user:', user?.id);

        // First, verify the group exists and is public
        console.log('Checking if group exists...');
        const group = await this.getGroupById(groupId);
        console.log('Group found:', group);
        
        if (!group) {
          console.error('Group not found:', groupId);
          throw new Error('Group not found');
        }
        if (!group.is_public) {
          throw new Error('Cannot join private group');
        }

        // Check if user is already a member
        console.log('Checking if user is already a member...');
        const isMember = await this.isGroupMember(groupId, userId);
        console.log('Is member:', isMember);
        
        if (isMember) {
          console.log('User is already a member of group:', groupId);
          return true; // Return true since they're already a member
        }

        console.log('Attempting to add user', userId, 'to group', groupId);

        // Verify the user exists in auth.users
        console.log('Verifying user exists in auth.users...');
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('id', userId)
          .single();
        
        console.log('User verification result:', { userData, userError });

        const { error } = await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            user_id: userId,
            role
          });

        if (error) {
          console.error('Supabase error adding group member:', error);
          if (error.code === '23505') {
            // Unique constraint violation - user is already a member
            console.log('User already a member (unique constraint)');
            return true;
          }
          if (error.code === '23503') {
            // Foreign key constraint violation
            console.error('Foreign key constraint violation. Group ID:', groupId, 'User ID:', userId);
            
            // Additional debugging for foreign key issues
            const { data: groupCheck } = await supabase
              .from('groups')
              .select('id, name')
              .eq('id', groupId);
            console.log('Group check result:', groupCheck);
            
            const { data: userCheck } = await supabase
              .from('auth.users')
              .select('id')
              .eq('id', userId);
            console.log('User check result:', userCheck);
            
            throw new Error('Invalid group or user ID');
          }
          throw error;
        }

        console.log('Successfully added user to group');

        // Update member count
        await this.updateGroupMemberCount(groupId);
        return true;
      } catch (error) {
        console.error('Error adding group member:', error);
        throw error;
      }
    });
  }

  static async removeGroupMember(groupId: string, userId: string): Promise<boolean> {
    return this.retryOperation(async () => {
      try {
        // Ensure user is authenticated
        await this.ensureAuthenticated();

        const { error } = await supabase
          .from('group_members')
          .delete()
          .eq('group_id', groupId)
          .eq('user_id', userId);

        if (error) throw error;

        // Update member count
        await this.updateGroupMemberCount(groupId);
        return true;
      } catch (error) {
        console.error('Error removing group member:', error);
        throw error;
      }
    });
  }

  static async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
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
    return this.retryOperation(async () => {
      try {
        // Ensure user is authenticated
        await this.ensureAuthenticated();

        const { data, error } = await supabase
          .from('group_members')
          .select(`
            groups (*)
          `)
          .eq('user_id', userId);

        if (error) {
          console.error('Supabase error fetching user groups:', error);
          throw error;
        }

        return (data || []).map(item => item.groups);
      } catch (error) {
        console.error('Error fetching user groups:', error);
        throw error;
      }
    });
  }

  static async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('group_members')
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
        .from('group_members')
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
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      if (error) throw error;

      await supabase
        .from('groups')
        .update({ member_count: count || 0 })
        .eq('id', groupId);
    } catch (error) {
      console.error('Error updating member count:', error);
    }
  }

  // Validate group before joining
  static async validateGroupForJoining(groupId: string, userId: string): Promise<{
    isValid: boolean;
    group?: Record<string, unknown>;
    user?: Record<string, unknown>;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      // Check if group exists
      const group = await this.getGroupById(groupId);
      if (!group) {
        errors.push('Group does not exist');
      } else if (!group.is_public) {
        errors.push('Group is not public');
      }

      // Check if user exists and is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        errors.push('User not authenticated');
      } else if (user.id !== userId) {
        errors.push('User ID mismatch');
      }

      // Check if user is already a member
      if (group && user) {
        const isMember = await this.isGroupMember(groupId, userId);
        if (isMember) {
          errors.push('User is already a member');
        }
      }

      return {
        isValid: errors.length === 0,
        group,
        user,
        errors
      };
    } catch (error) {
      errors.push(`Validation error: ${error}`);
      return {
        isValid: false,
        errors
      };
    }
  }

  // Debug method to help troubleshoot issues
  static async debugGroupIssues(): Promise<Record<string, unknown>> {
    try {
      console.log('=== DEBUG: Group Issues ===');
      
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, is_public, created_at, created_by')
        .limit(10);

      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('id, group_id, user_id, role')
        .limit(10);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      // Check for orphaned group_members
      const { data: orphanedMembers, error: orphanedError } = await supabase
        .from('group_members')
        .select('group_id, user_id')
        .not('group_id', 'in', `(${groups?.map(g => `'${g.id}'`).join(',') || ''})`);

      // Check RLS policies
      const { data: rlsPolicies, error: rlsError } = await supabase
        .rpc('get_rls_policies', { table_name: 'group_members' })
        .catch(() => ({ data: null, error: 'RPC not available' }));

      const debugInfo = {
        groups: groups || [],
        members: members || [],
        orphanedMembers: orphanedMembers || [],
        currentUser: user,
        errors: {
          groups: groupsError,
          members: membersError,
          user: userError,
          orphaned: orphanedError,
          rls: rlsError
        },
        summary: {
          totalGroups: groups?.length || 0,
          totalMembers: members?.length || 0,
          orphanedMembers: orphanedMembers?.length || 0,
          userAuthenticated: !!user
        }
      };

      console.log('Debug Info:', debugInfo);
      return debugInfo;
    } catch (error) {
      console.error('Debug error:', error);
      return { error };
    }
  }

  // Search and Discovery
  static async searchGroups(query: string, filters?: {
    category?: string;
    location_city?: string;
  }): Promise<CommunityGroup[]> {
    try {
      let searchQuery = supabase
        .from('groups')
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
        .from('groups')
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
        .from('groups')
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
        .from('groups')
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
