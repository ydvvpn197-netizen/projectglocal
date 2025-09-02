import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Gift, 
  Share2, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { ReferralService } from '@/services/referralService';
import { SocialSharingService } from '@/services/socialSharingService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useReferralConfig } from '@/hooks/useReferralConfig';
import { ReferralCodeSection } from './ReferralCodeSection';
import { ReferralAnalytics } from './ReferralAnalytics';
import { RewardsInfo } from './RewardsInfo';
import { HowItWorks } from './HowItWorks';
import type { ReferralAnalytics as ReferralAnalyticsType } from '@/types/marketing';

/**
 * Props for the ReferralProgram component
 */
interface ReferralProgramProps {
  /** Additional CSS classes for styling */
  className?: string;
}

/**
 * ReferralProgram component for managing user referrals and rewards
 *
 * Features:
 * - Automatic referral code generation
 * - Social media sharing integration
 * - Analytics tracking and display
 * - Rewards system management
 * - Copy-to-clipboard functionality
 *
 * @param props - Component props
 * @returns JSX element
 */
export const ReferralProgram: React.FC<ReferralProgramProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { config } = useReferralConfig();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string>('');
  const [analytics, setAnalytics] = useState<ReferralAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get or create referral code
      const code = await ReferralService.getUserReferralCode(user!.id);
      if (!code) {
        // Don't automatically create - let user choose when to create
        setReferralCode(null);
        setReferralLink('');
        setAnalytics(null);
        setLoading(false);
        return;
      }

      setReferralCode(code);

      // Generate referral link
      const link = await ReferralService.generateReferralLink(user!.id);
      setReferralLink(link);

      // Load analytics
      const analyticsData = await ReferralService.getReferralAnalytics(user!.id);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error loading referral data:', error);
      setError('Failed to load referral data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createReferralCode = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create new referral program with configurable values
      const referral = await ReferralService.createReferral({
        reward_type: 'credits',
        reward_amount: config.creditsPerReferral,
        reward_currency: config.currency,
        referral_source: 'web'
      });

      setReferralCode(referral.referral_code);

      // Generate referral link
      const link = await ReferralService.generateReferralLink(user!.id);
      setReferralLink(link);

      // Load analytics
      const analyticsData = await ReferralService.getReferralAnalytics(user!.id);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error creating referral code:', error);
      setError('Failed to create referral code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type === 'code' ? 'Referral code' : 'Referral link'} copied to clipboard.`,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareReferral = async (platform: string) => {
    try {
      const shareData = {
        content_type: 'profile' as const,
        content_id: user!.id,
        platform: platform as any,
        share_text: `Join me on Glocal! Use my referral link: ${referralLink}`,
        share_url: referralLink
      };

      await SocialSharingService.shareContent(shareData);
      
      // Track share event
      ReferralService.trackReferralClick(referralCode!, platform);
      
      toast({
        title: "Shared!",
        description: `Referral link shared on ${platform}.`,
      });
    } catch (error) {
      console.error('Failed to share referral:', error);
      toast({
        title: "Share failed",
        description: "Failed to share referral link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const retryLoading = () => {
    setError(null);
    loadReferralData();
  };

  // Show loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load</h3>
            <p className="text-muted-foreground mb-4">
              {error}
            </p>
            <Button onClick={retryLoading} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show create referral code state
  if (!referralCode) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Earning Rewards</h3>
            <p className="text-muted-foreground mb-4">
              You don't have a referral code yet. Create one to start earning rewards!
            </p>
            <Button onClick={createReferralCode}>
              Create Referral Code
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Referral Program
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Invite friends and earn rewards! Share your referral link and get credits for each successful referral.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Code Section */}
        <ReferralCodeSection
          referralCode={referralCode}
          referralLink={referralLink}
          onCopyToClipboard={copyToClipboard}
        />

        {/* Social Sharing */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Share Your Link</label>
          <div className="flex gap-2 flex-wrap">
            {['facebook', 'twitter', 'linkedin', 'whatsapp'].map((platform) => (
              <Button
                key={platform}
                size="sm"
                variant="outline"
                onClick={() => shareReferral(platform)}
                className="capitalize"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {platform}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Analytics Section */}
        <ReferralAnalytics analytics={analytics} />

        <Separator />

        {/* Rewards Information */}
        <RewardsInfo />

        <Separator />

        {/* How it works */}
        <HowItWorks />
      </CardContent>
    </Card>
  );
};
