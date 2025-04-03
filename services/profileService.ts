import { api } from './axiosClient';
import { Platform } from 'react-native';
import { UserProfile } from '../types/user';

export interface ProfileResponse {
  status: boolean;
  data: UserProfile;
  message: string;
}

// Add export keyword here
export const createFormData = (imageUri: string, body: Record<string, any> = {}) => {
  const formData = new FormData();

  if (imageUri) {
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('profile_image', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      name: filename,
      type,
    } as any);
  }

  // Append all body fields including nested objects
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    }
  });

  return formData;
};

export const profileService = {
  async updateProfile(data: FormData | Partial<UserProfile>): Promise<ProfileResponse> {
    if (data instanceof FormData) {
      return api.upload<ProfileResponse>(
        '/profile',
        data,
        undefined,
        {},  // Remove headers from here
        'PUT'
      );
    }
    return api.put<ProfileResponse, Partial<UserProfile>>('/profile', data);
  },
  async getProfile(): Promise<ProfileResponse> {
    return api.get<ProfileResponse>('/profile', undefined, {
      cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
  },
};
