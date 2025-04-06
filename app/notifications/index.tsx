import {
  View,
  Text,
  FlatList,
  Pressable,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useNotificationOperations } from '../../hooks/useNotificationOperations';
import type { Notification } from '../../services/notificationService';
import { NotificationSkeleton } from '../../components/NotificationSkeleton';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../contexts/LanguageContext';

// Key prefix for storing local read status
const LOCAL_READ_STATUS_KEY = 'notification_read_status_';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [localReadStatus, setLocalReadStatus] = useState<Record<string, boolean>>({});
  const { markAsRead, getNotifications, isLoading, isLoadingMore, currentPage, hasMorePages } =
    useNotificationOperations();

  const { t } = useLanguage();

  // Initialize animation maps with default values for all notifications
  const fadeAnims = useRef<Map<string, Animated.Value>>(new Map());
  const slideAnims = useRef<Map<string, Animated.Value>>(new Map());

  // Load local read status from AsyncStorage
  const loadLocalReadStatus = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const localStatusKeys = keys.filter(key => key.startsWith(LOCAL_READ_STATUS_KEY));

      if (localStatusKeys.length > 0) {
        const values = await AsyncStorage.multiGet(localStatusKeys);
        const statusMap: Record<string, boolean> = {};

        values.forEach(([key, value]) => {
          const notificationId = key.replace(LOCAL_READ_STATUS_KEY, '');
          statusMap[notificationId] = value === 'true';
        });

        setLocalReadStatus(statusMap);
      }
    } catch (error) {
      console.error('Error loading local read status:', error);
    }
  };

  // Save read status to AsyncStorage for notifications with null receiver_id
  const saveLocalReadStatus = async (notificationId: string, isRead: boolean) => {
    try {
      await AsyncStorage.setItem(`${LOCAL_READ_STATUS_KEY}${notificationId}`, String(isRead));
      setLocalReadStatus(prev => ({
        ...prev,
        [notificationId]: isRead
      }));
    } catch (error) {
      console.error('Error saving local read status:', error);
    }
  };

  // Check if notification is read (either from API or local storage)
  const isNotificationRead = (notification: Notification) => {
    // If it has a local status, use that
    if (notification.receiver_id === null && localReadStatus[notification.id] !== undefined) {
      return localReadStatus[notification.id];
    }
    // Otherwise use the server status
    return notification.is_read === 'true';
  };

  useFocusEffect(
    useCallback(() => {
      loadLocalReadStatus().then(() => loadNotifications());
      return () => {
        // Clear animation maps on unmount
        fadeAnims.current.clear();
        slideAnims.current.clear();
      };
    }, [])
  );

  const loadNotifications = async (page: number = 1) => {
    const { notifications: newNotifications } = await getNotifications(page);

    if (page === 1) {
      setNotifications(newNotifications);
      initializeAnimations(newNotifications);
    } else {
      setNotifications((prev) => {
        const updatedNotifications = [...prev, ...newNotifications];
        initializeAnimations(newNotifications); // Only animate new notifications
        return updatedNotifications;
      });
    }
  };

  const initializeAnimations = (notifications: Notification[]) => {
    notifications.forEach((notification, index) => {
      // Create new animation values if they don't exist
      if (!fadeAnims.current.has(notification.id)) {
        fadeAnims.current.set(notification.id, new Animated.Value(0));
      }
      if (!slideAnims.current.has(notification.id)) {
        slideAnims.current.set(notification.id, new Animated.Value(50));
      }

      // Trigger animations with delay based on index
      const delay = index * 100;
      Animated.parallel([
        Animated.timing(fadeAnims.current.get(notification.id)!, {
          toValue: 1,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims.current.get(notification.id)!, {
          toValue: 0,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleLoadMore = async () => {
    if (!hasMorePages || isLoadingMore) return;
    await loadNotifications(currentPage + 1);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLocalReadStatus();
    await loadNotifications(1);
    setRefreshing(false);
  }, []);

  const handleToggleRead = async (notification: Notification) => {
    setIsUpdating(notification.id);

    // Check if notification has null receiver_id
    if (notification.receiver_id === null) {
      // Handle locally using AsyncStorage
      const newReadStatus = !isNotificationRead(notification);
      await saveLocalReadStatus(notification.id, newReadStatus);

      // Update UI
      setNotifications((current) =>
        current.map((n) => (n.id === notification.id ? { ...n } : n))
      );
      setIsUpdating(null);
      return;
    }

    // Otherwise use the backend API
    const currentReadStatus = notification.is_read === 'true';
    const success = await markAsRead(notification.id, !currentReadStatus ? 'true' : 'false');
    if (success) {
      setNotifications((current) =>
        current.map((n) => (n.id === notification.id ? { ...n, is_read: !currentReadStatus ? 'true' : 'false' } : n))
      );
    }
    setIsUpdating(null);
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const fadeAnim = fadeAnims.current.get(item.id) || new Animated.Value(0);
    const slideAnim = slideAnims.current.get(item.id) || new Animated.Value(50);
    const isRead = isNotificationRead(item);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
          marginBottom: 12,
        }}>
        <Pressable
          className="overflow-hidden rounded-2xl bg-white"
          onPress={() => handleToggleRead(item)}
          style={{
            shadowColor: COLORS.gray[900],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}>
          {/* Status Bar */}
          <View
            className="h-1 w-full"
            style={{
              backgroundColor: isRead ? COLORS.gray[200] : COLORS.primary,
            }}
          />

          <View className="p-4">
            {/* Header Row */}
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className="mr-3 rounded-full p-2"
                  style={{
                    backgroundColor: isRead ? COLORS.gray[50] : COLORS.blue[50],
                  }}>
                  <Ionicons
                    name={isRead ? 'checkmark-circle' : 'notifications'}
                    size={20}
                    color={isRead ? COLORS.gray[400] : COLORS.primary}
                  />
                </View>
                <Text
                  className="text-base font-semibold"
                  style={{ color: COLORS.gray[900] }}
                  numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
              {!isRead && (
                <View
                  className="ml-2 rounded-full px-2 py-1"
                  style={{ backgroundColor: COLORS.blue[50] }}>
                  <Text className="text-xs font-medium" style={{ color: COLORS.primary }}>
                    {t('New')}
                  </Text>
                </View>
              )}
            </View>

            {/* Message */}
            <Text
              className="mb-3 text-[15px] leading-5"
              style={{ color: COLORS.gray[600] }}
              numberOfLines={2}>
              {item.description}
            </Text>

            {/* Footer */}
            <View className="flex-row items-center justify-between">
              <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                {new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>

              {isUpdating === item.id ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons
                    name={isRead ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={14}
                    color={isRead ? COLORS.success : COLORS.gray[400]}
                  />
                  <Text
                    className="ml-1 text-xs"
                    style={{ color: isRead ? COLORS.success : COLORS.gray[400] }}>
                    {isRead ? 'Mark as unread' : 'Mark as read'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.gray[50] }}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: 'bold',
          },
        }}
      />

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        className="px-2 pt-2"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-4">
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 px-1">
              {[...Array(8)].map((_, index) => (
                <NotificationSkeleton key={index} />
              ))}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center pt-20">
              <Ionicons name="notifications-off-outline" size={48} color={COLORS.gray[300]} />
              <Text className="mt-4 text-base" style={{ color: COLORS.gray[500] }}>
                No notifications yet
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
