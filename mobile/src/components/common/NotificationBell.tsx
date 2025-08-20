import React from 'react';
import {Box, Badge} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface NotificationBellProps {
  unreadCount: number;
  onPress?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({unreadCount, onPress}) => {
  return (
    <Box position="relative">
      <Icon name="notifications" size={24} color="#666" />
      {unreadCount > 0 && (
        <Badge
          colorScheme="red"
          variant="solid"
          position="absolute"
          top={-2}
          right={-2}
          minW={4}
          h={4}
          rounded="full"
          fontSize="xs">
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Box>
  );
};

export default NotificationBell;
