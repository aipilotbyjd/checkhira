import { api } from './axiosClient';
import { ApiResponseData, ReportFilters, StandardApiResponse } from '../types/reports';

const reportService = {
    fetchReportData: async (filters: ReportFilters): Promise<ApiResponseData> => {
        if (!filters.startDate || !filters.endDate) {
            return Promise.reject(new Error('Start date and end date are required for fetching report data.'));
        }

        let reportTypeParam = '';
        if (filters.viewMode === 'work') {
            reportTypeParam = 'work';
        } else if (filters.viewMode === 'payments') {
            reportTypeParam = 'payment';
        } // For 'combined', reportTypeParam remains empty

        const params: Record<string, any> = {
            report_type: reportTypeParam,
            start_date: filters.startDate,
            end_date: filters.endDate,
        };

        if (filters.searchQuery) {
            params.search = filters.searchQuery;
        }

        if (filters.taskTypeCode && (filters.viewMode === 'work' || filters.viewMode === 'combined')) {
            params.job_type = filters.taskTypeCode;
        }

        try {
            const responseWrapper = await api.get<StandardApiResponse<ApiResponseData>>('/reports', { params });
            return responseWrapper.data;
        } catch (error) {
            console.error('Error fetching report data in service:', error);
            throw error;
        }
    },
};

export default reportService; 