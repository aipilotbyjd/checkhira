import { useState } from 'react';
import { Text, View, ScrollView, Pressable, TextInput } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/theme';
import { format } from 'date-fns';

export default function Reports() {
  // State management
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState<{
    show: boolean;
    for: 'start' | 'end';
  } | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'polishing' | 'cutting'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'earnings'>('date');

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
    setShowDatePicker(null);
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
              className="rounded-lg p-2"
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
        <View className="mt-4 space-y-4">
          {/* Date Range */}
          <View className="flex-row space-x-2">
            <Pressable
              onPress={() => setShowDatePicker({ show: true, for: 'start' })}
              className="flex-1 flex-row items-center rounded-xl border p-3"
              style={{ borderColor: COLORS.gray[200] }}>
              <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
              <Text className="ml-2" style={{ color: COLORS.gray[600] }}>
                {format(dateRange.start, 'dd MMM yyyy')}
              </Text>
            </Pressable>
            <Text style={{ color: COLORS.gray[400] }}>to</Text>
            <Pressable
              onPress={() => setShowDatePicker({ show: true, for: 'end' })}
              className="flex-1 flex-row items-center rounded-xl border p-3"
              style={{ borderColor: COLORS.gray[200] }}>
              <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
              <Text className="ml-2" style={{ color: COLORS.gray[600] }}>
                {format(dateRange.end, 'dd MMM yyyy')}
              </Text>
            </Pressable>
          </View>

          {/* Type Filter and Sort */}
          <View className="flex-row space-x-2">
            <View className="flex-1">
              <Text className="mb-1 text-sm" style={{ color: COLORS.gray[400] }}>
                Work Type
              </Text>
              <View
                className="flex-row rounded-xl border"
                style={{ borderColor: COLORS.gray[200] }}>
                {(['all', 'polishing', 'cutting'] as const).map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setFilterType(type)}
                    className={`flex-1 p-2 ${filterType === type ? 'bg-primary' : ''}`}
                    style={{
                      backgroundColor: filterType === type ? COLORS.primary : 'transparent',
                      borderRadius: 12,
                    }}>
                    <Text
                      className="text-center text-sm"
                      style={{ color: filterType === type ? COLORS.white : COLORS.gray[600] }}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-sm" style={{ color: COLORS.gray[400] }}>
                Sort By
              </Text>
              <View
                className="flex-row rounded-xl border"
                style={{ borderColor: COLORS.gray[200] }}>
                {(['date', 'earnings'] as const).map((sort) => (
                  <Pressable
                    key={sort}
                    onPress={() => setSortBy(sort)}
                    className={`flex-1 p-2 ${sortBy === sort ? 'bg-primary' : ''}`}
                    style={{
                      backgroundColor: sortBy === sort ? COLORS.primary : 'transparent',
                      borderRadius: 12,
                    }}>
                    <Text
                      className="text-center text-sm"
                      style={{ color: sortBy === sort ? COLORS.white : COLORS.gray[600] }}>
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
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
      {showDatePicker?.show && (
        <DateTimePicker
          value={showDatePicker.for === 'start' ? dateRange.start : dateRange.end}
          mode="date"
          display="spinner"
          onChange={(_, date) => handleDateChange(date, showDatePicker.for)}
        />
      )}
    </View>
  );
}
