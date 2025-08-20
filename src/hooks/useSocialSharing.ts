import { useState, useCallback } from 'react';
import { SocialSharingService } from '@/services/socialSharingService';
import type { ShareContentData, ShareAnalytics, SocialShare } from '@/types/marketing';

interface UseSocialSharingOptions {
  onShare?: (platform: string) => void;
  onError?: (error: Error) => void;
}

interface UseSocialSharingReturn {
  // State
  isSharing: boolean;
  shareHistory: SocialShare[];
  analytics: ShareAnalytics | null;
  
  // Actions
  shareContent: (data: ShareContentData) => Promise<void>;
  shareOnMultiplePlatforms: (platforms: string[], data: ShareContentData) => Promise<void>;
  getShareAnalytics: (contentId: string, contentType: string) => Promise<void>;
  getUserShareStats: () => Promise<any>;
  getViralContent: (limit?: number) => Promise<any>;
  getTrendingContent: (limit?: number) => Promise<any>;
  
  // Utility
  getShareUrl: (platform: string, content: ShareContentData) => string;
  openShareDialog: (platform: string, content: ShareContentData) => void;
}

export const useSocialSharing = (options: UseSocialSharingOptions = {}): UseSocialSharingReturn => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareHistory, setShareHistory] = useState<SocialShare[]>([]);
  const [analytics, setAnalytics] = useState<ShareAnalytics | null>(null);

  const shareContent = useCallback(async (data: ShareContentData) => {
    try {
      setIsSharing(true);
      
      const share = await SocialSharingService.shareContent(data);
      
      // Update share history
      setShareHistory(prev => [share, ...prev]);
      
      // Call success callback
      options.onShare?.(data.platform);
      
      return share;
    } catch (error) {
      console.error('Failed to share content:', error);
      options.onError?.(error as Error);
      throw error;
    } finally {
      setIsSharing(false);
    }
  }, [options]);

  const shareOnMultiplePlatforms = useCallback(async (platforms: string[], data: ShareContentData) => {
    try {
      setIsSharing(true);
      
      const shares = await SocialSharingService.shareOnMultiplePlatforms(platforms, data);
      
      // Update share history
      setShareHistory(prev => [...shares, ...prev]);
      
      // Call success callback for each platform
      platforms.forEach(platform => options.onShare?.(platform));
      
      return shares;
    } catch (error) {
      console.error('Failed to share on multiple platforms:', error);
      options.onError?.(error as Error);
      throw error;
    } finally {
      setIsSharing(false);
    }
  }, [options]);

  const getShareAnalytics = useCallback(async (contentId: string, contentType: string) => {
    try {
      const analyticsData = await SocialSharingService.getShareAnalytics(contentId, contentType);
      setAnalytics(analyticsData);
      return analyticsData;
    } catch (error) {
      console.error('Failed to get share analytics:', error);
      options.onError?.(error as Error);
      throw error;
    }
  }, [options]);

  const getUserShareStats = useCallback(async () => {
    try {
      // This would need to be implemented with user context
      // For now, we'll return a placeholder
      return {
        total_shares: shareHistory.length,
        shares_by_platform: shareHistory.reduce((acc, share) => {
          acc[share.platform] = (acc[share.platform] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        total_clicks: shareHistory.reduce((sum, share) => sum + share.clicks, 0),
        total_impressions: shareHistory.reduce((sum, share) => sum + share.impressions, 0),
        average_engagement_rate: shareHistory.length > 0 
          ? shareHistory.reduce((sum, share) => sum + share.engagement_rate, 0) / shareHistory.length 
          : 0
      };
    } catch (error) {
      console.error('Failed to get user share stats:', error);
      options.onError?.(error as Error);
      throw error;
    }
  }, [shareHistory, options]);

  const getViralContent = useCallback(async (limit: number = 10) => {
    try {
      return await SocialSharingService.getViralContent(limit);
    } catch (error) {
      console.error('Failed to get viral content:', error);
      options.onError?.(error as Error);
      throw error;
    }
  }, [options]);

  const getTrendingContent = useCallback(async (limit: number = 10) => {
    try {
      return await SocialSharingService.getTrendingContent(limit);
    } catch (error) {
      console.error('Failed to get trending content:', error);
      options.onError?.(error as Error);
      throw error;
    }
  }, [options]);

  const getShareUrl = useCallback((platform: string, content: ShareContentData): string => {
    return SocialSharingService.getShareUrl(platform, content);
  }, []);

  const openShareDialog = useCallback((platform: string, content: ShareContentData): void => {
    SocialSharingService.openShareDialog(platform, content);
  }, []);

  return {
    // State
    isSharing,
    shareHistory,
    analytics,
    
    // Actions
    shareContent,
    shareOnMultiplePlatforms,
    getShareAnalytics,
    getUserShareStats,
    getViralContent,
    getTrendingContent,
    
    // Utility
    getShareUrl,
    openShareDialog
  };
};

// Specialized hooks for specific platforms
export const useFacebookSharing = (options?: UseSocialSharingOptions) => {
  const socialSharing = useSocialSharing(options);
  
  const shareOnFacebook = useCallback(async (data: Omit<ShareContentData, 'platform'>) => {
    return socialSharing.shareContent({ ...data, platform: 'facebook' });
  }, [socialSharing]);
  
  return {
    ...socialSharing,
    shareOnFacebook
  };
};

export const useTwitterSharing = (options?: UseSocialSharingOptions) => {
  const socialSharing = useSocialSharing(options);
  
  const shareOnTwitter = useCallback(async (data: Omit<ShareContentData, 'platform'>) => {
    return socialSharing.shareContent({ ...data, platform: 'twitter' });
  }, [socialSharing]);
  
  return {
    ...socialSharing,
    shareOnTwitter
  };
};

export const useLinkedInSharing = (options?: UseSocialSharingOptions) => {
  const socialSharing = useSocialSharing(options);
  
  const shareOnLinkedIn = useCallback(async (data: Omit<ShareContentData, 'platform'>) => {
    return socialSharing.shareContent({ ...data, platform: 'linkedin' });
  }, [socialSharing]);
  
  return {
    ...socialSharing,
    shareOnLinkedIn
  };
};

export const useWhatsAppSharing = (options?: UseSocialSharingOptions) => {
  const socialSharing = useSocialSharing(options);
  
  const shareOnWhatsApp = useCallback(async (data: Omit<ShareContentData, 'platform'>) => {
    return socialSharing.shareContent({ ...data, platform: 'whatsapp' });
  }, [socialSharing]);
  
  return {
    ...socialSharing,
    shareOnWhatsApp
  };
};

// Hook for managing share analytics
export const useShareAnalytics = (contentId?: string, contentType?: string) => {
  const [analytics, setAnalytics] = useState<ShareAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadAnalytics = useCallback(async (id: string, type: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await SocialSharingService.getShareAnalytics(id, type);
      setAnalytics(data);
      
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAnalytics = useCallback(() => {
    if (contentId && contentType) {
      return loadAnalytics(contentId, contentType);
    }
  }, [contentId, contentType, loadAnalytics]);

  return {
    analytics,
    loading,
    error,
    loadAnalytics,
    refreshAnalytics
  };
};
