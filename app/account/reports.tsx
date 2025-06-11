import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, TextInput, FlatList, ActivityIndicator, Modal, Button, Pressable, Alert, ScrollView } from 'react-native';
import { useLanguage, LanguageContextType } from '../../contexts/LanguageContext';
import AppIcon, { IconFamily } from '../../components/common/Icon';
import { COLORS } from '../../constants/theme';
import {
    TransformedWorkEntry,
    TransformedPaymentEntry,
    JobType,
    ReportFilters,
    ViewMode,
    QuickFilterType
} from '../../types/reports';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useReports } from '../../hooks/useReports';

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
    clearCustomDateFilter: () => void;
    locale: string;
}
const FiltersSection = React.memo(({
    t, filters, quickFilterOptions, savedFiltersList,
    handleQuickFilterChange, openCustomDateRangePicker, applySavedFilter, removeSavedFilter, saveCurrentFilter,
    clearCustomDateFilter, locale
}: FiltersSectionProps) => {
    const isCustomDateActive = filters.quickFilter === 'custom' && filters.startDate && filters.endDate;

    const formattedStartDate = isCustomDateActive ? new Date(filters.startDate!).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    const formattedEndDate = isCustomDateActive ? new Date(filters.endDate!).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' }) : '';

    return (
        <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3 mt-3">
            <Text className="text-xl font-semibold text-gray-800 mb-4">{t('reportsPage.selectTime')}</Text>

            {/* Quick Filter Buttons */}
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

            {/* Custom Date Range Button */}
            <View className={`flex-row items-center justify-center border p-3 rounded-md mb-4 ${isCustomDateActive ? 'bg-blue-100 border-blue-500' : 'bg-blue-50 border-blue-500'}`}>
                <TouchableOpacity
                    className="flex-row items-center justify-center flex-1"
                    onPress={openCustomDateRangePicker}
                >
                    <AppIcon name="calendar-range" family="MaterialCommunityIcons" size={20} color={COLORS.primary} />
                    <Text className="ml-2 text-blue-700 font-semibold text-center" numberOfLines={1}>
                        {isCustomDateActive ? `${formattedStartDate} - ${formattedEndDate}` : t('reportsPage.chooseDates')}
                    </Text>
                </TouchableOpacity>
                {isCustomDateActive && (
                    <TouchableOpacity onPress={clearCustomDateFilter} className="ml-2 p-1 bg-black/10 rounded-full">
                        <AppIcon name="close" family="MaterialCommunityIcons" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Saved Filters Section */}
            {savedFiltersList.length > 0 && (
                <View className="mb-4 pt-3 border-t border-gray-200">
                    <Text className="text-base text-gray-700 mb-2 font-medium">{t('reportsPage.savedFilters')}</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="flex-row mx-2 px-2"
                        contentContainerStyle={{ paddingRight: 16 }}
                    >
                        {savedFiltersList.map(sf => (
                            <View key={sf.name} className="flex-row items-center mr-2 mb-2">
                                <TouchableOpacity
                                    onPress={() => applySavedFilter(sf)}
                                    className="flex-row items-center justify-center p-2.5 bg-gray-50 rounded-l-md border border-r-0 border-gray-200"
                                >
                                    <AppIcon name="filter-variant" family="MaterialCommunityIcons" size={16} color={COLORS.secondary} />
                                    <Text className="text-sm text-gray-800 ml-1.5" numberOfLines={1} style={{ maxWidth: 120 }}>{sf.name}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => removeSavedFilter(sf.name)}
                                    className="p-2.5 bg-gray-100 rounded-r-md border border-gray-200 justify-center"
                                >
                                    <AppIcon name="close-circle-outline" family="Ionicons" size={20} color={COLORS.error} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Save Current Filter Button */}
            <TouchableOpacity
                className="flex-row items-center justify-center bg-green-50 border border-green-500 p-3.5 rounded-md active:bg-green-100"
                onPress={saveCurrentFilter}
            >
                <AppIcon name="content-save-all-outline" family="MaterialCommunityIcons" size={20} color={COLORS.success} />
                <Text className="ml-2 text-green-700 font-semibold">{t('reportsPage.saveCurrentFilter')}</Text>
            </TouchableOpacity>
        </View>
    );
});

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
            {jobTypeFilterOptions.length > 1 && (filters.viewMode === 'work' || filters.viewMode === 'combined') && (
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
    STATIC_JOB_TYPES: JobType[];
}
const WorkListSection = React.memo(({ t, locale, isLoadingDisplayData, apiError, filters, workData, STATIC_JOB_TYPES }: WorkListSectionProps) => {
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
    }, [locale, t, STATIC_JOB_TYPES]);

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
    isExporting: boolean;
}
const ExportAndShareSection = React.memo(({ t, exportReport, isExporting }: ExportAndShareSectionProps) => (
    <View className="bg-white p-4 rounded-lg shadow mb-4 mx-3">
        <Text className="text-xl font-semibold text-gray-800 mb-4">{t('reportsPage.exportAndShare')}</Text>
        <TouchableOpacity
            disabled={isExporting}
            className={`flex-row items-center justify-center bg-red-100 border border-red-300 p-3.5 rounded-md mb-3 active:bg-red-200 ${isExporting ? 'opacity-50' : ''}`}
            onPress={() => exportReport('pdf')}
        >
            <AppIcon name="file-pdf-box" family="MaterialCommunityIcons" size={22} color={COLORS.error} />
            <Text className="ml-2 text-red-700 font-semibold">
                {isExporting ? t('reportsPage.common.loading') : t('reportsPage.exportAsPDF')}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
            disabled={isExporting}
            className={`flex-row items-center justify-center bg-green-100 border border-green-300 p-3.5 rounded-md active:bg-green-200 ${isExporting ? 'opacity-50' : ''}`}
            onPress={() => exportReport('csv')}
        >
            <AppIcon name="file-excel-box" family="MaterialCommunityIcons" size={22} color={COLORS.success} />
            <Text className="ml-2 text-green-700 font-semibold">
                {isExporting ? t('reportsPage.common.loading') : t('reportsPage.exportAsCSV')}
            </Text>
        </TouchableOpacity>
    </View>
));

interface CustomDateRangePickerProps {
    t: LanguageContextType['t'];
    visible: boolean;
    initialStartDate: string | null;
    initialEndDate: string | null;
    onClose: () => void;
    onApply: (startDate: string, endDate: string) => void;
    locale: string;
}

const CustomDateRangePickerModal = ({
    t,
    visible,
    initialStartDate,
    initialEndDate,
    onClose,
    onApply,
    locale,
}: CustomDateRangePickerProps) => {
    const [startDate, setStartDate] = useState(initialStartDate ? new Date(initialStartDate) : new Date());
    const [endDate, setEndDate] = useState(initialEndDate ? new Date(initialEndDate) : new Date());
    const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

    useEffect(() => {
        setStartDate(initialStartDate ? new Date(initialStartDate) : new Date());
        setEndDate(initialEndDate ? new Date(initialEndDate) : new Date());
    }, [initialStartDate, initialEndDate]);

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || (showPicker === 'start' ? startDate : endDate);
        if (Platform.OS === 'android') {
            setShowPicker(null);
        }
        if (event.type === 'set' && selectedDate) {
            if (showPicker === 'start') {
                setStartDate(selectedDate);
                if (selectedDate > endDate) {
                    setEndDate(selectedDate);
                }
            } else {
                setEndDate(selectedDate);
            }
        } else {
            setShowPicker(null);
        }
    };

    const handleApply = () => {
        onApply(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
    };

    const dateLocaleOptions = { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const };

    const pickerToShow = useMemo(() => {
        if (!showPicker) return null;

        const commonProps = {
            mode: 'date' as const,
            display: 'default' as const,
            onChange: onDateChange,
        };

        if (showPicker === 'start') {
            return (
                <DateTimePicker
                    {...commonProps}
                    value={startDate}
                    maximumDate={new Date()}
                />
            );
        }

        if (showPicker === 'end') {
            return (
                <DateTimePicker
                    {...commonProps}
                    value={endDate}
                    minimumDate={startDate}
                    maximumDate={new Date()}
                />
            );
        }
        return null;
    }, [showPicker, startDate, endDate, onDateChange]);


    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable onPress={onClose} className="flex-1 justify-end bg-black/50">
                <Pressable onPress={(e) => e.stopPropagation()} className="bg-white rounded-t-2xl p-5 w-full shadow-2xl">
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-xl font-bold text-gray-800">{t('reportsPage.chooseDates')}</Text>
                        <TouchableOpacity onPress={onClose} className="p-1.5 bg-gray-100 rounded-full active:bg-gray-200">
                            <AppIcon name="close" family="Ionicons" size={20} color={COLORS.gray[600]} />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-between mb-4">
                        <TouchableOpacity onPress={() => setShowPicker('start')} className="flex-1 bg-gray-50 p-3.5 border border-gray-200 rounded-lg mr-2 active:border-blue-400">
                            <Text className="text-xs text-gray-500 mb-1">{t('reportsPage.startDateLabel')}</Text>
                            <Text className="text-base text-gray-800 font-semibold">{startDate.toLocaleDateString(locale, dateLocaleOptions)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowPicker('end')} className="flex-1 bg-gray-50 p-3.5 border border-gray-200 rounded-lg ml-2 active:border-blue-400">
                            <Text className="text-xs text-gray-500 mb-1">{t('reportsPage.endDateLabel')}</Text>
                            <Text className="text-base text-gray-800 font-semibold">{endDate.toLocaleDateString(locale, dateLocaleOptions)}</Text>
                        </TouchableOpacity>
                    </View>

                    {pickerToShow}

                    {(Platform.OS === 'ios' && showPicker) && (
                        <View className="flex-row justify-end mt-4">
                            <Button title={t('reportsPage.common.done')} onPress={() => setShowPicker(null)} color={COLORS.primary} />
                        </View>
                    )}

                    <View className="flex-row justify-end mt-6 pt-5 border-t border-gray-200">
                        <TouchableOpacity onPress={onClose} className="px-6 py-3 rounded-lg mr-2 border border-gray-300 active:bg-gray-100">
                            <Text className="text-base font-medium text-gray-700">{t('reportsPage.common.cancel' as any)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleApply} className="px-7 py-3 bg-fuchsia-500 rounded-lg shadow-md active:bg-fuchsia-600">
                            <Text className="text-base font-semibold text-white">{t('reportsPage.common.apply' as any)}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const ReportsScreen = () => {
    const { t, locale } = useLanguage();
    const {
        filters,
        savedFiltersList,
        workData,
        paymentData,
        isLoading,
        isExporting,
        apiError,
        totalWorkRecords,
        totalWorkAmount,
        totalPaymentRecords,
        totalPaymentAmount,
        quickFilterOptions,
        jobTypeFilterOptions,
        STATIC_JOB_TYPES,
        handleFilterChange,
        handleQuickFilterChange,
        handleCustomDateChange,
        saveCurrentFilter,
        applySavedFilter,
        removeSavedFilter,
        exportReport,
    } = useReports();

    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [isSaveFilterModalVisible, setSaveFilterModalVisible] = useState(false);
    const [newFilterName, setNewFilterName] = useState('');
    const [saveFilterError, setSaveFilterError] = useState('');

    const openCustomDateRangePicker = useCallback(() => {
        setDatePickerVisible(true);
    }, []);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        handleFilterChange({ viewMode: mode, taskTypeCode: null });
    }, [handleFilterChange]);

    const handleSearchQueryChange = useCallback((text: string) => {
        handleFilterChange({ searchQuery: text });
    }, [handleFilterChange]);

    const handleTaskTypeCodeFilterChange = useCallback((code: string | null) => {
        handleFilterChange({ taskTypeCode: code });
    }, [handleFilterChange]);

    const handleSaveFilter = useCallback(async () => {
        try {
            await saveCurrentFilter(newFilterName);
            setNewFilterName('');
            setSaveFilterModalVisible(false);
        } catch (error: any) {
            setSaveFilterError(error.message);
        }
    }, [newFilterName, saveCurrentFilter]);

    const handleCloseSaveFilterModal = useCallback(() => {
        setSaveFilterModalVisible(false);
        setNewFilterName('');
        setSaveFilterError('');
    }, []);

    const handleClearCustomDateFilter = useCallback(() => {
        handleQuickFilterChange('today');
    }, [handleQuickFilterChange]);

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
                    saveCurrentFilter={() => setSaveFilterModalVisible(true)}
                    clearCustomDateFilter={handleClearCustomDateFilter}
                    locale={locale}
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
                    isLoadingDisplayData={isLoading}
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
                    isLoadingDisplayData={isLoading}
                    apiError={apiError}
                    filters={filters}
                    workData={workData}
                    STATIC_JOB_TYPES={STATIC_JOB_TYPES}
                />;
            case 'paymentList':
                return <PaymentListSection
                    t={t}
                    locale={locale}
                    isLoadingDisplayData={isLoading}
                    apiError={apiError}
                    filters={filters}
                    paymentData={paymentData}
                    workDataLength={workData.length}
                />;
            case 'exportAndShare':
                return <ExportAndShareSection t={t} exportReport={exportReport} isExporting={isExporting} />;
            default:
                return null;
        }
    }, [
        t, locale, filters, quickFilterOptions, savedFiltersList, jobTypeFilterOptions,
        isLoading, apiError, workData, paymentData,
        totalWorkRecords, totalWorkAmount, totalPaymentRecords, totalPaymentAmount,
        handleQuickFilterChange, openCustomDateRangePicker, applySavedFilter, removeSavedFilter,
        handleViewModeChange, handleSearchQueryChange, handleTaskTypeCodeFilterChange, exportReport,
        isExporting, STATIC_JOB_TYPES
    ]);

    return (
        <>
            <FlatList
                className="flex-1 bg-gray-100"
                data={screenSections}
                renderItem={renderScreenSection}
                keyExtractor={(item) => item.id}
                ListFooterComponent={<View className="h-16" />}
                showsVerticalScrollIndicator={false}
            />
            <CustomDateRangePickerModal
                t={t}
                visible={isDatePickerVisible}
                onClose={() => setDatePickerVisible(false)}
                initialStartDate={filters.startDate}
                initialEndDate={filters.endDate}
                onApply={handleCustomDateChange}
                locale={locale}
            />
            <Modal
                visible={isSaveFilterModalVisible}
                transparent
                animationType="slide"
                onRequestClose={handleCloseSaveFilterModal}
            >
                <Pressable onPress={handleCloseSaveFilterModal} className="flex-1 justify-end bg-black/50">
                    <Pressable onPress={(e) => e.stopPropagation()} className="bg-white rounded-t-2xl p-5 w-full shadow-2xl">
                        <View className="flex-row justify-between items-center mb-5">
                            <Text className="text-xl font-bold text-gray-800">{t('reportsPage.saveFilterPrompt.title')}</Text>
                            <TouchableOpacity onPress={handleCloseSaveFilterModal} className="p-1.5 bg-gray-100 rounded-full active:bg-gray-200">
                                <AppIcon name="close" family="Ionicons" size={20} color={COLORS.gray[600]} />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-4">
                            <TextInput
                                className={`bg-gray-50 p-3.5 rounded-lg border ${saveFilterError ? 'border-red-500' : 'border-gray-200'} text-base`}
                                placeholder={t('reportsPage.saveFilterPrompt.message')}
                                value={newFilterName}
                                onChangeText={(text) => {
                                    setNewFilterName(text);
                                    setSaveFilterError('');
                                }}
                                autoFocus
                                maxLength={30}
                            />
                            {saveFilterError ? (
                                <Text className="text-red-500 text-sm mt-1">{saveFilterError}</Text>
                            ) : null}
                        </View>

                        <View className="flex-row justify-end mt-6 pt-5 border-t border-gray-200">
                            <TouchableOpacity
                                onPress={handleCloseSaveFilterModal}
                                className="px-6 py-3 rounded-lg mr-2 border border-gray-300 active:bg-gray-100"
                            >
                                <Text className="text-base font-medium text-gray-700">{t('reportsPage.common.cancel' as any)}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveFilter}
                                className="px-7 py-3 bg-fuchsia-500 rounded-lg shadow-md active:bg-fuchsia-600"
                            >
                                <Text className="text-base font-semibold text-white">{t('reportsPage.common.save' as any)}</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
};

export default ReportsScreen;