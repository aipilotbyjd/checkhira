import { useState } from 'react';
import { Alert } from 'react-native';
import { paymentService, PaymentPayload } from '../services/paymentService';
import { ApiError } from '../services/api';

export const usePaymentOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (paymentData: PaymentPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paymentService.createPayment(paymentData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create payment';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePayment = async (id: number, paymentData: PaymentPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paymentService.updatePayment(id, paymentData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update payment';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePayment = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paymentService.deletePayment(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete payment';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPayment = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paymentService.getPayment(id);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch payment';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllPayments = async ({ page = 1 }: { page?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paymentService.getAllPayments({ page });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch payments';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentSources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paymentService.getPaymentSources();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch payment sources';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
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
