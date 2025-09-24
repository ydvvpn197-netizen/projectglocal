import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Eye, 
  Share2, 
  MoreVertical, 
  Pin, 
  Lock,
  Calendar,
  MapPin
} from 'lucide-react';
import { CommunityPost } from '@/types/community';
import { VoteButtons } from './VoteButtons';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVoting } from '@/hooks/useVoting';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommunityPostCardProps {
  post: CommunityPost;
  onVote?: (postId: string, voteType: number) => Promise<boolean>;
  onPin?: (postId: string, isPinned: boolean) => Promise<boolean>;
  onLock?: (postId: string, isLocked: boolean) => Promise<boolean>;
  onDelete?: (postId: string) => Promise<boolean>;
  showGroupInfo?: boolean;
  className?: string;
}

export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  post,
  onVote,
  onPin,
  onLock,
  onDelete,
  showGroupInfo = true,
  className
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { voteOnPost, isVotingOn } = useVoting();

  const handleVote = async (voteType: number) => {
    if (onVote) {
      return await onVote(post.id, voteType);
    }
    return await voteOnPost(post.id, voteType);
  };

  const handlePin = async () => {
    if (onPin) {
      await onPin(post.id, !post.is_pinned);
    }
  };

  const handleLock = async () => {
    if (onLock) {
      await onLock(post.id, !post.is_locked);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(post.id);
    }
  };

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  const handleGroupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/group/${post.group_id}`);
  };

  const isOwnPost = user?.id === post.user_id;
  const isVoting = isVotingOn(post.id, 'post');

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'discussion':
        return 'bg-blue-100 text-blue-800';
      case 'question':
        return 'bg-green-100 text-green-800';
      case 'announcement':
        return 'bg-yellow-100 text-yellow-800';
      case 'event':
        return 'bg-purple-100 text-purple-800';
      case 'poll':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className={cn(
        'hover:shadow-md transition-shadow cursor-pointer',
        post.is_pinned && 'border-l-4 border-l-blue-500',
        post.is_locked && 'border-l-4 border-l-red-500',
        className
      )}
      onClick={handlePostClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <VoteButtons
            score={post.score}
            userVote={post.user_vote || 0}
            onVote={handleVote}
            disabled={isVoting || post.is_locked}
            size="md"
            className="flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author_avatar} />
                <AvatarFallback>
                  {post.author_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <span className="text-sm font-medium text-gray-900">
                {post.author_name}
              </span>

              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>

              {post.is_pinned && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              )}

              {post.is_locked && (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              )}

              <Badge className={getPostTypeColor(post.post_type)}>
                {post.post_type}
              </Badge>
            </div>

            {showGroupInfo && post.group_name && (
              <div className="flex items-center gap-1 mb-2">
                <span className="text-sm text-gray-500">in</span>
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm text-blue-600 hover:text-blue-800"
                  onClick={handleGroupClick}
                >
                  r/{post.group_name}
                </Button>
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {post.title}
            </h3>

            <div className="text-sm text-gray-700 line-clamp-3">
              {post.content}
            </div>

            {post.location_city && (
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                <MapPin className="h-3 w-3" />
                {post.location_city}
                {post.location_state && `, ${post.location_state}`}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              
              {isOwnPost && (
                <>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePin(); }}>
                    <Pin className="h-4 w-4 mr-2" />
                    {post.is_pinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleLock(); }}>
                    <Lock className="h-4 w-4 mr-2" />
                    {post.is_locked ? 'Unlock' : 'Lock'}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                    className="text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {post.comment_count} comments
            </div>
            
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.view_count} views
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
