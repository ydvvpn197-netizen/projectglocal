import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
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

// Sidebar variant types
type SidebarVariant = 'main' | 'admin' | 'project' | 'mobile';

// Consolidated sidebar props
interface ConsolidatedSidebarProps {
  variant?: SidebarVariant;
  isOpen?: boolean;
  isMobile?: boolean;
  customContent?: ReactNode;
  className?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  showCreateButton?: boolean;
  // Project sidebar specific props
  categories?: string[];
  trendingProjects?: Array<{
    id: number;
    title: string;
    artist: string;
    image: string;
    likes: number;
  }>;
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
  onProjectClick?: (projectId: number) => void;
}

// Navigation data for main app
const mainNavigationItems: NavigationItem[] = [
  // Main navigation
  { label: 'Feed', href: '/feed', icon: Home, priority: 'high', group: 'main', mobile: true },
  { label: 'Discover', href: '/discover', icon: Search, priority: 'high', group: 'main', mobile: true },
  { label: 'Events', href: '/events', icon: Calendar, priority: 'high', group: 'main', mobile: true },
  { label: 'Community', href: '/community', icon: Users, priority: 'high', group: 'main', mobile: true },
  { label: 'Book Artists', href: '/book-artist', icon: Palette, priority: 'high', group: 'main', mobile: true },
  
  // Explore navigation
  { label: 'News', href: '/news', icon: Newspaper, priority: 'medium', group: 'explore', mobile: true },
  { label: 'Public Square', href: '/public-square', icon: Globe, priority: 'low', group: 'explore' },
  { label: 'Local Communities', href: '/communities', icon: Building2, priority: 'low', group: 'explore' },
  { label: 'Local Businesses', href: '/businesses', icon: Store, priority: 'low', group: 'explore' },
  { label: 'Polls', href: '/polls', icon: Vote, priority: 'low', group: 'explore' },
  { label: 'Civic Engagement', href: '/civic-engagement', icon: Megaphone, priority: 'low', group: 'explore' },
  
  // Features navigation
  { label: 'Legal Assistant', href: '/legal-assistant', icon: Scale, group: 'features' },
  { label: 'Life Wishes', href: '/life-wish', icon: Heart, group: 'features' },
  { label: 'Trending', href: '/feed?tab=trending', icon: TrendingUp, featured: true, group: 'features' },
  
  // Account navigation
  { label: 'My Dashboard', href: '/my-dashboard', icon: User, group: 'account' },
  { label: 'Messages', href: '/messages', icon: MessageCircle, group: 'account' },
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

export const ConsolidatedSidebar: React.FC<ConsolidatedSidebarProps> = ({
  variant = 'main',
  isOpen = true,
  isMobile = false,
  customContent,
  className,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  showCreateButton = true,
  categories = [],
  trendingProjects = [],
  onSearch,
  onCategorySelect,
  onProjectClick,
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const { adminUser, logout: adminLogout } = useAdminAuth();
  const { counts } = useNotifications();
  const isAdmin = useIsAdmin();
  const { theme, setTheme } = useEnhancedTheme();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Projects");

  // Get navigation items based on variant
  const getNavigationItems = (): NavigationItem[] => {
    switch (variant) {
      case 'admin':
        return adminNavigationItems;
      case 'main':
      default:
        return mainNavigationItems.filter(item => {
          // Hide Analytics for non-admin users
          if (item.label === 'Analytics' && !isAdmin) {
            return false;
          }
          return true;
        });
    }
  };

  const navigationItems = getNavigationItems();

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    onCategorySelect?.(category);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      if (variant === 'admin') {
        await adminLogout();
      } else {
        // Handle regular user logout
        // Add your logout logic here
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    toast({
      title: "Theme updated",
      description: `Switched to ${newTheme} theme`,
    });
  };

  // Get current user for display
  const currentUser = variant === 'admin' ? adminUser : user;

  // Render mobile sidebar
  if (variant === 'mobile') {
    return (
      <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => {/* Close sidebar */}} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="TheGlocal Logo" className="h-8 w-8 object-contain" />
              <span className="text-lg font-semibold">TheGlocal</span>
            </div>
            <Button variant="ghost" size="sm">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 px-4">
            <nav className="space-y-2">
              {navigationItems
                .filter(item => item.mobile)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
            </nav>
          </ScrollArea>
          
          <div className="border-t p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.avatar_url} />
                <AvatarFallback>
                  {currentUser?.user_metadata?.username?.charAt(0) || 
                   currentUser?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.user_metadata?.username || 
                   currentUser?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {variant === 'admin' ? 'Administrator' : 'User'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render project sidebar
  if (variant === 'project') {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Search */}
        {showSearch && (
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Search Projects</h3>
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title, artist, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </form>
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                    selectedCategory === category
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {categoryIcons[category] || <Filter className="h-4 w-4" />}
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {trendingProjects.length > 0 && (
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Trending Now
            </h3>
            <div className="space-y-3">
              {trendingProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onProjectClick?.(project.id)}
                >
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                    <p className="text-xs text-gray-500">{project.artist}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-gray-500">{project.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Platform Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Projects</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                2,847
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Artists</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                1,234
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                156
              </Badge>
            </div>
          </div>
        </div>

        {/* Get Started CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-center space-y-3">
            <Sparkles className="h-8 w-8 mx-auto" />
            <h3 className="font-semibold text-lg">Ready to Showcase Your Work?</h3>
            <p className="text-sm text-blue-100">
              Join thousands of local creators and start sharing your projects today.
            </p>
            <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
              Create Your Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render main/admin sidebar using shadcn/ui sidebar
  return (
    <Sidebar
      className={cn(
        variant === 'admin' ? "w-64" : "w-60",
        className
      )}
      collapsible="icon"
    >
      <SidebarContent>
        {/* App Title */}
        <div className="p-1 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-sidebar-foreground flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="TheGlocal Logo" 
                className="h-5 w-5 object-contain"
              />
              {variant === 'admin' ? 'Admin Panel' : 'TheGlocal'}
            </h2>
            {showNotifications && user && <NotificationButton />}
          </div>
        </div>

        {/* Create Button */}
        {showCreateButton && variant !== 'admin' && (
          <div className="p-1">
            <SidebarMenuButton asChild>
              <Link to="/create" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                <span>Create Post</span>
              </Link>
            </SidebarMenuButton>
          </div>
        )}

        {/* Navigation Groups */}
        {Object.entries(
          navigationItems.reduce((groups, item) => {
            const group = item.group || 'main';
            if (!groups[group]) groups[group] = [];
            groups[group].push(item);
            return groups;
          }, {} as Record<string, NavigationItem[]>)
        ).map(([groupName, items]) => (
          <SidebarGroup key={groupName}>
            <SidebarGroupLabel>
              {groupName.charAt(0).toUpperCase() + groupName.slice(1)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  const showBadge = item.badge === 'unread' && counts.total > 0;
                  
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.href} className="flex items-center">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                          {showBadge && (
                            <Badge variant="destructive" className="ml-auto">
                              {counts.total > 99 ? '99+' : counts.total}
                            </Badge>
                          )}
                          {item.badge && typeof item.badge === 'number' && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* User Menu */}
        {showUserMenu && currentUser && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton className="w-full">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={currentUser.avatar_url} />
                          <AvatarFallback>
                            {currentUser.user_metadata?.username?.charAt(0) || 
                             currentUser.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start text-left">
                          <span className="text-sm font-medium">
                            {currentUser.user_metadata?.username || 
                             currentUser.email || 'User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {variant === 'admin' ? 'Administrator' : 'User'}
                          </span>
                        </div>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleThemeToggle}>
                        {theme === 'light' ? (
                          <Moon className="mr-2 h-4 w-4" />
                        ) : (
                          <Sun className="mr-2 h-4 w-4" />
                        )}
                        {theme === 'light' ? 'Dark' : 'Light'} Mode
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default ConsolidatedSidebar;
