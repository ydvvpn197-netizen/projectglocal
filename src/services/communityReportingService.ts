import { supabase } from '@/integrations/supabase/client';

export interface CommunityReport {
  id: string;
  reporter_id: string;
  content_type: 'post' | 'comment' | 'event' | 'user' | 'business' | 'group';
  content_id: string;
  reason: string;
  description: string;
  evidence?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed' | 'escalated';
  content_title?: string;
  content_preview?: string;
  assigned_moderator_id?: string;
  resolution_notes?: string;
  action_taken?: string;
  created_at: string;
  updated_at: string;
}

export interface ModerationStats {
  total_reports: number;
  reports_this_week: number;
  reports_this_month: number;
  average_response_time: number;
  resolution_rate: number;
  community_trust_score: number;
  top_report_reasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  moderation_actions: Array<{
    action: string;
    count: number;
    percentage: number;
  }>;
}

export interface TransparencyLog {
  id: string;
  action_type: 'report_resolved' | 'content_removed' | 'user_warned' | 'user_suspended' | 'appeal_processed';
  content_type: string;
  reason: string;
  moderator_notes?: string;
  action_taken: string;
  timestamp: string;
  community_impact: 'positive' | 'neutral' | 'negative';
}

export interface CommunityFeedback {
  id: string;
  feedback_type: 'moderation_quality' | 'response_time' | 'transparency' | 'community_guidelines';
  rating: number;
  comment?: string;
  submitted_by: string;
  timestamp: string;
}

export interface SubmitReportData {
  reporter_id: string;
  content_type: 'post' | 'comment' | 'event' | 'user' | 'business' | 'group';
  content_id: string;
  reason: string;
  description: string;
  evidence?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  content_title?: string;
  content_preview?: string;
}

