import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Flag, 
  AlertTriangle, 
  Shield, 
  Eye, 
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { communityReportingService } from '@/services/communityReportingService';

interface ReportContentProps {
  contentType: 'post' | 'comment' | 'event' | 'user' | 'business' | 'group';
  contentId: string;
  contentTitle?: string;
  contentPreview?: string;
  onReportSubmitted?: (reportId: string) => void;
}

interface ReportFormData {
  reason: string;
  description: string;
  evidence: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or Unwanted Content', icon: AlertTriangle, color: 'text-yellow-600' },
  { value: 'inappropriate', label: 'Inappropriate Content', icon: Shield, color: 'text-red-600' },
  { value: 'harassment', label: 'Harassment or Bullying', icon: AlertTriangle, color: 'text-red-600' },
  { value: 'misinformation', label: 'False Information', icon: XCircle, color: 'text-orange-600' },
  { value: 'copyright', label: 'Copyright Violation', icon: FileText, color: 'text-purple-600' },
  { value: 'hate_speech', label: 'Hate Speech', icon: XCircle, color: 'text-red-600' },
  { value: 'violence', label: 'Violence or Threats', icon: AlertTriangle, color: 'text-red-600' },
  { value: 'privacy', label: 'Privacy Violation', icon: Eye, color: 'text-blue-600' },
  { value: 'other', label: 'Other', icon: Flag, color: 'text-gray-600' }
];

const CONTENT_TYPE_ICONS = {
  post: FileText,
  comment: MessageSquare,
  event: Calendar,
  user: User,
  business: Building,
  group: User
};

export const CommunityReportingInterface: React.FC<ReportContentProps> = ({
  contentType,
  contentId,
  contentTitle,
  contentPreview,
  onReportSubmitted
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState<ReportFormData>({
    reason: '',
    description: '',
    evidence: [],
    priority: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.reason || !formData.description.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const report = await communityReportingService.submitReport({
        reporter_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reason: formData.reason,
        description: formData.description,
        evidence: formData.evidence,
        priority: formData.priority,
        content_title: contentTitle,
        content_preview: contentPreview
      });

      setSubmitStatus('success');
      onReportSubmitted?.(report.id);
      
      // Reset form
      setFormData({
        reason: '',
        description: '',
        evidence: [],
        priority: 'medium'
      });

      // Close dialog after a short delay
      setTimeout(() => {
        setIsOpen(false);
        setSubmitStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Failed to submit report:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContentTypeIcon = () => {
    const IconComponent = CONTENT_TYPE_ICONS[contentType];
    return <IconComponent className="h-4 w-4" />;
  };

  const getReasonIcon = (reason: string) => {
    const reasonConfig = REPORT_REASONS.find(r => r.value === reason);
    if (!reasonConfig) return <Flag className="h-4 w-4" />;
    const IconComponent = reasonConfig.icon;
    return <IconComponent className={`h-4 w-4 ${reasonConfig.color}`} />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <Flag className="h-4 w-4 mr-1" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Help keep our community safe by reporting content that violates our guidelines.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {getContentTypeIcon()}
                Content Being Reported
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-gray-600">
                <div className="font-medium">{contentTitle || `${contentType} #${contentId.slice(0, 8)}`}</div>
                {contentPreview && (
                  <div className="mt-1 text-gray-500 line-clamp-2">{contentPreview}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Report Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reason Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                What's the issue? *
              </label>
              <Select 
                value={formData.reason} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((reason) => {
                    const IconComponent = reason.icon;
                    return (
                      <SelectItem key={reason.value} value={reason.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className={`h-4 w-4 ${reason.color}`} />
                          {reason.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Please provide details *
              </label>
              <Textarea
                placeholder="Describe why you're reporting this content. Be specific and provide context that will help moderators understand the issue."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[100px]"
                required
              />
            </div>

            {/* Priority Level */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Priority Level
              </label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Low - Minor issue
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Medium - Standard violation
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      High - Serious violation
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Urgent - Immediate attention needed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Report submitted successfully! Our moderation team will review it within 24 hours.
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Failed to submit report. Please try again or contact support.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.reason || !formData.description.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    {getReasonIcon(formData.reason)}
                    <span className="ml-2">Submit Report</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Community Guidelines */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Community Guidelines:</strong> Reports are reviewed by our moderation team. 
            False reports may result in account restrictions. For urgent safety concerns, 
            contact local authorities immediately.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityReportingInterface;
