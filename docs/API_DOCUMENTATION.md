# API Documentation - ProjectGlocal

## Overview

This document provides comprehensive API documentation for the ProjectGlocal application, covering all services, hooks, and utilities.

## Table of Contents

1. [Authentication](#authentication)
2. [Community Services](#community-services)
3. [Error Handling](#error-handling)
4. [Data Transformation](#data-transformation)
5. [Referral System](#referral-system)
6. [Hooks](#hooks)
7. [Components](#components)

## Authentication

### useAuth Hook

The main authentication hook that manages user sessions and authentication state.

```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, session, loading, signIn, signUp, signOut } = useAuth();
```

#### Properties

- `user: User | null` - Current authenticated user
- `session: Session | null` - Current session
- `loading: boolean` - Loading state
- `signIn: (email: string, password: string) => Promise<{ error: any }>` - Sign in function
- `signUp: (email: string, password: string, firstName?: string, lastName?: string, userType?: 'user' | 'artist') => Promise<{ error: any }>` - Sign up function
- `signOut: () => Promise<void>` - Sign out function

#### Example Usage

```typescript
const { user, signIn, loading } = useAuth();

const handleLogin = async (email: string, password: string) => {
  const { error } = await signIn(email, password);
  if (error) {
    console.error('Login failed:', error);
  }
};
```

## Community Services

### CommunityService

Handles all community-related operations including groups, posts, and members.

```typescript
import { CommunityService } from '@/services/communityService';
```

#### Methods

##### createGroup(groupData: CreateGroupRequest): Promise<CommunityGroup | null>

Creates a new community group.

```typescript
const group = await CommunityService.createGroup({
  name: 'My Community',
  description: 'A great community',
  category: 'Technology',
  is_public: true,
  location_city: 'New York'
});
```

##### getGroups(filters?: GroupFilters): Promise<CommunityGroup[]>

Retrieves community groups with optional filtering.

```typescript
const groups = await CommunityService.getGroups({
  category: 'Technology',
  is_public: true,
  location_city: 'New York'
});
```

##### addGroupMember(groupId: string, userId: string, role: 'admin' | 'moderator' | 'member'): Promise<boolean>

Adds a user to a community group.

```typescript
const success = await CommunityService.addGroupMember(
  'group-id',
  'user-id',
  'member'
);
```

### useCommunityGroups Hook

React hook for managing community groups state.

```typescript
import { useCommunityGroups } from '@/hooks/useCommunityGroups';

const { 
  groups, 
  loading, 
  fetchGroups, 
  joinGroup, 
  leaveGroup,
  isGroupMember 
} = useCommunityGroups();
```

#### Properties

- `groups: CommunityGroup[]` - List of community groups
- `loading: boolean` - Loading state
- `fetchGroups: () => Promise<void>` - Fetch all groups
- `joinGroup: (groupId: string) => Promise<boolean>` - Join a group
- `leaveGroup: (groupId: string) => Promise<boolean>` - Leave a group
- `isGroupMember: (groupId: string) => boolean` - Check if user is member

## Error Handling

### ErrorHandlingService

Centralized error handling service for consistent error management.

```typescript
import { errorHandler } from '@/services/errorHandlingService';
```

#### Methods

##### handleApiError(error: unknown, context?: string): AppError

Handles API errors consistently across the application.

```typescript
try {
  const result = await someApiCall();
} catch (error) {
  const appError = errorHandler.handleApiError(error, 'UserService');
}
```

##### handleAuthError(error: unknown): AppError

Handles authentication-specific errors with user-friendly messages.

```typescript
try {
  await signIn(email, password);
} catch (error) {
  const authError = errorHandler.handleAuthError(error);
}
```

##### handleNetworkError(error: unknown): AppError

Handles network-related errors.

```typescript
try {
  await fetchData();
} catch (error) {
  const networkError = errorHandler.handleNetworkError(error);
}
```

#### AppError Interface

```typescript
interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  severity: 'error' | 'warning' | 'info';
}
```

## Data Transformation

### Data Transformation Utilities

Utilities for consistent data transformation between snake_case (database) and camelCase (frontend).

```typescript
import { 
  snakeToCamel, 
  camelToSnake, 
  transformers 
} from '@/utils/dataTransformation';
```

#### Functions

##### snakeToCamel(obj: T, options?: TransformOptions): Record<string, any>

Transforms snake_case object keys to camelCase.

```typescript
const dbData = { user_id: '123', display_name: 'John' };
const frontendData = snakeToCamel(dbData);
// Result: { userId: '123', displayName: 'John' }
```

##### camelToSnake(obj: T, options?: TransformOptions): Record<string, any>

Transforms camelCase object keys to snake_case.

```typescript
const frontendData = { userId: '123', displayName: 'John' };
const dbData = camelToSnake(frontendData);
// Result: { user_id: '123', display_name: 'John' }
```

##### transformers

Type-safe transformation functions for common entities.

```typescript
// Transform user data
const userData = { user_id: '123', display_name: 'John' };
const frontendUser = transformers.user.toFrontend(userData);
const supabaseUser = transformers.user.toSupabase(frontendUser);

// Transform community data
const communityData = { group_id: '456', group_name: 'Test' };
const frontendCommunity = transformers.community.toFrontend(communityData);
```

## Referral System

### UnifiedReferralService

Comprehensive referral system service that handles codes, rewards, and analytics.

```typescript
import { UnifiedReferralService } from '@/services/unifiedReferralService';
```

#### Methods

##### generateReferralCode(userId: string, options?: ReferralOptions): Promise<ReferralCode | null>

Generates a unique referral code for a user.

```typescript
const referralCode = await UnifiedReferralService.generateReferralCode(
  'user-id',
  {
    maxUses: 10,
    rewardAmount: 100,
    rewardType: 'points',
    expiresAt: '2024-12-31T23:59:59Z'
  }
);
```

##### useReferralCode(code: string, referredUserId: string): Promise<{ success: boolean; reward?: ReferralReward; error?: string }>

Validates and uses a referral code.

```typescript
const result = await UnifiedReferralService.useReferralCode(
  'ABC12345',
  'new-user-id'
);

if (result.success) {
  console.log('Referral code used successfully');
} else {
  console.error('Error:', result.error);
}
```

##### getUserReferralAnalytics(userId: string): Promise<ReferralAnalytics | null>

Gets referral analytics for a specific user.

```typescript
const analytics = await UnifiedReferralService.getUserReferralAnalytics('user-id');
console.log('Total referrals:', analytics?.total_referrals);
console.log('Conversion rate:', analytics?.conversion_rate);
```

## Hooks

### useLocation Hook

Manages user location and location-based features.

```typescript
import { useLocation } from '@/hooks/useLocation';

const { 
  currentLocation, 
  loading, 
  updateLocation, 
  getNearbyEvents 
} = useLocation();
```

#### Properties

- `currentLocation: Location | null` - Current user location
- `loading: boolean` - Loading state
- `updateLocation: (location: Location) => Promise<void>` - Update user location
- `getNearbyEvents: (radius?: number) => Promise<Event[]>` - Get nearby events

### usePoints Hook

Manages user points and leaderboard functionality.

```typescript
import { usePoints } from '@/hooks/usePoints';

const { 
  userPoints, 
  leaderboard, 
  addPoints, 
  refreshUserPoints 
} = usePoints();
```

#### Properties

- `userPoints: UserPoints | null` - Current user points
- `leaderboard: CommunityLeaderboardEntry[]` - Community leaderboard
- `addPoints: (points: number, type: PointTransactionType, referenceId?: string, referenceType?: string, description?: string) => Promise<boolean>` - Add points to user
- `refreshUserPoints: () => Promise<void>` - Refresh user points

## Components

### CommunityCard Component

Displays community information in both grid and list views.

```typescript
import { CommunityCard } from '@/components/community/CommunityCard';

<CommunityCard
  community={communityData}
  isMember={isMember}
  onJoin={handleJoin}
  joiningGroup={joiningGroup}
  viewMode="grid"
/>
```

#### Props

- `community: CommunityGroup` - Community data to display
- `isMember: boolean` - Whether current user is a member
- `onJoin: (groupId: string) => Promise<void>` - Join community handler
- `joiningGroup: string | null` - ID of group being joined (for loading state)
- `viewMode: 'grid' | 'list'` - Display mode

### CommunitySearch Component

Provides search and filtering functionality for communities.

```typescript
import { CommunitySearch } from '@/components/community/CommunitySearch';

<CommunitySearch
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  selectedCategory={selectedCategory}
  setSelectedCategory={setSelectedCategory}
  viewMode={viewMode}
  setViewMode={setViewMode}
  sortBy={sortBy}
  setSortBy={setSortBy}
  categories={categories}
/>
```

#### Props

- `searchQuery: string` - Current search query
- `setSearchQuery: (query: string) => void` - Search query setter
- `selectedCategory: string` - Selected category filter
- `setSelectedCategory: (category: string) => void` - Category setter
- `viewMode: 'grid' | 'list'` - Current view mode
- `setViewMode: (mode: 'grid' | 'list') => void` - View mode setter
- `sortBy: string` - Current sort option
- `setSortBy: (sort: string) => void` - Sort setter
- `categories: string[]` - Available categories

## Environment Variables

The application uses the following environment variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe Configuration (if using Stripe)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key

# Google News API (if using news features)
VITE_GOOGLE_NEWS_API_KEY=your-google-news-api-key

# Other API Keys
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Environment
NODE_ENV=development
```

## Error Codes

Common error codes and their meanings:

- `AUTH_ERROR` - Authentication related errors
- `NETWORK_ERROR` - Network connectivity issues
- `VALIDATION_ERROR` - Input validation errors
- `PERMISSION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT` - Rate limiting exceeded

## Best Practices

1. **Error Handling**: Always use the ErrorHandlingService for consistent error management
2. **Data Transformation**: Use the data transformation utilities for consistent naming conventions
3. **Type Safety**: Leverage TypeScript interfaces for better type safety
4. **Performance**: Use React.memo for expensive components
5. **Caching**: Implement proper caching strategies with React Query
6. **Security**: Never expose sensitive keys in client-side code

## Testing

The application includes comprehensive test suites:

- Unit tests for services and utilities
- Integration tests for components
- End-to-end tests for critical flows

Run tests with:

```bash
npm run test
npm run test:coverage
npm run test:ui
```
