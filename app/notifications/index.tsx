import { View, Text, FlatList, Pressable, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRef, useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

// Updated mock data
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'New Payment Received',
    message: 'You received a payment of ¥5000',
    timestamp: '2024-03-20T10:00:00Z',
    read: false,
  },
  {
    id: '2',
    title: 'Work Entry Approved',
    message: 'Your work entry for March 19 has been approved',
    timestamp: '2024-03-19T15:30:00Z',
    read: true,
  },
  {
    id: '3',
    title: 'Work Entry Approved',
    message: 'Your work entry for March 19 has been approved',
    timestamp: '2024-03-19T15:30:00Z',
    read: true,
  },
  {
    id: '4',
    title: 'Work Entry Approved',
    message: 'Your work entry for March 19 has been approved',
    timestamp: '2024-03-19T15:30:00Z',
    read: true,
  },
  {
    id: '5',
    title: 'Work Entry Approved',
    message: 'Your work entry for March 19 has been approved',
    timestamp: '2024-03-19T15:30:00Z',
    read: true,
  },
  {
    id: '6',
    title: 'Work Entry Approved',
    message: 'Your work entry for March 19 has been approved',
    timestamp: '2024-03-19T15:30:00Z',
    read: true,
  },
  {
    id: '7',
    title: 'Work Entry Approved',
    message: 'Your work entry for March 19 has been approved',
    timestamp: '2024-03-19T15:30:00Z',
    read: true,
  },
  {
    id: '8',
    title: 'Work Entry Approved',
    message: 'Your work entry for March 19 has been approved',
    timestamp: '2024-03-19T15:30:00Z',
    read: true,
  },
  {
    id: '9',
    title: 'Work Entry Approved',
    message: 'Your work entry for March 19 has been approved',
    timestamp: '2024-03-19T15:30:00Z',
    read: true,
  },
  {
    id: '10',
    title: 'Work Entry Approved',
    message: 'Your work entry for March 19 has been approved',
    timestamp: '2024-03-19T15:30:00Z',
    read: true,
  },
];

// Add these types for better type safety
type SwipeableMethods = {
  close: () => void;
  openLeft: () => void;
  openRight: () => void;
  reset: () => void;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const rowRefs = useRef<Map<string, SwipeableMethods>>(new Map());
  const [itemBeingDeleted, setItemBeingDeleted] = useState<string | null>(null);

  // Initialize animation maps with default values for all notifications
  const fadeAnims = useRef<Map<string, Animated.Value>>(
    new Map(MOCK_NOTIFICATIONS.map((n) => [n.id, new Animated.Value(0)]))
  );
  const slideAnims = useRef<Map<string, Animated.Value>>(
    new Map(MOCK_NOTIFICATIONS.map((n) => [n.id, new Animated.Value(50)]))
  );

  // Initialize animations for items
  useEffect(() => {
    // Create animations array to run in sequence
    const animations = notifications.map((notification, index) => {
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

    // Start all animations
    Animated.parallel(animations).start();

    // Cleanup function
    return () => {
      fadeAnims.current.clear();
      slideAnims.current.clear();
    };
  }, []);

  const deleteNotification = (id: string) => {
    const fadeAnim = fadeAnims.current.get(id);
    const slideAnim = slideAnims.current.get(id);

    if (!fadeAnim || !slideAnim) return;

    setItemBeingDeleted(id);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }),
    ]).start(() => {
      setNotifications((current) => current.filter((n) => n.id !== id));
      setItemBeingDeleted(null);
      // Clean up animations for deleted item
      fadeAnims.current.delete(id);
      slideAnims.current.delete(id);
    });
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
            onPress={() => deleteNotification(item.id)}
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
              deleteNotification(item.id);
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
                  backgroundColor: item.read ? COLORS.gray[200] : COLORS.primary,
                }}
              />

              <View className="p-4">
                {/* Header Row */}
                <View className="mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className="mr-3 rounded-full p-2"
                      style={{
                        backgroundColor: item.read ? COLORS.gray[50] : COLORS.blue[50],
                      }}>
                      <Ionicons
                        name={item.read ? 'checkmark-circle' : 'notifications'}
                        size={20}
                        color={item.read ? COLORS.gray[400] : COLORS.primary}
                      />
                    </View>
                    <Text
                      className="text-base font-semibold"
                      style={{ color: COLORS.gray[900] }}
                      numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                  {!item.read && (
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
                  {item.message}
                </Text>

                {/* Footer */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                    {new Date(item.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>

                  {item.read && (
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
    </View>
  );
}
