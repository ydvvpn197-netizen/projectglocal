import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationButton } from '@/components/NotificationButton';
import { TestNotificationButton } from '@/components/TestNotificationButton';
import { NetworkStatus, NetworkStatusIndicator } from '@/components/NetworkStatus';
import { PromotionalBanner } from '@/components/marketing/PromotionalBanner';
import { MobileSearch } from '@/components/MobileSearch';
import {
  Home,
  Search,
  Plus,
  Users,
  Calendar,
  User,
  Settings,
  Menu,
  X,
  MapPin,
  Sparkles,
  Bell,
  MessageSquare,
  Newspaper,
  Scale,
  Heart,
  Palette,
  Zap,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const mobileNavItems = [
  { title: 'Feed', url: '/feed', icon: Home },
  { title: 'Discover', url: '/discover', icon: Search },
  { title: 'Events', url: '/events', icon: Calendar },
  { title: 'Community', url: '/community', icon: Users },
  { title: 'Artists', url: '/book-artist', icon: Palette },
];

const newFeaturesItems = [
  { title: 'Legal Assistant', url: '/legal-assistant', icon: Scale },
  { title: 'Life Wishes', url: '/life-wish', icon: Heart },
];

const userItems = [
  { title: 'Dashboard', url: '/dashboard', icon: User },
  { title: 'Messages', url: '/messages', icon: MessageSquare },
  { title: 'News Feed', url: '/news', icon: Newspaper },
  { title: 'Profile', url: '/profile', icon: User },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function MobileLayout({ children }: MobileLayoutProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const handleNavigation = (url: string) => {
    navigate(url);
    setIsMenuOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Network Status Alert */}
      <NetworkStatus />
      
      {/* Promotional Banner */}
      <PromotionalBanner 
        position="top" 
        variant="default" 
        maxCampaigns={1}
        className="z-40"
      />
      
      {/* Mobile Header */}
      <header className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b border-border' 
          : 'bg-background'
      }`}>
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-gradient">
            <Sparkles className="h-5 w-5 text-primary" />
                              <span className="hidden xs:inline">Glocal</span>
                          <span className="xs:hidden">G</span>
          </Link>
          
          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Location indicator */}
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-1 text-muted-foreground hover:text-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Local</span>
            </Button>
            
            {/* Mobile Search */}
            <MobileSearch />
            
            {/* Notifications */}
            {user ? <NotificationBell /> : <NotificationButton />}
            
            {/* Test Button - Remove in production */}
            <TestNotificationButton />
            
            {/* User menu or sign in */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs">
                        {getInitials(user.user_metadata?.full_name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                        {getInitials(user.user_metadata?.full_name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNavigation('/profile')} className="gap-3">
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation('/settings')} className="gap-3">
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="gap-3 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/signin')} size="sm" className="btn-community">
                Sign In
              </Button>
            )}
            
            {/* Mobile menu trigger */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Menu
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Create Button */}
                    <div className="space-y-2">
                      <Button 
                        onClick={() => handleNavigation('/create')} 
                        className="w-full btn-community"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Post
                      </Button>
                    </div>
                    
                    {/* Main Navigation */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Main
                      </h3>
                      <div className="space-y-1">
                        {mobileNavItems.map((item) => (
                          <Button
                            key={item.title}
                            variant={isActive(item.url) ? "secondary" : "ghost"}
                            onClick={() => handleNavigation(item.url)}
                            className="w-full justify-start"
                          >
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* New Features */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        New Features
                      </h3>
                      <div className="space-y-1">
                        {newFeaturesItems.map((item) => (
                          <Button
                            key={item.title}
                            variant={isActive(item.url) ? "secondary" : "ghost"}
                            onClick={() => handleNavigation(item.url)}
                            className="w-full justify-start"
                          >
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* User Navigation */}
                    {user && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Account
                        </h3>
                        <div className="space-y-1">
                          {userItems.map((item) => (
                            <Button
                              key={item.title}
                              variant={isActive(item.url) ? "secondary" : "ghost"}
                              onClick={() => handleNavigation(item.url)}
                              className="w-full justify-start"
                            >
                              <item.icon className="h-4 w-4 mr-3" />
                              {item.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/20">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.url)}
              className={`flex flex-col items-center gap-1 h-12 w-12 p-0 ${
                isActive(item.url) 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.title}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center gap-1 h-12 w-12 p-0 text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs">More</span>
          </Button>
        </div>
      </nav>

      {/* Bottom padding for mobile navigation */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
