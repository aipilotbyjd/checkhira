import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform, TextInput, FlatList, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
// import { BarChart, LineChart, PieChart, ContributionGraph } from 'react-native-chart-kit';
import { useLanguage, LanguageContextType } from '../../../contexts/LanguageContext';
import AppIcon, { IconFamily } from '../../../components/common/Icon';
import { COLORS } from '../../../constants/theme';
import { useApi } from '../../../hooks/useApi';
import reportService from '../../../services/reportService';
import {
    ApiWorkRecord,
    ApiPaymentRecord,
    TransformedWorkEntry,
    TransformedPaymentEntry,
    ApiResponseData,
    JobType,
    ReportFilters,
    ViewMode,
    QuickFilterType
} from '../../../types/reports';

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

type ScreenSectionType = 'header' | 'filters' | 'viewAndSearch' | 'kpis' | 'workList' | 'paymentList' | 'exportAndShare';
interface ScreenSection {
    id: ScreenSectionType;
}

const screenSections: ScreenSection[] = [
    { id: 'header' },
    { id: 'filters' },
    { id: 'viewAndSearch' },
    { id: 'kpis' },
    { id: 'workList' },
    { id: 'paymentList' },
    { id: 'exportAndShare' },
];

// Helper function to convert hex to rgba for opacity
// const hexToRgba = (hex: string, opacity: number): string => {
//     hex = hex.replace('#', '');
//     const r = parseInt(hex.substring(0, 2), 16);
//     const g = parseInt(hex.substring(2, 4), 16);
//     const b = parseInt(hex.substring(4, 6), 16);
//     return `rgba(${r}, ${g}, ${b}, ${opacity})`;
// };

// const MAX_PIE_SLICES = 5; // Show top N slices + "Other"
// const DAILY_THRESHOLD = 35; // Up to 35 data points, show daily
// const WEEKLY_THRESHOLD = 120; // Up to 120 data points (approx 4 months), show weekly. Beyond this, monthly.

// Helper to get week number for a date
// const getWeekNumber = (d: Date): number => {
//     d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
//     d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
//     const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
//     // @ts-ignore
//     const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
//     return weekNo;
// };

// Section Components
interface HeaderSectionProps { t: LanguageContextType['t']; }
const HeaderSection = React.memo(({ t }: HeaderSectionProps) => (
    <View className={`flex-row justify-between items-center px-5 bg-white border-b border-gray-200 ${Platform.OS === 'android' ? 'pt-8' : 'pt-12'} pb-4`}>
        <Text className="text-2xl font-semibold text-gray-800">{t('reportsPage.title')}</Text>
        <TouchableOpacity onPress={() => console.log("Help pressed - to be implemented")}>
            <AppIcon name="help-circle-outline" size={28} color={COLORS.primary} family="Ionicons" />
        </TouchableOpacity>
    </View>
));

interface FiltersSectionProps {
    t: LanguageContextType['t'];
    filters: ReportFilters;
    quickFilterOptions: { key: QuickFilterType; label: string; icon?: string, iconFamily?: IconFamily }[];
    savedFiltersList: { name: string; criteria: ReportFilters }[];
    handleQuickFilterChange: (filterKey: QuickFilterType) => void;
    openCustomDateRangePicker: () => void;
    applySavedFilter: (savedFilter: { name: string; criteria: ReportFilters }) => void;
    removeSavedFilter: (filterNameToRemove: string) => void;
    saveCurrentFilter: () => void;
}
const FiltersSection = React.memo(({
    t, filters, quickFilterOptions, savedFiltersList,
    handleQuickFilterChange, openCustomDateRangePicker, applySavedFilter, removeSavedFilter, saveCurrentFilter
}: FiltersSectionProps) => (
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
                    className={`px-4 py-2.5 rounded-full mr-2 border ${filters.quickFilter === opt.key ? 'bg-fuchsia-500 border-fuchsia-500' : 'bg-gray-100 border-gray-300'}`}
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
));

