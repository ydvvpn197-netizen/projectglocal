import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Bug, Home, Settings, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Enhanced Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error to external service (if configured)
    this.logError(error, errorInfo);
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
    };

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      console.log('📊 Error logged:', errorData);
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      console.warn('🚫 Max retry attempts reached');
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
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
    if (error.name === 'ChunkLoadError') return 'Bundle Loading Error';
    if (error.name === 'TypeError') return 'Type Error';
    if (error.name === 'ReferenceError') return 'Reference Error';
    if (error.message.includes('Network')) return 'Network Error';
    if (error.message.includes('Authentication')) return 'Authentication Error';
    if (error.message.includes('Permission')) return 'Permission Error';
    return 'Unknown Error';
  };

  private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
    if (error.name === 'ChunkLoadError') return 'high';
    if (error.message.includes('Network')) return 'medium';
    if (error.message.includes('Authentication')) return 'high';
    if (error.message.includes('Permission')) return 'critical';
    return 'medium';
  };

  private getErrorSuggestions = (error: Error): string[] => {
    const suggestions: string[] = [];

    if (error.name === 'ChunkLoadError') {
      suggestions.push('Try refreshing the page');
      suggestions.push('Check your internet connection');
      suggestions.push('Clear browser cache');
    } else if (error.message.includes('Network')) {
      suggestions.push('Check your internet connection');
      suggestions.push('Try again in a few moments');
    } else if (error.message.includes('Authentication')) {
      suggestions.push('Try signing out and back in');
      suggestions.push('Clear browser data');
    } else if (error.message.includes('Permission')) {
      suggestions.push('Contact support if this persists');
    } else {
      suggestions.push('Try refreshing the page');
      suggestions.push('Clear browser cache');
    }

    return suggestions;
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state;
      const errorType = error ? this.getErrorType(error) : 'Unknown Error';
      const severity = error ? this.getErrorSeverity(error) : 'medium';
      const suggestions = error ? this.getErrorSuggestions(error) : [];

      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

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
                  {severity === 'critical' ? <AlertTriangle className="w-8 h-8" /> :
                   severity === 'high' ? <Bug className="w-8 h-8" /> :
                   <AlertTriangle className="w-8 h-8" />}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Oops! Something went wrong
              </CardTitle>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant={severity === 'critical' ? 'destructive' : 'secondary'}>
                  {errorType}
                </Badge>
                <Badge variant="outline">
                  Retry {retryCount}/{this.maxRetries}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>What happened?</AlertTitle>
                <AlertDescription>
                  {error?.message || 'An unexpected error occurred. This has been logged and we\'re working to fix it.'}
                </AlertDescription>
              </Alert>

              {suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Try these solutions:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {retryCount < this.maxRetries && (
                  <Button onClick={this.handleRetry} className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                )}
                
                <Button variant="outline" onClick={this.handleReload} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
                
                <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
                
                <Button variant="outline" onClick={this.handleClearStorage} className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Clear Data
                </Button>
              </div>

              {this.props.showDetails && error && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-4 bg-gray-100 rounded-md text-xs font-mono overflow-auto">
                    <div><strong>Error:</strong> {error.name}</div>
                    <div><strong>Message:</strong> {error.message}</div>
                    <div><strong>Error ID:</strong> {this.state.errorId}</div>
                    {error.stack && (
                      <div className="mt-2">
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap">{error.stack}</pre>
                      </div>
                    )}
                    {errorInfo?.componentStack && (
                      <div className="mt-2">
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
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


export default EnhancedErrorBoundary;