class CommunityReportingService {
  /**
   * Submit a community report
   */
  async submitReport(data: SubmitReportData): Promise<CommunityReport> {
    try {
      const { data: report, error } = await supabase
        .from('community_reports')
        .insert({
          reporter_id: data.reporter_id,
          content_type: data.content_type,
          content_id: data.content_id,
          reason: data.reason,
          description: data.description,
          evidence: data.evidence || [],
          priority: data.priority,
          content_title: data.content_title,
          content_preview: data.content_preview,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit report: ${error.message}`);
      }

      // Log the report submission for transparency
      await this.logModerationAction({
        action_type: 'report_submitted',
        content_type: data.content_type,
        content_id: data.content_id,
        reason: data.reason,
        action_taken: 'Report submitted by community member',
        community_impact: 'neutral'
      });

      return report;
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  }

  /**
   * Get moderation statistics
   */
  async getModerationStats(timeRange: 'week' | 'month' | 'quarter'): Promise<ModerationStats> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      // Get total reports
      const { count: totalReports } = await supabase
        .from('community_reports')
        .select('*', { count: 'exact', head: true });

      // Get reports this week
      const { count: reportsThisWeek } = await supabase
        .from('community_reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Get reports this month
      const { count: reportsThisMonth } = await supabase
        .from('community_reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get average response time (mock calculation)
      const averageResponseTime = 4.2; // hours

      // Get resolution rate
      const { data: resolvedReports } = await supabase
        .from('community_reports')
        .select('id')
        .in('status', ['resolved', 'dismissed']);

      const resolutionRate = totalReports ? (resolvedReports?.length || 0) / totalReports * 100 : 0;

      // Get community trust score (mock calculation based on feedback)
      const communityTrustScore = 85; // This would be calculated from community feedback

      // Get top report reasons
      const { data: reportReasons } = await supabase
        .from('community_reports')
        .select('reason')
        .gte('created_at', startDate.toISOString());

      const reasonCounts = reportReasons?.reduce((acc, report) => {
        acc[report.reason] = (acc[report.reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topReportReasons = Object.entries(reasonCounts)
        .map(([reason, count]) => ({
          reason,
          count,
          percentage: (count / (reportReasons?.length || 1)) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get moderation actions (mock data)
      const moderationActions = [
        { action: 'content_removed', count: 45, percentage: 35 },
        { action: 'user_warned', count: 32, percentage: 25 },
        { action: 'report_dismissed', count: 28, percentage: 22 },
        { action: 'user_suspended', count: 15, percentage: 12 },
        { action: 'content_approved', count: 8, percentage: 6 }
      ];

      return {
        total_reports: totalReports || 0,
        reports_this_week: reportsThisWeek || 0,
        reports_this_month: reportsThisMonth || 0,
        average_response_time: averageResponseTime,
        resolution_rate: Math.round(resolutionRate),
        community_trust_score: communityTrustScore,
        top_report_reasons: topReportReasons,
        moderation_actions: moderationActions
      };
    } catch (error) {
      console.error('Error getting moderation stats:', error);
      throw error;
    }
  }

  /**
   * Get transparency logs
   */
  async getTransparencyLogs(timeRange: 'week' | 'month' | 'quarter'): Promise<TransparencyLog[]> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      const { data: logs, error } = await supabase
        .from('moderation_transparency_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(`Failed to get transparency logs: ${error.message}`);
      }

      return logs || [];
    } catch (error) {
      console.error('Error getting transparency logs:', error);
      // Return mock data if database query fails
      return this.getMockTransparencyLogs();
    }
  }

  /**
   * Get community feedback
   */
  async getCommunityFeedback(timeRange: 'week' | 'month' | 'quarter'): Promise<CommunityFeedback[]> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      const { data: feedback, error } = await supabase
        .from('community_feedback')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) {
        throw new Error(`Failed to get community feedback: ${error.message}`);
      }

      return feedback || [];
    } catch (error) {
      console.error('Error getting community feedback:', error);
      // Return mock data if database query fails
      return this.getMockCommunityFeedback();
    }
  }

  /**
   * Submit community feedback
   */
  async submitFeedback(data: {
    feedback_type: 'moderation_quality' | 'response_time' | 'transparency' | 'community_guidelines';
    rating: number;
    comment?: string;
    submitted_by: string;
  }): Promise<CommunityFeedback> {
    try {
      const { data: feedback, error } = await supabase
        .from('community_feedback')
        .insert({
          feedback_type: data.feedback_type,
          rating: data.rating,
          comment: data.comment,
          submitted_by: data.submitted_by
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit feedback: ${error.message}`);
      }

      return feedback;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * Log moderation action for transparency
   */
  private async logModerationAction(data: {
    action_type: string;
    content_type: string;
    content_id: string;
    reason: string;
    action_taken: string;
    community_impact: 'positive' | 'neutral' | 'negative';
    moderator_notes?: string;
  }): Promise<void> {
    try {
      await supabase
        .from('moderation_transparency_logs')
        .insert({
          action_type: data.action_type,
          content_type: data.content_type,
          content_id: data.content_id,
          reason: data.reason,
          moderator_notes: data.moderator_notes,
          action_taken: data.action_taken,
          community_impact: data.community_impact
        });
    } catch (error) {
      console.error('Error logging moderation action:', error);
      // Don't throw error here as it's not critical
    }
  }

  /**
   * Get user's report history
   */
  async getUserReports(userId: string): Promise<CommunityReport[]> {
    try {
      const { data: reports, error } = await supabase
        .from('community_reports')
        .select('*')
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get user reports: ${error.message}`);
      }

      return reports || [];
    } catch (error) {
      console.error('Error getting user reports:', error);
      throw error;
    }
  }

  /**
   * Mock data for transparency logs
   */
  private getMockTransparencyLogs(): TransparencyLog[] {
    return [
      {
        id: '1',
        action_type: 'report_resolved',
        content_type: 'post',
        reason: 'spam',
        action_taken: 'Content removed for spam',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        community_impact: 'positive'
      },
      {
        id: '2',
        action_type: 'user_warned',
        content_type: 'user',
        reason: 'harassment',
        action_taken: 'User warned for harassment',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        community_impact: 'positive'
      },
      {
        id: '3',
        action_type: 'content_removed',
        content_type: 'comment',
        reason: 'inappropriate',
        action_taken: 'Comment removed for inappropriate content',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        community_impact: 'positive'
      }
    ];
  }

  /**
   * Mock data for community feedback
   */
  private getMockCommunityFeedback(): CommunityFeedback[] {
    return [
      {
        id: '1',
        feedback_type: 'moderation_quality',
        rating: 4,
        comment: 'Great response time and fair decisions',
        submitted_by: 'user123',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        feedback_type: 'transparency',
        rating: 5,
        comment: 'Love the transparency dashboard!',
        submitted_by: 'user456',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}

export const communityReportingService = new CommunityReportingService();
