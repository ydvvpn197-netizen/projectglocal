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
  Warning,
  Icon,
  Pressable,
  useToast,
} from 'native-base';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../../hooks/useAuth';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const {login, isLoading, error} = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login({email, password});
      toast.show({
        description: 'Login successful!',
        status: 'success',
      });
    } catch (error: any) {
      toast.show({
        description: error.message || 'Login failed',
        status: 'error',
      });
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <Box flex={1} bg="white" pt={insets.top} pb={insets.bottom}>
      <VStack flex={1} px={6} space={8}>
        {/* Header */}
        <VStack space={2} mt={8}>
          <Text fontSize="3xl" fontWeight="bold" color="primary.500">
            Welcome Back
          </Text>
          <Text fontSize="md" color="gray.600">
            Sign in to your account to continue
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

          <FormControl isInvalid={!!errors.password}>
            <FormControl.Label>Password</FormControl.Label>
            <Input
              size="lg"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              type={showPassword ? 'text' : 'password'}
              autoCapitalize="none"
              autoCorrect={false}
              InputLeftElement={
                <Icon name="lock" size={20} color="#666" style={{marginLeft: 12}} />
              }
              InputRightElement={
                <Pressable onPress={() => setShowPassword(!showPassword)} mr={3}>
                  <Icon
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#666"
                  />
                </Pressable>
              }
            />
            <FormControl.ErrorMessage>{errors.password}</FormControl.ErrorMessage>
          </FormControl>

          <Pressable onPress={handleForgotPassword} alignSelf="flex-end">
            <Text color="primary.500" fontSize="sm">
              Forgot Password?
            </Text>
          </Pressable>

          <Button
            size="lg"
            onPress={handleLogin}
            isLoading={isLoading}
            isLoadingText="Signing In..."
            mt={4}>
            Sign In
          </Button>
        </VStack>

        {/* Footer */}
        <VStack space={4} pb={4}>
          <HStack justifyContent="center" space={1}>
            <Text color="gray.600">Don't have an account?</Text>
            <Pressable onPress={handleRegister}>
              <Text color="primary.500" fontWeight="semibold">
                Sign Up
              </Text>
            </Pressable>
          </HStack>

          <Text textAlign="center" fontSize="xs" color="gray.500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default LoginScreen;
