import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Heart, 
  MessageCircle, 
  Eye, 
  Calendar,
  Star,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFollowing } from '@/hooks/useFollowing';

interface AnalyticsData {
  engagement: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalViews: number;
    engagementRate: number;
    growthRate: number;
  };
  followers: {
    total: number;
    newThisMonth: number;
    growthRate: number;
    topCountries: Array<{ country: string; count: number }>;
    demographics: {
      ageGroups: Array<{ age: string; percentage: number }>;
      genders: Array<{ gender: string; percentage: number }>;
    };
  };
  content: {
    totalPosts: number;
    postsThisMonth: number;
    averageLikes: number;
    averageComments: number;
    topPerformingPosts: Array<{
      id: string;
      title: string;
      likes: number;
      comments: number;
      views: number;
      date: string;
    }>;
  };
  activity: {
    dailyActivity: Array<{ date: string; posts: number; likes: number; comments: number }>;
    weeklyActivity: Array<{ week: string; posts: number; engagement: number }>;
    monthlyActivity: Array<{ month: string; posts: number; followers: number }>;
  };
  insights: {
    bestPostingTimes: Array<{ hour: number; engagement: number }>;
    topInterests: Array<{ interest: string; count: number }>;
    recommendations: Array<{ type: string; message: string; priority: 'high' | 'medium' | 'low' }>;
  };
}

export const UserAnalytics = () => {
  const { user } = useAuth();
  const { followStats } = useFollowing();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock analytics data - in real app, this would come from API
      const mockAnalytics: AnalyticsData = {
        engagement: {
          totalLikes: 1250,
          totalComments: 340,
          totalShares: 89,
          totalViews: 15600,
          engagementRate: 4.2,
          growthRate: 12.5
        },
        followers: {
          total: followStats?.totalFollowers || 450,
          newThisMonth: 67,
          growthRate: 17.5,
          topCountries: [
            { country: 'United States', count: 320 },
            { country: 'Canada', count: 89 },
            { country: 'United Kingdom', count: 41 }
          ],
          demographics: {
            ageGroups: [
              { age: '18-24', percentage: 25 },
              { age: '25-34', percentage: 40 },
              { age: '35-44', percentage: 25 },
              { age: '45+', percentage: 10 }
            ],
            genders: [
              { gender: 'Female', percentage: 55 },
              { gender: 'Male', percentage: 40 },
              { gender: 'Other', percentage: 5 }
            ]
          }
        },
        content: {
          totalPosts: 89,
          postsThisMonth: 12,
          averageLikes: 14.2,
          averageComments: 3.8,
          topPerformingPosts: [
            {
              id: '1',
              title: 'Local Community Event',
              likes: 45,
              comments: 12,
              views: 320,
              date: '2024-01-15'
            },
            {
              id: '2',
              title: 'Art Exhibition Opening',
              likes: 38,
              comments: 8,
              views: 280,
              date: '2024-01-12'
            }
          ]
        },
        activity: {
          dailyActivity: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            posts: Math.floor(Math.random() * 3),
            likes: Math.floor(Math.random() * 20),
            comments: Math.floor(Math.random() * 8)
          })),
          weeklyActivity: Array.from({ length: 12 }, (_, i) => ({
            week: `Week ${i + 1}`,
            posts: Math.floor(Math.random() * 10) + 5,
            engagement: Math.floor(Math.random() * 100) + 50
          })),
          monthlyActivity: Array.from({ length: 6 }, (_, i) => ({
            month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
            posts: Math.floor(Math.random() * 20) + 10,
            followers: Math.floor(Math.random() * 50) + 20
          }))
        },
        insights: {
          bestPostingTimes: [
            { hour: 9, engagement: 85 },
            { hour: 14, engagement: 92 },
            { hour: 19, engagement: 78 },
            { hour: 21, engagement: 88 }
          ],
          topInterests: [
            { interest: 'Community', count: 45 },
            { interest: 'Art', count: 32 },
            { interest: 'Events', count: 28 },
            { interest: 'Local News', count: 25 }
          ],
          recommendations: [
            {
              type: 'engagement',
              message: 'Post more content during peak hours (2-3 PM) to increase engagement',
              priority: 'high'
            },
            {
              type: 'content',
              message: 'Create more video content - your video posts get 40% more engagement',
              priority: 'medium'
            },
            {
              type: 'community',
              message: 'Engage with your followers more often to build stronger relationships',
              priority: 'low'
            }
          ]
        }
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No analytics data available</p>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive insights into your community engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Followers</p>
                <p className="text-2xl font-bold">{analytics.followers.total.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+{analytics.followers.growthRate}%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">{analytics.engagement.engagementRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+{analytics.engagement.growthRate}%</span>
                </div>
              </div>
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{analytics.engagement.totalViews.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+8.2%</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Posts This Month</p>
                <p className="text-2xl font-bold">{analytics.content.postsThisMonth}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+15.3%</span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Your content performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Likes</span>
                  <span className="font-bold">{analytics.engagement.totalLikes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Comments</span>
                  <span className="font-bold">{analytics.engagement.totalComments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Shares</span>
                  <span className="font-bold">{analytics.engagement.totalShares.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Likes per Post</span>
                  <span className="font-bold">{analytics.content.averageLikes}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Posts</CardTitle>
                <CardDescription>Your best content this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.content.topPerformingPosts.map((post, index) => (
                  <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium truncate">{post.title}</h4>
                      <p className="text-sm text-muted-foreground">{post.date}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="followers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Follower Demographics</CardTitle>
                <CardDescription>Age and gender distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Age Groups</h4>
                  {analytics.followers.demographics.ageGroups.map((group, index) => (
                    <div key={index} className="flex items-center justify-between mb-2">
                      <span className="text-sm">{group.age}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${group.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{group.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
                <CardDescription>Where your followers are located</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.followers.topCountries.map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{country.country}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(country.count / analytics.followers.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{country.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>Your posting activity and engagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Posts</span>
                  <span className="font-bold">{analytics.content.totalPosts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Posts This Month</span>
                  <span className="font-bold">{analytics.content.postsThisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Likes</span>
                  <span className="font-bold">{analytics.content.averageLikes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Comments</span>
                  <span className="font-bold">{analytics.content.averageComments}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Interests</CardTitle>
                <CardDescription>What your audience is interested in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.insights.topInterests.map((interest, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{interest.interest}</span>
                    <Badge variant="secondary">{interest.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Best Posting Times</CardTitle>
                <CardDescription>When your audience is most active</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.insights.bestPostingTimes.map((time, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{time.hour}:00</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${time.engagement}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{time.engagement}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Tips to improve your engagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.insights.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start gap-2">
                      <Badge 
                        variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {rec.priority}
                      </Badge>
                      <p className="text-sm">{rec.message}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserAnalytics;
