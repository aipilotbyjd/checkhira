import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../services/notificationService';
import { statsService } from '../../services/statsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const [user, setUser] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { setUnreadCount, refreshUnreadCount } = useNotification();
  const { t } = useLanguage();

  const fetchActivities = async () => {
    try {
      console.log('fetching activities again');
      const response = await notificationService.getRecentActivities();
      // console.log(response.data);
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

  useEffect(() => {
    console.log('fetching activities');
    fetchActivities();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await statsService.getStats();
      // console.log(data.data);
      setStats(data.data as any);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getNotifications = async () => {
    try {
      const response = await notificationService.getUnreadNotificationsCount();
      setUnreadCount(response.data as any);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchStats();
      await getNotifications();
    };
    init();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        setUser((userString && userString !== 'undefined') ? JSON.parse(userString) : null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    await fetchActivities();
    await refreshUnreadCount();
    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: COLORS.background.primary }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }>
      {/* Header Section */}
      <View className="flex-row items-center justify-between px-6 pb-4 pt-8">
        <View>
          <Text className="text-base" style={{ color: COLORS.gray[400] }}>
            {getGreeting()}
          </Text>
          <Text className="mt-1 text-2xl font-bold" style={{ color: COLORS.secondary }}>
            {user?.first_name + ' ' + user?.last_name || 'User'}
          </Text>
        </View>
        <Pressable onPress={() => router.push('/account')}>
          <Image
            source={{
              uri: user?.first_name + ' ' + user?.last_name
                ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name + ' ' + user?.last_name)}&background=0D8ABC&color=fff`
                : 'https://ui-avatars.com/api/?name=U&background=0D8ABC&color=fff',
            }}
            className="h-12 w-12 rounded-full"
          />
        </Pressable>
      </View>

      {/* Work Dashboard */}
      <View className="mt-6 px-6">
        <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
          {t('workDashboard')}
        </Text>
        <View className="mt-4 flex-row flex-wrap justify-between">
          {/* Today's Work Stats */}
          <View
            className="mb-4 w-[48%] rounded-xl p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <View className="flex-row items-center justify-between">
              <MaterialCommunityIcons name="calendar-today" size={24} color={COLORS.primary} />
              <Text className="text-xs font-medium" style={{ color: COLORS.gray[400] }}>
                {t('today')}
              </Text>
            </View>
            <View className="mt-3">
              <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                ₹{Number(stats.today?.work_amount || '0.00').toFixed(2)}
              </Text>
              <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                {t('works')}: {stats.today?.works || 0}
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
                {t('thisWeek')}
              </Text>
            </View>
            <View className="mt-3">
              <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                ₹{Number(stats.weekly?.work_amount || '0.00').toFixed(2)}
              </Text>
              <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                {t('works')}: {stats.weekly?.works || 0}
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
                {t('thisMonth')}
              </Text>
            </View>
            <View className="mt-3">
              <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                ₹{Number(stats.monthly?.work_amount || '0.00').toFixed(2)}
              </Text>
              <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                {t('works')}: {stats.monthly?.works || 0}
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
                {t('total')}
              </Text>
            </View>
            <View className="mt-3">
              <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                ₹{Number(stats.total_work_amount || '0.00').toFixed(2)}
              </Text>
              <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                {t('works')}: {stats.total_works || 0}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Payment Dashboard */}
      <View className="mt-6 px-6">
        <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
          {t('paymentDashboard')}
        </Text>
        <View className="mt-4 flex-row flex-wrap justify-between">
          {/* Today's Payment Stats */}
          <View
            className="mb-4 w-[48%] rounded-xl p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <View className="flex-row items-center justify-between">
              <MaterialCommunityIcons name="calendar-today" size={24} color={COLORS.primary} />
              <Text className="text-xs font-medium" style={{ color: COLORS.gray[400] }}>
                {t('today')}
              </Text>
            </View>
            <View className="mt-3">
              <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                ₹{Number(stats.today?.total_amount || '0.00').toFixed(2)}
              </Text>
              <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                {t('payments')}: {stats.today?.payments || 0}
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
                {t('thisWeek')}
              </Text>
            </View>
            <View className="mt-3">
              <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                ₹{Number(stats.weekly?.total_amount || '0.00').toFixed(2)}
              </Text>
              <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                {t('payments')}: {stats.weekly?.payments || 0}
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
                {t('thisMonth')}
              </Text>
            </View>
            <View className="mt-3">
              <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                ₹{Number(stats.monthly?.total_amount || '0.00').toFixed(2)}
              </Text>
              <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                {t('payments')}: {stats.monthly?.payments || 0}
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
                {t('total')}
              </Text>
            </View>
            <View className="mt-3">
              <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                ₹{Number(stats.total_amount || '0.00').toFixed(2)}
              </Text>
              <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                {t('payments')}: {stats.total_payments || 0}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions - Enhanced version */}
      <View className="mt-8 px-6">
        <Text className="mb-4 text-lg font-semibold" style={{ color: COLORS.secondary }}>
          {t('quickActions')}
        </Text>
        <View className="grid grid-cols-2 gap-4">
          <Pressable
            onPress={() => router.push('/work/add')}
            className="flex-row items-center rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary + '15' }}>
            <MaterialCommunityIcons name="pencil-plus" size={24} color={COLORS.primary} />
            <Text className="ml-3 flex-1 font-medium" style={{ color: COLORS.primary }}>
              {t('addWork')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/payments/add')}
            className="flex-row items-center rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary + '15' }}>
            <MaterialCommunityIcons name="cash-plus" size={24} color={COLORS.primary} />
            <Text className="ml-3 flex-1 font-medium" style={{ color: COLORS.primary }}>
              {t('addPayment')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)/work-list')}
            className="flex-row items-center rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary + '15' }}>
            <MaterialCommunityIcons name="clipboard-list" size={24} color={COLORS.primary} />
            <Text className="ml-3 flex-1 font-medium" style={{ color: COLORS.primary }}>
              {t('viewWorkList')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)/payments')}
            className="flex-row items-center rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary + '15' }}>
            <MaterialCommunityIcons name="cash-register" size={24} color={COLORS.primary} />
            <Text className="ml-3 flex-1 font-medium" style={{ color: COLORS.primary }}>
              {t('viewPaymentsList')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Recent Activities - Enhanced version */}
      <View className="mt-8 px-6 pb-8">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
            {t('recentActivities')}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : recentActivities.length === 0 ? (
          <View className="items-center justify-center py-8">
            <MaterialCommunityIcons
              name="clipboard-text-clock-outline"
              size={48}
              color={COLORS.gray[400]}
            />
            <Text
              className="mt-4 text-base text-center"
              style={{ color: COLORS.gray[400] }}
            >
              {t('noActivitiesFound')}
            </Text>
          </View>
        ) : (
          recentActivities.map((activity: Activity, index: number) => (
            <Pressable
              key={`${activity.id}-${activity.time.getTime()}`}
              onPress={() => handleQuickActionPress(activity.type, activity.id)}
              className="mb-4 flex-row items-center rounded-xl p-4"
              style={{ backgroundColor: COLORS.background.secondary }}>
              <View className="rounded-full p-2" style={{ backgroundColor: activity.color + '15' }}>
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
  );
}
