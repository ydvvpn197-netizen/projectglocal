/**
 * RBAC Example Component
 * Demonstrates how to use the Role-Based Access Control system
 */

import React from 'react';
import { 
  RoleGuard, 
  AdminOnly, 
  SuperAdminOnly, 
  ModeratorOnly, 
  PermissionGuard
} from '../RoleGuard';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useRole, useIsAdmin, useHasPermission } from '../../hooks/useRBAC';

export function RBACExample() {
  const { role, permissions, loading } = useRole();
  const { isAdmin } = useIsAdmin();
  const { hasPermission } = useHasPermission('canManageUsers');

  if (loading) {
    return <div>Loading user permissions...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">RBAC System Example</h1>
      
      {/* Current User Info */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Current User</h2>
        <p><strong>Role:</strong> {role || 'No role assigned'}</p>
        <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
        <p><strong>Can Manage Users:</strong> {hasPermission ? 'Yes' : 'No'}</p>
      </div>

      {/* Role-based Content Examples */}
      <div className="space-y-6">
        
        {/* Admin Only Content */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Admin Only Content</h3>
          <AdminOnly fallback={<p className="text-gray-500">You need admin privileges to see this content.</p>}>
            <div className="bg-green-100 p-3 rounded">
              <p>🎉 You are an admin! You can see this special content.</p>
              <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Admin Action
              </button>
            </div>
          </AdminOnly>
        </div>

        {/* Super Admin Only Content */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Super Admin Only Content</h3>
          <SuperAdminOnly fallback={<p className="text-gray-500">You need super admin privileges to see this content.</p>}>
            <div className="bg-purple-100 p-3 rounded">
              <p>👑 You are a super admin! You have ultimate privileges.</p>
              <button className="mt-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                Super Admin Action
              </button>
            </div>
          </SuperAdminOnly>
        </div>

        {/* Moderator Only Content */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Moderator Only Content</h3>
          <ModeratorOnly fallback={<p className="text-gray-500">You need moderator privileges to see this content.</p>}>
            <div className="bg-yellow-100 p-3 rounded">
              <p>🛡️ You are a moderator! You can moderate content.</p>
              <button className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                Moderate Content
              </button>
            </div>
          </ModeratorOnly>
        </div>

        {/* Permission-based Content */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Permission-based Content</h3>
          <PermissionGuard 
            permission="canManageUsers" 
            fallback={<p className="text-gray-500">You don't have permission to manage users.</p>}
          >
            <div className="bg-blue-100 p-3 rounded">
              <p>👥 You can manage users!</p>
              <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Manage Users
              </button>
            </div>
          </PermissionGuard>
        </div>

        {/* Complex Role Guard Example */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Complex Role Guard</h3>
          <RoleGuard 
            requiredRole="admin"
            requiredPermission="canMarkFeatured"
            fallback={<p className="text-gray-500">You need admin role and can mark featured permission.</p>}
          >
            <div className="bg-indigo-100 p-3 rounded">
              <p>⭐ You can mark events as featured!</p>
              <button className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
                Mark as Featured
              </button>
            </div>
          </RoleGuard>
        </div>

        {/* Multiple Requirements (Any) */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Multiple Requirements (Any)</h3>
          <RoleGuard 
            requiredRole="moderator"
            requireAdmin={true}
            requireAny={true}
            fallback={<p className="text-gray-500">You need to be either a moderator OR an admin.</p>}
          >
            <div className="bg-orange-100 p-3 rounded">
              <p>🔧 You have moderation or admin privileges!</p>
              <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                Moderate or Admin Action
              </button>
            </div>
          </RoleGuard>
        </div>

        {/* Using useRoleGuard Hook */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Using useRoleGuard Hook</h3>
          <RoleGuardExample />
        </div>

        {/* Event Management Example */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Event Management</h3>
          <EventManagementExample />
        </div>
      </div>
    </div>
  );
}

/**
 * Example component using the useRoleGuard hook
 */
function RoleGuardExample() {
  const { hasAccess, loading, role } = useRoleGuard({
    requiredRole: 'admin',
    requireAny: false
  });

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {hasAccess ? (
        <div className="bg-green-100 p-3 rounded">
          <p>✅ You have admin access! (Current role: {role})</p>
          <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Admin Function
          </button>
        </div>
      ) : (
        <p className="text-gray-500">❌ You don't have admin access. (Current role: {role})</p>
      )}
    </div>
  );
}

/**
 * Example component for event management with RBAC
 */
function EventManagementExample() {
  const { role, permissions } = useRole();

  return (
    <div className="space-y-4">
      {/* Create Event - Available to all authenticated users */}
      <div className="bg-gray-100 p-3 rounded">
        <h4 className="font-semibold">Create Event</h4>
        <p className="text-sm text-gray-600 mb-2">Available to all users</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create Event
        </button>
      </div>

      {/* Mark as Featured - Admin only */}
      <RoleGuard 
        requiredPermission="canMarkFeatured"
        fallback={
          <div className="bg-gray-100 p-3 rounded">
            <h4 className="font-semibold">Mark as Featured</h4>
            <p className="text-sm text-gray-600 mb-2">Admin only</p>
            <button disabled className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
              Mark as Featured
            </button>
          </div>
        }
      >
        <div className="bg-green-100 p-3 rounded">
          <h4 className="font-semibold">Mark as Featured</h4>
          <p className="text-sm text-gray-600 mb-2">Admin only</p>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Mark as Featured
          </button>
        </div>
      </RoleGuard>

      {/* Manage All Events - Admin only */}
      <RoleGuard 
        requiredPermission="canManageEvents"
        fallback={
          <div className="bg-gray-100 p-3 rounded">
            <h4 className="font-semibold">Manage All Events</h4>
            <p className="text-sm text-gray-600 mb-2">Admin only</p>
            <button disabled className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
              Manage All Events
            </button>
          </div>
        }
      >
        <div className="bg-purple-100 p-3 rounded">
          <h4 className="font-semibold">Manage All Events</h4>
          <p className="text-sm text-gray-600 mb-2">Admin only</p>
          <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            Manage All Events
          </button>
        </div>
      </RoleGuard>

      {/* System Settings - Super Admin only */}
      <SuperAdminOnly fallback={
        <div className="bg-gray-100 p-3 rounded">
          <h4 className="font-semibold">System Settings</h4>
          <p className="text-sm text-gray-600 mb-2">Super Admin only</p>
          <button disabled className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
            System Settings
          </button>
        </div>
      }>
        <div className="bg-red-100 p-3 rounded">
          <h4 className="font-semibold">System Settings</h4>
          <p className="text-sm text-gray-600 mb-2">Super Admin only</p>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            System Settings
          </button>
        </div>
      </SuperAdminOnly>
    </div>
  );
}
