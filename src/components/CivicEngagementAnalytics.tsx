import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Vote, 
  Megaphone, 
  AlertTriangle,
  Target,
  Activity,
  Globe,
  Shield,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface CivicEngagementAnalyticsProps {
  compact?: boolean;
}

export const CivicEngagementAnalytics: React.FC<CivicEngagementAnalyticsProps> = ({ 
  compact = false 
}) => {
  // Mock analytics data - in real implementation, this would come from services
  const analytics = {
    overview: {
      totalUsers: 1247,
      activeUsers: 892,
      totalPolls: 24,
      totalProtests: 8,
      totalIssues: 15,
      engagementRate: 78.5,
      growthRate: 23.2
    },
    polls: {
      totalVotes: 1847,
      averageParticipation: 76.9,
      topCategories: [
        { category: 'Infrastructure', count: 8, percentage: 33.3 },
        { category: 'Environment', count: 6, percentage: 25.0 },
        { category: 'Education', count: 4, percentage: 16.7 },
        { category: 'Healthcare', count: 3, percentage: 12.5 },
        { category: 'Safety', count: 3, percentage: 12.5 }
      ],
      authorityResponses: 18,
      responseRate: 75.0
    },
    protests: {
      totalParticipants: 1247,
      virtualParticipants: 892,
      physicalParticipants: 355,
      successRate: 62.5,
      topCauses: [
        { cause: 'Environment', count: 3, participants: 456 },
        { cause: 'Housing', count: 2, participants: 234 },
        { cause: 'Labor Rights', count: 2, participants: 189 },
        { cause: 'Civil Rights', count: 1, participants: 368 }
      ]
    },
    issues: {
      totalReported: 15,
      resolved: 9,
      inProgress: 4,
      pending: 2,
      averageResolutionTime: 5.2,
      topCategories: [
        { category: 'Infrastructure', count: 8, percentage: 53.3 },
        { category: 'Safety', count: 4, percentage: 26.7 },
        { category: 'Environment', count: 2, percentage: 13.3 },
        { category: 'Vandalism', count: 1, percentage: 6.7 }
      ]
    },
    privacy: {
      anonymousUsers: 523,
      privacyLevels: {
        low: 156,
        medium: 234,
        high: 89,
        maximum: 44
      },
      anonymousEngagement: 42.3
    },
    trends: {
      weeklyActivity: [
        { week: 'Week 1', polls: 3, protests: 1, issues: 2 },
        { week: 'Week 2', polls: 5, protests: 2, issues: 3 },
        { week: 'Week 3', polls: 4, protests: 1, issues: 4 },
        { week: 'Week 4', polls: 6, protests: 2, issues: 3 }
      ],
      monthlyGrowth: [
        { month: 'Jan', users: 892, engagement: 65.2 },
        { month: 'Feb', users: 1023, engagement: 71.8 },
        { month: 'Mar', users: 1156, engagement: 76.4 },
        { month: 'Apr', users: 1247, engagement: 78.5 }
      ]
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Civic Analytics</h3>
          <Badge variant="outline">{analytics.overview.engagementRate}% Engagement</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Vote className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Polls</p>
                <p className="text-xs text-gray-500">{analytics.overview.totalPolls} active</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Megaphone className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Protests</p>
                <p className="text-xs text-gray-500">{analytics.overview.totalProtests} active</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Issues</p>
                <p className="text-xs text-gray-500">{analytics.overview.totalIssues} reported</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Anonymous</p>
                <p className="text-xs text-gray-500">{analytics.privacy.anonymousUsers} users</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{analytics.overview.growthRate}% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold">{analytics.overview.engagementRate}%</p>
                <p className="text-xs text-green-600">+5.2% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Vote className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold">{analytics.polls.totalVotes.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Across {analytics.overview.totalPolls} polls</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Anonymous Users</p>
                <p className="text-2xl font-bold">{analytics.privacy.anonymousUsers}</p>
                <p className="text-xs text-gray-500">{analytics.privacy.anonymousEngagement}% engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Poll Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Poll Analytics
            </CardTitle>
            <CardDescription>
              Government poll participation and authority responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Participation</span>
                <span className="text-sm text-gray-500">{analytics.polls.averageParticipation}%</span>
              </div>
              <Progress value={analytics.polls.averageParticipation} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Authority Response Rate</span>
                <span className="text-sm text-gray-500">{analytics.polls.responseRate}%</span>
              </div>
              <Progress value={analytics.polls.responseRate} className="h-2" />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Top Categories</h4>
              <div className="space-y-2">
                {analytics.polls.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{category.category}</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={category.percentage} className="w-16 h-1" />
                      <span className="text-xs text-gray-500">{category.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Protest Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Protest Analytics
            </CardTitle>
            <CardDescription>
              Virtual protest participation and success rates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-sm text-gray-500">{analytics.protests.successRate}%</span>
              </div>
              <Progress value={analytics.protests.successRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.protests.virtualParticipants}</div>
                <div className="text-xs text-gray-500">Virtual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.protests.physicalParticipants}</div>
                <div className="text-xs text-gray-500">Physical</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Top Causes</h4>
              <div className="space-y-2">
                {analytics.protests.topCauses.map((cause, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{cause.cause}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{cause.participants} participants</span>
                      <Badge variant="outline" className="text-xs">{cause.count} protests</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issue Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Community Issues
            </CardTitle>
            <CardDescription>
              Issue reporting and resolution metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{analytics.issues.resolved}</div>
                <div className="text-xs text-gray-500">Resolved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{analytics.issues.inProgress}</div>
                <div className="text-xs text-gray-500">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{analytics.issues.pending}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Resolution Time</span>
                <span className="text-sm text-gray-500">{analytics.issues.averageResolutionTime} days</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Issue Categories</h4>
              <div className="space-y-2">
                {analytics.issues.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{category.category}</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={category.percentage} className="w-16 h-1" />
                      <span className="text-xs text-gray-500">{category.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Anonymity
            </CardTitle>
            <CardDescription>
              Anonymous usage and privacy level distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Anonymous Engagement</span>
                <span className="text-sm text-gray-500">{analytics.privacy.anonymousEngagement}%</span>
              </div>
              <Progress value={analytics.privacy.anonymousEngagement} className="h-2" />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Privacy Level Distribution</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low Privacy</span>
                  <Badge variant="outline">{analytics.privacy.privacyLevels.low}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Medium Privacy</span>
                  <Badge variant="outline">{analytics.privacy.privacyLevels.medium}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">High Privacy</span>
                  <Badge variant="outline">{analytics.privacy.privacyLevels.high}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Maximum Privacy</span>
                  <Badge variant="outline">{analytics.privacy.privacyLevels.maximum}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Growth Trends
          </CardTitle>
          <CardDescription>
            Monthly user growth and engagement trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {analytics.trends.monthlyGrowth.map((month, index) => (
                <div key={index} className="text-center p-4 border rounded-lg">
                  <div className="text-sm font-medium">{month.month}</div>
                  <div className="text-2xl font-bold text-blue-600">{month.users}</div>
                  <div className="text-xs text-gray-500">users</div>
                  <div className="text-sm text-green-600">{month.engagement}% engagement</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};