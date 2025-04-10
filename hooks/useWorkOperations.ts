import { useState } from 'react';
import { api, ApiError } from '../services/axiosClient';
import { useToast } from '../contexts/ToastContext';
import type { Work } from '../types/work';
import type { WorkEntryPayload } from '../types/work';


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

export const useWorkOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const createWork = async (workData: WorkEntryPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      // Store locally first
      const operationId = await syncService.addPendingOperation('work', 'create', workData);
      
      // Also store the work data itself for immediate access
      const tempId = `temp-${operationId}`;
      const tempWork = { ...workData, id: tempId, pending: true };
      await AsyncStorage.setItem(`work-${tempId}`, JSON.stringify(tempWork));
      
      return { data: { data: tempWork } };
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
      const response = await api.put<SingleWorkResponse>(`/works/${id}`, workData);
      return response;
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
      const response = await api.delete<SingleWorkResponse>(`/works/${id}`);
      return response;
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
