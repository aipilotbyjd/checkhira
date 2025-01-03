import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export default function Home() {
  const router = useRouter();
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Enhanced mock data
  const stats = {
    today: {
      hours: 8,
      earnings: 500,
      pendingAmount: 1200,
    },
    weekly: {
      hours: 42,
      earnings: 3200,
      completedTasks: 15,
    },
    monthly: {
      earnings: 12500,
      averageHours: 7.5,
    },
  };

  const recentActivities = [
    {
      id: 1,
      type: 'work',
      description: 'Completed polishing task',
      amount: '₹500',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: 'clock-check-outline',
      color: COLORS.success,
    },
    {
      id: 2,
      type: 'payment',
      description: 'Payment received from ABC Corp',
      amount: '₹1,200',
      time: new Date(Date.now() - 5 * 60 * 60 * 1000),
      icon: 'cash-check',
      color: COLORS.primary,
    },
    {
      id: 3,
      type: 'work',
      description: 'Added new work entry',
      time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      icon: 'notebook-outline',
      color: COLORS.primary,
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

      {/* Summary Cards */}
      <View className="mt-6 px-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
            This Week ({format(startOfWeek(new Date()), 'd MMM')} -{' '}
            {format(endOfWeek(new Date()), 'd MMM')})
          </Text>
          <Pressable onPress={() => router.push('/stats')}>
            <Text style={{ color: COLORS.primary }}>See All</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
          <View
            className="w-48 rounded-2xl p-5"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <MaterialCommunityIcons name="clock-check-outline" size={28} color={COLORS.primary} />
            <Text className="mt-3 text-sm" style={{ color: COLORS.gray[400] }}>
              Weekly Hours
            </Text>
            <Text className="mt-2 text-xl font-semibold" style={{ color: COLORS.secondary }}>
              {stats.weekly.hours}h
            </Text>
            <Text className="mt-1 text-sm" style={{ color: COLORS.success }}>
              +{stats.today.hours}h today
            </Text>
          </View>

          <View
            className="w-48 rounded-2xl p-5"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <MaterialCommunityIcons name="cash-multiple" size={28} color={COLORS.primary} />
            <Text className="mt-3 text-sm" style={{ color: COLORS.gray[400] }}>
              Weekly Earnings
            </Text>
            <Text className="mt-2 text-xl font-semibold" style={{ color: COLORS.secondary }}>
              ₹{stats.weekly.earnings}
            </Text>
            <Text className="mt-1 text-sm" style={{ color: COLORS.success }}>
              ₹{stats.today.earnings} today
            </Text>
          </View>

          <View
            className="w-48 rounded-2xl p-5"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <MaterialCommunityIcons
              name="chart-timeline-variant"
              size={28}
              color={COLORS.primary}
            />
            <Text className="mt-3 text-sm" style={{ color: COLORS.gray[400] }}>
              Monthly Avg
            </Text>
            <Text className="mt-2 text-xl font-semibold" style={{ color: COLORS.secondary }}>
              {stats.monthly.averageHours}h/day
            </Text>
            <Text className="mt-1 text-sm" style={{ color: COLORS.primary }}>
              ₹{stats.monthly.earnings} earned
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Quick Actions - Enhanced version */}
      <View className="mt-8 px-6">
        <Text className="mb-4 text-lg font-semibold" style={{ color: COLORS.secondary }}>
          Quick Actions
        </Text>
        <View className="grid grid-cols-2 gap-4">
          <Pressable
            onPress={() => router.push('/work/add')}
            className="flex-row items-center rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary + '15' }}>
            <MaterialCommunityIcons name="pencil-plus" size={24} color={COLORS.primary} />
            <Text className="ml-3 flex-1 font-medium" style={{ color: COLORS.primary }}>
              Log Work
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/payments/add')}
            className="flex-row items-center rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary + '15' }}>
            <MaterialCommunityIcons name="cash-plus" size={24} color={COLORS.primary} />
            <Text className="ml-3 flex-1 font-medium" style={{ color: COLORS.primary }}>
              Request Payment
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/reports')}
            className="flex-row items-center rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary + '15' }}>
            <MaterialCommunityIcons name="file-document-outline" size={24} color={COLORS.primary} />
            <Text className="ml-3 flex-1 font-medium" style={{ color: COLORS.primary }}>
              View Reports
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/calendar')}
            className="flex-row items-center rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary + '15' }}>
            <MaterialCommunityIcons name="calendar-month" size={24} color={COLORS.primary} />
            <Text className="ml-3 flex-1 font-medium" style={{ color: COLORS.primary }}>
              Schedule
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Recent Activities - Enhanced version */}
      <View className="mt-8 px-6 pb-8">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
            Recent Activities
          </Text>
          <Pressable onPress={() => router.push('/activities')}>
            <Text style={{ color: COLORS.primary }}>See All</Text>
          </Pressable>
        </View>

        {recentActivities.map((activity) => (
          <Pressable
            key={activity.id}
            onPress={() => router.push(`/activity/${activity.id}`)}
            className="mb-4 flex-row items-center rounded-xl p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <View className="rounded-full p-2" style={{ backgroundColor: activity.color + '15' }}>
              <MaterialCommunityIcons name={activity.icon} size={26} color={activity.color} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-base font-medium" style={{ color: COLORS.secondary }}>
                {activity.description}
              </Text>
              <View className="mt-1 flex-row items-center">
                {activity.amount && (
                  <Text className="mr-2 text-sm" style={{ color: activity.color }}>
                    {activity.amount}
                  </Text>
                )}
                <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
                  {activity.time instanceof Date ? format(activity.time, 'h:mm a') : activity.time}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray[400]} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
