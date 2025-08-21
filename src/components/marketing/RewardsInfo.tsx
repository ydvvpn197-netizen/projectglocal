import React from 'react';
import { Gift, DollarSign } from 'lucide-react';
import { useReferralConfig } from '@/hooks/useReferralConfig';

export const RewardsInfo: React.FC = () => {
  const { config } = useReferralConfig();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Rewards</h3>
      
      <div className="grid gap-4">
        <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
          <Gift className="h-6 w-6 text-green-600 mt-1" />
          <div>
            <h4 className="font-semibold">{config.creditsPerReferral} Credits</h4>
            <p className="text-sm text-muted-foreground">per successful referral</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
          <DollarSign className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold">${config.bonusAfterReferrals} Bonus</h4>
            <p className="text-sm text-muted-foreground">
              after {config.referralsForBonus} successful referrals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
