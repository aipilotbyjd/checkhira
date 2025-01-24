import { api, handleResponse } from './api';
import { WorkEntryPayload, WorkResponse } from '../types/work';

export const workService = {
  async createWork(data: WorkEntryPayload) {
    const response = await fetch(`${api.baseUrl}/works`, {
      method: 'POST',
      headers: await api.getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<WorkResponse>(response);
  },

  async updateWork(id: number, data: WorkEntryPayload) {
    const response = await fetch(`${api.baseUrl}/works/${id}`, {
      method: 'PUT',
      headers: await api.getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<WorkResponse>(response);
  },

  async deleteWork(id: number) {
    const response = await fetch(`${api.baseUrl}/works/${id}`, {
      method: 'DELETE',
      headers: await api.getHeaders(),
    });
    return handleResponse(response);
  },

  async getWork(id: number) {
    const response = await fetch(`${api.baseUrl}/works/${id}`, {
      headers: await api.getHeaders(),
    });
    return handleResponse(response);
  },

  async getAllWork({ page = 1, filter = 'all' }: { page?: number; filter?: string }) {
    const response = await fetch(`${api.baseUrl}/works?page=${page}&filter=${filter}`, {
      headers: await api.getHeaders(),
    });
    return handleResponse(response);
  },
};
