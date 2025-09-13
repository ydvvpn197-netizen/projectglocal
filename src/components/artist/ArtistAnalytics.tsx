import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Heart, 
  MessageSquare, 
  Calendar,
  DollarSign,
  Star,
  Activity,
  Target,
  Award,
  Clock,
  MapPin
} from 'lucide-react';
import { ArtistEngagementService, ArtistStats } from '@/services/artistEngagementService';
import { supabase } from '@/integrations/supabase/client';

interface ArtistAnalyticsProps {
  artistId: string;
  isOwnProfile?: boolean;
}

interface AnalyticsData {
  followerGrowth: Array<{ date: string; followers: number; newFollowers: number }>;
  engagementMetrics: Array<{ date: string; likes: number; comments: number; shares: number; views: number }>;
  revenueData: Array<{ date: string; revenue: number; bookings: number; avgBookingValue: number }>;
  topContent: Array<{ id: string; title: string; type: string; engagement: number; revenue?: number }>;
  audienceDemographics: Array<{ ageGroup: string; percentage: number; count: number }>;
  locationData: Array<{ location: string; followers: number; percentage: number }>;
  timeAnalysis: Array<{ hour: number; engagement: number; posts: number }>;
  performanceMetrics: {
    totalRevenue: number;
    avgBookingValue: number;
    conversionRate: number;
    engagementRate: number;
    followerGrowthRate: number;
    topPerformingContent: string;
    bestPostingTime: string;
    mostEngagedLocation: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function ArtistAnalytics({ artistId, isOwnProfile = false }: ArtistAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [artistId, timeRange]);

  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAnalyticsData(artistId, timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [artistId, timeRange]);

  const fetchAnalyticsData = async (artistId: string, range: string): Promise<AnalyticsData> => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch follower growth data
    const followerGrowth = await fetchFollowerGrowth(artistId, startDate);
    
    // Fetch engagement metrics
    const engagementMetrics = await fetchEngagementMetrics(artistId, startDate);
    
    // Fetch revenue data
    const revenueData = await fetchRevenueData(artistId, startDate);
    
    // Fetch top content
    const topContent = await fetchTopContent(artistId);
    
    // Fetch audience demographics
    const audienceDemographics = await fetchAudienceDemographics(artistId);
    
    // Fetch location data
    const locationData = await fetchLocationData(artistId);
    
    // Fetch time analysis
    const timeAnalysis = await fetchTimeAnalysis(artistId);
    
    // Calculate performance metrics
    const performanceMetrics = calculatePerformanceMetrics(
      followerGrowth,
      engagementMetrics,
      revenueData,
      topContent,
      locationData,
      timeAnalysis
    );

    return {
      followerGrowth,
      engagementMetrics,
      revenueData,
      topContent,
      audienceDemographics,
      locationData,
      timeAnalysis,
      performanceMetrics
    };
  };

