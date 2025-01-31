import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';

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
      payments: 15000,
      works: 160,
    },
  };

  const handleQuickActionPress = (action: 'work' | 'payment', id: number) => {
    if (action === 'work') {
      router.push(`/work/${id}/edit` as any);
    } else if (action === 'payment') {
      router.push(`/payments/${id}/edit` as any);
    }
  };

  const markAllAsRead = () => {
    // Implementation of markAllAsRead function
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
            <Pressable onPress={() => router.push('/account')}>
              <Text style={{ color: COLORS.primary }}>See All</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
            <View
              className="w-48 rounded-2xl p-5"
              style={{ backgroundColor: COLORS.background.secondary }}>
              <MaterialCommunityIcons name="cash-multiple" size={28} color={COLORS.primary} />
              <Text className="mt-3 text-sm" style={{ color: COLORS.gray[400] }}>
                Monthly Payments
              </Text>
              <Text className="mt-2 text-xl font-semibold" style={{ color: COLORS.secondary }}>
                ₹{stats.monthly.payments}
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
                Monthly Works
              </Text>
              <Text className="mt-2 text-xl font-semibold" style={{ color: COLORS.secondary }}>
                {stats.monthly.works} tasks
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
