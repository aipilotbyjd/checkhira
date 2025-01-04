import { useState } from 'react';
import { Alert } from 'react-native';
import { workService, WorkEntryPayload } from '../services/workService';
import { ApiError } from '../services/api';

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
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch work entry';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllWork = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workService.getAllWork();
      return response.data;
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
