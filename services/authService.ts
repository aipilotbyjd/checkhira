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
    const response = await fetch(`${api.baseUrl}/auth/register`, {
      method: 'POST',
      headers: api.headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async login(data: LoginPayload) {
    const response = await fetch(`${api.baseUrl}/auth/login`, {
      method: 'POST',
      headers: api.headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async phoneLogin(phone: string) {
    const response = await fetch(`${api.baseUrl}/auth/phone-login`, {
      method: 'POST',
      headers: api.headers,
      body: JSON.stringify({ phone }),
    });
    return handleResponse(response);
  },

  async verifyOtp(phone: string, otp: string) {
    const response = await fetch(`${api.baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: api.headers,
      body: JSON.stringify({ phone, otp }),
    });
    return handleResponse(response);
  },
};
