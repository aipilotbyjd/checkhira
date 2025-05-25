import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, Platform, ScrollView, Dimensions,
  ActivityIndicator, TextInput, Share, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { COLORS, FONTS, SIZES, SPACING, LAYOUT } from '../../constants/theme';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Placeholder for your actual client type
interface Client {
  id: string;
  name: string;
}

// Placeholder for your actual work entry type
interface WorkEntry {
  id: string;
  clientId: string; // or clientName if you don't use IDs
  clientName?: string; // Optional if you fetch client name separately or have it in work entry
  date: string; // Should be in a format that can be compared with startDate/endDate (e.g., ISO string)
  hours: number;
  amountEarned: number;
  taskName?: string; // Optional for detailed breakdown
}

interface ReportData {
  clientName: string;
  period: string;
  totalEarnings: number;
  totalHours: number;
  averageRate: number;
  tasksCompleted: number;
  detailedBreakdown?: Array<{ name: string; hours: number; earnings: number }>; // For future enhancement
  hasData: boolean; // To distinguish between no data for filter and initial state
}

// --- API MOCKING START ---
// Replace these with your actual API calls or service integrations
const fetchClientsFromAPI = async (): Promise<Client[]> => {
  console.log('[ReportsScreen] Fetching clients...');
  return new Promise(resolve => {
    setTimeout(() => {
      const clients: Client[] = [
        { id: '1', name: 'Client Alpha' },
        { id: '2', name: 'Client Beta' },
        { id: '3', name: 'Client Gamma' },
        { id: '4', name: 'Diamond Inc.' },
        { id: '5', name: 'Gold Works' },
      ];
      console.log('[ReportsScreen] Clients fetched:', clients);
      resolve(clients);
    }, 1000);
  });
};

const fetchWorkDataFromAPI = async (startDate: Date, endDate: Date, selectedClientId?: string, taskNameFilter?: string): Promise<WorkEntry[]> => {
  console.log(`[ReportsScreen] Fetching work data for client: ${selectedClientId || 'All'}, period: ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}, task: ${taskNameFilter || 'All'}`);
  return new Promise(resolve => {
    setTimeout(() => {
      // Simulate fetching and filtering data
      const allWorkEntries: WorkEntry[] = [
        // ... (populate with more diverse mock data for realistic testing)
        { id: 'w1', clientId: '1', clientName: 'Client Alpha', date: '2023-10-01T10:00:00Z', hours: 5, amountEarned: 250, taskName: 'Project A' },
        { id: 'w2', clientId: '2', clientName: 'Client Beta', date: '2023-10-05T14:00:00Z', hours: 3, amountEarned: 180, taskName: 'Consulting' },
        { id: 'w3', clientId: '1', clientName: 'Client Alpha', date: '2023-10-10T09:00:00Z', hours: 8, amountEarned: 400, taskName: 'Project B' },
        { id: 'w4', clientId: '3', clientName: 'Client Gamma', date: startDate.toISOString(), hours: 6, amountEarned: 300, taskName: 'Support' }, // Within range
        { id: 'w5', clientId: '4', clientName: 'Diamond Inc.', date: endDate.toISOString(), hours: 4, amountEarned: 500, taskName: 'Feature X' }, // Within range
        { id: 'w6', clientId: '1', clientName: 'Client Alpha', date: new Date(startDate.getTime() + 86400000).toISOString(), hours: 2, amountEarned: 100, taskName: 'Project A Maintenance' }, // ensure some data within range
      ];

      const filtered = allWorkEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        const isAfterStart = entryDate >= startDate;
        const isBeforeEnd = entryDate <= new Date(endDate.getTime() + (24 * 60 * 60 * 1000 - 1)); // Include whole end day
        const clientMatch = !selectedClientId || entry.clientId === selectedClientId;
        const taskMatch = !taskNameFilter || (entry.taskName && entry.taskName.toLowerCase().includes(taskNameFilter.toLowerCase()));
        return isAfterStart && isBeforeEnd && clientMatch && taskMatch;
      });
      console.log('[ReportsScreen] Work data fetched and filtered:', filtered);
      resolve(filtered);
    }, 1500);
  });
};
// --- API MOCKING END ---

