import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Star,
  Zap,
  Shield,
  Clock,
  Eye,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { communityReportingService } from '@/services/communityReportingService';

interface FeedbackFormData {
  feedback_type: 'moderation_quality' | 'response_time' | 'transparency' | 'community_guidelines';
  rating: number;
  comment: string;
}

const FEEDBACK_TYPES = [
  {
    value: 'moderation_quality',
    label: 'Moderation Quality',
    description: 'How well our moderation team handles reports',
    icon: Shield,
    color: 'text-blue-600'
  },
  {
    value: 'response_time',
    label: 'Response Time',
    description: 'How quickly we respond to reports',
    icon: Clock,
    color: 'text-green-600'
  },
  {
    value: 'transparency',
    label: 'Transparency',
    description: 'How transparent our moderation process is',
    icon: Eye,
    color: 'text-purple-600'
  },
  {
    value: 'community_guidelines',
    label: 'Community Guidelines',
    description: 'How clear and fair our community guidelines are',
    icon: Users,
    color: 'text-orange-600'
  }
];

export const CommunityFeedbackForm: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState<FeedbackFormData>({
    feedback_type: 'moderation_quality',
    rating: 0,
    comment: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || formData.rating === 0) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await communityReportingService.submitFeedback({
        feedback_type: formData.feedback_type,
        rating: formData.rating,
        comment: formData.comment.trim() || undefined,
        submitted_by: user.id
      });

      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        feedback_type: 'moderation_quality',
        rating: 0,
        comment: ''
      });

      // Close dialog after a short delay
      setTimeout(() => {
        setIsOpen(false);
        setSubmitStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFeedbackTypeIcon = (type: string) => {
    const feedbackType = FEEDBACK_TYPES.find(ft => ft.value === type);
    if (!feedbackType) return <MessageSquare className="h-4 w-4" />;
    const IconComponent = feedbackType.icon;
    return <IconComponent className={`h-4 w-4 ${feedbackType.color}`} />;
  };

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <Zap
              className={`h-6 w-6 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          <MessageSquare className="h-4 w-4 mr-1" />
          Give Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Community Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve our moderation system by sharing your feedback.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Type Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              What would you like to provide feedback on? *
            </label>
            <Select 
              value={formData.feedback_type} 
              onValueChange={(value: 'moderation_quality' | 'response_time' | 'transparency' | 'community_guidelines') => 
                setFormData(prev => ({ ...prev, feedback_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className={`h-4 w-4 ${type.color}`} />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              How would you rate this aspect? *
            </label>
            <div className="flex items-center gap-4">
              {renderStars(formData.rating, (rating) => 
                setFormData(prev => ({ ...prev, rating }))
              )}
              <span className="text-sm text-gray-600">
                {formData.rating === 0 ? 'Select a rating' : 
                 formData.rating === 1 ? 'Poor' :
                 formData.rating === 2 ? 'Fair' :
                 formData.rating === 3 ? 'Good' :
                 formData.rating === 4 ? 'Very Good' : 'Excellent'}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Additional Comments (Optional)
            </label>
            <Textarea
              placeholder="Share specific details about your experience. What worked well? What could be improved?"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Thank you for your feedback! It helps us improve our community moderation.
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Failed to submit feedback. Please try again or contact support.
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
              disabled={isSubmitting || formData.rating === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  {getFeedbackTypeIcon(formData.feedback_type)}
                  <span className="ml-2">Submit Feedback</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Privacy Note */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Privacy:</strong> Your feedback is anonymous and helps us improve our moderation system. 
          We may use aggregated feedback for transparency reports.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityFeedbackForm;
