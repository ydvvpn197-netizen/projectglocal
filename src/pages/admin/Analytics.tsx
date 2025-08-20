import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Calendar, 
  MessageSquare,
  Eye,
  Heart,
  Share,
  Download,
  Calendar as CalendarIcon,
  Activity,
  Target,
  PieChart,
  LineChart
} from 'lucide-react';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminService } from '@/services/adminService';
import { AnalyticsFilters, UserAnalytics, ContentAnalytics, PlatformMetrics } from '@/types/admin';

const Analytics: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const adminService = new AdminService();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: '30d',
    startDate: '',
    endDate: '',
    groupBy: 'day'
  });
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics | null>(null);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load user analytics
      const userData = await adminService.getUserAnalytics(filters);
      setUserAnalytics(userData);
      
      // Load content analytics
      const contentData = await adminService.getContentAnalytics(filters);
      setContentAnalytics(contentData);
      
      // Load platform metrics
      const metricsData = await adminService.getPlatformMetrics(filters);
      setPlatformMetrics(metricsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AnalyticsFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (rate < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AdminAuthGuard requiredPermission="analytics:view">
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive platform insights and performance metrics</p>
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Time Range:</span>
                </div>
                <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
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
                
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Group By:</span>
                </div>
                <Select value={filters.groupBy} onValueChange={(value) => handleFilterChange('groupBy', value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Hour</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
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
                    <div className="text-2xl font-bold">
                      {formatNumber(userAnalytics?.totalUsers || 0)}
                    </div>
                    {userAnalytics && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {getGrowthIcon(getGrowthRate(userAnalytics.newUsers, userAnalytics.previousPeriodUsers))}
                        <span className={getGrowthColor(getGrowthRate(userAnalytics.newUsers, userAnalytics.previousPeriodUsers))}>
                          {formatPercentage(getGrowthRate(userAnalytics.newUsers, userAnalytics.previousPeriodUsers))}
                        </span>
                        <span>from last period</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(userAnalytics?.activeUsers || 0)}
                    </div>
                    {userAnalytics && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Engagement rate:</span>
                        <span className="font-medium">
                          {formatPercentage((userAnalytics.activeUsers / userAnalytics.totalUsers) * 100)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(contentAnalytics?.totalContent || 0)}
                    </div>
                    {contentAnalytics && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {getGrowthIcon(getGrowthRate(contentAnalytics.newContent, contentAnalytics.previousPeriodContent))}
                        <span className={getGrowthColor(getGrowthRate(contentAnalytics.newContent, contentAnalytics.previousPeriodContent))}>
                          {formatPercentage(getGrowthRate(contentAnalytics.newContent, contentAnalytics.previousPeriodContent))}
                        </span>
                        <span>from last period</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatPercentage(platformMetrics?.engagementRate || 0)}
                    </div>
                    {platformMetrics && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Avg. session duration:</span>
                        <span className="font-medium">
                          {Math.round(platformMetrics.avgSessionDuration || 0)}m
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>Daily active users over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <LineChart className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Chart would be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Distribution</CardTitle>
                    <CardDescription>Content types breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <PieChart className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Chart would be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Demographics</CardTitle>
                    <CardDescription>User distribution by location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Users with location</span>
                        <span className="text-sm font-medium">
                          {formatPercentage(userAnalytics?.usersWithLocation || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">New registrations</span>
                        <span className="text-sm font-medium">
                          {formatNumber(userAnalytics?.newUsers || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Verified users</span>
                        <span className="text-sm font-medium">
                          {formatPercentage(userAnalytics?.verifiedUsers || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Activity</CardTitle>
                    <CardDescription>User engagement metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Daily active users</span>
                        <span className="text-sm font-medium">
                          {formatNumber(userAnalytics?.dailyActiveUsers || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Weekly active users</span>
                        <span className="text-sm font-medium">
                          {formatNumber(userAnalytics?.weeklyActiveUsers || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Monthly active users</span>
                        <span className="text-sm font-medium">
                          {formatNumber(userAnalytics?.monthlyActiveUsers || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Retention</CardTitle>
                    <CardDescription>User retention rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Day 1 retention</span>
                        <span className="text-sm font-medium">
                          {formatPercentage(userAnalytics?.day1Retention || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Day 7 retention</span>
                        <span className="text-sm font-medium">
                          {formatPercentage(userAnalytics?.day7Retention || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Day 30 retention</span>
                        <span className="text-sm font-medium">
                          {formatPercentage(userAnalytics?.day30Retention || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Types</CardTitle>
                    <CardDescription>Content distribution by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Posts</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatNumber(contentAnalytics?.posts || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Events</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatNumber(contentAnalytics?.events || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">Reviews</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatNumber(contentAnalytics?.reviews || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Performance</CardTitle>
                    <CardDescription>Content engagement metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avg. views per post</span>
                        <span className="text-sm font-medium">
                          {Math.round(contentAnalytics?.avgViewsPerPost || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avg. likes per post</span>
                        <span className="text-sm font-medium">
                          {Math.round(contentAnalytics?.avgLikesPerPost || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avg. comments per post</span>
                        <span className="text-sm font-medium">
                          {Math.round(contentAnalytics?.avgCommentsPerPost || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Quality</CardTitle>
                    <CardDescription>Content quality metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Reported content</span>
                        <span className="text-sm font-medium">
                          {formatNumber(contentAnalytics?.reportedContent || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Removed content</span>
                        <span className="text-sm font-medium">
                          {formatNumber(contentAnalytics?.removedContent || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Content approval rate</span>
                        <span className="text-sm font-medium">
                          {formatPercentage(contentAnalytics?.contentApprovalRate || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Metrics</CardTitle>
                    <CardDescription>User interaction statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Total views</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatNumber(platformMetrics?.totalViews || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Total likes</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatNumber(platformMetrics?.totalLikes || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Share className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Total shares</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatNumber(platformMetrics?.totalShares || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Session Analytics</CardTitle>
                    <CardDescription>User session metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avg. session duration</span>
                        <span className="text-sm font-medium">
                          {Math.round(platformMetrics?.avgSessionDuration || 0)}m
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pages per session</span>
                        <span className="text-sm font-medium">
                          {Math.round(platformMetrics?.pagesPerSession || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Bounce rate</span>
                        <span className="text-sm font-medium">
                          {formatPercentage(platformMetrics?.bounceRate || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Health</CardTitle>
                    <CardDescription>System performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Uptime</span>
                        <span className="text-sm font-medium">
                          {formatPercentage(platformMetrics?.uptime || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avg. response time</span>
                        <span className="text-sm font-medium">
                          {Math.round(platformMetrics?.avgResponseTime || 0)}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Error rate</span>
                        <span className="text-sm font-medium">
                          {formatPercentage(platformMetrics?.errorRate || 0)}
                        </span>
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

export default Analytics;
