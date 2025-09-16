import { supabase } from '@/integrations/supabase/client';

export interface DataExportRequest {
  id: string;
  userId: string;
  type: 'full' | 'profile' | 'activity' | 'analytics';
  format: 'json' | 'csv' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  fileSize?: number;
  errorMessage?: string;
}

export interface UserDataExport {
  profile: {
    id: string;
    display_name: string;
    bio: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    website_url: string;
    location_city: string;
    location_state: string;
    location_country: string;
    created_at: string;
    updated_at: string;
  };
  activity: {
    posts: Array<{
      id: string;
      content: string;
      created_at: string;
      updated_at: string;
      likes_count: number;
      comments_count: number;
    }>;
    comments: Array<{
      id: string;
      content: string;
      post_id: string;
      created_at: string;
      updated_at: string;
    }>;
    likes: Array<{
      id: string;
      post_id: string;
      created_at: string;
    }>;
    events: Array<{
      id: string;
      title: string;
      description: string;
      start_date: string;
      end_date: string;
      created_at: string;
    }>;
  };
  analytics: {
    login_history: Array<{
      id: string;
      login_time: string;
      ip_address: string;
      user_agent: string;
    }>;
    page_views: Array<{
      id: string;
      page: string;
      viewed_at: string;
      session_id: string;
    }>;
    search_history: Array<{
      id: string;
      query: string;
      searched_at: string;
      results_count: number;
    }>;
  };
  preferences: {
    notification_settings: Record<string, boolean>;
    privacy_settings: Record<string, boolean>;
    location_settings: Record<string, any>;
    theme_preferences: Record<string, any>;
  };
  consent_records: Array<{
    id: string;
    category: string;
    purpose: string;
    granted: boolean;
    granted_at: string;
    revoked_at?: string;
    expires_at?: string;
  }>;
}

export class DataExportService {
  private static instance: DataExportService;
  
  public static getInstance(): DataExportService {
    if (!DataExportService.instance) {
      DataExportService.instance = new DataExportService();
    }
    return DataExportService.instance;
  }

