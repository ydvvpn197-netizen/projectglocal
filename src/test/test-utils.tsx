/**
 * Test Components
 * React components for testing
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Enhanced Router wrapper with future flags
export const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    {children}
  </BrowserRouter>
);

// Query Client wrapper
export const QueryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Combined wrapper for most tests
export const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryWrapper>
    <RouterWrapper>
      {children}
    </RouterWrapper>
  </QueryWrapper>
);
