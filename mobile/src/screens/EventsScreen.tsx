import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Pressable,
  Badge,
  useSafeAreaInsets,
} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EventsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Box flex={1} bg="gray.50" pt={insets.top}>
      <VStack flex={1} px={4} py={4}>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={4}>
          Events
        </Text>
        
        <ScrollView flex={1}>
          <VStack space={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              Upcoming Events
            </Text>
            
            {/* Sample Events */}
            <VStack space={3}>
              {[
                {
                  title: 'Local Music Festival',
                  date: 'Tomorrow',
                  time: '7:00 PM',
                  location: 'Central Park',
                  attendees: 45,
                  category: 'Music',
                },
                {
                  title: 'Food Truck Rally',
                  date: 'This Weekend',
                  time: '12:00 PM',
                  location: 'Downtown Square',
                  attendees: 120,
                  category: 'Food',
                },
                {
                  title: 'Art Exhibition',
                  date: 'Next Week',
                  time: '6:00 PM',
                  location: 'City Gallery',
                  attendees: 78,
                  category: 'Arts',
                },
              ].map((event) => (
                <Pressable key={event.title}>
                  <Box bg="white" p={4} rounded="lg" shadow={1}>
                    <VStack space={2}>
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="md" fontWeight="semibold" color="gray.800">
                          {event.title}
                        </Text>
                        <Badge colorScheme="primary" variant="subtle">
                          {event.category}
                        </Badge>
                      </HStack>
                      
                      <HStack space={4} alignItems="center">
                        <HStack space={1} alignItems="center">
                          <Icon name="event" size={16} color="#666" />
                          <Text fontSize="sm" color="gray.600">
                            {event.date} at {event.time}
                          </Text>
                        </HStack>
                      </HStack>
                      
                      <HStack space={4} alignItems="center">
                        <HStack space={1} alignItems="center">
                          <Icon name="location-on" size={16} color="#666" />
                          <Text fontSize="sm" color="gray.600">
                            {event.location}
                          </Text>
                        </HStack>
                        <HStack space={1} alignItems="center">
                          <Icon name="people" size={16} color="#666" />
                          <Text fontSize="sm" color="gray.600">
                            {event.attendees} attending
                          </Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  </Box>
                </Pressable>
              ))}
            </VStack>
          </VStack>
        </ScrollView>
      </VStack>
    </Box>
  );
};

export default EventsScreen;
