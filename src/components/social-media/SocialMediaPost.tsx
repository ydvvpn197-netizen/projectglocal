/**
 * SocialMediaPost Component
 * Main component for displaying social media posts using smaller, focused sub-components
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';
import { useAuth } from '@/hooks/useAuth';
import { SecurityUtils, SecuritySchemas } from '@/config/security';

export interface SocialMediaPostProps {
  /** Post data */
  post: {
    id: string;
    userId: string;
    type: string;
    title?: string;
    content: string;
    status: string;
    locationCity?: string;
    locationState?: string;
    locationCountry?: string;
    latitude?: number;
    longitude?: number;
    eventDate?: string;
    eventLocation?: string;
    priceRange?: string;
    contactInfo?: string;
    tags?: string[];
    imageUrls?: string[];
    likesCount: number;
    commentsCount: number;
    createdAt: string;
    updatedAt: string;
    isPinned?: boolean;
    isLocked?: boolean;
    isTrending?: boolean;
    score?: number;
    viewCount?: number;
    shareCount?: number;
    saveCount?: number;
  };
  
  /** Author information */
  author: {
    id: string;
    name?: string;
    avatar?: string;
    username?: string;
    isVerified?: boolean;
    userType?: string;
  };
  
  /** Current user's interaction state */
  userInteraction?: {
    hasLiked: boolean;
    hasSaved: boolean;
    hasViewed: boolean;
    userVote: number;
  };
  
  /** Event handlers */
  onLike?: (postId: string, hasLiked: boolean) => Promise<boolean>;
  onVote?: (postId: string, voteType: number) => Promise<boolean>;
  onSave?: (postId: string, hasSaved: boolean) => Promise<boolean>;
  onShare?: (postId: string) => Promise<boolean>;
  onView?: (postId: string) => Promise<boolean>;
  onComment?: (postId: string) => void;
  onPin?: (postId: string, isPinned: boolean) => Promise<boolean>;
  onLock?: (postId: string, isLocked: boolean) => Promise<boolean>;
  onDelete?: (postId: string) => Promise<boolean>;
  
  /** Additional CSS classes */
  className?: string;
}

export const SocialMediaPost: React.FC<SocialMediaPostProps> = ({
  post,
  author,
  userInteraction = {
    hasLiked: false,
    hasSaved: false,
    hasViewed: false,
    userVote: 0
  },
  onLike,
  onVote,
  onSave,
  onShare,
  onView,
  onComment,
  onPin,
  onLock,
  onDelete,
  className
}) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  // Memoized computed values
  const computedValues = useMemo(() => {
    const canPin = user?.id === post.userId || author.userType === 'admin';
    const canLock = user?.id === post.userId || author.userType === 'admin';
    const canDelete = user?.id === post.userId || author.userType === 'admin';
    
    const isAnonymous = post.status === 'anonymous';
    
    const eventInfo = post.type === 'event' ? {
      date: post.eventDate,
      location: post.eventLocation,
      priceRange: post.priceRange,
      contactInfo: post.contactInfo
    } : undefined;
    
    const metrics = {
      likeCount: post.likesCount || 0,
      commentCount: post.commentsCount || 0,
      viewCount: post.viewCount || 0,
      shareCount: post.shareCount || 0,
      saveCount: post.saveCount || 0,
      score: post.score || 0
    };
    
    return {
      canPin,
      canLock,
      canDelete,
      isAnonymous,
      eventInfo,
      metrics
    };
  }, [post, author, user]);

  // Memoized event handlers
  const handleDelete = useCallback(async (postId: string) => {
    if (!onDelete) return false;
    
    setIsDeleting(true);
    try {
      const success = await onDelete(postId);
      return success;
    } catch (error) {
      console.error('Failed to delete post:', error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete]);

  const handlePin = useCallback(async (postId: string, isPinned: boolean) => {
    if (!onPin) return false;
    
    try {
      const success = await onPin(postId, isPinned);
      return success;
    } catch (error) {
      console.error('Failed to pin post:', error);
      return false;
    }
  }, [onPin]);

  const handleLock = useCallback(async (postId: string, isLocked: boolean) => {
    if (!onLock) return false;
    
    try {
      const success = await onLock(postId, isLocked);
      return success;
    } catch (error) {
      console.error('Failed to lock post:', error);
      return false;
    }
  }, [onLock]);

  // Validate post data using security schemas
  const validationResult = SecurityUtils.validateInput(
    SecuritySchemas.postContent,
    post.content
  );

  if (!validationResult.success) {
    console.warn('Post content validation failed:', validationResult.errors);
    return null;
  }

  const {
    canPin,
    canLock,
    canDelete,
    isAnonymous,
    eventInfo,
    metrics
  } = computedValues;

  return (
    <Card className={cn('w-full max-w-2xl mx-auto shadow-sm hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-0">
        {/* Post Header */}
        <PostHeader
          author={author}
          post={{
            id: post.id,
            createdAt: post.createdAt,
            isPinned: post.isPinned || false,
            isLocked: post.isLocked || false,
            isTrending: post.isTrending || false,
            postType: post.type
          }}
          canPin={canPin}
          canLock={canLock}
          canDelete={canDelete}
          onPin={handlePin}
          onLock={handleLock}
          onDelete={handleDelete}
        />

        {/* Post Content */}
        <PostContent
          title={post.title}
          content={post.content}
          tags={post.tags}
          imageUrls={post.imageUrls}
          eventInfo={eventInfo}
          isAnonymous={isAnonymous}
        />

        {/* Post Actions */}
        <PostActions
          postId={post.id}
          userInteraction={userInteraction}
          metrics={metrics}
          isLocked={post.isLocked || false}
          onLike={onLike}
          onVote={onVote}
          onSave={onSave}
          onShare={onShare}
          onView={onView}
          onComment={onComment}
        />
      </CardContent>
    </Card>
  );
};
