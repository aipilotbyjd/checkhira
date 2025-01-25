import { api, handleResponse } from './api';

export interface AppSettings {
  payment_sources: Array<{
    id: number;
    name: string;
    icon: string;
  }>;
  // Add other settings as needed
  app_version: string;
  maintenance_mode: boolean;
  features: {
    payments_enabled: boolean;
    work_entries_enabled: boolean;
  };
}

export const settingsService = {
  async getSettings() {
    const response = await fetch(`${api.baseUrl}/settings`, {
      headers: await api.getHeaders(),
    });
    return handleResponse<{ data: AppSettings }>(response);
  },
};
