import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { formatIndianNumber } from '../../utils/numberFormatter';
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../services/notificationService';
import { statsService } from '../../services/statsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { BannerAdComponent, NativeAdComponent, SponsoredAdsCarousel } from '../../components/ads';
import { useInterstitialAd } from '../../components/ads/InterstitialAdComponent';
import { BannerAdSize } from 'react-native-google-mobile-ads';
import { useSponsoredAds } from '../../hooks/useSponsoredAds';

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
  useAnalytics('HomeTabScreen');
  const router = useRouter();
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: { works: 0, work_amount: 0, payments: 0, total_amount: 0 },
    weekly: { works: 0, work_amount: 0, payments: 0, total_amount: 0, dailyWorkAmountsLast7Days: [0, 0, 0, 0, 0, 0, 0] },
    monthly: { works: 0, work_amount: 0, payments: 0, total_amount: 0 },
    total_works: 0,
    total_work_amount: 0,
    total_payments: 0,
    total_amount: 0,
    monthlyEarningsChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [50000, 75000, 60000, 80000, 70000, 90000],
    },
    paymentSourcesChart: [
      { name: 'Cash', amount: 22000, color: COLORS.primary, legendFontColor: '#7F7F7F', legendFontSize: 12 },
      { name: 'UPI', amount: 50000, color: COLORS.success, legendFontColor: '#7F7F7F', legendFontSize: 12 },
      { name: 'Bank', amount: 30000, color: '#FF6B6B', legendFontColor: '#7F7F7F', legendFontSize: 12 },
      { name: 'Other', amount: 8000, color: '#4ECDC4', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    ],
  });
  const [user, setUser] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { refreshUnreadCount } = useNotification();
  const { t } = useLanguage();
  const { showInterstitialAd } = useInterstitialAd();
  const { ads: sponsoredAds, handleAdClick, refreshAds } = useSponsoredAds();

  const fetchActivities = async () => {
    try {
      const response = await notificationService.getRecentActivities();
      // console.log(response.data);
      const activities = response.data.map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        description:
          activity.type === 'work'
            ? t('youWorkedOnTitle', { title: activity.title })
            : t('youReceivedPaymentFrom', { amount: activity.amount, from: activity.from }),
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

  useEffect(() => {
    const init = async () => {
      await fetchStats();
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

  const handleQuickActionPress = async (action: 'work' | 'payment', id: number) => {
    // Show interstitial ad with 15% probability (reduced from 30%)
    if (Math.random() < 0.15) {
      await showInterstitialAd();
    }

    if (action === 'work') {
      router.push(`/work/${id}/edit` as any);
    } else if (action === 'payment') {
      router.push(`/payments/${id}/edit` as any);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStats(),
      fetchActivities(),
      refreshUnreadCount(),
      refreshAds(), // Refresh sponsored ads
    ]);
    setRefreshing(false);
  }, [refreshAds, refreshUnreadCount]);

  // Chart data and configuration
  const screenWidth = Dimensions.get('window').width;
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Example labels
    datasets: [
      {
        data: stats.weekly.dailyWorkAmountsLast7Days && stats.weekly.dailyWorkAmountsLast7Days.length > 0 ? stats.weekly.dailyWorkAmountsLast7Days : [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: COLORS.background.secondary,
    backgroundGradientFrom: COLORS.background.secondary,
    backgroundGradientTo: COLORS.background.secondary,
    decimalPlaces: 0, // a
    color: (opacity = 1) => `rgba(${parseInt(COLORS.primary.substring(1, 3), 16)}, ${parseInt(COLORS.primary.substring(3, 5), 16)}, ${parseInt(COLORS.primary.substring(5, 7), 16)}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
    barPercentage: 0.7,
  };

  // Data for Monthly Earnings Line Chart
  const monthlyEarningsChartData = {
    labels: stats.monthlyEarningsChart.labels,
    datasets: [
      {
        data: stats.monthlyEarningsChart.data,
        color: (opacity = 1) => `rgba(${parseInt(COLORS.success.substring(1, 3), 16)}, ${parseInt(COLORS.success.substring(3, 5), 16)}, ${parseInt(COLORS.success.substring(5, 7), 16)}, ${opacity})`, // optional
        strokeWidth: 2, // optional
      },
    ],
    legend: [t('monthlyEarnings')], // optional
  };

  // Data for Payment Sources Pie Chart
  // react-native-chart-kit PieChart expects `population` key for values.
  const paymentSourcesPieChartData = stats.paymentSourcesChart.map(source => ({
    ...source,
    population: source.amount, // Map amount to population
  }));

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

      {/* Sponsored Ads Carousel - Only shown when ads are fetched from API */}
      {sponsoredAds && sponsoredAds.length > 0 && (
        <View className="mt-4 mb-6">
          <View className="px-6 mb-3">
            <Text className="text-base font-semibold" style={{ color: COLORS.secondary }}>
              Sponsored Partners
            </Text>
          </View>
          <SponsoredAdsCarousel
            ads={sponsoredAds}
            height={200}
            onAdPress={handleAdClick}
            onRefresh={refreshAds}
            autoPlay={true}
            autoPlayInterval={5000}
            showIndicator={true}
            showRefreshButton={true}
            containerStyle={{
              marginHorizontal: 0,
              borderRadius: 16,
            }}
          />
        </View>
      )}

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
                {formatIndianNumber(Number(stats.today?.work_amount || 0))}
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
                {formatIndianNumber(Number(stats.weekly?.work_amount || 0))}
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
                {formatIndianNumber(Number(stats.monthly?.work_amount || 0))}
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
                {formatIndianNumber(Number(stats.total_work_amount || 0))}
              </Text>
              <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                {t('works')}: {formatIndianNumber(Number(stats.total_works || 0))}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Weekly Work Trend Chart */}
      {stats.weekly.dailyWorkAmountsLast7Days && stats.weekly.dailyWorkAmountsLast7Days.some(d => d > 0) && (
        <View className="mt-2 px-6">
          <Text className="text-lg font-semibold mb-3" style={{ color: COLORS.secondary }}>
            {t('weeklyWorkTrend')}
          </Text>
          <View style={{ alignItems: 'center' }}>
            <BarChart
              data={chartData}
              width={screenWidth - 48} // 24px padding on each side
              height={220}
              yAxisLabel="₹"
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              showValuesOnTopOfBars={true}
              fromZero={true}
            />
          </View>
        </View>
      )}

      {/* Native Ad */}
      <View className="mt-0 px-6">
        <BannerAdComponent
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          containerStyle={{ marginTop: 10 }}
        />
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
                {formatIndianNumber(Number(Number(stats.today?.total_amount || '0.00').toFixed(2)))}
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
                {formatIndianNumber(Number(Number(stats.weekly?.total_amount || '0.00').toFixed(2)))}
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
                {formatIndianNumber(Number(Number(stats.monthly?.total_amount || '0.00').toFixed(2)))}
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
                {formatIndianNumber(Number(Number(stats.total_amount || '0.00').toFixed(2)))}
              </Text>
              <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                {t('payments')}: {stats.total_payments || 0}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* --- Monthly Earnings Line Chart --- */}
      {stats.monthlyEarningsChart &&
        Array.isArray(stats.monthlyEarningsChart.labels) &&
        Array.isArray(stats.monthlyEarningsChart.data) &&
        stats.monthlyEarningsChart.labels.length > 0 &&
        stats.monthlyEarningsChart.data.length > 0 &&
        stats.monthlyEarningsChart.labels.length === stats.monthlyEarningsChart.data.length &&
        stats.monthlyEarningsChart.data.some(d => typeof d === 'number' && d > 0) && (
          <View className="mt-6 px-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: COLORS.secondary }}>
              {t('monthlyEarningsTrend')}
            </Text>
            <View style={{ alignItems: 'center' }}>
              <LineChart
                data={monthlyEarningsChartData}
                width={screenWidth - 48}
                height={220}
                yAxisLabel="₹"
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          </View>
        )}

      {/* --- Payment Sources Pie Chart --- */}
      {paymentSourcesPieChartData && paymentSourcesPieChartData.some(d => d.population > 0) && (
        <View className="mt-6 px-6">
          <Text className="text-lg font-semibold mb-3" style={{ color: COLORS.secondary }}>
            {t('paymentSourcesDistribution')}
          </Text>
          <View style={{ alignItems: 'center' }}>
            <PieChart
              data={paymentSourcesPieChartData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute
              hasLegend={true}
            />
          </View>
        </View>
      )}

      {/* Native Ad */}
      <View className="mt-0 px-6">
        <BannerAdComponent
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          containerStyle={{ marginTop: 10 }}
        />
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

      {/* Banner Ad */}
      <View className="mt-6">
        <BannerAdComponent />
      </View>

      {/* Recent Activities - Enhanced version */}
      <View className="mt-8 px-6 pb-0">
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
          recentActivities.map((activity: Activity) => (
            <Pressable
              key={`${activity.id}-${activity.time.getTime()}`}
              onPress={async () => handleQuickActionPress(activity.type, activity.id)}
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

      {/* Native Ad */}
      <View className="mt-0 px-6">
        <NativeAdComponent adType="medium" />
      </View>
    </ScrollView>
  );
}
