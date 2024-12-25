import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

export default function Home() {
  const router = useRouter();
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Mock data - replace with actual data
  const todayStats = {
    hours: 8,
    earnings: 500,
    pendingAmount: 1200,
  };

  const recentActivities = [
    {
      id: 1,
      type: 'work',
      description: 'Logged 8 hours for polishing',
      time: '2 hours ago',
      icon: 'clock-outline',
    },
    {
      id: 2,
      type: 'payment',
      description: 'Received ₹500 payment',
      time: '5 hours ago',
      icon: 'cash',
    },
    {
      id: 3,
      type: 'work',
      description: 'Added new work entry',
      time: '1 day ago',
      icon: 'notebook-outline',
    },
  ];

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Header Section */}
      <View className="flex-row items-center justify-between px-6 pb-4 pt-8">
        <View>
          <Text className="text-base" style={{ color: COLORS.gray[400] }}>
            {getGreeting()}
          </Text>
          <Text className="mt-1 text-2xl font-bold" style={{ color: COLORS.secondary }}>
            Ramesh
          </Text>
        </View>
        <Pressable onPress={() => router.push('/account')}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            className="h-12 w-12 rounded-full"
          />
        </Pressable>
      </View>

      {/* Today's Highlights */}
      <View className="mt-8 px-6">
        <Text className="mb-4 text-lg font-semibold" style={{ color: COLORS.secondary }}>
          Today's Highlights
        </Text>
        <View className="flex-row space-x-4">
          <Pressable
            onPress={() => router.push('/work-entry')}
            className="flex-1 rounded-2xl p-5"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <MaterialCommunityIcons name="clock-outline" size={28} color={COLORS.primary} />
            <Text className="mt-3 text-sm" style={{ color: COLORS.gray[400] }}>
              Today's Work
            </Text>
            <Text className="mt-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              {todayStats.hours} hours
            </Text>
            <Text className="mt-1 text-sm" style={{ color: COLORS.primary }}>
              ₹{todayStats.earnings} earned
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/payments')}
            className="flex-1 rounded-2xl p-5"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <MaterialCommunityIcons name="cash-multiple" size={28} color={COLORS.primary} />
            <Text className="mt-3 text-sm" style={{ color: COLORS.gray[400] }}>
              Pending Payments
            </Text>
            <Text className="mt-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              ₹{todayStats.pendingAmount}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="mt-8 px-6">
        <Text className="mb-4 text-lg font-semibold" style={{ color: COLORS.secondary }}>
          Quick Actions
        </Text>
        <View className="flex-row space-x-4">
          <Pressable
            onPress={() => router.push('/work/add')}
            className="flex-1 flex-row items-center rounded-xl px-4 py-4"
            style={{ backgroundColor: COLORS.primary + '15' }}>
            <MaterialCommunityIcons name="pencil-plus" size={22} color={COLORS.primary} />
            <Text className="ml-3 font-medium" style={{ color: COLORS.primary }}>
              Add Work Entry
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/payments/add')}
            className="flex-1 flex-row items-center rounded-xl px-4 py-4"
            style={{ backgroundColor: COLORS.primary + '15' }}>
            <MaterialCommunityIcons name="cash-plus" size={22} color={COLORS.primary} />
            <Text className="ml-3 font-medium" style={{ color: COLORS.primary }}>
              Add Payment
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Recent Activities */}
      <View className="mt-8 px-6 pb-8">
        <Text className="mb-4 text-lg font-semibold" style={{ color: COLORS.secondary }}>
          Recent Activities
        </Text>
        {recentActivities.map((activity) => (
          <View
            key={activity.id}
            className="mb-4 flex-row items-center rounded-xl p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <MaterialCommunityIcons name={activity.icon} size={26} color={COLORS.primary} />
            <View className="ml-4 flex-1">
              <Text className="text-base font-medium" style={{ color: COLORS.secondary }}>
                {activity.description}
              </Text>
              <Text className="mt-1 text-sm" style={{ color: COLORS.gray[400] }}>
                {activity.time}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
