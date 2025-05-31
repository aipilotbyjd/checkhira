import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Platform, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useLanguage } from '../../../contexts/LanguageContext';
import AppIcon, { IconFamily } from '../../../components/common/Icon';
import { COLORS } from '../../../constants/theme';
import { useApi } from '../../../hooks/useApi';
import { api } from '../../../services/axiosClient';

// --- TYPE DEFINITIONS (Ideally in types/reports.ts) ---
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

// Transformed types for UI consumption
export interface TransformedWorkEntry {
    id: number;
    date: string;
    title: string; // Mapped from ApiWorkRecord.name
    notes?: string | null; // Mapped from ApiWorkRecord.description
    quantity: number; // Sum of ApiWorkRecord.work_items[...].diamond
    calculated_earning: number; // Mapped from parseFloat(ApiWorkRecord.total)
    task_type_code?: string | null; // Mapped from ApiWorkRecord.work_items[0]?.type (type of first item)
    // unit?: string; // No direct unit from API, can be omitted or hardcoded if needed
}

export interface TransformedPaymentEntry {
    id: number;
    date: string;
    amount: number;
    from?: string | null;
    notes?: string | null; // Mapped from ApiPaymentRecord.description
    source_id?: number | null;
    // Source name is not directly available from this API endpoint's payment record
}

interface ApiResponseData {
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

// Using a local JobType definition since the import was removed earlier
interface JobType {
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

interface ApiErrorResponse {
    message: string;
    // other potential error fields
}
// --- END TYPE DEFINITIONS ---

// --- START STATIC JOB TYPES ---
const A_Z_LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const STATIC_JOB_TYPES: JobType[] = A_Z_LETTERS.map(letter => ({
    id: letter, // Assuming id can be the letter code
    code: letter,
    name: `Type ${letter}`, // Generic name
    name_en: `Type ${letter}`,
    name_gu: `પ્રકાર ${letter}`,
    name_hi: `प्रकार ${letter}`,
    description_en: `Description for Type ${letter}`,
    description_gu: `પ્રકાર ${letter} માટે વર્ણન`,
    description_hi: `प्रकार ${letter} के लिए विवरण`,
    // Add any other required fields from JobType with default values
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}));
// --- END STATIC JOB TYPES ---

type ViewMode = 'work' | 'payments' | 'combined';
type QuickFilterType = 'today' | 'yesterday' | 'last7' | 'last15' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom';

interface ReportFilters {
    quickFilter: QuickFilterType | null;
    startDate: string | null; // ISO date string
    endDate: string | null;   // ISO date string
    viewMode: ViewMode;
    searchQuery: string;
    taskTypeCode?: string | null; // For filtering by job type CODE
}

const getDateRangeForQuickFilter = (filter: QuickFilterType): { startDate: string, endDate: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day
    let startDate = new Date(today);
    let endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999); // End of day

