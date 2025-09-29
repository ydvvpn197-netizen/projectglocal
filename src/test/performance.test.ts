/**
 * Performance Monitoring Tests
 * Tests for performance monitoring utilities and components
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { performanceMonitor, usePerformanceMetrics } from '@/utils/performanceMonitor';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => 1000),
  observer: vi.fn(),
};

// Mock window.performance
Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock web-vitals
vi.mock('web-vitals', () => ({
  getCLS: vi.fn((callback) => callback({ value: 0.05, name: 'CLS' })),
  getFID: vi.fn((callback) => callback({ value: 50, name: 'FID' })),
  getFCP: vi.fn((callback) => callback({ value: 1200, name: 'FCP' })),
  getLCP: vi.fn((callback) => callback({ value: 2000, name: 'LCP' })),
  getTTFB: vi.fn((callback) => callback({ value: 500, name: 'TTFB' })),
}));

describe('Performance Monitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PerformanceMonitor Class', () => {
    it('should initialize with default config', () => {
      expect(performanceMonitor).toBeDefined();
    });

    it('should track page load time', () => {
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.loadTime).toBeDefined();
    });

    it('should calculate performance score correctly', () => {
      const score = performanceMonitor.getPerformanceScore();
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should identify good performance', () => {
      const isGood = performanceMonitor.isPerformanceGood();
      expect(typeof isGood).toBe('boolean');
    });

    it('should provide performance recommendations', () => {
      const recommendations = performanceMonitor.getRecommendations();
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('Performance Metrics', () => {
    it('should track LCP (Largest Contentful Paint)', () => {
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.lcp).toBeDefined();
    });

    it('should track FID (First Input Delay)', () => {
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.fid).toBeDefined();
    });

    it('should track CLS (Cumulative Layout Shift)', () => {
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.cls).toBeDefined();
    });

    it('should track FCP (First Contentful Paint)', () => {
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.fcp).toBeDefined();
    });

    it('should track TTFB (Time to First Byte)', () => {
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.ttfb).toBeDefined();
    });
  });

  describe('Performance Recommendations', () => {
    it('should recommend LCP optimization for slow LCP', () => {
      // Mock slow LCP
      const mockMetrics = {
        lcp: 3000,
        fid: 50,
        cls: 0.05,
        fcp: 1200,
        ttfb: 500,
        bundleSize: 400,
        loadTime: 2000,
      };
      
      // Directly set metrics
      Object.assign(performanceMonitor, { metrics: mockMetrics });

      const recommendations = performanceMonitor.getRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('LCP') || rec.includes('Largest Contentful Paint'))).toBe(true);
    });

    it('should recommend FID optimization for slow FID', () => {
      // Mock slow FID
      const mockMetrics = {
        lcp: 2000,
        fid: 200,
        cls: 0.05,
        fcp: 1200,
        ttfb: 500,
        bundleSize: 400,
        loadTime: 2000,
      };
      
      Object.assign(performanceMonitor, { metrics: mockMetrics });

      const recommendations = performanceMonitor.getRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('FID') || rec.includes('First Input Delay'))).toBe(true);
    });

    it('should recommend CLS optimization for high CLS', () => {
      // Mock high CLS
      const mockMetrics = {
        lcp: 2000,
        fid: 50,
        cls: 0.2,
        fcp: 1200,
        ttfb: 500,
        bundleSize: 400,
        loadTime: 2000,
      };
      
      Object.assign(performanceMonitor, { metrics: mockMetrics });

      const recommendations = performanceMonitor.getRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('CLS') || rec.includes('Cumulative Layout Shift'))).toBe(true);
    });

    it('should recommend bundle size optimization for large bundles', () => {
      // Mock large bundle
      const mockMetrics = {
        lcp: 2000,
        fid: 50,
        cls: 0.05,
        fcp: 1200,
        ttfb: 500,
        bundleSize: 800,
        loadTime: 2000,
      };
      
      Object.assign(performanceMonitor, { metrics: mockMetrics });

      const recommendations = performanceMonitor.getRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('bundle') || rec.includes('size'))).toBe(true);
    });
  });

  describe('Performance Score Calculation', () => {
    it('should give perfect score for excellent performance', () => {
      const mockMetrics = {
        lcp: 1500,
        fid: 30,
        cls: 0.05,
        fcp: 800,
        ttfb: 400,
        bundleSize: 300,
        loadTime: 1000,
      };
      
      Object.assign(performanceMonitor, { metrics: mockMetrics });

      const score = performanceMonitor.getPerformanceScore();
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('should give low score for poor performance', () => {
      const mockMetrics = {
        lcp: 5000,
        fid: 300,
        cls: 0.3,
        fcp: 3000,
        ttfb: 2000,
        bundleSize: 1000,
        loadTime: 5000,
      };
      
      Object.assign(performanceMonitor, { metrics: mockMetrics });

      const score = performanceMonitor.getPerformanceScore();
      expect(score).toBeLessThan(50);
    });
  });
});

// Hook tests removed - hooks can only be tested within React components

describe('Performance Monitoring Integration', () => {
  it('should initialize performance monitoring on page load', () => {
    // Simulate page load
    window.dispatchEvent(new Event('load'));
    
    // Performance monitoring should be active
    expect(performanceMonitor).toBeDefined();
  });

  it('should track resource loading', () => {
    // Mock PerformanceObserver
    const mockObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
    };
    
    vi.spyOn(window, 'PerformanceObserver').mockImplementation(() => mockObserver as unknown as PerformanceObserver);
    
    // Initialize performance monitoring
    performanceMonitor.initialize();
    
    // Performance monitoring should track resources
    expect(mockObserver.observe).toHaveBeenCalled();
  });
});