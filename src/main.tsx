import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

// Ensure React is available globally for debugging
if (typeof window !== 'undefined') {
  (window as Window & { React: typeof React }).React = React;
}

// Simple React availability check
if (!React || typeof React.createContext !== 'function') {
  throw new Error('React is not properly loaded');
}

// Ensure CSS is loaded
const linkElement = document.createElement('link');
linkElement.rel = 'stylesheet';
linkElement.href = '/src/index.css';
document.head.appendChild(linkElement);

// Simple app initialization
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
