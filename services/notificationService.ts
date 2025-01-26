import { api, handleResponse } from './api';

export interface Notification {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_read: string;
  link: string;
  link_text: string;
}

export const notificationService = {
  async getNotifications() {
    const response = await fetch(`${api.baseUrl}/notifications`, {
      headers: await api.getHeaders(),
    });
    return handleResponse<{ data: { data: Notification[] } }>(response);
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
    return handleResponse<{ data: { data: any } }>(response);
  },
};
