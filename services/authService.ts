import { api, handleResponse } from './api';

interface AuthResponse {
  status: boolean;
  data: {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
      phone?: string;
      profile_image?: string;
    };
  };
  message: string;
}

export const authService = {
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${api.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });
    return handleResponse<AuthResponse>(response);
  },

  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${api.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },

  async logout(): Promise<void> {
    const response = await fetch(`${api.baseUrl}/logout`, {
      method: 'POST',
      headers: await api.getHeaders(),
    });
    return handleResponse(response);
  },
};
