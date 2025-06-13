import { useState, useEffect, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useApi } from './useApi';
import reportService from '../services/reportService';
import {
    ApiWorkRecord,
    ApiPaymentRecord,
    TransformedWorkEntry,
    TransformedPaymentEntry,
    ApiResponseData,
    JobType,
    ReportFilters,
    ViewMode,
    QuickFilterType,
} from '../types/reports';
import { useLanguage } from '../contexts/LanguageContext';

const A_Z_LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

const STATIC_JOB_TYPES: JobType[] = A_Z_LETTERS.map(letter => ({
    id: letter,
    code: letter,
    name: `Type ${letter}`,
    name_en: `Type ${letter}`,
    name_gu: `પ્રકાર ${letter}`,
    name_hi: `प्रकार ${letter}`,
    description_en: `Description for Type ${letter}`,
    description_gu: `પ્રકાર ${letter} માટે વર્ણન`,
    description_hi: `प्रकार ${letter} के लिए विवरण`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}));

const SAVED_FILTERS_STORAGE_KEY = '@Checkhira/ReportSavedFilters';

// --- Helper Functions ---
const getDateRangeForQuickFilter = (filter: QuickFilterType): { startDate: string, endDate: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate = new Date(today);
    let endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    switch (filter) {
        case 'today':
            break;
        case 'yesterday':
            startDate.setDate(today.getDate() - 1);
            endDate.setDate(today.getDate() - 1);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'last7':
            startDate.setDate(today.getDate() - 6);
            break;
        case 'last15':
            startDate.setDate(today.getDate() - 14);
            break;
        case 'last30':
            startDate.setDate(today.getDate() - 29);
            break;
        case 'thisMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'lastMonth':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            endDate.setHours(23, 59, 59, 999);
            break;
    }
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
    };
};

