import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { forceReconnection } from '@/integrations/supabase/client';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Home,
  Settings
} from 'lucide-react';

interface OfflineFallbackProps {
  children?: React.ReactNode;
  fallbackMessage?: string;
  showReconnectButton?: boolean;
  showNavigation?: boolean;
}

/**
 * Offline Fallback Component
 * Provides a better user experience when offline or experiencing connection issues
 */
export const OfflineFallback: React.FC<OfflineFallbackProps> = ({
  children,
  fallbackMessage = "You're currently offline or experiencing connection issues.",
  showReconnectButton = true,
  showNavigation = true
}) => {
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
          icon: <CheckCircle className="w-6 h-6" />,
          title: 'Connected',
          description: 'All services are working properly',
          variant: 'default' as const,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'connecting':
        return {
          icon: <RefreshCw className="w-6 h-6 animate-spin" />,
          title: 'Connecting',
          description: 'Establishing connection to services...',
          variant: 'secondary' as const,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          title: 'Connection Failed',
          description: 'Unable to connect to services. Please check your connection.',
          variant: 'destructive' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      case 'offline':
        return {
          icon: <WifiOff className="w-6 h-6" />,
          title: 'Offline',
          description: 'No internet connection detected. Please check your network.',
          variant: 'outline' as const,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
      default:
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          title: 'Unknown Status',
          description: 'Connection status is unclear',
          variant: 'outline' as const,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const statusConfig = getStatusConfig();

  // If we're connected and online, show children
  if (connectionStatus === 'connected' && isOnline) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-xl">
        <CardHeader className="text-center">
          <div className={`w-24 h-24 ${statusConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <div className={statusConfig.color}>
              {statusConfig.icon}
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            {statusConfig.title}
          </CardTitle>
          
          <CardDescription className="text-gray-600">
            {fallbackMessage}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Current Status:</div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Wifi className={`w-3 h-3 ${isOnline ? 'text-green-600' : 'text-red-600'}`} />
                Network: {isOnline ? 'Online' : 'Offline'}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-blue-500' :
                  connectionStatus === 'failed' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
                Service: {connectionStatus}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="text-center text-sm text-gray-600">
            {statusConfig.description}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {showReconnectButton && connectionStatus === 'failed' && isOnline && (
              <Button 
                onClick={handleReconnect} 
                disabled={isReconnecting}
                className="w-full"
                variant="outline"
              >
                {isReconnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Reconnecting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try to Reconnect
                  </>
                )}
              </Button>
            )}

            {showNavigation && (
              <>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline" 
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/config-status'} 
                  variant="outline" 
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Check Configuration
                </Button>
              </>
            )}
          </div>

          {/* Helpful Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-800 mb-2">💡 Helpful Tips:</div>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Try refreshing the page</li>
              <li>• Check if the service is down</li>
              <li>• Clear your browser cache if needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineFallback;
