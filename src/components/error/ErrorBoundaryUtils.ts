import { ComponentType, ReactNode } from 'react';

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export const getErrorBoundaryDisplayName = (Component: ComponentType<Record<string, unknown>>): string => {
  return Component.displayName || Component.name || 'ErrorBoundary';
};

export const createErrorBoundary = (
  Component: ComponentType<Record<string, unknown>>,
  displayName?: string
): ComponentType<ErrorBoundaryProps> => {
  const ErrorBoundaryComponent = Component;
  ErrorBoundaryComponent.displayName = displayName || getErrorBoundaryDisplayName(Component);
  return ErrorBoundaryComponent;
};

export const logError = (error: Error, errorInfo: ErrorInfo): void => {
  console.error('ErrorBoundary caught an error:', error, errorInfo);
  
  // Log to external service if available
  if (typeof window !== 'undefined' && (window as Record<string, unknown>).errorReporting) {
    ((window as Record<string, unknown>).errorReporting as Record<string, unknown>).captureException?.(error, {
      extra: errorInfo
    });
  }
};

export const resetErrorBoundary = (setState: (state: ErrorBoundaryState) => void): void => {
  setState({ hasError: false, error: undefined, errorInfo: undefined });
};
