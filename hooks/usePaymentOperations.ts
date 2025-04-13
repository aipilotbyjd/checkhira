import { useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, ApiError } from '../services/axiosClient';
import { Payment, PaymentPayload, PaymentSource } from '../types/payment';
import LocalNotificationService from '../services/localNotificationService';

// New service for offline synchronization
const offlineSync = {
  savePendingAction: async (action) => {
    try {
      let pendingActions = await AsyncStorage.getItem('pendingActions') || '[]';
      const actions = JSON.parse(pendingActions);
      actions.push(action);
      await AsyncStorage.setItem('pendingActions', JSON.stringify(actions));
    } catch (error) {
      console.error("Error saving pending action:", error);
    }
  },
  syncWithServer: async () => {
    try {
      let pendingActions = await AsyncStorage.getItem('pendingActions') || '[]';
      const actions = JSON.parse(pendingActions);
      for (const action of actions) {
        switch (action.type) {
          case 'payment':
            if (action.action === 'create') {
              await api.post('/payments', action.data);
            } else if (action.action === 'update') {
              await api.put(`/payments/${action.id}`, action.data);
            } else if (action.action === 'delete') {
              await api.delete(`/payments/${action.id}`);
            }
            break;
          // Add other types as needed
        }
        // Remove successful actions
      }
      await AsyncStorage.setItem('pendingActions', JSON.stringify([]));
    } catch (error) {
      console.error("Error syncing with server:", error);
    }
  }
};


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
      const tempId = `temp_${Date.now()}`;
      const paymentWithId = { ...paymentData, id: tempId, created_at: new Date().toISOString() };

      // Save locally first
      let localPayments = await AsyncStorage.getItem('payments') || '[]';
      const payments = JSON.parse(localPayments);
      payments.unshift(paymentWithId);
      await AsyncStorage.setItem('payments', JSON.stringify(payments));

      // Add to pending sync
      await offlineSync.savePendingAction({
        id: tempId,
        type: 'payment',
        action: 'create',
        data: paymentData,
        timestamp: Date.now()
      });

      // Try immediate sync
      await offlineSync.syncWithServer();
      return paymentWithId;
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
      //Save Locally
      let localPayments = await AsyncStorage.getItem('payments') || '[]';
      const payments = JSON.parse(localPayments);
      const index = payments.findIndex((p:any) => p.id === id);
      if (index !== -1){
          payments[index] = {...paymentData, id: id};
          await AsyncStorage.setItem('payments', JSON.stringify(payments));
      }

      await offlineSync.savePendingAction({
          id: id,
          type: 'payment',
          action: 'update',
          data: paymentData,
          timestamp: Date.now()
      });

      await offlineSync.syncWithServer();
      return paymentData;

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
      //Save Locally
      let localPayments = await AsyncStorage.getItem('payments') || '[]';
      const payments = JSON.parse(localPayments);
      const index = payments.findIndex((p:any) => p.id === id);
      if (index !== -1){
          payments.splice(index,1);
          await AsyncStorage.setItem('payments', JSON.stringify(payments));
      }

      await offlineSync.savePendingAction({
          id: id,
          type: 'payment',
          action: 'delete',
          data: {},
          timestamp: Date.now()
      });
      await offlineSync.syncWithServer();
      return {};

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
      let localPayments = await AsyncStorage.getItem('payments') || '[]';
      const payments = JSON.parse(localPayments);
      const payment = payments.find((p:any) => p.id === id);
      if (payment) return payment;
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
      let localPayments = await AsyncStorage.getItem('payments') || '[]';
      const payments = JSON.parse(localPayments);
      const response = await api.get<{ data: { payments: { data: Payment[] }, total: number } }>(
        '/payments',
        { page, filter }
      );
      return {data: {payments: [...payments, ...response.data.data.payments.data], total: response.data.total}};
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