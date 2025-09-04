/**
 * Optimized React hooks with proper dependency management
 * Helps avoid unnecessary re-renders and dependency warnings
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// =========================
// Stable Reference Hooks
// =========================

/**
 * Creates a stable reference that never changes
 * Useful for values that should be stable across renders
 */
export function useStableRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/**
 * Creates a stable callback that never changes
 * Useful for functions that should be stable across renders
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
  const ref = useRef(callback);
  ref.current = callback;
  return useCallback((...args: Parameters<T>) => ref.current(...args), []) as T;
}

/**
 * Creates a stable value that only changes when dependencies change
 * Useful for objects/arrays that should be stable across renders
 */
export function useStableValue<T>(value: T, dependencies: React.DependencyList): T {
  return useMemo(() => value, [value]);
}

// =========================
// Effect Optimization Hooks
// =========================

/**
 * Optimized useEffect that handles function dependencies properly
 */
export function useOptimizedEffect(
  effect: () => void | (() => void),
  dependencies: React.DependencyList,
  options?: {
    skipFirstRun?: boolean;
    cleanup?: boolean;
  }
) {
  const { skipFirstRun = false, cleanup = true } = options || {};
  const isFirstRun = useRef(true);
  const cleanupRef = useRef<(() => void) | void>();

  useEffect(() => {
    if (skipFirstRun && isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (cleanup && cleanupRef.current) {
      cleanupRef.current();
    }

    cleanupRef.current = effect();
  }, [skipFirstRun, cleanup, effect]);

  useEffect(() => {
    return () => {
      if (cleanup && cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [cleanup]);
}

/**
 * Optimized useEffect for async operations
 */
export function useAsyncEffect(
  effect: () => Promise<void | (() => void)>,
  dependencies: React.DependencyList,
  options?: {
    skipFirstRun?: boolean;
    cleanup?: boolean;
  }
) {
  const { skipFirstRun = false, cleanup = true } = options || {};
  const isFirstRun = useRef(true);
  const cleanupRef = useRef<(() => void) | void>();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (skipFirstRun && isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const runEffect = async () => {
      if (cleanup && cleanupRef.current) {
        cleanupRef.current();
      }

      try {
        const result = await effect();
        if (isMounted.current && cleanup) {
          cleanupRef.current = result;
        }
      } catch (error) {
        if (isMounted.current) {
          console.error('Error in useAsyncEffect:', error);
        }
      }
    };

    runEffect();
  }, [skipFirstRun, cleanup, effect, isMounted]);

  useEffect(() => {
    return () => {
      if (cleanup && cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [cleanup]);
}

// =========================
// Callback Optimization Hooks
// =========================

/**
 * Creates a callback that only changes when dependencies change
 * Automatically handles function dependencies
 */
export function useOptimizedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return useCallback(callback, [...dependencies, callback]);
}

/**
 * Creates a callback that never changes
 * Useful for functions that should be stable across renders
 */
export function useImmutableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
  return useCallback(callback, [callback]);
}

/**
 * Creates a callback that only changes when the callback function changes
 * Useful for functions passed as props
 */
export function useCallbackStable<T extends (...args: unknown[]) => unknown>(callback: T): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

// =========================
// Memoization Optimization Hooks
// =========================

/**
 * Creates a memoized value that only changes when dependencies change
 * Automatically handles object/array dependencies
 */
export function useOptimizedMemo<T>(
  factory: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(factory, [factory]);
}

/**
 * Creates a memoized value that never changes
 * Useful for values that should be stable across renders
 */
export function useImmutableMemo<T>(factory: () => T): T {
  return useMemo(factory, [factory]);
}

// =========================
// State Optimization Hooks
// =========================

/**
 * Creates a state that only updates when the value actually changes
 * Useful for preventing unnecessary re-renders
 */
export function useStableState<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  
  const setStableValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      return Object.is(prev, next) ? prev : next;
    });
  }, [setValue]);

  return [value, setStableValue] as const;
}

/**
 * Creates a state that only updates when the value actually changes (deep comparison)
 * Useful for objects/arrays
 */
export function useDeepState<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  
  const setDeepValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      
      // Deep comparison for objects and arrays
      if (typeof prev === 'object' && prev !== null && typeof next === 'object' && next !== null) {
        if (Array.isArray(prev) && Array.isArray(next)) {
          if (prev.length !== next.length) return next;
          for (let i = 0; i < prev.length; i++) {
            if (!Object.is(prev[i], next[i])) return next;
          }
          return prev;
        } else {
          const prevKeys = Object.keys(prev);
          const nextKeys = Object.keys(next);
          if (prevKeys.length !== nextKeys.length) return next;
          for (const key of prevKeys) {
            if (!Object.is(prev[key as keyof T], next[key as keyof T])) return next;
          }
          return prev;
        }
      }
      
      return Object.is(prev, next) ? prev : next;
    });
  }, []);

  return [value, setDeepValue] as const;
}

// =========================
// Utility Hooks
// =========================

/**
 * Hook to check if component is mounted
 */
export function useIsMounted() {
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return useCallback(() => isMounted.current, []);
}

/**
 * Hook to get previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

/**
 * Hook to debounce a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Hook to throttle a value
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRun = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= delay) {
        setThrottledValue(value);
        lastRun.current = Date.now();
      }
    }, delay - (Date.now() - lastRun.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return throttledValue;
}

// =========================
// Advanced Pattern Hooks
// =========================

/**
 * Hook for complex state management with actions
 */
export function useComplexState<T, A extends Record<string, (...args: unknown[]) => unknown>>(
  initialState: T,
  actions: A
) {
  const [state, setState] = useState(initialState);
  
  const boundActions = useMemo(() => {
    const bound: Record<string, (...args: unknown[]) => void> = {};
    
    for (const [key, action] of Object.entries(actions)) {
      bound[key] = (...args: unknown[]) => {
        setState(prev => action(prev, ...args));
      };
    }
    
    return bound;
  }, [actions]);
  
  return [state, setState, boundActions] as const;
}

/**
 * Hook for async state management
 */
export function useAsyncState<T>(
  initialState: T,
  asyncAction: (currentState: T, ...args: unknown[]) => Promise<T>
) {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async (...args: unknown[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncAction(state, ...args);
      setState(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncAction, state]);
  
  return [state, setState, execute, loading, error] as const;
}

// =========================
// Export all hooks
// =========================

export {
  useStableRef,
  useStableCallback,
  useStableValue,
  useOptimizedEffect,
  useAsyncEffect,
  useOptimizedCallback,
  useImmutableCallback,
  useCallbackStable,
  useOptimizedMemo,
  useImmutableMemo,
  useStableState,
  useDeepState,
  useIsMounted,
  usePrevious,
  useDebounce,
  useThrottle,
  useComplexState,
  useAsyncState,
};
