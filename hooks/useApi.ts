import { useState, useCallback } from 'react';
import { api, ApiError } from '../services/axiosClient';
import { useToast } from '../contexts/ToastContext';

interface UseApiOptions {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
    defaultErrorMessage?: string;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const { showToast } = useToast();

    const {
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = 'Operation completed successfully',
        defaultErrorMessage = 'An error occurred',
    } = options;

    const handleError = useCallback((err: any) => {
        const apiError = err instanceof ApiError
            ? err
            : new ApiError(0, err?.message || defaultErrorMessage);

        setError(apiError);

        if (showErrorToast) {
            showToast(apiError.message, 'error');
        }

        return apiError;
    }, [showErrorToast, defaultErrorMessage, showToast]);

    const execute = useCallback(async <K = T>(
        apiCall: () => Promise<K>
    ): Promise<K | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiCall();
            setData(result as unknown as T);

            if (showSuccessToast) {
                showToast(successMessage);
            }

            return result;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleError, showSuccessToast, successMessage, showToast]);

    return {
        data,
        isLoading,
        error,
        execute,
        setData,
    };
} 