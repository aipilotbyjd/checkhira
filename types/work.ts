export interface WorkEntry {
  id: number;
  type: string;
  diamond: string;
  price: string;
}

export interface WorkFormData {
  date: Date;
  name: string;
  entries: WorkEntry[];
}

export interface WorkResponse {
  id: number;
  date: string;
  name: string;
  total: number;
  work_items: {
    id: number;
    type: string;
    diamond: string;
    price: string;
    work_id: number;
  }[];
}

export interface Work {
  id: number;
  name: string;
  date: string;
  user_id: number;
  is_active: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  work_items: WorkItem[];
}

export interface WorkItem {
  id: number;
  type: string;
  diamond: string | null;
  price: string | null;
  work_id: number;
  is_active: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
}

export interface WorkEntryPayload {
  date: string;
  name: string;
  entries: WorkEntry[];
  total: number;
}
