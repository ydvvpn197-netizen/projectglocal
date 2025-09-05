import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Shield, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Home
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { NotificationBell } from '@/components/NotificationBell';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onMenuToggle,
  isMenuOpen = false
}) => {
  const { adminUser, logout } = useAdminAuth();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/admin')) {
      const segments = path.split('/').filter(Boolean);
      if (segments.length > 1) {
        const page = segments[1];
        return page.charAt(0).toUpperCase() + page.slice(1);
      }
    }
    return 'Dashboard';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left side - Menu toggle and title */}
        <div className="flex items-center gap-4">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="lg:hidden"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}

          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Glocal Logo" 
              className="h-6 w-6 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">{title || 'Admin Dashboard'}</h1>
              <p className="text-sm text-muted-foreground">{subtitle || getPageTitle()}</p>
            </div>
          </div>
        </div>

        {/* Center - Breadcrumb navigation */}
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/admin" className="flex items-center gap-1 hover:text-foreground">
            <Home className="h-4 w-4" />
            Admin
          </Link>
          {location.pathname !== '/admin' && (
            <>
              <span>/</span>
              <span className="text-foreground">{getPageTitle()}</span>
            </>
          )}
        </div>

        {/* Right side - User menu and notifications */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationBell />

          {/* User menu */}
          {adminUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={adminUser.profile?.avatar_url} 
                      alt={adminUser.profile?.full_name || 'Admin'} 
                    />
                    <AvatarFallback>
                      {adminUser.profile?.full_name 
                        ? getInitials(adminUser.profile.full_name)
                        : 'AD'
                      }
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {adminUser.profile?.full_name || 'Administrator'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {adminUser.profile?.email}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {adminUser.role?.display_name || 'Admin'}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
