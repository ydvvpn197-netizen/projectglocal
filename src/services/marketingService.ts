
import { supabase } from '@/integrations/supabase/client';
import { checkTableExists, createMarketingFallback } from '@/utils/databaseUtils';
import type {
  Campaign,
  CreateCampaignData,
  UpdateCampaignData,
  CampaignFilters
} from '@/types/marketing';

/**
 * MarketingService provides comprehensive marketing functionality including
 * campaign management, promotional codes, analytics, and referral programs.
 *
 * Features:
 * - Campaign CRUD operations
 * - Promotional code management
 * - Marketing analytics and metrics
 * - Referral program management
 * - Social sharing analytics
 */
export class MarketingService {
  private static marketingTablesAvailable: boolean | null = null;

  /**
   * Check if marketing tables are available
   */
  private static async checkMarketingTables(): Promise<boolean> {
    if (this.marketingTablesAvailable !== null) {
      return this.marketingTablesAvailable;
    }

    try {
      const campaignsTable = await checkTableExists('marketing_campaigns');
      const referralTable = await checkTableExists('referral_program');
      const socialSharesTable = await checkTableExists('social_shares');
      const promotionalCodesTable = await checkTableExists('promotional_codes');

      this.marketingTablesAvailable = campaignsTable.exists && 
                                     referralTable.exists && 
                                     socialSharesTable.exists && 
                                     promotionalCodesTable.exists;

      if (!this.marketingTablesAvailable) {
        // Don't show warning in console for missing tables - this is expected in development
        // console.warn('Marketing tables not available. Using fallback mode.');
      }

      return this.marketingTablesAvailable;
    } catch (error) {
      console.error('Error checking marketing tables:', error);
      this.marketingTablesAvailable = false;
      return false;
    }
  }

  /**
   * Creates a new marketing campaign
   * @param data - Campaign creation data
   * @returns Promise<Campaign> - Created campaign
   */
  static async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    const tablesAvailable = await this.checkMarketingTables();
    
    if (!tablesAvailable) {
      console.warn('Marketing tables not available. Campaign creation skipped.');
      throw new Error('Marketing features are not available. Please ensure database migrations are applied.');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: campaign, error } = await supabase
        .from('marketing_campaigns')
        .insert({
          ...data,
          created_by: user.id,
          status: data.status || 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      return campaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  /**
   * Retrieves marketing campaigns with optional filtering
   * @param filters - Optional filters for campaigns
   * @returns Promise<Campaign[]> - Array of campaigns
   */
  static async getCampaigns(filters?: CampaignFilters): Promise<Campaign[]> {
    const tablesAvailable = await this.checkMarketingTables();
    
    if (!tablesAvailable) {
      // Don't show warning in console for missing tables - this is expected in development
      // console.warn('Marketing tables not available. Returning empty campaigns list.');
      return [];
    }

    try {
      let query = supabase.from('marketing_campaigns').select('*');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.campaign_type) {
        query = query.eq('campaign_type', filters.campaign_type);
      }
      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      const { data: campaigns, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return campaigns || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  }

  /**
   * Retrieves a specific campaign by ID
   * @param id - Campaign ID
   * @returns Promise<Campaign | null> - Campaign or null if not found
   */
  static async getCampaign(id: string): Promise<Campaign | null> {
    const tablesAvailable = await this.checkMarketingTables();
    
    if (!tablesAvailable) {
      console.warn('Marketing tables not available. Campaign not found.');
      return null;
    }

    try {
      const { data: campaign, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return campaign;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
  }

  /**
   * Updates an existing campaign
   * @param id - Campaign ID
   * @param data - Update data
   * @returns Promise<Campaign> - Updated campaign
   */
  static async updateCampaign(id: string, data: UpdateCampaignData): Promise<Campaign> {
    const tablesAvailable = await this.checkMarketingTables();
    
    if (!tablesAvailable) {
      throw new Error('Marketing features are not available. Please ensure database migrations are applied.');
    }

    try {
      const { data: campaign, error } = await supabase
        .from('marketing_campaigns')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return campaign;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  /**
   * Deletes a campaign
   * @param id - Campaign ID
   * @returns Promise<boolean> - Success status
   */
  static async deleteCampaign(id: string): Promise<boolean> {
    const tablesAvailable = await this.checkMarketingTables();
    
    if (!tablesAvailable) {
      throw new Error('Marketing features are not available. Please ensure database migrations are applied.');
    }

    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return false;
    }
  }

  /**
   * Gets active promotional campaigns for display
   * @returns Promise<Campaign[]> - Active campaigns
   */
  static async getActiveCampaigns(): Promise<Campaign[]> {
    const tablesAvailable = await this.checkMarketingTables();
    
    if (!tablesAvailable) {
      // Don't show warning in console for missing tables - this is expected in development
      // console.warn('Marketing tables not available. No active campaigns.');
      return [];
    }

    try {
      // Check if Supabase client is properly configured
      if (!supabase.auth || !supabase.from) {
        console.warn('Supabase client not properly configured');
        return [];
      }

      const now = new Date().toISOString();
      
      const { data: campaigns, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('status', 'active')
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false });

      if (error) {
        // Handle specific API key errors
        if (error.message?.includes('No API key found') || error.message?.includes('apikey')) {
          console.warn('Supabase API key not configured properly');
          return [];
        }
        throw error;
      }

      return campaigns || [];
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      return [];
    }
  }

  /**
   * Tracks a marketing event
   * @param eventType - Type of event
   * @param eventData - Event data
   * @param campaignId - Optional campaign ID
   */
  static async trackEvent(eventType: string, eventData: any, campaignId?: string): Promise<void> {
    const tablesAvailable = await this.checkMarketingTables();
    
    if (!tablesAvailable) {
      // Don't show warning in console for missing tables - this is expected in development
      // console.warn('Marketing tables not available. Event tracking skipped.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('marketing_analytics').insert({
        event_type: eventType,
        event_data: eventData,
        campaign_id: campaignId,
        user_id: user?.id,
        session_id: sessionStorage.getItem('session_id'),
        ip_address: null, // Would be set by server
        user_agent: navigator.userAgent,
        device_type: this.getDeviceType(),
        location_data: null // Would be set by server
      });
    } catch (error) {
      console.error('Error tracking marketing event:', error);
    }
  }

  /**
   * Gets marketing analytics
   * @param filters - Optional filters
   * @returns Promise<any> - Analytics data
   */
  static async getAnalytics(filters?: any): Promise<any> {
    const tablesAvailable = await this.checkMarketingTables();
    
    if (!tablesAvailable) {
      // Don't show warning in console for missing tables - this is expected in development
      // console.warn('Marketing tables not available. No analytics data.');
      return createMarketingFallback();
    }

    try {
      let query = supabase.from('marketing_analytics').select('*');

      if (filters?.event_type) {
        query = query.eq('event_type', filters.event_type);
      }
      if (filters?.campaign_id) {
        query = query.eq('campaign_id', filters.campaign_id);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data: analytics, error } = await query;

      if (error) throw error;

      return analytics || [];
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }
  }

  /**
   * Helper method to determine device type
   */
  private static getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'mobile';
    } else if (/Tablet|iPad/.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }
}
