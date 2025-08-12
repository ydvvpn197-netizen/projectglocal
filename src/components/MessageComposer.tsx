import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X } from 'lucide-react';

interface MessageComposerProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  parentMessage?: {
    id: string;
    content: string;
    user_display_name: string;
  };
  onCancelReply?: () => void;
  initialValue?: string;
  submitLabel?: string;
}

export const MessageComposer = ({ 
  onSubmit, 
  placeholder = "Type your message...",
  parentMessage,
  onCancelReply,
  initialValue = "",
  submitLabel = "Send"
}: MessageComposerProps) => {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
      onCancelReply?.();
    } catch (error) {
      console.error('Error submitting message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        {parentMessage && (
          <div className="mb-3 p-3 bg-muted rounded-lg text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-muted-foreground">
                Replying to {parentMessage.user_display_name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelReply}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground line-clamp-2">
              {parentMessage.content}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </span>
            
            <Button 
              type="submit" 
              disabled={!content.trim() || isSubmitting}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};