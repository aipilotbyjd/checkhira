import { useState, useCallback } from 'react';
import { api, ApiError } from '../services/axiosClient';
import { useToast } from '../contexts/ToastContext';
import type { Work } from '../types/work';
import type { WorkEntryPayload } from '../types/work';
import { offlineSync } from '../services/offlineSync';
import { useNotification } from '../contexts/NotificationContext';



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

  const { sendLocalNotification } = useNotification();

  const createWork = useCallback(async (workData: WorkEntryPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const tempId = `temp_${Date.now()}`;
      const workWithId = { ...workData, id: tempId, created_at: new Date().toISOString() };

      // Queue the action with our improved offline sync service
      const syncId = await offlineSync.queueAction({
        id: tempId,
        type: 'work',
        action: 'create',
        data: workData
      });

      // Send notification
      await sendLocalNotification(
        'Work Created',
        `New work entry saved${workData.name ? `: ${workData.name}` : ''}`,
        { type: 'work', id: tempId, syncId }
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
  }, [setIsLoading, setError, showToast, sendLocalNotification]);

  const updateWork = useCallback(async (id: number | string, workData: WorkEntryPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      // Queue the update action
      await offlineSync.queueAction({
        id: id.toString(),
        type: 'work',
        action: 'update',
        data: workData
      });

      // Return optimistic result
      return {
        data: {
          ...workData,
          id,
          updated_at: new Date().toISOString()
        }
      };
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update work entry';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError, showToast]);

  const deleteWork = useCallback(async (id: number | string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Queue the delete action
      await offlineSync.queueAction({
        id: id.toString(),
        type: 'work',
        action: 'delete',
        data: { id }
      });

      // Return success response
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete work entry';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError, showToast]);

  const getWork = useCallback(async (id: number | string) => {
    setIsLoading(true);
    setError(null);
    try {
      // First check if we have a pending version of this work
      const offlineData = await offlineSync.getOfflineEntity('work', id.toString());
      if (offlineData) {
        return { data: offlineData };
      }

      // If not in offline storage, fetch from API
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
  }, [setIsLoading, setError, showToast]);

  const getAllWork = useCallback(async ({ page = 1, filter = 'all' }: { page?: number; filter?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      // Get offline data first
      const offlineData = await offlineSync.getOfflineDataByType<Work>('work');
      const offlineWorks = Object.values(offlineData) as Work[];

      // Try to get online data
      try {
        const response = await api.get<WorkResponse>(`/works`, { page, filter });

        // Merge online and offline data
        if (response?.data?.works?.data) {
          const onlineWorks = response.data.works.data;

          // Replace online works with offline versions if they exist
          const mergedWorks = onlineWorks.map(onlineWork => {
            const offlineWork = offlineData[onlineWork.id as unknown as string];
            return offlineWork || onlineWork;
          });

          // Add any temp works (with temp_ ids) that don't exist online yet
          const tempWorks = offlineWorks.filter((work: Work) =>
            typeof work.id === 'string' && work.id.startsWith('temp_')
          );

          // Create merged response
          return {
            ...response,
            data: {
              ...response.data,
              works: {
                ...response.data.works,
                data: [...tempWorks, ...mergedWorks]
              }
            }
          };
        }

        return response;
      } catch (error) {
        // If online fetch fails, return offline data only
        console.log('Falling back to offline data for works');
        return {
          status: true,
          data: {
            works: {
              current_page: page,
              last_page: 1,
              data: offlineWorks
            },
            total: offlineWorks.reduce((sum: number, work: Work) => {
              const workTotal = typeof work.total === 'number' ? work.total : 0;
              return sum + workTotal;
            }, 0)
          },
          message: 'Offline data'
        };
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch work entries';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError, showToast]);

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