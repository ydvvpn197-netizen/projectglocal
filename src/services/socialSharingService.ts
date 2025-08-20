import { supabase } from '@/integrations/supabase/client';
import { social } from '@/config/environment';
import type {
  SocialShare,
  ShareContentData,
  ShareAnalytics,
  ViralContent
} from '@/types/marketing';

export class SocialSharingService {
  // Social Media Platform Configuration
  private static readonly PLATFORM_CONFIGS = {
    facebook: {
      shareUrl: 'https://www.facebook.com/sharer/sharer.php',
      appId: social.facebook.appId,
      scope: 'public_profile,email'
    },
    twitter: {
      shareUrl: 'https://twitter.com/intent/tweet',
      apiKey: social.twitter.apiKey
    },
    linkedin: {
      shareUrl: 'https://www.linkedin.com/sharing/share-offsite',
      clientId: social.linkedin.clientId
    },
    whatsapp: {
      shareUrl: 'https://wa.me',
      apiKey: social.whatsapp.apiKey
    },
    telegram: {
      shareUrl: 'https://t.me/share/url',
      botToken: social.telegram.botToken
    },
    email: {
      shareUrl: 'mailto:',
      subject: 'Check out this content from The Glocal'
    },
    sms: {
      shareUrl: 'sms:',
      body: 'Check out this content from The Glocal'
    }
  };

