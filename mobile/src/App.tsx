import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {NativeBaseProvider, extendTheme} from 'native-base';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {store} from './store';
import AppNavigator from './navigation/AppNavigator';
import {AuthProvider} from './hooks/useAuth';
import {LocationProvider} from './hooks/useLocation';
import {NotificationProvider} from './hooks/useNotifications';
import {OfflineProvider} from './hooks/useOffline';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Extend the theme
const theme = extendTheme({
  colors: {
    primary: {
      50: '#E3F2F9',
      100: '#C5E4F3',
      200: '#A2D4EC',
      300: '#7AC1E4',
      400: '#47A9DA',
      500: '#0088CC', // Primary brand color
      600: '#007AB8',
      700: '#006BA1',
      800: '#005885',
      900: '#003F5E',
    },
    secondary: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      200: '#BAE6FD',
      300: '#7DD3FC',
      400: '#38BDF8',
      500: '#0EA5E9',
      600: '#0284C7',
      700: '#0369A1',
      800: '#075985',
      900: '#0C4A6E',
    },
  },
  config: {
    initialColorMode: 'light',
  },
});

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <NativeBaseProvider theme={theme}>
            <SafeAreaProvider>
              <AuthProvider>
                <LocationProvider>
                  <NotificationProvider>
                    <OfflineProvider>
                      <NavigationContainer>
                        <AppNavigator />
                      </NavigationContainer>
                    </OfflineProvider>
                  </NotificationProvider>
                </LocationProvider>
              </AuthProvider>
            </SafeAreaProvider>
          </NativeBaseProvider>
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
