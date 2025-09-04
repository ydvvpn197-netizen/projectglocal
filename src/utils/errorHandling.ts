/**
 * Comprehensive error handling utilities for consistent error management
 * across the application
 */

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  isOperational?: boolean;
  context?: Record<string, unknown>;
  timestamp: Date;
}

export interface ErrorContext {
  userId?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode?: number;
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Custom error class for application-specific errors
 */
export class ApplicationError extends Error implements AppError {
  public code: string;
  public statusCode: number;
  public isOperational: boolean;
  public context?: Record<string, unknown>;
  public timestamp: Date;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.context = context;
    this.timestamp = new Date();
  }
}

/**
 * Error codes for different types of errors
 */
export const ErrorCodes = {
  // Authentication errors
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',

  // API errors
  API_ERROR: 'API_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',

  // Business logic errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',

  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

/**
 * HTTP status codes mapping
 */
export const StatusCodes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

/**
 * Creates a standardized application error
 */
export function createAppError(
  message: string,
  code: keyof typeof ErrorCodes = 'UNKNOWN_ERROR',
  statusCode?: number,
  context?: ErrorContext
): ApplicationError {
  const status = statusCode || getDefaultStatusCode(code);
  return new ApplicationError(message, code, status, context);
}

/**
 * Gets the default status code for an error code
 */
function getDefaultStatusCode(code: keyof typeof ErrorCodes): number {
  const statusCodeMap: Record<keyof typeof ErrorCodes, number> = {
    AUTHENTICATION_FAILED: StatusCodes.UNAUTHORIZED,
    UNAUTHORIZED: StatusCodes.UNAUTHORIZED,
    INVALID_CREDENTIALS: StatusCodes.UNAUTHORIZED,
    TOKEN_EXPIRED: StatusCodes.UNAUTHORIZED,
    INSUFFICIENT_PERMISSIONS: StatusCodes.FORBIDDEN,
    VALIDATION_ERROR: StatusCodes.BAD_REQUEST,
    INVALID_INPUT: StatusCodes.BAD_REQUEST,
    MISSING_REQUIRED_FIELD: StatusCodes.BAD_REQUEST,
    INVALID_FORMAT: StatusCodes.BAD_REQUEST,
    DATABASE_ERROR: StatusCodes.INTERNAL_SERVER_ERROR,
    RECORD_NOT_FOUND: StatusCodes.NOT_FOUND,
    DUPLICATE_RECORD: StatusCodes.CONFLICT,
    CONSTRAINT_VIOLATION: StatusCodes.UNPROCESSABLE_ENTITY,
    API_ERROR: StatusCodes.INTERNAL_SERVER_ERROR,
    RATE_LIMIT_EXCEEDED: StatusCodes.TOO_MANY_REQUESTS,
    SERVICE_UNAVAILABLE: StatusCodes.SERVICE_UNAVAILABLE,
    TIMEOUT_ERROR: StatusCodes.REQUEST_TIMEOUT,
    NETWORK_ERROR: StatusCodes.INTERNAL_SERVER_ERROR,
    CONNECTION_FAILED: StatusCodes.INTERNAL_SERVER_ERROR,
    REQUEST_TIMEOUT: StatusCodes.REQUEST_TIMEOUT,
    BUSINESS_RULE_VIOLATION: StatusCodes.UNPROCESSABLE_ENTITY,
    INSUFFICIENT_BALANCE: StatusCodes.UNPROCESSABLE_ENTITY,
    OPERATION_NOT_ALLOWED: StatusCodes.FORBIDDEN,
    INTERNAL_ERROR: StatusCodes.INTERNAL_SERVER_ERROR,
    CONFIGURATION_ERROR: StatusCodes.INTERNAL_SERVER_ERROR,
    UNKNOWN_ERROR: StatusCodes.INTERNAL_SERVER_ERROR
  };

  return statusCodeMap[code] || StatusCodes.INTERNAL_SERVER_ERROR;
}

/**
 * Handles unknown errors and converts them to ApplicationError
 */
export function handleUnknownError(error: unknown, context?: ErrorContext): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApplicationError(
      error.message,
      'UNKNOWN_ERROR',
      StatusCodes.INTERNAL_SERVER_ERROR,
      context
    );
  }

  if (typeof error === 'string') {
    return new ApplicationError(
      error,
      'UNKNOWN_ERROR',
      StatusCodes.INTERNAL_SERVER_ERROR,
      context
    );
  }

  return new ApplicationError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    StatusCodes.INTERNAL_SERVER_ERROR,
    context
  );
}

/**
 * Formats error for API response
 */
export function formatErrorResponse(error: AppError, requestId?: string): ErrorResponse {
  return {
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp: error.timestamp.toISOString(),
      requestId
    }
  };
}

/**
 * Logs error with structured information
 */
export function logError(error: AppError, context?: ErrorContext): void {
  const errorLog = {
    timestamp: error.timestamp.toISOString(),
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack
    },
    context: {
      ...error.context,
      ...context
    }
  };

  // In production, this would send to a logging service
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', errorLog);
  } else {
    // Production logging (e.g., Sentry, LogRocket, etc.)
    console.error('Application Error:', errorLog);
  }
}

/**
 * Error boundary error handler
 */
export function handleErrorBoundaryError(error: Error, errorInfo: React.ErrorInfo): void {
  const appError = handleUnknownError(error, {
    action: 'React Error Boundary',
    resource: 'Component',
    metadata: {
      componentStack: errorInfo.componentStack
    }
  });

  logError(appError);
}

/**
 * Async error wrapper for better error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const appError = handleUnknownError(error, context);
    logError(appError);
    throw appError;
  }
}

/**
 * Error handler for React hooks
 */
export function useErrorHandler() {
  const handleError = (error: unknown, context?: ErrorContext): void => {
    const appError = handleUnknownError(error, context);
    logError(appError);
    
    // You can add additional error handling logic here
    // such as showing toast notifications, updating error state, etc.
  };

  return { handleError };
}

/**
 * Validation error helper
 */
export function createValidationError(
  field: string,
  message: string,
  context?: ErrorContext
): ApplicationError {
  return createAppError(
    `Validation error for field '${field}': ${message}`,
    'VALIDATION_ERROR',
    StatusCodes.BAD_REQUEST,
    {
      ...context,
      metadata: {
        field,
        validationMessage: message
      }
    }
  );
}

/**
 * Database error helper
 */
export function createDatabaseError(
  operation: string,
  originalError: unknown,
  context?: ErrorContext
): ApplicationError {
  const message = `Database operation '${operation}' failed`;
  return createAppError(
    message,
    'DATABASE_ERROR',
    StatusCodes.INTERNAL_SERVER_ERROR,
    {
      ...context,
      action: operation,
      metadata: {
        originalError: originalError instanceof Error ? originalError.message : String(originalError)
      }
    }
  );
}

/**
 * API error helper
 */
export function createApiError(
  endpoint: string,
  statusCode: number,
  message?: string,
  context?: ErrorContext
): ApplicationError {
  const errorMessage = message || `API request to '${endpoint}' failed`;
  return createAppError(
    errorMessage,
    'API_ERROR',
    statusCode,
    {
      ...context,
      action: 'API Request',
      resource: endpoint
    }
  );
}
