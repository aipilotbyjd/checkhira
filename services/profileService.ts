import { api, handleResponse } from './api';

export interface UserProfile {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  profile_image?: string;
  tempImageUri?: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileResponse {
  status: boolean;
  data: UserProfile;
  message: string;
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
    
    // Remove Content-Type header for FormData
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
