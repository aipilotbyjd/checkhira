import { Text, View, Pressable, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { useState, useRef, useCallback, useMemo } from 'react';
import { usePaymentOperations } from '../../hooks/usePaymentOperations';
import { useFocusEffect } from 'expo-router';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export default function PaymentsList() {
  const router = useRouter();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [currentFilter, setCurrentFilter] = useState('all');
  const { getAllPayments, isLoading } = usePaymentOperations();
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingSub, setIsLoadingSub] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadPaymentsRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      loadPayments({ page: 1 });

      return () => {
        loadPaymentsRef.current = false;
      };
    }, [currentFilter])
  );

  const loadPayments = async ({ page = 1 }: { page?: number }) => {
    console.log('Loading payments:', { page, currentFilter, time: new Date().toISOString() });
    try {
      if (page === 1) {
        setPaymentsList([]);
        setIsLoadingSub(true);
      }

      const data = await getAllPayments({ page, filter: currentFilter } as {
        page?: number;
        filter: string;
      });

      if (data.payments && data.payments.data) {
        const newPayments = data.payments.data;

        if (page === 1) {
          setPaymentsList(newPayments);
          setTotal(data.total || 0);
        } else {
          setPaymentsList((prev) => [...prev, ...newPayments]);
        }

        setHasMorePages(data.payments.current_page < data.payments.last_page);
        setCurrentPage(data.payments.current_page);
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
    if (!hasMorePages || isLoadingMore) return;

    setIsLoadingMore(true);
    await loadPayments({ page: currentPage + 1 });
  }, [currentPage, hasMorePages, isLoadingMore]);

  const displayTotal = useMemo(() => {
    return Number(total);
  }, [total]);

  if (isLoading && currentPage === 1 && paymentsList.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
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
            Payments
          </Text>
          <View className="flex-row space-x-3">
            <Pressable
              onPress={() => router.push('/payments/add')}
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
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        {isLoading && currentPage === 1 && paymentsList.length > 0 && (
          <View className="py-4">
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}

        <View className="my-6 rounded-xl p-4" style={{ backgroundColor: COLORS.primary + '15' }}>
          <Text className="text-sm font-medium" style={{ color: COLORS.gray[600] }}>
            {currentFilter === 'all'
              ? 'Total'
              : currentFilter === 'today'
                ? "Today's Total"
                : currentFilter === 'week'
                  ? "This Week's Total"
                  : "This Month's Total"}
          </Text>
          <Text className="mt-2 text-3xl font-bold" style={{ color: COLORS.primary }}>
            ₹ {Number(displayTotal).toFixed(2)}
          </Text>
        </View>

        {paymentsList.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(`/payments/${item.id}/edit`)}
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
                    name={item.source.icon}
                    size={16}
                    color={COLORS.gray[500]}
                  />
                  <Text className="ml-2 text-sm" style={{ color: COLORS.gray[500] }}>
                    {item.source.name}
                  </Text>
                </View>
                <Text className="mt-1 text-xs" style={{ color: COLORS.gray[400] }}>
                  {format(item.date, 'MMMM dd, yyyy')}
                </Text>
              </View>
              <View className="rounded-full p-2" style={{ backgroundColor: COLORS.gray[100] }}>
                <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray[500]} />
              </View>
            </View>
          </Pressable>
        ))}

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
            Filter Payments
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
