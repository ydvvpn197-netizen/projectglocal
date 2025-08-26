import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
}

interface UseIntersectionObserverReturn {
  ref: React.RefObject<Element>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    freezeOnceVisible = false,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<Element>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const callback = useCallback(
    ([entry]: IntersectionObserverEntry[]) => {
      setEntry(entry);
      setIsIntersecting(entry.isIntersecting);

      if (freezeOnceVisible && entry.isIntersecting) {
        observerRef.current?.disconnect();
      }
    },
    [freezeOnceVisible]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(callback, {
      root,
      rootMargin,
      threshold,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, root, rootMargin, threshold]);

  return {
    ref: elementRef as React.RefObject<Element>,
    isIntersecting,
    entry,
  };
}

// Specialized hook for infinite scroll
export function useInfiniteScroll(
  onLoadMore: () => void,
  options: UseIntersectionObserverOptions & {
    enabled?: boolean;
    distance?: string;
  } = {}
) {
  const { enabled = true, distance = '100px', ...observerOptions } = options;
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !enabled) return;
    
    setIsLoading(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoading(false);
    }
  }, [onLoadMore, isLoading, enabled]);

  const { ref, isIntersecting } = useIntersectionObserver({
    ...observerOptions,
    rootMargin: distance,
  });

  useEffect(() => {
    if (isIntersecting && enabled) {
      handleLoadMore();
    }
  }, [isIntersecting, enabled, handleLoadMore]);

  return {
    ref,
    isIntersecting,
    isLoading,
  };
}

// Hook for lazy loading images
export function useLazyImage(
  src: string,
  options: UseIntersectionObserverOptions = {}
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { ref, isIntersecting } = useIntersectionObserver({
    ...options,
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (isIntersecting && !isInView) {
      setIsInView(true);
    }
  }, [isIntersecting, isInView]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = (e) => setError(new Error('Failed to load image'));
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isInView]);

  return {
    ref,
    isLoaded,
    isInView,
    error,
  };
}

// Hook for visibility tracking
export function useVisibility(
  options: UseIntersectionObserverOptions = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const [visibilityRatio, setVisibilityRatio] = useState(0);

  const { ref, entry } = useIntersectionObserver({
    ...options,
    threshold: Array.from({ length: 10 }, (_, i) => i / 10), // 0, 0.1, 0.2, ..., 1
  });

  useEffect(() => {
    if (entry) {
      setIsVisible(entry.isIntersecting);
      setVisibilityRatio(entry.intersectionRatio);
    }
  }, [entry]);

  return {
    ref,
    isVisible,
    visibilityRatio,
    entry,
  };
}
