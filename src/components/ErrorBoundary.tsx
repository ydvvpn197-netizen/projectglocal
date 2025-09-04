import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, Settings, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Log error to console in production for debugging
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // Track error for analytics if enabled
    if (import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true') {
      this.trackError(error, errorInfo);
    }
  }

  private trackError = (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // Send error to analytics service
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      // You can implement your error tracking service here
      console.log('Error tracked:', errorData);
    } catch (trackingError) {
      console.warn('Failed to track error:', trackingError);
    }
  };

  private handleRetry = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1 
    }));
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleCheckConfig = () => {
    window.location.href = '/config-status';
  };

  private handleClearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const isAuthError = this.state.error?.message?.includes('auth') || 
                         this.state.error?.message?.includes('Supabase') ||
                         this.state.error?.message?.includes('network');
      
      const isConfigError = this.state.error?.message?.includes('environment') ||
                           this.state.error?.message?.includes('configuration') ||
                           this.state.error?.message?.includes('MISSING_ENV_VARS');
      
      const isRoutingError = this.state.error?.message?.includes('routing') ||
                            this.state.error?.message?.includes('route') ||
                            this.state.error?.message?.includes('navigation');

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full shadow-xl">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600">
                We're sorry, but something unexpected happened. Here are some options to help resolve this.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error Type Detection */}
              {(isAuthError || isConfigError || isRoutingError) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Bug className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {isAuthError ? 'Authentication Issue Detected' : 
                       isConfigError ? 'Configuration Issue Detected' : 
                       'Routing Issue Detected'}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    {isAuthError ? 'This appears to be a connection or authentication problem.' :
                     isConfigError ? 'This appears to be a configuration problem.' :
                     'This appears to be a routing or navigation problem. Try refreshing the page.'}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {this.state.error && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Error Details:</div>
                  <div className="text-xs text-gray-600 font-mono break-words">
                    {this.state.error.message}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={this.handleRetry} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={this.state.retryCount >= 3}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {this.state.retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
                </Button>

                {isConfigError && (
                  <Button 
                    onClick={this.handleCheckConfig} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Check Configuration
                  </Button>
                )}

                {isRoutingError && (
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Page
                  </Button>
                )}

                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline" 
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>

                {isAuthError && (
                  <Button 
                    onClick={this.handleClearStorage} 
                    variant="outline" 
                    className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    Clear Browser Data
                  </Button>
                )}
              </div>

              {/* Retry Counter */}
              {this.state.retryCount > 0 && (
                <div className="text-center text-sm text-gray-500">
                  Retry attempts: {this.state.retryCount}/3
                </div>
              )}

              {/* Debug Information */}
              {(process.env.NODE_ENV === 'development' || import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium">
                    Debug Information
                  </summary>
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded border overflow-auto max-h-40">
                    <div className="font-semibold mb-1">Error Stack:</div>
                    <div className="font-mono text-xs whitespace-pre-wrap">{this.state.error.stack}</div>
                    {this.state.errorInfo && (
                      <>
                        <div className="font-semibold mb-1 mt-2">Component Stack:</div>
                        <div className="font-mono text-xs whitespace-pre-wrap">{this.state.errorInfo.componentStack}</div>
                      </>
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
