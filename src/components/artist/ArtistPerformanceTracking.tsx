import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  Calendar,
  DollarSign,
  Users,
  Star,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Trophy,
  Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceTrackingProps {
  artistId: string;
  isOwnProfile?: boolean;
}

interface PerformanceMetrics {
  revenue: {
    current: number;
    target: number;
    growth: number;
    monthlyTrend: Array<{ month: string; revenue: number; target: number }>;
  };
  bookings: {
    current: number;
    target: number;
    growth: number;
    conversionRate: number;
    monthlyTrend: Array<{ month: string; bookings: number; target: number }>;
  };
  engagement: {
    current: number;
    target: number;
    growth: number;
    engagementRate: number;
    monthlyTrend: Array<{ month: string; engagement: number; target: number }>;
  };
  followers: {
    current: number;
    target: number;
    growth: number;
    monthlyTrend: Array<{ month: string; followers: number; target: number }>;
  };
  goals: Array<{
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    deadline: string;
    status: 'on_track' | 'behind' | 'completed' | 'overdue';
    category: 'revenue' | 'followers' | 'engagement' | 'bookings';
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
    category: 'revenue' | 'followers' | 'engagement' | 'bookings' | 'milestone';
  }>;
  insights: Array<{
    id: string;
    title: string;
    description: string;
    type: 'positive' | 'warning' | 'suggestion';
    impact: 'high' | 'medium' | 'low';
  }>;
}

