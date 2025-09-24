import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VOTE_TYPES } from '@/types/community';

interface VoteButtonsProps {
  score: number;
  userVote: number;
  onVote: (voteType: number) => Promise<boolean>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  className?: string;
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({
  score,
  userVote,
  onVote,
  disabled = false,
  size = 'md',
  showScore = true,
  className
}) => {
  const [isVoting, setIsVoting] = React.useState(false);

  const handleVote = async (voteType: number) => {
    if (disabled || isVoting) return;

    setIsVoting(true);
    try {
      await onVote(voteType);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'h-6 w-6';
      case 'lg':
        return 'h-8 w-8';
      default:
        return 'h-7 w-7';
    }
  };

  const getScoreSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const isUpvoted = userVote === VOTE_TYPES.UP;
  const isDownvoted = userVote === VOTE_TYPES.DOWN;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          getButtonSize(),
          'hover:bg-green-50 hover:text-green-600 transition-colors',
          isUpvoted && 'text-green-600 bg-green-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => handleVote(VOTE_TYPES.UP)}
        disabled={disabled || isVoting}
        aria-label="Upvote"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>

      {showScore && (
        <span
          className={cn(
            'font-medium select-none',
            getScoreSize(),
            score > 0 && 'text-green-600',
            score < 0 && 'text-red-600',
            score === 0 && 'text-gray-500'
          )}
        >
          {score}
        </span>
      )}

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          getButtonSize(),
          'hover:bg-red-50 hover:text-red-600 transition-colors',
          isDownvoted && 'text-red-600 bg-red-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => handleVote(VOTE_TYPES.DOWN)}
        disabled={disabled || isVoting}
        aria-label="Downvote"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );
};
