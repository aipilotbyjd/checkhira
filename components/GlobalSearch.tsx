import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SIZES, SPACING } from '../constants/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { useApi } from '../hooks/useApi';
import { searchService } from '../services/searchService';
import { format } from 'date-fns';
import { useDebounce } from '../hooks/useDebounce';

type FilterOption = 'all' | 'today' | 'week' | 'month';
type SortOption = 'date' | 'amount' | 'from';
type SortDirection = 'asc' | 'desc';

interface SearchResult {
  id: string;
  type: 'payment' | 'work';
  from: string;
  name?: string;
  description: string;
  amount: number;
  date: string;
  source?: {
    id: number;
    name: string;
    icon: string;
  };
  created_at: string;
  updated_at: string;
}

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const SearchResultItem = memo(({
  item,
  index,
  router
}: {
  item: SearchResult;
  index: number;
  router: ReturnType<typeof useRouter>;
}) => {
  const itemAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(itemAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 25,
      friction: 7,
      delay: index * 70
    }).start();
  }, [index]);

  const animatedStyle = {
    opacity: itemAnimation,
    transform: [
      {
        translateY: itemAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [35, 0]
        })
      }
    ]
  };

  const getIconName = (): IconName => {
    if (item.type === 'payment') {
      return (item.source?.icon as IconName) || 'cash';
    }
    return 'bank-transfer';
  };

  return (
    <Animated.View style={[animatedStyle]} className="mb-2.5 mx-4">
      <Pressable
        onPress={() => router.push({
          pathname: item.type === 'payment' ? '/payments/[id]/edit' : '/work/[id]/edit',
          params: { id: item.id }
        })}
        className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.98 : 1 }]
        })}
      >
        <View className="flex-row items-center space-x-4">
          <View className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center">
            <MaterialCommunityIcons
              name={getIconName()}
              size={24}
              className="text-gray-700"
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                {item.from}
              </Text>
              <View className="flex-row items-center bg-green-50 px-2.5 py-1 rounded-full">
                <MaterialCommunityIcons
                  name="check-circle"
                  size={14}
                  className="text-green-600 mr-1"
                />
                <Text className="text-xs font-medium text-green-700">
                  Completed
                </Text>
              </View>
            </View>
            <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
              {item.description}
            </Text>
            <View className="flex-row items-center justify-between mt-3">
              <View className="flex-row items-center space-x-3">
                <View className="px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                  <Text className="text-sm font-semibold text-gray-900">
                    ₹ {item.amount.toLocaleString()}
                  </Text>
                </View>
                <Text className="text-sm text-gray-500">
                  {format(new Date(item.date), 'dd MMM, yyyy')}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                className="text-gray-400"
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const FilterChip = memo(({
  label,
  isSelected,
  onPress
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 mr-2 rounded-full border ${isSelected ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'
      }`}
  >
    <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'
      }`}>
      {label}
    </Text>
  </TouchableOpacity>
));

const FilterOption = memo(({
  option,
  isSelected,
  onPress,
  label
}: {
  option: string;
  isSelected: boolean;
  onPress: () => void;
  label?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2.5 mr-2 rounded-full border ${isSelected ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'
      }`}
  >
    <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'
      }`}>
      {label || option}
    </Text>
  </TouchableOpacity>
));

