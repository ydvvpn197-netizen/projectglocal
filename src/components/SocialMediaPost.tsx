import React, { useState, useEffect } from 'react';
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
  MapPin,
  ChevronUp,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  CheckCircle
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
import { supabase } from '@/integrations/supabase/client';

export interface SocialPost {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  post_type: 'post' | 'event' | 'service' | 'discussion' | 'poll' | 'announcement';
  status: 'active' | 'inactive' | 'completed' | 'deleted';
  
  // Location data
  location_city?: string;
  location_state?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  
  // Event specific fields
  event_date?: string;
  event_location?: string;
  price_range?: string;
  contact_info?: string;
  
  // Content fields
  tags?: string[];
  image_urls?: string[];
  
  // Engagement metrics
  upvotes: number;
  downvotes: number;
  score: number;
  comment_count: number;
  view_count: number;
  share_count: number;
  save_count: number;
  
  // Post settings
  is_anonymous: boolean;
  is_pinned: boolean;
  is_locked: boolean;
  is_trending: boolean;
  is_verified: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Author info (joined from profiles)
  author_name?: string;
  author_avatar?: string;
  author_username?: string;
  
  // User interaction state
  user_vote?: number; // 1 for upvote, -1 for downvote, 0 for no vote
  is_saved?: boolean;
  has_viewed?: boolean;
}

interface SocialMediaPostProps {
  post: SocialPost;
  onVote?: (postId: string, voteType: number) => Promise<boolean>;
  onSave?: (postId: string, isSaved: boolean) => Promise<boolean>;
  onShare?: (postId: string) => Promise<boolean>;
  onView?: (postId: string) => Promise<boolean>;
  onPin?: (postId: string, isPinned: boolean) => Promise<boolean>;
  onLock?: (postId: string, isLocked: boolean) => Promise<boolean>;
  onDelete?: (postId: string) => Promise<boolean>;
  className?: string;
}

