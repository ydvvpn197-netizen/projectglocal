import { supabase } from '@/integrations/supabase/client';
import type { 
  GovernmentAuthority,
  GovernmentPoll,
  VirtualProtest,
  VirtualProtestAction,
  VirtualProtestSupporter,
  CommunityIssue,
  CommunityIssueSupporter,
  CivicEngagementMetrics,
  CivicEngagementScore,
  CivicCampaign,
  CivicCampaignActivity,
  CivicCampaignParticipant,
  GovernmentAPIConfig
} from '@/types/civic';

export interface CivicEngagementServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export class CivicEngagementService {
  // ==============================================
  // GOVERNMENT AUTHORITIES
  // ==============================================

  /**
   * Get all government authorities
   */
  async getGovernmentAuthorities(): Promise<CivicEngagementServiceResult<GovernmentAuthority[]>> {
    try {
      const { data, error } = await supabase
        .from('government_authorities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching government authorities:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch government authorities'
      };
    }
  }

  /**
   * Get government authority by ID
   */
  async getGovernmentAuthority(authorityId: string): Promise<CivicEngagementServiceResult<GovernmentAuthority>> {
    try {
      const { data, error } = await supabase
        .from('government_authorities')
        .select('*')
        .eq('id', authorityId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching government authority:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch government authority'
      };
    }
  }

  // ==============================================
  // ENHANCED POLLS WITH GOVERNMENT INTEGRATION
  // ==============================================

