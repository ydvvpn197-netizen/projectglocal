import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

// Simple React availability check
if (!React || typeof React.createContext !== 'function') {
  console.error('React is not properly loaded:', { React, createContext: React?.createContext });
  throw new Error('React createContext is not available');
}

// Initialize the app
const initializeApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Error rendering app:', error);
  }
};

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
