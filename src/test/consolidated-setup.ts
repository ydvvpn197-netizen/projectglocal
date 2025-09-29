/**
 * Consolidated Test Setup
 * Test configuration for consolidated components
 */

import { vi } from 'vitest';
import { expect } from 'vitest';

// Mock consolidated components
vi.mock('@/pages/ConsolidatedDashboard', () => ({
  default: vi.fn(() => 'ConsolidatedDashboard')
}));

vi.mock('@/pages/ConsolidatedFeed', () => ({
  default: vi.fn(() => 'ConsolidatedFeed')
}));

vi.mock('@/pages/ConsolidatedIndex', () => ({
  default: vi.fn(() => 'ConsolidatedIndex')
}));

vi.mock('@/components/MainLayout', () => ({
  MainLayout: vi.fn(({ children }) => children)
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => 
    `<a href="${to}">${children}</a>`,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
  Navigate: ({ to }: { to: string }) => `<Navigate to="${to}" />`
}));

// Mock authentication
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      created_at: new Date().toISOString()
    },
    isLoading: false
  })
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Global test utilities
global.expect = expect;

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Console cleanup for tests
const originalConsole = console;
beforeEach(() => {
  global.console = {
    ...originalConsole,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
});

afterEach(() => {
  global.console = originalConsole;
  vi.clearAllMocks();
});
