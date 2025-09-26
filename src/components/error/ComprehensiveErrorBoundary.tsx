import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw, Settings, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
  lastError?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  level?: 'page' | 'component' | 'critical';
  showDetails?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ComprehensiveErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      lastError: error.message
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ComprehensiveErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ error, errorInfo });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log error to monitoring service
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Enhanced error logging with context
    const errorContext = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component',
      retryCount: this.state.retryCount,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      }
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Context:', errorContext);
    }

    // Send to monitoring service (implement your preferred service)
    this.sendToMonitoringService(errorContext);
  };

  private sendToMonitoringService = (errorContext: Record<string, unknown>) => {
    // Implement your monitoring service integration here
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    try {
      // Example: Send to external monitoring service
      // monitoringService.captureException(errorContext);
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring service:', monitoringError);
    }
  };

  private resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
  };

  private retryWithBackoff = () => {
    const { retryCount } = this.state;
    const maxRetries = 3;
    
    if (retryCount >= maxRetries) {
      return;
    }

    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }));

    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, retryCount) * 1000;
    
    this.retryTimeout = setTimeout(() => {
      this.resetError();
    }, delay);
  };

  private checkConfiguration = () => {
    // Check for common configuration issues
    const issues = [];
    
    // Check environment variables
    if (!import.meta.env.VITE_SUPABASE_URL) {
      issues.push('Missing VITE_SUPABASE_URL environment variable');
    }
    
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
      issues.push('Missing VITE_SUPABASE_ANON_KEY environment variable');
    }
    
    // Check network connectivity
    if (!navigator.onLine) {
      issues.push('Network connection is offline');
    }
    
    // Check localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
    } catch (e) {
      issues.push('LocalStorage is not available');
    }
    
    return issues;
  };

  private clearBrowserData = () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear IndexedDB (if used)
      if ('indexedDB' in window) {
        indexedDB.databases?.().then(databases => {
          databases.forEach(db => {
            indexedDB.deleteDatabase(db.name);
          });
        });
      }
      
      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error clearing browser data:', error);
    }
  };

  private getErrorType = (error: Error): string => {
    if (error.message.includes('Network')) return 'Network Error';
    if (error.message.includes('Authentication')) return 'Authentication Error';
    if (error.message.includes('Permission')) return 'Permission Error';
    if (error.message.includes('Configuration')) return 'Configuration Error';
    if (error.message.includes('ChunkLoadError')) return 'Loading Error';
    return 'Application Error';
  };

  private getErrorSuggestions = (error: Error): string[] => {
    const suggestions = [];
    
    if (error.message.includes('Network')) {
      suggestions.push('Check your internet connection');
      suggestions.push('Try refreshing the page');
    }
    
    if (error.message.includes('Authentication')) {
      suggestions.push('Try signing out and signing back in');
      suggestions.push('Clear your browser data');
    }
    
    if (error.message.includes('ChunkLoadError')) {
      suggestions.push('Clear your browser cache');
      suggestions.push('Try a hard refresh (Ctrl+F5)');
    }
    
    if (error.message.includes('Permission')) {
      suggestions.push('Check if you have the required permissions');
      suggestions.push('Contact support if the issue persists');
    }
    
    return suggestions;
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      const errorType = this.state.error ? this.getErrorType(this.state.error) : 'Unknown Error';
      const suggestions = this.state.error ? this.getErrorSuggestions(this.state.error) : [];
      const configIssues = this.checkConfiguration();

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-xl">{errorType}</CardTitle>
              </div>
              <CardDescription>
                We're sorry, but something unexpected happened. Here are some options to help resolve this.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Details */}
              {this.state.error && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Error Details:</h4>
                  <p className="text-sm text-muted-foreground font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Configuration Issues */}
              {configIssues.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Configuration Issues:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {configIssues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Suggestions:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

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

              {/* Error Stack (Development Only) */}
              {this.props.showDetails && this.state.error?.stack && (
                <details className="bg-muted p-4 rounded-lg">
                  <summary className="font-medium cursor-pointer">Error Stack (Development)</summary>
                  <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={this.resetError} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                
                {this.state.retryCount < 3 && (
                  <Button onClick={this.retryWithBackoff} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Retry with Backoff
                  </Button>
                )}
                
                <Button onClick={() => window.location.href = '/'} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go to Home
                </Button>
                
                {configIssues.length > 0 && (
                  <Button onClick={this.clearBrowserData} variant="destructive" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Clear Browser Data
                  </Button>
                )}
              </div>

              {/* Retry Count */}
              {this.state.retryCount > 0 && (
                <div className="text-sm text-muted-foreground">
                  Retry attempts: {this.state.retryCount}/3
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    console.error('Error captured:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}