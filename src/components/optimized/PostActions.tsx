import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  BookmarkCheck,
  Eye,
  ChevronUp,
  ChevronDown,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SocialPost } from './SocialMediaPostOptimized';

interface PostActionsProps {
  post: SocialPost;
  actions: {
    onLike: () => void;
    onComment: () => void;
    onShare: () => void;
    onBookmark: () => void;
    onVote: (optionIndex: number) => void;
    onView: () => void;
  };
  isLoading: boolean;
  compact?: boolean;
}

export const PostActions: React.FC<PostActionsProps> = memo(({
  post,
  actions,
  isLoading,
  compact = false
}) => {
  const handleVote = (optionIndex: number) => {
    if (post.post_type === 'poll' && post.poll_options) {
      actions.onVote(optionIndex);
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-between pt-3 border-t",
      compact ? "pt-2" : "pt-3"
    )}>
      {/* Left Actions */}
      <div className="flex items-center space-x-4">
        {/* Like Button */}
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          onClick={actions.onLike}
          disabled={isLoading}
          className={cn(
            "flex items-center space-x-1",
            post.is_liked && "text-red-600 hover:text-red-700"
          )}
        >
          <Heart className={cn(
            post.is_liked ? "fill-current" : "",
            compact ? "h-4 w-4" : "h-5 w-5"
          )} />
          {post.likes_count > 0 && (
            <span className={cn(
              "font-medium",
              compact ? "text-xs" : "text-sm"
            )}>
              {post.likes_count}
            </span>
          )}
        </Button>

        {/* Comment Button */}
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          onClick={actions.onComment}
          disabled={isLoading}
          className="flex items-center space-x-1"
        >
          <MessageCircle className={cn(
            compact ? "h-4 w-4" : "h-5 w-5"
          )} />
          {post.comments_count > 0 && (
            <span className={cn(
              "font-medium",
              compact ? "text-xs" : "text-sm"
            )}>
              {post.comments_count}
            </span>
          )}
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          onClick={actions.onShare}
          disabled={isLoading}
          className="flex items-center space-x-1"
        >
          <Share2 className={cn(
            compact ? "h-4 w-4" : "h-5 w-5"
          )} />
          {post.shares_count > 0 && (
            <span className={cn(
              "font-medium",
              compact ? "text-xs" : "text-sm"
            )}>
              {post.shares_count}
            </span>
          )}
        </Button>

        {/* Bookmark Button */}
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          onClick={actions.onBookmark}
          disabled={isLoading}
          className={cn(
            "flex items-center space-x-1",
            post.is_bookmarked && "text-blue-600 hover:text-blue-700"
          )}
        >
          {post.is_bookmarked ? (
            <BookmarkCheck className={cn(
              "fill-current",
              compact ? "h-4 w-4" : "h-5 w-5"
            )} />
          ) : (
            <Bookmark className={cn(
              compact ? "h-4 w-4" : "h-5 w-5"
            )} />
          )}
          {post.bookmarks_count > 0 && (
            <span className={cn(
              "font-medium",
              compact ? "text-xs" : "text-sm"
            )}>
              {post.bookmarks_count}
            </span>
          )}
        </Button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        {/* View Count */}
        {post.views_count > 0 && (
          <div className="flex items-center space-x-1 text-gray-500">
            <Eye className={cn(
              compact ? "h-4 w-4" : "h-5 w-5"
            )} />
            <span className={cn(
              "font-medium",
              compact ? "text-xs" : "text-sm"
            )}>
              {post.views_count}
            </span>
          </div>
        )}

        {/* Poll Vote Buttons */}
        {post.post_type === 'poll' && post.poll_options && (
          <div className="flex items-center space-x-1">
            {post.poll_options.slice(0, 2).map((option, index) => (
              <Button
                key={index}
                variant="outline"
                size={compact ? "sm" : "default"}
                onClick={() => handleVote(index)}
                disabled={isLoading || post.is_voted}
                className={cn(
                  "text-xs",
                  post.user_vote === index && "bg-blue-100 text-blue-800"
                )}
              >
                <CheckCircle className={cn(
                  "mr-1",
                  compact ? "h-3 w-3" : "h-4 w-4"
                )} />
                {option.length > 20 ? `${option.substring(0, 20)}...` : option}
              </Button>
            ))}
            {post.poll_options.length > 2 && (
              <Button
                variant="ghost"
                size={compact ? "sm" : "default"}
                className="text-xs"
              >
                +{post.poll_options.length - 2} more
              </Button>
            )}
          </div>
        )}

        {/* Engagement Score */}
        {post.likes_count + post.comments_count + post.shares_count > 0 && (
          <Badge variant="secondary" className={cn(
            "text-xs",
            compact ? "px-1 py-0" : "px-2 py-1"
          )}>
            {post.likes_count + post.comments_count + post.shares_count} interactions
          </Badge>
        )}
      </div>
    </div>
  );
});

PostActions.displayName = 'PostActions';
