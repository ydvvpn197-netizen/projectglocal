import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bug, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  MapPin,
  Plus,
  Search,
  Filter,
  TrendingUp,
  BarChart3,
  Calendar,
  MessageSquare,
  Flag,
  Eye,
  Edit,
  Trash2,
  Archive,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { format } from 'date-fns';

interface CommunityIssue {
  id: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'safety' | 'environment' | 'transport' | 'health' | 'education' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  location_city?: string;
  location_state?: string;
  latitude?: number;
  longitude?: number;
  reported_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  attachments: string[];
  tags: string[];
  is_anonymous: boolean;
  user_vote?: 'up' | 'down';
  reporter_name?: string;
  assigned_name?: string;
}

interface IssueAnalytics {
  total_issues: number;
  open_issues: number;
  resolved_issues: number;
  resolution_rate: number;
  avg_resolution_time: number;
  top_categories: Array<{ category: string; count: number }>;
  priority_distribution: Array<{ priority: string; count: number }>;
  recent_activity: Array<{ date: string; issues: number }>;
}

export const IssueTrackingSystem: React.FC = () => {
  const { toast } = useToast();
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [analytics, setAnalytics] = useState<IssueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);

  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: 'infrastructure' as const,
    priority: 'medium' as const,
    severity: 'moderate' as const,
    location_city: '',
    location_state: '',
    tags: [] as string[],
    is_anonymous: false
  });

  useEffect(() => {
    loadIssues();
    loadAnalytics();
  }, []);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_issues')
        .select(`
          *,
          issue_votes(vote_type, user_id),
          profiles!community_issues_reported_by_fkey(display_name),
          assigned_profile:profiles!community_issues_assigned_to_fkey(display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedIssues = data?.map(issue => ({
        ...issue,
        reporter_name: issue.profiles?.display_name || 'Anonymous',
        assigned_name: issue.assigned_profile?.display_name,
        user_vote: issue.issue_votes?.[0]?.vote_type || undefined
      })) || [];

      setIssues(formattedIssues);
    } catch (error) {
      console.error('Error loading issues:', error);
      toast({
        title: "Error",
        description: "Failed to load community issues.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_issue_analytics');
      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleCreateIssue = async () => {
    try {
      const { error } = await supabase
        .from('community_issues')
        .insert({
          title: newIssue.title,
          description: newIssue.description,
          category: newIssue.category,
          priority: newIssue.priority,
          severity: newIssue.severity,
          location_city: newIssue.location_city,
          location_state: newIssue.location_state,
          tags: newIssue.tags,
          is_anonymous: newIssue.is_anonymous
        });

      if (error) throw error;

      toast({
        title: "Issue Reported",
        description: "Your issue has been reported successfully.",
      });

      setNewIssue({
        title: '',
        description: '',
        category: 'infrastructure',
        priority: 'medium',
        severity: 'moderate',
        location_city: '',
        location_state: '',
        tags: [],
        is_anonymous: false
      });
      setShowCreateForm(false);
      loadIssues();
    } catch (error) {
      console.error('Error creating issue:', error);
      toast({
        title: "Error",
        description: "Failed to report issue. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (issueId: string, voteType: 'up' | 'down') => {
    try {
      setVoting(issueId);
      
      const { error } = await supabase
        .from('issue_votes')
        .upsert({
          issue_id: issueId,
          vote_type: voteType
        }, { onConflict: 'issue_id,user_id' });

      if (error) throw error;

      toast({
        title: "Vote Recorded",
        description: `Your ${voteType}vote has been recorded.`,
      });

      loadIssues();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVoting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-blue-100 text-blue-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'severe': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'major': return <Bug className="h-4 w-4 text-orange-500" />;
      case 'moderate': return <Flag className="h-4 w-4 text-yellow-500" />;
      case 'minor': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Community Issue Tracker</h2>
            <p className="text-muted-foreground">Report and track community issues</p>
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
          <h2 className="text-2xl font-bold">Community Issue Tracker</h2>
          <p className="text-muted-foreground">Report and track community issues</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Report Issue
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                  <p className="text-2xl font-bold">{analytics.total_issues}</p>
                </div>
                <Bug className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open Issues</p>
                  <p className="text-2xl font-bold text-orange-600">{analytics.open_issues}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.resolution_rate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Resolution</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.avg_resolution_time}d</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Issue Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Report New Issue</CardTitle>
            <CardDescription>
              Help improve your community by reporting issues that need attention.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={newIssue.title}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the issue"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={newIssue.category}
                  onValueChange={(value: any) => setNewIssue(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={newIssue.description}
                onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the issue, including location and impact"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newIssue.priority}
                  onValueChange={(value: any) => setNewIssue(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Severity</label>
                <Select
                  value={newIssue.severity}
                  onValueChange={(value: any) => setNewIssue(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newIssue.is_anonymous}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                />
                <label htmlFor="anonymous" className="text-sm">Report anonymously</label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateIssue}>
                Report Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues List */}
      <div className="grid gap-4">
        {filteredIssues.map((issue) => (
          <Card key={issue.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getSeverityIcon(issue.severity)}
                    {issue.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {issue.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Issue Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Reported: {format(new Date(issue.created_at), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>By: {issue.reporter_name}</span>
                </div>
                {issue.location_city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{issue.location_city}, {issue.location_state}</span>
                  </div>
                )}
              </div>

              {/* Voting */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={issue.user_vote === 'up' ? 'default' : 'outline'}
                  onClick={() => handleVote(issue.id, 'up')}
                  disabled={voting === issue.id}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {issue.upvotes}
                </Button>
                <Button
                  size="sm"
                  variant={issue.user_vote === 'down' ? 'default' : 'outline'}
                  onClick={() => handleVote(issue.id, 'down')}
                  disabled={voting === issue.id}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  {issue.downvotes}
                </Button>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{issue.comment_count} comments</span>
                </div>
              </div>

              {/* Tags */}
              {issue.tags && issue.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {issue.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
