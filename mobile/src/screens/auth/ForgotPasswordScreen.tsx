import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  FormControl,
  Pressable,
  useToast,
} from 'native-base';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Implement password reset API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast.show({
        description: 'Password reset email sent!',
        status: 'success',
      });
      
      navigation.navigate('Login');
    } catch (error: any) {
      toast.show({
        description: error.message || 'Failed to send reset email',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <Box flex={1} bg="white" pt={insets.top} pb={insets.bottom}>
      <VStack flex={1} px={6} space={8}>
        {/* Header */}
        <VStack space={2} mt={8}>
          <Text fontSize="3xl" fontWeight="bold" color="primary.500">
            Reset Password
          </Text>
          <Text fontSize="md" color="gray.600">
            Enter your email to receive a password reset link
          </Text>
        </VStack>

        {/* Form */}
        <VStack space={4} flex={1}>
          <FormControl isInvalid={!!errors.email}>
            <FormControl.Label>Email</FormControl.Label>
            <Input
              size="lg"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              InputLeftElement={
                <Icon name="email" size={20} color="#666" style={{marginLeft: 12}} />
              }
            />
            <FormControl.ErrorMessage>{errors.email}</FormControl.ErrorMessage>
          </FormControl>

          <Button
            size="lg"
            onPress={handleResetPassword}
            isLoading={isLoading}
            isLoadingText="Sending Reset Link..."
            mt={4}>
            Send Reset Link
          </Button>
        </VStack>

        {/* Footer */}
        <VStack space={4} pb={4}>
          <HStack justifyContent="center" space={1}>
            <Text color="gray.600">Remember your password?</Text>
            <Pressable onPress={handleBackToLogin}>
              <Text color="primary.500" fontWeight="semibold">
                Sign In
              </Text>
            </Pressable>
          </HStack>

          <Text textAlign="center" fontSize="xs" color="gray.500">
            We'll send you an email with instructions to reset your password
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default ForgotPasswordScreen;
