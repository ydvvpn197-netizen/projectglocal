import React, { memo, Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Default loading fallback
export const DefaultFallback = memo(({ minHeight = '200px' }: { minHeight?: string }) => (
  <div 
    className="flex items-center justify-center"
    style={{ minHeight }}
  >
    <div className="flex flex-col items-center space-y-2">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
));

DefaultFallback.displayName = 'DefaultFallback';
