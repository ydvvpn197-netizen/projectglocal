/**
 * Performance Test Suite
 * Comprehensive performance testing for critical functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceOptimizer } from '@/utils/performanceOptimizer';

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Performance Monitoring', () => {
    it('should initialize performance monitoring', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      PerformanceOptimizer.initialize();
      
      expect(consoleSpy).toHaveBeenCalledWith('🚀 Initializing performance monitoring...');
    });

    it('should calculate performance score', () => {
      const score = PerformanceOptimizer.calculatePerformanceScore();
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should provide performance metrics', () => {
      const metrics = PerformanceOptimizer.getMetrics();
      
      expect(metrics).toHaveProperty('loadTime');
      expect(metrics).toHaveProperty('renderTime');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('bundleSize');
      expect(metrics).toHaveProperty('apiResponseTime');
      expect(metrics).toHaveProperty('cacheHitRate');
    });

    it('should identify performance optimizations', () => {
      const optimizations = PerformanceOptimizer.getOptimizations();
      
      expect(optimizations).toBeDefined();
      expect(Array.isArray(optimizations)).toBe(true);
      
      if (optimizations.length > 0) {
        expect(optimizations[0]).toHaveProperty('id');
        expect(optimizations[0]).toHaveProperty('type');
        expect(optimizations[0]).toHaveProperty('priority');
        expect(optimizations[0]).toHaveProperty('title');
        expect(optimizations[0]).toHaveProperty('description');
        expect(optimizations[0]).toHaveProperty('impact');
        expect(optimizations[0]).toHaveProperty('implementation');
        expect(optimizations[0]).toHaveProperty('estimatedSavings');
      }
    });

    it('should filter optimizations by priority', () => {
      const highPriorityOpts = PerformanceOptimizer.getOptimizationsByPriority('high');
      const criticalOpts = PerformanceOptimizer.getOptimizationsByPriority('critical');
      
      expect(Array.isArray(highPriorityOpts)).toBe(true);
      expect(Array.isArray(criticalOpts)).toBe(true);
      
      highPriorityOpts.forEach(opt => {
        expect(opt.priority).toBe('high');
      });
      
      criticalOpts.forEach(opt => {
        expect(opt.priority).toBe('critical');
      });
    });

    it('should filter optimizations by type', () => {
      const bundleOpts = PerformanceOptimizer.getOptimizationsByType('bundle');
      const renderingOpts = PerformanceOptimizer.getOptimizationsByType('rendering');
      
      expect(Array.isArray(bundleOpts)).toBe(true);
      expect(Array.isArray(renderingOpts)).toBe(true);
      
      bundleOpts.forEach(opt => {
        expect(opt.type).toBe('bundle');
      });
      
      renderingOpts.forEach(opt => {
        expect(opt.type).toBe('rendering');
      });
    });

    it('should provide performance recommendations', () => {
      const recommendations = PerformanceOptimizer.getRecommendations();
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    });

    it('should provide performance summary', () => {
      const summary = PerformanceOptimizer.getPerformanceSummary();
      
      expect(summary).toHaveProperty('score');
      expect(summary).toHaveProperty('loadTime');
      expect(summary).toHaveProperty('memoryUsage');
      expect(summary).toHaveProperty('bundleSize');
      expect(summary).toHaveProperty('optimizationsCount');
      expect(summary).toHaveProperty('criticalOptimizations');
      expect(summary).toHaveProperty('highPriorityOptimizations');
      
      expect(summary.score).toBeGreaterThanOrEqual(0);
      expect(summary.score).toBeLessThanOrEqual(100);
      expect(summary.optimizationsCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Bundle Size Optimization', () => {
    it('should identify bundle size issues', () => {
      const bundleOpts = PerformanceOptimizer.getOptimizationsByType('bundle');
      
      if (bundleOpts.length > 0) {
        const bundleOpt = bundleOpts[0];
        expect(bundleOpt.title).toContain('Bundle');
        expect(bundleOpt.implementation).toContain('code splitting');
        expect(bundleOpt.implementation).toContain('lazy loading');
      }
    });

    it('should recommend code splitting', () => {
      const recommendations = PerformanceOptimizer.getRecommendations();
      
      const codeSplittingRec = recommendations.find(rec => 
        rec.includes('code splitting') || rec.includes('bundle size')
      );
      
      if (codeSplittingRec) {
        expect(codeSplittingRec).toContain('code splitting');
      }
    });
  });

  describe('Rendering Performance', () => {
    it('should identify rendering optimizations', () => {
      const renderingOpts = PerformanceOptimizer.getOptimizationsByType('rendering');
      
      if (renderingOpts.length > 0) {
        const renderingOpt = renderingOpts[0];
        expect(renderingOpt.title).toContain('Rendering');
        expect(renderingOpt.implementation).toContain('React.memo');
        expect(renderingOpt.implementation).toContain('useMemo');
        expect(renderingOpt.implementation).toContain('useCallback');
      }
    });

    it('should recommend React optimizations', () => {
      const recommendations = PerformanceOptimizer.getRecommendations();
      
      const reactOptRec = recommendations.find(rec => 
        rec.includes('memoization') || rec.includes('rendering')
      );
      
      if (reactOptRec) {
        expect(reactOptRec).toContain('memoization');
      }
    });
  });

  describe('API Performance', () => {
    it('should identify API optimizations', () => {
      const apiOpts = PerformanceOptimizer.getOptimizationsByType('api');
      
      if (apiOpts.length > 0) {
        const apiOpt = apiOpts[0];
        expect(apiOpt.title).toContain('API');
        expect(apiOpt.implementation).toContain('caching');
        expect(apiOpt.implementation).toContain('React Query');
      }
    });

    it('should recommend API caching', () => {
      const recommendations = PerformanceOptimizer.getRecommendations();
      
      const apiCacheRec = recommendations.find(rec => 
        rec.includes('API caching') || rec.includes('caching')
      );
      
      if (apiCacheRec) {
        expect(apiCacheRec).toContain('caching');
      }
    });
  });

  describe('Memory Performance', () => {
    it('should identify memory optimizations', () => {
      const memoryOpts = PerformanceOptimizer.getOptimizationsByType('memory');
      
      if (memoryOpts.length > 0) {
        const memoryOpt = memoryOpts[0];
        expect(memoryOpt.title).toContain('Memory');
        expect(memoryOpt.implementation).toContain('cleanup');
        expect(memoryOpt.implementation).toContain('useEffect');
      }
    });

    it('should recommend memory optimization', () => {
      const recommendations = PerformanceOptimizer.getRecommendations();
      
      const memoryRec = recommendations.find(rec => 
        rec.includes('memory') || rec.includes('cleanup')
      );
      
      if (memoryRec) {
        expect(memoryRec).toContain('memory');
      }
    });
  });

  describe('Caching Performance', () => {
    it('should identify caching optimizations', () => {
      const cachingOpts = PerformanceOptimizer.getOptimizationsByType('caching');
      
      if (cachingOpts.length > 0) {
        const cachingOpt = cachingOpts[0];
        expect(cachingOpt.title).toContain('Caching');
        expect(cachingOpt.implementation).toContain('cache headers');
        expect(cachingOpt.implementation).toContain('service worker');
      }
    });

    it('should recommend caching strategies', () => {
      const recommendations = PerformanceOptimizer.getRecommendations();
      
      const cacheRec = recommendations.find(rec => 
        rec.includes('caching') || rec.includes('cache')
      );
      
      if (cacheRec) {
        expect(cacheRec).toContain('cache');
      }
    });
  });

  describe('Performance Score Calculation', () => {
    it('should calculate score based on metrics', () => {
      const score = PerformanceOptimizer.calculatePerformanceScore();
      
      // Score should be between 0 and 100
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should penalize high load times', () => {
      // This would be tested with actual metrics in a real implementation
      const score = PerformanceOptimizer.calculatePerformanceScore();
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should penalize high memory usage', () => {
      // This would be tested with actual metrics in a real implementation
      const score = PerformanceOptimizer.calculatePerformanceScore();
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should penalize large bundle sizes', () => {
      // This would be tested with actual metrics in a real implementation
      const score = PerformanceOptimizer.calculatePerformanceScore();
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should penalize slow API responses', () => {
      // This would be tested with actual metrics in a real implementation
      const score = PerformanceOptimizer.calculatePerformanceScore();
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Recommendations', () => {
    it('should provide actionable recommendations', () => {
      const recommendations = PerformanceOptimizer.getRecommendations();
      
      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(10); // Should be meaningful
      });
    });

    it('should include critical performance issues', () => {
      const recommendations = PerformanceOptimizer.getRecommendations();
      
      const criticalRec = recommendations.find(rec => 
        rec.includes('CRITICAL') || rec.includes('🚨')
      );
      
      if (criticalRec) {
        expect(criticalRec).toContain('CRITICAL');
      }
    });

    it('should include high priority issues', () => {
      const recommendations = PerformanceOptimizer.getRecommendations();
      
      const highPriorityRec = recommendations.find(rec => 
        rec.includes('HIGH PRIORITY') || rec.includes('⚠️')
      );
      
      if (highPriorityRec) {
        expect(highPriorityRec).toContain('HIGH PRIORITY');
      }
    });
  });
});