  /**
   * Request a data export for the current user
   */
  async requestDataExport(
    type: DataExportRequest['type'],
    format: DataExportRequest['format']
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create export request record
      const { data: exportRequest, error } = await supabase
        .from('data_export_requests')
        .insert({
          user_id: user.id,
          type,
          format,
          status: 'pending',
          requested_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Trigger background processing (in production, this would be handled by a queue)
      this.processDataExport(exportRequest.id);

      return { success: true, requestId: exportRequest.id };
    } catch (error) {
      console.error('Error requesting data export:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get all data export requests for the current user
   */
  async getDataExportRequests(): Promise<DataExportRequest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching data export requests:', error);
      return [];
    }
  }

  /**
   * Process a data export request (background job)
   */
  private async processDataExport(requestId: string): Promise<void> {
    try {
      // Update status to processing
      await supabase
        .from('data_export_requests')
        .update({ status: 'processing' })
        .eq('id', requestId);

      // Get the export request details
      const { data: request, error: fetchError } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        throw new Error('Export request not found');
      }

      // Collect user data based on type
      const userData = await this.collectUserData(request.user_id, request.type);

      // Generate file based on format
      const fileData = await this.generateExportFile(userData, request.format);

      // Upload file to storage
      const fileName = `user-data-export-${requestId}.${request.format}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('data-exports')
        .upload(fileName, fileData, {
          contentType: this.getContentType(request.format),
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('data-exports')
        .getPublicUrl(fileName);

      // Update request with completion details
      await supabase
        .from('data_export_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          download_url: urlData.publicUrl,
          file_size: fileData.size
        })
        .eq('id', requestId);

    } catch (error) {
      console.error('Error processing data export:', error);
      
      // Update request with error
      await supabase
        .from('data_export_requests')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', requestId);
    }
  }

  /**
   * Collect user data based on export type
   */
  private async collectUserData(userId: string, type: DataExportRequest['type']): Promise<UserDataExport> {
    const userData: UserDataExport = {
      profile: {} as any,
      activity: {
        posts: [],
        comments: [],
        likes: [],
        events: []
      },
      analytics: {
        login_history: [],
        page_views: [],
        search_history: []
      },
      preferences: {
        notification_settings: {},
        privacy_settings: {},
        location_settings: {},
        theme_preferences: {}
      },
      consent_records: []
    };

    try {
      // Always include profile data
      if (type === 'full' || type === 'profile') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (profile) {
          userData.profile = profile;
        }
      }

      // Include activity data
      if (type === 'full' || type === 'activity') {
        // Get posts
        const { data: posts } = await supabase
          .from('posts')
          .select('id, content, created_at, updated_at, likes_count, comments_count')
          .eq('user_id', userId);

        if (posts) {
          userData.activity.posts = posts;
        }

        // Get comments
        const { data: comments } = await supabase
          .from('post_comments')
          .select('id, content, post_id, created_at, updated_at')
          .eq('user_id', userId);

        if (comments) {
          userData.activity.comments = comments;
        }

        // Get likes
        const { data: likes } = await supabase
          .from('post_likes')
          .select('id, post_id, created_at')
          .eq('user_id', userId);

        if (likes) {
          userData.activity.likes = likes;
        }

        // Get events
        const { data: events } = await supabase
          .from('events')
          .select('id, title, description, start_date, end_date, created_at')
          .eq('user_id', userId);

        if (events) {
          userData.activity.events = events;
        }
      }

      // Include analytics data
      if (type === 'full' || type === 'analytics') {
        // Get login history
        const { data: loginHistory } = await supabase
          .from('user_sessions')
          .select('id, login_time, ip_address, user_agent')
          .eq('user_id', userId)
          .order('login_time', { ascending: false })
          .limit(100);

        if (loginHistory) {
          userData.analytics.login_history = loginHistory;
        }

        // Get page views
        const { data: pageViews } = await supabase
          .from('user_analytics')
          .select('id, page, viewed_at, session_id')
          .eq('user_id', userId)
          .order('viewed_at', { ascending: false })
          .limit(1000);

        if (pageViews) {
          userData.analytics.page_views = pageViews;
        }

        // Get search history
        const { data: searchHistory } = await supabase
          .from('search_history')
          .select('id, query, searched_at, results_count')
          .eq('user_id', userId)
          .order('searched_at', { ascending: false })
          .limit(100);

        if (searchHistory) {
          userData.analytics.search_history = searchHistory;
        }
      }

      // Always include preferences and consent records
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferences) {
        userData.preferences = {
          notification_settings: preferences.notification_settings || {},
          privacy_settings: preferences.privacy_settings || {},
          location_settings: preferences.location_settings || {},
          theme_preferences: preferences.theme_preferences || {}
        };
      }

      const { data: consentRecords } = await supabase
        .from('consent_records')
        .select('*')
        .eq('user_id', userId);

      if (consentRecords) {
        userData.consent_records = consentRecords;
      }

    } catch (error) {
      console.error('Error collecting user data:', error);
    }

    return userData;
  }

  /**
   * Generate export file based on format
   */
  private async generateExportFile(userData: UserDataExport, format: string): Promise<Blob> {
    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      
      case 'csv':
        const csvData = this.convertToCSV(userData);
        return new Blob([csvData], { type: 'text/csv' });
      
      case 'pdf':
        // In a real implementation, you would use a PDF generation library
        const pdfData = this.generatePDFReport(userData);
        return new Blob([pdfData], { type: 'application/pdf' });
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Convert user data to CSV format
   */
  private convertToCSV(userData: UserDataExport): string {
    const csvRows: string[] = [];
    
    // Profile data
    csvRows.push('Section,Field,Value');
    csvRows.push('Profile,Display Name,' + (userData.profile.display_name || ''));
    csvRows.push('Profile,Email,' + (userData.profile.email || ''));
    csvRows.push('Profile,Bio,' + (userData.profile.bio || ''));
    
    // Activity data
    userData.activity.posts.forEach((post, index) => {
      csvRows.push(`Post ${index + 1},Content,"${post.content.replace(/"/g, '""')}"`);
      csvRows.push(`Post ${index + 1},Created,${post.created_at}`);
    });
    
    return csvRows.join('\n');
  }

  /**
   * Generate PDF report (simplified implementation)
   */
  private generatePDFReport(userData: UserDataExport): string {
    // This is a simplified implementation
    // In production, you would use a proper PDF generation library like jsPDF or Puppeteer
    return `PDF Report for ${userData.profile.display_name || 'User'}\n\nThis is a placeholder for the actual PDF generation.`;
  }

  /**
   * Get content type for file format
   */
  private getContentType(format: string): string {
    switch (format) {
      case 'json':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Delete a data export request and its associated file
   */
  async deleteDataExportRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the request to find the file
      const { data: request } = await supabase
        .from('data_export_requests')
        .select('download_url')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single();

      if (request?.download_url) {
        // Extract filename from URL and delete from storage
        const fileName = request.download_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('data-exports')
            .remove([fileName]);
        }
      }

      // Delete the request record
      const { error } = await supabase
        .from('data_export_requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting data export request:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
