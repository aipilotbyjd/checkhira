import { api, handleResponse } from './api';

export const statsService = {
  async getStats() {
    const response = await fetch(`${api.baseUrl}/stats/recent`, {
      headers: await api.getHeaders(),
    });
    return handleResponse(response);
  },
};
