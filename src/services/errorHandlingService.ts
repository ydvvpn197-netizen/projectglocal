// Enhanced error handling service with better error recovery and user feedback
import { toast } from '@/hooks/use-toast';
import { getConnectionStatus, forceReconnection } from '@/integrations/supabase/client';

export interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
  context?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  stack?: string;
}

export interface ErrorHandlingOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  attemptRecovery?: boolean;
  fallbackValue?: any;
  context?: string;
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorCount = 0;
  private lastErrorTime = 0;
  private readonly maxErrorsPerMinute = 10;
  private readonly errorCooldownMs = 60000; // 1 minute

  private constructor() {}

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Handle errors with enhanced recovery and user feedback
   */
  async handleError(
    error: unknown,
    options: ErrorHandlingOptions = {}
  ): Promise<{ recovered: boolean; fallbackValue?: any }> {
    const {
      showToast = true,
      logToConsole = true,
      attemptRecovery = true,
      fallbackValue,
      context = 'Unknown'
    } = options;

    // Rate limiting for error handling
    if (this.shouldThrottleErrors()) {
      if (logToConsole) {
        console.warn('Error handling throttled due to high error rate');
      }
      return { recovered: false, fallbackValue };
    }

    const errorInfo = this.createErrorInfo(error, context);
    this.errorCount++;
    this.lastErrorTime = Date.now();

    // Log error
    if (logToConsole) {
      this.logError(errorInfo);
    }

    // Attempt recovery for certain error types
    let recovered = false;
    if (attemptRecovery) {
      recovered = await this.attemptErrorRecovery(errorInfo);
    }

    // Show user feedback
    if (showToast) {
      this.showUserFeedback(errorInfo, recovered);
    }

    // Track error for analytics
    this.trackError(errorInfo);

    return { recovered, fallbackValue };
  }

  /**
   * Handle authentication errors specifically
   */
  async handleAuthError(
    error: unknown,
    context = 'Authentication'
  ): Promise<{ recovered: boolean; shouldRetry: boolean }> {
    const errorInfo = this.createErrorInfo(error, context);
    
    // Check if it's a connection issue
    const connectionStatus = getConnectionStatus();
    const isConnectionError = this.isConnectionError(errorInfo);
    
    if (isConnectionError && connectionStatus === 'failed') {
      // Attempt to reconnect
      try {
        const reconnected = await forceReconnection();
        if (reconnected) {
          toast({
            title: "Connection Restored",
            description: "Your connection has been restored. Please try again.",
          });
          return { recovered: true, shouldRetry: true };
        }
      } catch (reconnectError) {
        console.error('Failed to reconnect:', reconnectError);
      }
    }

    // Handle specific auth error types
    const shouldRetry = this.shouldRetryAuthOperation(errorInfo);
    
    if (shouldRetry) {
      toast({
        title: "Authentication Issue",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Authentication Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }

    return { recovered: false, shouldRetry };
  }

  /**
   * Handle API errors with retry logic
   */
  async handleApiError(
    error: unknown,
    context = 'API'
  ): Promise<{ recovered: boolean; shouldRetry: boolean; retryDelay?: number }> {
    const errorInfo = this.createErrorInfo(error, context);
    
    // Determine if this is a retryable error
    const { shouldRetry, retryDelay } = this.analyzeApiError(errorInfo);
    
    if (shouldRetry) {
      toast({
        title: "Service Temporarily Unavailable",
        description: `Retrying in ${Math.ceil((retryDelay || 0) / 1000)} seconds...`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Service Error",
        description: "Please try again later or contact support if the problem persists.",
        variant: "destructive",
      });
    }

    return { recovered: false, shouldRetry, retryDelay };
  }

  /**
   * Create standardized error information
   */
  private createErrorInfo(error: unknown, context: string): ErrorInfo {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = this.extractErrorCode(error);
    const errorStatus = this.extractErrorStatus(error);

    return {
      message: errorMessage,
      code: errorCode,
      status: errorStatus,
      context,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack: error instanceof Error ? error.stack : undefined,
    };
  }

  /**
   * Extract error code from various error types
   */
  private extractErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object') {
      // Check for Supabase error codes
      if ('code' in error) {
        return String(error.code);
      }
      // Check for HTTP status codes
      if ('status' in error) {
        return `HTTP_${error.status}`;
      }
      // Check for custom error codes
      if ('errorCode' in error) {
        return String(error.errorCode);
      }
    }
    return undefined;
  }

  /**
   * Extract HTTP status from errors
   */
  private extractErrorStatus(error: unknown): number | undefined {
    if (error && typeof error === 'object') {
      if ('status' in error && typeof error.status === 'number') {
        return error.status;
      }
      if ('statusCode' in error && typeof error.statusCode === 'number') {
        return error.statusCode;
      }
    }
    return undefined;
  }

  /**
   * Determine if an error is connection-related
   */
  private isConnectionError(errorInfo: ErrorInfo): boolean {
    const connectionKeywords = [
      'network',
      'connection',
      'timeout',
      'fetch',
      'supabase',
      'auth',
      '500',
      '502',
      '503',
      '504'
    ];

    return connectionKeywords.some(keyword => 
      errorInfo.message.toLowerCase().includes(keyword) ||
      errorInfo.code?.toLowerCase().includes(keyword) ||
      errorInfo.status?.toString().includes(keyword)
    );
  }

  /**
   * Determine if an auth operation should be retried
   */
  private shouldRetryAuthOperation(errorInfo: ErrorInfo): boolean {
    const retryableAuthErrors = [
      'network',
      'timeout',
      'connection',
      '500',
      '502',
      '503',
      '504'
    ];

    return retryableAuthErrors.some(keyword => 
      errorInfo.message.toLowerCase().includes(keyword) ||
      errorInfo.code?.toLowerCase().includes(keyword) ||
      errorInfo.status?.toString().includes(keyword)
    );
  }

  /**
   * Analyze API errors for retry logic
   */
  private analyzeApiError(errorInfo: ErrorInfo): { shouldRetry: boolean; retryDelay: number } {
    const status = errorInfo.status;
    
    // 5xx errors are usually retryable
    if (status && status >= 500 && status < 600) {
      return { shouldRetry: true, retryDelay: 5000 }; // 5 seconds
    }
    
    // 429 (Too Many Requests) - retry with exponential backoff
    if (status === 429) {
      return { shouldRetry: true, retryDelay: 10000 }; // 10 seconds
    }
    
    // Connection errors
    if (this.isConnectionError(errorInfo)) {
      return { shouldRetry: true, retryDelay: 3000 }; // 3 seconds
    }
    
    return { shouldRetry: false, retryDelay: 0 };
  }

  /**
   * Attempt to recover from errors
   */
  private async attemptErrorRecovery(errorInfo: ErrorInfo): Promise<boolean> {
    // For connection errors, try to reconnect
    if (this.isConnectionError(errorInfo)) {
      try {
        const reconnected = await forceReconnection();
        if (reconnected) {
          console.log('✅ Error recovery successful: Connection restored');
          return true;
        }
      } catch (recoveryError) {
        console.error('❌ Error recovery failed:', recoveryError);
      }
    }

    return false;
  }

  /**
   * Show user-friendly error feedback
   */
  private showUserFeedback(errorInfo: ErrorInfo, recovered: boolean): void {
    if (recovered) {
      toast({
        title: "Issue Resolved",
        description: "The problem has been automatically resolved. Please try again.",
      });
      return;
    }

    // Show context-specific error messages
    switch (errorInfo.context) {
      case 'Authentication':
        toast({
          title: "Authentication Error",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
        break;
      case 'API':
        toast({
          title: "Service Error",
          description: "We're experiencing technical difficulties. Please try again later.",
          variant: "destructive",
        });
        break;
      case 'Network':
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        break;
      default:
        toast({
          title: "Something went wrong",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
    }
  }

  /**
   * Log errors with structured information
   */
  private logError(errorInfo: ErrorInfo): void {
    const logData = {
      ...errorInfo,
      timestamp: errorInfo.timestamp.toISOString(),
    };

    if (errorInfo.status && errorInfo.status >= 500) {
      console.error('🚨 Server Error:', logData);
    } else if (errorInfo.status && errorInfo.status >= 400) {
      console.warn('⚠️ Client Error:', logData);
    } else {
      console.error('❌ Application Error:', logData);
    }
  }

  /**
   * Track errors for analytics
   */
  private trackError(errorInfo: ErrorInfo): void {
    // You can implement error tracking to your analytics service here
    if (import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true') {
      try {
        // Example: Send to analytics service
        console.log('Error tracked:', errorInfo);
      } catch (trackingError) {
        console.warn('Failed to track error:', trackingError);
      }
    }
  }

  /**
   * Rate limiting for error handling
   */
  private shouldThrottleErrors(): boolean {
    const now = Date.now();
    if (now - this.lastErrorTime > this.errorCooldownMs) {
      this.errorCount = 0;
      return false;
    }
    return this.errorCount > this.maxErrorsPerMinute;
  }

  /**
   * Reset error count (useful for testing)
   */
  resetErrorCount(): void {
    this.errorCount = 0;
    this.lastErrorTime = 0;
  }

  /**
   * Get current error statistics
   */
  getErrorStats(): { count: number; lastErrorTime: number } {
    return {
      count: this.errorCount,
      lastErrorTime: this.lastErrorTime,
    };
  }
}

// Export singleton instance
export const errorHandlingService = ErrorHandlingService.getInstance();

// Export convenience functions
export const handleError = (error: unknown, options?: ErrorHandlingOptions) =>
  errorHandlingService.handleError(error, options);

export const handleAuthError = (error: unknown, context?: string) =>
  errorHandlingService.handleAuthError(error, context);

export const handleApiError = (error: unknown, context?: string) =>
  errorHandlingService.handleApiError(error, context);
