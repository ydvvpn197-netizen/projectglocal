import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

// Ensure React is available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

// Simple React availability check
if (!React || typeof React.createContext !== 'function') {
  console.error('React is not properly loaded:', { React, createContext: React?.createContext });
  throw new Error('React is not properly loaded');
}

console.log('✅ React is properly loaded:', {
  version: React.version,
  createContext: typeof React.createContext,
  useState: typeof React.useState,
  useEffect: typeof React.useEffect,
  createRoot: typeof createRoot
});

// Simple app initialization
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('🚀 Initializing React app...');
const root = createRoot(rootElement);

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

console.log('✅ React app initialized successfully');