const ALL_CLIENTS_ID = '__ALL_CLIENTS__'; // Special ID for "All Clients" option

export default function ReportsScreen() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>(ALL_CLIENTS_ID);
  const [clientList, setClientList] = useState<Array<{ label: string; value: string }>>([]);
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClientsLoading, setIsClientsLoading] = useState(true);

  // New states for advanced filtering and sorting
  const [taskNameFilter, setTaskNameFilter] = useState('');
  const [sortTaskBy, setSortTaskBy] = useState<'name' | 'hours' | 'earnings'>('name');
  const [sortTaskDirection, setSortTaskDirection] = useState<'asc' | 'desc'>('asc');
  const [showSortOptions, setShowSortOptions] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      setIsClientsLoading(true);
      try {
        const clients = await fetchClientsFromAPI(); // Replace with your actual function
        const formattedClients = clients.map(c => ({ label: c.name, value: c.id }));
        const allClientsOption = { label: t('allClientsPlaceholder'), value: ALL_CLIENTS_ID };
        setClientList([allClientsOption, ...formattedClients]);
      } catch (error) {
        console.error('[ReportsScreen] Error fetching clients:', error);
        showToast(t('errorFetchingClients'), 'error');
        setClientList([{ label: t('allClientsPlaceholder'), value: ALL_CLIENTS_ID }]); // Fallback
      }
      setIsClientsLoading(false);
    };
    loadClients();
  }, [t, showToast]);

  const onChangeStartDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
    if (endDate < currentDate) {
      setEndDate(currentDate);
    }
  };

  const onChangeEndDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    if (currentDate < startDate) {
      setEndDate(startDate);
    } else {
      setEndDate(currentDate);
    }
  };

  const handleGenerateReport = async () => {
    if (isClientsLoading) {
      showToast(t('clientsStillLoading'), 'info');
      return;
    }

    // No need to check selectedClient against placeholder if ALL_CLIENTS_ID is the default and valid

    setIsLoading(true);
    setReportData(null);

    try {
      const workEntries = await fetchWorkDataFromAPI(
        startDate,
        endDate,
        selectedClient === ALL_CLIENTS_ID ? undefined : selectedClient,
        taskNameFilter
      ); // Replace with your actual function

      if (workEntries.length === 0) {
        setReportData({
          clientName: selectedClient === ALL_CLIENTS_ID ? t('allClientsSummary') : clientList.find(c => c.value === selectedClient)?.label || '',
          period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
          totalEarnings: 0, totalHours: 0, averageRate: 0, tasksCompleted: 0, hasData: false
        });
        setIsLoading(false);
        // showToast(t('noDataForFilters' as any, 'No data found for the selected filters.'), 'info'); // Optional: notify user if no data
        return;
      }

      let totalEarnings = 0;
      let totalHours = 0;
      const breakdownMap = new Map<string, { hours: number; earnings: number }>();

      workEntries.forEach(entry => {
        totalEarnings += entry.amountEarned;
        totalHours += entry.hours;
        if (entry.taskName) {
          const current = breakdownMap.get(entry.taskName) || { hours: 0, earnings: 0 };
          breakdownMap.set(entry.taskName, {
            hours: current.hours + entry.hours,
            earnings: current.earnings + entry.amountEarned
          });
        }
      });

      const averageRate = totalHours > 0 ? totalEarnings / totalHours : 0;
      let detailedBreakdown = Array.from(breakdownMap.entries()).map(([name, data]) => ({ name, ...data }));

      // Apply sorting to detailedBreakdown
      detailedBreakdown.sort((a, b) => {
        const valA = a[sortTaskBy];
        const valB = b[sortTaskBy];
        let comparison = 0;

        if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        }

        return sortTaskDirection === 'asc' ? comparison : comparison * -1;
      });

      const currentClient = clientList.find(c => c.value === selectedClient);

      setReportData({
        clientName: currentClient?.value === ALL_CLIENTS_ID ? t('allClientsSummary') : currentClient?.label || '',
        period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalHours: parseFloat(totalHours.toFixed(1)),
        averageRate: parseFloat(averageRate.toFixed(2)),
        tasksCompleted: workEntries.length,
        detailedBreakdown: detailedBreakdown.length > 0 ? detailedBreakdown : undefined,
        hasData: true,
      });

    } catch (error) {
      console.error('[ReportsScreen] Error generating report:', error);
      showToast(t('errorGeneratingReport'), 'error');
    }
    setIsLoading(false);
  };

  const clearReport = () => {
    setReportData(null);
    setSelectedClient(ALL_CLIENTS_ID);
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    setStartDate(defaultStartDate);
    setEndDate(new Date());
    setTaskNameFilter(''); // Clear task filter
    setSortTaskBy('name');
    setSortTaskDirection('asc');
  };

  const generateReportCSV = () => {
    if (!reportData || !reportData.hasData) {
      return null;
    }

    const header = [
      'Client',
      'Period',
      'Task Name',
      'Hours',
      'Earnings',
      'Average Rate'
    ].join(',');

    const rows = [];

    // Add summary row
    rows.push([
      `"${reportData.clientName}"`,
      `"${reportData.period}"`,
      '"TOTAL"',
      reportData.totalHours.toFixed(1),
      reportData.totalEarnings.toFixed(2),
      reportData.averageRate.toFixed(2)
    ].join(','));

    // Add detailed breakdown rows
    if (reportData.detailedBreakdown) {
      reportData.detailedBreakdown.forEach(task => {
        rows.push([
          `"${reportData.clientName}"`,
          `"${reportData.period}"`,
          `"${task.name.replace(/"/g, '""')}"`,
          task.hours.toFixed(1),
          task.earnings.toFixed(2),
          (task.earnings / task.hours).toFixed(2)
        ].join(','));
      });
    }

    return `${header}\n${rows.join('\n')}`;
  };

  const handleExportReport = async () => {
    if (!reportData || !reportData.hasData) {
      showToast(t('noDataToExport'), 'info');
      return;
    }

    try {
      const csvString = generateReportCSV();
      if (!csvString) {
        showToast(t('noDataToExport'), 'info');
        return;
      }

      const filename = `financial_report_${reportData.clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (!(await Sharing.isAvailableAsync())) {
        showToast(t('sharingNotAvailable'), 'error');
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: t('exportReportButton'),
        UTI: 'public.comma-separated-values-text'
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      showToast(t('exportFailed'), 'error');
    }
  };

  const toggleSortOptions = () => setShowSortOptions(!showSortOptions);

  const applySort = (field: 'name' | 'hours' | 'earnings') => {
    let newDirection = sortTaskDirection;
    if (sortTaskBy === field) {
      newDirection = sortTaskDirection === 'asc' ? 'desc' : 'asc';
      setSortTaskDirection(newDirection);
    } else {
      newDirection = 'asc';
      setSortTaskBy(field);
      setSortTaskDirection(newDirection);
    }

    if (reportData && reportData.detailedBreakdown) {
      const sortedBreakdown = [...reportData.detailedBreakdown].sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        let comparison = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        }
        return newDirection === 'asc' ? comparison : comparison * -1;
      });
      setReportData(prev => prev ? ({ ...prev, detailedBreakdown: sortedBreakdown }) : null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Filters Section */}
        <View className="bg-white rounded-xl shadow-md p-6 mb-6">
          <View className="flex-row items-center mb-6">
            <MaterialCommunityIcons name="filter-variant" size={24} color="#4B5563" />
            <Text className="text-xl font-semibold text-gray-700 ml-2">{t('reportFiltersTitle')}</Text>
          </View>

          {/* Client Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-600 mb-2">{t('clientNameLabel')}</Text>
            <View className="border border-gray-200 rounded-lg bg-gray-50">
              {isClientsLoading ? (
                <View className="flex-row items-center justify-center py-3">
                  <ActivityIndicator size="small" color="#6366F1" />
                  <Text className="ml-2 text-gray-600">{t('loadingClients')}</Text>
                </View>
              ) : (
                <Picker
                  selectedValue={selectedClient}
                  onValueChange={(itemValue) => setSelectedClient(itemValue as string)}
                  className="h-12"
                  dropdownIconColor="#4B5563"
                >
                  {clientList.map((client) => (
                    <Picker.Item
                      key={client.value}
                      label={client.label}
                      value={client.value}
                      color="#374151"
                    />
                  ))}
                </Picker>
              )}
            </View>
          </View>

          {/* Task Name Filter */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-600 mb-2">{t('taskNameFilterLabel')}</Text>
            <TextInput
              className="border border-gray-200 rounded-lg bg-gray-50 px-4 py-3 text-gray-700"
              placeholder={t('enterTaskNamePlaceholder')}
              value={taskNameFilter}
              onChangeText={setTaskNameFilter}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Date Range */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-600 mb-2">{t('selectDateRangeLabel')}</Text>
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => setShowStartDatePicker(true)}
                className="flex-1 flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              >
                <MaterialCommunityIcons name="calendar-start" size={20} color="#6366F1" />
                <Text className="ml-2 text-gray-700">{startDate.toLocaleDateString()}</Text>
              </Pressable>

              <MaterialCommunityIcons name="arrow-right" size={20} color="#9CA3AF" className="mx-2" />

              <Pressable
                onPress={() => setShowEndDatePicker(true)}
                className="flex-1 flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              >
                <MaterialCommunityIcons name="calendar-end" size={20} color="#6366F1" />
                <Text className="ml-2 text-gray-700">{endDate.toLocaleDateString()}</Text>
              </Pressable>
            </View>
          </View>

          {/* Date Pickers */}
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeStartDate}
              maximumDate={new Date()}
            />
          )}
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeEndDate}
              minimumDate={startDate}
              maximumDate={new Date()}
            />
          )}

          {/* Generate Report Button */}
          <Pressable
            onPress={handleGenerateReport}
            disabled={isLoading || isClientsLoading}
            className={`flex-row items-center justify-center rounded-lg px-6 py-4 ${isLoading || isClientsLoading ? 'bg-gray-300' : 'bg-indigo-600 active:bg-indigo-700'
              }`}
          >
            {isLoading || isClientsLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />
            ) : (
              <MaterialCommunityIcons name="calculator-variant" size={22} color="#FFFFFF" className="mr-2" />
            )}
            <Text className="text-white font-semibold text-lg">
              {isLoading ? t('generatingReportButton')
                : isClientsLoading ? t('loadingClients')
                  : t('generateReportButton')}
            </Text>
          </Pressable>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#6366F1" />
            <Text className="mt-4 text-gray-600 font-medium">{t('fetchingReportData')}</Text>
          </View>
        )}

        {/* Report Results */}
        {!isLoading && reportData && reportData.hasData && (
          <View className="bg-white rounded-xl shadow-md p-6 mb-6">
            {/* Report Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="file-chart-outline" size={24} color="#4B5563" />
                <Text className="text-xl font-semibold text-gray-700 ml-2">{t('reportSummaryTitle')}</Text>
              </View>

              <Pressable
                onPress={handleExportReport}
                className="flex-row items-center bg-emerald-50 px-4 py-2.5 rounded-lg"
              >
                <MaterialCommunityIcons name="file-export-outline" size={20} color="#059669" />
                <Text className="ml-2 text-emerald-700 font-medium">{t('exportReportButton')}</Text>
              </Pressable>
            </View>

            {/* Report Info Banner */}
            <View className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg p-4 mb-6">
              <Text className="text-indigo-700 font-medium">
                {t('reportForClient', { clientName: reportData.clientName })}
              </Text>
              <Text className="text-indigo-600 mt-1">
                {t('reportForPeriod', { period: reportData.period })}
              </Text>
            </View>

            {/* Summary Grid */}
            <View className="flex-row flex-wrap justify-between">
              {[
                {
                  icon: 'cash-multiple',
                  label: t('totalEarningsLabel'),
                  value: `$${reportData.totalEarnings.toFixed(2)}`,
                  color: '#059669'
                },
                {
                  icon: 'clock-time-eight',
                  label: t('totalHoursLabel'),
                  value: `${reportData.totalHours.toFixed(1)} hrs`,
                  color: '#2563EB'
                },
                {
                  icon: 'calculator',
                  label: t('averageRateLabel'),
                  value: `$${reportData.averageRate.toFixed(2)}/hr`,
                  color: '#DC2626'
                },
                {
                  icon: 'format-list-numbered',
                  label: t('tasksCompletedLabel'),
                  value: reportData.tasksCompleted.toString(),
                  color: '#6366F1'
                }
              ].map((item, index) => (
                <View key={index} className="w-[48%] bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm">
                  <MaterialCommunityIcons name={item.icon as any} size={30} color={item.color} />
                  <Text className="text-2xl font-bold text-gray-800 mt-2">{item.value}</Text>
                  <Text className="text-sm text-gray-500 mt-1">{item.label}</Text>
                </View>
              ))}
            </View>

            {/* Detailed Breakdown */}
            {reportData.detailedBreakdown && reportData.detailedBreakdown.length > 0 && (
              <View className="mt-8">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-semibold text-gray-800">{t('detailedBreakdownTitle')}</Text>
                  <Pressable
                    onPress={toggleSortOptions}
                    className="flex-row items-center bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
                  >
                    <MaterialCommunityIcons
                      name={sortTaskBy === 'name'
                        ? (sortTaskDirection === 'asc' ? "sort-alphabetical-ascending" : "sort-alphabetical-descending")
                        : (sortTaskDirection === 'asc' ? "sort-numeric-ascending" : "sort-numeric-descending")}
                      size={20}
                      color="#4F46E5"
                    />
                    <Text className="ml-2 text-indigo-700 font-medium">
                      {t('sortByLabel')}: {t(sortTaskBy)}
                    </Text>
                  </Pressable>
                </View>

                {/* Sort Options with Improved UI */}
                {showSortOptions && (
                  <View className="bg-white border border-gray-200 rounded-xl p-3 mb-4 shadow-sm">
                    <Text className="text-sm font-medium text-gray-500 mb-2">{t('selectSortOption')}</Text>
                    <View className="flex-row justify-around">
                      {(['name', 'hours', 'earnings'] as const).map(field => (
                        <Pressable
                          key={field}
                          onPress={() => { applySort(field); setShowSortOptions(false); }}
                          className={`flex-1 flex-row items-center justify-center px-3 py-2 rounded-lg mx-1 ${sortTaskBy === field
                            ? 'bg-indigo-600'
                            : 'bg-gray-100 active:bg-gray-200'
                            }`}
                        >
                          <Text className={
                            sortTaskBy === field
                              ? 'text-white font-medium'
                              : 'text-gray-700'
                          }>
                            {t(field)}
                          </Text>
                          {sortTaskBy === field && (
                            <MaterialCommunityIcons
                              name={sortTaskDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
                              size={18}
                              color={sortTaskBy === field ? '#FFFFFF' : '#4F46E5'}
                              className="ml-1"
                            />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {/* Task Cards with Improved UI */}
                {reportData.detailedBreakdown.map((task, index) => (
                  <View
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm"
                  >
                    <Text className="text-lg font-semibold text-gray-800">{task.name}</Text>
                    <View className="flex-row justify-between mt-3">
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons name="clock-outline" size={18} color="#6B7280" />
                        <Text className="text-gray-600 ml-1">
                          {t('hoursShort')}: {task.hours.toFixed(1)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons name="currency-usd" size={18} color="#6B7280" />
                        <Text className="text-gray-600 ml-1">
                          {t('earningsShort')}: ${task.earnings.toFixed(2)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons name="chart-line" size={18} color="#6B7280" />
                        <Text className="text-gray-600 ml-1">
                          ${(task.earnings / task.hours).toFixed(2)}/hr
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* No Data State */}
        {!isLoading && (!reportData || !reportData.hasData) && (
          <View className="bg-white rounded-xl shadow-md p-8 items-center">
            <MaterialCommunityIcons name="text-box-search-outline" size={60} color="#9CA3AF" />
            <Text className="text-gray-600 text-center text-lg mt-4">
              {reportData && !reportData.hasData
                ? t('noDataForFilters')
                : t('generateReportPrompt')}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
} 