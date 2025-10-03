import React, { ReactNode, memo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Search,
  Calendar,
  Users,
  Palette,
  Newspaper,
  Globe,
  Building2,
  Store,
  Vote,
  Megaphone,
  Scale,
  Heart,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Shield,
  LayoutDashboard,
  BarChart3,
  UserCog,
  Flag
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useIsAdmin } from '@/hooks/useRBAC';

interface OptimizedSidebarProps {
  variant?: 'main' | 'admin';
  className?: string;
}

// Simplified navigation structure
const mainNavItems = [
  { label: 'Home', href: '/feed', icon: Home, priority: 'high' },
  { label: 'Discover', href: '/discover', icon: Search, priority: 'high' },
  { label: 'Events', href: '/events', icon: Calendar, priority: 'high' },
  { label: 'Community', href: '/community', icon: Users, priority: 'high' },
  { label: 'Book Artists', href: '/book-artist', icon: Palette, priority: 'high' },
  { label: 'News', href: '/news', icon: Newspaper, priority: 'medium' },
  { label: 'Public Square', href: '/public-square', icon: Globe, priority: 'medium' },
  { label: 'Communities', href: '/communities', icon: Building2, priority: 'low' },
  { label: 'Businesses', href: '/businesses', icon: Store, priority: 'low' },
  { label: 'Polls', href: '/polls', icon: Vote, priority: 'low' },
  { label: 'Civic Engagement', href: '/civic-engagement', icon: Megaphone, priority: 'low' },
  { label: 'Legal Assistant', href: '/legal-assistant', icon: Scale, priority: 'low' },
  { label: 'Life Wishes', href: '/life-wish', icon: Heart, priority: 'low' },
  { label: 'Trending', href: '/feed?tab=trending', icon: TrendingUp, priority: 'low', featured: true }
];

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'User Management', href: '/admin/users', icon: Users },
  { label: 'User Moderation', href: '/admin/user-moderation', icon: Shield },
  { label: 'Admin Management', href: '/admin/admin-management', icon: UserCog },
  { label: 'Content Moderation', href: '/admin/moderation', icon: Flag },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings }
];

export const OptimizedSidebar = memo<OptimizedSidebarProps>(({
  variant = 'main',
  className
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const { adminUser, logout: adminLogout } = useAdminAuth();
  const isAdmin = useIsAdmin();
  const [customFeedsOpen, setCustomFeedsOpen] = useState(true);
  const [recentOpen, setRecentOpen] = useState(true);

  const navigationItems = variant === 'admin' ? adminNavItems : mainNavItems;
  const currentUser = variant === 'admin' ? adminUser : user;

  const handleLogout = async () => {
    try {
      if (variant === 'admin') {
        await adminLogout();
      } else {
        // Handle regular user logout
        console.log('User logged out');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={cn(
      'w-64 h-screen border-r border-border bg-background hidden lg:block',
      className
    )}>
      <ScrollArea className="h-full">
        <div className="p-4 space-y-2">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-6">
            <img src="/logo.png" alt="TheGlocal" className="h-8 w-8" />
            <span className="text-lg font-semibold">TheGlocal</span>
          </div>

          {/* Primary Navigation */}
          <div className="space-y-1">
            {navigationItems
              .filter(item => item.priority === 'high')
              .map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </div>

          {/* Divider */}
          <div className="h-px bg-border my-4" />

          {/* Custom Feeds */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between px-3 py-1.5 h-auto font-normal text-xs text-muted-foreground hover:bg-transparent"
              onClick={() => setCustomFeedsOpen(!customFeedsOpen)}
            >
              <span className="uppercase tracking-wider">Custom Feeds</span>
              <ChevronRight className={cn(
                "h-3.5 w-3.5 transition-transform",
                customFeedsOpen && "rotate-90"
              )} />
            </Button>

            {customFeedsOpen && (
              <div className="space-y-0.5 pl-1">
                {navigationItems
                  .filter(item => item.priority === 'medium')
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-1.5 text-sm rounded-md transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-border my-4" />

          {/* Features */}
          <div className="space-y-0.5">
            <div className="px-3 py-1.5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Features</span>
            </div>

            {navigationItems
              .filter(item => item.priority === 'low')
              .map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.featured && (
                      <span className="ml-auto text-xs text-primary">★</span>
                    )}
                  </Link>
                );
              })}
          </div>

          {/* Admin Section */}
          {isAdmin && variant !== 'admin' && (
            <>
              <div className="h-px bg-border my-4" />
              <div className="space-y-0.5">
                <div className="px-3 py-1.5">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Admin</span>
                </div>
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* User Profile Section */}
      {currentUser && (
        <div className="border-t border-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2.5 h-auto hover:bg-muted">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={currentUser.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {currentUser.user_metadata?.username?.charAt(0) || 
                     currentUser.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm font-medium truncate w-full">
                    {currentUser.user_metadata?.username || 
                     currentUser.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    View Profile
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side="top">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">
                    u/{currentUser.user_metadata?.username || currentUser.email?.split('@')[0]}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
});

OptimizedSidebar.displayName = 'OptimizedSidebar';
