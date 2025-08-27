import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { memo } from 'react';

interface NotificationButtonProps {
  notifications?: number;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const NotificationButton = memo(({ 
  notifications = 0, 
  className = "",
  variant = "ghost",
  size = "sm",
  onClick
}: NotificationButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (user) {
      navigate('/notifications');
    } else {
      navigate('/signin');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`relative ${className}`}
      onClick={handleClick}
    >
      <Bell className="h-4 w-4" />
      {notifications > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {notifications > 99 ? '99+' : notifications}
        </Badge>
      )}
    </Button>
  );
});

NotificationButton.displayName = 'NotificationButton';
