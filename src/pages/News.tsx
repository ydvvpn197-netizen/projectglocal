// News page component for TheGlocal project
import React, { Suspense } from 'react';
import { LocalNews } from '@/components/LocalNews';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Loading fallback component
const NewsLoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// Error fallback component
const NewsErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="container mx-auto px-4 py-8">
      <Alert>
        <AlertDescription>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading news feature...</span>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm">Error details</summary>
            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
              {error.message}
            </pre>
          </details>
        </AlertDescription>
      </Alert>
    </div>
  </div>
);

export const News: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<NewsLoadingFallback />}>
        <ErrorBoundary fallback={NewsErrorFallback}>
          <LocalNews />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};