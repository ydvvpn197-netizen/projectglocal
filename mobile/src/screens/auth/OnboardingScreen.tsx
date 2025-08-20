import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Pressable,
  useSafeAreaInsets,
} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

type OnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to The Glocal',
      description: 'Connect with your local community and discover what\'s happening around you.',
      icon: 'location-on',
    },
    {
      title: 'Find Local Events',
      description: 'Discover exciting events, meetups, and activities in your area.',
      icon: 'event',
    },
    {
      title: 'Join Communities',
      description: 'Connect with like-minded people and join local interest groups.',
      icon: 'people',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  const currentStepData = steps[currentStep];

  return (
    <Box flex={1} bg="white" pt={insets.top} pb={insets.bottom}>
      <VStack flex={1} px={6} space={8}>
        {/* Skip Button */}
        <HStack justifyContent="flex-end" mt={4}>
          <Pressable onPress={handleSkip}>
            <Text color="gray.500" fontSize="md">
              Skip
            </Text>
          </Pressable>
        </HStack>

        {/* Content */}
        <VStack flex={1} justifyContent="center" space={8}>
          {/* Icon */}
          <Box alignItems="center">
            <Box
              bg="primary.100"
              p={6}
              rounded="full"
              mb={6}>
              <Icon name={currentStepData.icon} size={60} color="#0088CC" />
            </Box>
          </Box>

          {/* Text */}
          <VStack space={4} alignItems="center">
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign="center">
              {currentStepData.title}
            </Text>
            <Text fontSize="md" color="gray.600" textAlign="center" px={4}>
              {currentStepData.description}
            </Text>
          </VStack>
        </VStack>

        {/* Bottom Section */}
        <VStack space={4} pb={4}>
          {/* Dots */}
          <HStack justifyContent="center" space={2}>
            {steps.map((_, index) => (
              <Box
                key={index}
                w={2}
                h={2}
                rounded="full"
                bg={index === currentStep ? 'primary.500' : 'gray.300'}
              />
            ))}
          </HStack>

          {/* Buttons */}
          <VStack space={3}>
            <Button size="lg" onPress={handleNext}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
            
            {currentStep < steps.length - 1 && (
              <Pressable onPress={handleSkip}>
                <Text color="gray.500" textAlign="center" fontSize="md">
                  Skip Introduction
                </Text>
              </Pressable>
            )}
          </VStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default OnboardingScreen;
