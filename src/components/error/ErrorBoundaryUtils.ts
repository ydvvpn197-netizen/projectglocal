import { ErrorInfo } from 'react';

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showDetails?: boolean;
  }, 'children'>
) {
  const WrappedComponent = (props: P) => {
    const { EnhancedErrorBoundary } = require('./EnhancedErrorBoundary');
    return (
      <EnhancedErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </EnhancedErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for programmatic error handling
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`🚨 Error in ${context || 'unknown context'}:`, error);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      console.log('📊 Error tracked:', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return { handleError };
}
