import { api } from './api';
import { JobType, ReportPaymentEntry, WorkEntry } from '../types/reports';

export interface ReportParams {
    startDate: string | null;
    endDate: string | null;
    search?: string;
    status?: 'Paid' | 'Unpaid' | null;
    job_type_id?: number | null;
}

const buildQueryString = (params: ReportParams): string => {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.job_type_id !== undefined && params.job_type_id !== null) query.append('job_type_id', String(params.job_type_id));

    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
};

const reportService = {
    getWorkEntries: (params: ReportParams): Promise<WorkEntry[]> => {
        const queryString = buildQueryString(params);
        return api.request<WorkEntry[]>(`/reports/work-entries${queryString}`);
    },

    getPaymentEntries: (params: ReportParams): Promise<ReportPaymentEntry[]> => {
        const queryString = buildQueryString(params);
        return api.request<ReportPaymentEntry[]>(`/reports/payments${queryString}`);
    },

    getJobTypes: (): Promise<JobType[]> => {
        return api.request<JobType[]>('/job-types');
    },
};

export default reportService; 