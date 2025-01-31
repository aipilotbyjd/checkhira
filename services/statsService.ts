import { api, handleResponse } from './api';

interface TimePeriodStats {
  works: number;
  payments: number;
  total_amount: number;
}

interface Stats {
  status: string;
  message: string;
  data: {
    today: TimePeriodStats;
    weekly: TimePeriodStats;
    monthly: TimePeriodStats;
  };
}

export const statsService = {
  async getStats() {
    const response = await fetch(`${api.baseUrl}/stats/recent`, {
      headers: await api.getHeaders(),
    });
    return handleResponse(response) as Promise<Stats>;
  },
};
