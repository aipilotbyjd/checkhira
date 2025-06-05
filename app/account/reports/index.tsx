import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform, TextInput, FlatList, ActivityIndicator, Dimensions, ScrollView, Modal, Button, Pressable, Alert } from 'react-native';
import { useLanguage, LanguageContextType } from '../../../contexts/LanguageContext';
import AppIcon, { IconFamily } from '../../../components/common/Icon';
import { COLORS } from '../../../constants/theme';
import { useApi } from '../../../hooks/useApi';
import reportService from '../../../services/reportService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

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

// --- EXPORT LOGIC ---
const escapeCsvField = (field: any): string => {
    if (field === null || field === undefined) {
        return '';
    }
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

const exportReportFile = async (
    format: 'pdf' | 'csv',
    workData: TransformedWorkEntry[],
    paymentData: TransformedPaymentEntry[],
    filters: ReportFilters,
    summary: any,
    t: (key: string) => string
) => {
    if (!workData.length && !paymentData.length) {
        alert(t('noDataToExport'));
        return;
    }

    let content = '';
    let fileExtension = '';
    let mimeType = '';

    if (format === 'csv') {
        content = convertToCsv(workData, paymentData, filters);
        fileExtension = '.csv';
        mimeType = 'text/csv';
    } else {
        content = generateHtmlReport(workData, paymentData, filters, summary, t);
        fileExtension = '.html';
        mimeType = 'text/html';
    }

    const fileName = `Checkhira-Report-${new Date().toISOString().split('T')[0]}${fileExtension}`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });

    if (!(await Sharing.isAvailableAsync())) {
        alert(t('sharingNotAvailable'));
        return;
    }

    await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle: t(format === 'csv' ? 'reportsPage.exportAsCSV' : 'reportsPage.exportAsPDF'),
    });
};
// --- END EXPORT LOGIC ---

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
    const { execute, isLoading: apiIsLoading, error: apiError, data: rawApiData } = useApi<ApiResponseData>();

    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaveFilterModalVisible, setSaveFilterModalVisible] = useState(false);
    const [newFilterName, setNewFilterName] = useState('');
    const [saveFilterError, setSaveFilterError] = useState('');

    const [filters, setFilters] = useState<ReportFilters>({
        quickFilter: 'today',
        startDate: getDateRangeForQuickFilter('today').startDate,
        endDate: getDateRangeForQuickFilter('today').endDate,
        viewMode: 'payment',
        searchQuery: '',
        taskTypeCode: null,
    });

    const [savedFiltersList, setSavedFiltersList] = useState<{ name: string; criteria: ReportFilters }[]>([]);

    const [workData, setWorkData] = useState<TransformedWorkEntry[]>([]);
    const [paymentData, setPaymentData] = useState<TransformedPaymentEntry[]>([]);
    const [reportSummary, setReportSummary] = useState<ApiResponseData['summary'] | null>(null);

    const [isProcessingData, setIsProcessingData] = useState(false);

    const SAVED_FILTERS_STORAGE_KEY = '@Checkhira/ReportSavedFilters';

    useEffect(() => {
        const loadSavedFilters = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem(SAVED_FILTERS_STORAGE_KEY);
                if (jsonValue !== null) {
                    setSavedFiltersList(JSON.parse(jsonValue));
                }
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
        setDatePickerVisible(true);
    }, []);

    const handleCustomDateChange = useCallback((newStartDate: string, newEndDate: string) => {
        setFilters(prev => ({
            ...prev,
            quickFilter: 'custom',
            startDate: newStartDate,
            endDate: newEndDate,
        }));
        setDatePickerVisible(false);
    }, []);

    const handleQuickFilterChange = useCallback((filterKey: QuickFilterType) => {
        if (filterKey === 'custom') {
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

    const handleClearCustomDateFilter = useCallback(() => {
        handleQuickFilterChange('today');
    }, [handleQuickFilterChange]);

    const saveCurrentFilter = useCallback(() => {
        setSaveFilterModalVisible(true);
    }, []);

    const handleSaveFilter = useCallback(async () => {
        setSaveFilterError('');
        if (!newFilterName || newFilterName.trim().length === 0) {
            setSaveFilterError(t('reportsPage.saveFilterPrompt.errorEmpty'));
            return;
        }

        const trimmedName = newFilterName.trim();
        if (savedFiltersList.some(f => f.name.toLowerCase() === trimmedName.toLowerCase())) {
            setSaveFilterError(t('reportsPage.saveFilterPrompt.errorMessage'));
            return;
        }

        try {
            const newSavedFilters = [...savedFiltersList, { name: trimmedName, criteria: { ...filters } }];
            setSavedFiltersList(newSavedFilters);
            await saveFiltersToStorage(newSavedFilters);
            setNewFilterName('');
            setSaveFilterModalVisible(false);
        } catch (error) {
            setSaveFilterError(t('reportsPage.saveFilterPrompt.errorSave'));
        }
    }, [filters, savedFiltersList, newFilterName, t]);

    const handleCloseSaveFilterModal = useCallback(() => {
        setSaveFilterModalVisible(false);
        setNewFilterName('');
        setSaveFilterError('');
    }, []);

    const applySavedFilter = useCallback((savedFilter: { name: string; criteria: ReportFilters }) => {
        setFilters(savedFilter.criteria);
    }, []);

    const removeSavedFilter = useCallback(async (filterNameToRemove: string) => {
        const newSavedFilters = savedFiltersList.filter(f => f.name !== filterNameToRemove);
        setSavedFiltersList(newSavedFilters);
        await saveFiltersToStorage(newSavedFilters);
    }, [savedFiltersList]);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
        console.log("Handle view mode change:", mode);
        setFilters(prev => ({ ...prev, viewMode: mode, taskTypeCode: null }));
    }, []);

    const handleSearchQueryChange = useCallback((text: string) => {
        setFilters(prev => ({ ...prev, searchQuery: text }));
    }, []);

    const handleTaskTypeCodeFilterChange = useCallback((code: string | null) => {
        setFilters(prev => ({ ...prev, taskTypeCode: code }));
    }, []);

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
            const summary = { totalWorkRecords, totalWorkAmount, totalPaymentRecords, totalPaymentAmount };
            await exportReportFile(format, workData, paymentData, filters, summary, t as (key: string) => string);
        } catch (error: any) {
            console.error("Export error:", error);
            alert(error.message || "An unexpected error occurred during export.");
        } finally {
            setIsExporting(false);
        }
    }, [filters, workData, paymentData, t, totalWorkRecords, totalWorkAmount, totalPaymentRecords, totalPaymentAmount]);

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
                return <ExportAndShareSection t={t} exportReport={exportReport} isExporting={isExporting} />;
            default:
                return null;
        }
    }, [
        t, locale, filters, quickFilterOptions, savedFiltersList, jobTypeFilterOptions,
        isLoadingDisplayData, apiError, workData, paymentData,
        totalWorkRecords, totalWorkAmount, totalPaymentRecords, totalPaymentAmount,
        handleQuickFilterChange, openCustomDateRangePicker, applySavedFilter, removeSavedFilter, saveCurrentFilter,
        handleViewModeChange, handleSearchQueryChange, handleTaskTypeCodeFilterChange, exportReport,
        isExporting, screenWidth
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