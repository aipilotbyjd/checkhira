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
