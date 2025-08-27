import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, MapPinOff, RotateCcw, Search, Bell, User, Settings, LogOut } from "lucide-react";
import { useLocationManager } from "@/hooks/useLocationManager";
import { useAuth } from "@/hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/NotificationBell";
import { NotificationButton } from "@/components/NotificationButton";
import { useState, memo } from "react";
// import { useHoverPreload } from "@/hooks/useRoutePreloader";

interface UniformHeaderProps {
  showLocationButton?: boolean;
  showAuthButtons?: boolean;
  showSearch?: boolean;
  className?: string;
}

// Memoized navigation link component with hover preloading - temporarily disabled
const NavLink = memo(({ route, label }: { route: string; label: string }) => {
  // const { handleMouseEnter } = useHoverPreload(route);
  
  return (
    <Link 
      to={route} 
      className="text-sm text-muted-foreground hover:text-primary transition-colors"
      // onMouseEnter={handleMouseEnter}
    >
      {label}
    </Link>
  );
});

NavLink.displayName = 'NavLink';

export function UniformHeader({ 
  showLocationButton = true, 
  showAuthButtons = false,
  showSearch = true,
  className = "" 
}: UniformHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { 
    location,
    enabled, 
    loading, 
    detectLocation, 
    refreshLocation 
  } = useLocationManager();
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLocationToggle = async () => {
    setIsLocationLoading(true);
    try {
      if (enabled) {
        // Disable location
        await refreshLocation();
      } else {
        // Enable location
        await detectLocation();
      }
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleLocationRefresh = async () => {
    setIsLocationLoading(true);
    try {
      await refreshLocation();
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
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

  return (
    <header className={`border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">L</span>
              </div>
              <span className="text-xl font-bold hidden sm:inline">Local Social Hub</span>
            </Link>
          </div>

          {/* Center Navigation - Only show if user is authenticated */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <NavLink route="/feed" label="Feed" />
              <NavLink route="/discover" label="Discover" />
              <NavLink route="/events" label="Events" />
              <NavLink route="/community" label="Community" />
              <NavLink route="/book-artist" label="Book Artists" />
            </div>
          )}

          {/* Search Bar - Only show if user is authenticated and search is enabled */}
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

          {/* Right Side - Location, Notifications, and Auth */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Location Button */}
            {showLocationButton && user && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLocationToggle}
                      disabled={isLocationLoading || loading}
                      className="relative"
                    >
                      {isLocationLoading || loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : enabled ? (
                        <MapPin className="h-4 w-4" />
                      ) : (
                        <MapPinOff className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-medium">
                        {enabled ? 'Location Enabled' : 'Location Disabled'}
                      </p>
                      {enabled && location && (
                        <p className="text-xs text-muted-foreground">
                          {location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Location Refresh Button */}
            {showLocationButton && user && enabled && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLocationRefresh}
                      disabled={isLocationLoading || loading}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh location</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Notification Bell */}
            {user ? <NotificationBell /> : <NotificationButton />}

            {/* Auth Buttons */}
            {showAuthButtons && !user && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/signin')}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/signin')}>
                  Get Started
                </Button>
              </div>
            )}

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email?.split('@')[0]}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
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
          </div>
        </div>
      </div>
    </header>
  );
}
