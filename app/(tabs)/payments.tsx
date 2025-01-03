import { Text, View, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { useState, useRef } from 'react';
import { PAYMENT_SOURCES, PaymentSource } from '../../constants/payments';

export default function PaymentsList() {
  const router = useRouter();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [currentFilter, setCurrentFilter] = useState('all');

  // Mock data - replace with your actual data source
  const paymentsList = [
    {
      id: 1,
      date: new Date(),
      amount: 5000,
      source: 'cash' as PaymentSource,
    },
    // Add more mock data for better testing
    {
      id: 2,
      date: new Date(2024, 2, 15),
      amount: 7500,
      source: 'bank' as PaymentSource,
    },
  ];

  const handleFilter = (filter: string) => {
    setCurrentFilter(filter);
    actionSheetRef.current?.hide();
  };

  const filteredPaymentsList = paymentsList.filter((item) => {
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
            Payments
          </Text>
          <View className="flex-row space-x-3">
            <Pressable
              onPress={() => router.push('/payments/add')}
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
            ₹ {paymentsList.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
          </Text>
        </View>

        {/* Payments list */}
        {filteredPaymentsList.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(`/payments/${item.id}/edit`)}
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
                <Text className="text-base font-medium" style={{ color: COLORS.secondary }}>
                  ₹ {item.amount.toFixed(2)}
                </Text>
                <View className="mt-2 flex-row items-center">
                  <MaterialCommunityIcons
                    name={item.source === 'cash' ? 'cash' : 'bank'}
                    size={16}
                    color={COLORS.gray[500]}
                  />
                  <Text className="ml-2 text-sm" style={{ color: COLORS.gray[500] }}>
                    {PAYMENT_SOURCES.find((s) => s.value === item.source)?.label}
                  </Text>
                </View>
                <Text className="mt-1 text-xs" style={{ color: COLORS.gray[400] }}>
                  {format(item.date, 'MMMM dd, yyyy')}
                </Text>
              </View>
              <View className="rounded-full p-2" style={{ backgroundColor: COLORS.gray[100] }}>
                <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray[500]} />
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
            Filter Payments
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
