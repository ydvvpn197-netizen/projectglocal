import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  Target, 
  Award, 
  Users, 
  Heart, 
  MessageCircle, 
  Calendar,
  Star,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Crown,
  Shield,
  Globe
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFollowing } from '@/hooks/useFollowing';

interface Insight {
  id: string;
  type: 'achievement' | 'recommendation' | 'warning' | 'tip';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'engagement' | 'growth' | 'content' | 'community' | 'monetization';
  actionRequired: boolean;
  progress?: number;
  target?: number;
  current?: number;
  timeframe?: string;
  icon?: string;
}

interface UserInsight {
  id: string;
  title: string;
  description: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  icon: string;
}

export const UserInsights = () => {
  const { user } = useAuth();
  const { followStats } = useFollowing();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [userInsights, setUserInsights] = useState<UserInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      // Mock insights data - in real app, this would come from API
      const mockInsights: Insight[] = [
        {
          id: '1',
          type: 'achievement',
          title: 'Engagement Milestone',
          description: 'Your posts have reached 1,000+ total likes this month!',
          priority: 'high',
          category: 'engagement',
          actionRequired: false,
          progress: 100,
          target: 1000,
          current: 1250,
          timeframe: 'This month'
        },
        {
          id: '2',
          type: 'recommendation',
          title: 'Post More During Peak Hours',
          description: 'Your content performs 40% better when posted between 2-3 PM',
          priority: 'medium',
          category: 'content',
          actionRequired: true,
          progress: 60,
          target: 100,
          current: 60,
          timeframe: 'Next 30 days'
        },
        {
          id: '3',
          type: 'tip',
          title: 'Video Content Opportunity',
          description: 'Try creating more video content - your video posts get 3x more engagement',
          priority: 'low',
          category: 'content',
          actionRequired: false
        },
        {
          id: '4',
          type: 'warning',
          title: 'Follower Growth Slowing',
          description: 'Your follower growth has decreased by 15% this week',
          priority: 'high',
          category: 'growth',
          actionRequired: true,
          progress: 25,
          target: 100,
          current: 25,
          timeframe: 'This week'
        },
        {
          id: '5',
          type: 'achievement',
          title: 'Community Leader Badge',
          description: 'You\'ve been recognized as a top contributor in your local community',
          priority: 'high',
          category: 'community',
          actionRequired: false,
          progress: 100
        },
        {
          id: '6',
          type: 'recommendation',
          title: 'Engage with Followers',
          description: 'Respond to comments within 2 hours to increase engagement by 25%',
          priority: 'medium',
          category: 'engagement',
          actionRequired: true,
          progress: 40,
          target: 100,
          current: 40,
          timeframe: 'Daily'
        }
      ];

      const mockUserInsights: UserInsight[] = [
        {
          id: '1',
          title: 'Engagement Rate',
          description: 'Your content engagement performance',
          value: 4.2,
          change: 12.5,
          trend: 'up',
          category: 'Performance',
          icon: 'trending-up'
        },
        {
          id: '2',
          title: 'Follower Growth',
          description: 'New followers this month',
          value: 67,
          change: 17.5,
          trend: 'up',
          category: 'Growth',
          icon: 'users'
        },
        {
          id: '3',
          title: 'Content Quality Score',
          description: 'Based on likes, comments, and shares',
          value: 8.7,
          change: -2.1,
          trend: 'down',
          category: 'Quality',
          icon: 'star'
        },
        {
          id: '4',
          title: 'Community Impact',
          description: 'Your influence in the community',
          value: 92,
          change: 8.3,
          trend: 'up',
          category: 'Impact',
          icon: 'heart'
        }
      ];

      setInsights(mockInsights);
      setUserInsights(mockUserInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="h-5 w-5 text-green-500" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'tip':
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-green-50 border-green-200';
      case 'recommendation':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-red-50 border-red-200';
      case 'tip':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement':
        return <Heart className="h-4 w-4" />;
      case 'growth':
        return <TrendingUp className="h-4 w-4" />;
      case 'content':
        return <MessageCircle className="h-4 w-4" />;
      case 'community':
        return <Users className="h-4 w-4" />;
      case 'monetization':
        return <Target className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            User Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userInsights.map((insight) => (
          <Card key={insight.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{insight.title}</p>
                  <p className="text-2xl font-bold">{insight.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {insight.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : insight.trend === 'down' ? (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <span className={`text-sm ${
                      insight.trend === 'up' ? 'text-green-600' : 
                      insight.trend === 'down' ? 'text-red-600' : 
                      'text-muted-foreground'
                    }`}>
                      {insight.change > 0 ? '+' : ''}{insight.change}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  {insight.icon === 'trending-up' && <TrendingUp className="h-6 w-6 text-primary" />}
                  {insight.icon === 'users' && <Users className="h-6 w-6 text-primary" />}
                  {insight.icon === 'star' && <Star className="h-6 w-6 text-primary" />}
                  {insight.icon === 'heart' && <Heart className="h-6 w-6 text-primary" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Insights */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goals & Progress
                </CardTitle>
                <CardDescription>Track your community engagement goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.filter(insight => insight.progress !== undefined).map((insight) => (
                  <div key={insight.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{insight.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {insight.current}/{insight.target}
                      </span>
                    </div>
                    <Progress value={insight.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Community Status
                </CardTitle>
                <CardDescription>Your standing in the community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Verified Member</span>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Top Contributor</span>
                  </div>
                  <Badge variant="default">Level 3</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Community Leader</span>
                  </div>
                  <Badge variant="outline">Local</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          {insights.filter(insight => insight.type === 'achievement').map((insight) => (
            <Card key={insight.id} className={`${getInsightColor(insight.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge variant={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    {insight.progress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{insight.progress}%</span>
                        </div>
                        <Progress value={insight.progress} className="h-1" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {insights.filter(insight => insight.type === 'recommendation').map((insight) => (
            <Card key={insight.id} className={`${getInsightColor(insight.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge variant={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                      {insight.actionRequired && (
                        <Badge variant="outline" className="text-xs">
                          Action Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {getCategoryIcon(insight.category)}
                        {insight.category}
                      </span>
                      {insight.timeframe && (
                        <span>{insight.timeframe}</span>
                      )}
                    </div>
                    {insight.progress !== undefined && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{insight.progress}%</span>
                        </div>
                        <Progress value={insight.progress} className="h-1" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          {insights.filter(insight => insight.type === 'tip').map((insight) => (
            <Card key={insight.id} className={`${getInsightColor(insight.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge variant={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {getCategoryIcon(insight.category)}
                        {insight.category}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserInsights;
