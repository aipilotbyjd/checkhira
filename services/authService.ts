import { api } from './api';

interface AuthResponse {
  status: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
}

export const authService = {
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const response = await api.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    if (response.data.token) {
      await api.setToken(response.data.token);
    }
    return response;
  },

  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await api.request<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.data.token) {
      await api.setToken(response.data.token);
    }
    return response;
  },

  async logout(): Promise<void> {
    try {
      await api.request('/logout', {
        method: 'POST',
      });
    } finally {
      await api.removeToken();
    }
  },

  async checkAuth(): Promise<boolean> {
    try {
      const token = await api.getToken();
      return !!token;
    } catch {
      return false;
    }
  },

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await api.request('/verify-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },
};
