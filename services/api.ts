import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
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
    return await SecureStore.getItemAsync('token');
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('token', token);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync('token');
  },

  async getHeaders() {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers },
      });

      if (response.status === 401) {
        await this.removeToken();
        throw new Error('Session expired - please login again');
      }

      return handleResponse<T>(response);
    } catch (error) {
      throw error;
    }
  },
};
