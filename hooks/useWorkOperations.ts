import { useState } from 'react';
import { api, ApiError } from '../services/axiosClient';
import { useToast } from '../contexts/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Work } from '../types/work';
import type { WorkEntryPayload } from '../types/work';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


interface WorkResponse {
  status: boolean;
  data: {
    works: {
      current_page: number;
      last_page: number;
      data: Work[];
    };
    total: number;
  };
  message: string;
}

interface SingleWorkResponse {
  status: boolean;
  data: Work;
  message: string;
}

const offlineSync = {
  pendingActions: [],
  savePendingAction: async (action) => {
    this.pendingActions.push(action);
    await AsyncStorage.setItem('pendingActions', JSON.stringify(this.pendingActions));
  },
  syncWithServer: async () => {
    const pendingActions = JSON.parse(await AsyncStorage.getItem('pendingActions') || '[]');
    for (const action of pendingActions) {
      try {
        switch (action.action) {
          case 'create':
            await api.post(`/works`, action.data);
            break;
          case 'update':
            await api.put(`/works/${action.id}`, action.data);
            break;
          case 'delete':
            await api.delete(`/works/${action.id}`);
            break;
        }
        //Remove successful action from pending list
        this.pendingActions = this.pendingActions.filter(item => item.id !== action.id);
        await AsyncStorage.setItem('pendingActions', JSON.stringify(this.pendingActions));
      } catch (error) {
        console.error("Sync failed", error);
        // Handle sync errors (e.g., retry mechanism)
      }
    }
  }
};

const LocalNotificationService = {
  scheduleWorkNotification: async (work: Work) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Work Created',
        body: `Work "${work.title}" created.`,
      },
      trigger: null, // Trigger immediately
    });
  },
};


export const useWorkOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const createWork = async (workData: WorkEntryPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const tempId = `temp_${Date.now()}`;
      const workWithId = { ...workData, id: tempId, created_at: new Date().toISOString() };

      // Save locally first
      let localWorks = await AsyncStorage.getItem('works') || '[]';
      const works = JSON.parse(localWorks);
      works.unshift(workWithId);
      await AsyncStorage.setItem('works', JSON.stringify(works));

      // Add to pending sync
      await offlineSync.savePendingAction({
        id: tempId,
        type: 'work',
        action: 'create',
        data: workData,
        timestamp: Date.now()
      });

      // Try immediate sync
      await offlineSync.syncWithServer();
      const { sendLocalNotification } = useNotification();
      await sendLocalNotification(
        'Work Created',
        `New work added with ${workWithId.diamond_count} diamonds`,
        { type: 'work', id: workWithId.id }
      );
      return workWithId;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create work entry';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWork = async (id: number, workData: WorkEntryPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      //Similar logic as createWork, but with update action
      await offlineSync.savePendingAction({
        id: id,
        type: 'work',
        action: 'update',
        data: workData,
        timestamp: Date.now()
      });
      await offlineSync.syncWithServer();
      return await api.put<SingleWorkResponse>(`/works/${id}`, workData);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update work entry';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWork = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      //Similar logic as createWork, but with delete action
      await offlineSync.savePendingAction({
        id: id,
        type: 'work',
        action: 'delete',
        data: {},
        timestamp: Date.now()
      });
      await offlineSync.syncWithServer();
      return await api.delete<SingleWorkResponse>(`/works/${id}`);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete work entry';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getWork = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<SingleWorkResponse>(`/works/${id}`);
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch work entry';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllWork = async ({ page = 1, filter = 'all' }: { page?: number; filter?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<WorkResponse>(`/works`, { page, filter });
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch work entries';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createWork,
    updateWork,
    deleteWork,
    getWork,
    getAllWork,
  };
};