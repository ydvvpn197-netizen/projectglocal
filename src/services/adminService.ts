// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { 
  AdminUser, 
  AdminRole, 
  AdminAction, 
  AdminPermissions,
  AdminApiResponse,
  PaginatedResponse 
} from '@/types/admin';

export class AdminService {
  /**
   * Check if current user is an admin
   */
  async isAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) return false;
      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Get current admin user with role and permissions
   */
  async getCurrentAdminUser(): Promise<AdminUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          *,
          role:admin_roles(*),
          profile:profiles(username, full_name, email, avatar_url)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching admin user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting current admin user:', error);
      return null;
    }
  }

  /**
   * Check if admin user has specific permission
   */
  async checkPermission(permission: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('check_admin_permission', {
        required_permission: permission,
        user_uuid: user.id
      });

      if (error) {
        console.error('Error checking permission:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Log admin action
   */
  async logAction(
    actionType: string,
    resourceType: string,
    resourceId?: string,
    actionData?: any,
    success: boolean = true,
    errorMessage?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_admin_action', {
        action_type: actionType,
        resource_type: resourceType,
        resource_id: resourceId,
        action_data: actionData,
        success: success,
        error_message: errorMessage
      });

      if (error) {
        console.error('Error logging admin action:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error logging admin action:', error);
      return null;
    }
  }

  /**
   * Get admin users with pagination
   */
  async getAdminUsers(
    page: number = 1,
    limit: number = 20,
    filters?: {
      search?: string;
      role_id?: string;
      is_active?: boolean;
    }
  ): Promise<PaginatedResponse<AdminUser>> {
    try {
      let query = supabase
        .from('admin_users')
        .select(`
          *,
          role:admin_roles(*),
          profile:profiles(username, full_name, email, avatar_url)
        `, { count: 'exact' });

      // Apply filters
      if (filters?.search) {
        query = query.or(`profile.username.ilike.%${filters.search}%,profile.full_name.ilike.%${filters.search}%`);
      }

      if (filters?.role_id) {
        query = query.eq('role_id', filters.role_id);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
  }

  /**
   * Create admin user
   */
  async createAdminUser(
    userId: string,
    roleId: string,
    options?: {
      twoFactorEnabled?: boolean;
      ipWhitelist?: string[];
    }
  ): Promise<AdminUser> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          role_id: roleId,
          two_factor_enabled: options?.twoFactorEnabled || false,
          ip_whitelist: options?.ipWhitelist || []
        })
        .select(`
          *,
          role:admin_roles(*),
          profile:profiles(username, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Log the action
      await this.logAction('create', 'admin_user', data.id, { user_id: userId, role_id: roleId });

      return data;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  /**
   * Update admin user
   */
  async updateAdminUser(
    adminUserId: string,
    updates: {
      role_id?: string;
      is_active?: boolean;
      two_factor_enabled?: boolean;
      ip_whitelist?: string[];
    }
  ): Promise<AdminUser> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminUserId)
        .select(`
          *,
          role:admin_roles(*),
          profile:profiles(username, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Log the action
      await this.logAction('update', 'admin_user', adminUserId, updates);

      return data;
    } catch (error) {
      console.error('Error updating admin user:', error);
      throw error;
    }
  }

  /**
   * Delete admin user
   */
  async deleteAdminUser(adminUserId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminUserId);

      if (error) throw error;

      // Log the action
      await this.logAction('delete', 'admin_user', adminUserId);
    } catch (error) {
      console.error('Error deleting admin user:', error);
      throw error;
    }
  }

  /**
   * Get admin roles
   */
  async getAdminRoles(): Promise<AdminRole[]> {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('is_active', true)
        .order('display_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admin roles:', error);
      throw error;
    }
  }

  /**
   * Create admin role
   */
  async createAdminRole(role: {
    name: string;
    display_name: string;
    description?: string;
    permissions: AdminPermissions;
  }): Promise<AdminRole> {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .insert(role)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await this.logAction('create', 'admin_role', data.id, role);

      return data;
    } catch (error) {
      console.error('Error creating admin role:', error);
      throw error;
    }
  }

  /**
   * Update admin role
   */
  async updateAdminRole(
    roleId: string,
    updates: Partial<AdminRole>
  ): Promise<AdminRole> {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await this.logAction('update', 'admin_role', roleId, updates);

      return data;
    } catch (error) {
      console.error('Error updating admin role:', error);
      throw error;
    }
  }

  /**
   * Delete admin role
   */
  async deleteAdminRole(roleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      // Log the action
      await this.logAction('delete', 'admin_role', roleId);
    } catch (error) {
      console.error('Error deleting admin role:', error);
      throw error;
    }
  }

  /**
   * Get admin actions with pagination
   */
  async getAdminActions(
    page: number = 1,
    limit: number = 50,
    filters?: {
      action_type?: string;
      resource_type?: string;
      admin_user_id?: string;
      success?: boolean;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<PaginatedResponse<AdminAction>> {
    try {
      let query = supabase
        .from('admin_actions')
        .select(`
          *,
          admin_user:admin_users(
            id,
            profile:profiles(username, full_name)
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters?.action_type) {
        query = query.eq('action_type', filters.action_type);
      }

      if (filters?.resource_type) {
        query = query.eq('resource_type', filters.resource_type);
      }

      if (filters?.admin_user_id) {
        query = query.eq('admin_user_id', filters.admin_user_id);
      }

      if (filters?.success !== undefined) {
        query = query.eq('success', filters.success);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching admin actions:', error);
      throw error;
    }
  }

  /**
   * Update admin user last login
   */
  async updateLastLogin(adminUserId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: supabase.sql`login_count + 1`
        })
        .eq('id', adminUserId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    totalContent: number;
    pendingReports: number;
    totalEvents: number;
    totalPosts: number;
    totalReviews: number;
  }> {
    try {
      // Mock data for now - replace with actual queries
      return {
        totalUsers: 1250,
        activeUsers: 890,
        newUsersToday: 45,
        totalContent: 3456,
        pendingReports: 23,
        totalEvents: 567,
        totalPosts: 2345,
        totalReviews: 544
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get system settings
   */
  async getSystemSettings(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(settings: any[]): Promise<void> {
    try {
      for (const setting of settings) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            setting_key: setting.setting_key,
            setting_value: setting.setting_value,
            setting_type: setting.setting_type,
            description: setting.description,
            is_public: setting.is_public
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  /**
   * Get users with pagination and filters
   */
  async getUsers(filters: any): Promise<PaginatedResponse<any>> {
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error, count } = await query
        .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], total: count || 0 };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get content reports with pagination and filters
   */
  async getContentReports(filters: any): Promise<PaginatedResponse<any>> {
    try {
      let query = supabase
        .from('content_reports')
        .select(`
          *,
          reporter:profiles!content_reports_reporter_id_fkey(*)
        `, { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`report_reason.ilike.%${filters.search}%,report_details.ilike.%${filters.search}%`);
      }
      if (filters.contentType) {
        query = query.eq('content_type', filters.contentType);
      }
      if (filters.reportStatus) {
        query = query.eq('report_status', filters.reportStatus);
      }
      if (filters.reportReason) {
        query = query.eq('report_reason', filters.reportReason);
      }

      const { data, error, count } = await query
        .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], total: count || 0 };
    } catch (error) {
      console.error('Error fetching content reports:', error);
      throw error;
    }
  }

  /**
   * Resolve content report
   */
  async resolveContentReport(reportId: string, action: string, notes?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_reports')
        .update({
          report_status: action === 'approve' ? 'resolved' : action === 'reject' ? 'dismissed' : 'escalated',
          resolution_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
    } catch (error) {
      console.error('Error resolving content report:', error);
      throw error;
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(filters: any): Promise<any> {
    try {
      // Mock data for now - replace with actual analytics queries
      return {
        totalUsers: 1250,
        activeUsers: 890,
        newUsers: 45,
        previousPeriodUsers: 1205,
        dailyActiveUsers: 234,
        weeklyActiveUsers: 567,
        monthlyActiveUsers: 890,
        usersWithLocation: 78.5,
        verifiedUsers: 92.3,
        day1Retention: 65.2,
        day7Retention: 42.1,
        day30Retention: 28.7
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  /**
   * Get content analytics
   */
  async getContentAnalytics(filters: any): Promise<any> {
    try {
      // Mock data for now - replace with actual analytics queries
      return {
        totalContent: 3456,
        newContent: 123,
        previousPeriodContent: 3333,
        posts: 2345,
        events: 567,
        reviews: 544,
        avgViewsPerPost: 45,
        avgLikesPerPost: 12,
        avgCommentsPerPost: 8,
        reportedContent: 23,
        removedContent: 5,
        contentApprovalRate: 98.5
      };
    } catch (error) {
      console.error('Error fetching content analytics:', error);
      throw error;
    }
  }

  /**
   * Get platform metrics
   */
  async getPlatformMetrics(filters: any): Promise<any> {
    try {
      // Mock data for now - replace with actual analytics queries
      return {
        engagementRate: 67.8,
        avgSessionDuration: 4.5,
        totalViews: 125000,
        totalLikes: 34500,
        totalShares: 8900,
        pagesPerSession: 3.2,
        bounceRate: 23.4,
        uptime: 99.9,
        avgResponseTime: 150,
        errorRate: 0.1
      };
    } catch (error) {
      console.error('Error fetching platform metrics:', error);
      throw error;
    }
  }

  /**
   * Suspend user
   */
  async suspendUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended' })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  }

  /**
   * Activate user
   */
  async activateUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      // Call the delete_user_account function
      const { error } = await supabase.rpc('delete_user_account', {
        user_uuid: userId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}
