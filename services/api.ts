import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://hirabook.icu/api/v1';

interface User {
  token: string;
  [key: string]: any;
}

export const api = {
  baseUrl: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  async getHeaders() {
    const userStr = await AsyncStorage.getItem('user');
    const user: User | null = userStr ? JSON.parse(userStr) : null;
    const token = user?.token;
    
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'An error occurred');
  }
  return data;
}
