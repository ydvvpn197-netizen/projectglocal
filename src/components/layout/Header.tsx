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
  Search, 
  Bell, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut,
  MapPin,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useLayout } from '@/contexts/LayoutContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  showSearch?: boolean;
  showCreateButton?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  showNavigation?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'glass';
}

export const Header: React.FC<HeaderProps> = ({
  showSearch = true,
  showCreateButton = true,
  showNotifications = true,
  showUserMenu = true,
  showNavigation = true,
  className = '',
  variant = 'default'
}) => {
  const { user, signOut } = useAuth();
  const { counts } = useNotifications();
  const { toggleSidebar, sidebarOpen } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const headerVariants = {
    default: 'bg-background border-b border-border',
    minimal: 'bg-transparent',
    glass: 'bg-background/80 backdrop-blur-md border-b border-border/50'
  };

  const scrollVariants = {
    scrolled: 'shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
    notScrolled: ''
  };

  return (
    <header 
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        headerVariants[variant],
        scrollVariants[isScrolled ? 'scrolled' : 'notScrolled'],
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left Section - Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo and Brand */}
            <Link 
              to="/" 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/logo.png" 
                alt="TheGlocal Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                TheGlocal
              </span>
            </Link>
          </div>

          {/* Center Section - Navigation (Desktop) */}
          {user && showNavigation && (
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/feed"
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive('/feed') 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Feed
              </Link>
              <Link 
                to="/discover"
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive('/discover') 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Discover
              </Link>
              <Link 
                to="/events"
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive('/events') 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Events
              </Link>
              <Link 
                to="/community"
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive('/community') 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Community
              </Link>
              <Link 
                to="/book-artist"
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive('/book-artist') 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Book Artists
              </Link>
            </nav>
          )}

          {/* Search Bar */}
          {user && showSearch && (
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search artists, events, posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
          )}

          {/* Right Section - Actions and User Menu */}
          <div className="flex items-center gap-2">
            {/* Create Button */}
            {user && showCreateButton && (
              <Button 
                size="sm" 
                onClick={() => navigate('/create')}
                className="hidden sm:flex"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            )}

            {/* Location Button */}
            {user && (
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <MapPin className="h-4 w-4" />
              </Button>
            )}

            {/* Notifications */}
            {user && showNotifications && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {counts.total > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {counts.total > 99 ? '99+' : counts.total}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Menu */}
            {user && showUserMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.username || user?.email} />
                      <AvatarFallback>
                        {(user?.user_metadata?.username || user?.email?.charAt(0) || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.user_metadata?.username || user?.email || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile?from=dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Auth Buttons for non-authenticated users */}
            {!user && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/signin')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/signin')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
