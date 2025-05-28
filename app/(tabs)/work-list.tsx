import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { COLORS, SPACING, SIZES, FONTS } from '../../constants/theme';
// import { SPACING } from '../../constants/spacing'; // Ensure this is commented out or removed if module doesn't exist
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
import { BannerAdComponent, NativeAdComponent } from '../../components/ads';
import { BannerAdSize } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREFERENCE_KEYS } from '../account/list-preferences';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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

  // State for sorting preferences
  const [sortField, setSortField] = useState('date'); // Default sort field
  const [sortDirection, setSortDirection] = useState('desc'); // Default sort direction

  // State for bulk operations
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedWorkIds, setSelectedWorkIds] = useState<string[]>([]); // Assuming IDs are strings, adjust if numbers

  // Use the modern API hook pattern
  const { execute: executeGetWorks, isLoading: apiIsLoading } = useApi({
    showErrorToast: true,
    defaultErrorMessage: t('failedToLoadWorkEntries')
  });

  const loadWork = useCallback(async ({ page = 1, isRefresh = false, sortBy = sortField, sortDir = sortDirection }) => {
    try {
      const response = await executeGetWorks(() =>
        api.get('/works', { page, filter: currentFilter, sortBy, sortDir })
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
  }, [currentFilter, executeGetWorks, sortField, sortDirection]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWork({ page: 1, isRefresh: true, sortBy: sortField, sortDir: sortDirection });
  }, [loadWork, sortField, sortDirection]);

  const handleFilter = useCallback((filter: string) => {
    setCurrentFilter(filter);
    setWorkList([]);
    setCurrentPage(1);
    actionSheetRef.current?.hide();
    loadWork({ page: 1, sortBy: sortField, sortDir: sortDirection });
  }, [loadWork, sortField, sortDirection]);

  useFocusEffect(
    useCallback(() => {
      const loadPreferencesAndFetchData = async () => {
        let prefSortField = 'date';
        let prefSortDirection = 'desc';
        try {
          const storedSortField = await AsyncStorage.getItem(PREFERENCE_KEYS.WORK_SORT_FIELD);
          const storedSortDirection = await AsyncStorage.getItem(PREFERENCE_KEYS.WORK_SORT_DIRECTION);
          if (storedSortField) prefSortField = storedSortField;
          if (storedSortDirection) prefSortDirection = storedSortDirection;
        } catch (e) {
          console.error('Failed to load work list sort preferences', e);
        }
        setSortField(prefSortField);
        setSortDirection(prefSortDirection);
        loadWork({ page: 1, sortBy: prefSortField, sortDir: prefSortDirection });
      };

      loadPreferencesAndFetchData();
      refreshUnreadCount();
    }, [currentFilter])
  );

  const handleLoadMore = useCallback(async () => {
    if (!hasMorePages || isLoadingMore) return;

    analyticsService.logEvent('load_more_work_entries', { page: currentPage + 1 });
    setIsLoadingMore(true);
    await loadWork({ page: currentPage + 1, sortBy: sortField, sortDir: sortDirection });
  }, [currentPage, hasMorePages, isLoadingMore, loadWork, sortField, sortDirection]);

  const toggleWorkSelection = (workId: string) => {
    setSelectedWorkIds(prevSelected =>
      prevSelected.includes(workId)
        ? prevSelected.filter(id => id !== workId)
        : [...prevSelected, workId]
    );
  };

  const handleBulkDeleteWorkEntries = async () => {
    if (selectedWorkIds.length === 0) return;

    Alert.alert(
      t('confirmDelete'), // Existing translation
      t('confirmBulkDeleteMessage', { count: selectedWorkIds.length }), // New translation
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement API call to backend: api.delete('/works/bulk', { data: { ids: selectedWorkIds } });
              // For now, simulate deletion and update UI
              setWorkList(prevList => prevList.filter(work => !selectedWorkIds.includes(String(work.id))));
              showToast(t('itemsDeletedSuccess', { count: selectedWorkIds.length }), 'success'); // New translation
              setIsSelectionMode(false);
              setSelectedWorkIds([]);
            } catch (error) {
              console.error('Error bulk deleting work entries:', error);
              showToast(t('bulkDeleteFailed'), 'error'); // New translation
            }
          },
        },
      ]
    );
  };

  const generateWorkListCSV = () => {
    const header = [
      t('workName'),
      t('date'),
      t('itemDiamondWeight'),
      t('itemPrice'),
      t('itemTotalPrice')
    ].join(',');

    const rows = workList.flatMap(work => {
      if (work.work_items && work.work_items.length > 0) {
        return work.work_items.map(item => {
          const diamondWeight = parseFloat(item.diamond || '0');
          const pricePerDiamond = parseFloat(item.price || '0');
          const totalPrice = diamondWeight * pricePerDiamond;
          return [
            `"${work.name.replace(/"/g, '""')}"`, // Escape double quotes
            work.date,
            item.diamond || '0',
            item.price || '0',
            totalPrice.toFixed(2) // Calculate and format total price
          ].join(',');
        });
      }
      // For work entries with no items, create a row with empty item details
      return [`"${work.name.replace(/"/g, '""')}"`, work.date, '', '', ''].join(',');
    });

    return `${header}\n${rows.join('\n')}`;
  };

  const handleExportWorkListCSV = async () => {
    if (!workList || workList.length === 0) {
      showToast(t('noDataToExport'), 'info'); // Assuming 'noDataToExport' translation
      return;
    }
    try {
      const csvString = generateWorkListCSV();
      const filename = `work_list_export_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (!(await Sharing.isAvailableAsync())) {
        showToast(t('sharingNotAvailable'), 'error'); // Assuming 'sharingNotAvailable' translation
        return;
      }
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: t('exportWorkListCSVDialogTitle'), // Assuming translation
        UTI: 'public.comma-separated-values-text',
      });
    } catch (error) {
      console.error('Error exporting work list CSV:', error);
      showToast(t('exportFailed'), 'error'); // Assuming 'exportFailed' translation
    }
  };

  if (apiIsLoading && currentPage === 1 && workList.length === 0) {
    return (
      <View style={styles.screenContainer}>
        <View
          style={styles.headerContainer}>
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
              {isSelectionMode ? `${t('selected')}: ${selectedWorkIds.length}` : t('worklist')}
            </Text>
            <View className="flex-row space-x-1 items-center">
              {isSelectionMode ? (
                <>
                  <Pressable
                    onPress={handleBulkDeleteWorkEntries}
                    disabled={selectedWorkIds.length === 0}
                    className="rounded-full p-3"
                    style={{ backgroundColor: selectedWorkIds.length > 0 ? COLORS.error : COLORS.gray[300] }}>
                    <MaterialCommunityIcons name="delete-sweep-outline" size={22} color="white" />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setIsSelectionMode(false);
                      setSelectedWorkIds([]);
                    }}
                    className="rounded-full p-3"
                    style={{ backgroundColor: COLORS.gray[100] }}>
                    <MaterialCommunityIcons name="close" size={22} color={COLORS.gray[600]} />
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    onPress={() => router.push('/work/add')}
                    className="mr-1 rounded-full p-3"
                    style={{ backgroundColor: COLORS.primary }}>
                    <MaterialCommunityIcons name="plus" size={22} color="white" />
                  </Pressable>
                  <Pressable
                    onPress={handleExportWorkListCSV}
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
    <View style={styles.screenContainer}>
      <View
        style={styles.headerContainer}>
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
            {isSelectionMode ? `${t('selected')}: ${selectedWorkIds.length}` : t('worklist')}
          </Text>
          <View className="flex-row space-x-1 items-center">
            {isSelectionMode ? (
              <>
                <Pressable
                  onPress={handleBulkDeleteWorkEntries}
                  disabled={selectedWorkIds.length === 0}
                  className="rounded-full p-3"
                  style={{ backgroundColor: selectedWorkIds.length > 0 ? COLORS.error : COLORS.gray[300] }}>
                  <MaterialCommunityIcons name="delete-sweep-outline" size={22} color="white" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    setIsSelectionMode(false);
                    setSelectedWorkIds([]);
                  }}
                  className="rounded-full p-3"
                  style={{ backgroundColor: COLORS.gray[100] }}>
                  <MaterialCommunityIcons name="close" size={22} color={COLORS.gray[600]} />
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  onPress={() => router.push('/work/add')}
                  className="mr-1 rounded-full p-3"
                  style={{ backgroundColor: COLORS.primary }}>
                  <MaterialCommunityIcons name="plus" size={22} color="white" />
                </Pressable>
                <Pressable
                  onPress={handleExportWorkListCSV}
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
        style={styles.scrollViewStyle}
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
        <View className="my-6 rounded-xl p-4" style={{ backgroundColor: COLORS.primary + '15' }}>
          <Text className="text-sm font-medium" style={{ color: COLORS.gray[600] }}>
            {t('todayTotal')}
          </Text>
          <Text className="mt-2 text-3xl font-bold" style={{ color: COLORS.primary }}>
            ₹ {todayTotal.toFixed(2)}
          </Text>
        </View>

        <BannerAdComponent size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} containerStyle={{ marginTop: -10 }} />

        {workList.map((item: Work, index: number) => {
          const showNativeAd = index > 0 && index % 8 === 0;

          return (
            <React.Fragment key={item.id.toString()}>
              {showNativeAd && (
                <View className="my-2">
                  <NativeAdComponent adType="small" />
                </View>
              )}
              <Pressable
                onPress={async () => {
                  if (isSelectionMode) {
                    toggleWorkSelection(String(item.id));
                  } else {
                    router.push(`/work/${item.id}/edit`);
                  }
                }}
                style={[
                  isSelectionMode && selectedWorkIds.includes(String(item.id)) &&
                  { backgroundColor: COLORS.primary + '20' },
                  { borderRadius: 12 }
                ]}
              >
                <View className="flex-row items-center">
                  {isSelectionMode && (
                    <View className="p-3">
                      <MaterialCommunityIcons
                        name={selectedWorkIds.includes(String(item.id)) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                  )}
                  <View className={`flex-1 ${isSelectionMode ? 'pl-0' : ''}`}>
                    <WorkListItem item={item} />
                  </View>
                </View>
              </Pressable>
            </React.Fragment>
          );
        })}

        {isLoadingMore && (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}

        {!apiIsLoading && workList.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={48} color={COLORS.gray[400]} />
            <Text style={styles.emptyStateText}>
              {t('noWorkEntries')}
            </Text>
          </View>
        )}

        <View className="mb-2">
          <BannerAdComponent size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
        </View>
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
  scrollViewStyle: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateText: {
    marginTop: SPACING.md,
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
});
