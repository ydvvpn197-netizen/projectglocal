# Dynamic Stats Implementation

## Overview

The landing page dashboard now features real-time, dynamic statistics that automatically update every 30 seconds. The stats display actual data from the database and show daily percentage changes.

## Features

### Real-Time Data
- **Active Users**: Count of users with activity in the last 30 days
- **Events Created**: Total number of events in the platform
- **Communities**: Total number of community groups
- **Artists**: Total number of registered artists

### Daily Percentage Changes
- Calculates percentage change from yesterday to today
- Shows positive changes in green with upward arrow
- Shows negative changes in red with downward arrow
- Updates automatically every 30 seconds

### Visual Enhancements
- Loading states with spinning icons
- Smooth animations using Framer Motion
- Responsive grid layout
- Last updated timestamp
- Error handling with user-friendly messages

## Implementation Details

### Files Created/Modified

1. **`src/services/platformAnalyticsService.ts`**
   - New service for fetching real-time platform statistics
   - Handles database queries for active users, events, communities, and artists
   - Calculates daily percentage changes
   - Provides formatting utilities

2. **`src/hooks/useDashboardStats.ts`**
   - Custom React hook for managing dashboard statistics
   - Handles automatic refresh every 30 seconds
   - Manages loading states and error handling
   - Provides manual refresh functionality

3. **`src/components/DynamicStats.tsx`**
   - Reusable component for displaying dynamic statistics
   - Handles loading states and animations
   - Configurable refresh interval
   - Optional refresh button

4. **`src/pages/EnhancedIndex.tsx`**
   - Updated to use DynamicStats component
   - Removed static stats data
   - Added import for DynamicStats

### Database Queries

The service performs the following database operations:

1. **Active Users**: Counts unique users who have created posts, events, or discussions in the last 30 days
2. **Events**: Counts total events from the `events` table
3. **Communities**: Counts total groups from the `groups` table
4. **Artists**: Counts total artists from the `artists` table

### Performance Optimizations

- Uses `count: 'exact', head: true` for efficient counting
- Parallel queries using `Promise.all`
- Automatic refresh with configurable intervals
- Error handling to prevent crashes

## Usage

### Basic Usage
```tsx
import { DynamicStats } from '@/components/DynamicStats';

<DynamicStats />
```

### With Custom Refresh Interval
```tsx
<DynamicStats refreshInterval={60000} /> // Refresh every minute
```

### With Refresh Button
```tsx
<DynamicStats showRefreshButton={true} />
```

## Configuration

### Refresh Interval
- Default: 30 seconds (30000ms)
- Configurable via `refreshInterval` prop
- Minimum recommended: 10 seconds

### Error Handling
- Graceful fallback to default values
- User-friendly error messages
- Automatic retry on next refresh cycle

## Testing

A test suite is included in `src/services/__tests__/platformAnalyticsService.test.ts` that covers:
- Number formatting
- Percentage change formatting
- Dashboard stats structure validation

## Future Enhancements

1. **Caching**: Implement Redis caching for better performance
2. **Real-time Updates**: Use Supabase real-time subscriptions
3. **Historical Data**: Add charts showing trends over time
4. **Custom Metrics**: Allow admins to configure additional metrics
5. **Geographic Filtering**: Show stats by location/region

## Troubleshooting

### Common Issues

1. **Stats not updating**: Check database connectivity and RLS policies
2. **High refresh rate**: Adjust `refreshInterval` to reduce database load
3. **Loading states**: Ensure proper error handling in the service

### Debug Mode

Enable debug logging by adding to the service:
```typescript
console.log('Dashboard stats:', stats);
```

## Database Requirements

Ensure the following tables exist and have proper RLS policies:
- `profiles`
- `posts`
- `events`
- `discussions`
- `groups`
- `artists`

## Security Considerations

- All database queries respect RLS policies
- No sensitive user data is exposed
- Only aggregate counts are returned
- Error messages don't leak internal details
