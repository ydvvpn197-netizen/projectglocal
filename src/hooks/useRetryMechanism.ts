import { useState, useCallback, useRef, useEffect } from 'react';
import { errorHandlingService } from '@/services/errorHandlingService';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
  onSuccess?: (result: any) => void;
  onFailure?: (error: Error, attempts: number) => void;
}

export interface RetryState {
  isRetrying: boolean;
  attempt: number;
  lastError: Error | null;
  nextRetryIn: number;
  canRetry: boolean;
}

export function useRetryMechanism<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    jitter = true,
    onRetry,
    onSuccess,
    onFailure,
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null,
    nextRetryIn: 0,
    canRetry: true,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const operationRef = useRef(operation);

  // Update operation reference when it changes
  useEffect(() => {
    operationRef.current = operation;
  }, [operation]);

  const calculateDelay = useCallback((attempt: number): number => {
    let delay = baseDelay * Math.pow(backoffMultiplier, attempt);
    
    // Apply jitter to prevent thundering herd
    if (jitter) {
      const jitterAmount = delay * 0.1; // 10% jitter
      delay += (Math.random() - 0.5) * 2 * jitterAmount;
    }
    
    return Math.min(delay, maxDelay);
  }, [baseDelay, backoffMultiplier, maxDelay, jitter]);

  const executeOperation = useCallback(async (): Promise<T> => {
    try {
      const result = await operationRef.current();
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      throw errorObj;
    }
  }, [onSuccess]);

  const retry = useCallback(async (): Promise<T> => {
    if (state.attempt >= maxRetries) {
      throw new Error(`Max retries (${maxRetries}) exceeded`);
    }

    setState(prev => ({
      ...prev,
      isRetrying: true,
      attempt: prev.attempt + 1,
    }));

    try {
      const result = await executeOperation();
      
      setState({
        isRetrying: false,
        attempt: 0,
        lastError: null,
        nextRetryIn: 0,
        canRetry: true,
      });

      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        lastError: errorObj,
        canRetry: prev.attempt < maxRetries,
      }));

      onRetry?.(state.attempt + 1, errorObj);

      // If we can retry, schedule the next attempt
      if (state.attempt < maxRetries) {
        const delay = calculateDelay(state.attempt);
        
        setState(prev => ({
          ...prev,
          nextRetryIn: delay,
        }));

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Schedule retry
        timeoutRef.current = setTimeout(async () => {
          try {
            await retry();
          } catch (finalError) {
            onFailure?.(finalError as Error, state.attempt);
            setState(prev => ({
              ...prev,
              isRetrying: false,
              canRetry: false,
            }));
          }
        }, delay);
      } else {
        onFailure?.(errorObj, state.attempt);
        setState(prev => ({
          ...prev,
          isRetrying: false,
          canRetry: false,
        }));
      }

      throw errorObj;
    }
  }, [state.attempt, maxRetries, executeOperation, onRetry, onFailure, calculateDelay]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setState({
      isRetrying: false,
      attempt: 0,
      lastError: null,
      nextRetryIn: 0,
      canRetry: true,
    });
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setState(prev => ({
      ...prev,
      isRetrying: false,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    retry,
    reset,
    cancel,
  };
}

// Specialized retry hook for API calls
export function useApiRetry<T>(
  apiCall: () => Promise<T>,
  options: RetryOptions = {}
) {
  const retryMechanism = useRetryMechanism(apiCall, {
    maxRetries: 3,
    baseDelay: 1000,
    backoffMultiplier: 2,
    jitter: true,
    ...options,
  });

  const executeWithRetry = useCallback(async (): Promise<T> => {
    try {
      return await retryMechanism.retry();
    } catch (error) {
      // Enhanced error handling for API calls
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      // Use the error handling service for API errors
      await errorHandlingService.handleApiError(errorObj, 'API Retry');
      
      throw errorObj;
    }
  }, [retryMechanism]);

  return {
    ...retryMechanism,
    executeWithRetry,
  };
}

// Specialized retry hook for authentication operations
export function useAuthRetry<T>(
  authOperation: () => Promise<T>,
  options: RetryOptions = {}
) {
  const retryMechanism = useRetryMechanism(authOperation, {
    maxRetries: 2, // Fewer retries for auth operations
    baseDelay: 2000, // Longer delay for auth operations
    backoffMultiplier: 2,
    jitter: true,
    ...options,
  });

  const executeWithRetry = useCallback(async (): Promise<T> => {
    try {
      return await retryMechanism.retry();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      // Use the error handling service for auth errors
      await errorHandlingService.handleAuthError(errorObj, 'Auth Retry');
      
      throw errorObj;
    }
  }, [retryMechanism]);

  return {
    ...retryMechanism,
    executeWithRetry,
  };
}

// Specialized retry hook for network operations
export function useNetworkRetry<T>(
  networkOperation: () => Promise<T>,
  options: RetryOptions = {}
) {
  const retryMechanism = useRetryMechanism(networkOperation, {
    maxRetries: 5, // More retries for network operations
    baseDelay: 500, // Shorter initial delay for network operations
    backoffMultiplier: 1.5,
    jitter: true,
    ...options,
  });

  const executeWithRetry = useCallback(async (): Promise<T> => {
    try {
      return await retryMechanism.retry();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      // Use the error handling service for network errors
      await errorHandlingService.handleError(errorObj, {
        showToast: true,
        logToConsole: true,
        attemptRecovery: true,
        context: 'Network Retry',
      });
      
      throw errorObj;
    }
  }, [retryMechanism]);

  return {
    ...retryMechanism,
    executeWithRetry,
  };
}

export default useRetryMechanism;
