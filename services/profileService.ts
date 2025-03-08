import { api } from './axiosClient';
import { Platform } from 'react-native';
import { UserProfile } from '../types/user';

export interface ProfileResponse {
  status: boolean;
  data: UserProfile;
  message: string;
}

const createFormData = (imageUri: string, body: Record<string, any> = {}) => {
  const formData = new FormData();

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

  // Append other form fields
  Object.keys(body).forEach((key) => {
    formData.append(key, body[key]);
  });

  return formData;
};

export const profileService = {
  async getProfile(): Promise<ProfileResponse> {
    return api.get<ProfileResponse>('/profile', undefined, {
      cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
  },

  async updateProfile(data: FormData | Partial<UserProfile>): Promise<ProfileResponse> {
    if (data instanceof FormData) {
      return api.upload<ProfileResponse>('/profile', data);
    } else {
      return api.put<ProfileResponse, Partial<UserProfile>>('/profile', data);
    }
  },
};
