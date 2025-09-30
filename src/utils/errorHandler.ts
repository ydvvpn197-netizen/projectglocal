// Comprehensive error handling utilities
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  userId?: string;
  context?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle different types of errors
  handleError(error: Error | AppError, context?: string): AppError {
    const appError: AppError = {
      code: 'error' in error ? error.code || 'UNKNOWN_ERROR' : 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: 'details' in error ? error.details : undefined,
      timestamp: new Date().toISOString(),
      context: context || 'Unknown context'
    };

    // Log error
    this.logError(appError);

    // Handle different error types
    if (error instanceof TypeError) {
      return this.handleTypeError(error, context);
    } else if (error instanceof ReferenceError) {
      return this.handleReferenceError(error, context);
    } else if (error instanceof SyntaxError) {
      return this.handleSyntaxError(error, context);
    } else if (error instanceof RangeError) {
      return this.handleRangeError(error, context);
    } else if (error instanceof EvalError) {
      return this.handleEvalError(error, context);
    } else if (error instanceof URIError) {
      return this.handleURIError(error, context);
    } else if (error instanceof Error) {
      return this.handleGenericError(error, context);
    }

    return appError;
  }

  // Handle API errors
  handleApiError(error: Error | unknown, endpoint: string): AppError {
    const appError: AppError = {
      code: error.code || 'API_ERROR',
      message: error.message || 'API request failed',
      details: {
        endpoint,
        status: error.status,
        response: error.response
      },
      timestamp: new Date().toISOString(),
      context: `API: ${endpoint}`
    };

    this.logError(appError);
    return appError;
  }

  // Handle authentication errors
  handleAuthError(error: Error | unknown, action: string): AppError {
    const appError: AppError = {
      code: 'AUTH_ERROR',
      message: error.message || 'Authentication failed',
      details: {
        action,
        error: error.error
      },
      timestamp: new Date().toISOString(),
      context: `Auth: ${action}`
    };

    this.logError(appError);
    return appError;
  }

  // Handle database errors
  handleDatabaseError(error: Error | unknown, operation: string): AppError {
    const appError: AppError = {
      code: 'DATABASE_ERROR',
      message: error.message || 'Database operation failed',
      details: {
        operation,
        code: error.code,
        hint: error.hint
      },
      timestamp: new Date().toISOString(),
      context: `Database: ${operation}`
    };

    this.logError(appError);
    return appError;
  }

  // Handle validation errors
  handleValidationError(error: Error | unknown, field: string): AppError {
    const appError: AppError = {
      code: 'VALIDATION_ERROR',
      message: error.message || 'Validation failed',
      details: {
        field,
        value: error.value,
        constraint: error.constraint
      },
      timestamp: new Date().toISOString(),
      context: `Validation: ${field}`
    };

    this.logError(appError);
    return appError;
  }

  // Handle network errors
  handleNetworkError(error: Error | unknown, url: string): AppError {
    const appError: AppError = {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network request failed',
      details: {
        url,
        status: error.status,
        statusText: error.statusText
      },
      timestamp: new Date().toISOString(),
      context: `Network: ${url}`
    };

    this.logError(appError);
    return appError;
  }

  // Private error handlers
  private handleTypeError(error: TypeError, context?: string): AppError {
    return {
      code: 'TYPE_ERROR',
      message: `Type error: ${error.message}`,
      details: { stack: error.stack },
      timestamp: new Date().toISOString(),
      context: context || 'TypeError'
    };
  }

  private handleReferenceError(error: ReferenceError, context?: string): AppError {
    return {
      code: 'REFERENCE_ERROR',
      message: `Reference error: ${error.message}`,
      details: { stack: error.stack },
      timestamp: new Date().toISOString(),
      context: context || 'ReferenceError'
    };
  }

  private handleSyntaxError(error: SyntaxError, context?: string): AppError {
    return {
      code: 'SYNTAX_ERROR',
      message: `Syntax error: ${error.message}`,
      details: { stack: error.stack },
      timestamp: new Date().toISOString(),
      context: context || 'SyntaxError'
    };
  }

  private handleRangeError(error: RangeError, context?: string): AppError {
    return {
      code: 'RANGE_ERROR',
      message: `Range error: ${error.message}`,
      details: { stack: error.stack },
      timestamp: new Date().toISOString(),
      context: context || 'RangeError'
    };
  }

  private handleEvalError(error: EvalError, context?: string): AppError {
    return {
      code: 'EVAL_ERROR',
      message: `Eval error: ${error.message}`,
      details: { stack: error.stack },
      timestamp: new Date().toISOString(),
      context: context || 'EvalError'
    };
  }

  private handleURIError(error: URIError, context?: string): AppError {
    return {
      code: 'URI_ERROR',
      message: `URI error: ${error.message}`,
      details: { stack: error.stack },
      timestamp: new Date().toISOString(),
      context: context || 'URIError'
    };
  }

  private handleGenericError(error: Error, context?: string): AppError {
    return {
      code: 'GENERIC_ERROR',
      message: error.message || 'An error occurred',
      details: { stack: error.stack },
      timestamp: new Date().toISOString(),
      context: context || 'GenericError'
    };
  }

  // Log error
  private logError(error: AppError): void {
    this.errorLog.push(error);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', error);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement error logging service
      console.error('Production error:', error);
    }
  }

  // Get error log
  getErrorLog(): AppError[] {
    return this.errorLog;
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Get error statistics
  getErrorStats(): { total: number; byCode: Record<string, number>; byContext: Record<string, number> } {
    const stats = {
      total: this.errorLog.length,
      byCode: {} as Record<string, number>,
      byContext: {} as Record<string, number>
    };

    this.errorLog.forEach(error => {
      stats.byCode[error.code] = (stats.byCode[error.code] || 0) + 1;
      stats.byContext[error.context || 'Unknown'] = (stats.byContext[error.context || 'Unknown'] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions
export const handleError = (error: Error | AppError, context?: string): AppError => {
  return errorHandler.handleError(error, context);
};

export const handleApiError = (error: Error | unknown, endpoint: string): AppError => {
  return errorHandler.handleApiError(error, endpoint);
};

export const handleAuthError = (error: Error | unknown, action: string): AppError => {
  return errorHandler.handleAuthError(error, action);
};

export const handleDatabaseError = (error: Error | unknown, operation: string): AppError => {
  return errorHandler.handleDatabaseError(error, operation);
};

export const handleValidationError = (error: Error | unknown, field: string): AppError => {
  return errorHandler.handleValidationError(error, field);
};

export const handleNetworkError = (error: Error | unknown, url: string): AppError => {
  return errorHandler.handleNetworkError(error, url);
};
