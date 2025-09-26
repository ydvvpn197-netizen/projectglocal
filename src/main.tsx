import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

// Ensure React is available globally and properly initialized
if (typeof window !== 'undefined') {
  (window as Window & { React: typeof React }).React = React;
}

// Enhanced React availability check
if (!React || typeof React.createContext !== 'function' || typeof React.createElement !== 'function') {
  throw new Error('React is not properly loaded - missing core functions');
}

// Ensure React.Children is available
if (!React.Children) {
  throw new Error('React.Children is not available');
}

// Simple app initialization with error handling
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

// Clear any existing content to prevent hydration mismatches
rootElement.innerHTML = '';

const root = createRoot(rootElement);

// Wrap in try-catch for better error handling
try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = '<div style="padding: 20px; color: red;">Failed to load application. Please refresh the page.</div>';
}
