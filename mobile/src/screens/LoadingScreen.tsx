import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Box, Spinner, Text, VStack} from 'native-base';

const LoadingScreen: React.FC = () => {
  return (
    <Box flex={1} bg="white" justifyContent="center" alignItems="center">
      <VStack space={4} alignItems="center">
        <Spinner size="lg" color="primary.500" />
        <Text fontSize="lg" color="gray.600">
          Loading The Glocal...
        </Text>
        <Text fontSize="sm" color="gray.500">
          Connecting to your local community
        </Text>
      </VStack>
    </Box>
  );
};

export default LoadingScreen;
