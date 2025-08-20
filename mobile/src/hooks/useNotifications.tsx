import React, {createContext, useContext, useEffect, ReactNode} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../store';

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  settings: any;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updateSettings: (settings: any) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({children}) => {
  const {notifications, unreadCount, isLoading, error, settings} = useSelector(
    (state: RootState) => state.notifications,
  );

  const markAsRead = (id: string) => {
    // Implementation would dispatch action
  };

  const markAllAsRead = () => {
    // Implementation would dispatch action
  };

  const clearNotifications = () => {
    // Implementation would dispatch action
  };

  const updateSettings = (newSettings: any) => {
    // Implementation would dispatch action
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    settings,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updateSettings,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
