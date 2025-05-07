import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { COLORS } from '../../constants/theme';
import { WorkListItem } from '../../components/WorkListItem';
import { WorkSkeleton } from '../../components/WorkSkeleton';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/axiosClient';
import { useApi } from '../../hooks/useApi';
import { Work } from '../../types/work';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { analyticsService } from '../../utils/analytics';
import { BannerAdComponent } from '../../components/ads';

export default function WorkListScreen() {
  useAnalytics('WorkListTabScreen');
  const router = useRouter();
  const { showToast } = useToast();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const { t } = useLanguage();

  const [workList, setWorkList] = useState<Work[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [todayTotal, setTodayTotal] = useState(0);
  const { refreshUnreadCount } = useNotification();

  // Use the modern API hook pattern
  const { execute: executeGetWorks, isLoading } = useApi({
    showErrorToast: true,
    defaultErrorMessage: t('failedToLoadWorkEntries')
  });

  const loadWork = useCallback(async ({ page = 1, isRefresh = false }) => {
    try {
      const response = await executeGetWorks(() =>
        api.get('/works', { page, filter: currentFilter })
      );

      if (response?.data) {
        const { works, total } = response.data;
        setTodayTotal(total || 0);

        if (isRefresh || page === 1) {
          setWorkList(works.data);
        } else {
          setWorkList((prevList) => [...prevList, ...works.data]);
        }

        setCurrentPage(works.current_page);
        setHasMorePages(works.current_page < works.last_page);
      }
    } finally {
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [currentFilter, executeGetWorks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWork({ page: 1, isRefresh: true });
  }, [loadWork]);

  const handleFilter = useCallback((filter: string) => {
    setCurrentFilter(filter);
    setWorkList([]);
    setCurrentPage(1);
    actionSheetRef.current?.hide();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWork({ page: 1 });
    }, [currentFilter])
  );

  const handleLoadMore = useCallback(async () => {
    if (!hasMorePages || isLoadingMore) return;

    analyticsService.logEvent('load_more_work_entries', { page: currentPage + 1 });
    setIsLoadingMore(true);
    await loadWork({ page: currentPage + 1 });
  }, [currentPage, hasMorePages, isLoadingMore, loadWork]);

  useEffect(() => {
    refreshUnreadCount();
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
              {t('worklist')}
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
            {t('worklist')}
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
            {t('todayTotal')}
          </Text>
          <Text className="mt-2 text-3xl font-bold" style={{ color: COLORS.primary }}>
            ₹ {todayTotal.toFixed(2)}
          </Text>
        </View>

        {/* Banner Ad at the top of the list at the top of the list */}
        <BannerAdComponent containerStyle={{ marginTop: -10 }} />

        {/* Work list */}
        {workList.map((item: Work) => (
          <WorkListItem key={item.id.toString()} item={item} />
        ))}

        {/* Loading more indicator */}
        {isLoadingMore && (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}

        {/* Empty state */}
        {!isLoading && workList.length === 0 && (
          <View className="items-center justify-center py-8">
            <MaterialCommunityIcons name="file-document-outline" size={48} color={COLORS.gray[400]} />
            <Text className="mt-2 text-base" style={{ color: COLORS.gray[600] }}>
              {t('noWorkEntries')}
            </Text>
          </View>
        )}
      </ScrollView>

      <ActionSheet
        ref={actionSheetRef}
        containerStyle={{ backgroundColor: COLORS.background.primary }}>
        <View className="p-4">
          <Text className="mb-4 text-lg font-bold" style={{ color: COLORS.secondary }}>
            {t('filterWorkList')}
          </Text>

          {[
            { label: t('all'), value: 'all' },
            { label: t('today'), value: 'today' },
            { label: t('thisWeek'), value: 'week' },
            { label: t('thisMonth'), value: 'month' },
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
