import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Home, 
  Users, 
  Calendar, 
  Plus, 
  Bell, 
  User, 
  Settings, 
  Search,
  Menu,
  X,
  Globe,
  Newspaper,
  Vote,
  Megaphone,
  Building2,
  Store,
  Palette,
  Scale,
  Heart,
  Shield,
  Crown,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { UnifiedNotificationSystem } from './UnifiedNotificationSystem';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: 'high' | 'medium' | 'low';
  badge?: string;
  requiresAuth?: boolean;
}

const navigationItems: NavigationItem[] = [
  // High Priority - Always visible (Core features)
  { path: '/feed', label: 'Feed', icon: Home, priority: 'high' },
  { path: '/community', label: 'Community', icon: Users, priority: 'high' },
  { path: '/events', label: 'Events', icon: Calendar, priority: 'high' },
  
  // Medium Priority - Contextual (Secondary features)
  { path: '/news', label: 'News', icon: Newspaper, priority: 'medium' },
  { path: '/polls', label: 'Polls', icon: Vote, priority: 'medium' },
  { path: '/businesses', label: 'Businesses', icon: Store, priority: 'medium' },
  
  // Low Priority - Collapsible (Tools & utilities)
  { path: '/legal-assistant', label: 'Legal Assistant', icon: Scale, priority: 'low' },
  { path: '/life-wish', label: 'Life Wishes', icon: Heart, priority: 'low' },
];

const userItems = [
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/privacy', label: 'Privacy', icon: Shield },
  { path: '/public-square-subscription', label: 'Subscription', icon: Crown },
];

interface UnifiedNavigationProps {
  className?: string;
}

export const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({ className = '' }) => {
  const { user, signOut } = useAuth();
  const { counts } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/feed' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const highPriorityItems = navigationItems.filter(item => item.priority === 'high');
  const mediumPriorityItems = navigationItems.filter(item => item.priority === 'medium');
  const lowPriorityItems = navigationItems.filter(item => item.priority === 'low');

  return (
    <nav className={`bg-background border-b border-border sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <img 
              src="/logo.png" 
              alt="Glocal Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Glocal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {highPriorityItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-1 text-xs animate-pulse">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events, communities, discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Create Button */}
            <Button
              onClick={() => navigate('/create')}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create</span>
            </Button>

            {/* Notifications */}
            <UnifiedNotificationSystem />

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs">
                      {getInitials(user.user_metadata?.full_name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </Button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-border">
                      <p className="font-medium">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="p-2">
                      {userItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-border mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
                        >
                          <Shield className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/signin')}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/signin')}>
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="p-4 space-y-2">
              {/* High Priority Items */}
              {highPriorityItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}

              {/* Medium Priority Items */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  More Features
                </p>
                {mediumPriorityItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Low Priority Items */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Tools
                </p>
                {lowPriorityItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Search */}
              <div className="pt-2 border-t border-border">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default UnifiedNavigation;
