import { useState, useCallback } from 'react';
import { errorHandler, AppError } from '@/utils/errorHandler';
import { useToast } from './use-toast';

export const useErrorHandler = () => {
  const { toast } = useToast();
  const [errors, setErrors] = useState<AppError[]>([]);

  // Handle error with toast notification
  const handleError = useCallback((error: Error | AppError, context?: string) => {
    const appError = errorHandler.handleError(error, context);
    
    // Add to local state
    setErrors(prev => [...prev, appError]);

    // Show toast notification
    toast({
      title: "Error Occurred",
      description: appError.message,
      variant: "destructive"
    });

    return appError;
  }, [toast]);

  // Handle API error
  const handleApiError = useCallback((error: Error | unknown, endpoint: string) => {
    const appError = errorHandler.handleApiError(error, endpoint);
    
    // Add to local state
    setErrors(prev => [...prev, appError]);

    // Show toast notification
    toast({
      title: "API Error",
      description: appError.message,
      variant: "destructive"
    });

    return appError;
  }, [toast]);

  // Handle authentication error
  const handleAuthError = useCallback((error: Error | unknown, action: string) => {
    const appError = errorHandler.handleAuthError(error, action);
    
    // Add to local state
    setErrors(prev => [...prev, appError]);

    // Show toast notification
    toast({
      title: "Authentication Error",
      description: appError.message,
      variant: "destructive"
    });

    return appError;
  }, [toast]);

  // Handle database error
  const handleDatabaseError = useCallback((error: Error | unknown, operation: string) => {
    const appError = errorHandler.handleDatabaseError(error, operation);
    
    // Add to local state
    setErrors(prev => [...prev, appError]);

    // Show toast notification
    toast({
      title: "Database Error",
      description: appError.message,
      variant: "destructive"
    });

    return appError;
  }, [toast]);

  // Handle validation error
  const handleValidationError = useCallback((error: Error | unknown, field: string) => {
    const appError = errorHandler.handleValidationError(error, field);
    
    // Add to local state
    setErrors(prev => [...prev, appError]);

    // Show toast notification
    toast({
      title: "Validation Error",
      description: appError.message,
      variant: "destructive"
    });

    return appError;
  }, [toast]);

  // Handle network error
  const handleNetworkError = useCallback((error: Error | unknown, url: string) => {
    const appError = errorHandler.handleNetworkError(error, url);
    
    // Add to local state
    setErrors(prev => [...prev, appError]);

    // Show toast notification
    toast({
      title: "Network Error",
      description: appError.message,
      variant: "destructive"
    });

    return appError;
  }, [toast]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Get error statistics
  const getErrorStats = useCallback(() => {
    return errorHandler.getErrorStats();
  }, []);

  // Get error log
  const getErrorLog = useCallback(() => {
    return errorHandler.getErrorLog();
  }, []);

  return {
    errors,
    handleError,
    handleApiError,
    handleAuthError,
    handleDatabaseError,
    handleValidationError,
    handleNetworkError,
    clearErrors,
    getErrorStats,
    getErrorLog
  };
};
