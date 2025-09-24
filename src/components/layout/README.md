# Layout System Documentation

## Overview

The layout system provides a comprehensive, responsive layout solution for TheGlocal project with multiple layout types, sidebar navigation, and mobile-first design.

## Architecture

### Core Components

1. **LayoutProvider** - Context provider for managing layout state
2. **MainLayout** - Full layout with header, sidebar, and footer
3. **SidebarLayout** - Layout with collapsible sidebar
4. **PageLayout** - Flexible layout wrapper with multiple layout types
5. **ProtectedPageLayout** - Layout wrapper with authentication protection

### Layout Types

- `main` - Full layout with header, sidebar, and footer (default)
- `sidebar` - Layout with collapsible sidebar only
- `full` - Full-width layout without sidebar
- `minimal` - Minimal layout for auth pages

## Usage

### Basic Usage

```tsx
import { PageLayout } from '@/components/layout';

function MyPage() {
  return (
    <PageLayout layout="main" showSidebar={true} showHeader={true} showFooter={true}>
      <div>Your page content</div>
    </PageLayout>
  );
}
```

### Protected Pages

```tsx
import { ProtectedPageLayout } from '@/components/layout';

function ProtectedPage() {
  return (
    <ProtectedPageLayout layout="main">
      <div>Protected content</div>
    </ProtectedPageLayout>
  );
}
```

### Using HOCs

```tsx
import { withMainLayout } from '@/components/layout';

const MyPage = () => <div>Page content</div>;
export default withMainLayout(MyPage);
```

### Layout Wrapper

```tsx
import { LayoutWrapper } from '@/components/layout';

function MyPage() {
  return (
    <LayoutWrapper 
      layout="main" 
      protected={true}
      showSidebar={true}
      showHeader={true}
      showFooter={true}
    >
      <div>Your content</div>
    </LayoutWrapper>
  );
}
```

## Layout Components

### Header

- Responsive header with search, notifications, and user menu
- Mobile-friendly with hamburger menu
- Integrated with authentication system

### Sidebar

- Collapsible sidebar with navigation items
- Mobile overlay support
- Custom content support
- Responsive breakpoints

### Footer

- Comprehensive footer with links and social media
- Responsive grid layout
- Brand information and support links

## Responsive Design

The layout system is fully responsive with breakpoints:

- **Mobile**: < 768px - Sidebar becomes overlay
- **Tablet**: 768px - 1024px - Sidebar can be collapsed
- **Desktop**: > 1024px - Full sidebar support

## Customization

### Custom Sidebar Content

```tsx
<PageLayout 
  layout="sidebar"
  sidebarContent={<CustomSidebarContent />}
>
  <div>Your content</div>
</PageLayout>
```

### Custom Layout Classes

```tsx
<PageLayout 
  layout="main"
  className="custom-layout-class"
>
  <div>Your content</div>
</PageLayout>
```

## Integration with Routing

### Using with React Router

```tsx
import { LayoutRoute } from '@/components/layout';

<Route 
  path="/dashboard" 
  element={
    <LayoutRoute layout="main" protected={true}>
      <Dashboard />
    </LayoutRoute>
  } 
/>
```

### Route-Specific Layouts

```tsx
// Auth pages - minimal layout
<Route path="/signin" element={
  <LayoutRoute layout="minimal" protected={false}>
    <SignIn />
  </LayoutRoute>
} />

// Dashboard pages - main layout
<Route path="/dashboard" element={
  <LayoutRoute layout="main" protected={true}>
    <Dashboard />
  </LayoutRoute>
} />

// Chat pages - sidebar layout
<Route path="/chat" element={
  <LayoutRoute layout="sidebar" protected={true}>
    <Chat />
  </LayoutRoute>
} />
```

## State Management

### Layout Context

The layout system uses React Context for state management:

```tsx
import { useLayout } from '@/hooks/useLayout';

function MyComponent() {
  const { sidebarOpen, toggleSidebar, isMobile } = useLayout();
  
  return (
    <button onClick={toggleSidebar}>
      {sidebarOpen ? 'Close' : 'Open'} Sidebar
    </button>
  );
}
```

### Available State

- `sidebarOpen` - Boolean for sidebar visibility
- `toggleSidebar` - Function to toggle sidebar
- `setSidebarOpen` - Function to set sidebar state
- `isMobile` - Boolean for mobile breakpoint
- `isTablet` - Boolean for tablet breakpoint
- `isDesktop` - Boolean for desktop breakpoint

## Best Practices

1. **Use appropriate layout types** for different page types
2. **Leverage responsive design** for mobile-first approach
3. **Use protected layouts** for authenticated pages
4. **Customize sidebar content** for specific use cases
5. **Follow consistent patterns** across the application

## Examples

### Dashboard Page

```tsx
import { PageLayout } from '@/components/layout';

export default function Dashboard() {
  return (
    <PageLayout layout="main" showSidebar={true} showHeader={true} showFooter={false}>
      <div className="p-6">
        <h1>Dashboard</h1>
        {/* Dashboard content */}
      </div>
    </PageLayout>
  );
}
```

### Chat Page

```tsx
import { PageLayout } from '@/components/layout';

export default function Chat() {
  return (
    <PageLayout layout="sidebar" showSidebar={true} showHeader={false} showFooter={false}>
      <div className="flex h-full">
        {/* Chat interface */}
      </div>
    </PageLayout>
  );
}
```

### Auth Page

```tsx
import { PageLayout } from '@/components/layout';

export default function SignIn() {
  return (
    <PageLayout layout="minimal" showSidebar={false} showHeader={false} showFooter={false}>
      <div className="flex items-center justify-center min-h-screen">
        {/* Auth form */}
      </div>
    </PageLayout>
  );
}
```

## Migration Guide

### From ResponsiveLayout

Replace:
```tsx
import { ResponsiveLayout } from '@/components/ResponsiveLayout';

<ResponsiveLayout>
  <div>Content</div>
</ResponsiveLayout>
```

With:
```tsx
import { PageLayout } from '@/components/layout';

<PageLayout layout="main">
  <div>Content</div>
</PageLayout>
```

### From Custom Layouts

Replace custom layout implementations with the standardized layout system for consistency and maintainability.
