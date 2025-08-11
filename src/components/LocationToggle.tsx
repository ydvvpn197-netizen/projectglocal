import { Button } from "@/components/ui/button";
import { MapPin, MapPinOff, RotateCcw } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LocationToggleProps {
  compact?: boolean;
}

export function LocationToggle({ compact = false }: LocationToggleProps) {
  const { 
    isEnabled, 
    isLoading, 
    currentLocation, 
    lastUpdated, 
    toggleLocationSharing, 
    updateCurrentLocation 
  } = useLocation();

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

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleLocationSharing}
                disabled={isLoading}
                className="h-8 px-2"
              >
                {isLoading ? (
                  <RotateCcw className="h-3 w-3 animate-spin" />
                ) : isEnabled ? (
                  <MapPin className="h-3 w-3" />
                ) : (
                  <MapPinOff className="h-3 w-3" />
                )}
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
                  onClick={updateCurrentLocation}
                  disabled={isLoading}
                  className="h-8 px-2"
                >
                  <RotateCcw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
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
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isEnabled ? "default" : "outline"}
        size="sm"
        onClick={toggleLocationSharing}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <RotateCcw className="h-4 w-4 animate-spin" />
        ) : isEnabled ? (
          <MapPin className="h-4 w-4" />
        ) : (
          <MapPinOff className="h-4 w-4" />
        )}
        {isEnabled ? 'Location ON' : 'Enable Location'}
      </Button>
      
      {isEnabled && currentLocation && (
        <div className="text-xs text-muted-foreground">
          Updated {formatLastUpdated(lastUpdated)}
        </div>
      )}
      
      {isEnabled && currentLocation && (
        <Button
          variant="ghost"
          size="sm"
          onClick={updateCurrentLocation}
          disabled={isLoading}
        >
          <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
}