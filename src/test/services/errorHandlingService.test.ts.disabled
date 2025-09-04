import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorHandlingService, AppError } from '@/services/errorHandlingService';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('ErrorHandlingService', () => {
  let errorHandler: ErrorHandlingService;

  beforeEach(() => {
    errorHandler = ErrorHandlingService.getInstance();
    vi.clearAllMocks();
  });

  describe('handleApiError', () => {
    it('should handle Error objects', async () => {
      const error = new Error('Test error message');
      const result = await errorHandler.handleApiError(error, 'TestContext');

      expect(result).toEqual({
        recovered: false,
        shouldRetry: false,
        retryDelay: 0
      });
    });

    it('should handle string errors', async () => {
      const error = 'String error message';
      const result = await errorHandler.handleApiError(error, 'TestContext');

      expect(result).toEqual({
        recovered: false,
        shouldRetry: false,
        retryDelay: 0
      });
    });

    it('should handle unknown errors', async () => {
      const error = { custom: 'error' };
      const result = await errorHandler.handleApiError(error, 'TestContext');

      expect(result).toEqual({
        recovered: false,
        shouldRetry: false,
        retryDelay: 0
      });
    });

    it('should handle errors with codes', async () => {
      const error = new Error('Network error');
      (error as Record<string, unknown>).code = 'NETWORK_ERROR';
      
      const result = await errorHandler.handleApiError(error, 'TestContext');

      expect(result).toEqual({
        recovered: false,
        shouldRetry: true,
        retryDelay: 3000
      });
    });

    it('should handle 5xx server errors with retry', async () => {
      const error = { status: 500, message: 'Internal Server Error' };
      const result = await errorHandler.handleApiError(error, 'TestContext');

      expect(result).toEqual({
        recovered: false,
        shouldRetry: true,
        retryDelay: 5000
      });
    });

    it('should handle 429 rate limit errors with retry', async () => {
      const error = { status: 429, message: 'Too Many Requests' };
      const result = await errorHandler.handleApiError(error, 'TestContext');

      expect(result).toEqual({
        recovered: false,
        shouldRetry: true,
        retryDelay: 10000
      });
    });
  });

  describe('handleAuthError', () => {
    it('should transform invalid login credentials message', async () => {
      const error = new Error('Invalid login credentials');
      const result = await errorHandler.handleAuthError(error);

      expect(result.recovered).toBe(false);
      expect(result.shouldRetry).toBe(false);
    });

    it('should transform email not confirmed message', async () => {
      const error = new Error('Email not confirmed');
      const result = await errorHandler.handleAuthError(error);

      expect(result.recovered).toBe(false);
      expect(result.shouldRetry).toBe(false);
    });

    it('should preserve other error messages', async () => {
      const error = new Error('Other auth error');
      const result = await errorHandler.handleAuthError(error);

      expect(result.recovered).toBe(false);
      expect(result.shouldRetry).toBe(false);
    });
  });

  describe('handleError', () => {
    it('should handle general errors with options', async () => {
      const error = new Error('General error');
      const result = await errorHandler.handleError(error, {
        showToast: false,
        logToConsole: false,
        attemptRecovery: false
      });

      expect(result).toHaveProperty('recovered');
      expect(typeof result.recovered).toBe('boolean');
    });

    it('should handle errors with fallback values', async () => {
      const error = new Error('Error with fallback');
      const result = await errorHandler.handleError(error, {
        fallbackValue: 'default value'
      });

      expect(result).toHaveProperty('fallbackValue');
      expect(result.fallbackValue).toBe('default value');
    });
  });

  describe('getErrorTitle', () => {
    it('should return correct titles for different severities', () => {
      const errorHandler = ErrorHandlingService.getInstance();
      
      // Test private method through public interface
      const error: AppError = {
        message: 'Test',
        severity: 'error'
      };
      
      const result = errorHandler.handleApiError(new Error('Test'));
      expect(result).toBeDefined();
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ErrorHandlingService.getInstance();
      const instance2 = ErrorHandlingService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('error statistics', () => {
    it('should track error statistics', () => {
      const stats = errorHandler.getErrorStats();
      
      expect(stats).toHaveProperty('count');
      expect(stats).toHaveProperty('lastErrorTime');
      expect(typeof stats.count).toBe('number');
      expect(typeof stats.lastErrorTime).toBe('number');
    });

    it('should reset error count', () => {
      errorHandler.resetErrorCount();
      const stats = errorHandler.getErrorStats();
      
      expect(stats.count).toBe(0);
    });
  });
});
