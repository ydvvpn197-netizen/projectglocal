import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Flag, 
  Ban, 
  UserX, 
  MessageSquare, 
  Users, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Target,
  Zap,
  Award,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Reply,
  Quote,
  ExternalLink,
  Copy,
  Link,
  Share2,
  Bookmark,
  Archive,
  ArchiveRestore,
  Lock,
  Unlock,
  EyeOff,
  EyeOn,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  CameraOff,
  Image,
  ImageOff,
  FileText,
  File,
  Download,
  Upload,
  RefreshCw,
  RefreshCcw,
  RotateCw,
  RotateCcw2,
  Move,
  Move3D,
  Layers,
  Layers3,
  Box,
  Package,
  Database,
  Server,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Signal,
  SignalZero,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  BatteryFull,
  Plug,
  PlugZap,
  ZapOff,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudHail,
  Wind,
  Thermometer,
  Droplets,
  Umbrella,
  Snowflake,
  TreePine,
  TreeDeciduous,
  Flower,
  Flower2,
  Leaf,
  LeafyGreen,
  Sprout
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface CommunityModerationToolsProps {
  className?: string;
}

interface ModerationReport {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reporter_avatar?: string;
  reported_user_id?: string;
  reported_user_name?: string;
  reported_user_avatar?: string;
  content_type: 'post' | 'comment' | 'user' | 'group' | 'event';
  content_id: string;
  content_preview: string;
  reason: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  assigned_moderator_id?: string;
  assigned_moderator_name?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

interface ModerationAction {
  id: string;
  moderator_id: string;
  moderator_name: string;
  action_type: 'warn' | 'suspend' | 'ban' | 'delete' | 'hide' | 'approve';
  target_type: 'user' | 'post' | 'comment' | 'group' | 'event';
  target_id: string;
  target_name: string;
  reason: string;
  duration_days?: number;
  created_at: string;
}

interface CommunityStats {
  total_reports: number;
  pending_reports: number;
  resolved_reports: number;
  active_moderators: number;
  banned_users: number;
  suspended_users: number;
  content_removed: number;
  community_health_score: number;
}

interface AutoModerationRule {
  id: string;
  name: string;
  description: string;
  rule_type: 'keyword' | 'spam' | 'toxicity' | 'content' | 'behavior';
  conditions: string[];
  actions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CommunityModerationTools: React.FC<CommunityModerationToolsProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'reports' | 'actions' | 'rules' | 'stats'>('reports');
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [rules, setRules] = useState<AutoModerationRule[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [actionForm, setActionForm] = useState({
    action_type: '',
    reason: '',
    duration_days: '',
    resolution_notes: ''
  });

  // Load moderation data
  const loadModerationData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('moderation_reports')
        .select(`
          *,
          reporter:profiles!moderation_reports_reporter_id_fkey(
            display_name,
            avatar_url
          ),
          reported_user:profiles!moderation_reports_reported_user_id_fkey(
            display_name,
            avatar_url
          ),
          assigned_moderator:profiles!moderation_reports_assigned_moderator_id_fkey(
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      const processedReports = reportsData?.map(report => ({
        ...report,
        reporter_name: report.reporter?.display_name || 'Anonymous',
        reporter_avatar: report.reporter?.avatar_url,
        reported_user_name: report.reported_user?.display_name,
        reported_user_avatar: report.reported_user?.avatar_url,
        assigned_moderator_name: report.assigned_moderator?.display_name
      })) || [];

      setReports(processedReports);

      // Load actions
      const { data: actionsData, error: actionsError } = await supabase
        .from('moderation_actions')
        .select(`
          *,
          moderator:profiles!moderation_actions_moderator_id_fkey(
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (actionsError) throw actionsError;

      const processedActions = actionsData?.map(action => ({
        ...action,
        moderator_name: action.moderator?.display_name || 'System'
      })) || [];

      setActions(processedActions);

      // Load auto-moderation rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('auto_moderation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (rulesError) throw rulesError;
      setRules(rulesData || []);

      // Calculate stats
      const totalReports = processedReports.length;
      const pendingReports = processedReports.filter(r => r.status === 'pending').length;
      const resolvedReports = processedReports.filter(r => r.status === 'resolved').length;
      const bannedUsers = processedActions.filter(a => a.action_type === 'ban').length;
      const suspendedUsers = processedActions.filter(a => a.action_type === 'suspend').length;
      const contentRemoved = processedActions.filter(a => a.action_type === 'delete').length;
      const communityHealthScore = Math.max(0, 100 - (pendingReports * 5) - (bannedUsers * 2));

      setStats({
        total_reports: totalReports,
        pending_reports: pendingReports,
        resolved_reports: resolvedReports,
        active_moderators: 5, // Mock data
        banned_users: bannedUsers,
        suspended_users: suspendedUsers,
        content_removed: contentRemoved,
        community_health_score: communityHealthScore
      });

    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadModerationData();
  }, [loadModerationData]);

  const handleTakeAction = async (reportId: string) => {
    if (!user || !actionForm.action_type || !actionForm.reason) {
      toast({
        title: "Invalid action",
        description: "Please select an action type and provide a reason",
        variant: "destructive",
      });
      return;
    }

    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Create moderation action
      const { error: actionError } = await supabase
        .from('moderation_actions')
        .insert({
          moderator_id: user.id,
          action_type: actionForm.action_type,
          target_type: report.content_type === 'post' ? 'post' : 'user',
          target_id: report.content_id,
          target_name: report.reported_user_name || 'Content',
          reason: actionForm.reason,
          duration_days: actionForm.duration_days ? parseInt(actionForm.duration_days) : null
        });

      if (actionError) throw actionError;

      // Update report status
      const { error: reportError } = await supabase
        .from('moderation_reports')
        .update({
          status: 'resolved',
          assigned_moderator_id: user.id,
          resolution_notes: actionForm.resolution_notes
        })
        .eq('id', reportId);

      if (reportError) throw reportError;

      setShowActionDialog(false);
      loadModerationData();

      toast({
        title: "Action taken",
        description: `Successfully ${actionForm.action_type}ed ${report.reported_user_name || 'content'}`,
      });
    } catch (error) {
      console.error('Error taking action:', error);
      toast({
        title: "Error",
        description: "Failed to take action",
        variant: "destructive",
      });
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('moderation_reports')
        .update({
          status: 'dismissed',
          assigned_moderator_id: user?.id,
          resolution_notes: 'Report dismissed as unfounded'
        })
        .eq('id', reportId);

      if (error) throw error;

      loadModerationData();

      toast({
        title: "Report dismissed",
        description: "The report has been dismissed",
      });
    } catch (error) {
      console.error('Error dismissing report:', error);
      toast({
        title: "Error",
        description: "Failed to dismiss report",
        variant: "destructive",
      });
    }
  };

