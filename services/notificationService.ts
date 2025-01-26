import { api, handleResponse } from './api';

export interface Notification {
  id: string;
  title: string;
  description: string;
  created_at: string;
  read_at: string;
}

export const notificationService = {
  async getNotifications() {
    const response = await fetch(`${api.baseUrl}/notifications`, {
      headers: await api.getHeaders(),
    });
    return handleResponse<{ data: { data: Notification[] } }>(response);
  },

  async markAsRead(id: string) {
    const response = await fetch(`${api.baseUrl}/notifications/${id}/read`, {
      method: 'PUT',
      headers: await api.getHeaders(),
    });
    return handleResponse(response);
  },

  async deleteNotification(id: string) {
    const response = await fetch(`${api.baseUrl}/notifications/${id}`, {
      method: 'DELETE',
      headers: await api.getHeaders(),
    });
    return handleResponse(response);
  },
};
