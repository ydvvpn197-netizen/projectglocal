import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { communityReportingService } from '@/services/communityReportingService';

interface UseCommunityReportingOptions {
  onReportSubmitted?: (reportId: string) => void;
  onError?: (error: string) => void;
}

export const useCommunityReporting = (options: UseCommunityReportingOptions = {}) => {
  const { user } = useAuth();
  const [isReporting, setIsReporting] = useState(false);

  const submitReport = useCallback(async (data: {
    content_type: 'post' | 'comment' | 'event' | 'user' | 'business' | 'group';
    content_id: string;
    reason: string;
    description: string;
    evidence?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    content_title?: string;
    content_preview?: string;
  }) => {
    if (!user) {
      options.onError?.('You must be logged in to submit a report');
      return;
    }

    setIsReporting(true);
    try {
      const report = await communityReportingService.submitReport({
        reporter_id: user.id,
        ...data
      });
      
      options.onReportSubmitted?.(report.id);
      return report;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit report';
      options.onError?.(errorMessage);
      throw error;
    } finally {
      setIsReporting(false);
    }
  }, [user, options]);

  const getUserReports = useCallback(async () => {
    if (!user) return [];
    
    try {
      return await communityReportingService.getUserReports(user.id);
    } catch (error) {
      console.error('Failed to get user reports:', error);
      return [];
    }
  }, [user]);

  const submitFeedback = useCallback(async (data: {
    feedback_type: 'moderation_quality' | 'response_time' | 'transparency' | 'community_guidelines';
    rating: number;
    comment?: string;
  }) => {
    if (!user) {
      options.onError?.('You must be logged in to submit feedback');
      return;
    }

    try {
      return await communityReportingService.submitFeedback({
        ...data,
        submitted_by: user.id
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit feedback';
      options.onError?.(errorMessage);
      throw error;
    }
  }, [user, options]);

  return {
    submitReport,
    getUserReports,
    submitFeedback,
    isReporting,
    canReport: !!user
  };
};

export default useCommunityReporting;
