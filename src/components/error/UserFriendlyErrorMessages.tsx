import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Settings, 
  Wifi, 
  WifiOff,
  Shield,
  Database,
  Server,
  User,
  FileText,
  Clock
} from 'lucide-react';

export interface ErrorMessageProps {
  error: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  onReload?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface ErrorContext {
  type: 'network' | 'auth' | 'database' | 'api' | 'validation' | 'permission' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAction?: string;
  timestamp: Date;
}

export function UserFriendlyErrorMessages({ 
  error, 
  onRetry, 
  onGoHome, 
  onReload, 
  showActions = true,
  compact = false 
}: ErrorMessageProps) {
  const context = analyzeError(error);
  
  if (compact) {
    return <CompactErrorMessage context={context} error={error} />;
  }

  return <FullErrorMessage 
    context={context} 
    error={error} 
    onRetry={onRetry}
    onGoHome={onGoHome}
    onReload={onReload}
    showActions={showActions}
  />;
}

function analyzeError(error: Error): ErrorContext {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('connection') || 
      message.includes('timeout') || message.includes('offline') || name.includes('network')) {
    return {
      type: 'network',
      severity: navigator.onLine ? 'medium' : 'high',
      userAction: 'Check your internet connection',
      timestamp: new Date(),
    };
  }

  // Authentication errors
  if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden') ||
      message.includes('token') || message.includes('session') || name.includes('auth')) {
    return {
      type: 'auth',
      severity: 'high',
      userAction: 'Please sign in again',
      timestamp: new Date(),
    };
  }

  // Database errors
  if (message.includes('database') || message.includes('sql') || message.includes('query') ||
      message.includes('constraint') || name.includes('database')) {
    return {
      type: 'database',
      severity: 'critical',
      userAction: 'Contact support if this persists',
      timestamp: new Date(),
    };
  }

  // API errors
  if (message.includes('api') || message.includes('server') || message.includes('500') ||
      message.includes('502') || message.includes('503') || message.includes('504')) {
    return {
      type: 'api',
      severity: 'high',
      userAction: 'Try again in a moment',
      timestamp: new Date(),
    };
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required') ||
      message.includes('format') || name.includes('validation')) {
    return {
      type: 'validation',
      severity: 'low',
      userAction: 'Please check your input',
      timestamp: new Date(),
    };
  }

  // Permission errors
  if (message.includes('permission') || message.includes('access') || message.includes('denied') ||
      name.includes('permission')) {
    return {
      type: 'permission',
      severity: 'high',
      userAction: 'Check your permissions',
      timestamp: new Date(),
    };
  }

  // Default
  return {
    type: 'unknown',
    severity: 'medium',
    userAction: 'Try refreshing the page',
    timestamp: new Date(),
  };
}

function CompactErrorMessage({ context, error }: { context: ErrorContext; error: Error }) {
  const { type, severity, userAction } = context;
  
  const getIcon = () => {
    switch (type) {
      case 'network': return <Wifi className="h-4 w-4" />;
      case 'auth': return <User className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'api': return <Server className="h-4 w-4" />;
      case 'validation': return <FileText className="h-4 w-4" />;
      case 'permission': return <Shield className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Alert variant={getSeverityColor()}>
      {getIcon()}
      <AlertTitle className="flex items-center gap-2">
        <span>{getErrorMessage(type)}</span>
        <Badge variant="outline" className="text-xs">
          {severity.toUpperCase()}
        </Badge>
      </AlertTitle>
      <AlertDescription>
        {userAction}
      </AlertDescription>
    </Alert>
  );
}

function FullErrorMessage({ 
  context, 
  error, 
  onRetry, 
  onGoHome, 
  onReload, 
  showActions 
}: { 
  context: ErrorContext; 
  error: Error; 
  onRetry?: () => void;
  onGoHome?: () => void;
  onReload?: () => void;
  showActions?: boolean;
}) {
  const { type, severity, userAction } = context;
  
  const getIcon = () => {
    switch (type) {
      case 'network': return <Wifi className="h-6 w-6" />;
      case 'auth': return <User className="h-6 w-6" />;
      case 'database': return <Database className="h-6 w-6" />;
      case 'api': return <Server className="h-6 w-6" />;
      case 'validation': return <FileText className="h-6 w-6" />;
      case 'permission': return <Shield className="h-6 w-6" />;
      default: return <AlertTriangle className="h-6 w-6" />;
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSuggestions = () => {
    switch (type) {
      case 'network':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Check if the service is temporarily unavailable',
          'Try using a different network'
        ];
      case 'auth':
        return [
          'Try signing out and signing back in',
          'Clear your browser data',
          'Check if your session has expired',
          'Verify your credentials'
        ];
      case 'database':
        return [
          'Contact support if this persists',
          'Try again in a few moments',
          'Check if the service is under maintenance'
        ];
      case 'api':
        return [
          'Try again in a moment',
          'Check if the service is temporarily unavailable',
          'Contact support if the problem persists'
        ];
      case 'validation':
        return [
          'Check your input for errors',
          'Make sure all required fields are filled',
          'Verify the format of your data'
        ];
      case 'permission':
        return [
          'Check if you have the required permissions',
          'Contact your administrator',
          'Try signing out and back in'
        ];
      default:
        return [
          'Try refreshing the page',
          'Clear your browser cache',
          'Contact support if the problem persists'
        ];
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className={`flex justify-center mb-4 p-3 rounded-full ${getSeverityColor()}`}>
          {getIcon()}
        </div>
        <CardTitle className="text-xl">
          {getErrorMessage(type)}
        </CardTitle>
        <CardDescription>
          {userAction}
        </CardDescription>
        <div className="flex justify-center gap-2 mt-2">
          <Badge variant={severity === 'critical' ? 'destructive' : 'secondary'}>
            {type.toUpperCase()}
          </Badge>
          <Badge variant="outline">
            {severity.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
          {navigator.onLine ? (
            <>
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Network: Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">Network: Offline</span>
            </>
          )}
        </div>

        {/* Suggestions */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Try these solutions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {getSuggestions().map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Error Details */}
        <details className="bg-gray-100 p-4 rounded-lg">
          <summary className="cursor-pointer font-medium text-gray-700">
            Technical Details
          </summary>
          <div className="mt-2 text-sm text-gray-600 space-y-1">
            <div><strong>Error:</strong> {error.name}</div>
            <div><strong>Message:</strong> {error.message}</div>
            <div><strong>Time:</strong> {context.timestamp.toLocaleString()}</div>
          </div>
        </details>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex flex-wrap gap-3">
            {onRetry && (
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            
            {onReload && (
              <Button variant="outline" onClick={onReload} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
            )}
            
            {onGoHome && (
              <Button variant="outline" onClick={onGoHome} className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Clear Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getErrorMessage(type: string): string {
  switch (type) {
    case 'network':
      return navigator.onLine ? 'Connection Problem' : 'You\'re Offline';
    case 'auth':
      return 'Authentication Required';
    case 'database':
      return 'Service Unavailable';
    case 'api':
      return 'Service Error';
    case 'validation':
      return 'Invalid Input';
    case 'permission':
      return 'Access Denied';
    default:
      return 'Something went wrong';
  }
}

export default UserFriendlyErrorMessages;
