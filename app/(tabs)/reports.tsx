import { useState, useCallback } from 'react';
import { Text, View, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MonthSelector from 'react-native-month-selector';
import { COLORS } from '../../constants/theme';
import { format } from 'date-fns';
import moment from 'moment';

export default function Reports() {
  // State management
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'polishing' | 'cutting'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'earnings'>('date');
  const [activeTab, setActiveTab] = useState<'monthly' | 'custom'>('monthly');

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
    // ... more entries
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

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Header */}
      <View className="border-b px-6 pb-4 pt-6" style={{ borderColor: COLORS.gray[200] }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold" style={{ color: COLORS.secondary }}>
            Detailed Report
          </Text>
          <View className="flex-row space-x-2">
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

        {/* Filters */}
        <View className="mt-4">
          {/* Tab Selector */}
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

          {/* Monthly Tab Content */}
          {activeTab === 'monthly' && (
            <>
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
                  <MonthSelector
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
                    selectedTextColor="white"
                  />
                </View>
              )}
            </>
          )}

          {/* Custom Tab Content */}
          {activeTab === 'custom' && (
            <View className="flex-row space-x-2">
              <Pressable
                onPress={() => setShowMonthPicker(true)}
                className="flex-1 flex-row items-center rounded-xl border p-3"
                style={{ borderColor: COLORS.gray[200] }}>
                <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
                <Text className="ml-2" style={{ color: COLORS.gray[600] }}>
                  {format(dateRange.start, 'dd MMM yyyy')}
                </Text>
              </Pressable>
              <Text style={{ color: COLORS.gray[400] }}>to</Text>
              <Pressable
                onPress={() => setShowMonthPicker(true)}
                className="flex-1 flex-row items-center rounded-xl border p-3"
                style={{ borderColor: COLORS.gray[200] }}>
                <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
                <Text className="ml-2" style={{ color: COLORS.gray[600] }}>
                  {format(dateRange.end, 'dd MMM yyyy')}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Report Data */}
      <ScrollView className="flex-1">
        <View className="space-y-4 p-6">
          {reportData.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => {
                /* Handle entry press */
              }}
              className="rounded-2xl p-4"
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
          ))}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showMonthPicker && (
        <DateTimePicker
          value={showMonthPicker ? dateRange.start : dateRange.end}
          mode="date"
          display="spinner"
          onChange={(_, date) => handleDateChange(date, showMonthPicker ? 'start' : 'end')}
        />
      )}
    </View>
  );
}
