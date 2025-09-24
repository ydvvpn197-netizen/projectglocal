import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const TestNotificationButton = () => {
  const { createNotification } = useNotifications();
  const { user } = useAuth();
  const { toast } = useToast();

  const createTestNotifications = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to test notifications",
        variant: "destructive",
      });
      return;
    }

    try {
      const testNotifications = [
        {
          user_id: user.id,
          type: 'new_follower' as const,
          title: 'New Follower',
          message: 'John Doe started following you!',
          data: { follower_id: 'test-follower-1' }
        },
        {
          user_id: user.id,
          type: 'event_reminder' as const,
          title: 'Event Reminder',
          message: 'Your event "Community Art Walk" starts in 2 hours',
          data: { event_id: 'test-event-1' }
        },
        {
          user_id: user.id,
          type: 'booking_request' as const,
          title: 'New Booking Request',
          message: 'You have a new booking request for a wedding event',
          data: { booking_id: 'test-booking-1' }
        },
        {
          user_id: user.id,
          type: 'message_request' as const,
          title: 'New Message',
          message: 'You have a new message from Sarah Johnson',
          data: { conversation_id: 'test-conversation-1' }
        },
        {
          user_id: user.id,
          type: 'system_announcement' as const,
          title: 'System Update',
          message: 'We\'ve added new features to improve your experience!',
          data: { announcement_id: 'test-announcement-1' }
        }
      ];

      for (const notification of testNotifications) {
        await createNotification(notification);
      }

      toast({
        title: "Test notifications created!",
        description: "Check your notification bell to see the new notifications.",
      });
    } catch (error) {
      console.error('Error creating test notifications:', error);
      toast({
        title: "Error",
        description: "Failed to create test notifications",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={createTestNotifications}
      variant="outline"
      size="sm"
      className="text-xs"
    >
      Create Test Notifications
    </Button>
  );
};
