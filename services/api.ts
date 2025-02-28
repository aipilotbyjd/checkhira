import AsyncStorage from '@react-native-async-storage/async-storage';
import { environment } from '../config/environment';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'An error occurred');
  }

  return data;
};

export const api = {
  baseUrl: environment.apiUrl,

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
  },

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem('token', token);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem('token');
  },

  async getHeaders() {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    return handleResponse<T>(response);
  },
};
