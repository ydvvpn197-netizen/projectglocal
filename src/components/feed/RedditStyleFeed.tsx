/**
 * Reddit-Style Feed Component
 * Clean, modern feed layout inspired by Reddit's design
 */

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Share2,
  Bookmark,
  MoreHorizontal,
  TrendingUp,
  Flame,
  Clock,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    avatar?: string;
  };
  community: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timestamp: string;
  thumbnail?: string;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
  isBookmarked?: boolean;
}

interface RedditStyleFeedProps {
  posts?: Post[];
  showSortOptions?: boolean;
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'Community meetup this weekend - All welcome!',
    content: 'Hey everyone! We\'re organizing a community meetup this Saturday at Central Park. Would love to see you all there. Bring your friends and family!',
    author: {
      username: 'community_organizer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    },
    community: 'LocalEvents',
    upvotes: 1247,
    downvotes: 12,
    comments: 89,
    timestamp: '5 hours ago',
  },
  {
    id: '2',
    title: 'New local coffee shop opened downtown - Amazing espresso!',
    content: 'Just tried the new coffee place on Main Street. The espresso is incredible and the atmosphere is perfect for working. Highly recommend!',
    author: {
      username: 'coffee_lover',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    },
    community: 'LocalBusiness',
    upvotes: 892,
    downvotes: 8,
    comments: 67,
    timestamp: '8 hours ago',
    thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=120&fit=crop',
  },
  {
    id: '3',
    title: 'Looking for volunteers for park cleanup this Sunday',
    content: 'We need volunteers to help clean up Riverside Park. All supplies provided. Come join us and make our community beautiful!',
    author: {
      username: 'green_team',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    },
    community: 'Community',
    upvotes: 567,
    downvotes: 5,
    comments: 45,
    timestamp: '12 hours ago',
  },
];

export const RedditStyleFeed: React.FC<RedditStyleFeedProps> = ({
  posts = MOCK_POSTS,
  showSortOptions = true,
}) => {
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [postStates, setPostStates] = useState<Record<string, { upvoted: boolean; downvoted: boolean; bookmarked: boolean }>>({});

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    setPostStates(prev => {
      const current = prev[postId] || { upvoted: false, downvoted: false, bookmarked: false };
      
      if (voteType === 'up') {
        return {
          ...prev,
          [postId]: {
            ...current,
            upvoted: !current.upvoted,
            downvoted: false,
          },
        };
      } else {
        return {
          ...prev,
          [postId]: {
            ...current,
            upvoted: false,
            downvoted: !current.downvoted,
          },
        };
      }
    });
  };

  const handleBookmark = (postId: string) => {
    setPostStates(prev => {
      const current = prev[postId] || { upvoted: false, downvoted: false, bookmarked: false };
      return {
        ...prev,
        [postId]: {
          ...current,
          bookmarked: !current.bookmarked,
        },
      };
    });
  };

  const getVoteCount = (post: Post) => {
    const state = postStates[post.id] || { upvoted: false, downvoted: false, bookmarked: false };
    let count = post.upvotes - post.downvotes;
    
    if (state.upvoted) count += 1;
    if (state.downvoted) count -= 1;
    
    return count;
  };

  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-4">
      {/* Sort Options */}
      {showSortOptions && (
        <Card className="border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Button
                variant={sortBy === 'hot' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('hot')}
                className="gap-2"
              >
                <Flame className="h-4 w-4" />
                Hot
              </Button>
              <Button
                variant={sortBy === 'new' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('new')}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                New
              </Button>
              <Button
                variant={sortBy === 'top' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('top')}
                className="gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Top
              </Button>
              <div className="ml-auto">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      <div className="space-y-3">
        {posts.map((post) => {
          const state = postStates[post.id] || { upvoted: false, downvoted: false, bookmarked: false };
          
          return (
            <Card key={post.id} className="border-border hover:border-border/80 transition-colors">
              <div className="flex">
                {/* Vote Section */}
                <div className="flex flex-col items-center gap-1 p-2 bg-muted/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 w-8 p-0 hover:bg-primary/10',
                      state.upvoted && 'text-primary'
                    )}
                    onClick={() => handleVote(post.id, 'up')}
                  >
                    <ArrowBigUp className={cn(
                      'h-5 w-5',
                      state.upvoted && 'fill-current'
                    )} />
                  </Button>
                  <span className={cn(
                    'text-sm font-semibold',
                    state.upvoted && 'text-primary',
                    state.downvoted && 'text-destructive'
                  )}>
                    {formatCount(getVoteCount(post))}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 w-8 p-0 hover:bg-destructive/10',
                      state.downvoted && 'text-destructive'
                    )}
                    onClick={() => handleVote(post.id, 'down')}
                  >
                    <ArrowBigDown className={cn(
                      'h-5 w-5',
                      state.downvoted && 'fill-current'
                    )} />
                  </Button>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Link 
                        to={`/r/${post.community.toLowerCase()}`}
                        className="font-semibold hover:underline"
                      >
                        r/{post.community}
                      </Link>
                      <span>•</span>
                      <span>Posted by</span>
                      <Link 
                        to={`/u/${post.author.username}`}
                        className="hover:underline"
                      >
                        u/{post.author.username}
                      </Link>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                    <Link to={`/post/${post.id}`}>
                      <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                  </CardHeader>

                  <CardContent className="p-3 pt-0">
                    <div className="flex gap-3">
                      {post.thumbnail && (
                        <img 
                          src={post.thumbnail} 
                          alt="" 
                          className="w-24 h-16 object-cover rounded-md flex-shrink-0"
                        />
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="p-3 pt-0">
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2 text-muted-foreground hover:bg-muted"
                        asChild
                      >
                        <Link to={`/post/${post.id}`}>
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-xs">{post.comments} Comments</span>
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2 text-muted-foreground hover:bg-muted"
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="text-xs hidden sm:inline">Share</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          'gap-2 text-muted-foreground hover:bg-muted',
                          state.bookmarked && 'text-primary'
                        )}
                        onClick={() => handleBookmark(post.id)}
                      >
                        <Bookmark className={cn(
                          'h-4 w-4',
                          state.bookmarked && 'fill-current'
                        )} />
                        <span className="text-xs hidden sm:inline">Save</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto text-muted-foreground hover:bg-muted p-2"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
