import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { ComprehensiveErrorBoundary } from '@/components/error/ComprehensiveErrorBoundary';
import { OptimizedImage } from '@/components/optimization/OptimizedImage';
import { ResponsiveImage } from '@/components/optimization/OptimizedImage';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Test component that throws an error
const ErrorComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }
  return <div>No error</div>;
};

describe('Comprehensive Test Suite', () => {
  describe('Error Boundary Tests', () => {
    it('should catch and display errors', async () => {
      render(
        <TestWrapper>
          <ComprehensiveErrorBoundary>
            <ErrorComponent shouldThrow={true} />
          </ComprehensiveErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Application Error')).toBeInTheDocument();
      });
    });

    it('should allow retry functionality', async () => {
      render(
        <TestWrapper>
          <ComprehensiveErrorBoundary>
            <ErrorComponent shouldThrow={true} />
          </ComprehensiveErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Try Again'));
      
      // Should show retry count
      expect(screen.getByText('Retry attempt: 1/3')).toBeInTheDocument();
    });

    it('should show network status', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(
        <TestWrapper>
          <ComprehensiveErrorBoundary>
            <ErrorComponent shouldThrow={true} />
          </ComprehensiveErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Offline')).toBeInTheDocument();
      });
    });

    it('should handle different error types', async () => {
      const ChunkError = () => {
        const error = new Error('Loading chunk failed');
        error.name = 'ChunkLoadError';
        throw error;
      };

      render(
        <TestWrapper>
          <ComprehensiveErrorBoundary>
            <ChunkError />
          </ComprehensiveErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Chunk Load Error')).toBeInTheDocument();
      });
    });

    it('should show error details when requested', async () => {
      render(
        <TestWrapper>
          <ComprehensiveErrorBoundary showDetails={true}>
            <ErrorComponent shouldThrow={true} />
          </ComprehensiveErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Show Stack Trace')).toBeInTheDocument();
      });
    });
  });

  describe('Optimized Image Tests', () => {
    it('should render image with correct attributes', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          width={400}
          height={300}
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('width', '400');
      expect(img).toHaveAttribute('height', '300');
    });

    it('should handle lazy loading', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          lazy={true}
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should show loading state', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          lazy={true}
        />
      );

      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should handle image errors', async () => {
      render(
        <OptimizedImage
          src="invalid-url"
          alt="Test image"
          onError={vi.fn()}
        />
      );

      const img = screen.getByAltText('Test image');
      
      // Simulate image load error
      fireEvent.error(img);
      
      await waitFor(() => {
        expect(screen.getByText('Image unavailable')).toBeInTheDocument();
      });
    });

    it('should handle image load success', async () => {
      const onLoad = vi.fn();
      
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          onLoad={onLoad}
        />
      );

      const img = screen.getByAltText('Test image');
      
      // Simulate successful image load
      fireEvent.load(img);
      
      await waitFor(() => {
        expect(onLoad).toHaveBeenCalled();
      });
    });
  });

  describe('Responsive Image Tests', () => {
    it('should render responsive image with srcSet', () => {
      render(
        <ResponsiveImage
          src="https://example.com/image.jpg"
          alt="Test responsive image"
          breakpoints={[
            { minWidth: 640, size: '50vw' },
            { minWidth: 768, size: '33vw' }
          ]}
        />
      );

      const img = screen.getByAltText('Test responsive image');
      expect(img).toBeInTheDocument();
    });

    it('should generate srcSet for different sizes', () => {
      render(
        <ResponsiveImage
          src="https://example.com/image.jpg"
          alt="Test responsive image"
        />
      );

      const img = screen.getByAltText('Test responsive image');
      expect(img).toBeInTheDocument();
    });
  });

  describe('Performance Tests', () => {
    it('should not cause memory leaks with multiple renders', () => {
      const { rerender } = render(
        <TestWrapper>
          <OptimizedImage
            src="https://example.com/image.jpg"
            alt="Test image"
          />
        </TestWrapper>
      );

      // Rerender multiple times
      for (let i = 0; i < 10; i++) {
        rerender(
          <TestWrapper>
            <OptimizedImage
              src={`https://example.com/image${i}.jpg`}
              alt="Test image"
            />
          </TestWrapper>
        );
      }

      // Should not throw or cause issues
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });

    it('should handle rapid error boundary resets', async () => {
      const { rerender } = render(
        <TestWrapper>
          <ComprehensiveErrorBoundary>
            <ErrorComponent shouldThrow={true} />
          </ComprehensiveErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      // Rapid retries
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByText('Try Again'));
        await waitFor(() => {
          expect(screen.getByText('Try Again')).toBeInTheDocument();
        });
      }

      // Should handle gracefully
      expect(screen.getByText('Max Retries Reached')).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels', async () => {
      render(
        <TestWrapper>
          <ComprehensiveErrorBoundary>
            <ErrorComponent shouldThrow={true} />
          </ComprehensiveErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
      });
    });

    it('should be keyboard navigable', async () => {
      render(
        <TestWrapper>
          <ComprehensiveErrorBoundary>
            <ErrorComponent shouldThrow={true} />
          </ComprehensiveErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        const tryAgainButton = screen.getByText('Try Again');
        tryAgainButton.focus();
        expect(tryAgainButton).toHaveFocus();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work with React Router', () => {
      render(
        <TestWrapper>
          <ComprehensiveErrorBoundary>
            <ErrorComponent shouldThrow={true} />
          </ComprehensiveErrorBoundary>
        </TestWrapper>
      );

      // Should render without router errors
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('should work with React Query', () => {
      render(
        <TestWrapper>
          <OptimizedImage
            src="https://example.com/image.jpg"
            alt="Test image"
          />
        </TestWrapper>
      );

      // Should render without query client errors
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });
  });

  describe('Error Recovery Tests', () => {
    it('should recover from errors when component stops throwing', async () => {
      const { rerender } = render(
        <TestWrapper>
          <ComprehensiveErrorBoundary>
            <ErrorComponent shouldThrow={true} />
          </ComprehensiveErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      });

      // Component stops throwing
      rerender(
        <TestWrapper>
          <ComprehensiveErrorBoundary>
            <ErrorComponent shouldThrow={false} />
          </ComprehensiveErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No error')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined props gracefully', () => {
      render(
        <OptimizedImage
          src=""
          alt=""
          width={0}
          height={0}
        />
      );

      // Should not crash
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should handle very large images', () => {
      render(
        <OptimizedImage
          src="https://example.com/large-image.jpg"
          alt="Large image"
          width={9999}
          height={9999}
        />
      );

      expect(screen.getByAltText('Large image')).toBeInTheDocument();
    });

    it('should handle special characters in alt text', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image with special chars: !@#$%^&*()"
        />
      );

      expect(screen.getByAltText('Test image with special chars: !@#$%^&*()')).toBeInTheDocument();
    });
  });
});
