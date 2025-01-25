import { useState } from 'react';
import { Alert } from 'react-native';
import { profileService, UserProfile } from '../services/profileService';
import { ApiError } from '../services/api';

export const useProfileOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiError = (err: unknown, defaultMessage: string) => {
    const errorMessage = err instanceof ApiError 
      ? err.message 
      : defaultMessage;
    setError(errorMessage);
    throw new Error(errorMessage);
  };

  const getProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await profileService.getProfile();
      return response.data;
    } catch (err) {
      handleApiError(err, 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: FormData | Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await profileService.updateProfile(data);
      return response.data;
    } catch (err) {
      handleApiError(err, 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getProfile,
    updateProfile,
    isLoading,
    error,
  };
};
