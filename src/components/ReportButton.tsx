import React from 'react';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import CommunityReportingInterface from '@/components/CommunityReportingInterface';

interface ReportButtonProps {
  contentType: 'post' | 'comment' | 'event' | 'user' | 'business' | 'group';
  contentId: string;
  contentTitle?: string;
  contentPreview?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onReportSubmitted?: (reportId: string) => void;
}

export const ReportButton: React.FC<ReportButtonProps> = ({
  contentType,
  contentId,
  contentTitle,
  contentPreview,
  variant = 'outline',
  size = 'sm',
  className = '',
  onReportSubmitted
}) => {
  return (
    <CommunityReportingInterface
      contentType={contentType}
      contentId={contentId}
      contentTitle={contentTitle}
      contentPreview={contentPreview}
      onReportSubmitted={onReportSubmitted}
    >
      <Button
        variant={variant}
        size={size}
        className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
      >
        <Flag className="h-4 w-4 mr-1" />
        Report
      </Button>
    </CommunityReportingInterface>
  );
};

export default ReportButton;
