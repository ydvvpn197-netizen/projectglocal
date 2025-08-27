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
      const [generalNotifications, counts] = await Promise.all([
        notificationService.getGeneralNotifications(),
        notificationService.getNotificationCounts(user?.id)
      ]);

      let personalNotifications: PersonalNotification[] = [];
      if (user?.id) {
        personalNotifications = await notificationService.getPersonalNotifications(user.id);
      }

      setState(prev => ({
        ...prev,
        generalNotifications,
        personalNotifications,
        counts,
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

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const success = await notificationService.markAsRead(notificationId, user.id);
      if (success) {
        setState(prev => ({
          ...prev,
          personalNotifications: prev.personalNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          ),
          counts: {
            ...prev.counts,
            personal: Math.max(0, prev.counts.personal - 1),
            total: Math.max(0, prev.counts.total - 1)
          }
        }));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const success = await notificationService.markAllAsRead(user.id);
      if (success) {
        setState(prev => ({
          ...prev,
          personalNotifications: prev.personalNotifications.map(notification =>
            ({ ...notification, read: true })
          ),
          counts: {
            ...prev.counts,
            personal: 0,
            total: prev.counts.general
          }
        }));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user?.id]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const success = await notificationService.deleteNotification(notificationId, user.id);
      if (success) {
        setState(prev => ({
          ...prev,
          personalNotifications: prev.personalNotifications.filter(
            notification => notification.id !== notificationId
          ),
          counts: {
            ...prev.counts,
            personal: Math.max(0, prev.counts.personal - 1),
            total: Math.max(0, prev.counts.total - 1)
          }
        }));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [user?.id]);

  // Refresh notifications
  const refresh = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) {
      // For non-logged-in users, only load general notifications
      loadNotifications();
      return;
    }

    // Load initial notifications
    loadNotifications();

    // Subscribe to real-time updates
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
          setState(prev => ({
            ...prev,
            personalNotifications: prev.personalNotifications.map(notification =>
              notification.id === payload.new.id ? payload.new : notification
            )
          }));
        }
      } else if (payload.eventType === 'DELETE') {
        if (payload.table === 'personal_notifications') {
          setState(prev => ({
            ...prev,
            personalNotifications: prev.personalNotifications.filter(
              notification => notification.id !== payload.old.id
            ),
            counts: {
              ...prev.counts,
              personal: Math.max(0, prev.counts.personal - 1),
              total: Math.max(0, prev.counts.total - 1)
            }
          }));
        }
      }
    });

    return unsubscribe;
  }, [user?.id, loadNotifications]);

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
    refresh,

    // Computed values
    hasUnread: state.counts.total > 0,
    hasUnreadPersonal: state.counts.personal > 0,
    hasGeneralNotifications: state.counts.general > 0
  };
};