export const SocialMediaPost: React.FC<SocialMediaPostProps> = ({
  post,
  onVote,
  onSave,
  onShare,
  onView,
  onPin,
  onLock,
  onDelete,
  className
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [localVote, setLocalVote] = useState(post.user_vote || 0);
  const [localScore, setLocalScore] = useState(post.score);
  const [localIsSaved, setLocalIsSaved] = useState(post.is_saved || false);
  const [localSaveCount, setLocalSaveCount] = useState(post.save_count);

  useEffect(() => {
    // Record view when component mounts
    if (user && !post.has_viewed) {
      recordView();
    }
  }, []);

  const recordView = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('post_views')
        .upsert({
          post_id: post.id,
          user_id: user.id
        });
      
      if (!error) {
        // Update local state to prevent duplicate views
        post.has_viewed = true;
      }
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const handleVote = async (voteType: number) => {
    if (!user || isVoting) return;

    setIsVoting(true);
    try {
      let success = false;
      
      if (onVote) {
        success = await onVote(post.id, voteType);
      } else {
        // Default implementation
        const { error } = await supabase
          .from('post_votes')
          .upsert({
            post_id: post.id,
            user_id: user.id,
            vote_type: voteType
          });
        
        success = !error;
      }

      if (success) {
        // Update local state
        const previousVote = localVote;
        setLocalVote(voteType);
        
        // Update score
        if (previousVote === voteType) {
          // Remove vote
          setLocalScore(localScore - voteType);
          setLocalVote(0);
        } else if (previousVote === 0) {
          // Add vote
          setLocalScore(localScore + voteType);
        } else {
          // Change vote
          setLocalScore(localScore - previousVote + voteType);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleSave = async () => {
    if (!user || isSaving) return;

    setIsSaving(true);
    try {
      let success = false;
      
      if (onSave) {
        success = await onSave(post.id, !localIsSaved);
      } else {
        // Default implementation
        if (localIsSaved) {
          const { error } = await supabase
            .from('post_saves')
            .delete()
            .eq('post_id', post.id)
            .eq('user_id', user.id);
          
          success = !error;
        } else {
          const { error } = await supabase
            .from('post_saves')
            .insert({
              post_id: post.id,
              user_id: user.id
            });
          
          success = !error;
        }
      }

      if (success) {
        setLocalIsSaved(!localIsSaved);
        setLocalSaveCount(localIsSaved ? localSaveCount - 1 : localSaveCount + 1);
      }
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!user || isSharing) return;

    setIsSharing(true);
    try {
      let success = false;
      
      if (onShare) {
        success = await onShare(post.id);
      } else {
        // Default implementation
        const { error } = await supabase
          .from('post_shares')
          .insert({
            post_id: post.id,
            user_id: user.id,
            share_type: 'internal'
          });
        
        success = !error;
      }

      if (success) {
        // Try to share to clipboard
        const postUrl = `${window.location.origin}/post/${post.id}`;
        await navigator.clipboard.writeText(postUrl);
        
        // Show success message (you can implement a toast notification here)
        console.log('Post shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  const isOwnPost = user?.id === post.user_id;
  const isUpvoted = localVote === 1;
  const isDownvoted = localVote === -1;

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
        'hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm',
        post.is_pinned && 'border-l-4 border-l-blue-500',
        post.is_locked && 'border-l-4 border-l-red-500',
        className
      )}
      onClick={handlePostClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Vote Buttons */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 hover:bg-green-50 hover:text-green-600 transition-colors',
                isUpvoted && 'text-green-600 bg-green-50',
                isVoting && 'opacity-50 cursor-not-allowed'
              )}
              onClick={(e) => { e.stopPropagation(); handleVote(1); }}
              disabled={isVoting}
              aria-label="Upvote"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>

            <span
              className={cn(
                'font-medium select-none text-sm',
                localScore > 0 && 'text-green-600',
                localScore < 0 && 'text-red-600',
                localScore === 0 && 'text-gray-500'
              )}
            >
              {localScore}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 hover:bg-red-50 hover:text-red-600 transition-colors',
                isDownvoted && 'text-red-600 bg-red-50',
                isVoting && 'opacity-50 cursor-not-allowed'
              )}
              onClick={(e) => { e.stopPropagation(); handleVote(-1); }}
              disabled={isVoting}
              aria-label="Downvote"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author_avatar} />
                <AvatarFallback>
                  {post.author_name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <span className="text-sm font-medium text-gray-900">
                {post.is_anonymous ? 'Anonymous' : post.author_name}
              </span>

              {post.is_verified && (
                <CheckCircle className="h-3 w-3 text-blue-500" />
              )}

              {post.is_trending && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              )}

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

            {/* Post Content */}
            {post.title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {post.title}
              </h3>
            )}

            <div className="text-sm text-gray-700 line-clamp-3 mb-3">
              {post.content}
            </div>

            {/* Location Info */}
            {post.location_city && (
              <div className="flex items-center gap-1 mb-2 text-sm text-gray-500">
                <MapPin className="h-3 w-3" />
                {post.location_city}
                {post.location_state && `, ${post.location_state}`}
              </div>
            )}

            {/* Engagement Stats */}
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

                <div className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  {post.share_count} shares
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>

          {/* Action Menu */}
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
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShare(); }}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSave(); }}>
                {localIsSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-2" />
                    Unsave
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </DropdownMenuItem>
              
              {isOwnPost && (
                <>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPin?.(post.id, !post.is_pinned); }}>
                    <Pin className="h-4 w-4 mr-2" />
                    {post.is_pinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onLock?.(post.id, !post.is_locked); }}>
                    <Lock className="h-4 w-4 mr-2" />
                    {post.is_locked ? 'Unlock' : 'Lock'}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDelete?.(post.id); }}
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

      {/* Save Button */}
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              onClick={(e) => { e.stopPropagation(); handleSave(); }}
              disabled={isSaving}
            >
              {localIsSaved ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {localSaveCount} saves
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
