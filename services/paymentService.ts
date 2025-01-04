import { api, handleResponse } from './api';
import { PaymentSource } from '../constants/payments';

export interface PaymentPayload {
  date: Date;
  description: string;
  amount: string;
  category?: string;
  notes?: string;
  source: PaymentSource;
}

export const paymentService = {
  async createPayment(data: PaymentPayload) {
    const response = await fetch(`${api.baseUrl}/payments`, {
      method: 'POST',
      headers: api.headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updatePayment(id: number, data: PaymentPayload) {
    const response = await fetch(`${api.baseUrl}/payments/${id}`, {
      method: 'PUT',
      headers: api.headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deletePayment(id: number) {
    const response = await fetch(`${api.baseUrl}/payments/${id}`, {
      method: 'DELETE',
      headers: api.headers,
    });
    return handleResponse(response);
  },

  async getPayment(id: number) {
    const response = await fetch(`${api.baseUrl}/payments/${id}`, {
      headers: api.headers,
    });
    return handleResponse(response);
  },

  async getAllPayments() {
    const response = await fetch(`${api.baseUrl}/payments`, {
      headers: api.headers,
    });
    return handleResponse(response);
  },
};
