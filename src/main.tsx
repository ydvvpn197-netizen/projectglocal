import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

// Ensure React is properly loaded before anything else
if (typeof window !== 'undefined') {
  // Make React available globally
  (window as Window & { React?: typeof React }).React = React;
}

// Enhanced React availability check
if (!React || typeof React.createContext !== 'function' || typeof React.createElement !== 'function') {
  throw new Error('React is not properly loaded - missing core functions');
}

// Simple app initialization with error handling
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

// Clear any existing content to prevent hydration mismatches
rootElement.innerHTML = '';

const root = createRoot(rootElement);

// Enhanced error handling with retry mechanism
let renderAttempts = 0;
const maxRenderAttempts = 3;

const renderApp = () => {
  try {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error(`Render attempt ${renderAttempts + 1} failed:`, error);
    
    if (renderAttempts < maxRenderAttempts) {
      renderAttempts++;
      console.log(`Retrying render (attempt ${renderAttempts}/${maxRenderAttempts})...`);
      setTimeout(renderApp, 1000 * renderAttempts); // Exponential backoff
    } else {
      console.error('All render attempts failed');
      rootElement.innerHTML = `
        <div style="padding: 20px; color: red; text-align: center; font-family: system-ui, sans-serif;">
          <h2>Application Failed to Load</h2>
          <p>Please refresh the page or try again later.</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      `;
    }
  }
};

renderApp();
