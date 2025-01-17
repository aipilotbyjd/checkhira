import { api, handleResponse, ApiError } from './api';

export interface WorkEntry {
  id: number;
  type: string;
  diamond: string;
  price: string;
}

export interface WorkEntryPayload {
  date: string;
  name: string;
  entries: WorkEntry[];
  total: number;
}

export const workService = {
  async createWork(data: WorkEntryPayload) {
    const response = await fetch(`${api.baseUrl}/works`, {
      method: 'POST',
      headers: api.headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateWork(id: number, data: WorkEntryPayload) {
    const response = await fetch(`${api.baseUrl}/works/${id}`, {
      method: 'PUT',
      headers: api.headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteWork(id: number) {
    const response = await fetch(`${api.baseUrl}/works/${id}`, {
      method: 'DELETE',
      headers: api.headers,
    });
    return handleResponse(response);
  },

  async getWork(id: number) {
    const response = await fetch(`${api.baseUrl}/works/${id}`, {
      headers: api.headers,
    });
    return handleResponse(response);
  },

  async getAllWork() {
    const response = await fetch(`${api.baseUrl}/works`, {
      headers: api.headers,
    });
    return handleResponse(response);
  },
};
