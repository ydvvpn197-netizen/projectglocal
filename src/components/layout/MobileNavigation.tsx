import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Search, 
  Calendar, 
  Users, 
  Palette,
  Bell,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MobileNavigationProps {
  className?: string;
}

const mobileNavItems = [
  { label: 'Home', href: '/feed', icon: Home },
  { label: 'Discover', href: '/discover', icon: Search },
  { label: 'Events', href: '/events', icon: Calendar },
  { label: 'Community', href: '/community', icon: Users },
  { label: 'Artists', href: '/book-artist', icon: Palette }
];

export const MobileNavigation = memo<MobileNavigationProps>(({ className }) => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border',
      'safe-area-pb',
      className
    )}>
      <div className="flex items-center justify-around px-2 py-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                'flex flex-col items-center space-y-1 h-auto py-2 px-3',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Link to={item.href}>
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            </Button>
          );
        })}
        
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center space-y-1 h-auto py-2 px-3 text-muted-foreground hover:text-foreground relative"
        >
          <Bell className="h-5 w-5" />
          <span className="text-xs font-medium">Alerts</span>
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </Button>
        
        {/* Profile */}
        {user && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3 text-muted-foreground hover:text-foreground"
          >
            <Link to="/profile">
              <User className="h-5 w-5" />
              <span className="text-xs font-medium">Profile</span>
            </Link>
          </Button>
        )}
      </div>
    </nav>
  );
});

MobileNavigation.displayName = 'MobileNavigation';
