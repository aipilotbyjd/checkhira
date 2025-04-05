import { useState } from 'react';
import { profileService } from '../services/profileService';
import { ApiError } from '../services/api';
import { UserProfile } from '../types/user';
import { useRouter } from 'expo-router';

export const useProfileOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleApiError = (err: unknown, defaultMessage: string) => {
    const errorMessage = err instanceof ApiError
      ? err.message
      : defaultMessage;
    setError(errorMessage);
    throw new Error(errorMessage);
  };

  const getProfile = async (): Promise<UserProfile | undefined> => { // Adjust return type
    setIsLoading(true);
    setError(null);
    try {
      const response = await profileService.getProfile();
      return response.data as UserProfile;
    } catch (err) {
      handleApiError(err, 'Failed to fetch profile');
      return undefined; // Ensure a return value in the catch block
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: FormData | Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await profileService.updateProfile(data);
      if (result) {
        // Refresh user data after successful update
        await refreshUser();
        router.back();
      }
      return result.data;
    } catch (err) {
      handleApiError(err, 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    // Implementation of refreshUser function
  };

  return {
    getProfile,
    updateProfile,
    isLoading,
    error,
  };
};
