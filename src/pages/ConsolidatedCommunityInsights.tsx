import React, { useState, useEffect } from 'react';
import { RoleGuard } from '../components/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Shield, 
  Lock, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  MessageSquare, 
  Heart,
  Brain,
  Target,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Zap,
  Globe,
  Building,
  UserCheck,
  MessageCircle,
  Star,
  Award,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Info,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { useSecurityAudit } from '../hooks/useSecurityAudit';
import { useIsAdmin } from '../hooks/useRBACConsolidated';
import CommunityInsightsDashboard from '../components/CommunityInsightsDashboard';

interface MockInsightData {
  sentiment: {
    total_analyses: number;
    average_sentiment: number;
    sentiment_distribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
  trends: Array<{
    trend_name: string;
    trend_score: number;
    trend_direction: 'rising' | 'falling' | 'stable';
    confidence_level: number;
  }>;
  predictions: Array<{
    prediction_target: string;
    predicted_value: number;
    confidence_score: number;
    prediction_horizon: string;
    prediction_date: string;
  }>;
}

interface CommunityMetrics {
  totalMembers: number;
  activeMembers: number;
  newMembers: number;
  engagementRate: number;
  postsCount: number;
  eventsCount: number;
  discussionsCount: number;
  satisfactionScore: number;
}

interface SecurityMetrics {
  totalAccessAttempts: number;
  successfulLogins: number;
  failedLogins: number;
  suspiciousActivities: number;
  blockedUsers: number;
  securityScore: number;
}

const ConsolidatedCommunityInsights: React.FC = () => {
  const { logAccessAttempt } = useSecurityAudit();
  const { isAdmin } = useIsAdmin();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<MockInsightData | null>(null);
  const [communityMetrics, setCommunityMetrics] = useState<CommunityMetrics | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);

  // Log access attempt when component mounts
  useEffect(() => {
    logAccessAttempt('/community-insights', isAdmin, {
      page: 'ConsolidatedCommunityInsights',
      timestamp: new Date().toISOString()
    });
  }, [logAccessAttempt, isAdmin]);

