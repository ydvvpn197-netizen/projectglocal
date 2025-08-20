import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  Share2, 
  Users, 
  Gift, 
  TrendingUp, 
  CheckCircle,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle
} from 'lucide-react';
import { ReferralService } from '@/services/referralService';
import { SocialSharingService } from '@/services/socialSharingService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { ReferralAnalytics } from '@/types/marketing';

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
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralLink, setReferralLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get user's referral code
      const code = await ReferralService.getUserReferralCode(user.id);
      setReferralCode(code || '');

      // Generate referral link
      if (code) {
        const link = await ReferralService.generateReferralLink(user.id);
        setReferralLink(link);
      }

      // Get referral analytics
      const analyticsData = await ReferralService.getReferralAnalytics(user.id);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load referral data:', error);
      setError('Failed to load referral data. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load referral data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareReferralLink = async (platform: string) => {
    if (!referralLink) return;

    try {
      await SocialSharingService.shareContent({
        content_type: 'profile',
        content_id: user?.id || '',
        platform: platform as any,
        share_text: `Join me on The Glocal! Use my referral link: ${referralLink}`,
        share_url: referralLink
      });

      // Track referral click
      await ReferralService.trackReferralClick(referralCode, platform);
    } catch (error) {
      console.error('Failed to share referral link:', error);
      toast({
        title: "Share failed",
        description: "Failed to share referral link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createReferral = async () => {
    if (!user) return;

    try {
      await ReferralService.createReferral({
        reward_type: 'credits',
        reward_amount: 100,
        reward_currency: 'USD',
        referral_source: 'web'
      });

      // Reload data
      await loadReferralData();
    } catch (error) {
      console.error('Failed to create referral:', error);
      toast({
        title: "Error",
        description: "Failed to create referral. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadReferralData} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Referral Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Referral Program
          </CardTitle>
          <CardDescription>
            Invite friends and earn rewards! Share your referral link and get credits for each successful referral.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!referralCode ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You don't have a referral code yet. Create one to start earning rewards!
              </p>
              <Button onClick={createReferral}>
                Create Referral Code
              </Button>
            </div>
          ) : (
            <>
              {/* Referral Code */}
              <div className="space-y-2">
                <Label htmlFor="referral-code">Your Referral Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="referral-code"
                    value={referralCode}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(referralCode)}
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Referral Link */}
              <div className="space-y-2">
                <Label htmlFor="referral-link">Your Referral Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="referral-link"
                    value={referralLink}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(referralLink)}
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(referralLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div className="space-y-2">
                <Label>Quick Share</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareReferralLink('facebook')}
                    className="flex items-center gap-2"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareReferralLink('twitter')}
                    className="flex items-center gap-2"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareReferralLink('linkedin')}
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareReferralLink('whatsapp')}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Analytics */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Referral Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {analytics.total_referrals}
                </div>
                <div className="text-sm text-muted-foreground">Total Referrals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.successful_referrals}
                </div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.conversion_rate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${analytics.total_rewards.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Rewards</div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Rewards Info */}
            <div className="space-y-2">
              <h4 className="font-semibold">Rewards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">100 Credits</Badge>
                  <span className="text-sm text-muted-foreground">
                    per successful referral
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">$10 Bonus</Badge>
                  <span className="text-sm text-muted-foreground">
                    after 5 successful referrals
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Share Your Link</h4>
                <p className="text-sm text-muted-foreground">
                  Copy and share your unique referral link with friends and family.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Friends Sign Up</h4>
                <p className="text-sm text-muted-foreground">
                  When they use your link to create an account, they get a welcome bonus.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Earn Rewards</h4>
                <p className="text-sm text-muted-foreground">
                  You earn 100 credits for each successful referral, plus bonus rewards!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
