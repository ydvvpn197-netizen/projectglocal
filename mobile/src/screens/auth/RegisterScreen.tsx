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
import {useAuth} from '../../hooks/useAuth';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const {register, isLoading} = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!name) {
      newErrors.name = 'Name is required';
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register({name, email, password});
      toast.show({
        description: 'Registration successful!',
        status: 'success',
      });
    } catch (error: any) {
      toast.show({
        description: error.message || 'Registration failed',
        status: 'error',
      });
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <Box flex={1} bg="white" pt={insets.top} pb={insets.bottom}>
      <VStack flex={1} px={6} space={8}>
        {/* Header */}
        <VStack space={2} mt={8}>
          <Text fontSize="3xl" fontWeight="bold" color="primary.500">
            Create Account
          </Text>
          <Text fontSize="md" color="gray.600">
            Join your local community today
          </Text>
        </VStack>

        {/* Form */}
        <VStack space={4} flex={1}>
          <FormControl isInvalid={!!errors.name}>
            <FormControl.Label>Full Name</FormControl.Label>
            <Input
              size="lg"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              InputLeftElement={
                <Icon name="person" size={20} color="#666" style={{marginLeft: 12}} />
              }
            />
            <FormControl.ErrorMessage>{errors.name}</FormControl.ErrorMessage>
          </FormControl>

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
              placeholder="Create a password"
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

          <FormControl isInvalid={!!errors.confirmPassword}>
            <FormControl.Label>Confirm Password</FormControl.Label>
            <Input
              size="lg"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              type={showConfirmPassword ? 'text' : 'password'}
              autoCapitalize="none"
              autoCorrect={false}
              InputLeftElement={
                <Icon name="lock" size={20} color="#666" style={{marginLeft: 12}} />
              }
              InputRightElement={
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} mr={3}>
                  <Icon
                    name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#666"
                  />
                </Pressable>
              }
            />
            <FormControl.ErrorMessage>{errors.confirmPassword}</FormControl.ErrorMessage>
          </FormControl>

          <Button
            size="lg"
            onPress={handleRegister}
            isLoading={isLoading}
            isLoadingText="Creating Account..."
            mt={4}>
            Create Account
          </Button>
        </VStack>

        {/* Footer */}
        <VStack space={4} pb={4}>
          <HStack justifyContent="center" space={1}>
            <Text color="gray.600">Already have an account?</Text>
            <Pressable onPress={handleLogin}>
              <Text color="primary.500" fontWeight="semibold">
                Sign In
              </Text>
            </Pressable>
          </HStack>

          <Text textAlign="center" fontSize="xs" color="gray.500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default RegisterScreen;
