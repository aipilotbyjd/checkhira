import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useToast } from './ToastContext';
import { ApiError } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Separate keys for notification read status and unread count
const LOCAL_READ_STATUS_KEY = 'notification_read_status_';
const UNREAD_COUNT_STORAGE_KEY = 'notification_unread_count';

type NotificationContextType = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string, is_read: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { showToast } = useToast();

  // Modified initial load useEffect
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        // 1. First check AsyncStorage
        const [storedCount, localKeys] = await Promise.all([
          AsyncStorage.getItem(UNREAD_COUNT_STORAGE_KEY),
          AsyncStorage.getAllKeys()
        ]);

        // Get local unread count from notification read status keys
        const localStatusKeys = localKeys.filter(key => key.startsWith(LOCAL_READ_STATUS_KEY));
        const localValues = await AsyncStorage.multiGet(localStatusKeys);
        const localUnreadCount = localValues.filter(([_, value]) => value === 'false').length;

        if (storedCount !== null) {
          // Combine API count with local unread status
          const { data } = await notificationService.getUnreadNotificationsCount();
          const serverCount = data?.data || 0;
          const combinedCount = serverCount + localUnreadCount;

          setUnreadCount(combinedCount);
          await AsyncStorage.setItem(UNREAD_COUNT_STORAGE_KEY, combinedCount.toString());
        } else {
          // Initial load with combined value
          const { data } = await notificationService.getUnreadNotificationsCount();
          const serverCount = data?.data || 0;
          const combinedCount = serverCount + localUnreadCount;

          setUnreadCount(combinedCount);
          await AsyncStorage.setItem(UNREAD_COUNT_STORAGE_KEY, combinedCount.toString());
        }
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
  }, []);

  // Update AsyncStorage whenever unreadCount changes
  useEffect(() => {
    const saveUnreadCount = async () => {
      try {
        await AsyncStorage.setItem(UNREAD_COUNT_STORAGE_KEY, unreadCount.toString());
      } catch (error) {
        console.error('Error saving unread count to storage:', error);
      }
    };

    saveUnreadCount();
  }, [unreadCount]);

  // Modified refreshUnreadCount function with proper dependencies
  const refreshUnreadCount = useCallback(async () => {
    try {
      const [serverResponse, localKeys] = await Promise.all([
        notificationService.getUnreadNotificationsCount(),
        AsyncStorage.getAllKeys()
      ]);

      // Get server count for user-specific notifications
      const serverCount = serverResponse?.data?.data || 0;

      // Count local unread notifications (receiver_id=null)
      const localStatusKeys = localKeys
        .filter(key => key.startsWith(LOCAL_READ_STATUS_KEY))
        .map(key => key.replace(LOCAL_READ_STATUS_KEY, ''));

      const localValues = await AsyncStorage.multiGet(
        localStatusKeys.map(key => `${LOCAL_READ_STATUS_KEY}${key}`)
      );

      const localUnreadCount = localValues
        .filter(([_, value]) => value === 'false').length;

      // Combine counts from both sources
      const combinedCount = serverCount + localUnreadCount;

      setUnreadCount(combinedCount);
      await AsyncStorage.setItem(UNREAD_COUNT_STORAGE_KEY, combinedCount.toString());

    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to get unread count';
      showToast(errorMessage, 'error');
    }
  }, [showToast, setUnreadCount]); // Added setUnreadCount to dependencies

  // Add a function to update local unread count without API call
  const updateLocalUnreadCount = useCallback(async (change: number) => {
    const newCount = Math.max(0, unreadCount + change);
    setUnreadCount(newCount);
    await AsyncStorage.setItem(UNREAD_COUNT_STORAGE_KEY, newCount.toString());
  }, [unreadCount, setUnreadCount]);

  const markAsRead = async (id: string, is_read: string) => {
    try {
      await notificationService.markAsRead(id, is_read);

      // Update unread count locally
      if (is_read === 'true') {
        await updateLocalUnreadCount(-1); // Decrease by 1
      } else {
        await updateLocalUnreadCount(1); // Increase by 1
      }

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

      // Set unread count to 0 locally
      setUnreadCount(0);
      await AsyncStorage.setItem(UNREAD_COUNT_STORAGE_KEY, '0');

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

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        refreshUnreadCount,
        markAsRead,
        markAllAsRead,
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
