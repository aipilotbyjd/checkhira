import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://your-api-url.com';

export const api = {
  baseUrl: API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Add any authentication headers here
  },
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.message || 'An error occurred');
  }
  return response.json();
}
