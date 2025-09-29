/**
 * Minimal Test Setup
 * Simplified setup to avoid React DOM testing issues
 */

import '@testing-library/jest-dom';
import React from 'react';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ensure React is available globally
global.React = React;

// JSX runtime is handled in jsx-setup.ts

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

// Mock DOMPurify for test environment
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html) => html),
    addHook: vi.fn(),
    removeHook: vi.fn(),
    removeAllHooks: vi.fn(),
    setConfig: vi.fn(),
    clearConfig: vi.fn(),
    isValidAttribute: vi.fn(() => true),
    isSupported: true,
    version: '3.0.0'
  }
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

// Mock DOM manipulation to prevent appendChild errors in test environment
if (typeof window !== 'undefined' && typeof Node !== 'undefined') {
  // Override appendChild to handle invalid nodes gracefully
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(child) {
    if (!child || typeof child !== 'object' || !child.nodeType) {
      // Create a text node for invalid children
      child = document.createTextNode(String(child || ''));
    }
    return originalAppendChild.call(this, child);
  };
}

// Mock Stripe to prevent loading errors
global.Stripe = vi.fn().mockImplementation(() => ({
  elements: vi.fn(() => ({
    create: vi.fn(() => ({
      mount: vi.fn(),
      unmount: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    })),
  })),
  createPaymentMethod: vi.fn(),
  confirmPayment: vi.fn(),
  retrievePaymentIntent: vi.fn(),
}));

// Remove problematic DOM mocking that causes DataCloneError

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

// Ensure proper DOM setup for React 18
if (typeof window !== 'undefined') {
  // Ensure HTMLElement methods exist
  if (!window.HTMLElement.prototype.appendChild) {
    window.HTMLElement.prototype.appendChild = function(child) {
      return child;
    };
  }
  if (!window.HTMLElement.prototype.removeChild) {
    window.HTMLElement.prototype.removeChild = function(child) {
      return child;
    };
  }
}

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
