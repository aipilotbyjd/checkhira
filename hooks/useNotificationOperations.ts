import { useState } from 'react';
import { notificationService } from '../services/notificationService';
import { ApiError } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export const useNotificationOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const getNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationService.getNotifications();
      return response.data.data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

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
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : 'Failed to mark all notifications as read';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  const getUnreadNotificationsCount = async () => {
    try {
      const response = await notificationService.getUnreadNotificationsCount();
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : 'Failed to get unread notifications count';
      showToast(errorMessage, 'error');
      return 0;
    }
  };

  return {
    isLoading,
    error,
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadNotificationsCount,
  };
};
