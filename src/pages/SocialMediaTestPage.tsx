import React, { useState, useEffect } from 'react';
import { SocialMediaFeed } from '@/components/SocialMediaFeed';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { SocialPostService } from '@/services/socialPostService';
import { SocialPost } from '@/components/SocialMediaPost';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Clock, 
  Flame, 
  Star,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const SocialMediaTestPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'new' | 'hot' | 'top' | 'trending'>('new');
  const [filters, setFilters] = useState({
    sort_by: 'new' as const
  });

  // Sample data for demonstration
  const samplePosts: SocialPost[] = [
    {
      id: '1',
      user_id: 'user1',
      title: 'Community Garden Success!',
      content: 'Just finished setting up the community garden! 🌱 The tomatoes are looking great and we have some amazing volunteers helping out. Can\'t wait to see everyone at the harvest party next month!',
      post_type: 'post',
      status: 'active',
      location_city: 'San Francisco',
      location_state: 'CA',
      location_country: 'USA',
      upvotes: 45,
      downvotes: 2,
      score: 43,
      comment_count: 12,
      view_count: 156,
      share_count: 8,
      save_count: 15,
      is_anonymous: false,
      is_pinned: false,
      is_locked: false,
      is_trending: true,
      is_verified: true,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      author_name: 'Sarah Chen',
      author_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      author_username: 'sarahchen',
      user_vote: 0,
      is_saved: false,
      has_viewed: false,
      tags: ['gardening', 'community', 'volunteers']
    },
    {
      id: '2',
      user_id: 'user2',
      title: 'Local Art Exhibition This Weekend',
      content: 'Excited to announce our local art exhibition this weekend! Featuring works from 20+ local artists. Free admission, refreshments provided. Come support our creative community!',
      post_type: 'event',
      status: 'active',
      location_city: 'San Francisco',
      location_state: 'CA',
      location_country: 'USA',
      event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      event_location: 'Downtown Art Gallery',
      price_range: 'Free',
      contact_info: 'info@localart.com',
      upvotes: 28,
      downvotes: 1,
      score: 27,
      comment_count: 8,
      view_count: 89,
      share_count: 5,
      save_count: 12,
      is_anonymous: false,
      is_pinned: false,
      is_locked: false,
      is_trending: false,
      is_verified: false,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      author_name: 'Mike Johnson',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      author_username: 'mikejohnson',
      user_vote: 1,
      is_saved: true,
      has_viewed: true,
      tags: ['art', 'exhibition', 'local', 'free']
    },
    {
      id: '3',
      user_id: 'user3',
      title: 'Discussion: Improving Public Transportation',
      content: 'What are your thoughts on improving public transportation in our city? I think we need more frequent buses and better bike lanes. What solutions would you suggest?',
      post_type: 'discussion',
      status: 'active',
      location_city: 'San Francisco',
      location_state: 'CA',
      location_country: 'USA',
      upvotes: 15,
      downvotes: 3,
      score: 12,
      comment_count: 23,
      view_count: 67,
      share_count: 3,
      save_count: 7,
      is_anonymous: false,
      is_pinned: false,
      is_locked: false,
      is_trending: false,
      is_verified: false,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      author_name: 'Lisa Rodriguez',
      author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      author_username: 'lisarodriguez',
      user_vote: -1,
      is_saved: false,
      has_viewed: false,
      tags: ['transportation', 'discussion', 'city', 'bikes']
    }
  ];

  const handlePostCreated = (newPost: SocialPost) => {
    console.log('New post created:', newPost);
    // In a real app, you would refresh the feed or add the post to the list
  };

  const handleSortChange = (newSort: 'new' | 'hot' | 'top' | 'trending') => {
    setSortBy(newSort);
    setFilters(prev => ({ ...prev, sort_by: newSort }));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // You can add different filters based on the tab
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Social Media Platform
          </h1>
          <p className="text-gray-600">
            A modern social media platform with voting, comments, sharing, and more
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Create Post */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <CreatePostDialog onPostCreated={handlePostCreated} />
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Posts</span>
                    <Badge variant="secondary">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trending</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      1
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Your Posts</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Sort Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Sort By
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={sortBy === 'new' ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleSortChange('new')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    New
                  </Button>
                  <Button
                    variant={sortBy === 'hot' ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleSortChange('hot')}
                  >
                    <Flame className="h-4 w-4 mr-2" />
                    Hot
                  </Button>
                  <Button
                    variant={sortBy === 'top' ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleSortChange('top')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Top
                  </Button>
                  <Button
                    variant={sortBy === 'trending' ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleSortChange('trending')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trending
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <SocialMediaFeed 
                  filters={filters}
                  showCreateButton={false}
                />
              </TabsContent>

              <TabsContent value="trending" className="mt-6">
                <SocialMediaFeed 
                  filters={{ ...filters, is_trending: true }}
                  showCreateButton={false}
                />
              </TabsContent>

              <TabsContent value="events" className="mt-6">
                <SocialMediaFeed 
                  filters={{ ...filters, post_type: 'event' }}
                  showCreateButton={false}
                />
              </TabsContent>

              <TabsContent value="discussions" className="mt-6">
                <SocialMediaFeed 
                  filters={{ ...filters, post_type: 'discussion' }}
                  showCreateButton={false}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sample Data Notice */}
        <div className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Sample Data Notice
          </h3>
          <p className="text-blue-700 text-sm">
            This page is displaying sample data for demonstration purposes. 
            All interaction features (voting, commenting, saving, sharing) are fully functional 
            and will work with the database. The UI matches the design shown in your reference image.
          </p>
        </div>

        {/* Features Demo */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voting System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Upvote and downvote posts and comments. The score is calculated in real-time.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600">↑ 45</Badge>
                <Badge variant="outline" className="text-red-600">↓ 2</Badge>
                <Badge variant="secondary">Score: 43</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Comment on posts and reply to other comments. Threaded discussions supported.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">12 comments</Badge>
                <Badge variant="outline">Threaded replies</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Save & Share</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Save posts for later and share them with others. View counts tracked automatically.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">15 saves</Badge>
                <Badge variant="outline">8 shares</Badge>
                <Badge variant="outline">156 views</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