interface ViewAndSearchSectionProps {
    t: LanguageContextType['t'];
    filters: ReportFilters;
    jobTypeFilterOptions: (JobType | { code: null; name: string; name_en: string; name_gu: string; name_hi: string; id: string; })[];
    locale: string;
    handleViewModeChange: (mode: ViewMode) => void;
    handleSearchQueryChange: (text: string) => void;
    handleTaskTypeCodeFilterChange: (code: string | null) => void;
}
const ViewAndSearchSection = React.memo(({
    t, filters, jobTypeFilterOptions, locale,
    handleViewModeChange, handleSearchQueryChange, handleTaskTypeCodeFilterChange
}: ViewAndSearchSectionProps) => {
    const viewModeButtons = useMemo(() => (['work', 'payment', 'combined'] as ViewMode[]).map(mode => {
        const keySuffix = mode === 'payment' ? 'payments' : mode;
        const translationKey = `reportsPage.viewModes.${keySuffix}`;

        return (
            <TouchableOpacity
                key={mode}
                className={`flex-1 py-2.5 px-3 rounded-full items-center ${filters.viewMode === mode ? 'bg-primary-500 shadow-md' : ''}`}
                onPress={() => handleViewModeChange(mode)}
            >
                <Text className={`${filters.viewMode === mode ? 'text-white' : 'text-primary-700'} font-semibold capitalize`}>
                    {t(translationKey as any)}
                </Text>
            </TouchableOpacity>
        );
    }), [filters.viewMode, handleViewModeChange, t]);

    const renderJobTypeItem = useCallback(({ item: jt }: { item: (JobType | { code: null; name: string; name_en: string; name_gu: string; name_hi: string; id: string; }) }) => {
        let displayName = jt.name_en;
        if (locale === 'gu' && jt.name_gu) displayName = jt.name_gu;
        else if (locale === 'hi' && jt.name_hi) displayName = jt.name_hi;
        else if ((jt as JobType).name) displayName = (jt as JobType).name;

        return (
            <TouchableOpacity
                onPress={() => handleTaskTypeCodeFilterChange(jt.code)}
                className={`px-3.5 py-1.5 rounded-full border text-xs mr-2 ${filters.taskTypeCode === jt.code ? 'bg-fuchsia-500 border-fuchsia-500' : 'bg-gray-100 border-gray-300'}`}
            >
                <Text className={`${filters.taskTypeCode === jt.code ? 'text-white' : 'text-secondary-700'} font-medium`}>
                    {displayName}
                </Text>
            </TouchableOpacity>
        );
    }, [locale, filters.taskTypeCode, handleTaskTypeCodeFilterChange, t]);

    return (
        <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
            <Text className="text-xl font-semibold text-gray-800 mb-4">{t('reportsPage.viewAndSearch')}</Text>
            <View className="flex-row justify-center mb-4 bg-gray-100 rounded-full p-1">
                {viewModeButtons}
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
            {STATIC_JOB_TYPES.length > 0 && (filters.viewMode === 'work' || filters.viewMode === 'combined') && (
                <View className="mt-2">
                    <Text className="text-base text-gray-700 mb-2 font-medium">{t('reportsPage.filters.filterByJobType')}</Text>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={jobTypeFilterOptions}
                        keyExtractor={(jt) => jt.code || 'all-types-filter'}
                        className="-mx-1 px-1 py-1 mb-1"
                        renderItem={renderJobTypeItem}
                    />
                </View>
            )}
        </View>
    );
});

