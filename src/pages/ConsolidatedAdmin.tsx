import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Settings, 
  Shield, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Minus,
  Ban,
  Unlock,
  Crown,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  MessageSquare,
  Calendar,
  DollarSign,
  Globe,
  Lock,
  UserCheck,
  UserX,
  Flag,
  AlertCircle,
  Info,
  Zap,
  Target,
  Award,
  BookOpen,
  Music,
  Camera,
  Mic,
  Coffee,
  Car,
  Building,
  Leaf,
  Mountain,
  Navigation,
  Compass,
  Hash,
  AtSign,
  ExternalLink,
  BookOpen as BookOpenIcon,
  Music as MusicIcon,
  Camera as CameraIcon,
  Mic as MicIcon,
  Coffee as CoffeeIcon,
  Car as CarIcon,
  Building as BuildingIcon,
  Leaf as LeafIcon,
  Mountain as MountainIcon,
  Globe as GlobeIcon,
  UserPlus,
  Crown as CrownIcon,
  Sparkles,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon,
  BarChart3 as BarChart3Icon,
  MessageSquare as MessageSquareIcon,
  Navigation as NavigationIcon,
  Compass as CompassIcon,
  Flag as FlagIcon,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  ExternalLink as ExternalLinkIcon,
  BookOpen as BookOpenIcon2,
  Music as MusicIcon2,
  Camera as CameraIcon2,
  Mic as MicIcon2,
  Coffee as CoffeeIcon2,
  Car as CarIcon2,
  Building as BuildingIcon2,
  Leaf as LeafIcon2,
  Mountain as MountainIcon2,
  Globe as GlobeIcon2,
  UserPlus as UserPlusIcon,
  Crown as CrownIcon2,
  Sparkles as SparklesIcon,
  TrendingUp as TrendingUpIcon2,
  TrendingDown as TrendingDownIcon2,
  Activity as ActivityIcon2,
  BarChart3 as BarChart3Icon2,
  MessageSquare as MessageSquareIcon2,
  Navigation as NavigationIcon2,
  Compass as CompassIcon2,
  Flag as FlagIcon2,
  Hash as HashIcon2,
  AtSign as AtSignIcon2,
  ExternalLink as ExternalLinkIcon2,
  BookOpen as BookOpenIcon3,
  Music as MusicIcon2,
  Camera as CameraIcon2,
  Mic as MicIcon2,
  Coffee as CoffeeIcon2,
  Car as CarIcon2,
  Building as BuildingIcon2,
  Leaf as LeafIcon2,
  Mountain as MountainIcon2,
  Globe as GlobeIcon3,
  UserPlus as UserPlusIcon2,
  Crown as CrownIcon3,
  Sparkles as SparklesIcon2,
  TrendingUp as TrendingUpIcon3,
  TrendingDown as TrendingDownIcon3,
  Activity as ActivityIcon3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalArtists: number;
  totalBookings: number;
  totalRevenue: number;
  pendingModeration: number;
  systemHealth: number;
  storageUsed: number;
  apiCalls: number;
  errorRate: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'user' | 'artist';
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
  lastActive: string;
  isVerified: boolean;
  reportCount: number;
}

