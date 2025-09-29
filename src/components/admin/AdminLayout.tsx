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
      showSidebar={true}
      showMobileNavigation={false}
      showNewsFeed={false}
      maxWidth="full"
      padding="md"
      sidebarOpen={sidebarOpen}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
    >
      {children}
    </ConsolidatedLayout>
  );
};

export default AdminLayout;
