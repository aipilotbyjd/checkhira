import { Text, View, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

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
    },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <View className="flex-row items-center justify-between px-6 pt-6">
        <Text className="text-xl font-semibold" style={{ color: COLORS.secondary }}>
          Payments History
        </Text>
        <Pressable
          onPress={() => router.push('/payments/add')}
          className="rounded-lg p-2"
          style={{ backgroundColor: COLORS.primary + '15' }}>
          <Octicons name="plus" size={20} color={COLORS.primary} />
        </Pressable>
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