import { api, handleResponse } from './api';

export interface PaymentPayload {
  date: Date;
  amount: number;
  category?: string;
  description: string;
  source_id: number;
}

export const paymentService = {
  async createPayment(data: PaymentPayload) {
    const response = await fetch(`${api.baseUrl}/payments`, {
      method: 'POST',
      headers: await api.getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updatePayment(id: number, data: PaymentPayload) {
    const response = await fetch(`${api.baseUrl}/payments/${id}`, {
      method: 'PUT',
      headers: await api.getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deletePayment(id: number) {
    const response = await fetch(`${api.baseUrl}/payments/${id}`, {
      method: 'DELETE',
      headers: await api.getHeaders(),
    });
    return handleResponse(response);
  },

  async getPayment(id: number) {
    const response = await fetch(`${api.baseUrl}/payments/${id}`, {
      headers: await api.getHeaders(),
    });
    return handleResponse(response);
  },

  async getAllPayments({ page = 1 }: { page?: number }) {
    const response = await fetch(`${api.baseUrl}/payments?page=${page}`, {
      headers: await api.getHeaders(),
    });
    const data = await handleResponse(response);
    console.log(data);
    return data;
  },

  async getPaymentSources() {
    const response = await fetch(`${api.baseUrl}/payments/sources`, {
      headers: await api.getHeaders(),
    });
    return handleResponse(response);
  },
};
