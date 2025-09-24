import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Bug,
  Lightbulb,
  Heart,
  AlertCircle,
  CheckCircle,
  X,
  Send,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Feedback {
  id: string;
  type: 'rating' | 'suggestion' | 'bug' | 'general';
  rating?: number;
  category?: string;
  message: string;
  page: string;
  userId?: string;
  timestamp: string;
  status: 'new' | 'reviewed' | 'resolved';
  metadata?: Record<string, unknown>;
}

interface FeedbackSystemProps {
  trigger?: React.ReactNode;
  page?: string;
  category?: string;
  showTrigger?: boolean;
  className?: string;
}

const feedbackCategories = [
  { id: 'navigation', label: 'Navigation', icon: '🧭' },
  { id: 'posting', label: 'Posting', icon: '✍️' },
  { id: 'community', label: 'Community', icon: '👥' },
  { id: 'events', label: 'Events', icon: '📅' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'performance', label: 'Performance', icon: '⚡' },
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'other', label: 'Other', icon: '💭' }
];

const feedbackTypes = [
  { id: 'rating', label: 'Rating', icon: Star, description: 'Rate your experience' },
  { id: 'suggestion', label: 'Suggestion', icon: Lightbulb, description: 'Share an idea' },
  { id: 'bug', label: 'Bug Report', icon: Bug, description: 'Report a problem' },
  { id: 'general', label: 'General', icon: MessageCircle, description: 'General feedback' }
];

export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
  trigger,
  page = window.location.pathname,
  category,
  showTrigger = true,
  className = ''
}) => {
  const { user } = useAuth();
  const { track, trackUserBehavior } = useAnalytics();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Form state
  const [feedbackType, setFeedbackType] = useState<string>('rating');
  const [rating, setRating] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>(category || '');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [allowFollowUp, setAllowFollowUp] = useState(false);
  const [urgency, setUrgency] = useState<string>('low');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    
    try {
      const feedback: Feedback = {
        id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: feedbackType as 'rating' | 'suggestion' | 'bug' | 'general',
        rating: feedbackType === 'rating' ? rating : undefined,
        category: selectedCategory,
        message: message.trim(),
        page,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        status: 'new',
        metadata: {
          urgency,
          allowFollowUp,
          email: email.trim() || undefined,
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`
        }
      };

      // Track feedback submission
      track('feedback_submitted', {
        type: feedbackType,
        category: selectedCategory,
        rating: rating,
        urgency,
        page
      });

      trackUserBehavior('submit', 'feedback_form', {
        feedbackType,
        category: selectedCategory,
        rating
      });

      // Send to feedback service
      await submitFeedback(feedback);
      
      setIsSubmitted(true);
      
      // Reset form after delay
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      track('feedback_error', { error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitFeedback = async (feedback: Feedback) => {
    // In production, send to your feedback service
    console.log('Feedback submitted:', feedback);
    
    // Example integrations:
    // - Custom API endpoint
    // - Zendesk
    // - Intercom
    // - Freshdesk
    // - Jira Service Management
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const resetForm = () => {
    setFeedbackType('rating');
    setRating(0);
    setSelectedCategory(category || '');
    setMessage('');
    setEmail('');
    setAllowFollowUp(false);
    setUrgency('low');
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
    trackUserBehavior('rate', 'feedback_rating', { rating: value });
  };

  const getRatingIcon = (value: number) => {
    if (value <= 2) return <Frown className="h-5 w-5 text-red-500" />;
    if (value === 3) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Smile className="h-5 w-5 text-green-500" />;
  };

  const getRatingColor = (value: number) => {
    if (value <= 2) return 'text-red-500';
    if (value === 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (isSubmitted) {
    return (
      <Card className={`text-center p-6 ${className}`}>
        <CardContent>
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Thank you for your feedback!</h3>
          <p className="text-muted-foreground">
            We appreciate you taking the time to help us improve.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (showTrigger && (
          <Button variant="outline" className={className}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Feedback
          </Button>
        ))}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve your experience by sharing your thoughts, suggestions, or reporting issues.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Type Selection */}
          <div className="space-y-3">
            <Label>What type of feedback are you sharing?</Label>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFeedbackType(type.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    feedbackType === type.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <type.icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{type.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Rating Section */}
          {feedbackType === 'rating' && (
            <div className="space-y-3">
              <Label>How would you rate your experience?</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRatingClick(value)}
                    className={`p-2 rounded-lg border transition-colors ${
                      rating >= value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    {getRatingIcon(value)}
                  </button>
                ))}
                {rating > 0 && (
                  <span className={`ml-2 font-medium ${getRatingColor(rating)}`}>
                    {rating <= 2 ? 'Poor' : rating === 3 ? 'Okay' : 'Great'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-3">
            <Label>Category (Optional)</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {feedbackCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              {feedbackType === 'rating' ? 'Tell us more (Optional)' : 'Your feedback *'}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                feedbackType === 'rating' 
                  ? 'What made your experience great or what could we improve?'
                  : feedbackType === 'suggestion'
                  ? 'What would you like to see improved or added?'
                  : feedbackType === 'bug'
                  ? 'Please describe the issue you encountered...'
                  : 'Share your thoughts, suggestions, or concerns...'
              }
              className="min-h-[120px]"
              required={feedbackType !== 'rating'}
            />
          </div>

          {/* Urgency (for bug reports) */}
          {feedbackType === 'bug' && (
            <div className="space-y-3">
              <Label>How urgent is this issue?</Label>
              <RadioGroup value={urgency} onValueChange={setUrgency}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low - Minor inconvenience</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium - Affects functionality</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High - Blocks important features</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Follow-up Options */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h4 className="font-medium">Follow-up Options</h4>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <p className="text-xs text-muted-foreground">
                We'll only use this to follow up on your feedback if needed
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowFollowUp"
                checked={allowFollowUp}
                onCheckedChange={(checked) => setAllowFollowUp(checked as boolean)}
              />
              <Label htmlFor="allowFollowUp" className="text-sm">
                Allow us to follow up on this feedback
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <DialogFooter>
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
              disabled={isSubmitting || (feedbackType !== 'rating' && !message.trim())}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Quick feedback buttons for specific actions
export const QuickFeedback: React.FC<{
  action: string;
  page: string;
  className?: string;
}> = ({ action, page, className = '' }) => {
  const { trackUserBehavior } = useAnalytics();

  const handleQuickFeedback = (type: 'positive' | 'negative') => {
    trackUserBehavior('quick_feedback', action, { type, page });
    
    // Show quick feedback dialog or redirect to full feedback form
    console.log(`Quick feedback: ${type} for ${action} on ${page}`);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground">Was this helpful?</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleQuickFeedback('positive')}
        className="text-green-600 hover:text-green-700 hover:bg-green-50"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleQuickFeedback('negative')}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FeedbackSystem;
