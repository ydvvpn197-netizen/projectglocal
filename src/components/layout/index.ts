/**
 * Layout Components Export
 * Centralized exports for all layout-related components
 */

export { Header } from './Header';
export { Footer } from './Footer';
export { PageLayout } from './PageLayout';
export { CardLayout } from './CardLayout';

// Consolidated components
export { ConsolidatedHeader } from './ConsolidatedHeader';
export { ConsolidatedFooter } from './ConsolidatedFooter';
export { ConsolidatedSidebar } from './ConsolidatedSidebar';
export { ConsolidatedLayout } from './ConsolidatedLayout';

// Standard layout components
export { StandardPageLayout, HeroPageLayout, DashboardPageLayout, MinimalPageLayout } from './StandardPageLayout';
export { StandardContentSection, HeroSection, CardSection, MinimalSection } from './StandardContentSection';
export { StandardGridLayout, ResponsiveGrid, MasonryGrid, EqualGrid, AutoGrid } from './StandardGridLayout';

// Re-export layout types
export type { default as HeaderProps } from './Header';
export type { default as FooterProps } from './Footer';
export type { default as PageLayoutProps } from './PageLayout';
export type { default as CardLayoutProps } from './CardLayout';