/**
 * PostActions Component
 * Displays action buttons for social media posts (like, comment, share, save)
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Eye, 
  Share2, 
  Bookmark,
  BookmarkCheck,
  ChevronUp,
  ChevronDown,
  Heart,
  HeartOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SecurityUtils } from '@/config/security';

export interface PostActionsProps {
  /** Post ID for actions */
  postId: string;
  
  /** Current user's interaction state */
  userInteraction: {
    hasLiked: boolean;
    hasSaved: boolean;
    hasViewed: boolean;
    userVote: number; // 1 for upvote, -1 for downvote, 0 for no vote
  };
  
  /** Post engagement metrics */
  metrics: {
    likeCount: number;
    commentCount: number;
    viewCount: number;
    shareCount: number;
    saveCount: number;
    score: number;
  };
  
  /** Whether the post is locked */
  isLocked: boolean;
  
  /** Event handlers */
  onLike?: (postId: string, hasLiked: boolean) => Promise<boolean>;
  onVote?: (postId: string, voteType: number) => Promise<boolean>;
  onSave?: (postId: string, hasSaved: boolean) => Promise<boolean>;
  onShare?: (postId: string) => Promise<boolean>;
  onView?: (postId: string) => Promise<boolean>;
  onComment?: (postId: string) => void;
  
  /** Additional CSS classes */
  className?: string;
}

export const PostActions: React.FC<PostActionsProps> = ({
  postId,
  userInteraction,
  metrics,
  isLocked,
  onLike,
  onVote,
  onSave,
  onShare,
  onView,
  onComment,
  className
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const handleLike = async () => {
    if (!onLike || isLocked) return;
    
    setIsLiking(true);
    try {
      await onLike(postId, !userInteraction.hasLiked);
    } catch (error) {
      console.error('Failed to like post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleVote = async (voteType: number) => {
    if (!onVote || isLocked) return;
    
    setIsVoting(true);
    try {
      await onVote(postId, voteType);
    } catch (error) {
      console.error('Failed to vote on post:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleSave = async () => {
    if (!onSave || isLocked) return;
    
    setIsSaving(true);
    try {
      await onSave(postId, !userInteraction.hasSaved);
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!onShare || isLocked) return;
    
    setIsSharing(true);
    try {
      await onShare(postId);
    } catch (error) {
      console.error('Failed to share post:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleView = async () => {
    if (!onView || isLocked) return;
    
    setIsViewing(true);
    try {
      await onView(postId);
    } catch (error) {
      console.error('Failed to record view:', error);
    } finally {
      setIsViewing(false);
    }
  };

  const handleComment = () => {
    if (isLocked) return;
    onComment?.(postId);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className={cn('px-4 py-3 border-t', className)}>
      {/* Engagement Metrics */}
      <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>{formatCount(metrics.viewCount)} views</span>
          <span>{formatCount(metrics.shareCount)} shares</span>
          <span>{formatCount(metrics.saveCount)} saves</span>
        </div>
        
        {metrics.score !== 0 && (
          <Badge variant="outline" className="text-xs">
            Score: {metrics.score > 0 ? '+' : ''}{metrics.score}
          </Badge>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking || isLocked}
            className={cn(
              'h-8 px-2 hover:bg-red-50 hover:text-red-600 transition-colors',
              userInteraction.hasLiked && 'text-red-600 bg-red-50'
            )}
          >
            {userInteraction.hasLiked ? (
              <Heart className="h-4 w-4 mr-1 fill-current" />
            ) : (
              <HeartOff className="h-4 w-4 mr-1" />
            )}
            <span className="text-xs">{formatCount(metrics.likeCount)}</span>
          </Button>

          {/* Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            disabled={isLocked}
            className="h-8 px-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">{formatCount(metrics.commentCount)}</span>
          </Button>

          {/* Vote Buttons */}
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(userInteraction.userVote === 1 ? 0 : 1)}
              disabled={isVoting || isLocked}
              className={cn(
                'h-8 px-2 rounded-r-none hover:bg-green-50 hover:text-green-600 transition-colors',
                userInteraction.userVote === 1 && 'text-green-600 bg-green-50'
              )}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(userInteraction.userVote === -1 ? 0 : -1)}
              disabled={isVoting || isLocked}
              className={cn(
                'h-8 px-2 rounded-l-none hover:bg-red-50 hover:text-red-600 transition-colors',
                userInteraction.userVote === -1 && 'text-red-600 bg-red-50'
              )}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* View Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            disabled={isViewing || isLocked}
            className="h-8 px-2 hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-4 w-4 mr-1" />
            <span className="text-xs">View</span>
          </Button>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            disabled={isSharing || isLocked}
            className="h-8 px-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Share2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Share</span>
          </Button>

          {/* Save Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isLocked}
            className={cn(
              'h-8 px-2 hover:bg-yellow-50 hover:text-yellow-600 transition-colors',
              userInteraction.hasSaved && 'text-yellow-600 bg-yellow-50'
            )}
          >
            {userInteraction.hasSaved ? (
              <BookmarkCheck className="h-4 w-4 mr-1 fill-current" />
            ) : (
              <Bookmark className="h-4 w-4 mr-1" />
            )}
            <span className="text-xs">Save</span>
          </Button>
        </div>
      </div>

      {/* Locked Post Notice */}
      {isLocked && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800 text-center">
            This post is locked and cannot be interacted with
          </p>
        </div>
      )}
    </div>
  );
};
