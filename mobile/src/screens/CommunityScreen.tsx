import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Pressable,
  Avatar,
  Badge,
  useSafeAreaInsets,
} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CommunityScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Box flex={1} bg="gray.50" pt={insets.top}>
      <VStack flex={1} px={4} py={4}>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={4}>
          Community
        </Text>
        
        <ScrollView flex={1}>
          <VStack space={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              Your Groups
            </Text>
            
            {/* Sample Groups */}
            <VStack space={3}>
              {[
                {name: 'Local Foodies', members: 156, category: 'Food'},
                {name: 'City Runners', members: 89, category: 'Sports'},
                {name: 'Art Enthusiasts', members: 234, category: 'Arts'},
              ].map((group) => (
                <Pressable key={group.name}>
                  <Box bg="white" p={4} rounded="lg" shadow={1}>
                    <HStack space={3} alignItems="center">
                      <Avatar size="md" bg="primary.500">
                        {group.name.charAt(0)}
                      </Avatar>
                      <VStack flex={1}>
                        <Text fontSize="md" fontWeight="semibold" color="gray.800">
                          {group.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {group.members} members
                        </Text>
                      </VStack>
                      <Badge colorScheme="primary" variant="subtle">
                        {group.category}
                      </Badge>
                    </HStack>
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

export default CommunityScreen;
