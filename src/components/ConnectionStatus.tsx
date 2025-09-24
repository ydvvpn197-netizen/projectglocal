import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { forceReconnection } from '@/integrations/supabase/client';
import { Wifi, WifiOff, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

/**
 * Connection Status Component
 * Displays the current connection status and provides reconnection options
 */
export const ConnectionStatus: React.FC = () => {
  const { connectionStatus, isOnline } = useAuth();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await forceReconnection();
    } catch (error) {
      console.error('Reconnection failed:', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Connected',
          variant: 'default' as const,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          description: 'All services are working properly'
        };
      case 'connecting':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          label: 'Connecting',
          variant: 'secondary' as const,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          description: 'Establishing connection...'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Connection Failed',
          variant: 'destructive' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          description: 'Unable to connect to services'
        };
      case 'offline':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          label: 'Offline',
          variant: 'outline' as const,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          description: 'Network connection unavailable'
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Unknown',
          variant: 'outline' as const,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          description: 'Connection status unknown'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge 
              variant={statusConfig.variant}
              className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}
            >
              {statusConfig.icon}
              <span className="ml-1 hidden sm:inline">{statusConfig.label}</span>
            </Badge>
            
            {/* Show network status indicator */}
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="w-3 h-3 text-green-600" />
              ) : (
                <WifiOff className="w-3 h-3 text-red-600" />
              )}
            </div>
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-medium">Connection Status</div>
            <div className="text-sm text-gray-600">
              {statusConfig.description}
            </div>
            
            {/* Show additional details */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>Network: {isOnline ? 'Online' : 'Offline'}</div>
              <div>Service: {connectionStatus}</div>
            </div>
            
            {/* Show reconnection button for failed connections */}
            {connectionStatus === 'failed' && isOnline && (
              <Button
                size="sm"
                onClick={handleReconnect}
                disabled={isReconnecting}
                className="w-full mt-2"
              >
                {isReconnecting ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Reconnecting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reconnect
                  </>
                )}
              </Button>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatus;
