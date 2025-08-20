import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Input,
  Pressable,
  useSafeAreaInsets,
} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DiscoverScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Box flex={1} bg="gray.50" pt={insets.top}>
      <VStack flex={1} px={4} py={4}>
        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={4}>
          Discover
        </Text>
        
        <Input
          placeholder="Search for events, groups, or people..."
          size="lg"
          mb={4}
          InputLeftElement={
            <Icon name="search" size={20} color="#666" style={{marginLeft: 12}} />
          }
        />

        <ScrollView flex={1}>
          <VStack space={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              Popular Categories
            </Text>
            
            {/* Categories */}
            <VStack space={3}>
              {['Events', 'Groups', 'Local News', 'Artists', 'Restaurants'].map((category) => (
                <Pressable key={category}>
                  <Box bg="white" p={4} rounded="lg" shadow={1}>
                    <Text fontSize="md" fontWeight="medium" color="gray.800">
                      {category}
                    </Text>
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

export default DiscoverScreen;
