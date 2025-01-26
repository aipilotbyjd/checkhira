import { View, Text, FlatList, Pressable, Animated, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRef, useState, useEffect } from 'react';
import { useNotificationOperations } from '../../hooks/useNotificationOperations';
import type { Notification } from '../../services/notificationService';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { getNotifications, markAsRead, isLoading } = useNotificationOperations();

  // Initialize animation maps with default values for all notifications
  const fadeAnims = useRef<Map<string, Animated.Value>>(new Map());
  const slideAnims = useRef<Map<string, Animated.Value>>(new Map());

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await getNotifications();
    if (!data) return;
    setNotifications(data);

    // Initialize animations for new notifications
    if (Array.isArray(data)) {
      data.forEach((notification) => {
        if (!fadeAnims.current.has(notification.id)) {
          fadeAnims.current.set(notification.id, new Animated.Value(0));
          slideAnims.current.set(notification.id, new Animated.Value(50));
        }
      });

      // Start entrance animations
      const animations = data.map((notification, index) => {
        return Animated.sequence([
          Animated.delay(index * 50),
          Animated.parallel([
            Animated.spring(fadeAnims.current.get(notification.id) || new Animated.Value(0), {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }),
            Animated.spring(slideAnims.current.get(notification.id) || new Animated.Value(50), {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }),
          ]),
        ]);
      });

      Animated.parallel(animations).start();
    }
  };

  const handleToggleRead = async (notification: Notification) => {
    setIsUpdating(notification.id);
    const success = await markAsRead(notification.id, !notification.is_read);
    if (success) {
      setNotifications((current) =>
        current.map((n) => (n.id === notification.id ? { ...n, is_read: !n.is_read } : n))
      );
    }
    setIsUpdating(null);
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const fadeAnim = fadeAnims.current.get(item.id) || new Animated.Value(0);
    const slideAnim = slideAnims.current.get(item.id) || new Animated.Value(50);

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
              backgroundColor: item.is_read ? COLORS.gray[200] : COLORS.primary,
            }}
          />

          <View className="p-4">
            {/* Header Row */}
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className="mr-3 rounded-full p-2"
                  style={{
                    backgroundColor: item.is_read ? COLORS.gray[50] : COLORS.blue[50],
                  }}>
                  <Ionicons
                    name={item.is_read ? 'checkmark-circle' : 'notifications'}
                    size={20}
                    color={item.is_read ? COLORS.gray[400] : COLORS.primary}
                  />
                </View>
                <Text
                  className="text-base font-semibold"
                  style={{ color: COLORS.gray[900] }}
                  numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
              {!item.is_read && (
                <View
                  className="ml-2 rounded-full px-2 py-1"
                  style={{ backgroundColor: COLORS.blue[50] }}>
                  <Text className="text-xs font-medium" style={{ color: COLORS.primary }}>
                    New
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
                    name={item.is_read ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={14}
                    color={item.is_read ? COLORS.success : COLORS.gray[400]}
                  />
                  <Text
                    className="ml-1 text-xs"
                    style={{ color: item.is_read ? COLORS.success : COLORS.gray[400] }}>
                    {item.is_read ? 'Mark as unread' : 'Mark as read'}
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

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          className="px-4 pt-4"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Ionicons name="notifications-off-outline" size={48} color={COLORS.gray[300]} />
              <Text className="mt-4 text-base" style={{ color: COLORS.gray[500] }}>
                No notifications yet
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
