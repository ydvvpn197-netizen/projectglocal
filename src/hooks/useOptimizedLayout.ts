import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface LayoutConfig {
  variant: 'main' | 'admin' | 'minimal';
  showSidebar: boolean;
  showHeader: boolean;
  showFooter: boolean;
  showMobileNav: boolean;
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding: 'none' | 'sm' | 'md' | 'lg';
}

export const useOptimizedLayout = (config: Partial<LayoutConfig> = {}) => {
  const { user, isLoading } = useAuth();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const isTablet = useMediaQuery('(max-width: 768px)');

  const layoutConfig = useMemo(() => {
    const defaultConfig: LayoutConfig = {
      variant: 'main',
      showSidebar: true,
      showHeader: false,
      showFooter: false,
      showMobileNav: true,
      maxWidth: 'xl',
      padding: 'md'
    };

    const mergedConfig = { ...defaultConfig, ...config };

    // Responsive adjustments
    if (isMobile) {
      mergedConfig.showSidebar = false;
      mergedConfig.showMobileNav = true;
    }

    // Admin specific adjustments
    if (mergedConfig.variant === 'admin') {
      mergedConfig.showSidebar = true;
      mergedConfig.showMobileNav = false;
    }

    // Minimal variant adjustments
    if (mergedConfig.variant === 'minimal') {
      mergedConfig.showSidebar = false;
      mergedConfig.showHeader = false;
      mergedConfig.showFooter = false;
      mergedConfig.showMobileNav = false;
    }

    return mergedConfig;
  }, [config, isMobile, isTablet]);

  const responsiveClasses = useMemo(() => {
    const classes = {
      container: '',
      sidebar: '',
      content: '',
      mobileNav: ''
    };

    // Container classes
    if (layoutConfig.maxWidth !== 'full') {
      const maxWidthMap = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-7xl',
        '2xl': 'max-w-2xl'
      };
      classes.container = maxWidthMap[layoutConfig.maxWidth];
    }

    // Padding classes
    const paddingMap = {
      none: '',
      sm: 'px-3 py-3',
      md: 'px-4 py-4',
      lg: 'px-6 py-6'
    };
    classes.container += ` ${paddingMap[layoutConfig.padding]}`;

    // Sidebar classes
    if (layoutConfig.showSidebar && !isMobile) {
      classes.sidebar = 'w-64';
      classes.content = 'lg:ml-64';
    }

    // Mobile navigation classes
    if (layoutConfig.showMobileNav && isMobile) {
      classes.mobileNav = 'pb-16'; // Account for bottom navigation
    }

    return classes;
  }, [layoutConfig, isMobile]);

  return {
    layoutConfig,
    responsiveClasses,
    isMobile,
    isTablet,
    user,
    isLoading
  };
};
