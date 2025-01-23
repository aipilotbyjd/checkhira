import { useState } from 'react';
import { Alert } from 'react-native';
import { profileService, UserProfile } from '../services/profileService';
import { ApiError } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

export const useProfileOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await profileService.getProfile();
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: UserProfile) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await profileService.updateProfile(profileData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update profile';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to update your profile picture.'
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const uploadProfileImage = async (imageUri: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await profileService.uploadProfileImage(imageUri);
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to upload profile image';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const mapToSnakeCase = (data: UserProfile) => {
    return {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      profile_image: data.profile_image,
    };
  };

  return {
    isLoading,
    error,
    getProfile,
    updateProfile,
    pickImage,
    uploadProfileImage,
  };
};
