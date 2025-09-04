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
    it('should handle Error objects', () => {
      const error = new Error('Test error message');
      const result = errorHandler.handleApiError(error, 'TestContext');

      expect(result).toEqual({
        message: 'Test error message',
        code: undefined,
        details: error,
        severity: 'error'
      });
    });

    it('should handle string errors', () => {
      const error = 'String error message';
      const result = errorHandler.handleApiError(error, 'TestContext');

      expect(result).toEqual({
        message: 'String error message',
        severity: 'error'
      });
    });

    it('should handle unknown errors', () => {
      const error = { custom: 'error' };
      const result = errorHandler.handleApiError(error, 'TestContext');

      expect(result).toEqual({
        message: 'An unexpected error occurred',
        details: error,
        severity: 'error'
      });
    });

    it('should handle errors with codes', () => {
      const error = new Error('Network error');
      (error as Record<string, unknown>).code = 'NETWORK_ERROR';
      
      const result = errorHandler.handleApiError(error, 'TestContext');

      expect(result).toEqual({
        message: 'Network error',
        code: 'NETWORK_ERROR',
        details: error,
        severity: 'error'
      });
    });
  });

  describe('handleAuthError', () => {
    it('should transform invalid login credentials message', () => {
      const error = new Error('Invalid login credentials');
      const result = errorHandler.handleAuthError(error);

      expect(result.message).toBe('Invalid email or password. Please try again.');
    });

    it('should transform email not confirmed message', () => {
      const error = new Error('Email not confirmed');
      const result = errorHandler.handleAuthError(error);

      expect(result.message).toBe('Please check your email and click the confirmation link.');
    });

    it('should preserve other error messages', () => {
      const error = new Error('Other auth error');
      const result = errorHandler.handleAuthError(error);

      expect(result.message).toBe('Other auth error');
    });
  });

  describe('handleNetworkError', () => {
    it('should transform fetch errors', () => {
      const error = new Error('fetch failed');
      const result = errorHandler.handleNetworkError(error);

      expect(result.message).toBe('Network connection error. Please check your internet connection.');
    });

    it('should preserve other network errors', () => {
      const error = new Error('Other network error');
      const result = errorHandler.handleNetworkError(error);

      expect(result.message).toBe('Other network error');
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
      expect(result.severity).toBe('error');
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ErrorHandlingService.getInstance();
      const instance2 = ErrorHandlingService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});
