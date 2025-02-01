import React, { createContext, useContext, useState, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useToast } from './ToastContext';
import { ApiError } from '../services/api';

type NotificationContextType = {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string, is_read: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { showToast } = useToast();

  const refreshUnreadCount = useCallback(async () => {
    try {
      console.log('refreshing unread count');
      const response = await notificationService.getUnreadNotificationsCount();
      if (response?.data?.data !== undefined) {
        console.log('unread count', response.data.data);
        setUnreadCount(response.data.data);
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to get unread count';
      showToast(errorMessage, 'error');
    }
  }, []);

  const markAsRead = async (id: string, is_read: string) => {
    try {
      await notificationService.markAsRead(id, is_read);
      await refreshUnreadCount();
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
      await refreshUnreadCount();
      return true;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to mark all as read';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  return (
    <NotificationContext.Provider
      value={{ unreadCount, refreshUnreadCount, markAsRead, markAllAsRead }}>
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
