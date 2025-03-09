import { api } from './axiosClient';
import { Payment, PaymentPayload, PaymentSource } from '../types/payment';

export const paymentService = {
  async createPayment(paymentData: PaymentPayload) {
    return await api.post<{ data: Payment }>('/payments', paymentData);
  },

  async updatePayment(id: number, paymentData: PaymentPayload) {
    return await api.put<{ data: Payment }>(`/payments/${id}`, paymentData);
  },

  async deletePayment(id: number) {
    return await api.delete<{ success: boolean }>(`/payments/${id}`);
  },

  async getPayment(id: number) {
    return await api.get<{ data: Payment }>(`/payments/${id}`);
  },

  async getAllPayments({ page = 1, filter = 'all' }: { page?: number; filter?: string }) {
    return await api.get<{ data: { payments: { data: Payment[] }, total: number } }>(
      '/payments',
      { page, filter }
    );
  },

  async getPaymentSources() {
    return await api.get<{ data: PaymentSource[] }>('/payment/sources');
  },
};

export type { PaymentPayload };
