import { api, handleResponse } from './api';

interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  c_password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterPayload) {
    const response = await fetch(`${api.baseUrl}/register`, {
      method: 'POST',
      headers: await api.getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async login(data: LoginPayload) {
    const response = await fetch(`${api.baseUrl}/login`, {
      method: 'POST',
      headers: await api.getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    
    // Ensure the response includes the token
    if (result.status && result.data && !result.data.token) {
      throw new Error('Token not found in response');
    }
    
    return result;
  },

  async phoneLogin(phone: string) {
    const response = await fetch(`${api.baseUrl}/phone-login`, {
      method: 'POST',
      headers: await api.getHeaders(),
      body: JSON.stringify({ phone }),
    });
    return handleResponse(response);
  },

  async verifyOtp(phone: string, otp: string) {
    const response = await fetch(`${api.baseUrl}/verify-otp`, {
      method: 'POST',
      headers: await api.getHeaders(),
      body: JSON.stringify({ phone, otp }),
    });
    return handleResponse(response);
  },

  async forgotPassword(email: string) {
    const response = await fetch(`${api.baseUrl}/forgot-password`, {
      method: 'POST',
      headers: await api.getHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  async logout() {
    const response = await fetch(`${api.baseUrl}/logout`, {
      method: 'POST',
      headers: await api.getHeaders(),
    });
    return handleResponse(response);
  },
};
