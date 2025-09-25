import React, { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Pin, 
  Lock,
  Calendar,
  MapPin,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  CheckCircle,
  Eye,
  MoreVertical,
  Share2,
  Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SocialPost } from './SocialMediaPostOptimized';

interface PostHeaderProps {
  post: SocialPost;
  author: SocialPost['author'];
  postConfig: {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    label: string;
  };
  formattedDate: string;
  locationString: string | null;
  engagementMetrics: {
    totalEngagement: number;
    isPopular: boolean;
    isTrending: boolean;
  };
  isExpanded: boolean;
  onToggleExpanded: () => void;
  compact?: boolean;
}

export const PostHeader: React.FC<PostHeaderProps> = memo(({
  post,
  author,
  postConfig,
  formattedDate,
  locationString,
  engagementMetrics,
  isExpanded,
  onToggleExpanded,
  compact = false
}) => {
  const PostIcon = postConfig.icon;

  return (
    <div className={cn(
      "flex items-start justify-between",
      compact ? "mb-2" : "mb-3"
    )}>
      <div className="flex items-start space-x-3 flex-1 min-w-0">
        {/* Author Avatar */}
        <Avatar className={cn(
          "flex-shrink-0",
          compact ? "h-8 w-8" : "h-10 w-10"
        )}>
          <AvatarImage src={author.avatar_url} alt={author.display_name} />
          <AvatarFallback>
            {author.display_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Author Info & Post Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className={cn(
              "font-medium text-gray-900 truncate",
              compact ? "text-sm" : "text-base"
            )}>
              {author.display_name}
            </span>
            
            {author.is_verified && (
              <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
            
            <Badge variant="secondary" className={cn(
              "text-xs",
              post.author.user_type === 'artist' && "bg-purple-100 text-purple-800",
              post.author.user_type === 'admin' && "bg-red-100 text-red-800"
            )}>
              {post.author.user_type}
            </Badge>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{formattedDate}</span>
            {locationString && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{locationString}</span>
                </div>
              </>
            )}
          </div>

          {/* Post Type Badge */}
          <div className="flex items-center space-x-2 mt-1">
            <Badge className={cn("text-xs", postConfig.color)}>
              <PostIcon className="h-3 w-3 mr-1" />
              {postConfig.label}
            </Badge>
            
            {post.status === 'completed' && (
              <Badge variant="outline" className="text-xs">
                Completed
              </Badge>
            )}
            
            {post.post_type === 'announcement' && (
              <Badge variant="destructive" className="text-xs">
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Engagement Indicators & Actions */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        {/* Engagement Metrics */}
        {engagementMetrics.isPopular && (
          <div className="flex items-center space-x-1 text-orange-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Popular</span>
          </div>
        )}
        
        {engagementMetrics.isTrending && (
          <div className="flex items-center space-x-1 text-green-600">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium">Trending</span>
          </div>
        )}

        {/* Expand/Collapse Button */}
        {!compact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpanded}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

PostHeader.displayName = 'PostHeader';
