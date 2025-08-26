import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

// Ensure React is globally available
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

// Enhanced React availability check with retry mechanism
const ensureReactLoaded = () => {
  // Wait for React to be available
  if (typeof window !== 'undefined' && !window.React) {
    // Try to get React from global scope
    window.React = React;
  }
  
  if (!React) {
    throw new Error('React is not loaded');
  }
  
  if (typeof React.createContext !== 'function') {
    throw new Error('React.createContext is not available');
  }
  
  if (typeof React.useState !== 'function') {
    throw new Error('React.useState is not available');
  }
  
  if (typeof React.useEffect !== 'function') {
    throw new Error('React.useEffect is not available');
  }
  
  // Additional check for createRoot
  if (typeof createRoot !== 'function') {
    throw new Error('createRoot is not available');
  }
  
  console.log('✅ React is properly loaded:', {
    version: React.version,
    createContext: typeof React.createContext,
    useState: typeof React.useState,
    useEffect: typeof React.useEffect,
    createRoot: typeof createRoot
  });
};

// Wait for all modules to be loaded
const waitForModules = () => {
  return new Promise((resolve) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve();
    }
  });
};

// Initialize the app with error handling and retry
const initializeApp = async (retryCount = 0) => {
  try {
    // Wait for modules to be loaded
    await waitForModules();
    
    // Ensure React is loaded
    ensureReactLoaded();
    
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error('Root element not found');
      return;
    }

    console.log('🚀 Initializing React app...');
    const root = createRoot(rootElement);
    
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    
    console.log('✅ React app initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing app:', error);
    
    // Retry mechanism for React loading issues
    if (retryCount < 3 && (error.message.includes('React') || error.message.includes('ot'))) {
      console.log(`🔄 Retrying app initialization (attempt ${retryCount + 1}/3)...`);
      setTimeout(() => initializeApp(retryCount + 1), 1000 * (retryCount + 1));
    } else {
      console.error('❌ Failed to initialize app after retries');
      // Show fallback content
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.innerHTML = `
          <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, sans-serif;">
            <div style="text-align: center; padding: 2rem;">
              <h1>The Glocal</h1>
              <p>Loading application...</p>
              <p style="color: #666; font-size: 0.9rem;">If this persists, please refresh the page.</p>
              <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #6D28D9; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Refresh Page
              </button>
            </div>
          </div>
        `;
      }
    }
  }
};

// Start the app
initializeApp();
