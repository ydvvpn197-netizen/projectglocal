import { toast } from '@/hooks/use-toast';

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  severity: 'error' | 'warning' | 'info';
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  
  private constructor() {}
  
  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Handle API errors consistently across the application
   */
  handleApiError(error: unknown, context?: string): AppError {
    let appError: AppError;

    if (error instanceof Error) {
      appError = {
        message: error.message,
        code: (error as Record<string, unknown>).code as string | undefined,
        details: error,
        severity: 'error'
      };
    } else if (typeof error === 'string') {
      appError = {
        message: error,
        severity: 'error'
      };
    } else {
      appError = {
        message: 'An unexpected error occurred',
        details: error,
        severity: 'error'
      };
    }

    // Log error for debugging
    this.logError(appError, context);
    
    // Show user-friendly message
    this.showUserMessage(appError);
    
    return appError;
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: unknown): AppError {
    const appError = this.handleApiError(error, 'Authentication');
    
    // Special handling for auth errors
    if (appError.message.includes('Invalid login credentials')) {
      appError.message = 'Invalid email or password. Please try again.';
    } else if (appError.message.includes('Email not confirmed')) {
      appError.message = 'Please check your email and click the confirmation link.';
    }
    
    return appError;
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: unknown): AppError {
    const appError = this.handleApiError(error, 'Network');
    
    if (appError.message.includes('fetch')) {
      appError.message = 'Network connection error. Please check your internet connection.';
    }
    
    return appError;
  }

  /**
   * Log errors for debugging
   */
  private logError(error: AppError, context?: string): void {
    if (import.meta.env.DEV) {
      console.error(`[${context || 'App'}] Error:`, {
        message: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString()
      });
    }
    
    // In production, you would send this to a logging service
    // this.sendToLoggingService(error, context);
  }

  /**
   * Show user-friendly error messages
   */
  private showUserMessage(error: AppError): void {
    toast({
      title: this.getErrorTitle(error.severity),
      description: error.message,
      variant: error.severity === 'error' ? 'destructive' : 'default',
    });
  }

  /**
   * Get appropriate error title based on severity
   */
  private getErrorTitle(severity: AppError['severity']): string {
    switch (severity) {
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return 'Error';
    }
  }

  /**
   * Send error to logging service (for production)
   */
  private sendToLoggingService(error: AppError, context?: string): void {
    // Implementation for production logging service (e.g., Sentry)
    // This would be implemented when adding monitoring
  }
}

// Export singleton instance
export const errorHandler = ErrorHandlingService.getInstance();
