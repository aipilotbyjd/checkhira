export interface JobType {
    code: string;
    name: string; // Potentially with localized versions like name_en, name_gu
    name_en?: string;
    name_gu?: string;
    name_hi?: string;
    icon?: string;
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