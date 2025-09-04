/**
 * PostHeader Component
 * Displays the header section of a social media post including author info and actions
 */

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Pin, 
  Lock,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SecurityUtils } from '@/config/security';

export interface PostHeaderProps {
  /** Post author information */
  author: {
    id: string;
    name?: string;
    avatar?: string;
    username?: string;
    isVerified?: boolean;
  };
  
  /** Post metadata */
  post: {
    id: string;
    createdAt: string;
    isPinned: boolean;
    isLocked: boolean;
    isTrending: boolean;
    postType: string;
  };
  
  /** Current user's permissions */
  canPin: boolean;
  canLock: boolean;
  canDelete: boolean;
  
  /** Event handlers */
  onPin?: (postId: string, isPinned: boolean) => Promise<boolean>;
  onLock?: (postId: string, isLocked: boolean) => Promise<boolean>;
  onDelete?: (postId: string) => Promise<boolean>;
  
  /** Additional CSS classes */
  className?: string;
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  author,
  post,
  canPin,
  canLock,
  canDelete,
  onPin,
  onLock,
  onDelete,
  className
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPinning, setIsPinning] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAuthorClick = () => {
    if (author.username) {
      navigate(`/profile/${author.username}`);
    }
  };

  const handlePin = async () => {
    if (!onPin) return;
    
    setIsPinning(true);
    try {
      await onPin(post.id, !post.isPinned);
    } catch (error) {
      console.error('Failed to pin post:', error);
    } finally {
      setIsPinning(false);
    }
  };

  const handleLock = async () => {
    if (!onLock) return;
    
    setIsLocking(true);
    try {
      await onLock(post.id, !post.isLocked);
    } catch (error) {
      console.error('Failed to lock post:', error);
    } finally {
      setIsLocking(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(post.id);
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getPostTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      post: 'Post',
      event: 'Event',
      service: 'Service',
      discussion: 'Discussion',
      poll: 'Poll',
      announcement: 'Announcement'
    };
    return typeLabels[type] || 'Post';
  };

  const getPostTypeColor = (type: string): string => {
    const typeColors: Record<string, string> = {
      post: 'bg-blue-100 text-blue-800',
      event: 'bg-green-100 text-green-800',
      service: 'bg-purple-100 text-purple-800',
      discussion: 'bg-orange-100 text-orange-800',
      poll: 'bg-pink-100 text-pink-800',
      announcement: 'bg-red-100 text-red-800'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={cn('flex items-start justify-between p-4', className)}>
      {/* Author Information */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <Avatar 
          className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleAuthorClick}
        >
          <AvatarImage 
            src={SecurityUtils.sanitizeHtml(author.avatar || '')} 
            alt={SecurityUtils.sanitizeHtml(author.name || 'User')}
          />
          <AvatarFallback>
            {author.name?.charAt(0) || author.username?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 
              className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors truncate"
              onClick={handleAuthorClick}
            >
              {SecurityUtils.sanitizeHtml(author.name || author.username || 'Anonymous')}
            </h4>
            
            {author.isVerified && (
              <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
            
            {post.isTrending && (
              <TrendingUp className="h-4 w-4 text-orange-500 flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            <span>•</span>
            <Badge 
              variant="secondary" 
              className={cn('text-xs', getPostTypeColor(post.postType))}
            >
              {getPostTypeLabel(post.postType)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center space-x-1">
        {post.isPinned && (
          <Badge variant="outline" className="text-xs">
            <Pin className="h-3 w-3 mr-1" />
            Pinned
          </Badge>
        )}
        
        {post.isLocked && (
          <Badge variant="outline" className="text-xs">
            <Lock className="h-3 w-3 mr-1" />
            Locked
          </Badge>
        )}
        
        {(canPin || canLock || canDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canPin && (
                <DropdownMenuItem 
                  onClick={handlePin}
                  disabled={isPinning}
                >
                  <Pin className="h-4 w-4 mr-2" />
                  {post.isPinned ? 'Unpin' : 'Pin'} Post
                </DropdownMenuItem>
              )}
              
              {canLock && (
                <DropdownMenuItem 
                  onClick={handleLock}
                  disabled={isLocking}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {post.isLocked ? 'Unlock' : 'Lock'} Post
                </DropdownMenuItem>
              )}
              
              {canDelete && (
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 focus:text-red-600"
                >
                  Delete Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
