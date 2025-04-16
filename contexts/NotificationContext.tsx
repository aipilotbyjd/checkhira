import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import { useToast } from './ToastContext';
import { ApiError } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalNotificationService from '../services/localNotificationService';

// Separate keys for notification read status and unread count
const LOCAL_READ_STATUS_KEY = 'notification_read_status_';

type NotificationContextType = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string, is_read: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<string | null>;
  getLastNotificationResponse: () => any;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  // References for notification handling
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const lastNotificationResponse = useRef<any>();

  // Modified refreshUnreadCount function with proper dependencies
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      const [serverResponse, localKeys] = await Promise.all([
        notificationService.getUnreadNotificationsCount(),
        AsyncStorage.getAllKeys()
      ]);

      // Get server count for user-specific notifications
      const serverCount = serverResponse?.data || 0;

      // Get local read statuses
      const localStatusKeys = localKeys
        .filter(key => key.startsWith(LOCAL_READ_STATUS_KEY));

      const localValues = await AsyncStorage.multiGet(localStatusKeys);

      // Count notifications marked as read locally
      const localReadCount = localValues
        .filter(([_, value]) => value === 'true').length;

      // Subtract locally read notifications from server count
      const finalCount = Math.max(0, Number(serverCount) - Number(localReadCount));

      setUnreadCount(finalCount);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to get unread count';
      showToast(errorMessage, 'error');
    }
  }, [showToast, setUnreadCount, isAuthenticated]);

  const markAsRead = async (id: string, is_read: string) => {
    try {
      await notificationService.markAsRead(id, is_read);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : 'Failed to mark notification as read';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      return true;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to mark all as read';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  // Add a useEffect to periodically refresh unread count
  useEffect(() => {
    // Refresh unread count when component mounts
    refreshUnreadCount();

    // Set up interval to refresh unread count every 5 minutes
    const intervalId = setInterval(() => {
      refreshUnreadCount();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [refreshUnreadCount]);

  // Set up notification listeners
  useEffect(() => {
    // Initialize notifications
    LocalNotificationService.initialize();

    // Push token functionality removed to fix ExpoPushTokenManager error
    console.log('Notification listeners disabled to fix ExpoPushTokenManager error');

    // Clean up listeners on unmount
    return () => {
      console.log('Notification context cleanup');
    };
  }, [isAuthenticated]);

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    try {
      // Make sure notifications are initialized
      await LocalNotificationService.initialize();

      // Log notification instead of scheduling it
      console.log('Would send notification:', { title, body, data });

      // Return a dummy notification ID
      const dummyId = 'dummy-' + Date.now();
      return dummyId;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  };

  // Get the last notification response (for handling notification taps)
  const getLastNotificationResponse = () => {
    return lastNotificationResponse.current;
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        refreshUnreadCount,
        markAsRead,
        markAllAsRead,
        sendLocalNotification,
        getLastNotificationResponse,
      }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