  /**
   * Create a government poll
   */
  async createGovernmentPoll(pollData: {
    user_id: string;
    title: string;
    description?: string;
    options: Array<{ id: string; text: string; votes: number }>;
    government_authority_id: string;
    poll_type: 'official' | 'community' | 'protest' | 'survey';
    requires_verification?: boolean;
    target_audience?: 'all' | 'registered_voters' | 'residents' | 'stakeholders';
    geographic_scope?: any;
    civic_impact_level?: 'informational' | 'advisory' | 'binding' | 'referendum';
    expires_at?: string;
  }): Promise<CivicEngagementServiceResult<string>> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .insert({
          user_id: pollData.user_id,
          title: pollData.title,
          description: pollData.description,
          options: pollData.options,
          government_authority_id: pollData.government_authority_id,
          poll_type: pollData.poll_type,
          requires_verification: pollData.requires_verification || false,
          target_audience: pollData.target_audience || 'all',
          geographic_scope: pollData.geographic_scope,
          civic_impact_level: pollData.civic_impact_level || 'informational',
          expires_at: pollData.expires_at,
          official_status: pollData.poll_type === 'official' ? 'pending' : 'active'
        })
        .select('id')
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data.id
      };
    } catch (error) {
      console.error('Error creating government poll:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create government poll'
      };
    }
  }

  /**
   * Get government polls
   */
  async getGovernmentPolls(authorityId?: string): Promise<CivicEngagementServiceResult<GovernmentPoll[]>> {
    try {
      let query = supabase
        .from('polls')
        .select(`
          *,
          government_authorities (*)
        `)
        .not('government_authority_id', 'is', null)
        .eq('is_active', true);

      if (authorityId) {
        query = query.eq('government_authority_id', authorityId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching government polls:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch government polls'
      };
    }
  }

  // ==============================================
  // VIRTUAL PROTESTS
  // ==============================================

  /**
   * Create a virtual protest
   */
  async createVirtualProtest(protestData: {
    title: string;
    description: string;
    organizer_id: string;
    organizer_anonymous_id?: string;
    cause: string;
    target_authority_id?: string;
    protest_type: 'petition' | 'boycott' | 'awareness' | 'digital_assembly' | 'symbolic_action';
    start_date: string;
    end_date?: string;
    participation_goal?: number;
    location_type?: 'virtual' | 'hybrid' | 'local';
    location_details?: any;
    requirements?: any;
  }): Promise<CivicEngagementServiceResult<string>> {
    try {
      const { data, error } = await supabase
        .from('virtual_protests')
        .insert({
          title: protestData.title,
          description: protestData.description,
          organizer_id: protestData.organizer_id,
          organizer_anonymous_id: protestData.organizer_anonymous_id,
          cause: protestData.cause,
          target_authority_id: protestData.target_authority_id,
          protest_type: protestData.protest_type,
          start_date: protestData.start_date,
          end_date: protestData.end_date,
          participation_goal: protestData.participation_goal || 100,
          location_type: protestData.location_type || 'virtual',
          location_details: protestData.location_details,
          requirements: protestData.requirements || {
            age_minimum: null,
            verification_required: false,
            anonymous_participation: true,
            commitment_level: 'low'
          }
        })
        .select('id')
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data.id
      };
    } catch (error) {
      console.error('Error creating virtual protest:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create virtual protest'
      };
    }
  }

  /**
   * Get virtual protests
   */
  async getVirtualProtests(status?: string): Promise<CivicEngagementServiceResult<VirtualProtest[]>> {
    try {
      let query = supabase
        .from('virtual_protests')
        .select(`
          *,
          government_authorities (*)
        `);

      if (status) {
        query = query.eq('status', status);
      } else {
        query = query.in('status', ['active', 'planning']);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching virtual protests:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch virtual protests'
      };
    }
  }

  /**
   * Join a virtual protest
   */
  async joinVirtualProtest(protestId: string, userId: string, anonymousId?: string): Promise<CivicEngagementServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('virtual_protest_supporters')
        .insert({
          protest_id: protestId,
          user_id: userId,
          anonymous_id: anonymousId,
          participation_level: 'supporter',
          total_points: 0
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error joining virtual protest:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to join virtual protest'
      };
    }
  }

  /**
   * Add protest action
   */
  async addProtestAction(actionData: {
    protest_id: string;
    action_type: 'sign_petition' | 'share_content' | 'contact_official' | 'attend_event' | 'donate' | 'boycott';
    title: string;
    description: string;
    instructions: string;
    external_url?: string;
    completion_criteria: string;
    points_rewarded?: number;
    is_required?: boolean;
    order_index?: number;
  }): Promise<CivicEngagementServiceResult<string>> {
    try {
      const { data, error } = await supabase
        .from('virtual_protest_actions')
        .insert({
          protest_id: actionData.protest_id,
          action_type: actionData.action_type,
          title: actionData.title,
          description: actionData.description,
          instructions: actionData.instructions,
          external_url: actionData.external_url,
          completion_criteria: actionData.completion_criteria,
          points_rewarded: actionData.points_rewarded || 10,
          is_required: actionData.is_required || false,
          order_index: actionData.order_index || 0
        })
        .select('id')
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data.id
      };
    } catch (error) {
      console.error('Error adding protest action:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add protest action'
      };
    }
  }

  // ==============================================
  // COMMUNITY ISSUES
  // ==============================================

  /**
   * Create a community issue
   */
  async createCommunityIssue(issueData: {
    title: string;
    description: string;
    reporter_id: string;
    reporter_anonymous_id?: string;
    category: 'infrastructure' | 'safety' | 'environment' | 'transportation' | 'housing' | 'education' | 'health' | 'other';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    location: {
      address?: string;
      city: string;
      state: string;
      coordinates?: { lat: number; lng: number };
    };
    target_authority_id: string;
    evidence?: any;
  }): Promise<CivicEngagementServiceResult<string>> {
    try {
      const { data, error } = await supabase
        .from('community_issues')
        .insert({
          title: issueData.title,
          description: issueData.description,
          reporter_id: issueData.reporter_id,
          reporter_anonymous_id: issueData.reporter_anonymous_id,
          category: issueData.category,
          priority: issueData.priority || 'medium',
          location: issueData.location,
          target_authority_id: issueData.target_authority_id,
          evidence: issueData.evidence
        })
        .select('id')
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data.id
      };
    } catch (error) {
      console.error('Error creating community issue:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create community issue'
      };
    }
  }

  /**
   * Get community issues
   */
  async getCommunityIssues(category?: string, status?: string): Promise<CivicEngagementServiceResult<CommunityIssue[]>> {
    try {
      let query = supabase
        .from('community_issues')
        .select(`
          *,
          government_authorities (*)
        `);

      if (category) {
        query = query.eq('category', category);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching community issues:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch community issues'
      };
    }
  }

  /**
   * Support a community issue
   */
  async supportCommunityIssue(
    issueId: string, 
    userId: string, 
    supportType: 'endorsement' | 'witness' | 'expert' | 'affected_resident',
    supportStatement?: string,
    contactWilling: boolean = false,
    anonymousId?: string
  ): Promise<CivicEngagementServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('community_issue_supporters')
        .insert({
          issue_id: issueId,
          user_id: userId,
          anonymous_id: anonymousId,
          support_type: supportType,
          support_statement: supportStatement,
          contact_willing: contactWilling
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error supporting community issue:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to support community issue'
      };
    }
  }

  // ==============================================
  // CIVIC ENGAGEMENT ANALYTICS
  // ==============================================

  /**
   * Get civic engagement metrics for a user
   */
  async getCivicEngagementMetrics(
    userId: string, 
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: string,
    endDate: string
  ): Promise<CivicEngagementServiceResult<CivicEngagementMetrics>> {
    try {
      const { data, error } = await supabase
        .from('civic_engagement_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('period', period)
        .gte('period_start', startDate)
        .lte('period_end', endDate)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      return {
        success: true,
        data: data || {
          user_id: userId,
          period,
          period_start: startDate,
          period_end: endDate,
          metrics: {
            polls_participated: 0,
            polls_created: 0,
            protests_supported: 0,
            protests_organized: 0,
            civic_actions_completed: 0,
            government_contacts_made: 0,
            community_issues_reported: 0,
            civic_score: 0,
            engagement_level: 'low'
          },
          trends: {
            participation_trend: 'stable',
            issue_focus_areas: [],
            preferred_authority_types: [],
            most_effective_actions: []
          }
        }
      };
    } catch (error) {
      console.error('Error fetching civic engagement metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch civic engagement metrics'
      };
    }
  }

  /**
   * Get civic engagement score for a user
   */
  async getCivicEngagementScore(userId: string): Promise<CivicEngagementServiceResult<CivicEngagementScore>> {
    try {
      const { data, error } = await supabase
        .from('civic_engagement_scores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // If no score exists, calculate one
      if (!data) {
        const calculatedScore = await this.calculateCivicEngagementScore(userId);
        return {
          success: true,
          data: calculatedScore
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching civic engagement score:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch civic engagement score'
      };
    }
  }

  /**
   * Calculate civic engagement score
   */
  private async calculateCivicEngagementScore(userId: string): Promise<CivicEngagementScore> {
    try {
      // Count various civic activities
      const [pollsCreated, pollsParticipated, protestsOrganized, protestsSupported, issuesReported, issuesSupported] = await Promise.all([
        supabase.from('polls').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('poll_votes').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('virtual_protests').select('id', { count: 'exact' }).eq('organizer_id', userId),
        supabase.from('virtual_protest_supporters').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('community_issues').select('id', { count: 'exact' }).eq('reporter_id', userId),
        supabase.from('community_issue_supporters').select('id', { count: 'exact' }).eq('user_id', userId)
      ]);

      const totalScore = 
        (pollsCreated.count || 0) * 5 +
        (pollsParticipated.count || 0) * 2 +
        (protestsOrganized.count || 0) * 20 +
        (protestsSupported.count || 0) * 10 +
        (issuesReported.count || 0) * 15 +
        (issuesSupported.count || 0) * 5;

      // Determine level based on score
      let level: 'novice' | 'active' | 'engaged' | 'leader' | 'champion' = 'novice';
      if (totalScore >= 500) level = 'champion';
      else if (totalScore >= 200) level = 'leader';
      else if (totalScore >= 100) level = 'engaged';
      else if (totalScore >= 25) level = 'active';

      return {
        user_id: userId,
        overall_score: totalScore,
        category_scores: {
          participation: (pollsParticipated.count || 0) * 2 + (protestsSupported.count || 0) * 10,
          leadership: (protestsOrganized.count || 0) * 20,
          community_impact: (issuesReported.count || 0) * 15 + (issuesSupported.count || 0) * 5,
          consistency: Math.min(totalScore / 10, 100),
          innovation: 0 // Would need more complex calculation
        },
        level,
        badges: [],
        achievements: [],
        last_calculated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating civic engagement score:', error);
      return {
        user_id: userId,
        overall_score: 0,
        category_scores: {
          participation: 0,
          leadership: 0,
          community_impact: 0,
          consistency: 0,
          innovation: 0
        },
        level: 'novice',
        badges: [],
        achievements: [],
        last_calculated: new Date().toISOString()
      };
    }
  }

  // ==============================================
  // CIVIC CAMPAIGNS
  // ==============================================

  /**
   * Create a civic campaign
   */
  async createCivicCampaign(campaignData: {
    title: string;
    description: string;
    organizer_id: string;
    organizer_anonymous_id?: string;
    campaign_type: 'awareness' | 'advocacy' | 'mobilization' | 'education';
    target_authority_id?: string;
    goals: any;
    timeline: any;
    resources?: any;
  }): Promise<CivicEngagementServiceResult<string>> {
    try {
      const { data, error } = await supabase
        .from('civic_campaigns')
        .insert({
          title: campaignData.title,
          description: campaignData.description,
          organizer_id: campaignData.organizer_id,
          organizer_anonymous_id: campaignData.organizer_anonymous_id,
          campaign_type: campaignData.campaign_type,
          target_authority_id: campaignData.target_authority_id,
          goals: campaignData.goals,
          timeline: campaignData.timeline,
          resources: campaignData.resources
        })
        .select('id')
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data.id
      };
    } catch (error) {
      console.error('Error creating civic campaign:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create civic campaign'
      };
    }
  }

  /**
   * Get civic campaigns
   */
  async getCivicCampaigns(status?: string): Promise<CivicEngagementServiceResult<CivicCampaign[]>> {
    try {
      let query = supabase
        .from('civic_campaigns')
        .select(`
          *,
          government_authorities (*)
        `);

      if (status) {
        query = query.eq('status', status);
      } else {
        query = query.in('status', ['active', 'planning']);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching civic campaigns:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch civic campaigns'
      };
    }
  }
}

export const civicEngagementService = new CivicEngagementService();
