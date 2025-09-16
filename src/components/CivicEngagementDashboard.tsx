import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Vote, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  BarChart3,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Activity,
  Target,
  Award,
  Globe,
  Shield,
  Megaphone,
  FileText,
  Bell,
  Heart,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';

interface CivicEngagementMetrics {
  total_participants: number;
  active_contributors: number;
  engagement_score: number;
  participation_rate: number;
  community_health: number;
  recent_activity: number;
  top_contributors: Array<{
    user_id: string;
    name: string;
    contributions: number;
    avatar?: string;
  }>;
  engagement_trends: Array<{
    date: string;
    participants: number;
    activities: number;
  }>;
  category_breakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

interface CivicActivity {
  id: string;
  type: 'poll' | 'discussion' | 'event' | 'issue' | 'protest';
  title: string;
  description: string;
  participants: number;
  engagement_score: number;
  created_at: string;
  status: 'active' | 'completed' | 'cancelled';
  category: string;
  location_city?: string;
  location_state?: string;
  is_anonymous: boolean;
  creator_name?: string;
}

interface GovernmentContact {
  id: string;
  name: string;
  department: string;
  level: 'local' | 'state' | 'national';
  contact_email: string;
  contact_phone?: string;
  jurisdiction: string;
  response_rate: number;
  avg_response_time: number;
  is_active: boolean;
}

export const CivicEngagementDashboard: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<CivicEngagementMetrics | null>(null);
  const [activities, setActivities] = useState<CivicActivity[]>([]);
  const [governmentContacts, setGovernmentContacts] = useState<GovernmentContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load metrics
      const { data: metricsData, error: metricsError } = await supabase.rpc('get_civic_engagement_metrics');
      if (metricsError) throw metricsError;
      setMetrics(metricsData);

      // Load recent activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('civic_activities')
        .select(`
          *,
          profiles!civic_activities_created_by_fkey(display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Load government contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('government_authorities')
        .select('*')
        .eq('is_active', true)
        .order('response_rate', { ascending: false });

      if (contactsError) throw contactsError;
      setGovernmentContacts(contactsData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load civic engagement data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'poll': return <Vote className="h-4 w-4" />;
      case 'discussion': return <MessageSquare className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'issue': return <AlertTriangle className="h-4 w-4" />;
      case 'protest': return <Megaphone className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'poll': return 'bg-blue-100 text-blue-800';
      case 'discussion': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      case 'issue': return 'bg-orange-100 text-orange-800';
      case 'protest': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600' };
    if (score >= 60) return { level: 'Good', color: 'text-blue-600' };
    if (score >= 40) return { level: 'Fair', color: 'text-yellow-600' };
    return { level: 'Needs Improvement', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Civic Engagement Dashboard</h2>
            <p className="text-muted-foreground">Track community participation and civic health</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Civic Engagement Dashboard</h2>
          <p className="text-muted-foreground">Track community participation and civic health</p>
        </div>
        <Button onClick={loadDashboardData}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold">{metrics.total_participants}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Engagement Score</p>
                  <p className="text-2xl font-bold">{metrics.engagement_score}/100</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Participation Rate</p>
                  <p className="text-2xl font-bold">{metrics.participation_rate}%</p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Community Health</p>
                  <p className="text-2xl font-bold">{metrics.community_health}/100</p>
                </div>
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          <TabsTrigger value="contacts">Government Contacts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Engagement Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Engagement</span>
                        <span className="text-sm text-muted-foreground">{metrics.engagement_score}/100</span>
                      </div>
                      <Progress value={metrics.engagement_score} className="h-2" />
                      <p className={`text-sm ${getEngagementLevel(metrics.engagement_score).color}`}>
                        {getEngagementLevel(metrics.engagement_score).level}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Participation Rate</span>
                        <span className="text-sm text-muted-foreground">{metrics.participation_rate}%</span>
                      </div>
                      <Progress value={metrics.participation_rate} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Community Health</span>
                        <span className="text-sm text-muted-foreground">{metrics.community_health}/100</span>
                      </div>
                      <Progress value={metrics.community_health} className="h-2" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics?.top_contributors && (
                  <div className="space-y-3">
                    {metrics.top_contributors.slice(0, 5).map((contributor, index) => (
                      <div key={contributor.user_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{contributor.name}</p>
                            <p className="text-sm text-muted-foreground">{contributor.contributions} contributions</p>
                          </div>
                        </div>
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <div className="grid gap-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        {activity.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {activity.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getActivityColor(activity.type)}>
                        {activity.type}
                      </Badge>
                      <Badge variant="outline">
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{activity.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Score: {activity.engagement_score}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(activity.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    {activity.location_city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{activity.location_city}, {activity.location_state}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Heart className="h-4 w-4 mr-1" />
                      Support
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Discuss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="grid gap-4">
            {governmentContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {contact.department} • {contact.jurisdiction}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {contact.level}
                      </Badge>
                      <Badge className={contact.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {contact.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contact Information</p>
                      <div className="space-y-1 mt-1">
                        <p className="text-sm">{contact.contact_email}</p>
                        {contact.contact_phone && (
                          <p className="text-sm">{contact.contact_phone}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Response Metrics</p>
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Response Rate:</span>
                          <span className="text-sm font-medium">{contact.response_rate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Avg Response Time:</span>
                          <span className="text-sm font-medium">{contact.avg_response_time} days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-1" />
                      Report Issue
                    </Button>
                    <Button size="sm" variant="outline">
                      <Bell className="h-4 w-4 mr-1" />
                      Follow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {metrics && (
            <div className="grid gap-6">
              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Activity Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.category_breakdown.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="capitalize">{category.category}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={category.percentage} className="w-24" />
                          <span className="text-sm text-muted-foreground">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Engagement Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {metrics.engagement_trends.slice(-7).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{format(new Date(trend.date), 'MMM dd')}</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{trend.participants} participants</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <span>{trend.activities} activities</span>
                          </div>
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