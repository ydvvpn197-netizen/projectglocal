import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Shield,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  MapPin,
  Flag,
  AlertTriangle,
  Ban,
  CheckCircle,
  Clock,
  MessageSquare,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  UserMinus,
  UserPlus,
  Lock,
  Unlock
} from 'lucide-react';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminService } from '@/services/adminService';
import { UserProfile } from '@/services/userProfileService';

interface ModerationAction {
  id: string;
  type: 'warning' | 'suspend' | 'ban' | 'restrict' | 'unrestrict' | 'delete';
  reason: string;
  duration?: string;
  notes?: string;
  adminId: string;
  timestamp: string;
}

interface UserModerationData extends UserProfile {
  moderation_history: ModerationAction[];
  flags: Array<{
    id: string;
    type: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
    created_at: string;
    resolved: boolean;
  }>;
  restrictions: Array<{
    id: string;
    type: string;
    reason: string;
    expires_at?: string;
    is_active: boolean;
  }>;
  status: 'active' | 'suspended' | 'banned' | 'restricted' | 'pending_review';
  risk_score: number;
  last_activity: string;
  content_count: number;
  reports_received: number;
  reports_made: number;
}

const UserModeration: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const adminService = useMemo(() => new AdminService(), []);
  
  const [users, setUsers] = useState<UserModerationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    riskLevel: 'all',
    userType: 'all',
    page: 1,
    limit: 20
  });
  
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserModerationData | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  
  // Moderation action form
  const [moderationAction, setModerationAction] = useState({
    type: 'warning' as ModerationAction['type'],
    reason: '',
    duration: '',
    notes: ''
  });

  useEffect(() => {
    loadUsers();
  }, [filters, loadUsers]);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API call
      const mockUsers: UserModerationData[] = [
        {
          id: '1',
          user_id: 'user-1',
          username: 'john_doe',
          display_name: 'John Doe',
          bio: 'Local community member',
          avatar_url: null,
          location_city: 'New York',
          location_state: 'NY',
          location_country: 'USA',
          latitude: 40.7128,
          longitude: -74.0060,
          is_verified: true,
          user_type: 'user',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          moderation_history: [
            {
              id: '1',
              type: 'warning',
              reason: 'Inappropriate content',
              notes: 'Posted content that violated community guidelines',
              adminId: 'admin-1',
              timestamp: '2024-01-20T14:30:00Z'
            }
          ],
          flags: [
            {
              id: '1',
              type: 'spam',
              reason: 'Multiple similar posts',
              severity: 'medium',
              created_at: '2024-01-20T14:30:00Z',
              resolved: false
            }
          ],
          restrictions: [],
          status: 'active',
          risk_score: 3,
          last_activity: '2024-01-25T09:15:00Z',
          content_count: 45,
          reports_received: 2,
          reports_made: 0
        },
        {
          id: '2',
          user_id: 'user-2',
          username: 'artist_sarah',
          display_name: 'Sarah Artist',
          bio: 'Professional artist and creative',
          avatar_url: null,
          location_city: 'Los Angeles',
          location_state: 'CA',
          location_country: 'USA',
          latitude: 34.0522,
          longitude: -118.2437,
          is_verified: true,
          user_type: 'artist',
          created_at: '2024-01-10T08:00:00Z',
          updated_at: '2024-01-10T08:00:00Z',
          moderation_history: [],
          flags: [],
          restrictions: [],
          status: 'active',
          risk_score: 1,
          last_activity: '2024-01-25T16:45:00Z',
          content_count: 120,
          reports_received: 0,
          reports_made: 1
        }
      ];
      
      setUsers(mockUsers);
      setTotalUsers(mockUsers.length);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleModerationAction = async () => {
    if (!selectedUser) return;
    
    try {
      // Create moderation action
      const action: ModerationAction = {
        id: Date.now().toString(),
        type: moderationAction.type,
        reason: moderationAction.reason,
        duration: moderationAction.duration || undefined,
        notes: moderationAction.notes || undefined,
        adminId: adminUser?.id || 'unknown',
        timestamp: new Date().toISOString()
      };

      // Apply the moderation action
      switch (moderationAction.type) {
        case 'suspend':
          await adminService.suspendUser(selectedUser.user_id);
          break;
        case 'ban':
          // Implement ban functionality
          break;
        case 'restrict':
          // Implement restriction functionality
          break;
        case 'unrestrict':
          // Implement unrestriction functionality
          break;
        case 'delete':
          await adminService.deleteUser(selectedUser.user_id);
          break;
        default:
          break;
      }

      // Add to moderation history
      selectedUser.moderation_history.unshift(action);
      
      setShowModerationDialog(false);
      setModerationAction({ type: 'warning', reason: '', duration: '', notes: '' });
      loadUsers();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to perform moderation action');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      suspended: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      banned: { color: 'bg-red-100 text-red-800', icon: Ban },
      restricted: { color: 'bg-orange-100 text-orange-800', icon: Lock },
      pending_review: { color: 'bg-blue-100 text-blue-800', icon: AlertTriangle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getRiskScoreBadge = (score: number) => {
    if (score <= 2) return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
    if (score <= 4) return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
    return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
  };

  const getFlagSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    
    return <Badge className={colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {severity.toUpperCase()}
    </Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AdminAuthGuard requiredPermission="users:moderate">
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">User Moderation</h1>
            <p className="text-gray-600">Monitor and moderate user behavior on the platform</p>
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="flags">Content Flags</TabsTrigger>
              <TabsTrigger value="analytics">Moderation Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={filters.search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                        <SelectItem value="restricted">Restricted</SelectItem>
                        <SelectItem value="pending_review">Pending Review</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.riskLevel} onValueChange={(value) => handleFilterChange('riskLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Risk Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Risk Levels</SelectItem>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.userType} onValueChange={(value) => handleFilterChange('userType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="User Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="user">Regular Users</SelectItem>
                        <SelectItem value="artist">Artists</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Export Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Users ({totalUsers})</CardTitle>
                      <CardDescription>Platform users requiring moderation attention</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Flags</TableHead>
                        <TableHead>Reports</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {user.display_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{user.display_name || user.username}</div>
                                <div className="text-sm text-gray-500">@{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.user_type === 'artist' ? 'default' : 'secondary'}>
                              {user.user_type === 'artist' ? 'Artist' : 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>{getRiskScoreBadge(user.risk_score)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {user.flags.slice(0, 2).map((flag) => (
                                <Badge key={flag.id} variant="outline" className="text-xs">
                                  {flag.type}
                                </Badge>
                              ))}
                              {user.flags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{user.flags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Received: {user.reports_received}</div>
                              <div>Made: {user.reports_made}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{formatDate(user.last_activity)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowModerationDialog(true);
                                }}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {users.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or filter criteria.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flags" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Flags</CardTitle>
                  <CardDescription>Review flagged content and user reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Flag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No flags to review</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Content flags will appear here when users report inappropriate content.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Moderation</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">23</div>
                    <p className="text-xs text-muted-foreground">
                      Cases this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-xs text-muted-foreground">
                      +8% from last week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2.4h</div>
                    <p className="text-xs text-muted-foreground">
                      -15% improvement
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* User Details Dialog */}
          <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  Detailed information about the selected user
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Display Name</label>
                      <p className="text-sm text-gray-900">{selectedUser.display_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Username</label>
                      <p className="text-sm text-gray-900">@{selectedUser.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">User Type</label>
                      <p className="text-sm text-gray-900">{selectedUser.user_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Risk Score</label>
                      <div className="mt-1">{getRiskScoreBadge(selectedUser.risk_score)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Joined</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedUser.created_at)}</p>
                    </div>
                  </div>

                  {selectedUser.flags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Active Flags</label>
                      <div className="mt-2 space-y-2">
                        {selectedUser.flags.map((flag) => (
                          <div key={flag.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{flag.type}</div>
                              <div className="text-sm text-gray-600">{flag.reason}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getFlagSeverityBadge(flag.severity)}
                              <Badge variant={flag.resolved ? "default" : "destructive"}>
                                {flag.resolved ? "Resolved" : "Active"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedUser.moderation_history.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Moderation History</label>
                      <div className="mt-2 space-y-2">
                        {selectedUser.moderation_history.map((action) => (
                          <div key={action.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{action.type}</div>
                              <div className="text-sm text-gray-500">{formatDate(action.timestamp)}</div>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{action.reason}</div>
                            {action.notes && (
                              <div className="text-sm text-gray-500 mt-1">Notes: {action.notes}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowUserDetails(false)}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      setShowUserDetails(false);
                      setShowModerationDialog(true);
                    }}>
                      Take Action
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Moderation Action Dialog */}
          <Dialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Moderation Action</DialogTitle>
                <DialogDescription>
                  Take action against {selectedUser?.display_name || selectedUser?.username}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Action Type</label>
                  <Select value={moderationAction.type} onValueChange={(value) => setModerationAction(prev => ({ ...prev, type: value as ModerationAction['type'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="suspend">Suspend</SelectItem>
                      <SelectItem value="ban">Ban</SelectItem>
                      <SelectItem value="restrict">Restrict</SelectItem>
                      <SelectItem value="unrestrict">Unrestrict</SelectItem>
                      <SelectItem value="delete">Delete Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Reason</label>
                  <Input
                    value={moderationAction.reason}
                    onChange={(e) => setModerationAction(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Reason for this action"
                  />
                </div>

                {(moderationAction.type === 'suspend' || moderationAction.type === 'restrict') && (
                  <div>
                    <label className="text-sm font-medium">Duration</label>
                    <Select value={moderationAction.duration} onValueChange={(value) => setModerationAction(prev => ({ ...prev, duration: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">1 Day</SelectItem>
                        <SelectItem value="3d">3 Days</SelectItem>
                        <SelectItem value="1w">1 Week</SelectItem>
                        <SelectItem value="2w">2 Weeks</SelectItem>
                        <SelectItem value="1m">1 Month</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <Textarea
                    value={moderationAction.notes}
                    onChange={(e) => setModerationAction(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes for this action"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowModerationDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleModerationAction}>
                    Apply Action
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
};

export default UserModeration;
