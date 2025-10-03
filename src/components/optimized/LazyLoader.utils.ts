import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

// Default loading fallback
export const DefaultFallback = memo(({ minHeight = '200px' }: { minHeight?: string }) => 
  React.createElement('div', 
    { 
      className: "flex items-center justify-center",
      style: { minHeight }
    },
    React.createElement('div', { className: "flex flex-col items-center space-y-2" },
      React.createElement(Loader2, { className: "h-6 w-6 animate-spin" }),
      React.createElement('p', { className: "text-sm text-muted-foreground" }, "Loading...")
    )
  )
);

DefaultFallback.displayName = 'DefaultFallback';
