/**
 * Consolidated Header Component
 * Unified header that combines features from all existing header components
 * Supports different variants: default, minimal, glass, admin
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Search, 
  Bell, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Plus,
  Home,
  Shield,
  MapPin,
  MapPinOff,
  RotateCcw,
  Bookmark,
  Heart,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  MessageSquare,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useLayout } from '@/contexts/LayoutContext';
import { useLocationManager } from '@/hooks/useLocationManager';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationButton } from '@/components/NotificationButton';
import { cn } from '@/lib/utils';

interface ConsolidatedHeaderProps {
  variant?: 'default' | 'minimal' | 'glass' | 'admin';
  showSearch?: boolean;
  showCreateButton?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  showNavigation?: boolean;
  showLocationButton?: boolean;
  title?: string;
  subtitle?: string;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
  className?: string;
}

export const ConsolidatedHeader: React.FC<ConsolidatedHeaderProps> = ({
  variant = 'default',
  showSearch = true,
  showCreateButton = true,
  showNotifications = true,
  showUserMenu = true,
  showNavigation = true,
  showLocationButton = true,
  title,
  subtitle,
  onMenuToggle,
  isMenuOpen = false,
  className
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isAdmin } = useAdminAuth();
  const { sidebarOpen, toggleSidebar } = useLayout();
  const { currentLocation, isLocationEnabled, toggleLocation, resetLocation } = useLocationManager();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  // Theme handling
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    setTheme(savedTheme);
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Apply theme logic here
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-background/80 backdrop-blur-sm border-b border-border/50';
      case 'glass':
        return 'bg-background/60 backdrop-blur-md border-b border-border/30';
      case 'admin':
        return 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-b border-red-200 dark:border-red-800';
      default:
        return 'bg-background border-b border-border';
    }
  };

  const renderNavigation = () => {
    if (!showNavigation) return null;

    const navItems = [
      { label: 'Home', href: '/', icon: Home },
      { label: 'Community', href: '/community', icon: User },
      { label: 'Events', href: '/events', icon: Calendar },
      { label: 'News', href: '/news', icon: Newspaper },
    ];

    if (isAdmin) {
      navItems.push({ label: 'Admin', href: '/admin', icon: Shield });
    }

    return (
      <nav className="hidden md:flex items-center space-x-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  };

  const renderLocationControls = () => {
    if (!showLocationButton) return null;

    return (
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLocation}
                className={cn(
                  'flex items-center space-x-2',
                  isLocationEnabled ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700'
                )}
              >
                {isLocationEnabled ? <MapPin className="h-4 w-4" /> : <MapPinOff className="h-4 w-4" />}
                <span className="hidden sm:inline">
                  {isLocationEnabled ? 'Location On' : 'Location Off'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isLocationEnabled ? 'Disable location services' : 'Enable location services'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {currentLocation && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetLocation}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset location</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  const renderUserMenu = () => {
    if (!showUserMenu || !user) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url} alt={user.display_name || user.email} />
              <AvatarFallback>
                {user.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.display_name || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/bookmarks" className="flex items-center">
              <Bookmark className="mr-2 h-4 w-4" />
              <span>Bookmarks</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderThemeToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          {theme === 'light' && <Sun className="h-4 w-4" />}
          {theme === 'dark' && <Moon className="h-4 w-4" />}
          {theme === 'system' && <Monitor className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full transition-all duration-200',
      getVariantStyles(),
      className
    )}>
      <div className="max-w-full px-3 lg:px-6">
        <div className="flex h-14 items-center justify-between gap-2">
          {/* Left Section - Logo and Search */}
          <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
            {/* Logo - Compact on mobile */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="TheGlocal Logo" 
                className="h-8 w-8"
              />
              <span className="text-lg lg:text-xl font-bold hidden sm:inline">
                {title || 'TheGlocal'}
              </span>
            </Link>

            {/* Search Bar - Prominent like Reddit */}
            {showSearch && !isMobile && (
              <div className="flex-1 max-w-2xl">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search TheGlocal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className={cn(
                      'pl-10 pr-4 h-10 bg-muted/50 border-muted hover:border-border hover:bg-background focus:bg-background transition-colors rounded-full',
                      isSearchFocused && 'ring-1 ring-primary border-transparent'
                    )}
                  />
                </form>
              </div>
            )}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
            {/* Search Icon for Mobile */}
            {showSearch && isMobile && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0"
                onClick={() => navigate('/search')}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Create Post Button */}
            {showCreateButton && user && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleCreatePost} 
                      size="sm" 
                      variant="ghost"
                      className="hidden sm:flex h-9 px-3 gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden lg:inline">Create</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create Post</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Notifications */}
            {showNotifications && user && (
              <div className="flex items-center">
                <NotificationButton />
              </div>
            )}

            {/* Messages */}
            {user && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9 p-0"
                      onClick={() => navigate('/messages')}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Messages</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* User Menu - Reddit Style */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 px-2 gap-2 hover:bg-muted">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar_url} alt={user.display_name || user.email} />
                      <AvatarFallback className="text-xs">
                        {user.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start min-w-0">
                      <span className="text-xs font-medium truncate max-w-[100px]">
                        {user.display_name || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.display_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>View Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleThemeChange(theme === 'light' ? 'dark' : 'light')} className="cursor-pointer">
                    {theme === 'light' ? (
                      <Moon className="mr-2 h-4 w-4" />
                    ) : (
                      <Sun className="mr-2 h-4 w-4" />
                    )}
                    <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="h-9">
                  <Link to="/signin">Log In</Link>
                </Button>
                <Button size="sm" asChild className="h-9 hidden sm:flex">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