    switch (filter) {
        case 'today':
            // StartDate and endDate are already today
            break;
        case 'yesterday':
            startDate.setDate(today.getDate() - 1);
            endDate.setDate(today.getDate() - 1);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'last7':
            startDate.setDate(today.getDate() - 6); // today is inclusive
            // endDate is today
            break;
        case 'last15':
            startDate.setDate(today.getDate() - 14);
            // endDate is today
            break;
        case 'last30':
            startDate.setDate(today.getDate() - 29);
            // endDate is today
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

// Define types for screen sections
type ScreenSectionType = 'header' | 'filters' | 'viewAndSearch' | 'kpis' | 'visualSummary' | 'workList' | 'paymentList' | 'exportAndShare';
interface ScreenSection {
    id: ScreenSectionType;
}

const screenSections: ScreenSection[] = [
    { id: 'header' },
    { id: 'filters' },
    { id: 'viewAndSearch' },
    { id: 'kpis' },
    { id: 'visualSummary' },
    { id: 'workList' },
    { id: 'paymentList' },
    { id: 'exportAndShare' },
];

const ReportsScreen = () => {
    const { t, locale } = useLanguage();
    const { execute, isLoading: apiIsLoading, error: apiError, data: rawApiData } = useApi<ApiResponseData>();

    const [filters, setFilters] = useState<ReportFilters>({
        quickFilter: 'thisMonth',
        startDate: getDateRangeForQuickFilter('thisMonth').startDate,
        endDate: getDateRangeForQuickFilter('thisMonth').endDate,
        viewMode: 'combined',
        searchQuery: '',
        taskTypeCode: null,
    });

    const [savedFiltersList, setSavedFiltersList] = useState<{ name: string; criteria: ReportFilters }[]>([]);

    // State for transformed data to be used in UI
    const [workData, setWorkData] = useState<TransformedWorkEntry[]>([]);
    const [paymentData, setPaymentData] = useState<TransformedPaymentEntry[]>([]);
    const [reportSummary, setReportSummary] = useState<ApiResponseData['summary'] | null>(null);

    // Combined loading state
    const [isProcessingData, setIsProcessingData] = useState(false);

    // useEffect to fetch and process data from API when filters change
    useEffect(() => {
        const fetchAndProcessReportData = async () => {
            if (!filters.startDate || !filters.endDate) {
                console.log("Start date or end date is missing, skipping API call.");
                // Clear data if dates are invalid
                setWorkData([]);
                setPaymentData([]);
                setReportSummary(null);
                return;
            }

            setIsProcessingData(true);
            setWorkData([]);
            setPaymentData([]);
            setReportSummary(null);

            let reportTypeParam = 'all';
            if (filters.viewMode === 'work') reportTypeParam = 'work';
            else if (filters.viewMode === 'payments') reportTypeParam = 'payment';

            const params: Record<string, any> = {
                report_type: reportTypeParam,
                start_date: filters.startDate,
                end_date: filters.endDate,
            };
            if (filters.searchQuery) params.search = filters.searchQuery;
            if (filters.taskTypeCode) params.job_type = filters.taskTypeCode;

            try {
                // Correctly call execute by wrapping the api call
                await execute(async () => api.get('/reports', { params }));
            } catch (err) {
                // Error is handled by useApi hook and set in apiError
                console.error("API call initiation error (should be caught by useApi):");
            }
            // setIsProcessingData(false); // This will be set in the data processing useEffect
        };

        fetchAndProcessReportData();
    }, [filters, execute]); // Changed makeRequest to execute

    // useEffect to process rawApiData when it changes (after successful API call)
    useEffect(() => {
        // Check if rawApiData itself is the ApiResponseData, not rawApiData.data
        if (rawApiData && !apiIsLoading) { // Process only if not loading and data is present
            setIsProcessingData(true);
            // Directly access records and summary from rawApiData if it's the actual response body
            const { records, summary } = rawApiData;

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
            setReportSummary(summary);
            setIsProcessingData(false);
        } else if (!apiIsLoading && rawApiData === null && !apiError) { // Handle successful call with no data or cleared data
            setWorkData([]);
            setPaymentData([]);
            setReportSummary(null);
            setIsProcessingData(false);
        } else if (apiError) { // Handle API error case specifically
            setIsProcessingData(false); // Stop processing if there's an error
            setWorkData([]);
            setPaymentData([]);
            setReportSummary(null);
        }
    }, [rawApiData, apiIsLoading, apiError]); // Add apiError to dependencies

    const handleQuickFilterChange = (filterKey: QuickFilterType) => {
        if (filterKey === 'custom') {
            setFilters(prev => ({ ...prev, quickFilter: 'custom' }));
            openCustomDateRangePicker();
            return;
        }
        const { startDate, endDate } = getDateRangeForQuickFilter(filterKey);
        setFilters(prev => ({
            ...prev,
            quickFilter: filterKey,
            startDate,
            endDate,
        }));
    };

    const openCustomDateRangePicker = () => {
        console.log("Open custom date range picker - to be implemented");
    };

    const saveCurrentFilter = () => {
        const filterName = `Saved Filter ${savedFiltersList.length + 1}`;
        setSavedFiltersList(prev => [...prev, { name: filterName, criteria: { ...filters } }]);
        console.log("Save current filter:", filterName, filters);
    };

    const applySavedFilter = (savedFilter: { name: string; criteria: ReportFilters }) => {
        setFilters(savedFilter.criteria);
    };

    const removeSavedFilter = (filterNameToRemove: string) => {
        setSavedFiltersList(prev => prev.filter(f => f.name !== filterNameToRemove));
    };

    const handleViewModeChange = (mode: ViewMode) => {
        setFilters(prev => ({ ...prev, viewMode: mode }));
    };

    const handleSearchQueryChange = (text: string) => {
        setFilters(prev => ({ ...prev, searchQuery: text }));
    };

    const handleTaskTypeCodeFilterChange = (code: string | null) => {
        setFilters(prev => ({ ...prev, taskTypeCode: code }));
    };

    const exportReport = (format: 'pdf' | 'csv') => {
        console.log(`Exporting report as ${format} with filters:`, filters);
    };

    const quickFilterOptions: { key: QuickFilterType; label: string; icon?: string, iconFamily?: IconFamily }[] = [
        { key: 'today', label: t('reportsPage.filters.today'), icon: 'calendar-today' },
        { key: 'yesterday', label: t('reportsPage.filters.yesterday'), icon: 'calendar-clock' },
        { key: 'last7', label: t('reportsPage.filters.last7Days'), icon: 'calendar-week' },
        { key: 'last30', label: t('reportsPage.filters.last30Days'), icon: 'calendar-month' },
        { key: 'thisMonth', label: t('reportsPage.filters.thisMonth'), icon: 'calendar-month-outline' },
        { key: 'lastMonth', label: t('reportsPage.filters.lastMonth'), icon: 'calendar-arrow-left' },
    ];

    const jobTypeFilterOptions = useMemo(() => {
        const getLocalizedName = (jt: JobType) => {
            if (locale === 'gu' && jt.name_gu) return jt.name_gu;
            if (locale === 'hi' && jt.name_hi) return jt.name_hi;
            return jt.name_en || jt.name || '';
        };
        const sortedTypes = [...STATIC_JOB_TYPES]
            .sort((a, b) => {
                const nameA = getLocalizedName(a).toLowerCase();
                const nameB = getLocalizedName(b).toLowerCase();
                return nameA.localeCompare(nameB);
            })
            .slice(0, 10);
        return [
            { code: null, name: t('reportsPage.filters.typeAWork'), name_en: t('reportsPage.filters.typeAWork'), name_gu: t('reportsPage.filters.typeAWork'), name_hi: t('reportsPage.filters.typeAWork'), id: 'all-types-filter' },
            ...sortedTypes
        ] as (JobType | { code: null; name: string; name_en: string; name_gu: string; name_hi: string; id: string; })[];
    }, [locale, t]);

    // Calculate KPIs using the reportSummary from API
    const { totalWorkUnits, totalEarnings } = useMemo(() => {
        let units = 0;
        let earnings = 0;

        if (reportSummary) {
            if (filters.viewMode === 'work') {
                units = workData.reduce((sum, entry) => sum + entry.quantity, 0);
                earnings = reportSummary.work?.total_amount || 0;
            } else if (filters.viewMode === 'payments') {
                units = 0;
                earnings = 0;
            } else {
                units = workData.reduce((sum, entry) => sum + entry.quantity, 0);
                earnings = reportSummary.work?.total_amount || 0;
            }
        } else {
            units = workData.reduce((sum, entry) => sum + entry.quantity, 0);
            earnings = workData.reduce((sum, entry) => sum + entry.calculated_earning, 0);
        }
        return { totalWorkUnits: units, totalEarnings: earnings };
    }, [reportSummary, workData, filters.viewMode]);

    // Combined loading state for sections that depend on API data
    const isLoadingDisplayData = apiIsLoading || isProcessingData;

    // Render function for each section in the main FlatList
    const renderScreenSection = ({ item }: { item: ScreenSection }) => {
        switch (item.id) {
            case 'header':
                return (
                    <View className={`flex-row justify-between items-center px-5 bg-white border-b border-gray-200 ${Platform.OS === 'android' ? 'pt-8' : 'pt-12'} pb-4`}>
                        <Text className="text-2xl font-semibold text-gray-800">{t('reportsPage.title')}</Text>
                        <TouchableOpacity onPress={() => console.log("Help pressed - to be implemented")}>
                            <AppIcon name="help-circle-outline" size={28} color={COLORS.primary} family="Ionicons" />
                        </TouchableOpacity>
                    </View>
                );
            case 'filters':
                return (
                    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3 mt-3">
                        <Text className="text-xl font-semibold text-gray-800 mb-4">{t('reportsPage.selectTime')}</Text>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={quickFilterOptions}
                            keyExtractor={(opt) => opt.key}
                            className="mb-4 -mx-2 px-2"
                            renderItem={({ item: opt }) => (
                                <TouchableOpacity
                                    key={opt.key}
                                    className={`px-4 py-2.5 rounded-full mr-2 border ${filters.quickFilter === opt.key ? 'bg-primary-500 border-primary-500' : 'bg-gray-100 border-gray-300'}`}
                                    onPress={() => handleQuickFilterChange(opt.key)}
                                >
                                    <Text className={`${filters.quickFilter === opt.key ? 'text-white' : 'text-gray-700'} font-medium text-sm`}>{opt.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-blue-50 border border-blue-500 p-3.5 rounded-md mb-4 active:bg-blue-100"
                            onPress={openCustomDateRangePicker}
                        >
                            <AppIcon name="calendar-range" family="MaterialCommunityIcons" size={20} color={COLORS.primary} />
                            <Text className="ml-2 text-blue-600 font-semibold">{t('reportsPage.chooseDates')}</Text>
                        </TouchableOpacity>

                        {savedFiltersList.length > 0 && (
                            <View className="mb-4 pt-3 border-t border-gray-200">
                                <Text className="text-base text-gray-700 mb-2 font-medium">{t('reportsPage.savedFilters')}</Text>
                                {savedFiltersList.map(sf => (
                                    <View key={sf.name} className="flex-row justify-between items-center mb-1.5 p-2.5 bg-gray-50 rounded-md border border-gray-200">
                                        <TouchableOpacity onPress={() => applySavedFilter(sf)} className="flex-1">
                                            <Text className="text-sm text-gray-800">{sf.name}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => removeSavedFilter(sf.name)} className="p-1">
                                            <AppIcon name="close-circle-outline" family="Ionicons" size={20} color={COLORS.error} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-green-50 border border-green-500 p-3.5 rounded-md active:bg-green-100"
                            onPress={saveCurrentFilter}
                        >
                            <AppIcon name="content-save-all-outline" family="MaterialCommunityIcons" size={20} color={COLORS.success} />
                            <Text className="ml-2 text-green-700 font-semibold">{t('reportsPage.saveCurrentFilter')}</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'viewAndSearch':
                return (
                    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
                        <Text className="text-xl font-semibold text-gray-800 mb-4">{t('reportsPage.viewAndSearch')}</Text>
                        <View className="flex-row justify-center mb-4 bg-gray-100 rounded-full p-1">
                            {(['work', 'payments', 'combined'] as ViewMode[]).map(mode => (
                                <TouchableOpacity
                                    key={mode}
                                    className={`flex-1 py-2.5 px-3 rounded-full items-center ${filters.viewMode === mode ? 'bg-primary-500 shadow-md' : ''}`}
                                    onPress={() => handleViewModeChange(mode)}
                                >
                                    <Text className={`${filters.viewMode === mode ? 'text-white' : 'text-primary-700'} font-semibold capitalize`}>
                                        {t(`reportsPage.viewModes.${mode}` as any)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View className="flex-row items-center bg-gray-50 rounded-md p-0.5 border border-gray-300 mb-4">
                            <AppIcon name="magnify" family="MaterialCommunityIcons" size={22} color={COLORS.gray[500]} style={{ marginLeft: 10, marginRight: 6 }} />
                            <TextInput
                                className="flex-1 h-11 text-base text-gray-800 px-2"
                                placeholder={t('reportsPage.searchPlaceholder')}
                                value={filters.searchQuery}
                                onChangeText={handleSearchQueryChange}
                                placeholderTextColor={COLORS.gray[400]}
                            />
                        </View>
                        {STATIC_JOB_TYPES.length > 0 && (
                            <View className="mt-2">
                                <Text className="text-base text-gray-700 mb-2 font-medium">{t('reportsPage.filters.filterByJobType')}</Text>
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    data={jobTypeFilterOptions}
                                    keyExtractor={(jt) => jt.code || 'all-types-filter'}
                                    className="-mx-1 px-1 py-1 mb-1"
                                    renderItem={({ item: jt }) => {
                                        let displayName = jt.name_en;
                                        if (locale === 'gu' && jt.name_gu) displayName = jt.name_gu;
                                        else if (locale === 'hi' && jt.name_hi) displayName = jt.name_hi;
                                        else if (jt.name) displayName = jt.name;

                                        return (
                                            <TouchableOpacity
                                                onPress={() => handleTaskTypeCodeFilterChange(jt.code)}
                                                className={`px-3.5 py-1.5 rounded-full border text-xs mr-2 ${filters.taskTypeCode === jt.code ? 'bg-secondary-500 border-secondary-500' : 'bg-gray-100 border-gray-300'}`}
                                            >
                                                <Text className={`${filters.taskTypeCode === jt.code ? 'text-white' : 'text-secondary-700'} font-medium`}>
                                                    {displayName}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    }}
                                />
                            </View>
                        )}
                    </View>
                );
            case 'kpis':
                return (
                    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
                        <Text className="text-xl font-semibold text-gray-800 mb-4">{t('reportsPage.keyNumbers')}</Text>
                        {isLoadingDisplayData && (
                            <View className="h-20 justify-center items-center">
                                <ActivityIndicator size="large" color={COLORS.primary} />
                                <Text className="text-gray-500 mt-2">{t('reportsPage.loadingData')}</Text>
                            </View>
                        )}
                        {!isLoadingDisplayData && apiError && (
                            <View className="h-20 justify-center items-center">
                                <AppIcon name="alert-circle-outline" family="Ionicons" size={30} color={COLORS.error} />
                                <Text className="text-red-500 text-center mt-1">{apiError.message || t('reportsPage.errorLoading')}</Text>
                            </View>
                        )}
                        {!isLoadingDisplayData && !apiError && (
                            <View className="grid grid-cols-2 gap-x-4 gap-y-4">
                                <View className="bg-blue-50 p-4 rounded-lg items-center shadow-sm border border-blue-100">
                                    <AppIcon name="briefcase-variant-outline" family="MaterialCommunityIcons" size={30} color={COLORS.blue[600]} />
                                    <Text className="text-sm text-blue-700 mt-1.5 font-medium">{t('reportsPage.kpi.totalWorkUnits')}</Text>
                                    <Text className="text-2xl font-bold text-blue-800 mt-0.5">{totalWorkUnits || '--'}</Text>
                                </View>
                                <View className="bg-green-50 p-4 rounded-lg items-center shadow-sm border border-green-100">
                                    <AppIcon name="cash-multiple" family="MaterialCommunityIcons" size={30} color={COLORS.success} />
                                    <Text className="text-sm text-green-700 mt-1.5 font-medium">{t('reportsPage.kpi.totalEarnings')}</Text>
                                    <Text className="text-2xl font-bold text-green-800 mt-0.5">₹{(totalEarnings || 0).toFixed(0)}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                );
            case 'visualSummary':
                return (
                    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
                        <Text className="text-xl font-semibold text-gray-800 mb-4">{t('reportsPage.visualSummary')}</Text>
                        {isLoadingDisplayData && (
                            <View className="h-40 justify-center items-center">
                                <ActivityIndicator size="large" color={COLORS.primary} />
                                <Text className="text-gray-500 mt-2">{t('reportsPage.loadingCharts')}</Text>
                            </View>
                        )}
                        {!isLoadingDisplayData && apiError && (
                            <View className="h-40 justify-center items-center">
                                <AppIcon name="bar-chart-outline" family="Ionicons" size={30} color={COLORS.error} />
                                <Text className="text-red-500 text-center mt-1">{t('reportsPage.errorLoadingCharts')}</Text>
                            </View>
                        )}
                        {!isLoadingDisplayData && !apiError && (workData.length > 0 || paymentData.length > 0) && (
                            <>
                                <View className="h-48 bg-gray-50 border border-gray-200 justify-center items-center rounded-lg mb-3 p-2">
                                    <Text className="text-gray-500 text-center">{t('reportsPage.charts.workUnitsBar')}</Text>
                                </View>
                                <View className="h-48 bg-gray-50 border border-gray-200 justify-center items-center rounded-lg mb-3 p-2">
                                    <Text className="text-gray-500 text-center">{t('reportsPage.charts.earningsTrendLine')}</Text>
                                </View>
                                <View className="h-48 bg-gray-50 border border-gray-200 justify-center items-center rounded-lg mb-3 p-2">
                                    <Text className="text-gray-500 text-center">{t('reportsPage.charts.paymentRatioPie')}</Text>
                                </View>
                                <View className="h-48 bg-gray-50 border border-gray-200 justify-center items-center rounded-lg p-2">
                                    <Text className="text-gray-500 text-center">{t('reportsPage.charts.workDensityHeatmap')}</Text>
                                </View>
                            </>
                        )}
                        {!isLoadingDisplayData && !apiError && workData.length === 0 && paymentData.length === 0 && (
                            <View className="py-10 items-center">
                                <AppIcon name="analytics-outline" family="Ionicons" size={40} color={COLORS.gray[300]} />
                                <Text className="text-gray-500 text-center mt-2">{t('reportsPage.noDataForCharts')}</Text>
                            </View>
                        )}
                    </View>
                );
            case 'workList':
                if (isLoadingDisplayData) return <View className="h-60 justify-center items-center bg-white p-4 rounded-lg shadow mb-4 mx-3"><ActivityIndicator size="large" color={COLORS.primary} /><Text className="text-gray-500 mt-2">{t('reportsPage.loadingTable')}</Text></View>;
                if (!isLoadingDisplayData && apiError) return <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3 items-center"><AppIcon name="cloud-offline-outline" family="Ionicons" size={30} color={COLORS.error} /><Text className="text-red-500 text-center mt-1">{apiError.message || t('reportsPage.errorLoading')}</Text></View>;
                if (!(filters.viewMode === 'work' || filters.viewMode === 'combined')) return null;

                return (
                    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
                        <Text className="text-xl font-semibold text-gray-800 mb-1">{t('reportsPage.detailedData')}</Text>
                        <Text className="text-lg font-medium text-gray-700 mb-3 mt-1">{t('reportsPage.workEntriesTitle')}</Text>
                        <FlatList
                            data={workData}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }: { item: TransformedWorkEntry }) => {
                                const jobTypeDetails = STATIC_JOB_TYPES.find(jt => jt.code === item.task_type_code);
                                let displayJobTypeName = item.task_type_code || 'N/A';
                                if (jobTypeDetails) {
                                    displayJobTypeName = (locale === 'gu' && jobTypeDetails.name_gu ? jobTypeDetails.name_gu : locale === 'hi' && jobTypeDetails.name_hi ? jobTypeDetails.name_hi : jobTypeDetails.name_en || jobTypeDetails.name);
                                }

                                return (
                                    <View className="border-b border-gray-200 py-3.5 px-1">
                                        <View className="flex-row justify-between items-start mb-1">
                                            <View className="flex-1 pr-2">
                                                <Text className="text-base text-gray-800 font-semibold mb-0.5">{item.title || t('reportsPage.noDescription')}</Text>
                                                <Text className="text-xs text-gray-600">{t('reportsPage.jobType')}{displayJobTypeName}</Text>
                                            </View>
                                            <Text className="text-base font-semibold text-blue-600">{`${item.quantity}`}</Text>
                                        </View>
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-sm text-green-700 font-medium">{t('reportsPage.earning')} <Text className="font-semibold">₹{(item.calculated_earning || 0).toFixed(2)}</Text></Text>
                                        </View>
                                        {item.notes && (
                                            <View className="mt-2 bg-gray-50 p-2 rounded-md border border-gray-100">
                                                <Text className="text-xs text-gray-500 italic">{t('reportsPage.notes')}{item.notes}</Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            }}
                            ListEmptyComponent={() => (
                                !isLoadingDisplayData && !apiError && workData.length === 0 && (
                                    <View className="py-10 items-center">
                                        <AppIcon name="file-tray-stacked-outline" family="Ionicons" size={40} color={COLORS.gray[300]} />
                                        <Text className="text-gray-500 text-center mt-2">{t('reportsPage.noDataForFilters')}</Text>
                                    </View>
                                )
                            )}
                            scrollEnabled={false}
                        />
                    </View>
                );
            case 'paymentList':
                if (isLoadingDisplayData) return <View className="h-60 justify-center items-center bg-white p-4 rounded-lg shadow mb-4 mx-3"><ActivityIndicator size="large" color={COLORS.primary} /><Text className="text-gray-500 mt-2">{t('reportsPage.loadingTable')}</Text></View>;
                if (!isLoadingDisplayData && apiError) return <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3 items-center"><AppIcon name="card-outline" family="Ionicons" size={30} color={COLORS.error} /><Text className="text-red-500 text-center mt-1">{apiError.message || t('reportsPage.errorLoading')}</Text></View>;
                if (!(filters.viewMode === 'payments' || filters.viewMode === 'combined')) return null;

                return (
                    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
                        {(filters.viewMode === 'payments' || (filters.viewMode === 'combined' && workData.length === 0)) &&
                            <Text className="text-xl font-semibold text-gray-800 mb-1">{t('reportsPage.detailedData')}</Text>}
                        <Text className="text-lg font-medium text-gray-700 mb-3 mt-1">{t('reportsPage.paymentEntriesTitle')}</Text>
                        <FlatList
                            data={paymentData}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }: { item: TransformedPaymentEntry }) => (
                                <View className="border-b border-gray-200 py-3.5 px-1">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <View className="flex-1 pr-2">
                                            <Text className="text-base text-green-700 font-semibold">
                                                {t('reportsPage.paymentAmount')}₹{(item.amount || 0).toFixed(2)}
                                            </Text>
                                            {item.from && <Text className="text-sm text-gray-700 mt-0.5">{t('reportsPage.paymentFrom')}{item.from}</Text>}
                                        </View>
                                        <Text className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString(locale || 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                                    </View>
                                    {item.notes && (
                                        <View className="mt-1.5 bg-gray-50 p-2 rounded-md border border-gray-100">
                                            <Text className="text-xs text-gray-500 italic">{t('reportsPage.notes')}{item.notes}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                            ListEmptyComponent={() => (
                                !isLoadingDisplayData && !apiError && paymentData.length === 0 && (
                                    <View className="py-10 items-center">
                                        <AppIcon name="file-tray-outline" family="Ionicons" size={40} color={COLORS.gray[300]} />
                                        <Text className="text-gray-500 text-center mt-2">{t('reportsPage.noDataForFilters')}</Text>
                                    </View>
                                )
                            )}
                            scrollEnabled={false}
                        />
                        {!isLoadingDisplayData && !apiError && filters.viewMode === 'combined' && workData.length === 0 && paymentData.length === 0 && (
                            <View className="py-10 items-center">
                                <AppIcon name="documents-outline" family="Ionicons" size={40} color={COLORS.gray[300]} />
                                <Text className="text-gray-500 text-center mt-2">{t('reportsPage.noDataForFilters')}</Text>
                            </View>
                        )}
                    </View>
                );
            case 'exportAndShare':
                return (
                    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
                        <Text className="text-xl font-semibold text-gray-800 mb-4">{t('reportsPage.exportAndShare')}</Text>
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-red-100 border border-red-300 p-3.5 rounded-md mb-3 active:bg-red-200"
                            onPress={() => exportReport('pdf')}
                        >
                            <AppIcon name="file-pdf-box" family="MaterialCommunityIcons" size={22} color={COLORS.error} />
                            <Text className="ml-2 text-red-700 font-semibold">{t('reportsPage.exportAsPDF')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-green-100 border border-green-300 p-3.5 rounded-md active:bg-green-200"
                            onPress={() => exportReport('csv')}
                        >
                            <AppIcon name="file-excel-box" family="MaterialCommunityIcons" size={22} color={COLORS.success} />
                            <Text className="ml-2 text-green-700 font-semibold">{t('reportsPage.exportAsCSV')}</Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <FlatList
            className="flex-1 bg-gray-50"
            data={screenSections}
            renderItem={renderScreenSection}
            keyExtractor={(item) => item.id}
            ListFooterComponent={<View className="h-12" />}
        />
    );
};

export default ReportsScreen; 