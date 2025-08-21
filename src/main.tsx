import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

// Debug logging for production troubleshooting
console.log('main.tsx: React import successful', { 
  React: typeof React, 
  createContext: typeof React?.createContext,
  version: React?.version 
});

// Test Supabase configuration
import { supabase } from './integrations/supabase/client';
console.log('main.tsx: Supabase client loaded', {
  hasAuth: !!supabase.auth,
  hasFrom: !!supabase.from,
  url: supabase.supabaseUrl
});

// Test environment variables
console.log('main.tsx: Environment variables test', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Present' : 'Missing',
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
});

// Ensure React is available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).React = React;
  console.log('main.tsx: React assigned to window.React');
}

// Verify React is available before rendering
if (!React || !React.createContext) {
  console.error('React is not properly loaded:', React);
  throw new Error('React is not properly loaded');
}

// Create a simple React app wrapper to ensure React is loaded
const AppWrapper = () => {
  // Double-check React is available
  if (!React || !React.createContext) {
    console.error('React not available in AppWrapper');
    return <div>Loading...</div>;
  }
  
  console.log('AppWrapper: React is available, rendering app');
  
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
};

// Initialize the app
const initializeApp = () => {
  console.log('initializeApp: Starting app initialization');
  
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error('Root element not found, retrying...');
    setTimeout(initializeApp, 100);
    return;
  }

  try {
    console.log('initializeApp: Creating React root');
    const root = createRoot(rootElement);
    console.log('initializeApp: Rendering AppWrapper');
    root.render(<AppWrapper />);
    console.log('initializeApp: App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    // Retry after a short delay
    setTimeout(initializeApp, 100);
  }
};

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  console.log('main.tsx: DOM still loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  console.log('main.tsx: DOM already ready, initializing immediately');
  initializeApp();
}