  useEffect(() => {
    const loadMockData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for insights
        const mockInsightData: MockInsightData = {
          sentiment: {
            total_analyses: 1247,
            average_sentiment: 0.73,
            sentiment_distribution: {
              positive: 68,
              negative: 12,
              neutral: 20
            }
          },
          trends: [
            {
              trend_name: "Community Engagement",
              trend_score: 0.85,
              trend_direction: "rising",
              confidence_level: 0.92
            },
            {
              trend_name: "Event Participation",
              trend_score: 0.72,
              trend_direction: "stable",
              confidence_level: 0.88
            },
            {
              trend_name: "Discussion Activity",
              trend_score: 0.68,
              trend_direction: "falling",
              confidence_level: 0.76
            }
          ],
          predictions: [
            {
              prediction_target: "Member Growth",
              predicted_value: 1250,
              confidence_score: 0.89,
              prediction_horizon: "30 days",
              prediction_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              prediction_target: "Event Attendance",
              predicted_value: 85,
              confidence_score: 0.82,
              prediction_horizon: "14 days",
              prediction_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        };

        // Mock community metrics
        const mockCommunityMetrics: CommunityMetrics = {
          totalMembers: 1247,
          activeMembers: 892,
          newMembers: 45,
          engagementRate: 78.5,
          postsCount: 234,
          eventsCount: 18,
          discussionsCount: 67,
          satisfactionScore: 4.2
        };

        // Mock security metrics
        const mockSecurityMetrics: SecurityMetrics = {
          totalAccessAttempts: 3456,
          successfulLogins: 3201,
          failedLogins: 255,
          suspiciousActivities: 12,
          blockedUsers: 3,
          securityScore: 94.2
        };
        
        setData(mockInsightData);
        setCommunityMetrics(mockCommunityMetrics);
        setSecurityMetrics(mockSecurityMetrics);
      } catch (err) {
        setError('Failed to load insights data');
        console.error('Error loading insights:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMockData();
  }, [timePeriod]);

  // Fallback component for unauthorized users
  const UnauthorizedAccess = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-gray-600">
              This page contains sensitive community insights and analytics that are only available to administrators and super administrators.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Admin privileges required</span>
            </div>
            <p className="text-xs text-gray-400">
              If you believe you should have access to this page, please contact your system administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!isAdmin) {
    return <UnauthorizedAccess />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Insights...</h2>
          <p className="text-gray-600">Analyzing community data and trends</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'rising':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'falling':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'rising':
        return 'text-green-600 bg-green-50';
      case 'falling':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Brain className="w-8 h-8 text-blue-600" />
                Community Insights
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive analytics and insights for community management
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as 'day' | 'week' | 'month')}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="day">Last 24 Hours</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Predictions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Members</p>
                      <p className="text-3xl font-bold text-blue-900">{communityMetrics?.totalMembers.toLocaleString()}</p>
                      <p className="text-sm text-blue-600">+{communityMetrics?.newMembers} this week</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Active Members</p>
                      <p className="text-3xl font-bold text-green-900">{communityMetrics?.activeMembers.toLocaleString()}</p>
                      <p className="text-sm text-green-600">{communityMetrics?.engagementRate}% engagement</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Posts & Events</p>
                      <p className="text-3xl font-bold text-purple-900">{communityMetrics?.postsCount + communityMetrics?.eventsCount}</p>
                      <p className="text-sm text-purple-600">{communityMetrics?.postsCount} posts, {communityMetrics?.eventsCount} events</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Satisfaction</p>
                      <p className="text-3xl font-bold text-orange-900">{communityMetrics?.satisfactionScore}/5.0</p>
                      <p className="text-sm text-orange-600">Community rating</p>
                    </div>
                    <Star className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="w-5 h-5 text-green-600" />
                    Growth Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Member Growth</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">+12.5%</span>
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Engagement Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">+8.3%</span>
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Event Attendance</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-red-600">-2.1%</span>
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Key Performance Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Content Quality Score</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Excellent</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">2.3 hours</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Retention Rate</span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">94.2%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Sentiment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Sentiment Analysis
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Analysis of {data?.sentiment.total_analyses.toLocaleString()} community interactions
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-green-600">
                        {data?.sentiment.sentiment_distribution.positive}%
                      </span>
                    </div>
                    <p className="text-sm font-medium text-green-600">Positive</p>
                    <p className="text-xs text-gray-500">Community sentiment</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-gray-600">
                        {data?.sentiment.sentiment_distribution.neutral}%
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600">Neutral</p>
                    <p className="text-xs text-gray-500">Mixed sentiment</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-red-600">
                        {data?.sentiment.sentiment_distribution.negative}%
                      </span>
                    </div>
                    <p className="text-sm font-medium text-red-600">Negative</p>
                    <p className="text-xs text-gray-500">Concerns raised</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trend Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTrendIcon(trend.trend_direction)}
                        <div>
                          <p className="font-medium text-gray-900">{trend.trend_name}</p>
                          <p className="text-sm text-gray-600">
                            Confidence: {Math.round(trend.confidence_level * 100)}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {Math.round(trend.trend_score * 100)}%
                        </p>
                        <Badge 
                          variant="secondary" 
                          className={getTrendColor(trend.trend_direction)}
                        >
                          {trend.trend_direction}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Security Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Security Score</p>
                      <p className="text-3xl font-bold text-red-900">{securityMetrics?.securityScore}%</p>
                      <p className="text-sm text-red-600">Overall security health</p>
                    </div>
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Failed Logins</p>
                      <p className="text-3xl font-bold text-yellow-900">{securityMetrics?.failedLogins}</p>
                      <p className="text-sm text-yellow-600">This period</p>
                    </div>
                    <Lock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Suspicious Activity</p>
                      <p className="text-3xl font-bold text-orange-900">{securityMetrics?.suspiciousActivities}</p>
                      <p className="text-sm text-orange-600">Detected incidents</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Access Attempts</span>
                      <span className="font-medium">{securityMetrics?.totalAccessAttempts.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Successful Logins</span>
                      <span className="font-medium text-green-600">{securityMetrics?.successfulLogins.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Blocked Users</span>
                      <span className="font-medium text-red-600">{securityMetrics?.blockedUsers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Threat Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Security Incidents</span>
                      <Badge variant="destructive">{securityMetrics?.suspiciousActivities}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Risk Level</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Low</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Security Scan</span>
                      <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            {/* Predictions Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-purple-600" />
                  AI-Powered Predictions
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Machine learning insights and future projections
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {data?.predictions.map((prediction, index) => (
                    <div key={index} className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {prediction.prediction_target}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Predicted Value</p>
                              <p className="text-2xl font-bold text-purple-600">
                                {prediction.predicted_value.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Confidence</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {Math.round(prediction.confidence_score * 100)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Timeframe</p>
                              <p className="text-2xl font-bold text-green-600">
                                {prediction.prediction_horizon}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            AI Generated
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prediction Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    Model Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Accuracy Rate</span>
                      <span className="font-medium text-green-600">94.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Model Version</span>
                      <span className="font-medium">v2.1.3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Training</span>
                      <span className="font-medium">3 days ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Prediction Targets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Member Growth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Engagement Trends</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Event Attendance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Content Performance</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConsolidatedCommunityInsights;