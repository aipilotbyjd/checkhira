import { api } from './axiosClient';

export interface SearchResult {
  id: string;
  type: 'payment' | 'work';
  from?: string;
  name?: string;
  description: string;
  amount?: number;
  date: string;
  source?: {
    id: number;
    name: string;
    icon: string;
  };
  total_items?: number;
  total_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface SearchResponse {
  status: string;
  message: string;
  data: {
    payments: SearchResult[];
    pagination: {
      current_page: number;
      last_page: number;
      total: number;
      per_page: number;
      has_more_pages: boolean;
    }
  };
}

export interface GlobalSearchResponse {
  status: string;
  message: string;
  data: {
    payments: SearchResult[];
    works: SearchResult[];
    pagination: {
      current_page: number;
      last_page: number;
      total_payments: number;
      total_works: number;
      per_page: number;
      has_more_pages: boolean;
    }
  };
}

class SearchService {
  async searchPayments(
    query: string,
    page?: number | null,
    filter?: 'all' | 'today' | 'week' | 'month' | null,
    sortBy?: 'date' | 'amount' | 'from' | null,
    sortDirection?: 'asc' | 'desc' | null,
    minAmount?: number | null,
    maxAmount?: number | null
  ): Promise<SearchResponse> {
    try {
      const response = await api.get('/search', {
        query,
        page,
        filter,
        sortBy,
        sortDirection,
        minAmount,
        maxAmount
      });
      return response;
    } catch (error) {
      console.error('Search payments error:', error);
      throw error;
    }
  }

  async searchAll(query: string, page: number = 1): Promise<GlobalSearchResponse> {
    try {
      const response = await api.get('/search/all', {
        params: { query, page }
      });
      return response.data;
    } catch (error) {
      console.error('Global search error:', error);
      throw error;
    }
  }
}

export const searchService = new SearchService(); 