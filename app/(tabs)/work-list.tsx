import { Text, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { useState, useRef, useEffect } from 'react';
import { useWorkOperations } from '../../hooks/useWorkOperations';

export default function WorkList() {
  const router = useRouter();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [currentFilter, setCurrentFilter] = useState('all');
  const { getAllWork, isLoading } = useWorkOperations();
  const [workList, setWorkList] = useState([]);

  useEffect(() => {
    const loadWorkList = async () => {
      const data = await getAllWork();
      if (data) {
        setWorkList(data);
      }
    };

    loadWorkList();
  }, []);

  // Add loading indicator
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // // Mock data - replace with actual data
  // const workList = [
  //   {
  //     id: 1,
  //     date: new Date(),
  //     type: 'polishing',
  //     hours: 8,
  //     diamonds: 12,
  //     earnings: 5000,
  //   },
  //   {
  //     id: 2,
  //     date: new Date(2024, 2, 15),
  //     type: 'cutting',
  //     hours: 6,
  //     diamonds: 8,
  //     earnings: 3500,
  //   },
  // ];

  // Calculate today's total
  const todayTotal = workList
    .filter((item) => format(item.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, item) => sum + item.earnings, 0);

  const handleFilter = (filter: string) => {
    setCurrentFilter(filter);
    actionSheetRef.current?.hide();
  };

  const filteredWorkList = workList.filter((item) => {
    const itemDate = new Date(item.date);
    const today = new Date();

    switch (currentFilter) {
      case 'today':
        return format(itemDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      case 'week':
        const weekStart = startOfWeek(today);
        const weekEnd = endOfWeek(today);
        return isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
      case 'month':
        return (
          itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear()
        );
      default:
        return true;
    }
  });

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Header with shadow */}
      <View
        className="border-b px-6 pb-4 pt-6"
        style={{
          borderColor: COLORS.gray[200],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
          backgroundColor: COLORS.background.primary,
        }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
            Work List
          </Text>
          <View className="flex-row space-x-3">
            <Pressable
              onPress={() => router.push('/work/add')}
              className="mr-2 rounded-full p-3"
              style={{ backgroundColor: COLORS.primary }}>
              <MaterialCommunityIcons name="plus" size={22} color="white" />
            </Pressable>
            <Pressable
              onPress={() => actionSheetRef.current?.show()}
              className="rounded-full p-3"
              style={{ backgroundColor: COLORS.gray[100] }}>
              <MaterialCommunityIcons
                name="filter-variant"
                size={22}
                color={currentFilter === 'all' ? COLORS.gray[600] : COLORS.primary}
              />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Today's total section */}
        <View className="my-6 rounded-xl p-4" style={{ backgroundColor: COLORS.primary + '15' }}>
          <Text className="text-sm font-medium" style={{ color: COLORS.gray[600] }}>
            Today's Total
          </Text>
          <Text className="mt-2 text-3xl font-bold" style={{ color: COLORS.primary }}>
            ₹ {todayTotal.toFixed(2)}
          </Text>
        </View>

        {/* Work list */}
        {filteredWorkList.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(`/work/${item.id}/edit`)}
            className="mb-4 rounded-xl p-4"
            style={{
              backgroundColor: COLORS.background.secondary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
                  {format(item.date, 'dd MMM yyyy')}
                </Text>
                <Text className="mt-1 text-base capitalize" style={{ color: COLORS.secondary }}>
                  {item.type}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
                  {item.hours}h • {item.diamonds} diamonds
                </Text>
                <Text className="mt-1 text-lg font-semibold" style={{ color: COLORS.success }}>
                  ₹ {item.earnings.toFixed(2)}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <ActionSheet
        ref={actionSheetRef}
        containerStyle={{ backgroundColor: COLORS.background.primary }}>
        <View className="p-4">
          <Text className="mb-4 text-lg font-bold" style={{ color: COLORS.secondary }}>
            Filter Work List
          </Text>

          {[
            { label: 'All', value: 'all' },
            { label: 'Today', value: 'today' },
            { label: 'This Week', value: 'week' },
            { label: 'This Month', value: 'month' },
          ].map((option) => (
            <Pressable
              key={option.value}
              onPress={() => handleFilter(option.value)}
              className="flex-row items-center justify-between py-4"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: COLORS.gray[200],
              }}>
              <Text
                className="text-base"
                style={{
                  color: currentFilter === option.value ? COLORS.primary : COLORS.secondary,
                }}>
                {option.label}
              </Text>
              {currentFilter === option.value && (
                <MaterialCommunityIcons name="check" size={20} color={COLORS.primary} />
              )}
            </Pressable>
          ))}
        </View>
      </ActionSheet>
    </View>
  );
}
