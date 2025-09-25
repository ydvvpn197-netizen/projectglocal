import React, { useState, useCallback, useMemo, memo } from 'react';
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
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';

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
  event_time?: string;
  event_location?: string;
  event_price?: number;
  event_capacity?: number;
  event_registration_required?: boolean;
  
  // Service specific fields
  service_category?: string;
  service_price?: number;
  service_duration?: string;
  service_availability?: string;
  
  // Poll specific fields
  poll_question?: string;
  poll_options?: string[];
  poll_end_date?: string;
  poll_allow_multiple?: boolean;
  
  // Engagement metrics
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  bookmarks_count: number;
  
  // User interaction states
  is_liked?: boolean;
  is_bookmarked?: boolean;
  is_voted?: boolean;
  user_vote?: number;
  
  // Media
  images?: string[];
  videos?: string[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    display_name: string;
    username: string;
    avatar_url?: string;
    user_type: 'user' | 'artist' | 'admin';
    is_verified: boolean;
  };
  
  // Poll results (if applicable)
  poll_results?: {
    total_votes: number;
    options: Array<{
      text: string;
      votes: number;
      percentage: number;
    }>;
  };
}

interface SocialMediaPostProps {
  post: SocialPost;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onVote?: (postId: string, optionIndex: number) => void;
  onView?: (postId: string) => void;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

export const SocialMediaPostOptimized: React.FC<SocialMediaPostProps> = memo(({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onVote,
  onView,
  className,
  showActions = true,
  compact = false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Memoized post type configuration
  const postConfig = useMemo(() => {
    const configs = {
      post: { icon: MessageCircle, color: 'bg-blue-100 text-blue-800', label: 'Post' },
      event: { icon: Calendar, color: 'bg-green-100 text-green-800', label: 'Event' },
      service: { icon: TrendingUp, color: 'bg-purple-100 text-purple-800', label: 'Service' },
      discussion: { icon: MessageCircle, color: 'bg-orange-100 text-orange-800', label: 'Discussion' },
      poll: { icon: CheckCircle, color: 'bg-yellow-100 text-yellow-800', label: 'Poll' },
      announcement: { icon: Pin, color: 'bg-red-100 text-red-800', label: 'Announcement' }
    };
    return configs[post.post_type] || configs.post;
  }, [post.post_type]);

  // Memoized engagement metrics
  const engagementMetrics = useMemo(() => ({
    totalEngagement: post.likes_count + post.comments_count + post.shares_count,
    isPopular: post.likes_count > 10 || post.comments_count > 5,
    isTrending: post.views_count > 100
  }), [post.likes_count, post.comments_count, post.shares_count, post.views_count]);

  // Memoized formatted date
  const formattedDate = useMemo(() => 
    formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
    [post.created_at]
  );

  // Memoized location string
  const locationString = useMemo(() => {
    if (!post.location_city) return null;
    const parts = [post.location_city];
    if (post.location_state) parts.push(post.location_state);
    if (post.location_country) parts.push(post.location_country);
    return parts.join(', ');
  }, [post.location_city, post.location_state, post.location_country]);

  // Optimized event handlers
  const handleLike = useCallback(async () => {
    if (!user || isLoading) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('post_likes')
        .upsert({
          post_id: post.id,
          user_id: user.id,
          created_at: new Date().toISOString()
        });
      
      if (!error) {
        onLike?.(post.id);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, post.id, onLike, isLoading]);

  const handleBookmark = useCallback(async () => {
    if (!user || isLoading) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('post_bookmarks')
        .upsert({
          post_id: post.id,
          user_id: user.id,
          created_at: new Date().toISOString()
        });
      
      if (!error) {
        onBookmark?.(post.id);
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, post.id, onBookmark, isLoading]);

  const handleVote = useCallback(async (optionIndex: number) => {
    if (!user || isLoading || !post.poll_options) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('poll_votes')
        .upsert({
          post_id: post.id,
          user_id: user.id,
          option_index: optionIndex,
          created_at: new Date().toISOString()
        });
      
      if (!error) {
        onVote?.(post.id, optionIndex);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, post.id, post.poll_options, onVote, isLoading]);

  const handleView = useCallback(() => {
    onView?.(post.id);
    navigate(`/post/${post.id}`);
  }, [post.id, onView, navigate]);

  const handleComment = useCallback(() => {
    onComment?.(post.id);
  }, [post.id, onComment]);

  const handleShare = useCallback(() => {
    onShare?.(post.id);
  }, [post.id, onShare]);

  // Memoized post actions
  const postActions = useMemo(() => ({
    onLike: handleLike,
    onComment: handleComment,
    onShare: handleShare,
    onBookmark: handleBookmark,
    onVote: handleVote,
    onView: handleView
  }), [handleLike, handleComment, handleShare, handleBookmark, handleVote, handleView]);

  return (
    <Card className={cn(
      "w-full transition-all duration-200 hover:shadow-md",
      compact && "p-3",
      !compact && "p-4",
      className
    )}>
      <PostHeader 
        post={post}
        author={post.author}
        postConfig={postConfig}
        formattedDate={formattedDate}
        locationString={locationString}
        engagementMetrics={engagementMetrics}
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded(!isExpanded)}
        compact={compact}
      />
      
      <PostContent 
        post={post}
        isExpanded={isExpanded}
        compact={compact}
      />
      
      {showActions && (
        <PostActions 
          post={post}
          actions={postActions}
          isLoading={isLoading}
          compact={compact}
        />
      )}
    </Card>
  );
});

SocialMediaPostOptimized.displayName = 'SocialMediaPostOptimized';
