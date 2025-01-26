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

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete notification';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : 'Failed to mark notification as read';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  return {
    isLoading,
    error,
    getNotifications,
    deleteNotification,
    markAsRead,
  };
};
