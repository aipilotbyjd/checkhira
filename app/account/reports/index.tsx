import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Platform, TextInput, FlatList } from 'react-native';
import { useLanguage } from '../../../contexts/LanguageContext';
import AppIcon, { IconFamily } from '../../../components/common/Icon';
import { COLORS } from '../../../constants/theme';
import { JobType, WorkEntry, ReportPaymentEntry } from '../../../types/reports';

// --- MOCK DATA IMPORTS ---
import sampleWorkEntries from '../../../services/mockApi/data/sampleWorkEntries.json';
import samplePaymentEntries from '../../../services/mockApi/data/samplePaymentEntries.json';
// --- END MOCK DATA IMPORTS ---

// --- START TYPE DEFINITIONS (to be moved to types/ folder later) ---
// MOVED TO ../../../types/reports.ts
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

    const [filters, setFilters] = useState<ReportFilters>({
        quickFilter: 'thisMonth',
        startDate: getDateRangeForQuickFilter('thisMonth').startDate,
        endDate: getDateRangeForQuickFilter('thisMonth').endDate,
        viewMode: 'combined',
        searchQuery: '',
        taskTypeCode: null,
    });

    const [savedFiltersList, setSavedFiltersList] = useState<{ name: string; criteria: ReportFilters }[]>([]);

    // --- MOCK DATA STATE ---
    const [allWorkData, setAllWorkData] = useState<WorkEntry[]>(sampleWorkEntries as WorkEntry[]);
    const [allPaymentData, setAllPaymentData] = useState<ReportPaymentEntry[]>(samplePaymentEntries as ReportPaymentEntry[]);

    const [workData, setWorkData] = useState<WorkEntry[]>([]);
    const [paymentData, setPaymentData] = useState<ReportPaymentEntry[]>([]);

    const [isLoadingWork, setIsLoadingWork] = useState(true);
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);
    // --- END MOCK DATA STATE ---

    // useEffect to filter work and payment entries from mock data based on filters
    useEffect(() => {
        setIsLoadingWork(true);
        setIsLoadingPayments(true);

        // Simulate API delay for demo
        const timer = setTimeout(() => {
            let filteredWork: WorkEntry[] = [];
            if (filters.viewMode === 'work' || filters.viewMode === 'combined') {
                filteredWork = allWorkData.filter(entry => {
                    const entryDate = new Date(entry.date);
                    const startDateFilter = filters.startDate ? new Date(filters.startDate) : null;
                    const endDateFilter = filters.endDate ? new Date(filters.endDate) : null;

                    if (startDateFilter) { // Adjust start date to beginning of day for comparison
                        startDateFilter.setHours(0, 0, 0, 0);
                        if (entryDate < startDateFilter) return false;
                    }
                    if (endDateFilter) { // Adjust end date to end of day for comparison
                        endDateFilter.setHours(23, 59, 59, 999);
                        if (entryDate > endDateFilter) return false;
                    }

                    if (filters.searchQuery) {
                        const query = filters.searchQuery.toLowerCase();
                        const searchableFields = [
                            entry.description?.toLowerCase(),
                            entry.notes?.toLowerCase(),
                        ].filter(Boolean);
                        if (!searchableFields.some(field => field?.includes(query))) return false;
                    }

                    if (filters.taskTypeCode && entry.task_type_code !== filters.taskTypeCode) return false;

                    return true;
                });
            }
            setWorkData(filteredWork);
            setIsLoadingWork(false);

            let filteredPayments: ReportPaymentEntry[] = [];
            if (filters.viewMode === 'payments' || filters.viewMode === 'combined') {
                filteredPayments = allPaymentData.filter(entry => {
                    const entryDate = new Date(entry.date);
                    const startDateFilter = filters.startDate ? new Date(filters.startDate) : null;
                    const endDateFilter = filters.endDate ? new Date(filters.endDate) : null;

                    if (startDateFilter) {
                        startDateFilter.setHours(0, 0, 0, 0);
                        if (entryDate < startDateFilter) return false;
                    }
                    if (endDateFilter) {
                        endDateFilter.setHours(23, 59, 59, 999);
                        if (entryDate > endDateFilter) return false;
                    }

                    if (filters.searchQuery) {
                        const query = filters.searchQuery.toLowerCase();
                        const searchableFields = [
                            entry.description?.toLowerCase(),
                            entry.from?.toLowerCase(),
                            entry.notes?.toLowerCase(),
                            entry.source?.name_en?.toLowerCase(),
                            entry.source?.name_gu?.toLowerCase(),
                            entry.source?.name?.toLowerCase(),
                        ].filter(Boolean);
                        if (!searchableFields.some(field => field?.includes(query))) return false;
                    }
                    // No status or jobType filter for payments in current UI design
                    return true;
                });
            }
            setPaymentData(filteredPayments);
            setIsLoadingPayments(false);

        }, 500); // 500ms delay to simulate network

        return () => clearTimeout(timer);
    }, [filters, allWorkData, allPaymentData]);

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
            taskTypeCode: null // Reset task type on broad date change
        }));
    };

    const openCustomDateRangePicker = () => {
        console.log("Open custom date range picker - to be implemented");
        // Needs implementation with a DateTimePicker or custom calendar modal
        // On selection, update:
        // setFilters(prev => ({ ...prev, startDate: newStartDate, endDate: newEndDate, quickFilter: 'custom' }));
    };

    const saveCurrentFilter = () => {
        // Basic implementation:
        const filterName = `Saved Filter ${savedFiltersList.length + 1}`; // Replace with a prompt for name
        setSavedFiltersList(prev => [...prev, { name: filterName, criteria: { ...filters } }]);
        // Persist savedFiltersList to AsyncStorage or backend
        console.log("Save current filter:", filterName, filters);
    };

    const applySavedFilter = (savedFilter: { name: string; criteria: ReportFilters }) => {
        setFilters(savedFilter.criteria);
    };

    const removeSavedFilter = (filterNameToRemove: string) => {
        setSavedFiltersList(prev => prev.filter(f => f.name !== filterNameToRemove));
        // Update persisted list
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
        // Logic for report generation and sharing using libraries like react-native-html-to-pdf or xlsx
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
            return jt.name_en || jt.name || ''; // Ensure string for sort
        };

        const sortedTypes = [...STATIC_JOB_TYPES]
            .sort((a, b) => {
                const nameA = getLocalizedName(a).toLowerCase();
                const nameB = getLocalizedName(b).toLowerCase();
                return nameA.localeCompare(nameB);
            })
            .slice(0, 10);

        // Add "Type A Work" (All Types) as the first option
        return [
            { code: null, name_en: t('reportsPage.filters.typeAWork'), name_gu: t('reportsPage.filters.typeAWork'), name_hi: t('reportsPage.filters.typeAWork') },
            ...sortedTypes
        ] as (JobType | { code: null; name_en: string; name_gu: string; name_hi: string })[]; // Type assertion for combined array

    }, [locale, t]);

    // Calculate KPIs using the locally filtered workData
    const { totalWorkUnits, totalEarnings } = useMemo(() => {
        const currentWorkData = workData || []; // Use filtered workData
        const units = currentWorkData.reduce((sum, entry) => sum + entry.quantity, 0);
        const earnings = currentWorkData.reduce((sum, entry) => sum + (entry.calculated_earning || 0), 0); // Ensure calculated_earning exists
        return { totalWorkUnits: units, totalEarnings: earnings };
    }, [workData]);

    // Render function for each section in the main FlatList
    const renderScreenSection = ({ item }: { item: ScreenSection }) => {
        switch (item.id) {
            case 'header':
                return (
                    <View className={`flex-row justify-between items-center px-5 bg-white border-b border-gray-200 ${Platform.OS === 'android' ? 'pt-8' : 'pt-12'} pb-4`}>
                        <Text className="text-2xl font-bold text-gray-800">{t('reportsPage.title')}</Text>
                        <TouchableOpacity onPress={() => console.log("Help pressed - to be implemented")}>
                            <AppIcon name="help-circle-outline" size={28} color={COLORS.primary} family="Ionicons" />
                        </TouchableOpacity>
                    </View>
                );
            case 'filters':
                return (
                    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3 mt-3">
                        <Text className="text-lg font-semibold text-gray-700 mb-3">{t('reportsPage.selectTime')}</Text>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={quickFilterOptions}
                            keyExtractor={(opt) => opt.key}
                            className="mb-3 -mx-2 px-2"
                            renderItem={({ item: opt }) => (
                                <TouchableOpacity
                                    key={opt.key}
                                    className={`px-3 py-2 rounded-full mr-2 border ${filters.quickFilter === opt.key ? 'bg-primary-500 border-primary-500' : 'bg-gray-100 border-gray-300'}`}
                                    onPress={() => handleQuickFilterChange(opt.key)}
                                >
                                    <Text className={`${filters.quickFilter === opt.key ? 'text-white' : 'text-gray-700'} font-medium text-sm`}>{opt.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-blue-50 border border-blue-500 p-3 rounded-md mb-3 active:bg-blue-100"
                            onPress={openCustomDateRangePicker}
                        >
                            <AppIcon name="calendar-range" family="MaterialCommunityIcons" size={20} color={COLORS.primary} />
                            <Text className="ml-2 text-blue-600 font-semibold">{t('reportsPage.chooseDates')}</Text>
                        </TouchableOpacity>

                        {savedFiltersList.length > 0 && (
                            <View className="mb-3 pt-2 border-t border-gray-100">
                                <Text className="text-sm text-gray-600 mb-2 font-medium">{t('reportsPage.savedFilters')}</Text>
                                {savedFiltersList.map(sf => (
                                    <View key={sf.name} className="flex-row justify-between items-center mb-1 p-2 bg-gray-50 rounded">
                                        <TouchableOpacity onPress={() => applySavedFilter(sf)} className="flex-1">
                                            <Text className="text-sm text-gray-700">{sf.name}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => removeSavedFilter(sf.name)} className="p-1">
                                            <AppIcon name="close-circle-outline" family="Ionicons" size={20} color={COLORS.error} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-green-50 border border-green-500 p-3 rounded-md active:bg-green-100"
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
                        <Text className="text-lg font-semibold text-gray-700 mb-3">{t('reportsPage.viewAndSearch')}</Text>
                        <View className="flex-row justify-center mb-4 bg-gray-100 rounded-full p-1">
                            {(['work', 'payments', 'combined'] as ViewMode[]).map(mode => (
                                <TouchableOpacity
                                    key={mode}
                                    className={`flex-1 py-2 px-3 rounded-full items-center ${filters.viewMode === mode ? 'bg-primary-500 shadow' : ''}`}
                                    onPress={() => handleViewModeChange(mode)}
                                >
                                    <Text className={`${filters.viewMode === mode ? 'text-white' : 'text-gray-700'} font-semibold capitalize`}>
                                        {t(`reportsPage.viewModes.${mode}` as any)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View className="flex-row items-center bg-gray-100 rounded-md p-0.5 border border-gray-300 mb-3">
                            <AppIcon name="magnify" family="MaterialCommunityIcons" size={22} color={COLORS.gray[500]} style={{ marginLeft: 8, marginRight: 4 }} />
                            <TextInput
                                className="flex-1 h-10 text-base text-gray-700 px-2"
                                placeholder={t('reportsPage.searchPlaceholder')}
                                value={filters.searchQuery}
                                onChangeText={handleSearchQueryChange}
                                placeholderTextColor={COLORS.gray[400]}
                            />
                        </View>
                        {/* Task Type Filter */}
                        {STATIC_JOB_TYPES.length > 0 && (
                            <View className="mt-2">
                                <Text className="text-sm text-gray-600 mb-1">{t('reportsPage.filters.filterByJobType')}</Text>
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    data={jobTypeFilterOptions}
                                    keyExtractor={(jt) => jt.code || 'all-types'} // Use a unique key for the "all" option
                                    className="-mx-1 px-1 py-1" // Added py-1 for some vertical padding if items have different heights
                                    renderItem={({ item: jt }) => {
                                        // Determine the display name based on locale and available translations
                                        let displayName = jt.name_en; // Default to English
                                        if (locale === 'gu' && (jt as JobType).name_gu) displayName = (jt as JobType).name_gu;
                                        else if (locale === 'hi' && (jt as JobType).name_hi) displayName = (jt as JobType).name_hi;
                                        else if ((jt as JobType).name) displayName = (jt as JobType).name; // Fallback to generic name if specific locale name not found
                                        // For the "All Types" button, name_en is already set by t() to the localized string

                                        return (
                                            <TouchableOpacity
                                                onPress={() => handleTaskTypeCodeFilterChange(jt.code)}
                                                className={`px-3 py-1 rounded-full border text-xs mr-2 ${filters.taskTypeCode === jt.code ? 'bg-secondary-500 border-secondary-500' : 'bg-gray-100 border-gray-300'}`}
                                            >
                                                <Text className={`${filters.taskTypeCode === jt.code ? 'text-white' : 'text-secondary-700'}`}>
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
                        <Text className="text-lg font-semibold text-gray-700 mb-3">{t('reportsPage.keyNumbers')}</Text>
                        {(isLoadingWork || isLoadingPayments) && <View className="h-20 justify-center items-center"><Text className="text-gray-500">{t('reportsPage.loadingData')}</Text></View>}
                        {!(isLoadingWork || isLoadingPayments) && (
                            <View className="grid grid-cols-2 gap-x-3 gap-y-4">
                                <View className="bg-blue-50 p-3 rounded-lg items-center shadow-sm">
                                    <AppIcon name="briefcase-variant-outline" family="MaterialCommunityIcons" size={28} color={COLORS.blue[600]} />
                                    <Text className="text-xs text-blue-600 mt-1 font-medium">{t('reportsPage.kpi.totalWorkUnits')}</Text>
                                    <Text className="text-xl font-bold text-blue-700 mt-0.5">{totalWorkUnits || '--'}</Text>
                                </View>
                                <View className="bg-green-50 p-3 rounded-lg items-center shadow-sm">
                                    <AppIcon name="cash-multiple" family="MaterialCommunityIcons" size={28} color={COLORS.success} />
                                    <Text className="text-xs text-green-600 mt-1 font-medium">{t('reportsPage.kpi.totalEarnings')}</Text>
                                    <Text className="text-xl font-bold text-green-700 mt-0.5">₹{(totalEarnings || 0).toFixed(0)}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                );
            case 'visualSummary':
                return (
                    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
                        <Text className="text-lg font-semibold text-gray-700 mb-3">{t('reportsPage.visualSummary')}</Text>
                        {(isLoadingWork || isLoadingPayments) && <View className="h-40 justify-center items-center"><Text className="text-gray-500">{t('reportsPage.loadingCharts')}</Text></View>}
                        {!(isLoadingWork || isLoadingPayments) && (workData.length > 0 || paymentData.length > 0) && (
                            <>
                                <View className="h-48 bg-gray-100 justify-center items-center rounded-md mb-3 p-2">
                                    <Text className="text-gray-500 text-center">{t('reportsPage.charts.workUnitsBar')}</Text>
                                </View>
                                <View className="h-48 bg-gray-100 justify-center items-center rounded-md mb-3 p-2">
                                    <Text className="text-gray-500 text-center">{t('reportsPage.charts.earningsTrendLine')}</Text>
                                </View>
                                <View className="h-48 bg-gray-100 justify-center items-center rounded-md mb-3 p-2">
                                    <Text className="text-gray-500 text-center">{t('reportsPage.charts.paymentRatioPie')}</Text>
                                </View>
                                <View className="h-48 bg-gray-100 justify-center items-center rounded-md p-2">
                                    <Text className="text-gray-500 text-center">{t('reportsPage.charts.workDensityHeatmap')}</Text>
                                </View>
                            </>
                        )}
                        {!(isLoadingWork || isLoadingPayments) && workData.length === 0 && paymentData.length === 0 && (
                            <Text className="text-gray-500 text-center py-10">{t('reportsPage.noDataForCharts')}</Text>
                        )}
                    </View>
                );
            case 'workList':
                if (isLoadingWork || isLoadingPayments) return null; // Handled by section loader
                if (!(filters.viewMode === 'work' || filters.viewMode === 'combined')) return null;
                return (
                    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
                        <Text className="text-lg font-semibold text-gray-700 mb-1">{t('reportsPage.detailedData')}</Text>
                        <Text className="text-base font-semibold text-gray-700 mb-2 mt-1">{t('reportsPage.workEntriesTitle')}</Text>
                        <FlatList
                            data={workData}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => {
                                const jobTypeDetails = STATIC_JOB_TYPES.find(jt => jt.code === item.task_type_code);
                                const displayJobTypeName = jobTypeDetails ? (locale === 'gu' && jobTypeDetails.name_gu ? jobTypeDetails.name_gu : locale === 'hi' && jobTypeDetails.name_hi ? jobTypeDetails.name_hi : jobTypeDetails.name_en || jobTypeDetails.name) : item.task_type_code;
                                return (
                                    <View className="border-b border-gray-200 py-3 px-1">
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-1 pr-2">
                                                <Text className="text-sm text-gray-800 font-medium">{item.description || t('reportsPage.noDescription')}</Text>
                                                {displayJobTypeName && <Text className="text-xs text-gray-500">{t('reportsPage.jobType')}{displayJobTypeName}</Text>}
                                            </View>
                                            <Text className="text-sm font-semibold text-blue-600">{`${item.quantity}${item.unit ? ` ${item.unit}` : ''}`}</Text>
                                        </View>
                                        <View className="flex-row justify-between items-center mt-1.5">
                                            <Text className="text-xs text-gray-600">{t('reportsPage.earning')}: ₹{(item.calculated_earning || 0).toFixed(2)}</Text>
                                        </View>
                                        {item.notes && <Text className="text-xs text-gray-400 mt-1.5 italic bg-gray-50 p-1 rounded">{t('reportsPage.notes')}: {item.notes}</Text>}
                                    </View>
                                );
                            }}
                            ListEmptyComponent={() => (
                                !isLoadingWork && workData.length === 0 && (
                                    <Text className="text-gray-500 text-center py-5">{t('reportsPage.noDataForFilters')}</Text>
                                )
                            )}
                            // Prevent FlatList from being scrollable itself if it has few items
                            // The parent FlatList handles scrolling
                            scrollEnabled={false}
                        />
                    </View>
                );
            case 'paymentList':
                if (isLoadingWork || isLoadingPayments) return null;
                if (!(filters.viewMode === 'payments' || filters.viewMode === 'combined')) return null;
                return (
                    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
                        {/* Only show title if workList wasn't shown or if it's combined and workData is empty */}
                        {(filters.viewMode === 'payments' || (filters.viewMode === 'combined' && workData.length === 0)) &&
                            <Text className="text-lg font-semibold text-gray-700 mb-1">{t('reportsPage.detailedData')}</Text>}
                        <Text className="text-base font-semibold text-gray-700 mb-2 mt-1">{t('reportsPage.paymentEntriesTitle')}</Text>
                        <FlatList
                            data={paymentData}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View className="border-b border-gray-200 py-3 px-1">
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1 pr-2">
                                            <Text className="text-sm text-gray-800 font-medium">
                                                {t('reportsPage.paymentAmount')}: ₹{(typeof item.amount === 'string' ? parseFloat(item.amount) : (item.amount || 0)).toFixed(2)}
                                            </Text>
                                            {item.from && <Text className="text-xs text-gray-500">{t('reportsPage.paymentFrom')}: {item.from}</Text>}
                                            {item.source?.name && <Text className="text-xs text-gray-500">{t('reportsPage.paymentSource')}: {item.source.name_gu || item.source.name_en || item.source.name}</Text>}
                                        </View>
                                        <Text className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString(locale || 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                                    </View>
                                    {item.description && <Text className="text-xs text-gray-400 mt-1.5 italic bg-gray-50 p-1 rounded">{t('reportsPage.notes')}: {item.description}</Text>}
                                    {item.notes && <Text className="text-xs text-gray-400 mt-1 italic bg-gray-50 p-1 rounded">{t('reportsPage.notes')}: {item.notes}</Text>}
                                </View>
                            )}
                            ListEmptyComponent={() => (
                                !isLoadingPayments && paymentData.length === 0 && (
                                    <Text className="text-gray-500 text-center py-5">{t('reportsPage.noDataForFilters')}</Text>
                                )
                            )}
                            scrollEnabled={false}
                        />
                        {/* Overall empty state for detailed data if both lists are empty and not loading and in combined view*/}
                        {!(isLoadingWork || isLoadingPayments) && filters.viewMode === 'combined' && workData.length === 0 && paymentData.length === 0 && (
                            <Text className="text-gray-500 text-center py-10">{t('reportsPage.noDataForFilters')}</Text>
                        )}
                    </View>
                );
            case 'exportAndShare':
                return (
                    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
                        <Text className="text-lg font-semibold text-gray-700 mb-3">{t('reportsPage.exportAndShare')}</Text>
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
            // Sticky header for the main title section (optional, but good UX)
            // stickyHeaderIndices={[0]} // If you want the header to stick
            ListFooterComponent={<View className="h-12" />} // Add some padding at the bottom
        />
    );
};

export default ReportsScreen; 