export function ArtistPerformanceTracking({ artistId, isOwnProfile = false }: PerformanceTrackingProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPerformanceData();
  }, [artistId]);

  const loadPerformanceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPerformanceData(artistId);
      setPerformanceData(data);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [artistId]);

  const fetchPerformanceData = async (artistId: string): Promise<PerformanceMetrics> => {
    // Fetch current metrics
    const currentMetrics = await fetchCurrentMetrics(artistId);
    
    // Fetch goals
    const goals = await fetchGoals(artistId);
    
    // Fetch achievements
    const achievements = await fetchAchievements(artistId);
    
    // Generate insights
    const insights = generateInsights(currentMetrics, goals);
    
    // Generate monthly trends (mock data for now)
    const monthlyTrend = generateMonthlyTrends();

    return {
      revenue: {
        current: currentMetrics.revenue,
        target: goals.find(g => g.category === 'revenue')?.target || 0,
        growth: 15.2,
        monthlyTrend: monthlyTrend.revenue
      },
      bookings: {
        current: currentMetrics.bookings,
        target: goals.find(g => g.category === 'bookings')?.target || 0,
        growth: 8.7,
        conversionRate: 12.5,
        monthlyTrend: monthlyTrend.bookings
      },
      engagement: {
        current: currentMetrics.engagement,
        target: goals.find(g => g.category === 'engagement')?.target || 0,
        growth: 22.1,
        engagementRate: 8.3,
        monthlyTrend: monthlyTrend.engagement
      },
      followers: {
        current: currentMetrics.followers,
        target: goals.find(g => g.category === 'followers')?.target || 0,
        growth: 18.5,
        monthlyTrend: monthlyTrend.followers
      },
      goals,
      achievements,
      insights
    };
  };

  const fetchCurrentMetrics = async (artistId: string) => {
    // Fetch current month revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: revenueData } = await supabase
      .from('service_bookings')
      .select('total_amount')
      .eq('provider_id', artistId)
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString());

    const revenue = revenueData?.reduce((sum, booking) => sum + booking.total_amount, 0) / 100 || 0;

    // Fetch current month bookings
    const { count: bookingsCount } = await supabase
      .from('service_bookings')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', artistId)
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString());

    // Fetch current followers
    const { count: followersCount } = await supabase
      .from('artist_followers')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', artistId);

    // Fetch current engagement (likes + comments + shares)
    const { data: engagementData } = await supabase
      .from('posts')
      .select('likes_count, comments_count, shares_count')
      .eq('user_id', artistId)
      .gte('created_at', startOfMonth.toISOString());

    const engagement = engagementData?.reduce((sum, post) => 
      sum + (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0), 0) || 0;

    return {
      revenue,
      bookings: bookingsCount || 0,
      followers: followersCount || 0,
      engagement
    };
  };

  const fetchGoals = async (artistId: string) => {
    // For now, return mock goals. In a real app, these would come from a goals table
    return [
      {
        id: '1',
        title: 'Monthly Revenue Target',
        description: 'Achieve ₹50,000 in monthly revenue',
        target: 50000,
        current: 35000,
        deadline: '2024-02-29',
        status: 'on_track' as const,
        category: 'revenue' as const
      },
      {
        id: '2',
        title: 'Follower Growth',
        description: 'Reach 1000 followers by end of quarter',
        target: 1000,
        current: 750,
        deadline: '2024-03-31',
        status: 'on_track' as const,
        category: 'followers' as const
      },
      {
        id: '3',
        title: 'Booking Conversion',
        description: 'Maintain 15% booking conversion rate',
        target: 15,
        current: 12.5,
        deadline: '2024-02-29',
        status: 'behind' as const,
        category: 'bookings' as const
      },
      {
        id: '4',
        title: 'Engagement Rate',
        description: 'Achieve 10% engagement rate',
        target: 10,
        current: 8.3,
        deadline: '2024-02-29',
        status: 'behind' as const,
        category: 'engagement' as const
      }
    ];
  };

  const fetchAchievements = async (artistId: string) => {
    // Mock achievements - in a real app, these would be calculated based on milestones
    return [
      {
        id: '1',
        title: 'First ₹10K Month',
        description: 'Earned your first ₹10,000 in a single month',
        icon: '💰',
        earnedAt: '2024-01-15',
        category: 'revenue' as const
      },
      {
        id: '2',
        title: '500 Followers',
        description: 'Reached 500 followers milestone',
        icon: '👥',
        earnedAt: '2024-01-20',
        category: 'followers' as const
      },
      {
        id: '3',
        title: 'High Engagement',
        description: 'Achieved 8%+ engagement rate for a month',
        icon: '🔥',
        earnedAt: '2024-01-25',
        category: 'engagement' as const
      },
      {
        id: '4',
        title: 'Top Performer',
        description: 'Featured in top 10 artists this month',
        icon: '🏆',
        earnedAt: '2024-01-30',
        category: 'milestone' as const
      }
    ];
  };

  const generateInsights = (metrics: any, goals: any[]) => {
    const insights = [];

    // Revenue insight
    if (metrics.revenue > 30000) {
      insights.push({
        id: '1',
        title: 'Strong Revenue Performance',
        description: 'You\'re on track to exceed your monthly revenue target. Consider increasing your rates or taking on more bookings.',
        type: 'positive' as const,
        impact: 'high' as const
      });
    }

    // Engagement insight
    if (metrics.engagement < 1000) {
      insights.push({
        id: '2',
        title: 'Low Engagement Alert',
        description: 'Your engagement is below target. Try posting more frequently or creating more interactive content.',
        type: 'warning' as const,
        impact: 'medium' as const
      });
    }

    // Follower growth insight
    if (metrics.followers > 500) {
      insights.push({
        id: '3',
        title: 'Follower Growth Opportunity',
        description: 'You have a good follower base. Consider collaborating with other artists to reach new audiences.',
        type: 'suggestion' as const,
        impact: 'medium' as const
      });
    }

    return insights;
  };

  const generateMonthlyTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return {
      revenue: months.map(month => ({
        month,
        revenue: Math.random() * 50000 + 20000,
        target: 50000
      })),
      bookings: months.map(month => ({
        month,
        bookings: Math.random() * 50 + 20,
        target: 40
      })),
      engagement: months.map(month => ({
        month,
        engagement: Math.random() * 2000 + 1000,
        target: 1500
      })),
      followers: months.map(month => ({
        month,
        followers: Math.random() * 200 + 500,
        target: 1000
      }))
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800';
      case 'behind': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'warning': return <TrendingDown className="h-4 w-4 text-yellow-600" />;
      case 'suggestion': return <Zap className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading performance data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!performanceData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">No performance data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Tracking</h2>
          <p className="text-muted-foreground">Monitor your progress and achieve your goals</p>
        </div>
        {isOwnProfile && (
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Set New Goal
          </Button>
        )}
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">₹{performanceData.revenue.current.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Target: ₹{performanceData.revenue.target.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Progress value={(performanceData.revenue.current / performanceData.revenue.target) * 100} className="h-2" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">
                  {((performanceData.revenue.current / performanceData.revenue.target) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{performanceData.revenue.growth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bookings</p>
                <p className="text-2xl font-bold">{performanceData.bookings.current}</p>
                <p className="text-sm text-muted-foreground">Target: {performanceData.bookings.target}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Progress value={(performanceData.bookings.current / performanceData.bookings.target) * 100} className="h-2" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">
                  {((performanceData.bookings.current / performanceData.bookings.target) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{performanceData.bookings.growth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">{performanceData.engagement.current.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Rate: {performanceData.engagement.engagementRate}%</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <Progress value={(performanceData.engagement.current / performanceData.engagement.target) * 100} className="h-2" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">
                  {((performanceData.engagement.current / performanceData.engagement.target) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{performanceData.engagement.growth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Followers</p>
                <p className="text-2xl font-bold">{performanceData.followers.current.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Target: {performanceData.followers.target.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <Progress value={(performanceData.followers.current / performanceData.followers.target) * 100} className="h-2" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">
                  {((performanceData.followers.current / performanceData.followers.target) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{performanceData.followers.growth}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.revenue.monthlyTrend.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="font-medium">{month.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">₹{month.revenue.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Target: ₹{month.target.toLocaleString()}</p>
                        </div>
                        <div className="w-20">
                          <Progress value={(month.revenue / month.target) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Booking Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Booking Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.bookings.monthlyTrend.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="font-medium">{month.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{month.bookings}</p>
                          <p className="text-sm text-muted-foreground">Target: {month.target}</p>
                        </div>
                        <div className="w-20">
                          <Progress value={(month.bookings / month.target) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-4">
            {performanceData.goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{goal.title}</h3>
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{goal.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.current} / {goal.target}</span>
                        </div>
                        <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                          <span>{((goal.current / goal.target) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceData.achievements.map((achievement) => (
              <Card key={achievement.id} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Award className="h-6 w-6 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            {performanceData.insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