const escapeCsvField = (field: any): string => {
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    if (/[",\n]/.test(stringField)) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

const convertToCsv = (
    workData: TransformedWorkEntry[],
    paymentData: TransformedPaymentEntry[],
    filters: ReportFilters
): string => {
    let csvString = '';
    const headers = {
        work: ['Date', 'Title', 'Notes', 'Quantity', 'Earning', 'Task Type'],
        payment: ['Date', 'Amount', 'From', 'Notes'],
    };

    if ((filters.viewMode === 'work' || filters.viewMode === 'combined') && workData.length > 0) {
        csvString += headers.work.join(',') + '\n';
        workData.forEach(item => {
            const row = [
                item.date,
                item.title,
                item.notes,
                item.quantity,
                item.calculated_earning,
                item.task_type_code,
            ].map(escapeCsvField).join(',');
            csvString += row + '\n';
        });
        csvString += '\n';
    }

    if ((filters.viewMode === 'payment' || filters.viewMode === 'combined') && paymentData.length > 0) {
        csvString += headers.payment.join(',') + '\n';
        paymentData.forEach(item => {
            const row = [
                item.date,
                item.amount,
                item.from,
                item.notes,
            ].map(escapeCsvField).join(',');
            csvString += row + '\n';
        });
    }
    return csvString;
};

const generateHtmlReport = (
    workData: TransformedWorkEntry[],
    paymentData: TransformedPaymentEntry[],
    filters: ReportFilters,
    summary: any,
    t: (key: string) => string
): string => {
    const { totalWorkRecords, totalWorkAmount, totalPaymentRecords, totalPaymentAmount } = summary;

    let workHtml = '';
    if ((filters.viewMode === 'work' || filters.viewMode === 'combined') && workData.length > 0) {
        workHtml = `
            <h2>${t('reportsPage.workEntriesTitle')}</h2>
            <p>${t('reportsPage.kpi.workTotalRecords')}: ${totalWorkRecords}</p>
            <p>${t('reportsPage.kpi.workTotalAmount')}: ${totalWorkAmount.toFixed(2)}</p>
            <table border="1" cellpadding="5" style="width:100%; border-collapse: collapse;">
                <tr><th>${t('date')}</th><th>${t('description')}</th><th>${t('quantity')}</th><th>${t('reportsPage.earning')}</th><th>${t('reportsPage.jobType')}</th></tr>
                ${workData.map(item => `
                    <tr>
                        <td>${new Date(item.date).toLocaleDateString()}</td>
                        <td>${item.title || ''}${item.notes ? `<br/><small><em>${item.notes}</em></small>` : ''}</td>
                        <td>${item.quantity}</td>
                        <td>${(item.calculated_earning || 0).toFixed(2)}</td>
                        <td>${item.task_type_code || 'N/A'}</td>
                    </tr>`).join('')}
            </table>`;
    }

    let paymentHtml = '';
    if ((filters.viewMode === 'payment' || filters.viewMode === 'combined') && paymentData.length > 0) {
        paymentHtml = `
            <h2>${t('reportsPage.paymentEntriesTitle')}</h2>
            <p>${t('reportsPage.kpi.paymentTotalRecords')}: ${totalPaymentRecords}</p>
            <p>${t('reportsPage.kpi.paymentTotalAmount')}: ${totalPaymentAmount.toFixed(2)}</p>
            <table border="1" cellpadding="5" style="width:100%; border-collapse: collapse;">
                <tr><th>${t('date')}</th><th>${t('amount')}</th><th>${t('from')}</th><th>${t('notes')}</th></tr>
                ${paymentData.map(item => `
                    <tr>
                        <td>${new Date(item.date).toLocaleDateString()}</td>
                        <td>${(item.amount || 0).toFixed(2)}</td>
                        <td>${item.from || 'N/A'}</td>
                        <td>${item.notes || ''}</td>
                    </tr>`).join('')}
            </table>`;
    }

    return `
        <html>
            <head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Report</title><style>body{font-family:sans-serif;font-size:14px;} table{width:100%;border-collapse:collapse;font-size:12px;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background-color:#f2f2f2;} h1{font-size:20px;} h2{font-size:16px; border-bottom:1px solid #ccc; padding-bottom:5px; margin-top:20px;}</style></head>
            <body>
                <h1>${t('reportsPage.title')}</h1>
                <p><strong>${t('reportPeriodLabel')}:</strong> ${new Date(filters.startDate!).toLocaleDateString()} - ${new Date(filters.endDate!).toLocaleDateString()}</p>
                ${workHtml}
                ${paymentHtml}
            </body>
        </html>`;
};

export const useReports = () => {
    const { t, locale } = useLanguage();
    const { execute, isLoading: apiIsLoading, error: apiError, data: rawApiData } = useApi<ApiResponseData>();

    const [filters, setFilters] = useState<ReportFilters>({
        quickFilter: 'today',
        startDate: getDateRangeForQuickFilter('today').startDate,
        endDate: getDateRangeForQuickFilter('today').endDate,
        viewMode: 'work',
        searchQuery: '',
        taskTypeCode: null,
    });

    const [savedFiltersList, setSavedFiltersList] = useState<{ name: string; criteria: ReportFilters }[]>([]);
    const [workData, setWorkData] = useState<TransformedWorkEntry[]>([]);
    const [paymentData, setPaymentData] = useState<TransformedPaymentEntry[]>([]);
    const [isProcessingData, setIsProcessingData] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const loadSavedFilters = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem(SAVED_FILTERS_STORAGE_KEY);
                if (jsonValue !== null) setSavedFiltersList(JSON.parse(jsonValue));
            } catch (e) {
                console.error("Failed to load saved filters.", e);
            }
        };
        loadSavedFilters();
    }, []);

    const saveFiltersToStorage = async (filtersToSave: { name: string; criteria: ReportFilters }[]) => {
        try {
            const jsonValue = JSON.stringify(filtersToSave);
            await AsyncStorage.setItem(SAVED_FILTERS_STORAGE_KEY, jsonValue);
        } catch (e) {
            console.error("Failed to save filters.", e);
        }
    };

    const fetchAndProcessReportData = useCallback(async () => {
        if (!filters.startDate || !filters.endDate) {
            setWorkData([]); setPaymentData([]); return;
        }
        setIsProcessingData(true); setWorkData([]); setPaymentData([]);
        try {
            await execute(() => reportService.fetchReportData(filters));
        } catch (err) {
            // error is handled by useApi hook
        }
    }, [filters, execute]);

    useEffect(() => {
        fetchAndProcessReportData();
    }, [fetchAndProcessReportData]);

    useEffect(() => {
        if (rawApiData && !apiIsLoading) {
            setIsProcessingData(true);
            const { records } = rawApiData;

            const transformedWorks: TransformedWorkEntry[] = (records?.works || []).map((work: ApiWorkRecord) => ({
                id: work.id,
                date: work.date,
                title: work.name,
                notes: work.description,
                quantity: work.work_items.reduce((sum, item) => sum + Number(item.diamond || 0), 0),
                calculated_earning: parseFloat(work.total) || 0,
                task_type_code: work.work_items[0]?.type,
            }));
            setWorkData(transformedWorks);

            const transformedPayments: TransformedPaymentEntry[] = (records?.payments || []).map((payment: ApiPaymentRecord) => ({
                id: payment.id,
                date: payment.date,
                amount: parseFloat(payment.amount) || 0,
                from: payment.from,
                notes: payment.description,
                source_id: payment.source_id,
            }));
            setPaymentData(transformedPayments);
            setIsProcessingData(false);
        } else if (!apiIsLoading && !apiError && !rawApiData) {
            setIsProcessingData(false);
        } else if (apiError) {
            setIsProcessingData(false);
            setWorkData([]);
            setPaymentData([]);
        }
    }, [rawApiData, apiIsLoading, apiError]);

    const handleFilterChange = useCallback((newFilters: Partial<ReportFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const handleQuickFilterChange = useCallback((filterKey: QuickFilterType) => {
        if (filterKey === 'custom') {
            // This will be handled by the UI to open the date picker
            return;
        }
        const { startDate, endDate } = getDateRangeForQuickFilter(filterKey);
        handleFilterChange({ quickFilter: filterKey, startDate, endDate });
    }, [handleFilterChange]);

    const handleCustomDateChange = useCallback((newStartDate: string, newEndDate: string) => {
        handleFilterChange({ quickFilter: 'custom', startDate: newStartDate, endDate: newEndDate });
    }, [handleFilterChange]);

    const saveCurrentFilter = useCallback(async (name: string) => {
        if (!name || name.trim().length === 0) {
            throw new Error(t('reportsPage.saveFilterPrompt.errorEmpty'));
        }
        const trimmedName = name.trim();
        if (savedFiltersList.some(f => f.name.toLowerCase() === trimmedName.toLowerCase())) {
            throw new Error(t('reportsPage.saveFilterPrompt.errorMessage'));
        }
        const newSavedFilters = [...savedFiltersList, { name: trimmedName, criteria: { ...filters } }];
        setSavedFiltersList(newSavedFilters);
        await saveFiltersToStorage(newSavedFilters);
    }, [filters, savedFiltersList, t]);

    const applySavedFilter = useCallback((savedFilter: { name: string; criteria: ReportFilters }) => {
        setFilters(savedFilter.criteria);
    }, []);

    const removeSavedFilter = useCallback(async (filterNameToRemove: string) => {
        const newSavedFilters = savedFiltersList.filter(f => f.name !== filterNameToRemove);
        setSavedFiltersList(newSavedFilters);
        await saveFiltersToStorage(newSavedFilters);
    }, [savedFiltersList]);

    const { totalWorkRecords, totalWorkAmount, totalPaymentRecords, totalPaymentAmount } = useMemo(() => {
        let currentWorkRecords = 0;
        let currentWorkAmount = 0;
        let currentPaymentRecords = 0;
        let currentPaymentAmount = 0;

        if (filters.viewMode === 'work' || filters.viewMode === 'combined') {
            currentWorkRecords = workData.length;
            currentWorkAmount = workData.reduce((sum, entry) => sum + (Number(entry.calculated_earning) || 0), 0);
        }

        if (filters.viewMode === 'payment' || filters.viewMode === 'combined') {
            currentPaymentRecords = paymentData.length;
            currentPaymentAmount = paymentData.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
        }

        return {
            totalWorkRecords: currentWorkRecords,
            totalWorkAmount: currentWorkAmount,
            totalPaymentRecords: currentPaymentRecords,
            totalPaymentAmount: currentPaymentAmount
        };
    }, [workData, paymentData, filters.viewMode]);

    const exportReport = useCallback(async (format: 'pdf' | 'csv') => {
        setIsExporting(true);
        try {
            if (!workData.length && !paymentData.length) {
                throw new Error(t('noDataToExport'));
            }

            let content = '';
            let fileExtension = '';
            let mimeType = '';
            const summary = { totalWorkRecords, totalWorkAmount, totalPaymentRecords, totalPaymentAmount };

            if (format === 'csv') {
                content = convertToCsv(workData, paymentData, filters);
                fileExtension = '.csv';
                mimeType = 'text/csv';
            } else {
                content = generateHtmlReport(workData, paymentData, filters, summary, t as (key: string) => string);
                fileExtension = '.html';
                mimeType = 'text/html';
            }

            const fileName = `Checkhira-Report-${new Date().toISOString().split('T')[0]}${fileExtension}`;
            const fileUri = FileSystem.documentDirectory + fileName;

            await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });

            if (!(await Sharing.isAvailableAsync())) {
                throw new Error(t('sharingNotAvailable'));
            }

            await Sharing.shareAsync(fileUri, {
                mimeType,
                dialogTitle: t(format === 'csv' ? 'reportsPage.exportAsCSV' : 'reportsPage.exportAsPDF'),
            });
        } catch (error: any) {
            console.error("Export error:", error);
            alert(error.message || "An unexpected error occurred during export.");
        } finally {
            setIsExporting(false);
        }
    }, [filters, workData, paymentData, t, totalWorkRecords, totalWorkAmount, totalPaymentRecords, totalPaymentAmount]);

    const quickFilterOptions = useMemo(() => [
        { key: 'today' as QuickFilterType, label: t('reportsPage.filters.today') },
        { key: 'yesterday' as QuickFilterType, label: t('reportsPage.filters.yesterday') },
        { key: 'last7' as QuickFilterType, label: t('reportsPage.filters.last7Days') },
        { key: 'last30' as QuickFilterType, label: t('reportsPage.filters.last30Days') },
        { key: 'thisMonth' as QuickFilterType, label: t('reportsPage.filters.thisMonth') },
        { key: 'lastMonth' as QuickFilterType, label: t('reportsPage.filters.lastMonth') },
    ], [t]);

    const jobTypeFilterOptions = useMemo(() => {
        const getLocalizedName = (jt: JobType) => {
            if (locale === 'gu' && jt.name_gu) return jt.name_gu;
            if (locale === 'hi' && jt.name_hi) return jt.name_hi;
            return jt.name_en || jt.name || '';
        };
        const sortedTypes = [...STATIC_JOB_TYPES]
            .sort((a, b) => getLocalizedName(a).localeCompare(getLocalizedName(b)))
            .slice(0, 10);
        return [
            { code: null, name: t('reportsPage.filters.typeAWork'), name_en: t('reportsPage.filters.typeAWork'), name_gu: t('reportsPage.filters.typeAWork'), name_hi: t('reportsPage.filters.typeAWork'), id: 'all-types-filter' },
            ...sortedTypes
        ] as (JobType | { code: null; name: string; name_en: string; name_gu: string; name_hi: string; id: string; })[];
    }, [locale, t]);

    return {
        // State
        filters,
        savedFiltersList,
        workData,
        paymentData,
        isLoading: apiIsLoading || isProcessingData,
        isExporting,
        apiError,

        // Derived State
        totalWorkRecords,
        totalWorkAmount,
        totalPaymentRecords,
        totalPaymentAmount,
        quickFilterOptions,
        jobTypeFilterOptions,
        STATIC_JOB_TYPES,

        // Callbacks
        handleFilterChange,
        handleQuickFilterChange,
        handleCustomDateChange,
        saveCurrentFilter,
        applySavedFilter,
        removeSavedFilter,
        exportReport,
    };
};