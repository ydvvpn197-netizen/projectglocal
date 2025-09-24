# Notification System Documentation

## Overview

The notification system in TheGlocal project provides real-time, reliable notifications for both authenticated and non-authenticated users. It includes comprehensive testing, health monitoring, and performance optimization features.

## Architecture

### Core Components

1. **NotificationService** (`src/services/notificationService.ts`)
   - Main service class handling all notification operations
   - Includes caching, retry mechanisms, and error handling
   - Supports both personal and general notifications

2. **useNotifications Hook** (`src/hooks/useNotifications.tsx`)
   - React hook for managing notification state
   - Handles real-time subscriptions and state updates
   - Provides actions for CRUD operations

3. **NotificationBell Component** (`src/components/NotificationBell.tsx`)
   - UI component for displaying notifications
   - Includes tabs for different notification types
   - Real-time updates and user interactions

4. **Health Check System** (`src/services/notificationHealthCheck.ts`)
   - Comprehensive system health monitoring
   - Performance metrics and recommendations
   - Automated periodic checks

5. **Test Suite** (`src/components/NotificationSystemTest.tsx`)
   - End-to-end testing interface
   - Real-time monitoring dashboard
   - Performance benchmarking

## Database Schema

### Tables

#### `general_notifications`
- Public notifications visible to all users
- Includes expiration dates and target audiences
- Supports different priority levels

#### `personal_notifications`
- User-specific notifications
- Includes read status and action URLs
- Supports rich metadata

### Indexes
- Optimized for user queries and read status
- Performance indexes on creation dates
- Type-based filtering indexes

## Features

### Real-time Notifications
- **Supabase Realtime Integration**: Live updates using PostgreSQL changes
- **Connection Management**: Automatic reconnection and error handling
- **Event Filtering**: User-specific and general notification streams

### Performance Optimizations
- **Caching**: 30-second TTL cache for frequently accessed data
- **Retry Mechanism**: Exponential backoff for failed operations
- **Batch Operations**: Efficient database queries
- **Connection Pooling**: Optimized Supabase client usage

### Error Handling
- **Graceful Degradation**: Fallback notifications when database unavailable
- **User Feedback**: Clear error messages and loading states
- **Logging**: Comprehensive error tracking and debugging

### Security
- **Row Level Security (RLS)**: Database-level access control
- **User Isolation**: Users can only access their own notifications
- **Input Validation**: Type-safe notification creation

## Usage

### Basic Notification Operations

```typescript
import { notificationService } from '@/services/notificationService';

// Create a personal notification
const notificationId = await notificationService.createPersonalNotification(
  userId,
  'New Message',
  'You have received a new message',
  'message_request',
  { conversationId: '123' },
  '/messages',
  'View Message'
);

// Get user notifications
const notifications = await notificationService.getPersonalNotifications(userId);

// Mark as read
await notificationService.markAsRead(notificationId, userId);
```

### Using the React Hook

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    personalNotifications,
    generalNotifications,
    counts,
    markAsRead,
    deleteNotification,
    loading,
    error
  } = useNotifications();

  return (
    <div>
      {counts.total > 0 && (
        <div>You have {counts.total} notifications</div>
      )}
      {/* Render notifications */}
    </div>
  );
}
```

### Real-time Subscriptions

```typescript
// The hook automatically sets up real-time subscriptions
// No additional code needed - notifications update automatically
```

## Testing

### Test Suite Access
Navigate to `/test-notifications` (requires authentication) to access the comprehensive test suite.

### Test Categories
1. **Database Connection**: Verifies database connectivity
2. **Notification Creation**: Tests CRUD operations
3. **Real-time Functionality**: Validates live updates
4. **Performance**: Benchmarks response times
5. **Error Handling**: Tests failure scenarios

### Health Monitoring
- **System Health Check**: Comprehensive system status
- **Performance Metrics**: Response time monitoring
- **Recommendations**: Automated optimization suggestions

## Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
Run the migration file to set up notification tables:
```sql
-- See: supabase/migrations/20241220000000_create_notification_tables.sql
```

## Performance Metrics

### Target Performance
- **Database Queries**: < 200ms
- **Real-time Updates**: < 100ms
- **Cache Hit Rate**: > 80%
- **Error Rate**: < 1%

### Monitoring
- Real-time performance dashboard
- Automated health checks every minute
- Performance alerts and recommendations

## Troubleshooting

### Common Issues

#### Real-time Notifications Not Working
1. Check Supabase real-time configuration
2. Verify network connectivity
3. Check browser console for errors
4. Run health check for detailed diagnostics

#### Slow Performance
1. Check database indexes
2. Monitor cache hit rates
3. Review query performance
4. Consider increasing cache TTL

#### Database Errors
1. Verify table structure
2. Check RLS policies
3. Validate user permissions
4. Review error logs

### Debug Tools
- **Health Check**: `/test-notifications` → Health Check button
- **Real-time Monitor**: Live event stream in test interface
- **Performance Metrics**: Detailed timing information
- **Error Logs**: Comprehensive error tracking

## Best Practices

### Development
1. Always use the `useNotifications` hook for UI components
2. Test real-time functionality in development
3. Use the test suite for validation
4. Monitor performance metrics

### Production
1. Enable periodic health checks
2. Monitor error rates and performance
3. Set up alerts for system degradation
4. Regular database maintenance

### Security
1. Never bypass RLS policies
2. Validate all user inputs
3. Use proper error handling
4. Regular security audits

## API Reference

### NotificationService Methods

#### `getGeneralNotifications(limit?: number)`
Returns general notifications visible to all users.

#### `getPersonalNotifications(userId: string, limit?: number)`
Returns personal notifications for a specific user.

#### `getNotificationCounts(userId?: string)`
Returns unread notification counts.

#### `markAsRead(notificationId: string, userId: string)`
Marks a notification as read.

#### `deleteNotification(notificationId: string, userId: string)`
Deletes a notification.

#### `createPersonalNotification(...)`
Creates a new personal notification.

#### `subscribeToNotifications(userId: string, callback: Function)`
Sets up real-time subscriptions.

### useNotifications Hook

#### State
- `personalNotifications`: Array of personal notifications
- `generalNotifications`: Array of general notifications
- `counts`: Notification counts object
- `loading`: Loading state
- `error`: Error state

#### Actions
- `markAsRead(id: string)`: Mark notification as read
- `deleteNotification(id: string)`: Delete notification
- `refresh()`: Refresh all notifications
- `refreshCounts()`: Refresh counts only

## Contributing

### Adding New Notification Types
1. Update the `PersonalNotification` interface
2. Add the type to the database constraint
3. Update the notification service methods
4. Add appropriate icons and routing
5. Update tests

### Performance Improvements
1. Profile the current implementation
2. Identify bottlenecks
3. Implement optimizations
4. Test thoroughly
5. Monitor in production

## Support

For issues or questions:
1. Check the health check results
2. Review the test suite output
3. Check browser console for errors
4. Review this documentation
5. Contact the development team

---

*Last updated: December 2024*
*Version: 1.0.0*
