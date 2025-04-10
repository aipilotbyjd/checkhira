import { api, handleResponse } from './api';

export interface Notification {
  id: string;
  receiver_id: string;
  sender_id: string;
  title: string;
  description: string;
  created_at: string;
  is_read: string;
  link: string;
  link_text: string;
  _localReadStatus?: boolean;
}

export const notificationService = {
  async getNotifications(page: number = 1) {
    const response = await fetch(`${api.baseUrl}/notifications?page=${page}`, {
      headers: await api.getHeaders(),
    });
    return handleResponse<{
      data: {
        data: Notification[];
        current_page: number;
        last_page: number;
      };
    }>(response);
  },

  async markAsRead(id: string, is_read: string) {
    const response = await fetch(`${api.baseUrl}/notifications/${id}/read/${is_read}`, {
      method: 'GET',
      headers: await api.getHeaders(),
    });
    return handleResponse(response as any);
  },

  async markAllAsRead() {
    const response = await fetch(`${api.baseUrl}/notifications/read/all`, {
      method: 'GET',
      headers: await api.getHeaders(),
    });
    return handleResponse(response as any);
  },

  async getUnreadNotificationsCount() {
    const response = await fetch(`${api.baseUrl}/notifications/unread/count`, {
      method: 'GET',
      headers: await api.getHeaders(),
    });
    return handleResponse<{ data: any }>(response);
  },

  async getRecentActivities() {
    const response = await fetch(`${api.baseUrl}/activities/recent`, {
      headers: await api.getHeaders(),
    });
    return handleResponse<{
      data: Array<{
        id: string;
        type: 'work' | 'payment';
        description: string;
        amount: string;
        created_at: string;
      }>;
    }>(response);
  },
};
