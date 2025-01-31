import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { statsService } from '../../services/statsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this type definition above the Home component
interface Activity {
  id: number;
  type: 'work' | 'payment';
  description: string;
  amount: string;
  time: Date;
  icon: string;
  color: string;
}

export default function Home() {
  const router = useRouter();
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: { works: 0, work_amount: 0, payments: 0, total_amount: 0 },
    weekly: { works: 0, work_amount: 0, payments: 0, total_amount: 0 },
    monthly: { works: 0, work_amount: 0, payments: 0, total_amount: 0 },
    total_works: 0,
    total_work_amount: 0,
    total_payments: 0,
    total_amount: 0,
  });
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await notificationService.getRecentActivities();
        const activities = response.data.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          description:
            activity.type === 'work'
              ? `You worked on ${activity.title}`
              : `You received payment of ${activity.amount} from ${activity.from}`,
          amount: `₹${activity.amount}`,
          time: new Date(activity.created_at),
          icon: activity.type === 'work' ? 'clock-check-outline' : 'cash-multiple',
          color: activity.type === 'work' ? COLORS.success : COLORS.primary,
        }));
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsService.getStats();
        setStats(data.data as any);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // get user from local storage
        const user = await AsyncStorage.getItem('user');
        setUser(user ? JSON.parse(user) : null);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleQuickActionPress = (action: 'work' | 'payment', id: number) => {
    if (action === 'work') {
      router.push(`/work/${id}/edit` as any);
    } else if (action === 'payment') {
      router.push(`/payments/${id}/edit` as any);
    }
  };

  return (
    <ProtectedRoute>
      <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
        {/* Header Section */}
        <View className="flex-row items-center justify-between px-6 pb-4 pt-8">
          <View>
            <Text className="text-base" style={{ color: COLORS.gray[400] }}>
              {getGreeting()}
            </Text>
            <Text className="mt-1 text-2xl font-bold" style={{ color: COLORS.secondary }}>
              {user?.name || 'User'}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/account')}>
            <Image
              source={{ uri: 'https://via.placeholder.com/40' }}
              className="h-12 w-12 rounded-full"
            />
          </Pressable>
        </View>

        {/* Work Dashboard */}
        <View className="mt-6 px-6">
          <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
            Work Dashboard
          </Text>
          <View className="mt-4 flex-row flex-wrap justify-between">
            {/* Today's Work Stats */}
            <View
              className="mb-4 w-[48%] rounded-xl p-4"
              style={{ backgroundColor: COLORS.background.secondary }}>
              <View className="flex-row items-center justify-between">
                <MaterialCommunityIcons name="calendar-today" size={24} color={COLORS.primary} />
                <Text className="text-xs font-medium" style={{ color: COLORS.gray[400] }}>
                  Today
                </Text>
              </View>
              <View className="mt-3">
                <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                  ₹{Number(stats.today?.work_amount || '0.00').toFixed(2)}
                </Text>
                <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                  Works: {stats.today?.works || 0}
                </Text>
              </View>
            </View>

            {/* Weekly Work Stats */}
            <View
              className="mb-4 w-[48%] rounded-xl p-4"
              style={{ backgroundColor: COLORS.background.secondary }}>
              <View className="flex-row items-center justify-between">
                <MaterialCommunityIcons name="calendar-week" size={24} color={COLORS.success} />
                <Text className="text-xs font-medium" style={{ color: COLORS.gray[400] }}>
                  This Week
                </Text>
              </View>
              <View className="mt-3">
                <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                  ₹{Number(stats.weekly?.work_amount || '0.00').toFixed(2)}
                </Text>
                <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                  Works: {stats.weekly?.works || 0}
                </Text>
              </View>
            </View>

            {/* Monthly Work Stats */}
            <View
              className="mb-4 w-[48%] rounded-xl p-4"
              style={{ backgroundColor: COLORS.background.secondary }}>
              <View className="flex-row items-center justify-between">
                <MaterialCommunityIcons name="calendar-month" size={24} color="#FF6B6B" />
                <Text className="text-xs font-medium" style={{ color: COLORS.gray[400] }}>
                  This Month
                </Text>
              </View>
              <View className="mt-3">
                <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                  ₹{Number(stats.monthly?.work_amount || '0.00').toFixed(2)}
                </Text>
                <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                  Works: {stats.monthly?.works || 0}
                </Text>
              </View>
            </View>

            {/* Total Work Stats */}
            <View
              className="mb-4 w-[48%] rounded-xl p-4"
              style={{ backgroundColor: COLORS.background.secondary }}>
              <View className="flex-row items-center justify-between">
                <MaterialCommunityIcons name="chart-box" size={24} color="#4ECDC4" />
                <Text className="text-xs font-medium" style={{ color: COLORS.gray[400] }}>
                  Total
                </Text>
              </View>
              <View className="mt-3">
                <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                  ₹{Number(stats.total_work_amount || '0.00').toFixed(2)}
                </Text>
                <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                  Works: {stats.total_works || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Dashboard */}
        <View className="mt-6 px-6">
          <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
            Payment Dashboard
          </Text>
          <View className="mt-4 flex-row flex-wrap justify-between">
            {/* Today's Payment Stats */}
            <View
              className="mb-4 w-[48%] rounded-xl p-4"
              style={{ backgroundColor: COLORS.background.secondary }}>
              <View className="flex-row items-center justify-between">
                <MaterialCommunityIcons name="calendar-today" size={24} color={COLORS.primary} />
                <Text className="text-xs font-medium" style={{ color: COLORS.gray[400] }}>
                  Today
                </Text>
              </View>
              <View className="mt-3">
                <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                  ₹{Number(stats.today?.total_amount || '0.00').toFixed(2)}
                </Text>
                <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                  Payments: {stats.today?.payments || 0}
                </Text>
              </View>
            </View>

            {/* Weekly Payment Stats */}
            <View
              className="mb-4 w-[48%] rounded-xl p-4"
              style={{ backgroundColor: COLORS.background.secondary }}>
              <View className="flex-row items-center justify-between">
                <MaterialCommunityIcons name="calendar-week" size={24} color={COLORS.success} />
                <Text className="text-xs font-medium" style={{ color: COLORS.gray[400] }}>
                  This Week
                </Text>
              </View>
              <View className="mt-3">
                <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                  ₹{Number(stats.weekly?.total_amount || '0.00').toFixed(2)}
                </Text>
                <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                  Payments: {stats.weekly?.payments || 0}
                </Text>
              </View>
            </View>

            {/* Monthly Payment Stats */}
            <View
              className="mb-4 w-[48%] rounded-xl p-4"
              style={{ backgroundColor: COLORS.background.secondary }}>
              <View className="flex-row items-center justify-between">
                <MaterialCommunityIcons name="calendar-month" size={24} color="#FF6B6B" />
                <Text className="text-xs font-medium" style={{ color: COLORS.gray[400] }}>
                  This Month
                </Text>
              </View>
              <View className="mt-3">
                <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                  ₹{Number(stats.monthly?.total_amount || '0.00').toFixed(2)}
                </Text>
                <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                  Payments: {stats.monthly?.payments || 0}
                </Text>
              </View>
            </View>

            {/* Total Payment Stats */}
            <View
              className="mb-4 w-[48%] rounded-xl p-4"
              style={{ backgroundColor: COLORS.background.secondary }}>
              <View className="flex-row items-center justify-between">
                <MaterialCommunityIcons name="chart-box" size={24} color="#4ECDC4" />
                <Text className="text-xs font-medium" style={{ color: COLORS.gray[400] }}>
                  Total
                </Text>
              </View>
              <View className="mt-3">
                <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                  ₹{Number(stats.total_amount || '0.00').toFixed(2)}
                </Text>
                <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                  Payments: {stats.total_payments || 0}
                </Text>
              </View>
            </View>
          </View>
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
              onPress={() => router.push('/(tabs)/work-list')}
              className="flex-row items-center rounded-xl p-4"
              style={{ backgroundColor: COLORS.primary + '15' }}>
              <MaterialCommunityIcons name="clipboard-list" size={24} color={COLORS.primary} />
              <Text className="ml-3 flex-1 font-medium" style={{ color: COLORS.primary }}>
                View Work List
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/payments')}
              className="flex-row items-center rounded-xl p-4"
              style={{ backgroundColor: COLORS.primary + '15' }}>
              <MaterialCommunityIcons name="cash-register" size={24} color={COLORS.primary} />
              <Text className="ml-3 flex-1 font-medium" style={{ color: COLORS.primary }}>
                View Payments List
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
            <Pressable onPress={() => router.push('/account')}>
              <Text style={{ color: COLORS.primary }}>See All</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            recentActivities.map((activity: Activity, index: number) => (
              <Pressable
                key={`${activity.id}-${activity.time.getTime()}`}
                onPress={() => handleQuickActionPress(activity.type, activity.id)}
                className="mb-4 flex-row items-center rounded-xl p-4"
                style={{ backgroundColor: COLORS.background.secondary }}>
                <View
                  className="rounded-full p-2"
                  style={{ backgroundColor: activity.color + '15' }}>
                  <MaterialCommunityIcons
                    name={activity.icon as any}
                    size={26}
                    color={activity.color}
                  />
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
                      {activity.time instanceof Date
                        ? format(activity.time, 'h:mm a')
                        : activity.time}
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray[400]} />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </ProtectedRoute>
  );
}
