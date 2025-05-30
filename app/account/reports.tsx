import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, Platform, ScrollView, Dimensions,
  ActivityIndicator, TextInput, Share, Alert
} from 'react-native';
// import { Picker } from '@react-native-picker/picker'; // Picker is no longer used
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit'; // BarChart is not used currently
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { COLORS, FONTS, SIZES, SPACING, LAYOUT, SHADOWS } from '../../constants/theme';
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
  date: string; // Should be in a format that can be compared with startDate/endDate (e.g., ISO string)
  hours: number;
  amountEarned: number;
  taskName?: string; // Optional for detailed breakdown
}

interface ReportData {
  period: string;
  totalEarnings: number;
  totalHours: number;
  averageRate: number;
  tasksCompleted: number;
  detailedBreakdown?: Array<{ name: string; hours: number; earnings: number }>; // For future enhancement
  hasData: boolean; // To distinguish between no data for filter and initial state
  earningsOverTimeData?: { labels: string[]; datasets: { data: number[] }[] };
  taskDistributionData?: { name: string; population: number; color: string; legendFontColor: string; legendFontSize: number }[];
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

const fetchWorkDataFromAPI = async (startDate: Date, endDate: Date, taskNameFilter?: string): Promise<WorkEntry[]> => {
  console.log(`[ReportsScreen] Fetching work data for period: ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}, task: ${taskNameFilter || 'All'}`);
  return new Promise(resolve => {
    setTimeout(() => {
      // Simulate fetching and filtering data
      const allWorkEntries: WorkEntry[] = [
        // ... (populate with more diverse mock data for realistic testing)
        { id: 'w1', date: '2023-10-01T10:00:00Z', hours: 5, amountEarned: 250, taskName: 'Project A' },
        { id: 'w2', date: '2023-10-05T14:00:00Z', hours: 3, amountEarned: 180, taskName: 'Consulting' },
        { id: 'w3', date: '2023-10-10T09:00:00Z', hours: 8, amountEarned: 400, taskName: 'Project B' },
        { id: 'w4', date: startDate.toISOString(), hours: 6, amountEarned: 300, taskName: 'Support' }, // Within range
        { id: 'w5', date: endDate.toISOString(), hours: 4, amountEarned: 500, taskName: 'Feature X' }, // Within range
        { id: 'w6', date: new Date(startDate.getTime() + 86400000).toISOString(), hours: 2, amountEarned: 100, taskName: 'Project A Maintenance' }, // ensure some data within range
      ];

      const filtered = allWorkEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        const isAfterStart = entryDate >= startDate;
        const isBeforeEnd = entryDate <= new Date(endDate.getTime() + (24 * 60 * 60 * 1000 - 1)); // Include whole end day
        const taskMatch = !taskNameFilter || (entry.taskName && entry.taskName.toLowerCase().includes(taskNameFilter.toLowerCase()));
        return isAfterStart && isBeforeEnd && taskMatch;
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

  // New states for advanced filtering and sorting
  const [taskNameFilter, setTaskNameFilter] = useState('');
  const [sortTaskBy, setSortTaskBy] = useState<'name' | 'hours' | 'earnings'>('name');
  const [sortTaskDirection, setSortTaskDirection] = useState<'asc' | 'desc'>('asc');
  const [showSortOptions, setShowSortOptions] = useState(false);

  // useEffect(() => {
  // }, [t, showToast]); // Removed client loading useEffect

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
    setIsLoading(true);
    setReportData(null);

    try {
      const workEntries = await fetchWorkDataFromAPI(
        startDate,
        endDate,
        taskNameFilter
      ); // Replace with your actual function

      if (workEntries.length === 0) {
        setReportData({
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
      const earningsByDate = new Map<string, number>(); // For earnings over time chart

      workEntries.forEach(entry => {
        totalEarnings += entry.amountEarned;
        totalHours += entry.hours;

        const entryDateString = new Date(entry.date).toLocaleDateString();
        const currentDailyEarnings = earningsByDate.get(entryDateString) || 0;
        earningsByDate.set(entryDateString, currentDailyEarnings + entry.amountEarned);

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

      // Prepare data for Earnings Over Time Chart
      const sortedDates = Array.from(earningsByDate.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      const earningsOverTimeData = {
        labels: sortedDates.map(date => {
          const d = new Date(date);
          return `${d.getMonth() + 1}/${d.getDate()}`;
        }),
        datasets: [
          {
            data: sortedDates.map(date => earningsByDate.get(date) || 0)
          }
        ]
      };

      // Prepare data for Task Distribution Pie Chart
      const taskDistributionData = detailedBreakdown.map((task, index) => ({
        name: task.name,
        population: task.earnings, // Using earnings for pie chart distribution
        color: COLORS.chartColors[index % COLORS.chartColors.length], // Use predefined colors
        legendFontColor: COLORS.text, // Use theme text color
        legendFontSize: 12
      }));

      setReportData({
        period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalHours: parseFloat(totalHours.toFixed(1)),
        averageRate: parseFloat(averageRate.toFixed(2)),
        tasksCompleted: workEntries.length,
        detailedBreakdown: detailedBreakdown.length > 0 ? detailedBreakdown : undefined,
        hasData: true,
        earningsOverTimeData,
        taskDistributionData
      });

    } catch (error) {
      console.error('[ReportsScreen] Error generating report:', error);
      showToast(t('errorGeneratingReport'), 'error');
    }
    setIsLoading(false);
  };

  const clearReport = () => {
    setReportData(null);
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
      'Period',
      'Task Name',
      'Hours',
      'Earnings',
      'Average Rate'
    ].join(',');

    const rows = [];

    // Add summary row
    rows.push([
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

      const filename = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
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

  const screenWidth = Dimensions.get("window").width;

  const chartConfig = {
    backgroundGradientFrom: COLORS.background.secondary,
    backgroundGradientTo: COLORS.background.secondary,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(${parseInt(COLORS.primary.substring(1, 3), 16)}, ${parseInt(COLORS.primary.substring(3, 5), 16)}, ${parseInt(COLORS.primary.substring(5, 7), 16)}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: SIZES.borderRadius,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "1",
      stroke: COLORS.primary
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="filter-variant" size={SIZES.iconSize.medium} color={COLORS.primary} />
          <Text style={styles.cardTitle}>{t('reportFiltersTitle')}</Text>
        </View>

        {/* Date Range Pickers */}
        <View style={styles.dateRangeContainer}>
          <View style={styles.datePickerWrapper}>
            <Text style={styles.label}>{t('startDateLabel')}</Text>
            <Pressable onPress={() => setShowStartDatePicker(true)} style={styles.dateInput}>
              <MaterialCommunityIcons name="calendar" size={SIZES.iconSize.small} color={COLORS.gray[500]} style={styles.dateIcon} />
              <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
            </Pressable>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onChangeStartDate}
                maximumDate={endDate}
              />
            )}
          </View>
          <View style={styles.datePickerWrapper}>
            <Text style={styles.label}>{t('endDateLabel')}</Text>
            <Pressable onPress={() => setShowEndDatePicker(true)} style={styles.dateInput}>
              <MaterialCommunityIcons name="calendar" size={SIZES.iconSize.small} color={COLORS.gray[500]} style={styles.dateIcon} />
              <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
            </Pressable>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onChangeEndDate}
                minimumDate={startDate}
              />
            )}
          </View>
        </View>

        {/* Task Name Filter */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('taskNameFilterLabel')}</Text>
          <View style={styles.textInputContainer}>
            <MaterialCommunityIcons name="magnify" size={SIZES.iconSize.small} color={COLORS.gray[500]} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder={t('taskNameFilterPlaceholder')}
              value={taskNameFilter}
              onChangeText={setTaskNameFilter}
              placeholderTextColor={COLORS.gray[400]}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <Pressable
            onPress={handleGenerateReport}
            disabled={isLoading}
            style={({ pressed }: { pressed: boolean }) => [
              styles.button,
              styles.primaryButton,
              isLoading ? styles.buttonDisabled : null,
              pressed ? styles.buttonPressed : null,
            ].filter(Boolean) // Ensure no nulls/undefined are in the array
            }
          >
            <MaterialCommunityIcons name="file-chart" size={SIZES.iconSize.medium} color={COLORS.white} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {isLoading ? t('generatingReportButton', { defaultValue: 'Generating...' }) : t('generateReportButton', { defaultValue: 'Generate Report' })}
            </Text>
          </Pressable>
          <Pressable
            onPress={clearReport}
            style={({ pressed }: { pressed: boolean }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <MaterialCommunityIcons name="refresh" size={SIZES.iconSize.medium} color={COLORS.primary} style={styles.buttonIcon} />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>{t('clearReportButton')}</Text>
          </Pressable>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('generatingReportButton')}...</Text>
        </View>
      )}

      {reportData && !isLoading && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="information-outline" size={SIZES.iconSize.medium} color={COLORS.primary} />
            <Text style={styles.cardTitle}>{t('reportSummaryTitle')}</Text>
            <Pressable onPress={handleExportReport} style={styles.exportButton}>
              <MaterialCommunityIcons name="download" size={SIZES.iconSize.medium} color={COLORS.primary} />
            </Pressable>
          </View>

          {!reportData.hasData ? (
            <View style={styles.noDataContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={SIZES.iconSize.large} color={COLORS.gray[500]} />
              <Text style={styles.noDataText}>{t('noDataForFilters', { defaultValue: 'No data found for the selected filters.' })}</Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryGrid}>
                {/* Summary Items */}
                <View style={styles.summaryItem}>
                  <MaterialCommunityIcons name="calendar-range" size={SIZES.iconSize.small} color={COLORS.secondary} style={styles.summaryIcon} />
                  <Text style={styles.summaryLabel}>{t('reportPeriodLabel')}</Text>
                  <Text style={styles.summaryValue}>{reportData.period}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <MaterialCommunityIcons name="cash-multiple" size={SIZES.iconSize.small} color={COLORS.success} style={styles.summaryIcon} />
                  <Text style={styles.summaryLabel}>{t('totalEarningsLabel')}</Text>
                  <Text style={styles.summaryValue}>{`$${reportData.totalEarnings.toFixed(2)}`}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <MaterialCommunityIcons name="clock-time-four-outline" size={SIZES.iconSize.small} color={COLORS.info} style={styles.summaryIcon} />
                  <Text style={styles.summaryLabel}>{t('totalHoursLabel')}</Text>
                  <Text style={styles.summaryValue}>{`${reportData.totalHours.toFixed(1)} ${t('hoursSuffix')}`}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <MaterialCommunityIcons name="briefcase-outline" size={SIZES.iconSize.small} color={COLORS.warning} style={styles.summaryIcon} />
                  <Text style={styles.summaryLabel}>{t('tasksCompletedLabel')}</Text>
                  <Text style={styles.summaryValue}>{reportData.tasksCompleted}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <MaterialCommunityIcons name="chart-line" size={SIZES.iconSize.small} color={COLORS.blue[500]} style={styles.summaryIcon} />
                  <Text style={styles.summaryLabel}>{t('averageRateLabel')}</Text>
                  <Text style={styles.summaryValue}>{`$${reportData.averageRate.toFixed(2)} ${t('perHourSuffix')}`}</Text>
                </View>
              </View>

              {/* Charts Section */}
              {reportData.earningsOverTimeData && reportData.earningsOverTimeData.labels.length > 0 && (
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>{t('earningsOverTimeChartTitle')}</Text>
                  <LineChart
                    data={reportData.earningsOverTimeData}
                    width={screenWidth - SPACING.md * 2 - SPACING.lg * 2} // Adjust width based on padding
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chartStyle}
                  />
                </View>
              )}

              {reportData.taskDistributionData && reportData.taskDistributionData.length > 0 && (
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>{t('taskDistributionChartTitle')}</Text>
                  <PieChart
                    data={reportData.taskDistributionData}
                    width={screenWidth - SPACING.md * 2 - SPACING.lg * 2} // Adjust width based on padding
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1, index) => { // Use COLORS.chartColors for pie chart
                        // index might be undefined for the sum label, handle it gracefully
                        const colorIndex = index !== undefined ? index % COLORS.chartColors.length : 0;
                        const hexColor = COLORS.chartColors[colorIndex];
                        const r = parseInt(hexColor.substring(1, 3), 16);
                        const g = parseInt(hexColor.substring(3, 5), 16);
                        const b = parseInt(hexColor.substring(5, 7), 16);
                        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                      }
                    }}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"} // prevent label cutoff
                    // center={[10, 0]} // Adjust center if needed
                    absolute // Shows absolute values in pie chart
                    style={styles.chartStyle}
                  />
                </View>
              )}

              {/* Detailed Breakdown Table */}
              {reportData.detailedBreakdown && reportData.detailedBreakdown.length > 0 && (
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.taskNameHeader]}>{t('taskNameHeader')}</Text>
                    <Pressable onPress={() => applySort('hours')} style={styles.tableHeaderClickable}>
                      <Text style={[styles.tableHeaderText, styles.hoursHeader]}>{t('hoursHeader')}</Text>
                      {sortTaskBy === 'hours' && <MaterialCommunityIcons name={sortTaskDirection === 'asc' ? 'arrow-up' : 'arrow-down'} size={16} color={COLORS.primary} />}
                    </Pressable>
                    <Pressable onPress={() => applySort('earnings')} style={styles.tableHeaderClickable}>
                      <Text style={[styles.tableHeaderText, styles.earningsHeader]}>{t('earningsHeader')}</Text>
                      {sortTaskBy === 'earnings' && <MaterialCommunityIcons name={sortTaskDirection === 'asc' ? 'arrow-up' : 'arrow-down'} size={16} color={COLORS.primary} />}
                    </Pressable>
                  </View>
                  {reportData.detailedBreakdown.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.taskNameCell]}>{item.name}</Text>
                      <Text style={[styles.tableCell, styles.hoursCell]}>{item.hours.toFixed(1)}</Text>
                      <Text style={[styles.tableCell, styles.earningsCell]}>{`$${item.earnings.toFixed(2)}`}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50], // Lighter background for overall screen
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl, // Add more padding at the bottom
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius * 1.5,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small, // Softer shadow for cards
    elevation: 3, // Adjusted elevation for Android consistency
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg, // Increased margin
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100], // Lighter border
    paddingBottom: SPACING.md, // Increased padding
  },
  cardTitle: {
    fontSize: SIZES.h2, // Slightly larger title
    fontFamily: FONTS.bold, // Bolder font
    color: COLORS.secondary,
    marginLeft: SPACING.md, // Increased margin
    flex: 1,
  },
  exportButton: {
    padding: SPACING.sm, // Increased padding for better touch
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.gray[100], // Subtle background for export
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg, // Increased margin
  },
  datePickerWrapper: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  datePickerWrapperLast: {
    marginRight: 0,
  },
  label: {
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    color: COLORS.gray[700], // Darker label for better contrast
    marginBottom: SPACING.sm, // Increased margin
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50], // Lighter background for inputs
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SPACING.md, // Increased padding
    paddingVertical: SPACING.sm + 2, // Adjusted for height
    height: SIZES.inputHeight + 4, // Slightly taller
  },
  dateIcon: {
    marginRight: SPACING.sm,
  },
  dateText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
  },
  inputGroup: {
    marginBottom: SPACING.lg, // Increased margin
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50], // Lighter background
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SPACING.md, // Increased padding
    height: SIZES.inputHeight + 4, // Slightly taller
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    height: '100%',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg, // Increased top margin for button group
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: SIZES.borderRadius * 1.2,
    flex: 1,
    marginHorizontal: SPACING.sm, // Slightly increased margin between buttons
    minHeight: SIZES.buttonHeight + 4,
    ...SHADOWS.small, // Consistent shadow for buttons
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5, // Slightly thicker border
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: SIZES.h4 - 1, // Adjusted size
    fontFamily: FONTS.semibold,
    color: COLORS.white,
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray[300],
    elevation: 0, // No shadow when disabled
  },
  buttonPressed: {
    opacity: 0.85, // More subtle press
    transform: [{ scale: 0.98 }] // Press down effect
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Slightly more opaque
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: SPACING.md, // Increased margin
    fontSize: SIZES.body,
    color: COLORS.secondary,
    fontFamily: FONTS.medium,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 1.5, // More padding
    minHeight: 200, // Increased min height
    backgroundColor: COLORS.gray[50], // Subtle background
    borderRadius: SIZES.borderRadius,
    marginTop: SPACING.md,
  },
  noDataText: {
    fontSize: SIZES.h4,
    color: COLORS.gray[600], // Slightly darker text
    fontFamily: FONTS.regular,
    marginTop: SPACING.md, // Increased margin
    textAlign: 'center',
    paddingHorizontal: SPACING.lg, // Add horizontal padding
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  summaryItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius * 1.2,
    padding: SPACING.md,
    width: '48%',
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
    minHeight: 110,
    ...SHADOWS.small,
    elevation: 3,
    borderWidth: 1, // Adding a subtle border
    borderColor: COLORS.gray[100], // Light border color
  },
  summaryIcon: {
    marginBottom: SPACING.sm, // Increased margin
    padding: SPACING.xs, // Add padding around icon
    borderRadius: SIZES.borderRadius * 2, // Make it circular if background added
    // backgroundColor: COLORS.primary + '20', // Example: transparent primary
  },
  summaryLabel: {
    fontSize: SIZES.caption,
    fontFamily: FONTS.medium,
    color: COLORS.gray[700], // Darker for better readability
    marginBottom: SPACING.xs,
  },
  summaryValue: {
    fontSize: SIZES.h3 - 2, // Adjusted size
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  chartContainer: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    borderRadius: SIZES.borderRadius * 1.5,
    ...SHADOWS.small, // Softer shadow for charts as well
    elevation: 3, // Adjusted elevation
  },
  chartTitle: {
    fontSize: SIZES.h3, // Larger chart title
    fontFamily: FONTS.semibold,
    color: COLORS.secondary,
    marginBottom: SPACING.lg, // Increased margin
    textAlign: 'center',
  },
  chartStyle: {
    borderRadius: SIZES.borderRadius,
    // marginVertical: SPACING.sm, // Removed as padding is in container
  },
  tableContainer: {
    marginTop: SPACING.md,
    borderWidth: 0,
    borderRadius: SIZES.borderRadius * 1.5,
    backgroundColor: COLORS.white,
    ...SHADOWS.small, // Softer shadow for table container
    overflow: 'hidden',
    elevation: 3, // Adjusted elevation
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[50], // Even lighter header for a cleaner look
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1, // Slightly thinner border, but clear
    borderBottomColor: COLORS.gray[200],
  },
  tableHeaderClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs / 2,
    borderRadius: SIZES.borderRadius / 2, // Add slight rounding for pressable area
    // Add a style for when pressed (though React Native's Pressable handles opacity)
  },
  tableHeaderClickablePressed: { // Style for when table header is pressed
    backgroundColor: COLORS.gray[100], // Subtle background change on press
  },
  tableHeaderText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.bold, // Bolder header text
    color: COLORS.secondary,
  },
  taskNameHeader: {
    flex: 3,
  },
  hoursHeader: {
    flex: 1,
    textAlign: 'right',
    marginRight: SPACING.xs,
  },
  earningsHeader: {
    flex: 1.5,
    textAlign: 'right',
    marginRight: SPACING.xs,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.gray[800], // Darker text for better readability
  },
  taskNameCell: {
    flex: 3,
    fontFamily: FONTS.medium, // Slightly bolder for task name
  },
  hoursCell: {
    flex: 1,
    textAlign: 'right',
  },
  earningsCell: {
    flex: 1.5,
    textAlign: 'right',
    fontFamily: FONTS.medium, // Slightly bolder for earnings
  },
});