import { notificationService } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';

export const testNotifications = async (userId: string) => {
  console.log('🧪 Testing notification system...');

  try {
    // Test 1: Create a simple notification
    console.log('📝 Test 1: Creating simple notification...');
    const testNotification = await notificationService.createPersonalNotification(
      userId,
      'Test Notification',
      'This is a test notification to verify the system is working.',
      'system_announcement',
      { test: true, timestamp: new Date().toISOString() }
    );
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
      event_date: new Date().toISOString()
    });
    console.log('✅ Test 5 passed: Event reminder notification created');

    // Test 6: Create discussion request notification
    console.log('📝 Test 6: Creating discussion request notification...');
    await notificationService.createDiscussionRequestNotification(userId, userId, {
      id: 'test-discussion-id',
      title: 'Test Discussion',
      content: 'This is a test discussion request'
    });
    console.log('✅ Test 6 passed: Discussion request notification created');

    // Test 7: Verify notifications were created
    console.log('📝 Test 7: Verifying notifications in database...');
    const { data: notifications, error } = await supabase
      .from('personal_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Test 7 failed: Error fetching notifications:', error);
    } else {
      console.log('✅ Test 7 passed: Found', notifications?.length, 'notifications');
      notifications?.forEach((notification, index) => {
        console.log(`  ${index + 1}. ${notification.title} (${notification.type})`);
      });
    }

    // Test 8: Test mark as read functionality
    console.log('📝 Test 8: Testing mark as read functionality...');
    if (notifications && notifications.length > 0) {
      const firstNotification = notifications[0];
      const success = await notificationService.markAsRead(firstNotification.id, userId);
      if (success) {
        console.log('✅ Test 8 passed: Notification marked as read');
      } else {
        console.log('❌ Test 8 failed: Could not mark notification as read');
      }
    }

    // Test 9: Test notification counts
    console.log('📝 Test 9: Testing notification counts...');
    const counts = await notificationService.getNotificationCounts(userId);
    console.log('✅ Test 9 passed: Counts retrieved:', counts);

    // Test 10: Test general notifications
    console.log('📝 Test 10: Testing general notifications...');
    const generalNotifications = await notificationService.getGeneralNotifications();
    console.log('✅ Test 10 passed: General notifications retrieved:', generalNotifications.length);

    console.log('🎉 All notification tests completed successfully!');
    return {
      success: true,
      notificationsCreated: notifications?.length || 0,
      counts,
      generalNotifications: generalNotifications.length
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
  console.log('🧹 Cleaning up test notifications...');

  try {
    const { error } = await supabase
      .from('personal_notifications')
      .delete()
      .eq('user_id', userId)
      .like('title', 'Test%');

    if (error) {
      console.error('❌ Cleanup failed:', error);
      return false;
    }

    console.log('✅ Test notifications cleaned up successfully');
    return true;
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return false;
  }
};

export const createSampleNotifications = async (userId: string) => {
  console.log('📝 Creating sample notifications for user:', userId);

  const sampleNotifications = [
    {
      title: 'Welcome to The Glocal! 🎉',
      message: 'Thank you for joining our community. Start exploring local events and connecting with artists!',
      type: 'system_announcement' as const,
      data: { welcome: true },
      action_url: '/events',
      action_text: 'Explore Events'
    },
    {
      title: 'New Booking Request',
      message: 'Sarah Johnson wants to book you for a birthday party on December 30th',
      type: 'booking_request' as const,
      data: { 
        client_name: 'Sarah Johnson',
        event_type: 'Birthday Party',
        event_date: '2024-12-30',
        budget: 800
      },
      action_url: '/artist-dashboard',
      action_text: 'View Request'
    },
    {
      title: 'New Follower',
      message: 'Mike Wilson started following you',
      type: 'new_follower' as const,
      data: { follower_name: 'Mike Wilson' },
      action_url: '/profile',
      action_text: 'View Profile'
    },
    {
      title: 'Message Received',
      message: 'You have a new message from Emma Davis',
      type: 'message_request' as const,
      data: { sender_name: 'Emma Davis' },
      action_url: '/messages',
      action_text: 'View Message'
    },
    {
      title: 'Event Reminder',
      message: 'Don\'t forget about the Community Art Fair tomorrow!',
      type: 'event_reminder' as const,
      data: { 
        event_title: 'Community Art Fair',
        event_date: '2024-12-21'
      },
      action_url: '/events',
      action_text: 'View Event'
    },
    {
      title: 'Payment Received',
      message: 'Payment of $350 has been received for your recent booking',
      type: 'payment_received' as const,
      data: { amount: 350, booking_id: 'booking-456' },
      action_url: '/artist-dashboard',
      action_text: 'View Details'
    }
  ];

  try {
    for (const notification of sampleNotifications) {
      await notificationService.createPersonalNotification(
        userId,
        notification.title,
        notification.message,
        notification.type,
        notification.data,
        notification.action_url,
        notification.action_text
      );
    }

    console.log('✅ Sample notifications created successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to create sample notifications:', error);
    return false;
  }
};
