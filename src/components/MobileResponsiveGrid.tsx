import React from 'react';
import { cn } from '@/lib/utils';

interface MobileResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export const MobileResponsiveGrid: React.FC<MobileResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}) => {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  };

  const gridClasses = cn(
    'grid',
    `grid-cols-${cols.mobile}`,
    `sm:grid-cols-${cols.tablet}`,
    `lg:grid-cols-${cols.desktop}`,
    gapClasses[gap],
    className
  );

  return <div className={gridClasses}>{children}</div>;
};

interface MobileResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  responsive?: boolean;
  gap?: 'sm' | 'md' | 'lg';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export const MobileResponsiveFlex: React.FC<MobileResponsiveFlexProps> = ({
  children,
  className,
  direction = 'col',
  responsive = true,
  gap = 'md',
  justify = 'start',
  align = 'start'
}) => {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const flexClasses = cn(
    'flex',
    direction === 'col' ? 'flex-col' : 'flex-row',
    responsive && direction === 'col' ? 'sm:flex-row' : '',
    gapClasses[gap],
    justifyClasses[justify],
    alignClasses[align],
    className
  );

  return <div className={flexClasses}>{children}</div>;
};

interface MobileResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'foreground';
}

export const MobileResponsiveText: React.FC<MobileResponsiveTextProps> = ({
  children,
  className,
  size = 'base',
  weight = 'normal',
  color = 'foreground'
}) => {
  const sizeClasses = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl',
    '4xl': 'text-4xl sm:text-5xl',
    '5xl': 'text-5xl sm:text-6xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted-foreground',
    foreground: 'text-foreground'
  };

  const textClasses = cn(
    sizeClasses[size],
    weightClasses[weight],
    colorClasses[color],
    className
  );

  return <span className={textClasses}>{children}</span>;
};

interface MobileResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const MobileResponsiveContainer: React.FC<MobileResponsiveContainerProps> = ({
  children,
  className,
  padding = 'md',
  maxWidth = 'xl'
}) => {
  const paddingClasses = {
    sm: 'p-2 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-12'
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  const containerClasses = cn(
    'mx-auto',
    paddingClasses[padding],
    maxWidthClasses[maxWidth],
    className
  );

  return <div className={containerClasses}>{children}</div>;
};