interface KpisSectionProps {
    t: LanguageContextType['t'];
    isLoadingDisplayData: boolean;
    apiError: any;
    filters: ReportFilters;
    totalWorkRecords: number;
    totalWorkAmount: number;
    totalPaymentRecords: number;
    totalPaymentAmount: number;
}
const KpisSection = React.memo(({
    t, isLoadingDisplayData, apiError, filters,
    totalWorkRecords, totalWorkAmount, totalPaymentRecords, totalPaymentAmount
}: KpisSectionProps) => (
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
                <Text className="text-red-500 text-center mt-1">{apiError?.message || t('reportsPage.errorLoading')}</Text>
            </View>
        )}
        {!isLoadingDisplayData && !apiError && (
            <View className="grid grid-cols-2 gap-x-4 gap-y-4">
                {(filters.viewMode === 'work' || filters.viewMode === 'combined') && (
                    <>
                        <View className="bg-blue-50 p-4 rounded-lg items-center shadow-sm border border-blue-100">
                            <AppIcon name="briefcase-variant-outline" family="MaterialCommunityIcons" size={30} color={COLORS.primary} />
                            <Text className="text-sm text-blue-700 mt-1.5 font-medium">{t('reportsPage.kpi.workTotalRecords' as any)}</Text>
                            <Text className="text-2xl font-bold text-blue-800 mt-0.5">{totalWorkRecords || '--'}</Text>
                        </View>
                        <View className="bg-green-50 p-4 rounded-lg items-center shadow-sm border border-green-100">
                            <AppIcon name="cash-multiple" family="MaterialCommunityIcons" size={30} color={COLORS.success} />
                            <Text className="text-sm text-green-700 mt-1.5 font-medium">{t('reportsPage.kpi.workTotalAmount' as any)}</Text>
                            <Text className="text-2xl font-bold text-green-800 mt-0.5">₹{(totalWorkAmount || 0).toFixed(0)}</Text>
                        </View>
                    </>
                )}
                {(filters.viewMode === 'payment' || filters.viewMode === 'combined') && (
                    <>
                        <View className="bg-orange-50 p-4 rounded-lg items-center shadow-sm border border-orange-100">
                            <AppIcon name="format-list-numbered" family="MaterialCommunityIcons" size={30} color={COLORS.warning} />
                            <Text className="text-sm text-orange-700 mt-1.5 font-medium">{t('reportsPage.kpi.paymentTotalRecords' as any)}</Text>
                            <Text className="text-2xl font-bold text-orange-800 mt-0.5">{totalPaymentRecords || '--'}</Text>
                        </View>
                        <View className="bg-fuchsia-50 p-4 rounded-lg items-center shadow-sm border border-fuchsia-100">
                            <AppIcon name="credit-card-check-outline" family="MaterialCommunityIcons" size={30} color={COLORS.secondary} />
                            <Text className="text-sm text-fuchsia-700 mt-1.5 font-medium">{t('reportsPage.kpi.paymentTotalAmount' as any)}</Text>
                            <Text className="text-2xl font-bold text-fuchsia-800 mt-0.5">₹{(totalPaymentAmount || 0).toFixed(0)}</Text>
                        </View>
                    </>
                )}
            </View>
        )}
    </View>
));