  const handleAssignReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('moderation_reports')
        .update({
          status: 'investigating',
          assigned_moderator_id: user?.id
        })
        .eq('id', reportId);

      if (error) throw error;

      loadModerationData();

      toast({
        title: "Report assigned",
        description: "You've been assigned to investigate this report",
      });
    } catch (error) {
      console.error('Error assigning report:', error);
      toast({
        title: "Error",
        description: "Failed to assign report",
        variant: "destructive",
      });
    }
  };

  const getFilteredReports = () => {
    return reports.filter(report => {
      const matchesSearch = report.reported_user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      const matchesSeverity = filterSeverity === 'all' || report.severity === filterSeverity;
      const matchesType = filterType === 'all' || report.content_type === filterType;

      return matchesSearch && matchesStatus && matchesSeverity && matchesType;
    });
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'investigating': 'bg-blue-100 text-blue-800',
      'resolved': 'bg-green-100 text-green-800',
      'dismissed': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getActionColor = (actionType: string) => {
    const colors: Record<string, string> = {
      'warn': 'bg-yellow-100 text-yellow-800',
      'suspend': 'bg-orange-100 text-orange-800',
      'ban': 'bg-red-100 text-red-800',
      'delete': 'bg-red-100 text-red-800',
      'hide': 'bg-gray-100 text-gray-800',
      'approve': 'bg-green-100 text-green-800',
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Community Moderation
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage community reports, take moderation actions, and maintain platform safety
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Moderator
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {stats?.community_health_score || 0}% Health
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending_reports}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved Reports</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved_reports}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Banned Users</p>
                  <p className="text-2xl font-bold text-red-600">{stats.banned_users}</p>
                </div>
                <Ban className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Community Health</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.community_health_score}%</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search reports by user, reason, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="post">Posts</SelectItem>
            <SelectItem value="comment">Comments</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="group">Groups</SelectItem>
            <SelectItem value="event">Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Auto Rules
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredReports().map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getSeverityColor(report.severity)}>
                            {report.severity}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge variant="outline">
                            {report.content_type}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium">Reported: {report.reported_user_name || 'Content'}</h3>
                          <p className="text-sm text-muted-foreground">
                            <strong>Reason:</strong> {report.reason}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Description:</strong> {report.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Content:</strong> {report.content_preview}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                          </div>
                          <div className="flex items-center gap-1">
                            <UserX className="h-3 w-3" />
                            Reported by {report.reporter_name}
                          </div>
                          {report.assigned_moderator_name && (
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Assigned to {report.assigned_moderator_name}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {report.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAssignReport(report.id)}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setShowActionDialog(true);
                              }}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Take Action
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDismissReport(report.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Dismiss
                            </Button>
                          </>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setShowReportDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="space-y-4">
            {actions.map((action) => (
              <Card key={action.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getActionColor(action.action_type)}>
                          {action.action_type}
                        </Badge>
                        <span className="font-medium">{action.target_name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({action.target_type})
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        <strong>Reason:</strong> {action.reason}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          By {action.moderator_name}
                        </div>
                        {action.duration_days && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {action.duration_days} days
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Auto-Moderation Rules</h3>
            <Button onClick={() => setShowRuleDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
          
          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{rule.rule_type}</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      
                      <div className="space-y-1">
                        <div className="text-sm">
                          <strong>Conditions:</strong> {rule.conditions.join(', ')}
                        </div>
                        <div className="text-sm">
                          <strong>Actions:</strong> {rule.actions.join(', ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Moderation Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Report Trends</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Reports</span>
                        <span className="font-medium">{stats?.total_reports}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pending</span>
                        <span className="font-medium text-orange-600">{stats?.pending_reports}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Resolved</span>
                        <span className="font-medium text-green-600">{stats?.resolved_reports}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Actions Taken</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Banned Users</span>
                        <span className="font-medium text-red-600">{stats?.banned_users}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Suspended Users</span>
                        <span className="font-medium text-orange-600">{stats?.suspended_users}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Content Removed</span>
                        <span className="font-medium text-gray-600">{stats?.content_removed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Community Health Score</h4>
                <Progress value={stats?.community_health_score || 0} className="h-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {stats?.community_health_score || 0}% - {
                    (stats?.community_health_score || 0) >= 80 ? 'Excellent' :
                    (stats?.community_health_score || 0) >= 60 ? 'Good' :
                    (stats?.community_health_score || 0) >= 40 ? 'Fair' : 'Needs Attention'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Take Moderation Action</DialogTitle>
            <DialogDescription>
              {selectedReport?.reported_user_name || 'Content'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select value={actionForm.action_type} onValueChange={(value) => setActionForm(prev => ({ ...prev, action_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="suspend">Suspend</SelectItem>
                  <SelectItem value="ban">Ban</SelectItem>
                  <SelectItem value="delete">Delete Content</SelectItem>
                  <SelectItem value="hide">Hide Content</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Explain why this action is being taken..."
                value={actionForm.reason}
                onChange={(e) => setActionForm(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            
            {(actionForm.action_type === 'suspend' || actionForm.action_type === 'ban') && (
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  placeholder="Enter duration in days"
                  value={actionForm.duration_days}
                  onChange={(e) => setActionForm(prev => ({ ...prev, duration_days: e.target.value }))}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Resolution Notes (Optional)</Label>
              <Textarea
                placeholder="Additional notes about this action..."
                value={actionForm.resolution_notes}
                onChange={(e) => setActionForm(prev => ({ ...prev, resolution_notes: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleTakeAction(selectedReport?.id || '')}>
              Take Action
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityModerationTools;
