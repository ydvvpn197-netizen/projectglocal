/**
 * Role Management Component
 * Allows super admins to manage user roles
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Users, Search, Crown, User, UserCheck, UserX } from 'lucide-react';
import { useAdmin } from '@/hooks/useRBAC';
import { UserRole } from '@/services/rbacService';

interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_login?: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  timestamp: string;
}

export function RoleManagement() {
  const { isSuperAdmin, loading, getAllUsers, promoteUser, demoteUser, getAuditLogs } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers();
      loadAuditLogs();
    }
  }, [isSuperAdmin, loadUsers, loadAuditLogs]);

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      const userData = await getAllUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, [getAllUsers]);

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const logs = await getAuditLogs(20, 0);
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  }, [getAuditLogs]);

  const handlePromoteUser = async (userId: string, newRole: UserRole) => {
    try {
      await promoteUser(userId, newRole);
      await loadUsers();
      await loadAuditLogs();
    } catch (error) {
      console.error('Error promoting user:', error);
      setError('Failed to promote user');
    }
  };

  const handleDemoteUser = async (userId: string) => {
    try {
      await demoteUser(userId);
      await loadUsers();
      await loadAuditLogs();
    } catch (error) {
      console.error('Error demoting user:', error);
      setError('Failed to demote user');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4 text-purple-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'moderator':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-green-100 text-green-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user =>
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Only super administrators can access role management.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Crown className="h-6 w-6 text-purple-500" />
            <span>Role Management</span>
          </h2>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Users & Roles</span>
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={loadUsers} disabled={loadingUsers}>
              {loadingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>

          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{user.display_name || 'Unknown User'}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleIcon(user.role)}
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.role !== 'super_admin' && (
                    <>
                      <Select onValueChange={(value) => handlePromoteUser(user.user_id, value as UserRole)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Promote to..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDemoteUser(user.user_id)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && !loadingUsers && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admin Actions</CardTitle>
          <CardDescription>
            Audit trail of administrative actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{log.admin_user?.email}</span>
                      <Badge variant="outline">{log.action}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {log.target_type}: {log.target_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                    {log.details && (
                      <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}

              {auditLogs.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No audit logs found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
