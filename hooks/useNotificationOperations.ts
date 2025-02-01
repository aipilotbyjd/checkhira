import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { ApiError } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useNotification } from '../contexts/NotificationContext';

export const useNotificationOperations = () => {
  const {
    unreadCount,
    refreshUnreadCount,
    markAsRead: contextMarkAsRead,
    markAllAsRead: contextMarkAllAsRead,
  } = useNotification();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const { showToast } = useToast();

  const getNotifications = async (page: number = 1) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const response = await notificationService.getNotifications(page);
      const { data } = response;

      setHasMorePages(data.current_page < data.last_page);
      setCurrentPage(data.current_page);

      return {
        notifications: data.data,
        currentPage: data.current_page,
        hasMore: data.current_page < data.last_page,
      };
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return { notifications: [], currentPage: 1, hasMore: false };
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const markAsRead = async (id: string, is_read: string) => {
    try {
      const success = await contextMarkAsRead(id, is_read);
      return success;
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : 'Failed to mark notification as read';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      const success = await contextMarkAllAsRead();
      return success;
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : 'Failed to mark all notifications as read';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  useEffect(() => {
    refreshUnreadCount();
  }, []);

  return {
    isLoading,
    isLoadingMore,
    error,
    currentPage,
    hasMorePages,
    unreadCount,
    getNotifications,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
  };
};
