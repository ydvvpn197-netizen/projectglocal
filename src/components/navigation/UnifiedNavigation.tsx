import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useEnhancedTheme } from '@/components/ui/useEnhancedTheme';
import { useToast } from '@/hooks/use-toast';
import { NotificationButton } from '@/components/NotificationButton';
import { supabase } from '@/integrations/supabase/client';

// Navigation item interface
interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  featured?: boolean;
  admin?: boolean;
  mobile?: boolean;
  priority?: 'high' | 'medium' | 'low';
  group?: 'main' | 'explore' | 'features' | 'account';
}

// Unified navigation props
interface UnifiedNavigationProps {
  className?: string;
  variant?: 'sidebar' | 'header' | 'mobile';
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  showMobileMenu?: boolean;
  notifications?: number;
  onSearch?: (query: string) => void;
  onThemeToggle?: () => void;
  onNotificationClick?: () => void;
}

// Navigation data
const navigationItems: NavigationItem[] = [
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
  { label: 'About', href: '/about', icon: MapPin, group: 'account' },
];

// Admin navigation items
const adminItems: NavigationItem[] = [
  { label: 'Admin Dashboard', href: '/admin', icon: Shield, admin: true, group: 'account' },
];

export const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({
  className,
  variant = 'sidebar',
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  showMobileMenu = true,
  notifications = 0,
  onSearch,
  onThemeToggle,
  onNotificationClick,
}) => {
  const { user, signOut } = useAuth();
  const { adminUser } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useEnhancedTheme();
  const { state } = useSidebar();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isArtist, setIsArtist] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  
  const collapsed = state === "collapsed";

  // Check if user is an artist
  useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('artists')
            .select('id')
            .eq('user_id', user.id)
            .single();
          setIsArtist(!!data);
        } catch (error) {
          setIsArtist(false);
        }
      }
    };
    checkUserType();
  }, [user]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get navigation items by group
  const getItemsByGroup = (group: string) => {
    return navigationItems.filter(item => item.group === group);
  };

  // Get user-specific items
  const getUserItems = () => {
    const baseItems = getItemsByGroup('account');
    
    // Add admin items if user is admin
    if (adminUser) {
      return [...baseItems, ...adminItems];
    }
    
    return baseItems;
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    setTheme(newTheme);
    onThemeToggle?.();
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out successfully',
        description: 'Come back soon!',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  // Render sidebar variant
  if (variant === 'sidebar') {
    return (
      <Sidebar
        className={collapsed ? "w-14" : "w-60"}
        collapsible="icon"
      >
        <SidebarContent>
          {/* App Title */}
          {!collapsed && (
            <div className="p-1 border-b border-sidebar-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-sidebar-foreground flex items-center gap-2">
                  <img 
                    src="/logo.png" 
                    alt="TheGlocal Logo" 
                    className="h-5 w-5 object-contain"
                  />
                  TheGlocal
                </h2>
                {user ? <NotificationButton /> : <NotificationButton />}
              </div>
            </div>
          )}

          {/* Create Button */}
          <div className="p-1">
            <SidebarMenuButton asChild>
              <Link to="/create" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                {!collapsed && <span>Create Post</span>}
              </Link>
            </SidebarMenuButton>
          </div>

          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {getItemsByGroup('main').map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link to={item.href} end className={getNavClass}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Explore Navigation - Collapsible */}
          {!collapsed && (
            <SidebarGroup>
              <SidebarGroupLabel>Explore</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {getItemsByGroup('explore').slice(0, 3).map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild>
                        <Link to={item.href} end className={getNavClass}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Features Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>New Features</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {getItemsByGroup('features').map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link to={item.href} end className={getNavClass}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* User Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {getUserItems().map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link to={item.href} end className={getNavClass}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Render header variant
  if (variant === 'header') {
    return (
      <motion.nav
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
          isScrolled && 'shadow-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
          className
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2"
              >
                <img 
                  src="/logo.png" 
                  alt="Glocal Logo" 
                  className="h-8 w-8 object-contain"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  TheGlocal
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {getItemsByGroup('main')
                .filter(item => item.mobile)
                .map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2',
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.featured && (
                      <motion.div
                        className="absolute -top-1 -right-1 h-2 w-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </Link>
                ))}
            </div>

            {/* Search Bar */}
            {showSearch && (
              <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
                <form onSubmit={handleSearch} className="relative w-full">
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search events, people, places..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className={cn(
                      'w-full pl-10 pr-4 py-2 rounded-full border bg-background text-sm transition-all duration-200',
                      isSearchFocused
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-input hover:border-primary/50'
                    )}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </form>
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Create Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="hidden md:flex">
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Create New</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/create')}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/create-event')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Event
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/community/create-group')}>
                    <Users className="h-4 w-4 mr-2" />
                    Group
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/community/create-discussion')}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Discussion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              {showNotifications && (
                user ? (
                  <NotificationButton notifications={notifications} />
                ) : (
                  <NotificationButton 
                    notifications={notifications} 
                    onClick={onNotificationClick}
                  />
                )
              )}

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleThemeToggle}
                className="hidden md:flex"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
              </Button>

              {/* User Menu */}
              {showUserMenu && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback>
                          {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {getUserItems().map((item) => (
                      <DropdownMenuItem key={item.href} onClick={() => navigate(item.href)}>
                        <item.icon className="h-4 w-4" />
                        <span className="ml-2">{item.label}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button size="sm" onClick={() => navigate('/signin')}>
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Button */}
              {showMobileMenu && (
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="md:hidden">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                      <SheetDescription>
                        Navigate through the app
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {/* Mobile Search */}
                      {showSearch && (
                        <div className="space-y-2">
                          <form onSubmit={handleSearch}>
                            <input
                              type="text"
                              placeholder="Search..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          </form>
                        </div>
                      )}

                      {/* Mobile Navigation */}
                      <div className="space-y-2">
                        {getItemsByGroup('main')
                          .filter(item => item.mobile)
                          .map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors',
                                isActive(item.href)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-accent'
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="ml-auto">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          ))}
                      </div>

                      {/* Mobile User Actions */}
                      {user && (
                        <div className="space-y-2 pt-4 border-t">
                          {getUserItems().map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm hover:bg-accent"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                          <button
                            onClick={() => {
                              handleSignOut();
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm hover:bg-accent w-full text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>
      </motion.nav>
    );
  }

  // Render mobile variant
  if (variant === 'mobile') {
    return (
      <div className={cn("lg:hidden", className)}>
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-lg font-bold">Glocal</span>
            </Link>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {user ? <NotificationButton /> : null}
              
              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold">Navigation</h2>
                      <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                        ×
                      </Button>
                    </div>

                    {/* Main Navigation */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Main</h3>
                        <nav className="space-y-1">
                          {getItemsByGroup('main')
                            .filter(item => item.mobile)
                            .map((item) => (
                              <Link
                                key={item.label}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                  isActive(item.href)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>
                              </Link>
                            ))}
                        </nav>
                      </div>

                      {/* Create Post Button */}
                      <div className="py-2">
                        <Link
                          to="/create"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Create Post</span>
                        </Link>
                      </div>

                      {/* Secondary Navigation */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Explore</h3>
                        <nav className="space-y-1">
                          {getItemsByGroup('explore').slice(0, 4).map((item) => (
                            <Link
                              key={item.label}
                              to={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                isActive(item.href)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </nav>
                      </div>

                      {/* User Navigation */}
                      {user && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">Account</h3>
                          <nav className="space-y-1">
                            {getUserItems().map((item) => (
                              <Link
                                key={item.label}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                  isActive(item.href)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>
                              </Link>
                            ))}
                          </nav>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return null;
};
