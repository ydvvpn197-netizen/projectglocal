import React, { ReactNode } from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  Music, 
  MessageSquare, 
  Newspaper, 
  BarChart3,
  Settings,
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLayout } from '@/contexts/LayoutContext';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsAdmin } from '@/hooks/useRBAC';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  customContent?: ReactNode;
}

const navigationItems = [
  {
    name: 'Home',
    href: '/feed',
    icon: Home,
    badge: null,
  },
  {
    name: 'Communities',
    href: '/communities',
    icon: Users,
    badge: null,
  },
  {
    name: 'Events',
    href: '/events',
    icon: Calendar,
    badge: null,
  },
  {
    name: 'Artists',
    href: '/book-artist',
    icon: Music,
    badge: null,
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    badge: 'unread',
  },
  {
    name: 'News',
    href: '/news',
    icon: Newspaper,
    badge: null,
  },
  {
    name: 'Analytics',
    href: '/community-insights',
    icon: BarChart3,
    badge: null,
  },
];

const bottomItems = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Help',
    href: '/help',
    icon: HelpCircle,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  isMobile, 
  customContent 
}) => {
  const { toggleSidebar } = useLayout();
  const { user } = useAuth();
  const { counts } = useNotifications();
  const { isAdmin } = useIsAdmin();

  const sidebarContent = customContent || (
    <div className="flex flex-col h-full">
      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
            {(user?.user_metadata?.username || user?.email?.charAt(0) || 'U').toUpperCase()}
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.user_metadata?.username || user?.email || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems
          .filter((item) => {
            // Hide Analytics for non-admin users
            if (item.name === 'Analytics' && !isAdmin) {
              return false;
            }
            return true;
          })
          .map((item) => {
            const Icon = item.icon;
            const showBadge = item.badge === 'unread' && counts.total > 0;
          
          return (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full justify-start h-10",
                isOpen ? "px-3" : "px-2"
              )}
              asChild
            >
              <a href={item.href} className="flex items-center">
                <Icon className={cn("h-4 w-4", !isOpen && "mx-auto")} />
                {isOpen && (
                  <>
                    <span className="ml-3 flex-1 text-left">{item.name}</span>
                    {showBadge && (
                      <Badge variant="destructive" className="ml-2">
                        {counts.total > 99 ? '99+' : counts.total}
                      </Badge>
                    )}
                  </>
                )}
              </a>
            </Button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-2">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full justify-start h-10",
                isOpen ? "px-3" : "px-2"
              )}
              asChild
            >
              <a href={item.href} className="flex items-center">
                <Icon className={cn("h-4 w-4", !isOpen && "mx-auto")} />
                {isOpen && <span className="ml-3">{item.name}</span>}
              </a>
            </Button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-background border-r border-border transition-all duration-300 z-50",
          isMobile
            ? "fixed inset-y-0 left-0 w-64"
            : "relative",
          isMobile && !isOpen && "-translate-x-full",
          !isMobile && (isOpen ? "w-64" : "w-16")
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {isOpen && <h2 className="text-lg font-semibold">Menu</h2>}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
            >
              {isMobile ? (
                <X className="h-4 w-4" />
              ) : isOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      </aside>
    </>
  );
};
