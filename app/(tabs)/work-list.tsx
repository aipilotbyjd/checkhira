import { Text, View, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { isValid } from 'date-fns';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useWorkOperations } from '../../hooks/useWorkOperations';
import { useFocusEffect } from 'expo-router';
import { Work } from '../../types/work';
import { dateUtils } from '../../utils/dateUtils';
import { WorkListItem } from '../../components/WorkListItem';
import { WorkSkeleton } from '../../components/WorkSkeleton';
import { useNotification } from '../../contexts/NotificationContext';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../contexts/ToastContext';

export default function WorkList() {
  const router = useRouter();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [currentFilter, setCurrentFilter] = useState('all');
  const { getAllWork, isLoading } = useWorkOperations();
  const [workList, setWorkList] = useState<Work[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { setUnreadCount } = useNotification();
  const { showToast } = useToast();

  const loadWorkRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      loadWork({ page: 1 });
      return () => {
        loadWorkRef.current = false;
      };
    }, [currentFilter])
  );

  const loadWork = async ({ page = 1 }: { page?: number }) => {
    try {
      if (page === 1) {
        setWorkList([]);
        setIsLoadingMore(true);
      }

      const response = await getAllWork({ page, filter: currentFilter });

      const data = response?.data;

      if (data?.works?.data) {
        const newWorks = data.works.data;

        if (page === 1) {
          setWorkList(newWorks);
          setTodayTotal(Number(data.total) || 0);
        } else {
          setWorkList((prev) => [...prev, ...newWorks]);
        }

        setHasMorePages(data.works.current_page < data.works.last_page);
        setCurrentPage(data.works.current_page);
      }
    } catch (error) {
      console.error('Error loading work:', error);
    } finally {
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleFilter = (filter: string) => {
    if (filter !== currentFilter) {
      setCurrentFilter(filter);
      setCurrentPage(1);
      setWorkList([]);
    }
    actionSheetRef.current?.hide();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadWork({ page: 1 });
  }, [currentFilter]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMorePages || isLoadingMore) return;
    setIsLoadingMore(true);
    await loadWork({ page: currentPage + 1 });
  }, [currentPage, hasMorePages, isLoadingMore]);

  const getUnreadNotificationsCount = async () => {
    try {
      const response = await notificationService.getUnreadNotificationsCount();
      setUnreadCount(response.data as any);
    } catch (error) {
      showToast('Failed to get unread notifications count. Please try again.', 'error');
    }
  };

  useEffect(() => {
    const init = async () => {
      console.log('notif count');
      await getUnreadNotificationsCount();
    };
    init();
  }, []);

  if (isLoading && currentPage === 1) {
    return (
      <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
        <View
          className="border-b px-6 pb-4 pt-6"
          style={{
            borderColor: COLORS.gray[200],
            backgroundColor: COLORS.background.primary,
          }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
              Work List
            </Text>
            <View className="flex-row space-x-3">
              <Pressable
                onPress={() => router.push('/work/add')}
                className="mr-2 rounded-full p-3"
                style={{ backgroundColor: COLORS.primary }}>
                <MaterialCommunityIcons name="plus" size={22} color="white" />
              </Pressable>
              <Pressable className="rounded-full p-3" style={{ backgroundColor: COLORS.gray[100] }}>
                <MaterialCommunityIcons name="filter-variant" size={22} color={COLORS.gray[600]} />
              </Pressable>
            </View>
          </View>
        </View>

        <View className="my-6 px-4">
          <View className="rounded-xl p-4" style={{ backgroundColor: COLORS.primary + '15' }}>
            <View className="h-4 w-20 rounded bg-gray-200" />
            <View className="mt-2 h-8 w-32 rounded bg-gray-200" />
          </View>
        </View>

        <View className="px-4">
          {[...Array(8)].map((_, index) => (
            <WorkSkeleton key={index} />
          ))}
        </View>
      </View>
    );
  }

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
              className="mr-2 rounded-full p-3"
              style={{ backgroundColor: COLORS.primary }}>
              <MaterialCommunityIcons name="plus" size={22} color="white" />
            </Pressable>
            <Pressable
              onPress={() => actionSheetRef.current?.show()}
              className="rounded-full p-3"
              style={{ backgroundColor: COLORS.gray[100] }}>
              <MaterialCommunityIcons
                name="filter-variant"
                size={22}
                color={currentFilter === 'all' ? COLORS.gray[600] : COLORS.primary}
              />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 50;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

          if (isCloseToBottom && !isLoadingMore && hasMorePages) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={16}>
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
        {workList.map((item: Work) => (
          <WorkListItem key={item.id.toString()} item={item} />
        ))}
      </ScrollView>

      <ActionSheet
        ref={actionSheetRef}
        containerStyle={{ backgroundColor: COLORS.background.primary }}>
        <View className="p-4">
          <Text className="mb-4 text-lg font-bold" style={{ color: COLORS.secondary }}>
            Filter Work List
          </Text>

          {[
            { label: 'All', value: 'all' },
            { label: 'Today', value: 'today' },
            { label: 'This Week', value: 'week' },
            { label: 'This Month', value: 'month' },
          ].map((option) => (
            <Pressable
              key={option.value}
              onPress={() => handleFilter(option.value)}
              className="flex-row items-center justify-between py-4"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: COLORS.gray[200],
              }}>
              <Text
                className="text-base"
                style={{
                  color: currentFilter === option.value ? COLORS.primary : COLORS.secondary,
                }}>
                {option.label}
              </Text>
              {currentFilter === option.value && (
                <MaterialCommunityIcons name="check" size={20} color={COLORS.primary} />
              )}
            </Pressable>
          ))}
        </View>
      </ActionSheet>
    </View>
  );
}
