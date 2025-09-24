# Role-Based Access Control (RBAC) System

This document describes the comprehensive Role-Based Access Control system implemented for TheGlocal project using Supabase RLS policies and TypeScript.

## Overview

The RBAC system provides:
- **Four user roles**: `user`, `moderator`, `admin`, `super_admin`
- **Row Level Security (RLS)** policies for database access control
- **TypeScript helpers** for role checking and permission management
- **React hooks and components** for frontend role-based rendering
- **Audit logging** for admin actions
- **Automatic role assignment** on user signup

## Database Schema

### Roles Table
```sql
CREATE TABLE public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);
```

### Role Enum
```sql
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'moderator', 'user');
```

### Audit Logs Table
```sql
CREATE TABLE public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid,
    details jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);
```

## Role Hierarchy and Permissions

### Role Hierarchy
1. **user** (0) - Basic user permissions
2. **moderator** (1) - Content moderation permissions
3. **admin** (2) - Administrative permissions
4. **super_admin** (3) - Full system access

### Permissions Matrix

| Permission | User | Moderator | Admin | Super Admin |
|------------|------|-----------|-------|-------------|
| `canManageUsers` | ❌ | ❌ | ✅ | ✅ |
| `canManageEvents` | ❌ | ❌ | ✅ | ✅ |
| `canManageContent` | ❌ | ✅ | ✅ | ✅ |
| `canViewAnalytics` | ❌ | ❌ | ✅ | ✅ |
| `canManageSystem` | ❌ | ❌ | ❌ | ✅ |
| `canMarkFeatured` | ❌ | ❌ | ✅ | ✅ |
| `canModerateContent` | ❌ | ✅ | ✅ | ✅ |
| `canViewAuditLogs` | ❌ | ❌ | ✅ | ✅ |

## RLS Policies

### Events Table Policies
- **Anyone can select** public events
- **Users can insert** events (own events only)
- **Users can update/delete** their own events
- **Admins can manage** all events
- **Only admins can mark** events as featured

### Roles Table Policies
- **Super admins can manage** all roles
- **Admins can select** all roles (read-only)
- **Users can select** their own role only

### Audit Logs Policies
- **Only admins can view** audit logs
- **Only super admins can insert** audit logs

## TypeScript Usage

### Basic Role Checking
```typescript
import { RBACService } from '../services/rbacService';

// Get user role
const role = await RBACService.getUserRole(userId);

// Check if user has specific role
const isAdmin = await RBACService.hasRole(userId, 'admin');

// Check if user is admin or super admin
const isAdminOrSuper = await RBACService.isAdminOrSuperAdmin(userId);

// Check if user has specific permission
const canManageUsers = await RBACService.hasPermission(userId, 'canManageUsers');
```

### React Hooks Usage
```typescript
import { useRole, useIsAdmin, useHasPermission } from '../hooks/useRBAC';

function MyComponent() {
  const { role, permissions, loading } = useRole();
  const { isAdmin } = useIsAdmin();
  const { hasPermission } = useHasPermission('canManageUsers');

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Your role: {role}</p>
      {isAdmin && <AdminPanel />}
      {hasPermission && <UserManagement />}
    </div>
  );
}
```

### React Components Usage
```typescript
import { RoleGuard, AdminOnly, PermissionGuard } from '../components/RoleGuard';

function MyPage() {
  return (
    <div>
      {/* Admin only content */}
      <AdminOnly fallback={<p>Admin access required</p>}>
        <AdminPanel />
      </AdminOnly>

      {/* Permission-based content */}
      <PermissionGuard permission="canManageUsers">
        <UserManagement />
      </PermissionGuard>

      {/* Complex role guard */}
      <RoleGuard 
        requiredRole="admin" 
        requiredPermission="canMarkFeatured"
        fallback={<p>Admin with featured permission required</p>}
      >
        <FeaturedEventManager />
      </RoleGuard>
    </div>
  );
}
```

## Database Functions

### Helper Functions
```sql
-- Get user role
SELECT public.get_user_role('user-uuid');

-- Check if user has specific role
SELECT public.has_role('user-uuid', 'admin');

-- Check if user is admin or super admin
SELECT public.is_admin_or_super_admin('user-uuid');

-- Check if user is super admin
SELECT public.is_super_admin('user-uuid');
```

### Admin Action Logging
```sql
-- Log admin action
SELECT public.log_admin_action(
  'admin-uuid',
  'update_user_role',
  'user',
  'target-user-uuid',
  '{"newRole": "admin"}'::jsonb,
  '192.168.1.1'::inet,
  'Mozilla/5.0...'
);
```

## Service Functions