  // Share content on social media platforms
  static async shareContent(data: ShareContentData): Promise<SocialShare> {
    const { data: share, error } = await supabase
      .from('social_shares')
      .insert({
        ...data,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    // Track the share event
    await this.trackShareEvent(share);

    return share;
  }

  // Get share URL for a specific platform
  static getShareUrl(platform: string, content: ShareContentData): string {
    const config = this.PLATFORM_CONFIGS[platform as keyof typeof this.PLATFORM_CONFIGS];
    if (!config) throw new Error(`Unsupported platform: ${platform}`);

    const baseUrl = window.location.origin;
    const contentUrl = `${baseUrl}/${content.content_type}/${content.content_id}`;
    const encodedUrl = encodeURIComponent(contentUrl);
    const encodedText = encodeURIComponent(content.share_text || 'Check out this amazing content!');

    switch (platform) {
      case 'facebook':
        return `${config.shareUrl}?u=${encodedUrl}&quote=${encodedText}`;
      
      case 'twitter':
        return `${config.shareUrl}?url=${encodedUrl}&text=${encodedText}`;
      
      case 'linkedin':
        return `${config.shareUrl}?url=${encodedUrl}&title=${encodedText}`;
      
      case 'whatsapp':
        return `${config.shareUrl}?text=${encodedText}%20${encodedUrl}`;
      
      case 'telegram':
        return `${config.shareUrl}?url=${encodedUrl}&text=${encodedText}`;
      
      case 'email':
        return `${config.shareUrl}?subject=${encodeURIComponent(config.subject)}&body=${encodedText}%20${encodedUrl}`;
      
      case 'sms':
        return `${config.shareUrl}?body=${encodedText}%20${encodedUrl}`;
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  // Open share dialog for a platform
  static openShareDialog(platform: string, content: ShareContentData): void {
    const shareUrl = this.getShareUrl(platform, content);
    
    // Open in popup for social platforms, direct for email/sms
    if (platform === 'email' || platform === 'sms') {
      window.location.href = shareUrl;
    } else {
      const popup = window.open(
        shareUrl,
        'share',
        'width=600,height=400,scrollbars=yes,resizable=yes'
      );
      
      // Track popup open
      if (popup) {
        popup.focus();
      }
    }
  }

  // Share content on multiple platforms
  static async shareOnMultiplePlatforms(
    platforms: string[],
    content: ShareContentData
  ): Promise<SocialShare[]> {
    const shares: SocialShare[] = [];
    
    for (const platform of platforms) {
      try {
        const share = await this.shareContent({
          ...content,
          platform: platform as SocialShare['platform']
        });
        shares.push(share);
      } catch (error) {
        console.error(`Failed to share on ${platform}:`, error);
      }
    }
    
    return shares;
  }

  // Get social shares with filters
  static async getSocialShares(filters?: {
    user_id?: string;
    content_type?: SocialShare['content_type'];
    content_id?: string;
    platform?: SocialShare['platform'];
    date_from?: string;
    date_to?: string;
  }): Promise<SocialShare[]> {
    let query = supabase.from('social_shares').select('*');

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters?.content_type) {
      query = query.eq('content_type', filters.content_type);
    }
    if (filters?.content_id) {
      query = query.eq('content_id', filters.content_id);
    }
    if (filters?.platform) {
      query = query.eq('platform', filters.platform);
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data: shares, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return shares || [];
  }

  // Get share analytics for content
  static async getShareAnalytics(contentId: string, contentType: string): Promise<ShareAnalytics> {
    const { data: shares, error } = await supabase
      .from('social_shares')
      .select('*')
      .eq('content_id', contentId)
      .eq('content_type', contentType);

    if (error) throw error;

    const totalShares = shares?.length || 0;
    const sharesByPlatform = shares?.reduce((acc, share) => {
      acc[share.platform] = (acc[share.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalClicks = shares?.reduce((sum, share) => sum + share.clicks, 0) || 0;
    const totalImpressions = shares?.reduce((sum, share) => sum + share.impressions, 0) || 0;
    const engagementRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const viralCoefficient = totalImpressions > 0 ? (totalShares / totalImpressions) * 100 : 0;

    // Generate time series data (last 30 days)
    const timeSeries = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayShares = shares?.filter(share => 
        share.created_at.startsWith(dateStr)
      ) || [];
      
      timeSeries.push({
        date: dateStr,
        shares: dayShares.length,
        engagement: dayShares.reduce((sum, share) => sum + share.clicks, 0)
      });
    }

    return {
      total_shares: totalShares,
      shares_by_platform: sharesByPlatform,
      engagement_rate: engagementRate,
      viral_coefficient: viralCoefficient,
      reach_estimate: totalImpressions,
      time_series: timeSeries
    };
  }

  // Get viral content
  static async getViralContent(limit: number = 10): Promise<ViralContent[]> {
    const { data: viralContent, error } = await supabase
      .from('viral_content')
      .select('*')
      .order('viral_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return viralContent || [];
  }

  // Get trending content
  static async getTrendingContent(limit: number = 10): Promise<ViralContent[]> {
    const { data: trendingContent, error } = await supabase
      .from('viral_content')
      .select('*')
      .not('trending_rank', 'is', null)
      .order('trending_rank', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return trendingContent || [];
  }

  // Update share metrics (clicks, impressions)
  static async updateShareMetrics(
    shareId: string,
    metrics: { clicks?: number; impressions?: number; engagement_rate?: number }
  ): Promise<void> {
    const { error } = await supabase
      .from('social_shares')
      .update(metrics)
      .eq('id', shareId);

    if (error) throw error;
  }

  // Track share event for analytics
  private static async trackShareEvent(share: SocialShare): Promise<void> {
    try {
      // Track in marketing analytics
      await supabase.from('marketing_analytics').insert({
        event_type: 'content_shared',
        event_data: {
          content_type: share.content_type,
          content_id: share.content_id,
          platform: share.platform,
          share_id: share.id
        },
        user_id: share.user_id
      });

      // Update viral content score
      await this.updateViralContentScore(share.content_id, share.content_type);
    } catch (error) {
      console.error('Failed to track share event:', error);
    }
  }

  // Update viral content score
  private static async updateViralContentScore(contentId: string, contentType: string): Promise<void> {
    try {
      // Get all shares for this content
      const { data: shares } = await supabase
        .from('social_shares')
        .select('*')
        .eq('content_id', contentId)
        .eq('content_type', contentType);

      if (!shares) return;

      const totalShares = shares.length;
      const totalClicks = shares.reduce((sum, share) => sum + share.clicks, 0);
      const totalImpressions = shares.reduce((sum, share) => sum + share.impressions, 0);
      
      // Calculate viral score (simplified algorithm)
      const viralScore = totalShares * 0.4 + (totalClicks / Math.max(totalImpressions, 1)) * 0.6;
      
      // Update viral content table
      await supabase
        .from('viral_content')
        .upsert({
          content_type: contentType,
          content_id: contentId,
          viral_score: viralScore,
          share_count: totalShares,
          view_count: totalImpressions,
          engagement_count: totalClicks,
          viral_coefficient: totalImpressions > 0 ? (totalShares / totalImpressions) * 100 : 0,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to update viral content score:', error);
    }
  }

  // Get share statistics for user
  static async getUserShareStats(userId: string): Promise<{
    total_shares: number;
    shares_by_platform: Record<string, number>;
    total_clicks: number;
    total_impressions: number;
    average_engagement_rate: number;
  }> {
    const { data: shares, error } = await supabase
      .from('social_shares')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const totalShares = shares?.length || 0;
    const sharesByPlatform = shares?.reduce((acc, share) => {
      acc[share.platform] = (acc[share.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalClicks = shares?.reduce((sum, share) => sum + share.clicks, 0) || 0;
    const totalImpressions = shares?.reduce((sum, share) => sum + share.impressions, 0) || 0;
    const averageEngagementRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      total_shares: totalShares,
      shares_by_platform: sharesByPlatform,
      total_clicks: totalClicks,
      total_impressions: totalImpressions,
      average_engagement_rate: averageEngagementRate
    };
  }

  // Get platform-specific analytics
  static async getPlatformAnalytics(platform: string, dateFrom?: string, dateTo?: string): Promise<{
    total_shares: number;
    total_clicks: number;
    total_impressions: number;
    engagement_rate: number;
    viral_coefficient: number;
    top_content: Array<{
      content_id: string;
      content_type: string;
      shares: number;
      clicks: number;
      viral_score: number;
    }>;
  }> {
    let query = supabase
      .from('social_shares')
      .select('*')
      .eq('platform', platform);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data: shares, error } = await query;

    if (error) throw error;

    const totalShares = shares?.length || 0;
    const totalClicks = shares?.reduce((sum, share) => sum + share.clicks, 0) || 0;
    const totalImpressions = shares?.reduce((sum, share) => sum + share.impressions, 0) || 0;
    const engagementRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const viralCoefficient = totalImpressions > 0 ? (totalShares / totalImpressions) * 100 : 0;

    // Get top content for this platform
    const contentStats = shares?.reduce((acc, share) => {
      const key = `${share.content_type}-${share.content_id}`;
      if (!acc[key]) {
        acc[key] = {
          content_id: share.content_id,
          content_type: share.content_type,
          shares: 0,
          clicks: 0,
          viral_score: 0
        };
      }
      acc[key].shares += 1;
      acc[key].clicks += share.clicks;
      acc[key].viral_score = (acc[key].shares * 0.4 + (acc[key].clicks / Math.max(totalImpressions, 1)) * 0.6);
      return acc;
    }, {} as Record<string, any>) || {};

    const topContent = Object.values(contentStats)
      .sort((a: any, b: any) => b.viral_score - a.viral_score)
      .slice(0, 10);

    return {
      total_shares: totalShares,
      total_clicks: totalClicks,
      total_impressions: totalImpressions,
      engagement_rate: engagementRate,
      viral_coefficient: viralCoefficient,
      top_content: topContent
    };
  }
}
