/**
 * Minimal Test Setup
 * Simplified setup to avoid React DOM testing issues
 */

import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock useToast hook globally
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
    dismiss: vi.fn(),
    toasts: []
  })
}));

// Basic window mocks
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

// Mock Worker to prevent memory leaks
global.Worker = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  terminate: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  onerror: null,
  onmessage: null,
  onmessageerror: null,
}));

// Suppress React Router future flag warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const message = args[0];
  if (
    typeof message === 'string' && 
    (message.includes('React Router Future Flag Warning') ||
     message.includes('v7_startTransition') ||
     message.includes('v7_relativeSplatPath') ||
     message.includes('ReactDOMTestUtils.act'))
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Enhanced cleanup
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.body.innerHTML = '';
  
  // Clean up any lingering timers
  vi.clearAllTimers();
  
  // Reset console.warn
  console.warn = originalConsoleWarn;
});
