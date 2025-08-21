import React from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';
import type { ReferralAnalytics as ReferralAnalyticsType } from '@/types/marketing';

interface ReferralAnalyticsProps {
  analytics: ReferralAnalyticsType | null;
}

export const ReferralAnalytics: React.FC<ReferralAnalyticsProps> = ({ analytics }) => {
  if (!analytics) return null;

  return (
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
            ${(analytics.total_rewards || 0).toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">Total Rewards</div>
        </div>
      </div>
    </div>
  );
};