export default function GlobalSearch() {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [previousQuery, setPreviousQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 600);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<FilterOption>('all');
  const [selectedSortBy, setSelectedSortBy] = useState<SortOption>('date');
  const [selectedDirection, setSelectedDirection] = useState<SortDirection>('desc');
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<TextInput>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSearchType, setSelectedSearchType] = useState<'all' | 'payments' | 'works'>('payments');

  const { execute: executeSearch } = useApi({
    showErrorToast: true,
    defaultErrorMessage: t('searchFailed')
  });

  const currentFilters = useCallback(() => ({
    filter: selectedTimeRange,
    sortBy: selectedSortBy,
    sortDirection: selectedDirection
  }), [selectedTimeRange, selectedSortBy, selectedDirection]);

  const performSearch = useCallback(async (page = 1, newSearch = false) => {
    try {
      setError(null);
      if (newSearch) {
        setResults([]);
        setCurrentPage(1);
        page = 1;
      }

      setLoading(page === 1);
      setIsLoadingMore(page > 1);

      const filters = currentFilters();
      const query = debouncedQuery.trim();
      if (query.length < 1) {
        setResults([]);
        setError(null);
        return;
      }

      if (selectedSearchType === 'payments') {
        const response = await executeSearch(() =>
          searchService.searchPayments(
            query,
            page,
            filters.filter,
            filters.sortBy,
            filters.sortDirection
          )
        );
        if (response?.data) {
          const { payments, pagination } = response.data;
          const items = payments.map(payment => ({
            ...payment,
            from: payment.from || payment.name || 'Unknown',
            amount: typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount || 0,
            type: 'payment' as const
          }));
          setResults(prev => newSearch ? items : [...prev, ...items]);
          setCurrentPage(pagination.current_page);
          setHasMorePages(pagination.has_more_pages);
        }
      } else {
        const response = await executeSearch(() => searchService.searchAll(query, page));
        if (response?.data) {
          const { payments, works, pagination } = response.data;
          const workItems = works.map(work => ({
            ...work,
            from: work.from || work.name || 'Unknown',
            amount: typeof work.amount === 'string' ? parseFloat(work.amount) : work.amount || 0,
            type: 'work' as const
          }));
          const paymentItems = payments.map(payment => ({
            ...payment,
            from: payment.from || payment.name || 'Unknown',
            amount: typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount || 0,
            type: 'payment' as const
          }));
          let items;
          if (selectedSearchType === 'works') {
            items = workItems;
          } else if (selectedSearchType === 'all') {
            items = [...paymentItems, ...workItems];
          } else {
            items = paymentItems;
          }
          setResults(prev => newSearch ? items : [...prev, ...items]);
          setCurrentPage(pagination.current_page);
          setHasMorePages(pagination.has_more_pages);
        }
      }
    } catch (err: any) {
      if (err?.response?.data?.errors?.query) {
        setError(t('globalSearchMinLength'));
      } else {
        setError(t('searchError'));
      }
      console.error('Search error:', err);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      setIsTyping(false);
    }
  }, [debouncedQuery, executeSearch, t, currentFilters, selectedSearchType]);

  useEffect(() => {
    if (!searchQuery) {
      setResults([]);
      setError(null);
      setCurrentPage(1);
      setHasMorePages(true);
      setPreviousQuery('');
    }
  }, [searchQuery]);

  useEffect(() => {
    const query = debouncedQuery.trim();
    if (query.length < 1) {
      setResults([]);
      setError(null);
      return;
    }
    performSearch(1, true);
    setPreviousQuery(query);
  }, [debouncedQuery, selectedSearchType, selectedTimeRange, selectedSortBy, selectedDirection, performSearch]);

  const handleSearchInputChange = useCallback((text: string) => {
    setIsTyping(true);
    setSearchQuery(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setResults([]);
    setError(null);
    setCurrentPage(1);
    setHasMorePages(true);
    searchInputRef.current?.focus();
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedTimeRange('all');
    setSelectedSortBy('date');
    setSelectedDirection('desc');
    setShowFilters(false);
    performSearch(1, true);
  }, [performSearch]);

  const handleApplyFilters = useCallback(() => {
    setShowFilters(false);
    performSearch(1, true);
  }, [performSearch]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMorePages && !loading) {
      performSearch(currentPage + 1);
    }
  }, [isLoadingMore, hasMorePages, loading, currentPage, performSearch]);

  const timeRangeOptions = [
    { value: 'all' as const, label: 'All Time' },
    { value: 'today' as const, label: 'Today' },
    { value: 'week' as const, label: 'This Week' },
    { value: 'month' as const, label: 'This Month' }
  ];

  const sortByOptions = [
    { value: 'date' as const, label: 'Date' },
    { value: 'amount' as const, label: 'Amount' },
    { value: 'from' as const, label: 'From' }
  ];

  const sortDirectionOptions = [
    { value: 'desc' as const, label: 'Newest First' },
    { value: 'asc' as const, label: 'Oldest First' }
  ];

  const renderSearchBar = useCallback(() => (
    <View className="flex-row items-center space-x-3">
      <View className="flex-1 flex-row items-center px-4 mr-2 py-2 bg-gray-100 rounded-2xl">
        {isTyping ? (
          <ActivityIndicator size="small" color="#111827" className="mr-3" />
        ) : (
          <MaterialCommunityIcons name="magnify" size={24} className="text-gray-500 mr-3" />
        )}
        <TextInput
          ref={searchInputRef}
          className="flex-1 text-base text-gray-900"
          placeholder="Search payments, works..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearchInputChange}
          clearButtonMode="while-editing"
          returnKeyType="search"
          onSubmitEditing={() => {
            setIsTyping(false);
            performSearch(1, true);
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            className="p-1.5 bg-gray-200 rounded-full"
          >
            <MaterialCommunityIcons name="close" size={16} className="text-gray-600" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        onPress={() => setShowFilters(true)}
        className="p-3 bg-gray-100 rounded-xl"
      >
        <MaterialCommunityIcons name="tune-vertical" size={24} className="text-gray-700" />
      </TouchableOpacity>
    </View>
  ), [searchQuery, isTyping, handleSearchInputChange, handleClearSearch]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <View className="bg-white">
        <View className="px-4 pt-6 pb-4">
          <Text className="text-3xl font-bold text-gray-900 mb-1">Search</Text>
          <Text className="text-base text-gray-500">Find your payments and transactions</Text>
        </View>

        <View className="px-4 pb-4">
          {renderSearchBar()}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerClassName="space-x-6"
          >
            <FilterChip
              label={selectedTimeRange === 'all' ? 'All Time' : selectedTimeRange}
              isSelected={selectedTimeRange !== 'all'}
              onPress={() => setShowFilters(true)}
            />
            <FilterChip
              label={`Sort: ${selectedSortBy}`}
              isSelected={selectedSortBy !== 'date'}
              onPress={() => setShowFilters(true)}
            />
            <FilterChip
              label={selectedDirection === 'desc' ? 'Newest First' : 'Oldest First'}
              isSelected={selectedDirection !== 'desc'}
              onPress={() => setShowFilters(true)}
            />
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerClassName="space-x-2">
            <FilterOption option="all" label="All" isSelected={selectedSearchType === 'all'} onPress={() => setSelectedSearchType('all')} />
            <FilterOption option="payments" label="Payments" isSelected={selectedSearchType === 'payments'} onPress={() => setSelectedSearchType('payments')} />
            <FilterOption option="works" label="Works" isSelected={selectedSearchType === 'works'} onPress={() => setSelectedSearchType('works')} />
          </ScrollView>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#111827" />
          <Text className="mt-4 text-base font-medium text-gray-600">
            Searching...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
            <MaterialCommunityIcons name="alert" size={32} className="text-red-500" />
          </View>
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            {error}
          </Text>
          <TouchableOpacity
            className="mt-4 px-6 py-3 bg-gray-900 rounded-full"
            onPress={() => performSearch(1, true)}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : results.length > 0 ? (
        <View className="flex-1">
          <View className="px-4 py-3 bg-white border-t border-gray-100">
            <Text className="text-sm font-medium text-gray-500">
              Found {results.length} {results.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </Text>
          </View>
          <FlatList
            data={results}
            renderItem={({ item, index }) => (
              <SearchResultItem item={item} index={index} router={router} />
            )}
            keyExtractor={(item) => item.id.toString()}
            className="flex-1 pt-3"
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? (
                <View className="py-6 flex-row justify-center items-center space-x-2">
                  <ActivityIndicator size="small" color="#111827" />
                  <Text className="text-gray-600 font-medium">
                    Loading more results...
                  </Text>
                </View>
              ) : hasMorePages ? (
                <View className="py-6 flex-row justify-center">
                  <TouchableOpacity
                    onPress={handleLoadMore}
                    className="flex-row items-center space-x-2 px-4 py-2 bg-gray-200 rounded-full"
                  >
                    <Text className="text-gray-700 font-medium">Load more</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
          />
        </View>
      ) : searchQuery.trim() ? (
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <MaterialCommunityIcons name="file-search-outline" size={32} className="text-gray-500" />
          </View>
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            No results found
          </Text>
          <Text className="text-base text-gray-500 text-center">
            Try adjusting your search terms
          </Text>
        </View>
      ) : (
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <MaterialCommunityIcons name="magnify" size={32} className="text-gray-500" />
          </View>
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            Start searching
          </Text>
          <Text className="text-base text-gray-500 text-center">
            Search for payments, works, or transactions
          </Text>
        </View>
      )}

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 bg-black/40">
          <Pressable className="flex-1" onPress={() => setShowFilters(false)} />
          <View className="bg-white rounded-t-3xl">
            <View className="flex-row justify-between items-center p-6 border-b border-gray-100">
              <Text className="text-2xl font-bold text-gray-900">Filters</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <MaterialCommunityIcons name="close" size={20} className="text-gray-600" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-[70%]">
              <View className="p-4 space-y-8">
                <View className="mb-4">
                  <Text className="text-lg font-bold text-gray-900 mb-2">Time Range</Text>
                  <View className="flex-row flex-wrap">
                    {timeRangeOptions.map(({ value, label }) => (
                      <FilterOption
                        key={value}
                        option={value}
                        label={label}
                        isSelected={selectedTimeRange === value}
                        onPress={() => setSelectedTimeRange(value as FilterOption)}
                      />
                    ))}
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-lg font-bold text-gray-900 mb-2">Sort By</Text>
                  <View className="flex-row flex-wrap">
                    {sortByOptions.map(({ value, label }) => (
                      <FilterOption
                        key={value}
                        option={value}
                        label={label}
                        isSelected={selectedSortBy === value}
                        onPress={() => setSelectedSortBy(value as SortOption)}
                      />
                    ))}
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-lg font-bold text-gray-900 mb-2">Sort Order</Text>
                  <View className="flex-row flex-wrap">
                    {sortDirectionOptions.map(({ value, label }) => (
                      <FilterOption
                        key={value}
                        option={value}
                        label={label}
                        isSelected={selectedDirection === value}
                        onPress={() => setSelectedDirection(value as SortDirection)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View className="p-6 border-t border-gray-100 space-y-3">
              <TouchableOpacity
                onPress={handleApplyFilters}
                className="w-full py-3.5 bg-gray-900 rounded-xl mb-3 items-center"
              >
                <Text className="text-white font-semibold text-base">Apply Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResetFilters}
                className="w-full py-3.5 bg-gray-100 rounded-xl items-center"
              >
                <Text className="text-gray-700 font-semibold text-base">Reset All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: SPACING.sm,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    height: 44,
  },
  clearSearchButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  filterButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '05',
  },
  resultsList: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  resultItemContainer: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: COLORS.gray[100],
  },
  resultItem: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultItemPressed: {
    backgroundColor: COLORS.gray[50],
  },
  resultItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resultItemIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  resultItemTextContainer: {
    flex: 1,
  },
  resultItemTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.semibold,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  resultItemDescription: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    marginBottom: 8,
    lineHeight: 20,
  },
  resultItemMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  resultItemAmountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.success + '20',
  },
  resultItemAmount: {
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    color: COLORS.success,
    marginLeft: 4,
  },
  resultItemDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resultItemDate: {
    fontSize: SIZES.caption,
    color: COLORS.gray[600],
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray[200],
  },
  modalTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  modalScrollContent: {
    padding: SPACING.lg,
  },
  filterSection: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  filterLabel: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.medium,
    color: COLORS.gray[700],
    marginBottom: SPACING.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200]
  },
  filterOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    color: COLORS.gray[700],
  },
  filterOptionTextSelected: {
    color: COLORS.white,
  },
  amountInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  amountInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    fontSize: SIZES.body,
    color: COLORS.secondary,
    backgroundColor: COLORS.background.secondary,
  },
  amountSeparator: {
    fontSize: SIZES.h2,
    color: COLORS.gray[500],
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    gap: SPACING.md,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: 12,
  },
  resetButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: SIZES.body,
    marginLeft: SPACING.xs,
  },
  applyButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: SIZES.body,
  },
  loadingIndicator: {
    marginRight: SPACING.md,
  },
  errorIconContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  noResultsIconContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  emptyStateIconContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    fontFamily: FONTS.medium,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  loadingMoreText: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    fontFamily: FONTS.medium,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.background.primary,
  },
  emptyStateText: {
    marginTop: SPACING.lg,
    fontSize: SIZES.h2,
    fontFamily: FONTS.semibold,
    color: COLORS.gray[700],
    textAlign: 'center',
  },
  emptyStateSubText: {
    marginTop: SPACING.sm,
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background.primary,
  },
  noResultsText: {
    marginTop: SPACING.md,
    fontSize: SIZES.h3,
    fontFamily: FONTS.medium,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  noResultsSubText: {
    marginTop: SPACING.sm,
    fontSize: SIZES.body,
    color: COLORS.gray[500],
    textAlign: 'center',
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.background.primary,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: SIZES.h3,
    fontFamily: FONTS.medium,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    marginLeft: SPACING.sm,
  },
}); 