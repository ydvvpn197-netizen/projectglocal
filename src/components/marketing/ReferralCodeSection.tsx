import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

interface ReferralCodeSectionProps {
  referralCode: string | null;
  referralLink: string;
  onCopyToClipboard: (text: string, type: 'code' | 'link') => void;
}

export const ReferralCodeSection: React.FC<ReferralCodeSectionProps> = ({
  referralCode,
  referralLink,
  onCopyToClipboard
}) => {
  return (
    <div className="space-y-4">
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
            onClick={() => onCopyToClipboard(referralCode!, 'code')}
            aria-label="Copy referral code"
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
            onClick={() => onCopyToClipboard(referralLink, 'link')}
            aria-label="Copy referral link"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
