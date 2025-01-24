import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://hirabook.icu/api/v1';

export const api = {
  baseUrl: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  async getHeaders() {
    const user = await AsyncStorage.getItem('user');
    console.log('User:', user);
    const token = user ? JSON.parse(user).token : null;
    console.log('Current token:', token);
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
