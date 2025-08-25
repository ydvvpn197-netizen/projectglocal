import { notificationService } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';

export const testNotifications = async (userId: string) => {
  console.log('🧪 Testing notification system...');

  try {
    // Test 1: Create a simple notification
    console.log('📝 Test 1: Creating simple notification...');
    const testNotification = await notificationService.createNotification({
      user_id: userId,
      type: 'system_announcement',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      data: { test: true, timestamp: new Date().toISOString() }
    });
    console.log('✅ Test 1 passed:', testNotification);

    // Test 2: Create booking request notification
    console.log('📝 Test 2: Creating booking request notification...');
    await notificationService.createBookingRequestNotification(
      userId, // artist
      userId, // client (same user for testing)
      {
        id: 'test-booking-id',
        event_type: 'Wedding',
        event_date: new Date().toISOString(),
        event_location: 'Test Location',
        budget_min: 1000,
        budget_max: 2000
      }
    );
    console.log('✅ Test 2 passed: Booking request notification created');

    // Test 3: Create new follower notification
    console.log('📝 Test 3: Creating new follower notification...');
    await notificationService.createNewFollowerNotification(userId, userId);
    console.log('✅ Test 3 passed: New follower notification created');

    // Test 4: Create message request notification
    console.log('📝 Test 4: Creating message request notification...');
    await notificationService.createMessageRequestNotification(userId, userId, 'test-conversation-id');
    console.log('✅ Test 4 passed: Message request notification created');

    // Test 5: Create event reminder notification
    console.log('📝 Test 5: Creating event reminder notification...');
    await notificationService.createEventReminderNotification(userId, {
      id: 'test-event-id',
      title: 'Test Event',
      event_date: new Date().toISOString(),
      location_name: 'Test Venue'
    });
    console.log('✅ Test 5 passed: Event reminder notification created');

    // Test 6: Create discussion request notification
    console.log('📝 Test 6: Creating discussion request notification...');
    await notificationService.createDiscussionRequestNotification(userId, {
      id: 'test-discussion-id',
      title: 'Test Discussion'
    });
    console.log('✅ Test 6 passed: Discussion request notification created');

    // Test 7: Verify notifications were created
    console.log('📝 Test 7: Verifying notifications in database...');
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    console.log('✅ Test 7 passed: Found', notifications?.length, 'notifications');
    console.log('📋 Recent notifications:', notifications?.slice(0, 3).map(n => ({
      type: n.type,
      title: n.title,
      read: n.read,
      created_at: n.created_at
    })));

    // Test 8: Test marking as read
    if (notifications && notifications.length > 0) {
      console.log('📝 Test 8: Testing mark as read...');
      await notificationService.markAsRead(notifications[0].id, userId);
      console.log('✅ Test 8 passed: Notification marked as read');
    }

    // Test 9: Test unread count
    console.log('📝 Test 9: Testing unread count...');
    const unreadCount = await notificationService.getUnreadCount(userId);
    console.log('✅ Test 9 passed: Unread count is', unreadCount);

    console.log('🎉 All notification tests passed!');
    return {
      success: true,
      notificationsCreated: notifications?.length || 0,
      unreadCount
    };

  } catch (error) {
    console.error('❌ Notification test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const cleanupTestNotifications = async (userId: string) => {
  try {
    console.log('🧹 Cleaning up test notifications...');
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .like('title', 'Test%');

    if (error) {
      console.error('Error cleaning up test notifications:', error);
    } else {
      console.log('✅ Test notifications cleaned up');
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};
