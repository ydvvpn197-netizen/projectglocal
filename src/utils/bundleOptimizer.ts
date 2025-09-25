/**
 * Bundle Optimization Utilities
 * 
 * This module provides utilities for optimizing bundle size through
 * dynamic imports, code splitting, and dependency analysis.
 */

// Dynamic import helper with error handling
export const dynamicImport = async <T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T | null> => {
  try {
    const module = await importFn();
    return module;
  } catch (error) {
    console.warn('Dynamic import failed:', error);
    return fallback || null;
  }
};

// Component lazy loading with retry
export const createLazyComponent = <T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3
) => {
  return React.lazy(() => 
    importFn().catch(async (error) => {
      if (retries > 0) {
        console.warn(`Retrying dynamic import (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return createLazyComponent(importFn, retries - 1)();
      }
      throw error;
    })
  );
};

// Bundle analyzer helper
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return null;
  
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const totalSize = scripts.reduce((total, script) => {
    const src = script.getAttribute('src');
    if (src && src.includes('assets')) {
      // Estimate size based on URL patterns
      return total + (src.includes('chunk') ? 50000 : 20000);
    }
    return total;
  }, 0);
  
  return {
    scriptCount: scripts.length,
    estimatedSize: totalSize,
    sizeKB: Math.round(totalSize / 1024),
    sizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100
  };
};

// Dependency optimization
export const optimizeDependencies = {
  // Remove unused imports
  removeUnusedImports: (code: string) => {
    // This would integrate with a tool like ts-unused-exports
    return code;
  },
  
  // Tree shake analysis
  analyzeTreeShaking: () => {
    const modules = Object.keys(require.cache || {});
    return {
      totalModules: modules.length,
      nodeModules: modules.filter(m => m.includes('node_modules')).length,
      localModules: modules.filter(m => !m.includes('node_modules')).length
    };
  }
};

// Image optimization utilities
export const imageOptimizer = {
  // Generate responsive image sizes
  generateResponsiveSizes: (baseSize: number) => {
    return [baseSize, baseSize * 1.5, baseSize * 2, baseSize * 3]
      .map(size => Math.round(size))
      .filter((size, index, arr) => arr.indexOf(size) === index);
  },
  
  // Generate WebP format
  generateWebP: (src: string) => {
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  },
  
  // Lazy loading attributes
  getLazyAttributes: () => ({
    loading: 'lazy' as const,
    decoding: 'async' as const
  })
};

// Code splitting strategies
export const codeSplitting = {
  // Route-based splitting
  routeBased: (route: string) => {
    return import(`@/pages/${route}`);
  },
  
  // Feature-based splitting
  featureBased: (feature: string) => {
    return import(`@/features/${feature}`);
  },
  
  // Component-based splitting
  componentBased: (component: string) => {
    return import(`@/components/${component}`);
  }
};

// Performance monitoring
export const performanceMonitor = {
  // Measure component load time
  measureComponentLoad: (componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`${componentName} loaded in ${end - start}ms`);
    };
  },
  
  // Monitor bundle size
  monitorBundleSize: () => {
    if (typeof window === 'undefined') return;
    
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('chunk') || entry.name.includes('bundle')) {
          console.log(`Bundle loaded: ${entry.name} (${entry.duration}ms)`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
};

// Export optimization helpers
export const bundleOptimizer = {
  dynamicImport,
  createLazyComponent,
  analyzeBundleSize,
  optimizeDependencies,
  imageOptimizer,
  codeSplitting,
  performanceMonitor
};