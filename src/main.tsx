import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

// Enhanced React availability check with retry mechanism
const ensureReactLoaded = () => {
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
  
  console.log('✅ React is properly loaded:', {
    version: React.version,
    createContext: typeof React.createContext,
    useState: typeof React.useState,
    useEffect: typeof React.useEffect
  });
};

// Initialize the app with error handling and retry
const initializeApp = (retryCount = 0) => {
  try {
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
    if (retryCount < 3 && error.message.includes('React')) {
      console.log(`🔄 Retrying app initialization (attempt ${retryCount + 1}/3)...`);
      setTimeout(() => initializeApp(retryCount + 1), 1000);
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
            </div>
          </div>
        `;
      }
    }
  }
};

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initializeApp());
} else {
  initializeApp();
}
