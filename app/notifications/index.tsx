import { View, Text, FlatList, Pressable, Animated, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRef, useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useNotificationOperations } from '../../hooks/useNotificationOperations';
import type { Notification } from '../../services/notificationService';

// Add these types for better type safety
type SwipeableMethods = {
  close: () => void;
  openLeft: () => void;
  openRight: () => void;
  reset: () => void;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const rowRefs = useRef<Map<string, SwipeableMethods>>(new Map());
  const [itemBeingDeleted, setItemBeingDeleted] = useState<string | null>(null);
  const { getNotifications, deleteNotification, markAsRead, isLoading } =
    useNotificationOperations();

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

  const handleDeleteNotification = async (id: string) => {
    const success = await deleteNotification(id);
    if (success) {
      setNotifications((current) => current.filter((n) => n.id !== id));
      setItemBeingDeleted(null);
      // Clean up animations for deleted item
      fadeAnims.current.delete(id);
      slideAnims.current.delete(id);
    }
  };

  const renderNotification = ({
    item,
    index,
  }: {
    item: (typeof notifications)[0];
    index: number;
  }) => {
    const fadeAnim = fadeAnims.current.get(item.id) || new Animated.Value(0);
    const slideAnim = slideAnims.current.get(item.id) || new Animated.Value(50);

    const renderLeftActions = (progress: SharedValue<number>, dragX: SharedValue<number>) => {
      const styleAnimation = useAnimatedStyle(() => ({
        transform: [{ translateX: dragX.value }],
      }));

      return (
        <Reanimated.View
          style={[
            {
              flex: 1,
              width: 80, // Fixed width for delete button
            },
            styleAnimation,
          ]}>
          <Pressable
            onPress={() => handleDeleteNotification(item.id)}
            className="h-full w-full items-center justify-center bg-red-500">
            <View className="items-center">
              <Ionicons name="trash-outline" size={24} color="white" />
              <Text className="mt-1 text-xs text-white">Delete</Text>
            </View>
          </Pressable>
        </Reanimated.View>
      );
    };

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            { translateX: slideAnim },
            { translateX: itemBeingDeleted === item.id ? -100 : 0 },
          ],
          height: itemBeingDeleted === item.id ? 0 : 'auto',
          marginBottom: itemBeingDeleted === item.id ? 0 : 12,
        }}>
        <GestureHandlerRootView>
          <ReanimatedSwipeable
            ref={(ref) => {
              if (ref) {
                rowRefs.current.set(item.id, ref);
              }
            }}
            renderLeftActions={renderLeftActions}
            leftThreshold={40}
            friction={2}
            overshootFriction={8}
            overshootLeft={false}
            enableTrackpadTwoFingerGesture
            containerStyle={{ borderRadius: 16 }}
            onSwipeableOpen={() => {
              handleDeleteNotification(item.id);
            }}
            onSwipeableWillOpen={() => {
              // Close other open swipeables
              [...rowRefs.current.entries()].forEach(([key, ref]) => {
                if (key !== item.id) {
                  ref.close();
                }
              });
            }}>
            <Pressable
              className="overflow-hidden rounded-2xl bg-white"
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
                  backgroundColor: item.read_at ? COLORS.gray[200] : COLORS.primary,
                }}
              />

              <View className="p-4">
                {/* Header Row */}
                <View className="mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className="mr-3 rounded-full p-2"
                      style={{
                        backgroundColor: item.read_at ? COLORS.gray[50] : COLORS.blue[50],
                      }}>
                      <Ionicons
                        name={item.read_at ? 'checkmark-circle' : 'notifications'}
                        size={20}
                        color={item.read_at ? COLORS.gray[400] : COLORS.primary}
                      />
                    </View>
                    <Text
                      className="text-base font-semibold"
                      style={{ color: COLORS.gray[900] }}
                      numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                  {!item.read_at && (
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

                  {item.read_at && (
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={14} color={COLORS.gray[400]} />
                      <Text className="ml-1 text-xs" style={{ color: COLORS.gray[400] }}>
                        Read
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          </ReanimatedSwipeable>
        </GestureHandlerRootView>
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
