import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Home,
  Calendar,
  Users,
  Newspaper,
  Search,
  Menu,
  Plus,
  Bell,
  User,
  Globe,
  Building2,
  Store,
  Vote,
  Megaphone,
  Palette,
  Scale,
  Heart,
  MessageSquare,
  Settings,
  Shield,
  Crown,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationButton } from '@/components/NotificationButton';

const mobileNavItems = [
  { title: "Feed", url: "/feed", icon: Home, priority: "high" },
  { title: "Events", url: "/events", icon: Calendar, priority: "high" },
  { title: "Community", url: "/community", icon: Users, priority: "high" },
  { title: "News", url: "/news", icon: Newspaper, priority: "medium" },
  { title: "Discover", url: "/discover", icon: Search, priority: "medium" },
];

const secondaryNavItems = [
  { title: "Public Square", url: "/public-square", icon: Globe },
  { title: "Local Communities", url: "/communities", icon: Building2 },
  { title: "Local Businesses", url: "/businesses", icon: Store },
  { title: "Polls", url: "/polls", icon: Vote },
  { title: "Civic Engagement", url: "/civic-engagement", icon: Megaphone },
  { title: "Book Artists", url: "/book-artist", icon: Palette },
  { title: "Legal Assistant", url: "/legal-assistant", icon: Scale },
  { title: "Life Wishes", url: "/life-wish", icon: Heart },
];

const userNavItems = [
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Privacy", url: "/privacy", icon: Shield },
  { title: "Subscription", url: "/subscription", icon: Crown },
  { title: "About", url: "/about", icon: MapPin },
];

interface MobileNavigationProps {
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ className }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

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
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      ×
                    </Button>
                  </div>

                  {/* Main Navigation */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Main</h3>
                      <nav className="space-y-1">
                        {mobileNavItems.map((item) => (
                          <Link
                            key={item.title}
                            to={item.url}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                              isActive(item.url)
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </nav>
                    </div>

                    {/* Create Post Button */}
                    <div className="py-2">
                      <Link
                        to="/create"
                        onClick={() => setIsOpen(false)}
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
                        {secondaryNavItems.slice(0, 4).map((item) => (
                          <Link
                            key={item.title}
                            to={item.url}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                              isActive(item.url)
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </nav>
                    </div>

                    {/* User Navigation */}
                    {user && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Account</h3>
                        <nav className="space-y-1">
                          {userNavItems.map((item) => (
                            <Link
                              key={item.title}
                              to={item.url}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                isActive(item.url)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
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
};
