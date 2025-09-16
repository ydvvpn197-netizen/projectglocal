import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  Building,
  User,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';
import { communityReportingService } from '@/services/communityReportingService';

interface ModerationStats {
  total_reports: number;
  reports_this_week: number;
  reports_this_month: number;
  average_response_time: number;
  resolution_rate: number;
  community_trust_score: number;
  top_report_reasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  moderation_actions: Array<{
    action: string;
    count: number;
    percentage: number;
  }>;
}

interface TransparencyLog {
  id: string;
  action_type: 'report_resolved' | 'content_removed' | 'user_warned' | 'user_suspended' | 'appeal_processed';
  content_type: string;
  reason: string;
  moderator_notes?: string;
  action_taken: string;
  timestamp: string;
  community_impact: 'positive' | 'neutral' | 'negative';
}

interface CommunityFeedback {
  id: string;
  feedback_type: 'moderation_quality' | 'response_time' | 'transparency' | 'community_guidelines';
  rating: number;
  comment?: string;
  submitted_by: string;
  timestamp: string;
}

export const CommunityTransparencyDashboard: React.FC = () => {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [transparencyLogs, setTransparencyLogs] = useState<TransparencyLog[]>([]);
  const [communityFeedback, setCommunityFeedback] = useState<CommunityFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsData, logsData, feedbackData] = await Promise.all([
        communityReportingService.getModerationStats(timeRange),
        communityReportingService.getTransparencyLogs(timeRange),
        communityReportingService.getCommunityFeedback(timeRange)
      ]);

      setStats(statsData);
      setTransparencyLogs(logsData);
      setCommunityFeedback(feedbackData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'report_resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'content_removed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'user_warned':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'user_suspended':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'appeal_processed':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'business':
        return <Building className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load transparency data: {error}</p>
            <Button onClick={loadDashboardData} className="mt-4">
              Try Again
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
          <h2 className="text-2xl font-bold text-gray-900">Community Transparency</h2>
          <p className="text-gray-600">Transparent moderation logs and community feedback</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_reports.toLocaleString()}</div>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                {stats.reports_this_week} this week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_response_time}h</div>
              <div className="text-sm text-gray-600">Average resolution time</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Resolution Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolution_rate}%</div>
              <Progress value={stats.resolution_rate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Community Trust</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTrustScoreColor(stats.community_trust_score)}`}>
                {stats.community_trust_score}%
              </div>
              <div className="text-sm text-gray-600">Trust score</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Moderation Logs</TabsTrigger>
          <TabsTrigger value="feedback">Community Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Moderation Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recent Moderation Actions
              </CardTitle>
              <CardDescription>
                Public log of moderation actions taken by our team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transparencyLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action_type)}
                          <span className="text-sm font-medium">{log.action_taken}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getContentTypeIcon(log.content_type)}
                          <span className="text-sm capitalize">{log.content_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{log.reason}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getImpactColor(log.community_impact)}>
                          {log.community_impact}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">{formatDate(log.timestamp)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Feedback */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Feedback
              </CardTitle>
              <CardDescription>
                Feedback from community members about moderation quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communityFeedback.map((feedback) => (
                  <div key={feedback.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{feedback.feedback_type.replace('_', ' ')}</Badge>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Zap
                              key={i}
                              className={`h-4 w-4 ${
                                i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(feedback.timestamp)}</span>
                    </div>
                    {feedback.comment && (
                      <p className="text-sm text-gray-700 mt-2">{feedback.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Report Reasons */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top Report Reasons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.top_report_reasons.map((reason, index) => (
                      <div key={reason.reason} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                          <span className="text-sm capitalize">{reason.reason.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${reason.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {reason.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Moderation Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Moderation Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.moderation_actions.map((action, index) => (
                      <div key={action.action} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                          <span className="text-sm capitalize">{action.action.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${action.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {action.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityTransparencyDashboard;
