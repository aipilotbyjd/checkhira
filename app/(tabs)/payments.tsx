import { Text, View, Pressable, ScrollView, ActivityIndicator, RefreshControl, NativeScrollEvent, Alert, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, FONTS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import React, { useState, useRef, useCallback, useMemo } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREFERENCE_KEYS } from '../account/list-preferences';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import BulkEditPaymentMethodModal from "../../components/BulkEditPaymentMethodModal";

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

  // State for sorting preferences
  const [sortField, setSortField] = useState('date'); // Default sort field
  const [sortDirection, setSortDirection] = useState('desc'); // Default sort direction

  // State for bulk operations
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]); // Assuming IDs are strings

  // State for bulk edit modal
  const [isBulkEditModalVisible, setIsBulkEditModalVisible] = useState(false);

  // Use the modern API hook pattern
  const { execute: executeGetPayments, isLoading } = useApi({
    showErrorToast: true,
    defaultErrorMessage: t('failedToLoadPayments')
  });

  useFocusEffect(
    useCallback(() => {
      const loadPreferencesAndFetchData = async () => {
        let prefSortField = 'date';
        let prefSortDirection = 'desc';
        try {
          const storedSortField = await AsyncStorage.getItem(PREFERENCE_KEYS.PAYMENT_SORT_FIELD);
          const storedSortDirection = await AsyncStorage.getItem(PREFERENCE_KEYS.PAYMENT_SORT_DIRECTION);
          if (storedSortField) prefSortField = storedSortField;
          if (storedSortDirection) prefSortDirection = storedSortDirection;
        } catch (e) {
          console.error('Failed to load payment list sort preferences', e);
        }
        setSortField(prefSortField);
        setSortDirection(prefSortDirection);
        loadPayments({ page: 1, sortBy: prefSortField, sortDir: prefSortDirection });
      };

      loadPreferencesAndFetchData();
      refreshUnreadCount();
    }, [currentFilter])
  );

  const loadPayments = async ({ page = 1, sortBy = sortField, sortDir = sortDirection }: { page?: number, sortBy?: string, sortDir?: string }) => {
    try {
      if (page === 1) {
        setPaymentsList([]);
        setIsLoadingSub(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await executeGetPayments(() =>
        api.get<{ data: PaymentsResponse }>('/payments', { page, filter: currentFilter, sortBy, sortDir })
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

  const generatePaymentListCSV = () => {
    const header = [
      t('date'),
      t('from'),
      t('description'),
      t('amount'),
      t('paymentMethod')
    ].join(',');

    const rows = paymentsList.map(payment => {
      return [
        payment.date,
        `"${(payment.from || '').replace(/"/g, '""')}"`, // Safely handle undefined 'from' and escape double quotes
        `"${(payment.description || '').replace(/"/g, '""')}"`, // Escape double quotes for 'description'
        payment.amount,
        payment.source?.name || 'N/A' // Assuming payment.source.name holds the method
      ].join(',');
    });

    return `${header}\n${rows.join('\n')}`;
  };

  const handleExportPaymentListCSV = async () => {
    if (!paymentsList || paymentsList.length === 0) {
      showToast(t('noDataToExport'), 'info');
      return;
    }
    try {
      const csvString = generatePaymentListCSV();
      const filename = `payment_list_export_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (!(await Sharing.isAvailableAsync())) {
        showToast(t('sharingNotAvailable'), 'error');
        return;
      }
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: t('exportPaymentListCSVDialogTitle'), // Assuming translation
        UTI: 'public.comma-separated-values-text',
      });
    } catch (error) {
      console.error('Error exporting payment list CSV:', error);
      showToast(t('exportFailed'), 'error');
    }
  };

  const handleFilter = (filter: string) => {
    if (filter !== currentFilter) {
      setCurrentFilter(filter);
      setCurrentPage(1);
      setPaymentsList([]);
      loadPayments({ page: 1, sortBy: sortField, sortDir: sortDirection });
    }
    actionSheetRef.current?.hide();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadPayments({ page: 1, sortBy: sortField, sortDir: sortDirection });
  }, [currentFilter, sortField, sortDirection]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMorePages || isLoadingMore || isLoadingSub) return;

    console.log('Loading more payments...');
    analyticsService.logEvent('load_more_payments', { page: currentPage + 1 });
    await loadPayments({ page: currentPage + 1, sortBy: sortField, sortDir: sortDirection });
  }, [currentPage, hasMorePages, isLoadingMore, isLoadingSub, sortField, sortDirection]);

  const displayTotal = useMemo((): number => {
    return Number(total);
  }, [total]);

  const togglePaymentSelection = (paymentId: string) => {
    setSelectedPaymentIds(prevSelected =>
      prevSelected.includes(paymentId)
        ? prevSelected.filter(id => id !== paymentId)
        : [...prevSelected, paymentId]
    );
  };

  // Placeholder for bulk delete payments handler
  const handleBulkDeletePayments = async () => {
    if (selectedPaymentIds.length === 0) return;

    Alert.alert(
      t('confirmDelete'),
      t('confirmBulkDeleteMessage', { count: selectedPaymentIds.length }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement API call: api.delete('/payments/bulk', { data: { ids: selectedPaymentIds } });
              setPaymentsList(prevList => prevList.filter(payment => !selectedPaymentIds.includes(String(payment.id))));
              showToast(t('itemsDeletedSuccess', { count: selectedPaymentIds.length }), 'success');
              setIsSelectionMode(false);
              setSelectedPaymentIds([]);
            } catch (error) {
              console.error('Error bulk deleting payments:', error);
              showToast(t('bulkDeleteFailed'), 'error');
            }
          },
        },
      ]
    );
  };

  const handleBulkEditPaymentsPress = () => {
    // This will open the bulk edit modal
    if (selectedPaymentIds.length > 0) {
      console.log("Opening bulk edit modal for payments: ", selectedPaymentIds);
      setIsBulkEditModalVisible(true); // Open the modal
    } else {
      Alert.alert(t("noItemsSelectedErrorTitle"), t("noItemsSelectedErrorDesc"));
    }
  };

  const handleApplyBulkEdit = async (newPaymentMethod: string) => {
    console.log(
      `Applying bulk edit. New Payment Method: ${newPaymentMethod} to IDs: ${selectedPaymentIds.join(", ")}`
    );
    // TODO: Implement API call to bulk update payments
    // For now, simulate success and refresh/reset state
    try {
      // const response = await api.bulkUpdatePayments(selectedPaymentIds, { paymentMethod: newPaymentMethod });
      // if (response.success) {
      //   Alert.alert(t("bulkEditSuccessTitle"), t("bulkEditSuccessMessage", { count: selectedPaymentIds.length }));
      //   loadPayments({ page: 1 }); // Refresh from page 1
      //   setSelectedPaymentIds([]);
      //   setIsSelectionMode(false);
      // } else {
      //   Alert.alert(t("bulkEditErrorTitle"), t("bulkEditErrorMessage"));
      // }
      // Simulating success for now:
      Alert.alert("Success (Simulated)", `Payment method for ${selectedPaymentIds.length} item(s) would be changed to ${newPaymentMethod}.`);
      loadPayments({ page: 1 }); // Refresh from page 1
      setSelectedPaymentIds([]);
      setIsSelectionMode(false);
    } catch (err) {
      console.error("Failed to bulk edit payments (simulated):", err);
      Alert.alert("Error (Simulated)", "Failed to apply bulk edit (simulated).");
    }
    setIsBulkEditModalVisible(false); // Close modal
  };

  if (isLoading && currentPage === 1 && isLoadingSub && paymentsList.length === 0) { // Added paymentsList.length check
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
            {isSelectionMode ? `${t('selected')}: ${selectedPaymentIds.length}` : t('paymentsList')}
          </Text>
          <View className="flex-row space-x-1 items-center">
            {isSelectionMode ? (
              <>
                <Pressable
                  onPress={handleBulkEditPaymentsPress}
                  disabled={selectedPaymentIds.length === 0}
                  className="rounded-full p-3 mr-1"
                  style={{ backgroundColor: selectedPaymentIds.length > 0 ? COLORS.primary : COLORS.gray[300] }}>
                  <MaterialCommunityIcons name="pencil-outline" size={22} color="white" />
                </Pressable>
                <Pressable
                  onPress={handleBulkDeletePayments}
                  disabled={selectedPaymentIds.length === 0}
                  className="rounded-full p-3"
                  style={{ backgroundColor: selectedPaymentIds.length > 0 ? COLORS.error : COLORS.gray[300] }}>
                  <MaterialCommunityIcons name="delete-sweep-outline" size={22} color="white" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    setIsSelectionMode(false);
                    setSelectedPaymentIds([]);
                  }}
                  className="rounded-full p-3"
                  style={{ backgroundColor: COLORS.gray[100] }}>
                  <MaterialCommunityIcons name="close" size={22} color={COLORS.gray[600]} />
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  onPress={() => router.push('/payments/add')}
                  className="mr-1 rounded-full p-3"
                  style={{ backgroundColor: COLORS.primary }}>
                  <MaterialCommunityIcons name="plus" size={22} color="white" />
                </Pressable>
                <Pressable
                  onPress={handleExportPaymentListCSV}
                  className="mr-1 rounded-full p-3"
                  style={{ backgroundColor: COLORS.gray[100] }}>
                  <MaterialCommunityIcons name="download-outline" size={22} color={COLORS.gray[600]} />
                </Pressable>
                <Pressable
                  onPress={() => actionSheetRef.current?.show()}
                  className="mr-1 rounded-full p-3"
                  style={{ backgroundColor: COLORS.gray[100] }}>
                  <MaterialCommunityIcons
                    name="filter-variant"
                    size={22}
                    color={currentFilter === 'all' ? COLORS.gray[600] : COLORS.primary}
                  />
                </Pressable>
                <Pressable
                  onPress={() => setIsSelectionMode(true)}
                  className="rounded-full p-3"
                  style={{ backgroundColor: COLORS.gray[100] }}>
                  <MaterialCommunityIcons name="checkbox-multiple-marked-outline" size={22} color={COLORS.gray[600]} />
                </Pressable>
              </>
            )}
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
                      if (isSelectionMode) {
                        togglePaymentSelection(String(item.id));
                      } else {
                        router.push(`/payments/${item.id}/edit`);
                      }
                    }}
                    className="mb-4 rounded-xl p-4"
                    style={[
                      {
                        backgroundColor: COLORS.background.secondary,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                      },
                      isSelectionMode && selectedPaymentIds.includes(String(item.id)) &&
                      { backgroundColor: COLORS.primary + '20' } // Light primary background
                    ]}>
                    <View className="flex-row items-center">
                      {isSelectionMode && (
                        <View className="pr-3">
                          <MaterialCommunityIcons
                            name={selectedPaymentIds.includes(String(item.id)) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={24}
                            color={COLORS.primary}
                          />
                        </View>
                      )}
                      <View className="flex-1">
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
                              <View style={styles.highlightableTextContainer}>
                                <Text style={styles.itemTextLabel}>From: </Text>
                                <Text style={styles.itemTextValue}>{item.from}</Text>
                              </View>
                            )}
                          </View>
                          <View className="rounded-full p-2" style={{ backgroundColor: COLORS.gray[100] }}>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray[500]} />
                          </View>
                        </View>
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

      {/* Render Bulk Edit Modal */}
      <BulkEditPaymentMethodModal
        visible={isBulkEditModalVisible}
        onClose={() => setIsBulkEditModalVisible(false)}
        onApply={handleApplyBulkEdit}
      // paymentSources={paymentSources} // If you have dynamic payment sources, pass them here
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderColor: COLORS.gray[200],
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
    backgroundColor: COLORS.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleText: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerButtonBase: {
    borderRadius: 22,
    padding: SPACING.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  headerButtonSecondary: {
    backgroundColor: COLORS.gray[100],
  },
  headerButtonError: {
    backgroundColor: COLORS.error,
  },
  headerButtonClose: {
    backgroundColor: COLORS.gray[100],
  },
  headerButtonEnabled: {
    backgroundColor: COLORS.info,
  },
  headerButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  skeletonListContainer: {
    paddingHorizontal: SPACING.lg,
  },
  scrollViewStyle: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  totalSection: {
    marginVertical: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
  },
  totalLabelText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    color: COLORS.gray[600],
  },
  totalAmountText: {
    marginTop: SPACING.xs,
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  topBannerAd: {
    marginTop: -SPACING.sm,
    marginBottom: SPACING.sm,
  },
  nativeAdContainer: {
    marginVertical: SPACING.sm,
  },
  paymentItemPressable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  paymentItemSelected: {
    backgroundColor: COLORS.primary + '20',
  },
  paymentItemInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    padding: SPACING.md,
  },
  paymentListItemView: {
    flex: 1,
  },
  paymentListItemSelectedView: {
    flex: 1,
  },
  loadingMoreContainer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    minHeight: 200,
  },
  emptyStateText: {
    marginTop: SPACING.md,
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  bottomBannerAd: {
    marginBottom: SPACING.sm,
  },
  actionSheetContent: {
    padding: SPACING.lg,
  },
  actionSheetTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    marginBottom: SPACING.lg,
  },
  actionSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  actionSheetOptionText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
  },
  actionSheetOptionTextSelected: {
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  highlightableTextContainer: { // New style for container
    flexDirection: 'row',
    marginTop: 1,
  },
  itemTextLabel: { // New style for label like "From: "
    fontSize: SIZES.caption,
    color: COLORS.gray[400],
    fontFamily: FONTS.medium,
  },
  itemTextValue: {
    fontSize: SIZES.body,
    color: COLORS.secondary,
  },
});
