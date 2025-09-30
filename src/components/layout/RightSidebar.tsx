/**
 * Right Sidebar Component - Reddit-inspired
 * Shows recent posts, trending topics, and community info
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowRight,
  Flame,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentPost {
  id: string;
  title: string;
  community: string;
  upvotes: number;
  comments: number;
  thumbnail?: string;
}

interface TrendingTopic {
  id: string;
  name: string;
  posts: number;
}

interface RightSidebarProps {
  className?: string;
  showRecentPosts?: boolean;
  showTrending?: boolean;
  showCommunityInfo?: boolean;
}

const MOCK_RECENT_POSTS: RecentPost[] = [
  {
    id: '1',
    title: 'Community meetup this weekend',
    community: 'Local Events',
    upvotes: 596,
    comments: 185,
  },
  {
    id: '2',
    title: 'New local business opening downtown',
    community: 'Local News',
    upvotes: 342,
    comments: 89,
  },
  {
    id: '3',
    title: 'Looking for volunteers for park cleanup',
    community: 'Community',
    upvotes: 234,
    comments: 67,
  },
];

const MOCK_TRENDING: TrendingTopic[] = [
  { id: '1', name: 'Local Events', posts: 1234 },
  { id: '2', name: 'Community News', posts: 987 },
  { id: '3', name: 'Public Square', posts: 756 },
  { id: '4', name: 'Artist Marketplace', posts: 543 },
  { id: '5', name: 'Civic Engagement', posts: 432 },
];

export const RightSidebar: React.FC<RightSidebarProps> = ({
  className,
  showRecentPosts = true,
  showTrending = true,
  showCommunityInfo = true,
}) => {
  return (
    <aside className={cn('space-y-4', className)}>
      {/* Recent Posts */}
      {showRecentPosts && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Posts
              </CardTitle>
              <Button variant="link" size="sm" asChild className="h-auto p-0">
                <Link to="/recent" className="text-xs">
                  Clear
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {MOCK_RECENT_POSTS.map((post, index) => (
              <div key={post.id}>
                {index > 0 && <Separator className="my-3" />}
                <Link 
                  to={`/post/${post.id}`}
                  className="block group"
                >
                  <div className="space-y-1">
                    <div className="flex items-start gap-2">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          r/{post.community}
                        </p>
                        <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{post.upvotes} upvotes</span>
                          <span>•</span>
                          <span>{post.comments} comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Trending Topics */}
      {showTrending && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Trending Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {MOCK_TRENDING.map((topic, index) => (
              <Link
                key={topic.id}
                to={`/r/${topic.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-muted-foreground w-4">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {topic.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topic.posts.toLocaleString()} posts
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Community Info */}
      {showCommunityInfo && (
        <Card className="border-border bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Welcome to TheGlocal
            </CardTitle>
            <CardDescription className="text-sm">
              Your privacy-first digital public square for local communities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Members</span>
                <span className="font-semibold">12.4K</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Online</span>
                <span className="font-semibold flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  1.2K
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active Events</span>
                <span className="font-semibold">34</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Button className="w-full" size="sm" asChild>
                <Link to="/create">
                  Create Post
                </Link>
              </Button>
              <Button className="w-full" size="sm" variant="outline" asChild>
                <Link to="/communities">
                  Explore Communities
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules / Guidelines */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Community Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>1. Be respectful and kind</p>
            <p>2. No spam or self-promotion</p>
            <p>3. Keep content relevant to local community</p>
            <p>4. Respect privacy and anonymity</p>
            <p>5. Report violations to moderators</p>
          </div>
          <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs">
            <Link to="/guidelines">
              See full guidelines
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Footer Links */}
      <div className="px-4 py-3 text-xs text-muted-foreground space-y-2">
        <div className="flex flex-wrap gap-2">
          <Link to="/about" className="hover:underline">About</Link>
          <span>•</span>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:underline">Terms</Link>
          <span>•</span>
          <Link to="/help" className="hover:underline">Help</Link>
        </div>
        <p className="text-[10px]">
          © 2025 TheGlocal. All rights reserved.
        </p>
      </div>
    </aside>
  );
};