interface ModerationItem {
  id: string;
  type: 'user' | 'post' | 'comment' | 'event' | 'community';
  title: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: string;
  isResolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const ConsolidatedAdmin: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'moderation' | 'analytics' | 'settings' | 'system'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalArtists: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingModeration: 0,
    systemHealth: 100,
    storageUsed: 0,
    apiCalls: 0,
    errorRate: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load admin data
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadStats(),
          loadUsers(),
          loadModerationItems(),
          loadSystemAlerts()
        ]);
      } catch (err) {
        setError('Failed to load admin data');
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const loadStats = async () => {
    try {
      // Load user stats
      const { data: userStats } = await supabase
        .from('profiles')
        .select('id, is_artist, created_at, last_sign_in_at');
      
      const { data: bookingStats } = await supabase
        .from('bookings')
        .select('id, status, created_at');
      
      const { data: paymentStats } = await supabase
        .from('payments')
        .select('amount, status');
      
      const totalUsers = userStats?.length || 0;
      const totalArtists = userStats?.filter(u => u.is_artist).length || 0;
      const activeUsers = userStats?.filter(u => u.last_sign_in_at && 
        new Date(u.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0;
      const totalBookings = bookingStats?.length || 0;
      const totalRevenue = paymentStats?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      
      setStats({
        totalUsers,
        activeUsers,
        totalArtists,
        totalBookings,
        totalRevenue,
        pendingModeration: 0, // Mock data
        systemHealth: 98, // Mock data
        storageUsed: 45, // Mock data
        apiCalls: 1250, // Mock data
        errorRate: 0.2 // Mock data
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      const mockUsers: User[] = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email || 'N/A',
        name: profile.full_name || 'Anonymous',
        avatar: profile.avatar_url,
        role: profile.is_artist ? 'artist' : 'user',
        status: 'active',
        createdAt: profile.created_at,
        lastActive: profile.last_sign_in_at || profile.created_at,
        isVerified: profile.is_verified || false,
        reportCount: 0 // Mock data
      })) || [];
      
      setUsers(mockUsers);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadModerationItems = async () => {
    try {
      // Mock moderation items
      const mockItems: ModerationItem[] = [
        {
          id: '1',
          type: 'post',
          title: 'Inappropriate Content',
          description: 'Post contains offensive language',
          reportedBy: 'user123',
          reportedAt: new Date().toISOString(),
          status: 'pending',
          severity: 'medium',
          content: 'This is a sample post content...',
          author: {
            id: 'author1',
            name: 'John Doe',
            avatar: '/api/placeholder/32/32'
          }
        }
      ];
      
      setModerationItems(mockItems);
    } catch (err) {
      console.error('Error loading moderation items:', err);
    }
  };

  const loadSystemAlerts = async () => {
    try {
      // Mock system alerts
      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'High API Usage',
          description: 'API calls are approaching rate limit',
          timestamp: new Date().toISOString(),
          isResolved: false,
          severity: 'medium'
        },
        {
          id: '2',
          type: 'error',
          title: 'Database Connection Issue',
          description: 'Intermittent database connection problems detected',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isResolved: true,
          severity: 'high'
        }
      ];
      
      setSystemAlerts(mockAlerts);
    } catch (err) {
      console.error('Error loading system alerts:', err);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'ban' | 'verify' | 'unverify') => {
    try {
      // Mock user action
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { 
              ...u, 
              status: action === 'suspend' ? 'suspended' : action === 'ban' ? 'banned' : u.status,
              isVerified: action === 'verify' ? true : action === 'unverify' ? false : u.isVerified
            }
          : u
      ));
      
      toast({
        title: "User Updated",
        description: `User ${action} action completed successfully`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleModerationAction = async (itemId: string, action: 'approve' | 'reject' | 'escalate') => {
    try {
      setModerationItems(prev => prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              status: action === 'approve' ? 'resolved' : action === 'reject' ? 'dismissed' : 'reviewed'
            }
          : item
      ));
      
      toast({
        title: "Moderation Action",
        description: `Item ${action} action completed successfully`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to process moderation action",
        variant: "destructive",
      });
    }
  };

  const handleSystemAlertResolve = async (alertId: string) => {
    try {
      setSystemAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, isResolved: true }
          : alert
      ));
      
      toast({
        title: "Alert Resolved",
        description: "System alert has been marked as resolved",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Artists</p>
                <p className="text-2xl font-bold">{stats.totalArtists}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Health</span>
                  <span className="text-sm text-gray-600">{stats.systemHealth}%</span>
                </div>
                <Progress value={stats.systemHealth} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.apiCalls}</p>
                  <p className="text-sm text-gray-600">API Calls</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.errorRate}%</p>
                  <p className="text-sm text-gray-600">Error Rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
            <CardDescription>Current storage utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Storage Used</span>
                  <span className="text-sm text-gray-600">{stats.storageUsed}%</span>
                </div>
                <Progress value={stats.storageUsed} className="h-2" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">45GB of 100GB used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Alerts</CardTitle>
          <CardDescription>Latest system notifications and warnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  alert.type === 'error' ? 'bg-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-500' :
                  alert.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{alert.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                      {alert.isResolved && (
                        <Badge variant="default">Resolved</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleDateString()}
                  </p>
                </div>
                {!alert.isResolved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSystemAlertResolve(alert.id)}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="artist">Artist</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map(user => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{user.name}</h4>
                      {user.isVerified && (
                        <Badge variant="default" className="text-xs">Verified</Badge>
                      )}
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    user.status === 'active' ? 'default' :
                    user.status === 'suspended' ? 'secondary' : 'destructive'
                  }>
                    {user.status}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUserAction(user.id, 'suspend')}
                      disabled={user.status === 'suspended'}
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUserAction(user.id, 'verify')}
                      disabled={user.isVerified}
                    >
                      <UserCheck className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderModeration = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Content Moderation</h3>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">{stats.pendingModeration} Pending</Badge>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {moderationItems.map(item => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    item.severity === 'critical' ? 'destructive' :
                    item.severity === 'high' ? 'destructive' :
                    item.severity === 'medium' ? 'secondary' : 'outline'
                  }>
                    {item.severity}
                  </Badge>
                  <Badge variant={
                    item.status === 'pending' ? 'destructive' :
                    item.status === 'reviewed' ? 'secondary' : 'default'
                  }>
                    {item.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={item.author.avatar} />
                    <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{item.author.name}</p>
                    <p className="text-xs text-gray-500">
                      Reported by {item.reportedBy} • {new Date(item.reportedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{item.content}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModerationAction(item.id, 'approve')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModerationAction(item.id, 'reject')}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModerationAction(item.id, 'escalate')}
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Escalate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>User registration trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-2xl font-bold">+{stats.totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Platform revenue and transaction metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <DollarSign className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Configure platform-wide settings and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" defaultValue="TheGlocal" />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input id="siteDescription" defaultValue="Privacy-first community platform" />
            </div>
          </div>
          <div>
            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            <Select defaultValue="disabled">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Storage Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-yellow-600">Warning</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Admin Panel</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your platform and monitor system health</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Admin</Badge>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {renderUsers()}
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            {renderModeration()}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {renderAnalytics()}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {renderSettings()}
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            {renderSystem()}
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default ConsolidatedAdmin;
