import { Text, View, Pressable, ScrollView, ActivityIndicator, RefreshControl, NativeScrollEvent } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { format } from 'date-fns';
import { PaymentSkeleton } from '../../components/PaymentSkeleton';
import { useNotification } from '../../contexts/NotificationContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/axiosClient';
import { useApi } from '../../hooks/useApi';
import { Payment, PaymentsResponse } from '../../types/payment';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { analyticsService } from '../../utils/analytics';
import { BannerAdComponent, NativeAdComponent } from '../../components/ads';
import { BannerAdSize } from 'react-native-google-mobile-ads';

export default function PaymentsList() {
  useAnalytics('PaymentsTabScreen');
  const router = useRouter();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMorePages, setHasMorePages] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isLoadingSub, setIsLoadingSub] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { refreshUnreadCount } = useNotification();
  const { showToast } = useToast();
  const { t } = useLanguage();

  // Use the modern API hook pattern
  const { execute: executeGetPayments, isLoading } = useApi({
    showErrorToast: true,
    defaultErrorMessage: t('failedToLoadPayments')
  });

  useFocusEffect(
    useCallback(() => {
      loadPayments({ page: 1 });
    }, [currentFilter])
  );

  const loadPayments = async ({ page = 1 }: { page?: number }) => {
    try {
      if (page === 1) {
        setPaymentsList([]);
        setIsLoadingSub(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await executeGetPayments(() =>
        api.get<{ data: PaymentsResponse }>('/payments', { page, filter: currentFilter })
      );

      if (response?.data) {
        const { payments, total } = response.data;

        if (page === 1) {
          setPaymentsList(payments.data);
          setTotal(total || 0);
        } else {
          setPaymentsList((prev) => [...prev, ...payments.data]);
        }

        setHasMorePages(payments.current_page < payments.last_page);
        setCurrentPage(payments.current_page);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoadingSub(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleFilter = (filter: string) => {
    if (filter !== currentFilter) {
      setCurrentFilter(filter);
      setCurrentPage(1);
      setPaymentsList([]);
    }
    actionSheetRef.current?.hide();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadPayments({ page: 1 });
  }, [currentFilter]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMorePages || isLoadingMore || isLoadingSub) return;

    // Log analytics event for loading more payments
    console.log('Loading more payments...');
    analyticsService.logEvent('load_more_payments', { page: currentPage + 1 });
    await loadPayments({ page: currentPage + 1 });
  }, [currentPage, hasMorePages, isLoadingMore, isLoadingSub]);

  const displayTotal = useMemo((): number => {
    return Number(total);
  }, [total]);

  useEffect(() => {
    refreshUnreadCount();
  }, []);

  if (isLoading && currentPage === 1 && isLoadingSub) {
    return <PaymentSkeleton />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Header */}
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
            {t('paymentsList')}
          </Text>
          <View className="flex-row space-x-3">
            <Pressable
              onPress={() => {
                // Direct navigation without forced rewarded ad
                router.push('/payments/add');
              }}
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
        onScroll={({ nativeEvent }: { nativeEvent: NativeScrollEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 50;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

          if (isCloseToBottom && !isLoadingMore && hasMorePages) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        <View className="my-6 rounded-xl p-4" style={{ backgroundColor: COLORS.primary + '15' }}>
          <Text className="text-sm font-medium" style={{ color: COLORS.gray[600] }}>
            {currentFilter === 'all'
              ? t('total')
              : currentFilter === 'today'
                ? t('todayTotal')
                : currentFilter === 'week'
                  ? t('thisWeek') + ' ' + t('total')
                  : t('thisMonth') + ' ' + t('total')}
          </Text>
          <Text className="mt-2 text-3xl font-bold" style={{ color: COLORS.primary }}>
            ₹ {Number(displayTotal).toFixed(2)}
          </Text>
        </View>

        {/* Banner ad at the top of the list */}
        <BannerAdComponent
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          containerStyle={{ marginBottom: 10, marginTop: -10 }}
        />

        {paymentsList.length === 0 && !isLoadingSub && !isLoadingMore ? (
          <View className="items-center justify-center py-8">
            <MaterialCommunityIcons name="cash-remove" size={48} color={COLORS.gray[400]} />
            <Text className="mt-2 text-base" style={{ color: COLORS.gray[600] }}>
              {t('noPaymentsFound')}
            </Text>
          </View>
        ) : (
          <>
            {paymentsList.map((item, index) => {
              // Insert a native ad after every 10 items (reduced from 5)
              const showNativeAd = index > 0 && index % 10 === 0;

              return (
                <React.Fragment key={item.id}>
                  {showNativeAd && (
                    <View className="my-0">
                      <NativeAdComponent containerStyle={{ marginTop: -5 }} adType="medium" />
                    </View>
                  )}
                  <Pressable
                    onPress={async () => {
                      router.push(`/payments/${item.id}/edit`);
                    }}
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
                        <Text className="text-base font-medium" style={{ color: COLORS.secondary }}>
                          ₹ {Number(item.amount).toFixed(2)}
                        </Text>
                        <View className="mt-2 flex-row items-center">
                          <MaterialCommunityIcons
                            name={item.source?.icon as any}
                            size={16}
                            color={COLORS.gray[500]}
                          />
                          <Text className="ml-2 text-sm" style={{ color: COLORS.gray[500] }}>
                            {item.source?.name}
                          </Text>
                        </View>
                        <Text className="mt-1 text-xs" style={{ color: COLORS.gray[400] }}>
                          {format(new Date(item.date), 'MMMM dd, yyyy')}
                        </Text>
                        {item.from && (
                          <Text className="mt-1 text-xs" style={{ color: COLORS.gray[400] }}>
                            From: {item.from}
                          </Text>
                        )}
                      </View>
                      <View className="rounded-full p-2" style={{ backgroundColor: COLORS.gray[100] }}>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray[500]} />
                      </View>
                    </View>
                  </Pressable>
                </React.Fragment>
              );
            })}

            {/* Banner ad at the bottom of the list */}
            <BannerAdComponent size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
          </>
        )}

        {isLoadingMore && (
          <View className="py-4">
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
      </ScrollView>

      <ActionSheet
        ref={actionSheetRef}
        containerStyle={{ backgroundColor: COLORS.background.primary }}>
        <View className="p-4">
          <Text className="mb-4 text-lg font-bold" style={{ color: COLORS.secondary }}>
            {t('filterPaymentsList')}
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