  const fetchFollowerGrowth = async (artistId: string, startDate: Date) => {
    const { data, error } = await supabase
      .from('artist_followers')
      .select('created_at')
      .eq('artist_id', artistId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date and calculate cumulative followers
    const dailyFollowers = data.reduce((acc: Record<string, number>, follower) => {
      const date = new Date(follower.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const result = [];
    let cumulativeFollowers = 0;
    const currentDate = new Date(startDate);
    const endDate = new Date();

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const newFollowers = dailyFollowers[dateStr] || 0;
      cumulativeFollowers += newFollowers;
      
      result.push({
        date: dateStr,
        followers: cumulativeFollowers,
        newFollowers
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  };

  const fetchEngagementMetrics = async (artistId: string, startDate: Date) => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        created_at,
        likes_count,
        comments_count,
        shares_count,
        views_count
      `)
      .eq('user_id', artistId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const dailyEngagement = data.reduce((acc: Record<string, any>, post) => {
      const date = new Date(post.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { likes: 0, comments: 0, shares: 0, views: 0 };
      }
      acc[date].likes += post.likes_count || 0;
      acc[date].comments += post.comments_count || 0;
      acc[date].shares += post.shares_count || 0;
      acc[date].views += post.views_count || 0;
      return acc;
    }, {});

    return Object.entries(dailyEngagement).map(([date, metrics]) => ({
      date,
      ...metrics
    }));
  };

  const fetchRevenueData = async (artistId: string, startDate: Date) => {
    const { data, error } = await supabase
      .from('service_bookings')
      .select(`
        created_at,
        total_amount,
        status
      `)
      .eq('provider_id', artistId)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const dailyRevenue = data.reduce((acc: Record<string, any>, booking) => {
      const date = new Date(booking.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { revenue: 0, bookings: 0, totalAmount: 0 };
      }
      acc[date].revenue += booking.total_amount;
      acc[date].bookings += 1;
      acc[date].totalAmount += booking.total_amount;
      return acc;
    }, {});

    return Object.entries(dailyRevenue).map(([date, data]) => ({
      date,
      revenue: data.revenue / 100, // Convert from cents
      bookings: data.bookings,
      avgBookingValue: data.totalAmount / data.bookings / 100
    }));
  };

  const fetchTopContent = async (artistId: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        type,
        likes_count,
        comments_count,
        shares_count,
        views_count
      `)
      .eq('user_id', artistId)
      .order('likes_count', { ascending: false })
      .limit(10);

    if (error) throw error;

    return data.map(post => ({
      id: post.id,
      title: post.title || 'Untitled',
      type: post.type,
      engagement: (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0),
      revenue: 0 // Could be calculated from associated bookings
    }));
  };

  const fetchAudienceDemographics = async (artistId: string) => {
    // This would typically come from user profile data
    // For now, we'll return mock data
    return [
      { ageGroup: '18-24', percentage: 35, count: 120 },
      { ageGroup: '25-34', percentage: 40, count: 140 },
      { ageGroup: '35-44', percentage: 20, count: 70 },
      { ageGroup: '45+', percentage: 5, count: 18 }
    ];
  };

  const fetchLocationData = async (artistId: string) => {
    const { data, error } = await supabase
      .from('artist_followers')
      .select(`
        profiles!artist_followers_follower_id_fkey(location_city, location_state)
      `)
      .eq('artist_id', artistId);

    if (error) throw error;

    const locationCounts = data.reduce((acc: Record<string, number>, follower) => {
      const location = follower.profiles?.location_city || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(locationCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(locationCounts)
      .map(([location, count]) => ({
        location,
        followers: count,
        percentage: (count / total) * 100
      }))
      .sort((a, b) => b.followers - a.followers)
      .slice(0, 10);
  };

  const fetchTimeAnalysis = async (artistId: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('created_at, likes_count, comments_count, shares_count')
      .eq('user_id', artistId);

    if (error) throw error;

    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      engagement: 0,
      posts: 0
    }));

    data.forEach(post => {
      const hour = new Date(post.created_at).getHours();
      hourlyData[hour].posts += 1;
      hourlyData[hour].engagement += (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0);
    });

    return hourlyData;
  };

  const calculatePerformanceMetrics = (
    followerGrowth: any[],
    engagementMetrics: any[],
    revenueData: any[],
    topContent: any[],
    locationData: any[],
    timeAnalysis: any[]
  ) => {
    const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
    const totalBookings = revenueData.reduce((sum, day) => sum + day.bookings, 0);
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    
    const totalEngagement = engagementMetrics.reduce((sum, day) => 
      sum + day.likes + day.comments + day.shares, 0);
    const totalViews = engagementMetrics.reduce((sum, day) => sum + day.views, 0);
    const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;
    
    const followerGrowthRate = followerGrowth.length > 1 
      ? ((followerGrowth[followerGrowth.length - 1].followers - followerGrowth[0].followers) / followerGrowth[0].followers) * 100
      : 0;
    
    const topPerformingContent = topContent[0]?.title || 'No content yet';
    const bestPostingTime = timeAnalysis.reduce((best, current) => 
      current.engagement > best.engagement ? current : best
    ).hour + ':00';
    const mostEngagedLocation = locationData[0]?.location || 'Unknown';

    return {
      totalRevenue,
      avgBookingValue,
      conversionRate: 0, // Would need more data to calculate
      engagementRate,
      followerGrowthRate,
      topPerformingContent,
      bestPostingTime,
      mostEngagedLocation
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">No analytics data available</div>
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
          <p className="text-muted-foreground">Track your performance and growth</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{analyticsData.performanceMetrics.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+12.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">{analyticsData.performanceMetrics.engagementRate.toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+8.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Follower Growth</p>
                <p className="text-2xl font-bold">{analyticsData.performanceMetrics.followerGrowthRate.toFixed(1)}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+15.3%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Booking Value</p>
                <p className="text-2xl font-bold">₹{analyticsData.performanceMetrics.avgBookingValue.toFixed(2)}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+5.7%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Follower Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Follower Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.followerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="followers" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Content */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topContent.slice(0, 5).map((content, index) => (
                    <div key={content.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{content.title}</p>
                          <p className="text-sm text-muted-foreground">{content.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{content.engagement}</p>
                        <p className="text-sm text-muted-foreground">engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.engagementMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="likes" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="comments" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="shares" stroke="#ffc658" strokeWidth={2} />
                  <Line type="monotone" dataKey="views" stroke="#ff7300" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="bookings" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="avgBookingValue" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.audienceDemographics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ ageGroup, percentage }) => `${ageGroup}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {analyticsData.audienceDemographics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.locationData.map((location, index) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{location.location}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{location.followers}</p>
                        <p className="text-sm text-muted-foreground">{location.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Best Posting Times</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.timeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="engagement" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
