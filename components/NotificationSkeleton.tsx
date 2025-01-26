import { View, Animated } from 'react-native';
import { COLORS } from '../constants/theme';
import { useEffect, useRef } from 'react';

export function NotificationSkeleton() {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        marginBottom: 12,
      }}>
      <View
        className="overflow-hidden rounded-2xl bg-white"
        style={{
          shadowColor: COLORS.gray[900],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}>
        {/* Status Bar */}
        <View className="h-1 w-full" style={{ backgroundColor: COLORS.gray[200] }} />

        <View className="p-4">
          {/* Header Row */}
          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className="mr-3 h-8 w-8 rounded-full"
                style={{ backgroundColor: COLORS.gray[200] }}
              />
              <View className="h-4 w-32 rounded" style={{ backgroundColor: COLORS.gray[200] }} />
            </View>
          </View>

          {/* Message */}
          <View className="mb-3 space-y-2">
            <View className="h-3 w-full rounded" style={{ backgroundColor: COLORS.gray[200] }} />
            <View className="h-3 w-3/4 rounded" style={{ backgroundColor: COLORS.gray[200] }} />
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-between">
            <View className="h-3 w-20 rounded" style={{ backgroundColor: COLORS.gray[200] }} />
            <View className="h-3 w-24 rounded" style={{ backgroundColor: COLORS.gray[200] }} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
