import React, { ReactNode, useState, memo, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebarExports';
import {
  Home,
  Search,
  Plus,
  Bell,
  User,
  Menu,
  X,
  Settings,
  LogOut,
  Edit,
  Heart,
  MessageCircle,
  Calendar,
  Users,
  MapPin,
  BookOpen,
  Star,
  TrendingUp,
  Globe,
  Sparkles,
  Megaphone,
  Zap,
  Newspaper,
  Crown,
  Shield,
  HelpCircle,
  Info,
  Sun,
  Moon,
  Monitor,
  Palette,
  Volume2,
  VolumeX,
  Building2,
  Store,
  Vote,
  Scale,
  LayoutDashboard,
  Flag,
  BarChart3,
  UserCog,
  Music,
  Filter,
  Camera,
  Code,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useEnhancedTheme } from '@/components/ui/useEnhancedTheme';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsAdmin } from '@/hooks/useRBAC';
import { NotificationButton } from '@/components/NotificationButton';

// Navigation item interface
interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  featured?: boolean;
  admin?: boolean;
  mobile?: boolean;
  priority?: 'high' | 'medium' | 'low';
  group?: 'main' | 'explore' | 'features' | 'account' | 'admin';
  permission?: string;
  category?: string;
  trending?: boolean;
}

// Simplified sidebar props
interface ConsolidatedSidebarProps {
  variant?: 'main' | 'admin';
  className?: string;
}

// Navigation data for main app
const mainNavigationItems: NavigationItem[] = [
  // Main navigation
  { label: 'Feed', href: '/feed', icon: Home, priority: 'high', group: 'main', mobile: true },
  { label: 'Discover', href: '/discover', icon: Search, priority: 'high', group: 'main', mobile: true },
  { label: 'Events', href: '/events', icon: Calendar, priority: 'high', group: 'main', mobile: true },
  { label: 'Community', href: '/communities', icon: Users, priority: 'high', group: 'main', mobile: true },
  { label: 'Book Artists', href: '/booking', icon: Palette, priority: 'high', group: 'main', mobile: true },
  
  // Explore navigation
  { label: 'News', href: '/news', icon: Newspaper, priority: 'medium', group: 'explore', mobile: true },
  { label: 'Public Square', href: '/public-square', icon: Globe, priority: 'medium', group: 'explore', mobile: true },
  { label: 'Local Communities', href: '/communities', icon: Building2, priority: 'low', group: 'explore' },
  { label: 'Local Businesses', href: '/businesses', icon: Store, priority: 'low', group: 'explore' },
  { label: 'Polls', href: '/polls', icon: Vote, priority: 'low', group: 'explore' },
  { label: 'Civic Engagement', href: '/civic-engagement', icon: Megaphone, priority: 'low', group: 'explore' },
  
  // Features navigation
  { label: 'Legal Assistant', href: '/legal-assistant', icon: Scale, group: 'features' },
  { label: 'Life Wishes', href: '/life-wish', icon: Heart, group: 'features' },
  { label: 'Trending', href: '/feed?tab=trending', icon: TrendingUp, featured: true, group: 'features' },
  
  // Account navigation
  { label: 'My Dashboard', href: '/dashboard', icon: User, group: 'account' },
  { label: 'Messages', href: '/chat', icon: MessageCircle, group: 'account' },
  { label: 'Profile', href: '/profile', icon: User, group: 'account' },
  { label: 'Privacy', href: '/privacy', icon: Shield, group: 'account' },
  { label: 'Subscription', href: '/subscription', icon: Crown, group: 'account' },
  { label: 'Settings', href: '/settings', icon: Settings, group: 'account' },
];

// Admin navigation items
const adminNavigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: 'dashboard:view',
    group: 'admin'
  },
  {
    label: 'User Management',
    href: '/admin/users',
    icon: Users,
    permission: 'users:manage',
    group: 'admin'
  },
  {
    label: 'User Moderation',
    href: '/admin/user-moderation',
    icon: Shield,
    permission: 'users:moderate',
    group: 'admin'
  },
  {
    label: 'Admin Management',
    href: '/admin/admin-management',
    icon: UserCog,
    permission: 'admin:manage',
    group: 'admin'
  },
  {
    label: 'Content Moderation',
    href: '/admin/moderation',
    icon: Flag,
    permission: 'moderation:manage',
    group: 'admin'
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    permission: 'analytics:view',
    group: 'admin'
  },
  {
    label: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'settings:manage',
    group: 'admin'
  }
];

