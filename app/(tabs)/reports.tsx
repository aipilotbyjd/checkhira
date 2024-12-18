import { useState, useCallback, createRef } from 'react';
import { Text, View, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MonthSelectorCalendar from 'react-native-month-selector';
import { COLORS } from '../../constants/theme';
import { format } from 'date-fns';
import moment from 'moment';
import ActionSheet from 'react-native-actions-sheet';

export default function Reports() {
  // State management
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'monthly' | 'custom'>('monthly');
  const [activeReport, setActiveReport] = useState<'work' | 'payments'>('work');
  const [showFilters, setShowFilters] = useState(false);

  // Add ActionSheet ref
  const actionSheetRef = createRef<any>();

  // Mock data - replace with actual data
  const reportData = [
    {
      id: 1,
      date: new Date(2024, 2, 15),
      type: 'polishing',
      hours: 8,
      diamonds: 12,
      rate: 100,
      earnings: 1200,
    },
    {
      id: 2,
      date: new Date(2024, 2, 15),
      type: 'polishing',
      hours: 8,
      diamonds: 12,
      rate: 100,
      earnings: 1200,
    },
    {
      id: 3,
      date: new Date(2024, 2, 15),
      type: 'polishing',
      hours: 8,
      diamonds: 12,
      rate: 100,
      earnings: 1200,
    },
    {
      id: 4,
      date: new Date(2024, 2, 15),
      type: 'polishing',
      hours: 8,
      diamonds: 12,
      rate: 100,
      earnings: 1200,
    },
  ];

  const paymentsList = [
    {
      id: 1,
      date: new Date(2024, 2, 15),
      description: 'Payment 1',
      amount: 1000,
    },
    {
      id: 2,
      date: new Date(2024, 2, 15),
      description: 'Payment 2',
      amount: 1000,
    },
  ];

  const handleDateChange = (date: Date | undefined, type: 'start' | 'end') => {
    if (date) {
      setDateRange((prev) => ({
        ...prev,
        [type]: date,
      }));
    }
    setShowMonthPicker(false);
  };

  // Add open/close handlers
  const openFilters = () => {
    actionSheetRef.current?.show();
  };

  const closeFilters = () => {
    actionSheetRef.current?.hide();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Simplified Header */}
      <View className="border-b px-6 pb-4 pt-6" style={{ borderColor: COLORS.gray[200] }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold" style={{ color: COLORS.secondary }}>
            Detailed Report
          </Text>
          <View className="flex-row space-x-2">
            <Pressable
              onPress={openFilters}
              className="mr-2 rounded-lg p-2"
              style={{ backgroundColor: COLORS.primary + '15' }}>
              <MaterialCommunityIcons name="filter-variant" size={20} color={COLORS.primary} />
            </Pressable>
            <Pressable
              onPress={() => {
                /* Handle share */
              }}
              className="mr-2 rounded-lg p-2"
              style={{ backgroundColor: COLORS.primary + '15' }}>
              <MaterialCommunityIcons name="share-variant" size={20} color={COLORS.primary} />
            </Pressable>
            <Pressable
              onPress={() => {
                /* Handle export */
              }}
              className="rounded-lg p-2"
              style={{ backgroundColor: COLORS.primary + '15' }}>
              <MaterialCommunityIcons name="export-variant" size={20} color={COLORS.primary} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Report Data */}
      <ScrollView className="flex-1">
        <View className="space-y-4 p-6">
          {activeReport === 'work'
            ? reportData.map((entry) => (
                <Pressable
                  key={entry.id}
                  onPress={() => {
                    /* Handle entry press */
                  }}
                  className="mb-4 rounded-2xl p-4"
                  style={{ backgroundColor: COLORS.background.secondary }}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
                        {format(entry.date, 'dd MMM yyyy')}
                      </Text>
                      <Text className="mt-1 capitalize" style={{ color: COLORS.secondary }}>
                        {entry.type}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
                        {entry.hours}h • {entry.diamonds} diamonds
                      </Text>
                      <Text className="text-base font-semibold" style={{ color: COLORS.success }}>
                        ₹ {entry.earnings.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))
            : paymentsList.map((payment) => (
                <Pressable
                  key={payment.id}
                  onPress={() => {
                    /* Handle payment press */
                  }}
                  className="rounded-2xl p-4 mb-4"
                  style={{ backgroundColor: COLORS.background.secondary }}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
                        {format(payment.date, 'dd MMM yyyy')}
                      </Text>
                      <Text className="mt-1" style={{ color: COLORS.secondary }}>
                        {payment.description}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-base font-semibold" style={{ color: COLORS.success }}>
                        ₹ {payment.amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
        </View>
      </ScrollView>

      {/* Filters ActionSheet */}
      <ActionSheet ref={actionSheetRef}>
        <View className="p-6">
          {/* Work/Payments Tab Selector */}
          <View className="mb-4">
            <View
              className="mb-4 flex-row rounded-xl border"
              style={{ borderColor: COLORS.gray[200] }}>
              <Pressable
                onPress={() => setActiveReport('work')}
                className="flex-1 rounded-l-xl p-3"
                style={{
                  backgroundColor: activeReport === 'work' ? COLORS.primary + '15' : 'transparent',
                }}>
                <Text
                  className="text-center"
                  style={{
                    color: activeReport === 'work' ? COLORS.primary : COLORS.gray[400],
                  }}>
                  Work
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveReport('payments')}
                className="flex-1 rounded-r-xl p-3"
                style={{
                  backgroundColor:
                    activeReport === 'payments' ? COLORS.primary + '15' : 'transparent',
                  borderLeftWidth: 1,
                  borderLeftColor: COLORS.gray[200],
                }}>
                <Text
                  className="text-center"
                  style={{
                    color: activeReport === 'payments' ? COLORS.primary : COLORS.gray[400],
                  }}>
                  Payments
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Monthly/Custom Tab Selector */}
          <View className="mb-4">
            <View
              className="mb-4 flex-row rounded-xl border"
              style={{ borderColor: COLORS.gray[200] }}>
              <Pressable
                onPress={() => setActiveTab('monthly')}
                className="flex-1 rounded-l-xl p-3"
                style={{
                  backgroundColor: activeTab === 'monthly' ? COLORS.primary + '15' : 'transparent',
                }}>
                <Text
                  className="text-center"
                  style={{
                    color: activeTab === 'monthly' ? COLORS.primary : COLORS.gray[400],
                  }}>
                  Monthly
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveTab('custom')}
                className="flex-1 rounded-r-xl p-3"
                style={{
                  backgroundColor: activeTab === 'custom' ? COLORS.primary + '15' : 'transparent',
                  borderLeftWidth: 1,
                  borderLeftColor: COLORS.gray[200],
                }}>
                <Text
                  className="text-center"
                  style={{
                    color: activeTab === 'custom' ? COLORS.primary : COLORS.gray[400],
                  }}>
                  Custom
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Date Selection Content */}
          {activeTab === 'monthly' ? (
            <View>
              <Pressable
                onPress={() => setShowMonthPicker(true)}
                className="flex-row items-center justify-between rounded-xl border p-3"
                style={{ borderColor: COLORS.gray[200] }}>
                <MaterialCommunityIcons name="calendar-month" size={20} color={COLORS.primary} />
                <Text style={{ color: COLORS.gray[600] }}>
                  {format(dateRange.start, 'MMMM yyyy')}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.gray[400]} />
              </Pressable>

              {showMonthPicker && (
                <View className="absolute left-0 right-0 top-32 z-50 bg-white p-4">
                  <MonthSelectorCalendar
                    selectedDate={moment(dateRange.start)}
                    onMonthTapped={(date) => {
                      const startDate = date.toDate();
                      const endDate = new Date(
                        startDate.getFullYear(),
                        startDate.getMonth() + 1,
                        0
                      );
                      setDateRange({ start: startDate, end: endDate });
                      setShowMonthPicker(false);
                    }}
                    currentDate={moment()}
                    selectedBackgroundColor={COLORS.primary}
                    selectedMonthStyle={{ color: 'white' }}
                  />
                </View>
              )}
            </View>
          ) : (
            <View>
              <View>
                <Text className="mb-2 text-sm font-medium" style={{ color: COLORS.gray[600] }}>
                  From Date
                </Text>
                <Pressable
                  onPress={() => setShowMonthPicker(true)}
                  className="flex-row items-center justify-between rounded-xl border p-3"
                  style={{ borderColor: COLORS.gray[200] }}>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
                    <Text className="ml-2" style={{ color: COLORS.gray[600] }}>
                      {format(dateRange.start, 'dd MMM yyyy')}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.gray[400]} />
                </Pressable>
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium" style={{ color: COLORS.gray[600] }}>
                  To Date
                </Text>
                <Pressable
                  onPress={() => setShowMonthPicker(true)}
                  className="flex-row items-center justify-between rounded-xl border p-3"
                  style={{ borderColor: COLORS.gray[200] }}>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
                    <Text className="ml-2" style={{ color: COLORS.gray[600] }}>
                      {format(dateRange.end, 'dd MMM yyyy')}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.gray[400]} />
                </Pressable>
              </View>
            </View>
          )}

          {/* Apply Button */}
          <Pressable
            onPress={closeFilters}
            className="mt-4 rounded-xl p-3"
            style={{ backgroundColor: COLORS.primary }}>
            <Text className="text-center text-white">Apply Filters</Text>
          </Pressable>
        </View>
      </ActionSheet>
    </View>
  );
}