interface WorkListSectionProps {
    t: LanguageContextType['t'];
    locale: string;
    isLoadingDisplayData: boolean;
    apiError: any;
    filters: ReportFilters;
    workData: TransformedWorkEntry[];
}
const WorkListSection = React.memo(({ t, locale, isLoadingDisplayData, apiError, filters, workData }: WorkListSectionProps) => {
    const renderWorkItem = useCallback(({ item }: { item: TransformedWorkEntry }) => {
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
    }, [locale, t]);

    if (isLoadingDisplayData) return <View className="h-60 justify-center items-center bg-white p-4 rounded-lg shadow mb-4 mx-3"><ActivityIndicator size="large" color={COLORS.primary} /><Text className="text-gray-500 mt-2">{t('reportsPage.loadingTable')}</Text></View>;
    if (!isLoadingDisplayData && apiError) return <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3 items-center"><AppIcon name="cloud-offline-outline" family="Ionicons" size={30} color={COLORS.error} /><Text className="text-red-500 text-center mt-1">{apiError?.message || t('reportsPage.errorLoading')}</Text></View>;
    if (filters.viewMode === 'payment') return null;

    return (
        <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
            <Text className="text-lg font-medium text-gray-700 mb-3 mt-1">{t('reportsPage.workEntriesTitle')}</Text>
            <FlatList
                data={workData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderWorkItem}
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
});

interface PaymentListSectionProps {
    t: LanguageContextType['t'];
    locale: string;
    isLoadingDisplayData: boolean;
    apiError: any;
    filters: ReportFilters;
    paymentData: TransformedPaymentEntry[];
    workDataLength: number;
}
const PaymentListSection = React.memo(({ t, locale, isLoadingDisplayData, apiError, filters, paymentData, workDataLength }: PaymentListSectionProps) => {
    const renderPaymentItem = useCallback(({ item }: { item: TransformedPaymentEntry }) => (
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
    ), [locale, t]);

    if (isLoadingDisplayData) return <View className="h-60 justify-center items-center bg-white p-4 rounded-lg shadow mb-4 mx-3"><ActivityIndicator size="large" color={COLORS.primary} /><Text className="text-gray-500 mt-2">{t('reportsPage.loadingTable')}</Text></View>;
    if (!isLoadingDisplayData && apiError) return <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3 items-center"><AppIcon name="card-outline" family="Ionicons" size={30} color={COLORS.error} /><Text className="text-red-500 text-center mt-1">{apiError?.message || t('reportsPage.errorLoading')}</Text></View>;
    if (filters.viewMode === 'work') return null;

    return (
        <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
            {(filters.viewMode === 'payment' || (filters.viewMode === 'combined' && workDataLength === 0)) &&
                <Text className="text-xl font-semibold text-gray-800 mb-1">{t('reportsPage.detailedData')}</Text>}
            <Text className="text-lg font-medium text-gray-700 mb-3 mt-1">{t('reportsPage.paymentEntriesTitle')}</Text>
            <FlatList
                data={paymentData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPaymentItem}
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
            {!isLoadingDisplayData && !apiError && filters.viewMode === 'combined' && workDataLength === 0 && paymentData.length === 0 && (
                <View className="py-10 items-center">
                    <AppIcon name="documents-outline" family="Ionicons" size={40} color={COLORS.gray[300]} />
                    <Text className="text-gray-500 text-center mt-2">{t('reportsPage.noDataForFilters')}</Text>
                </View>
            )}
        </View>
    );
});

interface ExportAndShareSectionProps {
    t: LanguageContextType['t'];
    exportReport: (format: 'pdf' | 'csv') => void;
}
const ExportAndShareSection = React.memo(({ t, exportReport }: ExportAndShareSectionProps) => (
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
));

const ReportsScreen = () => {
    const { t, locale } = useLanguage();
    const { execute, isLoading: apiIsLoading, error: apiError, data: rawApiData } = useApi<ApiResponseData>();

    const [filters, setFilters] = useState<ReportFilters>({
        quickFilter: 'today',
        startDate: getDateRangeForQuickFilter('today').startDate,
        endDate: getDateRangeForQuickFilter('today').endDate,
        viewMode: 'combined',
        searchQuery: '',
        taskTypeCode: null,
    });

    const [savedFiltersList, setSavedFiltersList] = useState<{ name: string; criteria: ReportFilters }[]>([]);

    const [workData, setWorkData] = useState<TransformedWorkEntry[]>([]);
    const [paymentData, setPaymentData] = useState<TransformedPaymentEntry[]>([]);
    const [reportSummary, setReportSummary] = useState<ApiResponseData['summary'] | null>(null);

    const [isProcessingData, setIsProcessingData] = useState(false);

    const fetchAndProcessReportData = useCallback(async () => {
        if (!filters.startDate || !filters.endDate) {
            setWorkData([]); setPaymentData([]); setReportSummary(null); return;
        }
        setIsProcessingData(true); setWorkData([]); setPaymentData([]); setReportSummary(null);

        const paramsForApi: ReportFilters = { ...filters };
        try {
            await execute(() => reportService.fetchReportData(paramsForApi));
        }
        catch (err) {
            // error is handled by useApi hook
        }
    }, [filters, execute]);

    useEffect(() => {
        fetchAndProcessReportData();
    }, [fetchAndProcessReportData]);

    useEffect(() => {
        if (!rawApiData && !apiIsLoading && !apiError && workData.length === 0 && paymentData.length === 0) {
            const today = new Date();
            const sampleWork: TransformedWorkEntry[] = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                sampleWork.push({
                    id: i + 1,
                    date: date.toISOString(),
                    title: `Sample Task ${30 - i}`,
                    quantity: Math.floor(Math.random() * 5) + (i % 7 === 0 || i % 7 === 1 ? 0 : 1),
                    calculated_earning: (Math.floor(Math.random() * 5) + 1) * (Math.random() * 100 + 50),
                    task_type_code: A_Z_LETTERS[i % A_Z_LETTERS.length]
                });
            }
            setWorkData(sampleWork);

            const samplePayments: TransformedPaymentEntry[] = [];
            const paymentSources = ['Client Alpha', 'Beta Services', 'Gamma Inc.', 'Delta Corp'];
            for (let i = 0; i < 5; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - (Math.floor(Math.random() * 30)));
                samplePayments.push({
                    id: i + 1,
                    date: date.toISOString(),
                    amount: Math.floor(Math.random() * 2000) + 500,
                    from: paymentSources[i % paymentSources.length],
                    notes: `Payment for services rendered project ${A_Z_LETTERS[i % A_Z_LETTERS.length]}`
                });
            }
            setPaymentData(samplePayments);
        }
    }, [rawApiData, apiIsLoading, apiError, workData.length, paymentData.length]);

    useEffect(() => {
        if (rawApiData && !apiIsLoading) {
            setIsProcessingData(true);
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
        } else if (!apiIsLoading && !apiError && !rawApiData) {
            setIsProcessingData(false);
        } else if (apiError) {
            setIsProcessingData(false);
            setWorkData([]);
            setPaymentData([]);
            setReportSummary(null);
        }
    }, [rawApiData, apiIsLoading, apiError]);

    const openCustomDateRangePicker = useCallback(() => {
        console.log("Open custom date range picker - to be implemented");
    }, []);

    const handleQuickFilterChange = useCallback((filterKey: QuickFilterType) => {
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
    }, [openCustomDateRangePicker]);

    const saveCurrentFilter = useCallback(() => {
        const filterName = `Saved Filter ${savedFiltersList.length + 1}`;
        setSavedFiltersList(prev => [...prev, { name: filterName, criteria: { ...filters } }]);
        console.log("Save current filter:", filterName, filters);
    }, [filters, savedFiltersList.length]);

    const applySavedFilter = useCallback((savedFilter: { name: string; criteria: ReportFilters }) => {
        setFilters(savedFilter.criteria);
    }, []);

    const removeSavedFilter = useCallback((filterNameToRemove: string) => {
        setSavedFiltersList(prev => prev.filter(f => f.name !== filterNameToRemove));
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        setFilters(prev => ({ ...prev, viewMode: mode, taskTypeCode: null }));
    }, []);

    const handleSearchQueryChange = useCallback((text: string) => {
        setFilters(prev => ({ ...prev, searchQuery: text }));
    }, []);

    const handleTaskTypeCodeFilterChange = useCallback((code: string | null) => {
        setFilters(prev => ({ ...prev, taskTypeCode: code }));
    }, []);

    const exportReport = useCallback((format: 'pdf' | 'csv') => {
        console.log(`Exporting report as ${format} with filters:`, filters);
    }, [filters]);

    const quickFilterOptions = useMemo(() => [
        { key: 'today' as QuickFilterType, label: t('reportsPage.filters.today'), icon: 'calendar-today' },
        { key: 'yesterday' as QuickFilterType, label: t('reportsPage.filters.yesterday'), icon: 'calendar-clock' },
        { key: 'last7' as QuickFilterType, label: t('reportsPage.filters.last7Days'), icon: 'calendar-week' },
        { key: 'last30' as QuickFilterType, label: t('reportsPage.filters.last30Days'), icon: 'calendar-month' },
        { key: 'thisMonth' as QuickFilterType, label: t('reportsPage.filters.thisMonth'), icon: 'calendar-month-outline' },
        { key: 'lastMonth' as QuickFilterType, label: t('reportsPage.filters.lastMonth'), icon: 'calendar-arrow-left' },
    ], [t]);

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

    const isLoadingDisplayData = apiIsLoading || isProcessingData;
    const screenWidth = Dimensions.get('window').width;

    const renderScreenSection = useCallback(({ item }: { item: ScreenSection }) => {
        switch (item.id) {
            case 'header':
                return <HeaderSection t={t} />;
            case 'filters':
                return <FiltersSection
                    t={t}
                    filters={filters}
                    quickFilterOptions={quickFilterOptions}
                    savedFiltersList={savedFiltersList}
                    handleQuickFilterChange={handleQuickFilterChange}
                    openCustomDateRangePicker={openCustomDateRangePicker}
                    applySavedFilter={applySavedFilter}
                    removeSavedFilter={removeSavedFilter}
                    saveCurrentFilter={saveCurrentFilter}
                />;
            case 'viewAndSearch':
                return <ViewAndSearchSection
                    t={t}
                    filters={filters}
                    jobTypeFilterOptions={jobTypeFilterOptions}
                    locale={locale}
                    handleViewModeChange={handleViewModeChange}
                    handleSearchQueryChange={handleSearchQueryChange}
                    handleTaskTypeCodeFilterChange={handleTaskTypeCodeFilterChange}
                />;
            case 'kpis':
                return <KpisSection
                    t={t}
                    isLoadingDisplayData={isLoadingDisplayData}
                    apiError={apiError}
                    filters={filters}
                    totalWorkRecords={totalWorkRecords}
                    totalWorkAmount={totalWorkAmount}
                    totalPaymentRecords={totalPaymentRecords}
                    totalPaymentAmount={totalPaymentAmount}
                />;
            case 'workList':
                return <WorkListSection
                    t={t}
                    locale={locale}
                    isLoadingDisplayData={isLoadingDisplayData}
                    apiError={apiError}
                    filters={filters}
                    workData={workData}
                />;
            case 'paymentList':
                return <PaymentListSection
                    t={t}
                    locale={locale}
                    isLoadingDisplayData={isLoadingDisplayData}
                    apiError={apiError}
                    filters={filters}
                    paymentData={paymentData}
                    workDataLength={workData.length}
                />;
            case 'exportAndShare':
                return <ExportAndShareSection t={t} exportReport={exportReport} />;
            default:
                return null;
        }
    }, [
        t, locale, filters, quickFilterOptions, savedFiltersList, jobTypeFilterOptions,
        isLoadingDisplayData, apiError, workData, paymentData,
        totalWorkRecords, totalWorkAmount, totalPaymentRecords, totalPaymentAmount,
        handleQuickFilterChange, openCustomDateRangePicker, applySavedFilter, removeSavedFilter, saveCurrentFilter,
        handleViewModeChange, handleSearchQueryChange, handleTaskTypeCodeFilterChange, exportReport,
        screenWidth
    ]);

    return (
        <FlatList
            className="flex-1 bg-gray-100"
            data={screenSections}
            renderItem={renderScreenSection}
            keyExtractor={(item) => item.id}
            ListFooterComponent={<View className="h-16" />}
            showsVerticalScrollIndicator={false}
        />
    );
};

export default ReportsScreen; 