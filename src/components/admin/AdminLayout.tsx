import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ConsolidatedLayout } from '@/components/layout/ConsolidatedLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { adminUser, logout } = useAdminAuth();

  return (
    <ConsolidatedLayout
      variant="admin"
      showHeader={true}
      showSidebar={true}
      showFooter={false}
      showMobileNav={false}
      maxWidth="full"
      padding="md"
    >
      {children}
    </ConsolidatedLayout>
  );
};

export default AdminLayout;