### RBACService Methods
```typescript
// Role management
await RBACService.getUserRole(userId);
await RBACService.getRole(userId);
await RBACService.hasRole(userId, 'admin');
await RBACService.isAdminOrSuperAdmin(userId);
await RBACService.isSuperAdmin(userId);

// Permission checking
await RBACService.hasPermission(userId, 'canManageUsers');
await RBACService.canPerformAction('manage_users');

// Role updates (super admin only)
await RBACService.updateUserRole(userId, 'admin', adminUserId);

// Audit logging
await RBACService.logAdminAction(adminUserId, {
  action: 'update_user_role',
  resourceType: 'user',
  resourceId: userId,
  details: { newRole: 'admin' }
});

// Get audit logs (admin only)
await RBACService.getAuditLogs(100, 0);
```

## React Hooks

### Available Hooks
```typescript
// Basic role hooks
const { role, permissions, loading } = useRole();
const { hasRole, loading } = useHasRole('admin');
const { isAdmin, loading } = useIsAdmin();
const { isSuperAdmin, loading } = useIsSuperAdmin();
const { hasPermission, loading } = useHasPermission('canManageUsers');

// Action-based hooks
const { canPerform, loading } = useCanPerformAction('manage_users');

// Management hooks
const { users, updateUserRole } = useRoleManagement();
const { logs, fetchLogs } = useAuditLogs();
const { logAction } = useAdminActionLogger();
```

## Security Best Practices

### 1. Service Role Key Usage
- **Never use service role key in frontend**
- **Only use in backend/server-side code**
- **Use RLS policies for frontend access control**

### 2. Permission Checking
- **Always check permissions on both frontend and backend**
- **Use RLS policies as the primary security layer**
- **Frontend checks are for UX only**

### 3. Audit Logging
- **Log all admin actions**
- **Include IP address and user agent**
- **Store detailed action information**

### 4. Role Assignment
- **Auto-assign 'user' role on signup**
- **Only super admins can change roles**
- **Use database triggers for automatic assignment**

## Example Implementation

### 1. Event Management with RBAC
```typescript
// Create event (any authenticated user)
const createEvent = async (eventData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  return await supabase
    .from('events')
    .insert({ ...eventData, user_id: user.id });
};

// Mark event as featured (admin only)
const markAsFeatured = async (eventId) => {
  const canMark = await RBACService.canPerformAction('mark_featured');
  if (!canMark) throw new Error('Insufficient permissions');
  
  return await supabase
    .from('events')
    .update({ is_featured: true })
    .eq('id', eventId);
};
```

### 2. User Role Management
```typescript
// Update user role (super admin only)
const updateUserRole = async (userId, newRole) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const success = await RBACService.updateUserRole(userId, newRole, user.id);
  if (!success) throw new Error('Failed to update role');
  
  return success;
};
```

### 3. Admin Dashboard
```typescript
function AdminDashboard() {
  const { role, permissions } = useRole();
  const { users, updateUserRole } = useRoleManagement();
  const { logs } = useAuditLogs();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {permissions.canManageUsers && (
        <UserManagement users={users} onUpdateRole={updateUserRole} />
      )}
      
      {permissions.canViewAuditLogs && (
        <AuditLogs logs={logs} />
      )}
      
      {permissions.canManageEvents && (
        <EventManagement />
      )}
    </div>
  );
}
```

## Migration and Setup

### 1. Apply Database Migrations
The system includes three migrations:
- `rbac_system_implementation` - Creates roles table, functions, and triggers
- `rls_policies_implementation_fixed` - Implements RLS policies
- `featured_events_policy` - Adds featured events functionality

### 2. Initialize Super Admin
```sql
-- Assign super admin role to a user
INSERT INTO public.roles (user_id, role) 
VALUES ('your-user-uuid', 'super_admin');
```

### 3. Test the System
```typescript
// Test role checking
const role = await RBACService.getUserRole('test-user-id');
console.log('User role:', role);

// Test permission checking
const canManage = await RBACService.hasPermission('test-user-id', 'canManageUsers');
console.log('Can manage users:', canManage);
```

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Check if policies are properly created
   - Verify user authentication
   - Ensure role functions are working

2. **Permission Denied**
   - Verify user has correct role
   - Check RLS policies
   - Ensure proper authentication

3. **Role Not Assigned**
   - Check if trigger is working
   - Verify user signup process
   - Manually assign role if needed

### Debug Commands
```sql
-- Check user roles
SELECT * FROM public.roles WHERE user_id = 'user-uuid';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'events';

-- Test role functions
SELECT public.get_user_role('user-uuid');
SELECT public.is_admin_or_super_admin('user-uuid');
```

## Future Enhancements

1. **Role Inheritance** - Allow roles to inherit permissions
2. **Custom Permissions** - Add custom permission system
3. **Role Groups** - Group users by roles for bulk operations
4. **Time-based Roles** - Temporary role assignments
5. **API Rate Limiting** - Role-based rate limiting
6. **Multi-tenant Support** - Organization-based roles

## Support

For issues or questions about the RBAC system:
1. Check the troubleshooting section
2. Review the database logs
3. Test with the provided examples
4. Contact the development team

---

This RBAC system provides a robust, secure, and scalable foundation for role-based access control in TheGlocal project.
