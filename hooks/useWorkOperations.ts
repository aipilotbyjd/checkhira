import { useState } from 'react';
import { Alert } from 'react-native';
import { workService } from '../services/workService';
import type { WorkEntryPayload } from '../services/workService';
import type { Work } from '../types/work';
import { ApiError } from '../services/api';

interface WorkResponse {
  works: {
    data: Work[];
    current_page: number;
    last_page: number;
  };
  total: number;
}

export const useWorkOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWork = async (workData: WorkEntryPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workService.createWork(workData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create work entry';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWork = async (id: number, workData: WorkEntryPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workService.updateWork(id, workData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update work entry';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWork = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workService.deleteWork(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete work entry';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getWork = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workService.getWork(id);
      return response as WorkResponse;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch work entry';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllWork = async ({ page = 1, filter = 'all' }: { page?: number; filter?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workService.getAllWork({ page, filter });
      return response as WorkResponse;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch work entries';
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
    createWork,
    updateWork,
    deleteWork,
    getWork,
    getAllWork,
  };
};
