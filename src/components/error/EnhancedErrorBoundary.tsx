import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  Send,
  Copy,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  enableReporting?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  userAction: string;
  reportSent: boolean;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      userAction: '',
      reportSent: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      userAction: this.getUserAction()
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to monitoring service
    this.logError(error, errorInfo);
  }

  private getUserAction = (): string => {
    // Try to determine what the user was doing when the error occurred
    const path = window.location.pathname;
    const search = window.location.search;
    
    if (path.includes('/feed')) return 'Viewing feed';
    if (path.includes('/profile')) return 'Viewing profile';
    if (path.includes('/create')) return 'Creating post';
    if (path.includes('/events')) return 'Browsing events';
    if (path.includes('/messages')) return 'Viewing messages';
    if (search.includes('search=')) return 'Searching';
    
    return 'Unknown action';
  };

  private logError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In a real app, you'd send this to your error monitoring service
      console.log('Error logged:', {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAction: this.state.userAction,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
        userAction: '',
        reportSent: false
      });
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleCopyError = async () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      userAction: this.state.userAction,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      // Show success feedback
    } catch (error) {
      console.error('Failed to copy error details:', error);
    }
  };

  private handleReportError = async () => {
    try {
      // In a real app, you'd send this to your error reporting service
      console.log('Error reported:', this.state.errorId);
      this.setState({ reportSent: true });
    } catch (error) {
      console.error('Failed to report error:', error);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId, userAction, reportSent } = this.state;
      const canRetry = this.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <Card className="overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8" />
                  <div>
                    <CardTitle className="text-xl">Something went wrong</CardTitle>
                    <p className="text-red-100 mt-1">
                      We encountered an unexpected error while you were {userAction.toLowerCase()}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white w-fit">
                  Error ID: {errorId}
                </Badge>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Error message */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-1">Error Details</h4>
                      <p className="text-red-700 text-sm">
                        {error?.message || 'An unknown error occurred'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {canRetry && (
                    <Button 
                      onClick={this.handleRetry}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again ({this.maxRetries - this.retryCount} left)
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={this.handleGoHome}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={this.handleReload}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={this.handleCopyError}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Error Details
                  </Button>
                </div>

                {/* Error reporting */}
                {this.props.enableReporting && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">Help us improve</h4>
                        <p className="text-sm text-muted-foreground">
                          Report this error to help us fix it faster
                        </p>
                      </div>
                      {reportSent ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Reported</span>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={this.handleReportError}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Report Error
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Technical details (collapsible) */}
                {this.props.showDetails && error && (
                  <details className="border rounded-lg">
                    <summary className="p-3 cursor-pointer hover:bg-gray-50 flex items-center gap-2">
                      <Bug className="h-4 w-4" />
                      <span className="font-medium">Technical Details</span>
                    </summary>
                    <div className="p-3 bg-gray-50 border-t">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  </details>
                )}

                {/* Helpful links */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Need help?</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-blue-700">
                      If this error persists, try these steps:
                    </p>
                    <ul className="list-disc list-inside text-blue-700 space-y-1">
                      <li>Clear your browser cache and cookies</li>
                      <li>Check your internet connection</li>
                      <li>Try using a different browser</li>
                      <li>Contact support if the problem continues</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for programmatic error handling
export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    toast({
      title: "Something went wrong",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
  };

  const handleAsyncError = (error: unknown, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    handleError(new Error(errorMessage), context);
  };

  return { handleError, handleAsyncError };
};

export default EnhancedErrorBoundary;
