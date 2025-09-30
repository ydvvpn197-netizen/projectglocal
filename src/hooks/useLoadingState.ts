import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  message?: string;
  error?: string;
}

export const useLoadingState = (initialState: Partial<LoadingState> = {}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    ...initialState
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  // Start loading
  const startLoading = useCallback((message?: string) => {
    setLoadingState({
      isLoading: true,
      progress: 0,
      message,
      error: undefined
    });
  }, []);

  // Update progress
  const updateProgress = useCallback((progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || prev.message
    }));
  }, []);

  // Set error
  const setError = useCallback((error: string) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      error
    }));
  }, []);

  // Complete loading
  const completeLoading = useCallback((message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100,
      message: message || prev.message,
      error: undefined
    }));

    // Auto-clear after 2 seconds
    timeoutRef.current = setTimeout(() => {
      setLoadingState({
        isLoading: false,
        progress: 0,
        message: undefined,
        error: undefined
      });
    }, 2000);
  }, []);

  // Reset loading state
  const resetLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      progress: 0,
      message: undefined,
      error: undefined
    });
  }, []);

  // Simulate progress
  const simulateProgress = useCallback((duration: number = 2000, message?: string) => {
    startLoading(message);
    
    const interval = setInterval(() => {
      setLoadingState(prev => {
        const newProgress = prev.progress + (100 / (duration / 100));
        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            ...prev,
            progress: 100,
            isLoading: false
          };
        }
        return {
          ...prev,
          progress: newProgress
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [startLoading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loadingState,
    startLoading,
    updateProgress,
    setError,
    completeLoading,
    resetLoading,
    simulateProgress
  };
};

// Hook for async operations with loading state
export const useAsyncLoading = <T>(
  asyncFn: () => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    loadingMessage?: string;
    successMessage?: string;
  } = {}
) => {
  const { loadingState, startLoading, setError, completeLoading } = useLoadingState();

  const execute = useCallback(async () => {
    try {
      startLoading(options.loadingMessage);
      const result = await asyncFn();
      completeLoading(options.successMessage);
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      options.onError?.(error as Error);
      throw error;
    }
  }, [asyncFn, options, startLoading, setError, completeLoading]);

  return {
    loadingState,
    execute
  };
};

// Hook for multiple async operations
export const useMultipleAsyncLoading = () => {
  const [operations, setOperations] = useState<Record<string, LoadingState>>({});

  const startOperation = useCallback((operationId: string, message?: string) => {
    setOperations(prev => ({
      ...prev,
      [operationId]: {
        isLoading: true,
        progress: 0,
        message,
        error: undefined
      }
    }));
  }, []);

  const updateOperation = useCallback((operationId: string, progress: number, message?: string) => {
    setOperations(prev => ({
      ...prev,
      [operationId]: {
        ...prev[operationId],
        progress: Math.min(100, Math.max(0, progress)),
        message: message || prev[operationId]?.message
      }
    }));
  }, []);

  const completeOperation = useCallback((operationId: string, message?: string) => {
    setOperations(prev => ({
      ...prev,
      [operationId]: {
        ...prev[operationId],
        isLoading: false,
        progress: 100,
        message: message || prev[operationId]?.message,
        error: undefined
      }
    }));
  }, []);

  const setOperationError = useCallback((operationId: string, error: string) => {
    setOperations(prev => ({
      ...prev,
      [operationId]: {
        ...prev[operationId],
        isLoading: false,
        error
      }
    }));
  }, []);

  const resetOperation = useCallback((operationId: string) => {
    setOperations(prev => {
      const newOps = { ...prev };
      delete newOps[operationId];
      return newOps;
    });
  }, []);

  const isAnyLoading = Object.values(operations).some(op => op.isLoading);
  const hasErrors = Object.values(operations).some(op => op.error);

  return {
    operations,
    startOperation,
    updateOperation,
    completeOperation,
    setOperationError,
    resetOperation,
    isAnyLoading,
    hasErrors
  };
};
