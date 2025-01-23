import { api, handleResponse } from './api';

export interface UserProfile {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  profile_image?: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const profileService = {
  async getProfile() {
    const response = await fetch(`${api.baseUrl}/profile`, {
      headers: await api.getHeaders(),
    });
    return handleResponse(response);
  },

  async updateProfile(data: UserProfile) {
    const response = await fetch(`${api.baseUrl}/profile`, {
      method: 'PUT',
      headers: await api.getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async uploadProfileImage(imageUri: string) {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename ?? '');
    const type = match ? `image/${match[1]}` : 'image';

    formData.append('profile_image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await fetch(`${api.baseUrl}/profile/image`, {
      method: 'POST',
      headers: {
        ...(await api.getHeaders()),
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    return handleResponse(response);
  },
};
