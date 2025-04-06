export interface Payment {
    id: number;
    amount: string | number;
    date: string;
    from?: string;
    source_id: number;
    user_id?: number;
    description?: string;
    source?: {
        id: number;
        name: string;
        name_en?: string;
        name_hi?: string;
        name_gu?: string;
        icon: string;
    };
    created_at?: string;
    updated_at?: string;
}

export interface PaymentSource {
    id: number;
    name: string;
    name_en?: string;
    name_hi?: string;
    name_gu?: string;
    icon: string;
}

export interface PaymentPayload {
    amount: string | number;
    date: string;
    from?: string;
    source_id: number;
    user_id?: number;
}

export interface PaymentsResponse {
    payments: {
        data: Payment[];
        current_page: number;
        last_page: number;
    };
    total: number;
}
