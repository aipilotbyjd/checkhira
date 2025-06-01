export interface ApiWorkItem {
  id: number;
  type: string; // Job Type Code like 'A', 'B'
  diamond: number; // This seems to be the quantity for this specific item
  price: string; // Price per unit/diamond for this item
  work_id: number;
  // other fields if needed by logic but not displayed directly (e.g., is_active, timestamps)
}

export interface ApiWorkRecord {
  id: number;
  name: string; // Main name/title of the work batch/order
  description: string | null; // Additional notes for the batch/order
  date: string; // ISO Date string
  total: string; // Total earning for this work record (numeric string)
  user_id: number;
  work_items: ApiWorkItem[];
  // other fields (e.g., is_active, timestamps)
}

export interface ApiPaymentRecord {
  id: number;
  name: string | null; // Seems to be often null in API response
  amount: string; // numeric string
  category: string | null; // Often null
  description: string | null; // Main notes for the payment
  from: string | null; // Who the payment is from
  source_id: number | null;
  date: string; // ISO Date string
  user_id: number;
  // other fields
}

export interface TransformedWorkEntry {
  id: number;
  date: string;
  title: string; // Mapped from ApiWorkRecord.name
  notes?: string | null; // Mapped from ApiWorkRecord.description
  quantity: number; // Sum of ApiWorkRecord.work_items[...].diamond
  calculated_earning: number; // Mapped from parseFloat(ApiWorkRecord.total)
  task_type_code?: string | null; // Mapped from ApiWorkRecord.work_items[0]?.type (type of first item)
}

export interface TransformedPaymentEntry {
  id: number;
  date: string;
  amount: number;
  from?: string | null;
  notes?: string | null; // Mapped from ApiPaymentRecord.description
  source_id?: number | null;
}

export interface ApiResponseData {
  records: {
    works: ApiWorkRecord[];
    payments: ApiPaymentRecord[];
  };
  summary: {
    work: {
      total_records: number;
      total_amount: number;
    };
    payment: {
      total_records: number;
      total_amount: number;
    };
  };
}

export interface JobType {
  id: string | number;
  code: string;
  name: string;
  name_en?: string;
  name_gu?: string;
  name_hi?: string;
  description_en?: string;
  description_gu?: string;
  description_hi?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiErrorResponse {
  message: string;
  // other potential error fields
}

export interface WorkEntry {
  id: string; // Or number, depending on your API
  user_id?: number;
  date: string; // ISO date string e.g., "2023-10-27"
  task_type_code?: string;
  description: string;
  quantity: number;
  price_per_unit: number;
  calculated_earning: number;
  payment_status: 'Unpaid' | 'Partially Paid' | 'Paid';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  unit?: string;
}

export interface ReportPaymentEntry { // Based on Payment from types/payment.ts
  id: string;
  user_id?: number;
  amount: string | number; // Changed from amountPaid
  date: string;
  from?: string;
  source_id: number;
  description?: string;
  notes?: string | null;
  source?: {
    id: number;
    name: string;
    name_en?: string;
    name_hi?: string;
    name_gu?: string;
    icon?: string;
  };
  linked_work_entry_ids?: string[]; // Or number[]
  created_at?: string;
  updated_at?: string;
}

export type ViewMode = 'work' | 'payment' | 'combined';
export type QuickFilterType = 'today' | 'yesterday' | 'last7' | 'last15' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom';

export interface ReportFilters {
  quickFilter: QuickFilterType | null;
  startDate: string | null; // ISO date string
  endDate: string | null;   // ISO date string
  viewMode: ViewMode;
  searchQuery: string;
  taskTypeCode?: string | null; // For filtering by job type CODE
}

// Generic wrapper for standard API responses
export interface StandardApiResponse<T> {
  status: number; // Or string, depending on your API
  message: string;
  data: T;
} 