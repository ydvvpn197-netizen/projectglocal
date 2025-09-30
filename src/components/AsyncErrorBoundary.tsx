import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AsyncErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('AsyncErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement error logging service
      console.error('Production async error:', error);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Failed to load content
            </CardTitle>
            <CardDescription className="text-gray-600">
              There was a problem loading this content. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-left">
                <h4 className="text-sm font-medium text-red-800">Error Details:</h4>
                <p className="mt-1 text-sm text-red-700">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-red-600">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            <Button 
              onClick={this.handleRetry}
              variant="default"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to catch async errors
export const useAsyncErrorHandler = () => {
  const handleAsyncError = (error: Error, context?: string) => {
    console.error('Async error caught by useAsyncErrorHandler:', error, context);
    
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement error logging service
      console.error('Production async error:', error, context);
    }
  };

  return { handleAsyncError };
};
