/**
 * Standard Grid Layout Component
 * Provides consistent grid layouts for content
 */

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StandardGridLayoutProps {
  children: ReactNode;
  className?: string;
  
  // Grid configuration
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6;
    md?: 1 | 2 | 3 | 4 | 5 | 6;
    lg?: 1 | 2 | 3 | 4 | 5 | 6;
    xl?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  
  // Spacing
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  // Layout options
  variant?: 'default' | 'masonry' | 'equal' | 'auto';
  align?: 'start' | 'center' | 'end' | 'stretch';
  
  // Styling
  background?: 'default' | 'muted' | 'transparent';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const StandardGridLayout: React.FC<StandardGridLayoutProps> = ({
  children,
  className,
  cols = 1,
  responsive = {},
  gap = 'md',
  variant = 'default',
  align = 'stretch',
  background = 'default',
  padding = 'md'
}) => {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const backgroundClasses = {
    default: 'bg-background',
    muted: 'bg-muted/50',
    transparent: 'bg-transparent'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  // Generate responsive grid classes
  const getGridClasses = () => {
    const baseClass = `grid grid-cols-${cols}`;
    const responsiveClasses = Object.entries(responsive)
      .map(([breakpoint, cols]) => `${breakpoint}:grid-cols-${cols}`)
      .join(' ');
    
    return `${baseClass} ${responsiveClasses}`;
  };

  const variantClasses = {
    default: getGridClasses(),
    masonry: 'columns-1 sm:columns-2 md:columns-3 lg:columns-4',
    equal: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    auto: 'grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]'
  };

  return (
    <div className={cn(
      variantClasses[variant],
      gapClasses[gap],
      alignClasses[align],
      backgroundClasses[background],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

// Pre-configured grid variants
export const ResponsiveGrid: React.FC<Omit<StandardGridLayoutProps, 'responsive'>> = (props) => (
  <StandardGridLayout
    {...props}
    responsive={{
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4
    }}
  />
);

export const MasonryGrid: React.FC<Omit<StandardGridLayoutProps, 'variant'>> = (props) => (
  <StandardGridLayout
    {...props}
    variant="masonry"
    gap="lg"
  />
);

export const EqualGrid: React.FC<Omit<StandardGridLayoutProps, 'variant'>> = (props) => (
  <StandardGridLayout
    {...props}
    variant="equal"
    gap="md"
  />
);

export const AutoGrid: React.FC<Omit<StandardGridLayoutProps, 'variant'>> = (props) => (
  <StandardGridLayout
    {...props}
    variant="auto"
    gap="md"
  />
);

export default StandardGridLayout;
