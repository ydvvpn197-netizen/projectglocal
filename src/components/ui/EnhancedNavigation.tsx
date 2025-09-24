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
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedTheme } from '@/components/ui/useEnhancedTheme';
import { useToast } from '@/hooks/use-toast';
import { NotificationButton } from '@/components/NotificationButton';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  featured?: boolean;
  admin?: boolean;
  mobile?: boolean;
}

interface EnhancedNavigationProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'glass';
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  showMobileMenu?: boolean;
  notifications?: number;
  onSearch?: (query: string) => void;
  onThemeToggle?: () => void;
  onNotificationClick?: () => void;
}

export const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({
  className,
  variant = 'default',
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
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme, accentColor, setAccentColor, accentColors } = useEnhancedTheme();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const navigationItems: NavigationItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: <Home className="h-4 w-4" />,
      mobile: true,
    },
    {
      label: 'Feed',
      href: '/feed',
      icon: <BookOpen className="h-4 w-4" />,
      mobile: true,
    },
    {
      label: 'News',
      href: '/news',
      icon: <Newspaper className="h-4 w-4" />,
      mobile: true,
    },
    {
      label: 'Messages',
      href: '/messages',
      icon: <MessageCircle className="h-4 w-4" />,
      mobile: true,
    },
    {
      label: 'Events',
      href: '/events',
      icon: <Calendar className="h-4 w-4" />,
      mobile: true,
    },
    {
      label: 'Community',
      href: '/community',
      icon: <Users className="h-4 w-4" />,
      mobile: true,
    },
    {
      label: 'Artists',
      href: '/book-artist',
      icon: <Star className="h-4 w-4" />,
      mobile: true,
    },
    {
      label: 'Civic Engagement',
      href: '/civic-engagement',
      icon: <Megaphone className="h-4 w-4" />,
      mobile: true,
    },
    {
      label: 'Trending',
      href: '/feed?tab=trending',
      icon: <TrendingUp className="h-4 w-4" />,
      featured: true,
      mobile: false,
    },
  ];

  const userMenuItems = [
    {
      label: 'My Dashboard',
      href: '/my-dashboard',
      icon: <User className="h-4 w-4" />,
    },
    {
      label: 'Profile Settings',
      href: '/profile?tab=overview&from=dashboard',
      icon: <Edit className="h-4 w-4" />,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="h-4 w-4" />,
    },
    {
      label: 'Help',
      href: '/help',
      icon: <HelpCircle className="h-4 w-4" />,
    },
  ];

  const adminMenuItems = [
    {
      label: 'Admin Dashboard',
      href: '/admin',
      icon: <Crown className="h-4 w-4" />,
    },
    {
      label: 'User Management',
      href: '/admin/users',
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: 'Content Moderation',
      href: '/admin/moderation',
      icon: <Shield className="h-4 w-4" />,
    },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navVariants = {
    default: 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
    minimal: 'bg-transparent',
    glass: 'bg-white/10 backdrop-blur-md border-white/20',
  };

  const scrollVariants = {
    scrolled: 'shadow-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
    notScrolled: '',
  };

  return (
    <motion.nav
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        navVariants[variant],
        scrollVariants[isScrolled ? 'scrolled' : 'notScrolled'],
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
            {navigationItems
              .filter(item => !item.mobile || item.mobile)
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
                  {item.icon}
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
                  {userMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} onClick={() => navigate(item.href)}>
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                  {user.user_metadata?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Admin</DropdownMenuLabel>
                      {adminMenuItems.map((item) => (
                        <DropdownMenuItem key={item.href} onClick={() => navigate(item.href)}>
                          {item.icon}
                          <span className="ml-2">{item.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
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
                      {navigationItems
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
                            {item.icon}
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
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm hover:bg-accent"
                          >
                            {item.icon}
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
};
