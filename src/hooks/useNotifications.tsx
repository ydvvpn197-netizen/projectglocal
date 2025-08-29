import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { notificationService, GeneralNotification, PersonalNotification, NotificationCounts } from '@/services/notificationService';

export interface NotificationState {
  generalNotifications: GeneralNotification[];
  personalNotifications: PersonalNotification[];
  counts: NotificationCounts;
  loading: boolean;
  error: string | null;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationState>({
    generalNotifications: [],
    personalNotifications: [],
    counts: { general: 0, personal: 0, total: 0 },
    loading: false,
    error: null
  });

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // For non-authenticated users, return empty data
      if (!user?.id) {
        setState(prev => ({
          ...prev,
          generalNotifications: [],
          personalNotifications: [],
          counts: { general: 0, personal: 0, total: 0 },
          loading: false
        }));
        return;
      }

      // Load notifications only for authenticated users
      const [generalNotifications, personalData, countsData] = await Promise.all([
        notificationService.getGeneralNotifications(),
        notificationService.getPersonalNotifications(user.id),
        notificationService.getNotificationCounts(user.id)
      ]);

      setState(prev => ({
        ...prev,
        generalNotifications,
        personalNotifications: personalData,
        counts: countsData,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load notifications'
      }));
    }
  }, [user?.id]);

  // Mark notification as read (only for logged-in users)
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) {
      console.warn('Cannot mark notification as read: user not logged in');
      return;
    }

    try {
      const success = await notificationService.markAsRead(notificationId, user.id);
      if (success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Marked notification as read:', notificationId);
        }
        setState(prev => {
          const updatedNotifications = prev.personalNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          );
          
          // Recalculate personal count based on unread notifications
          const newPersonalCount = updatedNotifications.filter(n => !n.read).length;
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 Updated personal count:', newPersonalCount);
          }
          
          return {
            ...prev,
            personalNotifications: updatedNotifications,
            counts: {
              ...prev.counts,
              personal: newPersonalCount,
              total: prev.counts.general + newPersonalCount
            }
          };
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user?.id]);

  // Mark all notifications as read (only for logged-in users)
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) {
      console.warn('Cannot mark all notifications as read: user not logged in');
      return;
    }

    try {
      const success = await notificationService.markAllAsRead(user.id);
      if (success) {
        setState(prev => {
          const updatedNotifications = prev.personalNotifications.map(notification =>
            ({ ...notification, read: true })
          );
          
          // Recalculate personal count (should be 0 after marking all as read)
          const newPersonalCount = updatedNotifications.filter(n => !n.read).length;
          
          return {
            ...prev,
            personalNotifications: updatedNotifications,
            counts: {
              ...prev.counts,
              personal: newPersonalCount,
              total: prev.counts.general + newPersonalCount
            }
          };
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user?.id]);

  // Delete notification (only for logged-in users)
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user?.id) {
      console.warn('Cannot delete notification: user not logged in');
      return;
    }

    try {
      const success = await notificationService.deleteNotification(notificationId, user.id);
      if (success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🗑️ Deleted notification:', notificationId);
        }
        setState(prev => {
          const filteredNotifications = prev.personalNotifications.filter(
            notification => notification.id !== notificationId
          );
          
          // Recalculate personal count based on remaining unread notifications
          const newPersonalCount = filteredNotifications.filter(n => !n.read).length;
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 Updated personal count after deletion:', newPersonalCount);
          }
          
          return {
            ...prev,
            personalNotifications: filteredNotifications,
            counts: {
              ...prev.counts,
              personal: newPersonalCount,
              total: prev.counts.general + newPersonalCount
            }
          };
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [user?.id]);

  // Refresh notifications
  const refresh = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Refresh counts from database to ensure accuracy
  const refreshCounts = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const countsData = await notificationService.getNotificationCounts(user.id);
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Refreshing notification counts:', countsData);
      }
      setState(prev => ({
        ...prev,
        counts: countsData
      }));
    } catch (error) {
      console.error('Error refreshing notification counts:', error);
    }
  }, [user?.id]);

  // Create a new notification
  const createNotification = useCallback(async (notificationData: {
    user_id: string;
    type: any;
    title: string;
    message: string;
    data?: Record<string, any>;
    action_url?: string;
    action_text?: string;
  }) => {
    if (!user?.id) {
      console.warn('Cannot create notification: user not logged in');
      return;
    }

    try {
      const notificationId = await notificationService.createNotification(notificationData);
      if (notificationId) {
        // Refresh notifications to show the new one
        await loadNotifications();
        return notificationId;
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }, [user?.id, loadNotifications]);

  // Subscribe to real-time updates
  useEffect(() => {
    // Load initial notifications
    loadNotifications();

    // Only subscribe to real-time updates if user is logged in
    if (!user?.id) {
      return;
    }

    // Set up periodic count refresh to ensure accuracy (every 30 seconds)
    const countRefreshInterval = setInterval(() => {
      refreshCounts();
    }, 30000);

    // Subscribe to real-time updates for logged-in users
    const unsubscribe = notificationService.subscribeToNotifications(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        if (payload.table === 'personal_notifications') {
          setState(prev => ({
            ...prev,
            personalNotifications: [payload.new, ...prev.personalNotifications],
            counts: {
              ...prev.counts,
              personal: prev.counts.personal + 1,
              total: prev.counts.total + 1
            }
          }));
        } else if (payload.table === 'general_notifications') {
          setState(prev => ({
            ...prev,
            generalNotifications: [payload.new, ...prev.generalNotifications],
            counts: {
              ...prev.counts,
              general: prev.counts.general + 1,
              total: prev.counts.total + 1
            }
          }));
        }
      } else if (payload.eventType === 'UPDATE') {
        if (payload.table === 'personal_notifications') {
          setState(prev => {
            const updatedNotifications = prev.personalNotifications.map(notification =>
              notification.id === payload.new.id ? payload.new : notification
            );
            
            // Recalculate personal count based on unread notifications
            const newPersonalCount = updatedNotifications.filter(n => !n.read).length;
            
            return {
              ...prev,
              personalNotifications: updatedNotifications,
              counts: {
                ...prev.counts,
                personal: newPersonalCount,
                total: prev.counts.general + newPersonalCount
              }
            };
          });
        }
      } else if (payload.eventType === 'DELETE') {
        if (payload.table === 'personal_notifications') {
          setState(prev => {
            const filteredNotifications = prev.personalNotifications.filter(
              notification => notification.id !== payload.old.id
            );
            
            // Recalculate personal count based on remaining unread notifications
            const newPersonalCount = filteredNotifications.filter(n => !n.read).length;
            
            return {
              ...prev,
              personalNotifications: filteredNotifications,
              counts: {
                ...prev.counts,
                personal: newPersonalCount,
                total: prev.counts.general + newPersonalCount
              }
            };
          });
        }
      }
    });

    return () => {
      unsubscribe();
      clearInterval(countRefreshInterval);
    };
  }, [user?.id, loadNotifications, refreshCounts]);

  // Get combined notifications for display
  const getAllNotifications = useCallback(() => {
    const combined = [
      ...state.generalNotifications.map(notification => ({
        ...notification,
        isGeneral: true,
        read: false // General notifications are never "read" in the traditional sense
      })),
      ...state.personalNotifications.map(notification => ({
        ...notification,
        isGeneral: false
      }))
    ];

    return combined.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [state.generalNotifications, state.personalNotifications]);

  return {
    // State
    generalNotifications: state.generalNotifications,
    personalNotifications: state.personalNotifications,
    allNotifications: getAllNotifications(),
    counts: state.counts,
    loading: state.loading,
    error: state.error,

    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refresh,
    refreshCounts,

    // Computed values
    hasUnread: state.counts.total > 0,
    hasUnreadPersonal: state.counts.personal > 0,
    hasGeneralNotifications: state.counts.general > 0,
    isAuthenticated: !!user?.id
  };
};
