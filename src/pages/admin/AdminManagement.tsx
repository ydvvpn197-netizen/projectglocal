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
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Shield,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  MapPin,
  Plus,
  Crown,
  UserCog,
  Settings,
  Key,
  Activity
} from 'lucide-react';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminService } from '@/services/adminService';
import { AdminUser, AdminRole } from '@/types/admin';

const AdminManagement: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const adminService = useMemo(() => new AdminService(), []);
  
  // State for admin users
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    page: 1,
    limit: 20
  });
  
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [showAdminDetails, setShowAdminDetails] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);

  // New admin form state
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    roleId: '',
    twoFactorEnabled: false,
    ipWhitelist: [] as string[]
  });

  // New role form state
  const [newRole, setNewRole] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: {} as Record<string, string[]>
  });

  useEffect(() => {
    loadData();
  }, [filters, loadData]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load admin users
      const adminUsersResponse = await adminService.getAdminUsers(
        filters.page,
        filters.limit,
        {
          search: filters.search || undefined,
          role_id: filters.role !== 'all' ? filters.role : undefined,
          is_active: filters.status !== 'all' ? filters.status === 'active' : undefined
        }
      );
      
      setAdminUsers(adminUsersResponse.data || []);
      setTotalAdmins(adminUsersResponse.pagination?.total || 0);
      
      // Load admin roles
      const roles = await adminService.getAdminRoles();
      setAdminRoles(roles);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  }, [filters, adminService]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreateAdmin = async () => {
    try {
      // First, we need to create a regular user account
      // This would typically be done through the auth service
      // For now, we'll assume the user already exists
      
      await adminService.createAdminUser(
        'user-id-here', // This should be the actual user ID
        newAdmin.roleId,
        {
          twoFactorEnabled: newAdmin.twoFactorEnabled,
          ipWhitelist: newAdmin.ipWhitelist
        }
      );
      
      setShowCreateAdmin(false);
      setNewAdmin({ email: '', roleId: '', twoFactorEnabled: false, ipWhitelist: [] });
      loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create admin user');
    }
  };

  const handleCreateRole = async () => {
    try {
      await adminService.createAdminRole(newRole);
      setShowCreateRole(false);
      setNewRole({ name: '', displayName: '', description: '', permissions: {} });
      loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create admin role');
    }
  };

  const handleAdminAction = async (adminId: string, action: string) => {
    try {
      switch (action) {
        case 'deactivate':
          await adminService.updateAdminUser(adminId, { is_active: false });
          break;
        case 'activate':
          await adminService.updateAdminUser(adminId, { is_active: true });
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
            await adminService.deleteAdminUser(adminId);
          }
          break;
        default:
          break;
      }
      
      loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to perform action');
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    );
  };

  const getRoleBadge = (roleName: string) => {
    const colors = {
      'super_admin': 'bg-purple-100 text-purple-800',
      'admin': 'bg-blue-100 text-blue-800',
      'moderator': 'bg-green-100 text-green-800',
      'support': 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={colors[roleName as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {roleName.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading && adminUsers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AdminAuthGuard requiredPermission="admin:manage">
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
            <p className="text-gray-600">Manage admin users, roles, and permissions</p>
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="admins" className="space-y-6">
            <TabsList>
              <TabsTrigger value="admins">Admin Users</TabsTrigger>
              <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="admins" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search admins..."
                        value={filters.search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {adminRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Admin
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Admin User</DialogTitle>
                          <DialogDescription>
                            Add a new administrator to the system
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input
                              value={newAdmin.email}
                              onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="admin@example.com"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Role</label>
                            <Select value={newAdmin.roleId} onValueChange={(value) => setNewAdmin(prev => ({ ...prev, roleId: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {adminRoles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.display_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowCreateAdmin(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreateAdmin}>
                              Create Admin
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Users Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Admin Users ({totalAdmins})</CardTitle>
                      <CardDescription>Platform administrators</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">{admin.profile?.full_name || 'Admin User'}</div>
                                <div className="text-sm text-gray-500">ID: {admin.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{admin.profile?.email || 'No email'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(admin.role?.name || 'admin')}</TableCell>
                          <TableCell>{getStatusBadge(admin.is_active)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{admin.last_login_at ? formatDate(admin.last_login_at) : 'Never'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{formatDate(admin.created_at)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAdmin(admin);
                                  setShowAdminDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              <Select onValueChange={(value) => handleAdminAction(admin.id, value)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="view">View Details</SelectItem>
                                  <SelectItem value="edit">Edit Admin</SelectItem>
                                  {admin.is_active ? (
                                    <SelectItem value="deactivate">Deactivate</SelectItem>
                                  ) : (
                                    <SelectItem value="activate">Activate</SelectItem>
                                  )}
                                  <SelectItem value="delete" className="text-red-600">Delete</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {adminUsers.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                      <Shield className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No admin users found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or filter criteria.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Admin Roles</CardTitle>
                      <CardDescription>Manage admin roles and permissions</CardDescription>
                    </div>
                    <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Role
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Admin Role</DialogTitle>
                          <DialogDescription>
                            Define a new role with specific permissions
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Role Name</label>
                            <Input
                              value={newRole.name}
                              onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="moderator"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Display Name</label>
                            <Input
                              value={newRole.displayName}
                              onChange={(e) => setNewRole(prev => ({ ...prev, displayName: e.target.value }))}
                              placeholder="Content Moderator"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <Input
                              value={newRole.description}
                              onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Moderate content and manage users"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowCreateRole(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreateRole}>
                              Create Role
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adminRoles.map((role) => (
                      <Card key={role.id} className="border">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{role.display_name}</CardTitle>
                            <Badge variant="secondary">{role.name}</Badge>
                          </div>
                          <CardDescription>{role.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Permissions:</div>
                            <div className="text-xs text-gray-600">
                              {Object.keys(role.permissions || {}).length} permission groups
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
};

export default AdminManagement;
