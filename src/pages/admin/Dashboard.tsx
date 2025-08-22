// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Shield,
  Activity,
  BarChart3,
  Settings,
  UserCheck,
  MessageSquare,
  Eye,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminService } from '@/services/adminService';
import { AdminDashboardState, PlatformMetrics } from '@/types/admin';

const AdminDashboard: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const adminService = new AdminService();
  const [state, setState] = useState<AdminDashboardState>({
    isLoading: true,
    error: null,
    stats: {
      totalUsers: 0,
      activeUsers: 0,
      newUsersToday: 0,
      totalContent: 0,
      pendingReports: 0,
      totalEvents: 0,
      totalPosts: 0,
      totalReviews: 0
    },
    recentActivity: [],
    systemHealth: {
      status: 'healthy',
      uptime: 0,
      responseTime: 0,
      errorRate: 0
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Load dashboard statistics
      const stats = await adminService.getDashboardStats();
      
      // Load recent admin actions
      const recentActions = await adminService.getAdminActions({
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      // Load system health (mock data for now)
      const systemHealth = {
        status: 'healthy' as const,
        uptime: 99.9,
        responseTime: 150,
        errorRate: 0.1
      };

      setState(prev => ({
        ...prev,
        isLoading: false,
        stats,
        recentActivity: recentActions.data || [],
        systemHealth
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data'
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{state.error}</p>
            <Button onClick={loadDashboardData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminAuthGuard requiredPermission="dashboard:view">
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {adminUser?.profile?.full_name || 'Admin'}!</h1>
            <p className="text-gray-600">Here's what's happening on your platform today.</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="system">System Health</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{state.stats.totalUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      +{state.stats.newUsersToday} today
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{state.stats.activeUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {((state.stats.activeUsers / state.stats.totalUsers) * 100).toFixed(1)}% engagement
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{state.stats.totalContent.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Posts, Events, Reviews
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{state.stats.pendingReports}</div>
                    <p className="text-xs text-muted-foreground">
                      Require attention
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Content Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Distribution</CardTitle>
                    <CardDescription>Breakdown by content type</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Posts</span>
                      <span className="text-sm text-muted-foreground">{state.stats.totalPosts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Events</span>
                      <span className="text-sm text-muted-foreground">{state.stats.totalEvents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Reviews</span>
                      <span className="text-sm text-muted-foreground">{state.stats.totalReviews}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common admin tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Review Reports
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      System Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Platform health overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                      {getStatusIcon(state.systemHealth.status)}
                      <Badge className={getStatusColor(state.systemHealth.status)}>
                        {state.systemHealth.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Uptime:</span>
                        <span>{state.systemHealth.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>{state.systemHealth.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Rate:</span>
                        <span>{state.systemHealth.errorRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Admin Activity</CardTitle>
                  <CardDescription>Latest actions taken by administrators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {state.recentActivity.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No recent activity</p>
                    ) : (
                      state.recentActivity.map((action) => (
                        <div key={action.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            <Shield className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {action.action_type}
                            </p>
                            <p className="text-sm text-gray-500">
                              {action.resource_type}: {action.resource_id}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(action.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Badge variant={action.success ? "default" : "destructive"}>
                              {action.success ? "Success" : "Failed"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Real-time system performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>CPU Usage</span>
                          <span>45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Memory Usage</span>
                          <span>62%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Disk Usage</span>
                          <span>28%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Error Logs</CardTitle>
                    <CardDescription>Recent system errors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm p-3 bg-red-50 border border-red-200 rounded">
                        <div className="font-medium text-red-800">Database Connection Timeout</div>
                        <div className="text-red-600">2 minutes ago</div>
                      </div>
                      <div className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="font-medium text-yellow-800">High Memory Usage Warning</div>
                        <div className="text-yellow-600">15 minutes ago</div>
                      </div>
                      <div className="text-sm p-3 bg-green-50 border border-green-200 rounded">
                        <div className="font-medium text-green-800">All systems operational</div>
                        <div className="text-green-600">1 hour ago</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
};

export default AdminDashboard;
