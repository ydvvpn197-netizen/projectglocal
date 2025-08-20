import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Pressable,
  Avatar,
  Divider,
  useSafeAreaInsets,
} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../hooks/useAuth';

const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {user, logout} = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box flex={1} bg="gray.50" pt={insets.top}>
      <VStack flex={1} px={4} py={4}>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={4}>
          Profile
        </Text>
        
        <ScrollView flex={1}>
          <VStack space={4}>
            {/* User Info */}
            <Box bg="white" p={4} rounded="lg" shadow={1}>
              <HStack space={4} alignItems="center">
                <Avatar size="lg" bg="primary.500">
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <VStack flex={1}>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                    {user?.name || 'User'}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {user?.email || 'user@example.com'}
                  </Text>
                  {user?.location && (
                    <Text fontSize="sm" color="gray.600">
                      {user.location.city}, {user.location.country}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Box>

            {/* Settings */}
            <VStack space={2}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                Settings
              </Text>
              
              <Box bg="white" rounded="lg" shadow={1} overflow="hidden">
                {[
                  {icon: 'person', title: 'Edit Profile', action: () => {}},
                  {icon: 'notifications', title: 'Notifications', action: () => {}},
                  {icon: 'location-on', title: 'Location Settings', action: () => {}},
                  {icon: 'security', title: 'Privacy & Security', action: () => {}},
                  {icon: 'help', title: 'Help & Support', action: () => {}},
                  {icon: 'info', title: 'About', action: () => {}},
                ].map((item, index) => (
                  <Box key={item.title}>
                    <Pressable onPress={item.action}>
                      <HStack p={4} space={3} alignItems="center">
                        <Icon name={item.icon} size={20} color="#666" />
                        <Text fontSize="md" color="gray.800" flex={1}>
                          {item.title}
                        </Text>
                        <Icon name="chevron-right" size={20} color="#666" />
                      </HStack>
                    </Pressable>
                    {index < 5 && <Divider />}
                  </Box>
                ))}
              </Box>
            </VStack>

            {/* Logout */}
            <Pressable onPress={handleLogout}>
              <Box bg="red.50" p={4} rounded="lg" borderWidth={1} borderColor="red.200">
                <HStack space={3} alignItems="center" justifyContent="center">
                  <Icon name="logout" size={20} color="#e53e3e" />
                  <Text fontSize="md" color="red.600" fontWeight="medium">
                    Sign Out
                  </Text>
                </HStack>
              </Box>
            </Pressable>
          </VStack>
        </ScrollView>
      </VStack>
    </Box>
  );
};

export default ProfileScreen;
