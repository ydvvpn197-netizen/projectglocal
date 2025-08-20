import React, {useEffect, useState} from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Avatar,
  Badge,
  useToast,
} from 'native-base';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {RootState} from '../store';
import {useLocation} from '../hooks/useLocation';
import {useAuth} from '../hooks/useAuth';
import FeedItem from '../components/feed/FeedItem';
import LocationToggle from '../components/location/LocationToggle';
import NotificationBell from '../components/common/NotificationBell';

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const {user} = useAuth();
  const {currentLocation} = useLocation();
  const {items: feedItems, isLoading} = useSelector((state: RootState) => state.feed);
  const {unreadCount} = useSelector((state: RootState) => state.notifications);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load initial feed data
    loadFeedData();
  }, [currentLocation]);

  const loadFeedData = async () => {
    // TODO: Implement feed data loading
    console.log('Loading feed data...');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadFeedData();
    } catch (error) {
      toast.show({
        description: 'Failed to refresh feed',
        status: 'error',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLocationToggle = () => {
    // TODO: Implement location toggle
    console.log('Location toggle pressed');
  };

  const handleNotificationPress = () => {
    // TODO: Navigate to notifications
    console.log('Notification bell pressed');
  };

  return (
    <Box flex={1} bg="gray.50" pt={insets.top}>
      {/* Header */}
      <Box bg="white" px={4} py={3} borderBottomWidth={1} borderBottomColor="gray.200">
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              The Glocal
            </Text>
            <HStack space={2} alignItems="center">
              <LocationToggle onToggle={handleLocationToggle} />
              {currentLocation && (
                <Text fontSize="sm" color="gray.600">
                  {currentLocation.city}, {currentLocation.country}
                </Text>
              )}
            </HStack>
          </VStack>
          <HStack space={3} alignItems="center">
            <Pressable onPress={handleNotificationPress}>
              <NotificationBell unreadCount={unreadCount} />
            </Pressable>
            <Pressable>
              <Avatar size="sm" bg="primary.500">
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </Pressable>
          </HStack>
        </HStack>
      </Box>

      {/* Content */}
      <ScrollView
        flex={1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <VStack space={4} p={4}>
          {/* Welcome Section */}
          <Box bg="white" p={4} rounded="lg" shadow={1}>
            <VStack space={2}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                Welcome back, {user?.name || 'User'}!
              </Text>
              <Text fontSize="sm" color="gray.600">
                Discover what's happening in your local community today.
              </Text>
            </VStack>
          </Box>

          {/* Quick Actions */}
          <Box bg="white" p={4} rounded="lg" shadow={1}>
            <Text fontSize="md" fontWeight="semibold" color="gray.800" mb={3}>
              Quick Actions
            </Text>
            <HStack space={3} justifyContent="space-around">
              <Pressable flex={1} bg="primary.50" p={3} rounded="md" alignItems="center">
                <Text fontSize="sm" fontWeight="medium" color="primary.600">
                  Find Events
                </Text>
              </Pressable>
              <Pressable flex={1} bg="secondary.50" p={3} rounded="md" alignItems="center">
                <Text fontSize="sm" fontWeight="medium" color="secondary.600">
                  Join Groups
                </Text>
              </Pressable>
              <Pressable flex={1} bg="green.50" p={3} rounded="md" alignItems="center">
                <Text fontSize="sm" fontWeight="medium" color="green.600">
                  Local News
                </Text>
              </Pressable>
            </HStack>
          </Box>

          {/* Feed Section */}
          <Box>
            <HStack justifyContent="space-between" alignItems="center" mb={3}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                Local Feed
              </Text>
              <Badge colorScheme="primary" variant="subtle">
                {feedItems.length} items
              </Badge>
            </HStack>

            {isLoading && feedItems.length === 0 ? (
              <Box bg="white" p={8} rounded="lg" shadow={1} alignItems="center">
                <Text color="gray.500">Loading feed...</Text>
              </Box>
            ) : feedItems.length === 0 ? (
              <Box bg="white" p={8} rounded="lg" shadow={1} alignItems="center">
                <Text color="gray.500">No feed items available</Text>
                <Text fontSize="sm" color="gray.400" mt={1}>
                  Check back later for updates
                </Text>
              </Box>
            ) : (
              <VStack space={3}>
                {feedItems.map((item) => (
                  <FeedItem key={item.id} item={item} />
                ))}
              </VStack>
            )}
          </Box>
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default HomeScreen;
