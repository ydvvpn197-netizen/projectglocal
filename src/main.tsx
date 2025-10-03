import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Simple, robust initialization
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

// Clear any existing content
rootElement.innerHTML = '';

const root = createRoot(rootElement);

// Simple error boundary for initialization
class InitErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Initialization error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Application Error</h1>
          <p>Failed to initialize the application.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render with error boundary
root.render(
  <InitErrorBoundary>
    <App />
  </InitErrorBoundary>
);