// Category icons for project sidebar
const categoryIcons: Record<string, React.ReactNode> = {
  "Visual Arts": <Palette className="h-4 w-4" />,
  "Music": <Music className="h-4 w-4" />,
  "Community": <Users className="h-4 w-4" />,
  "Street Art": <Palette className="h-4 w-4" />,
  "Food & Culture": <Heart className="h-4 w-4" />,
  "Performing Arts": <Users className="h-4 w-4" />,
  "Photography": <Camera className="h-4 w-4" />,
  "Design": <Palette className="h-4 w-4" />,
  "Technology": <Code className="h-4 w-4" />,
  "Events": <Calendar className="h-4 w-4" />,
  "Location": <MapPin className="h-4 w-4" />
};

export const ConsolidatedSidebar = memo<ConsolidatedSidebarProps>(({
  variant = 'main',
  className
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const { adminUser, logout: adminLogout } = useAdminAuth();
  const isAdmin = useIsAdmin();
  const [customFeedsOpen, setCustomFeedsOpen] = useState(true);
  const [recentOpen, setRecentOpen] = useState(true);

  // Memoized navigation items
  const navigationItems = useMemo(() => {
    return variant === 'admin' ? adminNavigationItems : mainNavigationItems;
  }, [variant]);

  // Handle logout
  const handleLogout = async () => {
    try {
      if (variant === 'admin') {
        await adminLogout();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get current user for display
  const currentUser = variant === 'admin' ? adminUser : user;


  return (
    <Sidebar className={cn("w-64 border-r border-border bg-background hidden lg:block", className)}>
      <SidebarContent className="p-0 flex flex-col h-full">
        <ScrollArea className="flex-1">
          <div className="pt-16 pb-3 px-2 space-y-1">
            {/* Primary Navigation */}
            <SidebarMenu>
              {navigationItems
                .filter(item => item.priority === 'high')
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>

            <div className="h-px bg-border my-3" />

            {/* Custom Feeds */}
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between px-3 py-1.5 h-auto font-normal text-xs text-muted-foreground hover:bg-transparent"
                onClick={() => setCustomFeedsOpen(!customFeedsOpen)}
              >
                <span className="uppercase tracking-wider">Custom Feeds</span>
                <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", customFeedsOpen && "rotate-90")} />
              </Button>

              {customFeedsOpen && (
                <div className="space-y-0.5 pl-1">
                  {navigationItems
                    .filter(item => item.priority === 'medium')
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      
                      return (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link to={item.href} className="flex items-center gap-3 px-3 py-1.5 text-sm rounded-md hover:bg-muted">
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="h-px bg-border my-3" />

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
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.href} className="flex items-center gap-3 px-3 py-1.5 text-sm rounded-md hover:bg-muted">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                          {item.featured && <span className="ml-auto text-xs text-primary">★</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </div>

            {/* Admin Section */}
            {isAdmin && variant !== 'admin' && (
              <>
                <div className="h-px bg-border my-3" />
                <div className="space-y-0.5">
                  <div className="px-3 py-1.5">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Admin</span>
                  </div>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/admin'}>
                      <Link to="/admin" className="flex items-center gap-3 px-3 py-1.5 text-sm rounded-md hover:bg-muted">
                        <Shield className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* User Profile Section */}
        {currentUser && (
          <div className="mt-auto border-t border-border p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2.5 h-auto hover:bg-muted">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={currentUser.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {String(currentUser.user_metadata?.username || currentUser.email || 'U').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm font-medium truncate w-full">
                      {String(currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'User')}
                    </span>
                    <span className="text-xs text-muted-foreground">View Profile</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" side="top">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">
                      u/{String(currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'user')}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
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
      </SidebarContent>
    </Sidebar>
  );
});

ConsolidatedSidebar.displayName = 'ConsolidatedSidebar';

export default ConsolidatedSidebar;
