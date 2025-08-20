import React, {createContext, useContext, useEffect, ReactNode} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../store';
import {loginUser, registerUser, logoutUser, refreshUser, setUser, setToken} from '../store/slices/authSlice';
import {authService} from '../services/authService';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: {email: string; password: string}) => Promise<void>;
  register: (userData: {email: string; password: string; name: string}) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {user, isAuthenticated, isLoading, error} = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const {user: storedUser, token: storedToken} = await authService.initializeAuth();
      
      if (storedUser && storedToken) {
        dispatch(setUser(storedUser));
        dispatch(setToken(storedToken));
      } else {
        // Try to refresh the user data if we have a token
        if (storedToken) {
          dispatch(refreshUser());
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  };

  const login = async (credentials: {email: string; password: string}) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData: {email: string; password: string; name: string}) => {
    try {
      await dispatch(registerUser(userData)).unwrap();
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const clearError = () => {
    // This would be implemented in the slice
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
