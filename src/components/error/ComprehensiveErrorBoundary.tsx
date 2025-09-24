import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Settings, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  isOnline: boolean;
  lastErrorTime: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  level?: 'page' | 'component' | 'critical';
  showDetails?: boolean;
  className?: string;
}

export class ComprehensiveErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isOnline: navigator.onLine,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Call custom error handler
    onError?.(error, errorInfo);

    // Report error to monitoring service (if available)
    this.reportError(error, errorInfo);
  }

  componentDidMount() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && resetOnPropsChange) {
      const hasResetKeyChanged = resetKeys?.some((key, index) => 
        key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  private handleOnline = () => {
    this.setState({ isOnline: true });
  };

  private handleOffline = () => {
    this.setState({ isOnline: false });
  };

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In production, this would send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      console.log('Error reported to monitoring service:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: this.state.retryCount + 1
    });
  };

  private handleRetry = () => {
    if (this.state.retryCount >= 3) {
      // After 3 retries, redirect to home
      window.location.href = '/';
      return;
    }

    this.resetErrorBoundary();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      this.handleReload();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  };

  private getErrorType = (error: Error): string => {
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'Chunk Load Error';
    }
    if (error.name === 'TypeError' && error.message.includes('Cannot read property')) {
      return 'Type Error';
    }
    if (error.name === 'ReferenceError') {
      return 'Reference Error';
    }
    if (error.message.includes('Network')) {
      return 'Network Error';
    }
    if (error.message.includes('Authentication')) {
      return 'Authentication Error';
    }
    return 'Application Error';
  };

  private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
    if (error.name === 'ChunkLoadError') return 'medium';
    if (error.message.includes('Network')) return 'high';
    if (error.message.includes('Authentication')) return 'high';
    if (error.name === 'TypeError') return 'medium';
    return 'low';
  };

  private getErrorSuggestions = (error: Error): string[] => {
    const suggestions: string[] = [];
    
    if (error.name === 'ChunkLoadError') {
      suggestions.push('Try refreshing the page');
      suggestions.push('Clear your browser cache');
      suggestions.push('Check your internet connection');
    } else if (error.message.includes('Network')) {
      suggestions.push('Check your internet connection');
      suggestions.push('Try again in a few moments');
      suggestions.push('Contact support if the issue persists');
    } else if (error.message.includes('Authentication')) {
      suggestions.push('Try signing in again');
      suggestions.push('Clear your browser data');
      suggestions.push('Contact support if the issue persists');
    } else {
      suggestions.push('Try refreshing the page');
      suggestions.push('Clear your browser cache');
      suggestions.push('Contact support if the issue persists');
    }
    
    return suggestions;
  };

  render() {
    const { hasError, error, errorInfo, retryCount, isOnline } = this.state;
    const { children, fallback, level = 'component', showDetails = false, className } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const errorType = error ? this.getErrorType(error) : 'Unknown Error';
      const severity = error ? this.getErrorSeverity(error) : 'low';
      const suggestions = error ? this.getErrorSuggestions(error) : [];

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn('min-h-screen flex items-center justify-center p-4', className)}
        >
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                We encountered an unexpected error. Don't worry, we're here to help!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={severity === 'critical' ? 'destructive' : 'secondary'}>
                    {errorType}
                  </Badge>
                  <Badge variant={isOnline ? 'default' : 'destructive'}>
                    {isOnline ? (
                      <>
                        <Wifi className="w-3 h-3 mr-1" />
                        Online
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 mr-1" />
                        Offline
                      </>
                    )}
                  </Badge>
                </div>
                
                {retryCount > 0 && (
                  <p className="text-sm text-gray-500">
                    Retry attempt: {retryCount}/3
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Error Details
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {error.message}
                  </p>
                  {showDetails && error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                        Show Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Suggestions */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  What you can try:
                </h4>
                <ul className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                      <span className="mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRetry}
                  disabled={retryCount >= 3}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              </div>

              {/* Advanced Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <details className="group">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 flex items-center">
                    <Settings className="w-4 h-4 mr-1" />
                    Advanced Options
                  </summary>
                  <div className="mt-3 space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={this.handleClearStorage}
                      className="w-full"
                    >
                      Clear Browser Data
                    </Button>
                    {showDetails && errorInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-gray-500">
                          Component Stack
                        </summary>
                        <pre className="mt-1 text-xs text-gray-500 overflow-auto max-h-20">
                          {errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </details>
              </div>

              {/* Error ID for Support */}
              <div className="text-center">
                <p className="text-xs text-gray-400">
                  Error ID: {this.state.errorId}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    return children;
  }
}

// Hook for error boundary
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

// Higher-order component for error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ComprehensiveErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ComprehensiveErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ComprehensiveErrorBoundary;
