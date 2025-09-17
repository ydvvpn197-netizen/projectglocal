/**
 * UnifiedNavigation Component
 * 
 * Provides a consistent navigation experience across all pages
 * with optimized routing and user-friendly interface.
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useAnonymousUsername } from '@/hooks/useAnonymousUsername';
import { AnonymousIdentityToggle } from '@/components/AnonymousIdentityToggle';
import { 
  Home, 
  MessageCircle, 
  Calendar, 
  Users, 
  Star, 
  Megaphone,
  Newspaper,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Crown,
  Globe
} from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  requiresAuth?: boolean;
  isActive?: boolean;
}

interface UnifiedNavigationProps {
  variant?: 'header' | 'sidebar' | 'mobile';
  showUserMenu?: boolean;
  showNotifications?: boolean;
  onNavigate?: (path: string) => void;
}

export const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({
  variant = 'header',
  showUserMenu = true,
  showNotifications = true,
  onNavigate
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentUser } = useAnonymousUsername();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: location.pathname === '/'
    },
    {
      label: 'Feed',
      href: '/feed',
      icon: Globe,
      requiresAuth: true,
      isActive: location.pathname === '/feed'
    },
    {
      label: 'News',
      href: '/news',
      icon: Newspaper,
      requiresAuth: true,
      isActive: location.pathname.startsWith('/news')
    },
    {
      label: 'Messages',
      href: '/messages',
      icon: MessageCircle,
      requiresAuth: true,
      isActive: location.pathname.startsWith('/messages')
    },
    {
      label: 'Events',
      href: '/events',
      icon: Calendar,
      isActive: location.pathname.startsWith('/events')
    },
    {
      label: 'Community',
      href: '/community',
      icon: Users,
      isActive: location.pathname.startsWith('/community')
    },
    {
      label: 'Artists',
      href: '/book-artist',
      icon: Star,
      requiresAuth: true,
      isActive: location.pathname.startsWith('/book-artist')
    },
    {
      label: 'Civic Engagement',
      href: '/civic-engagement',
      icon: Megaphone,
      requiresAuth: true,
      isActive: location.pathname.startsWith('/civic-engagement')
    }
  ];

  const userMenuItems = [
    {
      label: 'Profile',
      href: '/profile',
      icon: User
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings
    },
    {
      label: 'Privacy',
      href: '/privacy',
      icon: Shield
    },
    {
      label: 'Subscription',
      href: '/subscription',
      icon: Crown
    }
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
    onNavigate?.(href);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getDisplayName = () => {
    if (!currentUser) return 'User';
    return currentUser.is_anonymous ? currentUser.username : (currentUser.display_name || currentUser.username);
  };

  const getAvatarFallback = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  if (variant === 'mobile') {
    return (
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">TheGlocal</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            {showNotifications && (
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b bg-background"
            >
              <div className="p-4 space-y-2">
                {navigationItems
                  .filter(item => !item.requiresAuth || user)
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.href}
                        variant={item.isActive ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleNavigation(item.href)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                
                {user && (
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Button
                            key={item.href}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleNavigation(item.href)}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {item.label}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive"
                        onClick={handleSignOut}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">TheGlocal</span>
            </Link>

            {/* Navigation Items */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems
                .filter(item => !item.requiresAuth || user)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.href}
                      variant={item.isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleNavigation(item.href)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-2">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-2">
              {showNotifications && (
                <Button variant="ghost" size="sm">
                  <Bell className="w-5 h-5" />
                </Button>
              )}

              {user && showUserMenu ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser?.avatar_url} alt={getDisplayName()} />
                        <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser?.is_anonymous ? 'Anonymous' : 'Public'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={item.href}
                          onClick={() => handleNavigation(item.href)}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </DropdownMenuItem>
                      );
                    })}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => navigate('/signin')} size="sm">
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Sidebar variant
  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">TheGlocal</span>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navigationItems
            .filter(item => !item.requiresAuth || user)
            .map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant={item.isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleNavigation(item.href)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
        </nav>

        {/* User Section */}
        {user && (
          <div className="mt-6 pt-6 border-t">
            <div className="space-y-2">
              {userMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleNavigation(item.href)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};