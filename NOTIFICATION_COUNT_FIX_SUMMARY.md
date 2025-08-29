# Notification Count Mismatch Fix

## Issue Description
The notification system was showing a count of 4 general notifications in the "General" tab, but the content area was empty (only showing a grey megaphone icon). This created a mismatch between the displayed count and the actual notifications shown.

## Root Cause
The issue was in the `getGeneralNotifications` method in `src/services/notificationService.ts`. The method was returning an empty array for all users:

```typescript
async getGeneralNotifications(limit = 10): Promise<GeneralNotification[]> {
  // Return empty array for non-authenticated users
  return [];
}
```

However, the `getNotificationCounts` method was correctly counting the general notifications from the database (4 active notifications), creating a mismatch between the count and the displayed content.

## Fix Implemented

### 1. Fixed getGeneralNotifications Method
Updated the method to properly fetch general notifications from the database:

```typescript
async getGeneralNotifications(limit = 10): Promise<GeneralNotification[]> {
  try {
    const isAvailable = await this.checkDatabaseAvailability();
    if (!isAvailable) {
      return fallbackGeneralNotifications;
    }

    const { data, error } = await supabase
      .from('general_notifications')
      .select('*')
      .eq('is_active', true)
      .lte('created_at', new Date().toISOString())
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Error fetching general notifications:', error);
      return fallbackGeneralNotifications;
    }

    return data || fallbackGeneralNotifications;
  } catch (error) {
    console.warn('Error fetching general notifications:', error);
    return fallbackGeneralNotifications;
  }
}
```

### 2. Added createNotification Method
Added the missing `createNotification` method to the notification service to support test notifications:

```typescript
async createNotification(notificationData: {
  user_id: string;
  type: PersonalNotification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
  action_url?: string;
  action_text?: string;
}): Promise<string | null> {
  return this.createPersonalNotification(
    notificationData.user_id,
    notificationData.title,
    notificationData.message,
    notificationData.type,
    notificationData.data,
    notificationData.action_url,
    notificationData.action_text
  );
}
```

### 3. Updated useNotifications Hook
Added the `createNotification` method to the hook's return object to support the test notification button:

```typescript
// Create a new notification
const createNotification = useCallback(async (notificationData: {
  user_id: string;
  type: any;
  title: string;
  message: string;
  data?: Record<string, any>;
  action_url?: string;
  action_text?: string;
}) => {
  if (!user?.id) {
    console.warn('Cannot create notification: user not logged in');
    return;
  }

  try {
    const notificationId = await notificationService.createNotification(notificationData);
    if (notificationId) {
      // Refresh notifications to show the new one
      await loadNotifications();
      return notificationId;
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}, [user?.id, loadNotifications]);
```

## Database State
- **General Notifications**: 4 active notifications in the database
- **Personal Notifications**: 0 unread notifications
- **Total Count**: 4 notifications (all general)

## Expected Result
After the fix:
1. The "General (4)" tab should now display the 4 general notifications
2. The notification count should match the displayed content
3. The test notification button should work properly
4. General notifications should be visible to authenticated users

## Files Modified
1. `src/services/notificationService.ts` - Fixed getGeneralNotifications method and added createNotification
2. `src/hooks/useNotifications.tsx` - Added createNotification method to the hook

## Testing
The fix ensures that:
- General notifications are properly fetched from the database
- The count matches the displayed content
- Test notifications can be created using the "Create Test Notifications" button
- Fallback notifications are used when the database is unavailable
