import React from 'react';
import { AdminLogin } from '@/components/admin/AdminLogin';

/**
 * Admin Login Page
 * 
 * This is a standalone admin login page that's separate from the main application.
 * It provides secure access to the admin dashboard without requiring regular user authentication.
 */
const AdminLoginPage: React.FC = () => {
  return <AdminLogin />;
};

export default AdminLoginPage;
