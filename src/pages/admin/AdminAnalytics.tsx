import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Clock,
  Shield,
  Flag,
  MessageSquare,
  FileText,
  Eye,
  Heart,
  Share2,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminService } from '@/services/adminService';

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    new: number;
    suspended: number;
    banned: number;
    growth: number;
    retention: {
      day1: number;
      day7: number;
      day30: number;
    };
  };
  content: {
    total: number;
    posts: number;
    events: number;
    reviews: number;
    growth: number;
    engagement: {
      likes: number;
      comments: number;
      shares: number;
    };
  };
  moderation: {
    totalActions: number;
    pendingReports: number;
    resolvedReports: number;
    averageResponseTime: number;
    actionsByType: Record<string, number>;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeUsers: number;
    peakConcurrency: number;
  };
  trends: {
    userGrowth: Array<{ date: string; count: number }>;
    contentGrowth: Array<{ date: string; count: number }>;
    engagementTrend: Array<{ date: string; engagement: number }>;
  };
}

const AdminAnalytics: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const adminService = useMemo(() => new AdminService(), []);
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, loadAnalytics]);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API calls
      const mockData: AnalyticsData = {
        users: {
          total: 1250,
          active: 890,
          new: 45,
          suspended: 12,
          banned: 3,
          growth: 12.5,
          retention: {
            day1: 65.2,
            day7: 42.1,
            day30: 28.7
          }
        },
        content: {
          total: 3456,
          posts: 2345,
          events: 567,
          reviews: 544,
          growth: 8.3,
          engagement: {
            likes: 12500,
            comments: 3400,
            shares: 890
          }
        },
        moderation: {
          totalActions: 156,
          pendingReports: 23,
          resolvedReports: 133,
          averageResponseTime: 2.4,
          actionsByType: {
            warnings: 45,
            suspensions: 12,
            bans: 3,
            content_removal: 67,
            account_restrictions: 29
          }
        },
        system: {
          uptime: 99.9,
          responseTime: 150,
          errorRate: 0.1,
          activeUsers: 234,
          peakConcurrency: 450
        },
        trends: {
          userGrowth: [
            { date: '2024-01-01', count: 1000 },
            { date: '2024-01-08', count: 1050 },
            { date: '2024-01-15', count: 1100 },
            { date: '2024-01-22', count: 1200 },
            { date: '2024-01-29', count: 1250 }
          ],
          contentGrowth: [
            { date: '2024-01-01', count: 3000 },
            { date: '2024-01-08', count: 3100 },
            { date: '2024-01-15', count: 3200 },
            { date: '2024-01-22', count: 3300 },
            { date: '2024-01-29', count: 3456 }
          ],
          engagementTrend: [
            { date: '2024-01-01', engagement: 65 },
            { date: '2024-01-08', engagement: 68 },
            { date: '2024-01-15', engagement: 72 },
            { date: '2024-01-22', engagement: 70 },
            { date: '2024-01-29', engagement: 75 }
          ]
        }
      };
      
      setAnalytics(mockData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error || 'Failed to load analytics data'}</p>
            <Button onClick={loadAnalytics} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminAuthGuard requiredPermission="analytics:view">
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Comprehensive insights into platform performance and user behavior</p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.users.total.toLocaleString()}</div>
                    <div className="flex items-center space-x-1 text-xs">
                      {getGrowthIcon(analytics.users.growth)}
                      <span className={getGrowthColor(analytics.users.growth)}>
                        +{analytics.users.growth}% from last period
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.users.active.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {((analytics.users.active / analytics.users.total) * 100).toFixed(1)}% of total users
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.content.total.toLocaleString()}</div>
                    <div className="flex items-center space-x-1 text-xs">
                      {getGrowthIcon(analytics.content.growth)}
                      <span className={getGrowthColor(analytics.content.growth)}>
                        +{analytics.content.growth}% from last period
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.system.uptime}%</div>
                    <p className="text-xs text-muted-foreground">
                      Last 30 days
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Metrics</CardTitle>
                    <CardDescription>User interaction with content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Likes</span>
                      </div>
                      <span className="text-sm font-bold">{analytics.content.engagement.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Comments</span>
                      </div>
                      <span className="text-sm font-bold">{analytics.content.engagement.comments.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Share2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Shares</span>
                      </div>
                      <span className="text-sm font-bold">{analytics.content.engagement.shares.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Retention</CardTitle>
                    <CardDescription>User retention rates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Day 1</span>
                      <span className="text-sm font-bold">{analytics.users.retention.day1}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Day 7</span>
                      <span className="text-sm font-bold">{analytics.users.retention.day7}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Day 30</span>
                      <span className="text-sm font-bold">{analytics.users.retention.day30}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Moderation Activity</CardTitle>
                    <CardDescription>Recent moderation actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Total Actions</span>
                      </div>
                      <span className="text-sm font-bold">{analytics.moderation.totalActions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Flag className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Pending Reports</span>
                      </div>
                      <span className="text-sm font-bold">{analytics.moderation.pendingReports}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Avg Response</span>
                      </div>
                      <span className="text-sm font-bold">{analytics.moderation.averageResponseTime}h</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>Breakdown of user types and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Active Users</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.users.active}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Suspended</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.users.suspended}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <UserX className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">Banned</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.users.banned}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">New This Period</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.users.new}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Growth Trend</CardTitle>
                    <CardDescription>User growth over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                        <p>Chart visualization would go here</p>
                        <p className="text-sm">Showing {analytics.trends.userGrowth.length} data points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Distribution</CardTitle>
                    <CardDescription>Breakdown by content type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Posts</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.content.posts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Events</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.content.events}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Reviews</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.content.reviews}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Trend</CardTitle>
                    <CardDescription>User engagement over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 mx-auto mb-2" />
                        <p>Engagement chart would go here</p>
                        <p className="text-sm">Average engagement: 70%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="moderation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Moderation Actions</CardTitle>
                    <CardDescription>Actions taken by moderators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.moderation.actionsByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {type.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Report Status</CardTitle>
                    <CardDescription>Content report resolution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">Pending</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.moderation.pendingReports}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Resolved</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.moderation.resolvedReports}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Avg Response Time</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.moderation.averageResponseTime}h</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Performance</CardTitle>
                    <CardDescription>Platform performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Uptime</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.system.uptime}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Response Time</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.system.responseTime}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">Error Rate</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.system.errorRate}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Active Users</span>
                        </div>
                        <span className="text-sm font-bold">{analytics.system.activeUsers}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Overall system status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Database</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">API Services</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Storage</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">CDN</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
};

export default AdminAnalytics;
