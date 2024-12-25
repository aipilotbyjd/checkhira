import { View, Text, FlatList, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

// Mock data - replace with real notifications data
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
];

export default function NotificationsScreen() {
  const renderNotification = ({ item }: { item: (typeof MOCK_NOTIFICATIONS)[0] }) => (
    <Pressable
      className="mb-3 flex-row items-start space-x-4 rounded-3xl px-4 py-5"
      style={{
        backgroundColor: item.read ? COLORS.white : COLORS.blue[50],
        borderLeftWidth: !item.read ? 4 : 1,
        borderWidth: 1,
        borderLeftColor: COLORS.primary,
        borderColor: COLORS.gray[200],
        shadowColor: COLORS.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}>
      {/* Icon Container */}
      <View
        className="items-center justify-center rounded-2xl p-3.5"
        style={{
          backgroundColor: item.read ? COLORS.gray[100] : COLORS.blue[100],
        }}>
        <Ionicons
          name={item.read ? 'notifications-outline' : 'notifications'}
          size={22}
          color={item.read ? COLORS.gray[600] : COLORS.primary}
        />
      </View>

      {/* Content Container */}
      <View className="flex-1 pt-0.5">
        <View className="flex-row items-center justify-between">
          <Text
            className="mb-1 text-[15px] font-bold tracking-tight"
            style={{ color: COLORS.gray[800] }}>
            {item.title}
          </Text>
          {!item.read && (
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />
          )}
        </View>

        <Text className="mb-2 text-[13px] leading-[18px]" style={{ color: COLORS.gray[600] }}>
          {item.message}
        </Text>

        {/* Time and Status Row */}
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
            <View className="flex-row items-center space-x-1">
              <View
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: COLORS.gray[400] }}
              />
              <Text className="text-[11px]" style={{ color: COLORS.gray[400] }}>
                Read
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.gray[50] }}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerShadowVisible: false,
        }}
      />

      <FlatList
        data={MOCK_NOTIFICATIONS}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        className="px-4 pt-2"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-base" style={{ color: COLORS.gray[500] }}>
              No notifications yet
            </Text>
          </View>
        }
      />
    </View>
  );
}
