import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Home, 
  RefreshCw, 
  Settings, 
  Wifi, 
  WifiOff, 
  Bug,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { errorHandlingService } from '@/services/errorHandlingService';
import { ApplicationError, ErrorCodes } from '@/utils/errorHandling';

interface AdvancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'component' | 'critical';
  showDetails?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface AdvancedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
  lastRetryTime: number;
  errorId: string;
  recoveryAttempts: number;
}

export class AdvancedErrorBoundary extends Component<
  AdvancedErrorBoundaryProps,
  AdvancedErrorBoundaryState
> {
  private retryTimeout?: NodeJS.Timeout;
  private recoveryTimeout?: NodeJS.Timeout;

  constructor(props: AdvancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
      lastRetryTime: 0,
      errorId: '',
      recoveryAttempts: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AdvancedErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Advanced Error Boundary caught an error:', error, errorInfo);
    
    this.setState({ error, errorInfo });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Enhanced error logging and recovery
    this.handleErrorWithRecovery(error, errorInfo);
  }

  private handleErrorWithRecovery = async (error: Error, errorInfo: ErrorInfo) => {
    const { level = 'component' } = this.props;
    
    // Create error context
    const errorContext = {
      level,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    };

    // Use the error handling service for comprehensive error management
    try {
      const result = await errorHandlingService.handleError(error, {
        showToast: level === 'critical',
        logToConsole: true,
        attemptRecovery: true,
        context: `ErrorBoundary-${level}`,
      });

      // If recovery was successful, reset the error boundary
      if (result.recovered) {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: 0,
          isRetrying: false,
        });
      }
    } catch (handlingError) {
      console.error('Error handling service failed:', handlingError);
    }
  };

  private handleRetry = async () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { retryCount, error } = this.state;

    if (retryCount >= maxRetries) {
      console.warn('🚫 Max retry attempts reached');
      return;
    }

    this.setState({ isRetrying: true, lastRetryTime: Date.now() });

    // Exponential backoff
    const delay = retryDelay * Math.pow(2, retryCount);
    
    this.retryTimeout = setTimeout(async () => {
      try {
        // Attempt recovery based on error type
        const recovered = await this.attemptRecovery();
        
        if (recovered) {
          this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0,
            isRetrying: false,
          });
        } else {
          this.setState(prevState => ({
            retryCount: prevState.retryCount + 1,
            isRetrying: false,
          }));
        }
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        this.setState({ isRetrying: false });
      }
    }, delay);
  };

  private attemptRecovery = async (): Promise<boolean> => {
    const { error } = this.state;
    if (!error) return false;

    // Check if it's a network error
    if (this.isNetworkError(error)) {
      return await this.attemptNetworkRecovery();
    }

    // Check if it's a chunk loading error
    if (this.isChunkLoadError(error)) {
      return await this.attemptChunkRecovery();
    }

    // Check if it's an authentication error
    if (this.isAuthError(error)) {
      return await this.attemptAuthRecovery();
    }

    // Generic recovery attempt
    return await this.attemptGenericRecovery();
  };

  private isNetworkError = (error: Error): boolean => {
    const networkKeywords = ['network', 'fetch', 'connection', 'timeout', 'offline'];
    return networkKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword) ||
      error.name.toLowerCase().includes(keyword)
    );
  };

  private isChunkLoadError = (error: Error): boolean => {
    return error.name === 'ChunkLoadError' || 
           error.message.includes('Loading chunk') ||
           error.message.includes('Loading CSS chunk');
  };

  private isAuthError = (error: Error): boolean => {
    const authKeywords = ['auth', 'unauthorized', 'forbidden', 'token', 'session'];
    return authKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword) ||
      error.name.toLowerCase().includes(keyword)
    );
  };

  private attemptNetworkRecovery = async (): Promise<boolean> => {
    try {
      // Check network connectivity
      if (!navigator.onLine) {
        return false;
      }

      // Test a simple fetch to verify connectivity
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      return response.ok;
    } catch {
      return false;
    }
  };

  private attemptChunkRecovery = async (): Promise<boolean> => {
    try {
      // Force reload the page to get fresh chunks
      window.location.reload();
      return true;
    } catch {
      return false;
    }
  };

  private attemptAuthRecovery = async (): Promise<boolean> => {
    try {
      // Clear auth-related storage
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Redirect to login
      window.location.href = '/auth/login';
      return true;
    } catch {
      return false;
    }
  };

  private attemptGenericRecovery = async (): Promise<boolean> => {
    try {
      // Clear problematic caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      return true;
    } catch {
      return false;
    }
  };

  private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
    if (this.isAuthError(error)) return 'critical';
    if (this.isChunkLoadError(error)) return 'high';
    if (this.isNetworkError(error)) return 'medium';
    return 'medium';
  };

  private getErrorSuggestions = (error: Error): string[] => {
    const suggestions: string[] = [];

    if (this.isNetworkError(error)) {
      suggestions.push('Check your internet connection');
      suggestions.push('Try refreshing the page');
      suggestions.push('Check if the service is temporarily unavailable');
    }

    if (this.isChunkLoadError(error)) {
      suggestions.push('Clear your browser cache');
      suggestions.push('Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)');
      suggestions.push('Disable browser extensions temporarily');
    }

    if (this.isAuthError(error)) {
      suggestions.push('Try signing out and signing back in');
      suggestions.push('Clear your browser data');
      suggestions.push('Check if your session has expired');
    }

    if (suggestions.length === 0) {
      suggestions.push('Try refreshing the page');
      suggestions.push('Clear your browser cache');
      suggestions.push('Contact support if the problem persists');
    }

    return suggestions;
  };

  private getRetryStatus = (): { canRetry: boolean; nextRetryIn?: number } => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { retryCount, lastRetryTime, isRetrying } = this.state;

    if (isRetrying) {
      const elapsed = Date.now() - lastRetryTime;
      const delay = retryDelay * Math.pow(2, retryCount);
      const remaining = Math.max(0, delay - elapsed);
      
      return { canRetry: false, nextRetryIn: remaining };
    }

    return { 
      canRetry: retryCount < maxRetries,
    };
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      const { error, retryCount, isRetrying } = this.state;
      const { level = 'component', maxRetries = 3, showDetails = false } = this.props;
      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const severity = error ? this.getErrorSeverity(error) : 'medium';
      const suggestions = error ? this.getErrorSuggestions(error) : [];
      const { canRetry, nextRetryIn } = this.getRetryStatus();

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${
                  severity === 'critical' ? 'bg-red-100 text-red-600' :
                  severity === 'high' ? 'bg-orange-100 text-orange-600' :
                  severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {severity === 'critical' ? <XCircle className="w-8 h-8" /> :
                   severity === 'high' ? <AlertTriangle className="w-8 h-8" /> :
                   <Bug className="w-8 h-8" />}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {severity === 'critical' ? 'Critical Error' :
                 severity === 'high' ? 'Something went wrong' :
                 'Oops! Something happened'}
              </CardTitle>
              <CardDescription className="mt-2">
                {error?.message || 'An unexpected error occurred. We\'re working to fix it.'}
              </CardDescription>
              <div className="flex justify-center gap-2 mt-4">
                <Badge variant={severity === 'critical' ? 'destructive' : 'secondary'}>
                  {level.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  Retry {retryCount}/{maxRetries}
                </Badge>
                {isRetrying && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" />
                    Retrying...
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
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
              {suggestions.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Try these solutions:</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm">{suggestion}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {canRetry && !isRetrying && (
                  <Button 
                    onClick={this.handleRetry} 
                    className="flex items-center gap-2"
                    disabled={isRetrying}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                )}

                {isRetrying && nextRetryIn && (
                  <Button variant="outline" disabled className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    Retrying in {Math.ceil(nextRetryIn / 1000)}s...
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
                
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

              {/* Error Details (Development) */}
              {showDetails && error && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-4 bg-gray-100 rounded-md text-xs font-mono overflow-auto">
                    <div><strong>Error ID:</strong> {this.state.errorId}</div>
                    <div><strong>Error:</strong> {error.name}</div>
                    <div><strong>Message:</strong> {error.message}</div>
                    <div><strong>Retry Count:</strong> {retryCount}</div>
                    {error.stack && (
                      <div className="mt-2">
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap">{error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdvancedErrorBoundary;
