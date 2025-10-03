import React, { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TestNotificationButton: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleNotifications = () => {
    setUnreadCount(prev => prev === 0 ? 5 : 0);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      onClick={toggleNotifications}
    >
      {unreadCount > 0 ? (
        <BellRing className="h-5 w-5" />
      ) : (
        <Bell className="h-5 w-5" />
      )}
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export { TestNotificationButton };
