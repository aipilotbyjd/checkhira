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
      description: 'Sample Payment',
      amount: 5000,
      numberOfPayments: 3,
      source: 'cash' as PaymentSource,
    },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Simplified Header */}
      <View className="border-b px-6 pb-4 pt-6" style={{ borderColor: COLORS.gray[200] }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold" style={{ color: COLORS.secondary }}>
            Payments
          </Text>
          <View className="flex-row space-x-2">
            <Pressable
              onPress={() => {
                router.push('/payments/add');
              }}
              className="mr-2 rounded-lg p-2"
              style={{ backgroundColor: COLORS.primary + '15' }}>
              <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
            </Pressable>
            <Pressable
              onPress={() => {
                /* Handle filter */
              }}
              className="mr-2 rounded-lg p-2"
              style={{ backgroundColor: COLORS.primary + '15' }}>
              <MaterialCommunityIcons name="filter-variant" size={20} color={COLORS.primary} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView className="mt-6 flex-1 px-6">
        {paymentsList.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(`/payments/${item.id}/edit`)}
            className="mb-4 rounded-2xl p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
                  {format(item.date, 'MMMM dd, yyyy')}
                </Text>
                <Text className="mt-1 text-base" style={{ color: COLORS.gray[600] }}>
                  {item.description}
                </Text>
                <View className="mt-1 flex-row items-center">
                  <MaterialCommunityIcons 
                    name={item.source === 'cash' ? 'cash' : 'bank'} 
                    size={14} 
                    color={COLORS.gray[400]} 
                  />
                  <Text className="ml-1 text-xs" style={{ color: COLORS.gray[400] }}>
                    {PAYMENT_SOURCES.find((s) => s.value === item.source)?.label}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="cash-multiple" size={20} color={COLORS.primary} />
                <Text className="ml-2 text-lg font-semibold" style={{ color: COLORS.primary }}>
                  ₹ {item.amount.toFixed(2)}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
