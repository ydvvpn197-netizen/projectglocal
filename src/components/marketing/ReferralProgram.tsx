import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  Share2, 
  Gift, 
  Users, 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { ReferralService } from '@/services/referralService';
import { SocialSharingService } from '@/services/socialSharingService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { checkTableExists } from '@/utils/databaseUtils';

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
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string>('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralTablesAvailable, setReferralTablesAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkReferralTables = async () => {
      try {
        const referralTable = await checkTableExists('referral_program');
        setReferralTablesAvailable(referralTable.exists);
        
        if (!referralTable.exists) {
          console.warn('Referral program table not available. Component will show error state.');
          setError('Referral features not available');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking referral tables:', error);
        setReferralTablesAvailable(false);
        setError('Unable to check referral features');
        setLoading(false);
        return;
      }
    };

    checkReferralTables();
  }, []);

  useEffect(() => {
    if (referralTablesAvailable === false) {
      setLoading(false);
      return;
    }

    if (referralTablesAvailable === true && user) {
      loadReferralData();
    }
  }, [referralTablesAvailable, user]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get or create referral code
      let code = await ReferralService.getUserReferralCode(user!.id);
      if (!code) {
        // Create new referral program
        const referral = await ReferralService.createReferral({
          reward_type: 'credits',
          reward_amount: 100,
          reward_currency: 'USD',
          referral_source: 'web'
        });
        code = referral.referral_code;
      }

      setReferralCode(code);

      // Generate referral link
      const link = await ReferralService.generateReferralLink(user!.id);
      setReferralLink(link);

      // Load analytics
      const analyticsData = await ReferralService.getReferralMetrics(user!.id);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error loading referral data:', error);
      setError('Failed to load referral data');
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
        title: 'Join me on Local Social Hub!',
        text: 'I\'m using Local Social Hub to connect with my local community. Join me and get 100 credits!',
        url: referralLink
      };

      await SocialSharingService.share(platform, shareData);
      
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

  // Show error state if tables not available
  if (referralTablesAvailable === false) {
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
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Referral Features Unavailable</h3>
            <p className="text-muted-foreground mb-4">
              The referral program is currently not available. This may be due to missing database tables.
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
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-10 bg-muted rounded mb-2"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
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
        {/* Referral Code */}
        <div className="space-y-2">
          <label htmlFor="referral-code" className="text-sm font-medium">
            Your Referral Code
          </label>
          <div className="flex gap-2">
            <Input
              id="referral-code"
              value={referralCode || ''}
              readOnly
              className="font-mono"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(referralCode!, 'code')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <label htmlFor="referral-link" className="text-sm font-medium">
            Your Referral Link
          </label>
          <div className="flex gap-2">
            <Input
              id="referral-link"
              value={referralLink}
              readOnly
              className="text-sm"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(referralLink, 'link')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

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

        {/* Analytics */}
        {analytics && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Referral Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.total_referrals || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Referrals</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.successful_referrals || 0}
                </div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.conversion_rate?.toFixed(1) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  <DollarSign className="h-5 w-5 inline mr-1" />
                  {analytics.total_rewards || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Rewards</div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* How it works */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">How It Works</h3>
          
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Share Your Link</h4>
                <p className="text-sm text-muted-foreground">
                  Share your unique referral link with friends and family.
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
                  When they sign up using your link, they get 100 credits.
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
                  You earn 100 credits for each successful referral!
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
