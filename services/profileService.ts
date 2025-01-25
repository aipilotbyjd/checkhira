import { api, handleResponse } from './api';
import { Platform } from 'react-native';

export interface UserProfile {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  profile_image: string;
  tempImageUri?: string;
  imageFile?: {
    uri: string;
    name: string;
    type: string;
  };
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

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
  Object.keys(body).forEach(key => {
    formData.append(key, body[key]);
  });

  return formData;
}

export const profileService = {
  async getProfile(): Promise<ProfileResponse> {
    const response = await fetch(`${api.baseUrl}/profile`, {
      headers: await api.getHeaders(),
    });
    return handleResponse<ProfileResponse>(response);
  },

  async updateProfile(data: FormData | Partial<UserProfile>): Promise<ProfileResponse> {
    const headers = await api.getHeaders();
    
    // If data is UserProfile object with tempImageUri, convert to FormData
    if (!('append' in data) && 'tempImageUri' in data) {
      const { tempImageUri, ...profileData } = data as UserProfile;
      const formData = createFormData(tempImageUri!, profileData);
      delete headers['Content-Type']; // Let browser set correct content type for FormData
      
      const response = await fetch(`${api.baseUrl}/profile`, {
        method: 'PUT',
        headers,
        body: formData,
      });
      return handleResponse<ProfileResponse>(response);
    }
    
    // Handle regular FormData or UserProfile without image
    if (data instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(`${api.baseUrl}/profile`, {
      method: 'PUT',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    return handleResponse<ProfileResponse>(response);
  },
};
