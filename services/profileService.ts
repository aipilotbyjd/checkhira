import { api } from './axiosClient';
import { Platform } from 'react-native';
import { UserProfile } from '../types/user';

export interface ProfileResponse {
  status: boolean;
  data: UserProfile;
  message: string;
}

export const createFormData = (imageUri: string, body: Record<string, any> = {}) => {
  const formData = new FormData();

  // Append all body fields first
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
  });

  // Append image file if exists
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

  return formData;
};

export const profileService = {
  async updateProfile(data: FormData | Partial<UserProfile>): Promise<ProfileResponse> {
    if (data instanceof FormData) {
      return api.upload<ProfileResponse>(
        '/profile', // Ensure this endpoint is correct
        data,
        undefined,
        {},  // Headers are handled internally
        'POST' // Ensure the method is correct
      );
    }
    return api.put<ProfileResponse, Partial<UserProfile>>('/profile', data);
  },
  async getProfile(): Promise<ProfileResponse> {
    return api.get<ProfileResponse>('/profile');
  },
};
