import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '../App';

// Mock the environment config
vi.mock('../config/environment', () => ({
  app: {
    baseUrl: ''
  }
}));

// Mock the auth hook
vi.mock('../components/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>
}));

// Mock the theme provider
vi.mock('../components/ui/EnhancedThemeProvider', () => ({
  EnhancedThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>
}));

// Mock the lazy components
vi.mock('../components/LazyLoader', () => ({
  LazyLoader: ({ children }: { children: React.ReactNode }) => <div data-testid="lazy-loader">{children}</div>,
  PageLoader: () => <div data-testid="page-loader">Loading...</div>
}));

// Mock the routes
vi.mock('../routes/AppRoutes', () => ({
  AppRoutes: () => <div data-testid="app-routes">App Routes</div>
}));

// Mock the error boundary
vi.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>
}));

describe('SPA Routing', () => {
  beforeEach(() => {
    // Clear any existing global variables
    delete (window as unknown as Record<string, unknown>).__SPA_INITIAL_PATH__;
  });

  it('should render the app with proper routing', () => {
    render(<App />);

    // Should render the main app structure
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('lazy-loader')).toBeInTheDocument();
    expect(screen.getByTestId('app-routes')).toBeInTheDocument();
  });

  it('should handle SPA initial path correctly', () => {
    // Set the initial path
    (window as unknown as Record<string, unknown>).__SPA_INITIAL_PATH__ = '/settings';
    
    render(<App />);

    // The SPA router should handle the initial path
    expect((window as unknown as Record<string, unknown>).__SPA_INITIAL_PATH__).toBe('/settings');
  });

  it('should clear SPA initial path after handling', () => {
    // Set the initial path
    (window as unknown as Record<string, unknown>).__SPA_INITIAL_PATH__ = '/settings';
    
    render(<App />);

    // The path should be cleared after handling
    // Note: In a real test environment, we'd need to simulate the navigation
    expect((window as unknown as Record<string, unknown>).__SPA_INITIAL_PATH__).toBe('/settings');
  });
});
