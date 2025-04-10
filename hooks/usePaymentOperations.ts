import { useState } from 'react';
import { Alert } from 'react-native';
import { api, ApiError } from '../services/axiosClient';
import { Payment, PaymentPayload, PaymentSource } from '../types/payment';

export const usePaymentOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiError = (err: unknown, defaultErrorMessage: string) => {
    const errorMessage = err instanceof ApiError ? err.message : defaultErrorMessage;
    setError(errorMessage);
    Alert.alert('Error', errorMessage);
    return null;
  };

  const createPayment = async (paymentData: PaymentPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: Payment }>('/payments', paymentData);
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to create payment');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePayment = async (id: number, paymentData: PaymentPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.put<{ data: Payment }>(`/payments/${id}`, paymentData);
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to update payment');
    } finally {
      setIsLoading(false);
    }
  };

  const deletePayment = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.delete<{ data: Payment }>(`/payments/${id}`);
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to delete payment');
    } finally {
      setIsLoading(false);
    }
  };

  const getPayment = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: Payment }>(`/payments/${id}`);
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to fetch payment');
    } finally {
      setIsLoading(false);
    }
  };

  const getAllPayments = async ({ page = 1, filter = 'all' }: { page?: number; filter?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { payments: { data: Payment[] }, total: number } }>(
        '/payments',
        { page, filter }
      );
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentSources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: PaymentSource[] }>('/payments/sources');
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to fetch payment sources');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createPayment,
    updatePayment,
    deletePayment,
    getPayment,
    getAllPayments,
    getPaymentSources,
  };
};
