import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  Users, 
  MessageCircle, 
  User,
  Plus,
  Bell,
  Search,
  Menu
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
  isActive?: boolean;
}

interface MobileBottomNavigationProps {
  className?: string;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { counts } = useNotifications();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide/show navigation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Feed',
      icon: Home,
      path: '/feed',
      isActive: location.pathname === '/feed' || location.pathname === '/'
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      path: '/events',
      isActive: location.pathname.startsWith('/events')
    },
    {
      id: 'community',
      label: 'Community',
      icon: Users,
      path: '/community',
      isActive: location.pathname.startsWith('/community')
    },
    {
      id: 'messages',
      label: 'Chat',
      icon: MessageCircle,
      path: '/messages',
      badge: counts.unread,
      isActive: location.pathname.startsWith('/messages')
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      isActive: location.pathname.startsWith('/profile')
    }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const handleCreatePost = () => {
    navigate('/create');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg ${className}`}
        >
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/search')}
                className="flex items-center gap-1 text-gray-600"
              >
                <Search className="h-4 w-4" />
                <span className="text-sm">Search</span>
              </Button>
            </div>
            
            <Button
              onClick={handleCreatePost}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {counts.total > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {counts.total > 9 ? '9+' : counts.total}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                    item.isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`h-5 w-5 transition-transform ${item.isActive ? 'scale-110' : ''}`} />
                    {item.badge && item.badge > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center text-xs"
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${item.isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator */}
                  {item.isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      initial={false}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Safe area for devices with home indicator */}
          <div className="h-2 bg-white" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Enhanced mobile layout component
export const MobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content with bottom padding for navigation */}
      <div className="pb-20">
        {children}
      </div>
      
      {/* Bottom Navigation */}
      <MobileBottomNavigation />
    </div>
  );
};

export default MobileBottomNavigation;
