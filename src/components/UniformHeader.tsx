import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, MapPinOff, RotateCcw } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { useAuth } from "@/hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

interface UniformHeaderProps {
  showLocationButton?: boolean;
  showAuthButtons?: boolean;
  className?: string;
}

export function UniformHeader({ 
  showLocationButton = true, 
  showAuthButtons = false,
  className = "" 
}: UniformHeaderProps) {
  const { user } = useAuth();
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

  return (
    <header className={`border-b bg-background/80 backdrop-blur-sm ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">L</span>
              </div>
              <span className="text-xl font-bold">Local Social Hub</span>
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

          {/* Right Side - Location and Auth */}
          <div className="flex items-center gap-4">
            {/* Location Button */}
            {showLocationButton && user && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={handleLocationToggle}
                      disabled={isLoading || isLocationLoading}
                      className="gap-2"
                    >
                      {isLoading || isLocationLoading ? (
                        <RotateCcw className="h-4 w-4 animate-spin" />
                      ) : isEnabled ? (
                        <MapPin className="h-4 w-4" />
                      ) : (
                        <MapPinOff className="h-4 w-4" />
                      )}
                      {isEnabled ? 'Location ON' : 'Enable Location'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      {isEnabled ? (
                        <div>
                          <div className="font-medium">Location sharing ON</div>
                          {currentLocation && (
                            <div className="text-muted-foreground">
                              Updated {formatLastUpdated(lastUpdated)}
                            </div>
                          )}
                          <div className="text-muted-foreground">Click to disable</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">Location sharing OFF</div>
                          <div className="text-muted-foreground">Click to enable real-time location</div>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
                
                {isEnabled && currentLocation && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLocationRefresh}
                        disabled={isLoading || isLocationLoading}
                      >
                        <RotateCcw className={`h-4 w-4 ${isLoading || isLocationLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <div className="font-medium">Refresh location</div>
                        <div className="text-muted-foreground">Last updated {formatLastUpdated(lastUpdated)}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            )}

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
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {user.email?.split('@')[0]}
                </span>
                <Button onClick={() => navigate('/profile')} variant="outline" size="sm">
                  Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
