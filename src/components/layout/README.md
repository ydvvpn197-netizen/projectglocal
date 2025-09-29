# Layout System

Professional responsive layout system with header, sidebar, and footer components designed for modern web applications.

## Components

### MainLayout
The main layout wrapper that orchestrates the entire page structure.

```tsx
import { MainLayout } from '@/components/layout/MainLayout';

<MainLayout
  showHeader={true}
  showSidebar={true}
  showFooter={true}
  headerVariant="default"
  sidebarCollapsible={true}
  maxContentWidth="xl"
>
  <YourContent />
</MainLayout>
```

**Props:**
- `showHeader?: boolean` - Show/hide header (default: true)
- `showSidebar?: boolean` - Show/hide sidebar (default: true)
- `showFooter?: boolean` - Show/hide footer (default: true)
- `headerVariant?: 'default' | 'minimal' | 'glass'` - Header style variant
- `sidebarCollapsible?: boolean` - Enable sidebar collapse (default: true)
- `maxContentWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'` - Content max width

### PageLayout
Wrapper for individual pages with consistent spacing and structure.

```tsx
import { PageLayout } from '@/components/layout/PageLayout';

<PageLayout
  title="Page Title"
  description="Page description"
  showBackButton={true}
  actions={<Button>Action</Button>}
  variant="default"
  padding="md"
>
  <PageContent />
</PageLayout>
```

**Props:**
- `title?: string` - Page title
- `description?: string` - Page description
- `showBackButton?: boolean` - Show back button (default: false)
- `backButtonText?: string` - Back button text (default: "Back")
- `backButtonHref?: string` - Back button destination
- `actions?: ReactNode` - Action buttons/content
- `variant?: 'default' | 'centered' | 'full-width'` - Layout variant
- `padding?: 'none' | 'sm' | 'md' | 'lg'` - Content padding

### CardLayout
Consistent card-based layout for content sections.

```tsx
import { CardLayout } from '@/components/layout/CardLayout';

<CardLayout
  title="Card Title"
  description="Card description"
  variant="default"
  padding="md"
>
  <CardContent />
</CardLayout>
```

**Props:**
- `title?: string` - Card title
- `description?: string` - Card description
- `variant?: 'default' | 'bordered' | 'elevated' | 'ghost'` - Card style
- `padding?: 'none' | 'sm' | 'md' | 'lg'` - Content padding

### Header
Responsive top navigation header with search, notifications, and user menu.

```tsx
import { Header } from '@/components/layout/Header';

<Header
  showSearch={true}
  showCreateButton={true}
  showNotifications={true}
  showUserMenu={true}
  showNavigation={true}
  variant="default"
/>
```

**Props:**
- `showSearch?: boolean` - Show search bar (default: true)
- `showCreateButton?: boolean` - Show create button (default: true)
- `showNotifications?: boolean` - Show notifications (default: true)
- `showUserMenu?: boolean` - Show user menu (default: true)
- `showNavigation?: boolean` - Show navigation links (default: true)
- `variant?: 'default' | 'minimal' | 'glass'` - Header style variant

### Sidebar
Collapsible sidebar navigation with user info and navigation items.

```tsx
import { Sidebar } from '@/components/layout/Sidebar';

<Sidebar
  isOpen={sidebarOpen}
  isMobile={isMobile}
  customContent={<CustomSidebarContent />}
/>
```

**Props:**
- `isOpen: boolean` - Sidebar open state
- `isMobile: boolean` - Mobile device flag
- `customContent?: ReactNode` - Custom sidebar content

### Footer
Comprehensive footer with links and information.

```tsx
import { Footer } from '@/components/layout/Footer';

<Footer className="custom-footer-class" />
```

**Props:**
- `className?: string` - Additional CSS classes

## Layout Context

The layout system uses React Context for state management:

```tsx
import { useLayout } from '@/hooks/useLayout';

const { 
  sidebarOpen, 
  toggleSidebar, 
  setSidebarOpen,
  isMobile,
  isTablet,
  isDesktop,
  headerHeight,
  footerHeight
} = useLayout();
```

## Responsive Behavior

### Mobile (< 768px)
- Sidebar hidden by default
- Bottom navigation for main actions
- Header with hamburger menu
- Full-width content

### Tablet (768px - 1024px)
- Sidebar can be toggled
- Header with full navigation
- Responsive content grid

### Desktop (> 1024px)
- Sidebar always visible (collapsible)
- Full header with search and actions
- Multi-column layouts

## CSS Classes

### Layout Utilities
- `.layout-container` - Main container with max-width
- `.layout-container-sm` - Small container
- `.layout-container-lg` - Large container
- `.mobile-safe-area` - Mobile safe area padding
- `.sidebar-transition` - Sidebar animation
- `.layout-transition` - General layout transitions

### Responsive Utilities
- `.mobile-only` - Show only on mobile
- `.desktop-only` - Show only on desktop
- `.tablet-down` - Show on tablet and below
- `.desktop-up` - Show on desktop and above

### Grid Utilities
- `.grid-responsive` - Responsive grid (1-4 columns)
- `.grid-responsive-2` - 2-column responsive grid
- `.grid-responsive-3` - 3-column responsive grid
- `.card-grid` - Card-based grid layout

## Usage Examples

### Basic Layout
```tsx
import { MainLayout, PageLayout } from '@/components/layout';

function MyPage() {
  return (
    <MainLayout>
      <PageLayout title="My Page" description="Page description">
        <div>Your content here</div>
      </PageLayout>
    </MainLayout>
  );
}
```

### Custom Layout
```tsx
import { MainLayout, CardLayout } from '@/components/layout';

function CustomPage() {
  return (
    <MainLayout 
      showSidebar={false} 
      headerVariant="glass"
      maxContentWidth="full"
    >
      <CardLayout title="Custom Content" variant="elevated">
        <div>Your custom content</div>
      </CardLayout>
    </MainLayout>
  );
}
```

### Mobile-Only Layout
```tsx
import { MainLayout } from '@/components/layout';

function MobilePage() {
  return (
    <MainLayout 
      showSidebar={false}
      showFooter={false}
    >
      <div className="mobile-safe-area">
        Mobile-specific content
      </div>
    </MainLayout>
  );
}
```

## Accessibility

The layout system includes:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast support
- Reduced motion preferences

## Performance

- Lazy loading of components
- Optimized re-renders
- CSS-in-JS with minimal runtime
- Responsive images
- Efficient animations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)
