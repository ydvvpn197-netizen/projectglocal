import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, MapPinOff, RotateCcw, Search, Bell, User, Settings, LogOut } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
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
import { useState } from "react";

interface UniformHeaderProps {
  showLocationButton?: boolean;
  showAuthButtons?: boolean;
  showSearch?: boolean;
  className?: string;
}

export function UniformHeader({ 
  showLocationButton = true, 
  showAuthButtons = false,
  showSearch = true,
  className = "" 
}: UniformHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { 
    isEnabled, 
    isLoading, 
    currentLocation, 
    lastUpdated, 
    toggleLocationSharing, 
    updateCurrentLocation 
  } = useLocation();
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleLocationToggle = async () => {
    setIsLocationLoading(true);
    try {
      await toggleLocationSharing();
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleLocationRefresh = async () => {
    setIsLocationLoading(true);
    try {
      await updateCurrentLocation();
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
              <Link 
                to="/feed" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Feed
              </Link>
              <Link 
                to="/discover" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Discover
              </Link>
              <Link 
                to="/events" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Events
              </Link>
              <Link 
                to="/community" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Community
              </Link>
              <Link 
                to="/book-artist" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Book Artists
              </Link>
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
                      disabled={isLocationLoading}
                      className="relative"
                    >
                      {isLocationLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : isEnabled ? (
                        <MapPin className="h-4 w-4" />
                      ) : (
                        <MapPinOff className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-medium">
                        {isEnabled ? 'Location Enabled' : 'Location Disabled'}
                      </p>
                      {isEnabled && lastUpdated && (
                        <p className="text-xs text-muted-foreground">
                          Updated {formatLastUpdated(lastUpdated)}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Location Refresh Button */}
            {showLocationButton && user && isEnabled && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLocationRefresh}
                      disabled={isLocationLoading}
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
            {user && <NotificationBell />}

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
