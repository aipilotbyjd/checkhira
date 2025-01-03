import { Text, View, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

export default function WorkList() {
  const router = useRouter();

  // Mock data - replace with actual data
  const workList = [
    {
      id: 1,
      date: new Date(),
      type: 'polishing',
      hours: 8,
      diamonds: 12,
      earnings: 5000,
    },
    {
      id: 2,
      date: new Date(2024, 2, 15),
      type: 'cutting',
      hours: 6,
      diamonds: 8,
      earnings: 3500,
    },
  ];

  // Calculate today's total
  const todayTotal = workList
    .filter((item) => format(item.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, item) => sum + item.earnings, 0);

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
            ₹ {todayTotal.toFixed(2)}
          </Text>
        </View>

        {/* Work list */}
        {workList.map((item) => (
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
    </View>
  );
}
