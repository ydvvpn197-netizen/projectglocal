import React, { Suspense } from 'react';
import { PageLoader } from './LazyLoader';
import { ErrorBoundary } from './ErrorBoundary';

// Import CreatePost with error handling
const CreatePost = React.lazy(() => 
  import('@/pages/CreatePost').catch((error) => {
    console.error('Failed to load CreatePost:', error);
    // Return a fallback component
    return {
      default: () => (
        <div className="container max-w-3xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Create Post</h1>
            <p className="text-muted-foreground mb-4">
              There was an issue loading the create post page. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    };
  })
);

export const CreatePostWrapper: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <CreatePost />
      </Suspense>
    </ErrorBoundary>
  );
};
