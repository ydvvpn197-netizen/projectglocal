# Super Admin Setup Guide

This guide explains how to set up the user `ydvvpn197@gmail.com` as a super admin in your TheGlocal project.

## Prerequisites

1. **Environment Variables**: Make sure you have the following environment variables set:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

2. **Node.js Dependencies**: Ensure you have the required packages installed:
   ```bash
   npm install @supabase/supabase-js
   ```

## Setup Methods

### Method 1: Complete Automated Setup (Recommended)

Run the complete setup script that handles everything automatically:

```bash
node scripts/setup-super-admin-complete.js
```

This script will:
- Create or update the user account
- Set up the RBAC system
- Assign super admin role
- Configure admin dashboard access
- Verify the setup

### Method 2: Manual SQL Setup

If you prefer to run the setup manually in Supabase:

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `scripts/setup-super-admin.sql`
4. Execute the SQL script

### Method 3: Step-by-Step Setup

#### Step 1: Update User Password

```bash
node scripts/update-user-password.js
```

#### Step 2: Run RBAC Migration

Apply the RBAC migration:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the migration file in Supabase SQL Editor
# File: supabase/migrations/20250131000003_create_rbac_system.sql
```

#### Step 3: Assign Super Admin Role

Run the SQL script in Supabase SQL Editor:

```sql
-- Set up the specified user as super admin
INSERT INTO public.roles (user_id, role)
SELECT id, 'super_admin'::user_role
FROM auth.users
WHERE email = 'ydvvpn197@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'super_admin'::user_role,
    updated_at = NOW();
```

## Verification

After setup, you can verify the super admin status by running this query in Supabase SQL Editor:

```sql
SELECT 
    u.email,
    r.role,
    au.is_active as admin_active,
    ar.name as admin_role_name
FROM auth.users u
LEFT JOIN public.roles r ON u.id = r.user_id
LEFT JOIN admin_users au ON u.id = au.user_id
LEFT JOIN admin_roles ar ON au.role_id = ar.id
WHERE u.email = 'ydvvpn197@gmail.com';
```

## Login Credentials

After successful setup:
- **Email**: `ydvvpn197@gmail.com`
- **Password**: `Vip2342#`
- **Role**: `super_admin`

## Super Admin Capabilities

The super admin user will have:

### RBAC Permissions
- Full system access through the RBAC system
- Ability to manage all user roles
- Access to all protected resources
- Can create, update, and delete any content

### Admin Dashboard Access
- Access to the admin dashboard
- User management capabilities
- Content moderation tools
- Analytics and reporting
- System settings management
- Audit log access

### Database Permissions
- Can bypass Row Level Security (RLS) policies
- Access to all tables and functions
- Ability to manage other admin users
- Full CRUD operations on all resources

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   ```
   Error: Missing required environment variables
   ```
   Solution: Set `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your `.env` file

2. **User Not Found**
   ```
   User with email ydvvpn197@gmail.com not found
   ```
   Solution: The script will create the user automatically, or you can create it manually in Supabase Auth

3. **Permission Denied**
   ```
   Failed to update password: Permission denied
   ```
   Solution: Ensure you're using the service role key, not the anon key

4. **RBAC Tables Don't Exist**
   ```
   Failed to assign super admin role: relation "roles" does not exist
   ```
   Solution: Run the RBAC migration first: `supabase/migrations/20250131000003_create_rbac_system.sql`

### Manual Verification Steps

1. **Check User Exists**:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'ydvvpn197@gmail.com';
   ```

2. **Check Role Assignment**:
   ```sql
   SELECT * FROM public.roles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ydvvpn197@gmail.com');
   ```

3. **Check Admin Access**:
   ```sql
   SELECT * FROM admin_users WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ydvvpn197@gmail.com');
   ```

4. **Test Super Admin Function**:
   ```sql
   SELECT public.is_super_admin((SELECT id FROM auth.users WHERE email = 'ydvvpn197@gmail.com'));
   ```

## Security Notes

- The service role key has full database access - keep it secure
- The super admin password should be changed after initial setup
- Consider setting up 2FA for the super admin account
- Regularly audit super admin actions through the audit logs

## Files Created

- `supabase/migrations/20250131000003_create_rbac_system.sql` - RBAC system migration
- `scripts/setup-super-admin-complete.js` - Complete automated setup script
- `scripts/setup-super-admin.sql` - Manual SQL setup script
- `scripts/update-user-password.js` - Password update script
- `scripts/setup-super-admin.js` - Alternative setup script

## Support

If you encounter any issues during setup, check the troubleshooting section above or review the error messages for specific guidance.
