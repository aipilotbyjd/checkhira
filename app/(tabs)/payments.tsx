import { Text, View, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { PAYMENT_SOURCES, PaymentSource } from '../../constants/payments';

export default function PaymentsList() {
  const router = useRouter();
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
              className="rounded-full p-3"
              style={{ backgroundColor: COLORS.primary }}>
              <MaterialCommunityIcons name="plus" size={22} color="white" />
            </Pressable>
            <Pressable
              onPress={() => {
                /* Handle filter */
              }}
              className="rounded-full p-3"
              style={{ backgroundColor: COLORS.gray[100] }}>
              <MaterialCommunityIcons name="filter-variant" size={22} color={COLORS.gray[600]} />
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
        {paymentsList.map((item) => (
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
    </View>
  );
}
