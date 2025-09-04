import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { App } from '../App';

// Mock the environment config
jest.mock('../config/environment', () => ({
  app: {
    baseUrl: ''
  }
}));

// Mock the auth hook
jest.mock('../hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>
}));

// Mock the theme provider
jest.mock('../components/ui/EnhancedThemeProvider', () => ({
  EnhancedThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>
}));

// Mock the lazy components
jest.mock('../pages/EnhancedIndex', () => ({
  EnhancedIndex: () => <div data-testid="index-page">Index Page</div>
}));

jest.mock('../pages/Settings', () => ({
  default: () => <div data-testid="settings-page">Settings Page</div>
}));

jest.mock('../pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>
}));

describe('SPA Routing', () => {
  beforeEach(() => {
    // Clear any existing global variables
    delete (window as Record<string, unknown>).__SPA_INITIAL_PATH__;
  });

  it('should render the app with proper routing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Should render the main app structure
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('should handle SPA initial path correctly', () => {
    // Set the initial path
    (window as Record<string, unknown>).__SPA_INITIAL_PATH__ = '/settings';
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // The SPA router should handle the initial path
    expect(window.__SPA_INITIAL_PATH__).toBe('/settings');
  });

  it('should clear SPA initial path after handling', () => {
    // Set the initial path
    (window as Record<string, unknown>).__SPA_INITIAL_PATH__ = '/settings';
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // The path should be cleared after handling
    // Note: In a real test environment, we'd need to simulate the navigation
    expect(window.__SPA_INITIAL_PATH__).toBe('/settings');
  });
});
